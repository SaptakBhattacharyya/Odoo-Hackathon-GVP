from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from database import get_db
from models.vehicle import Vehicle, VehicleStatus
from models.user import UserRole
from schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleResponse
from services.auth import get_current_user, require_role

router = APIRouter(prefix="/api/vehicles", tags=["Vehicles"])


def _generate_vehicle_id(db: Session) -> str:
    max_id = db.query(func.max(Vehicle.id)).scalar() or 0
    return f"VH-{str(max_id + 1).zfill(3)}"


@router.get("/", response_model=list[VehicleResponse])
def list_vehicles(
    status: Optional[VehicleStatus] = None,
    vehicle_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    """List all vehicles with optional filters."""
    query = db.query(Vehicle)
    if status:
        query = query.filter(Vehicle.status == status)
    if vehicle_type:
        query = query.filter(Vehicle.vehicle_type == vehicle_type)
    return query.offset(skip).limit(limit).all()


@router.get("/stats")
def vehicle_stats(db: Session = Depends(get_db), _=Depends(get_current_user)):
    """Get vehicle fleet statistics."""
    total = db.query(Vehicle).count()
    available = db.query(Vehicle).filter(Vehicle.status == VehicleStatus.AVAILABLE).count()
    on_trip = db.query(Vehicle).filter(Vehicle.status == VehicleStatus.ON_TRIP).count()
    in_shop = db.query(Vehicle).filter(Vehicle.status == VehicleStatus.IN_SHOP).count()
    return {"total": total, "available": available, "on_trip": on_trip, "in_shop": in_shop}


@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    """Get vehicle by ID."""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle


@router.post("/", response_model=VehicleResponse, status_code=201)
def create_vehicle(
    data: VehicleCreate,
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.ADMIN, UserRole.MANAGER)),
):
    """Create a new vehicle (Admin/Manager only)."""
    vehicle = Vehicle(
        vehicle_id=_generate_vehicle_id(db),
        name=data.name,
        vehicle_type=data.vehicle_type,
        license_plate=data.license_plate,
        max_capacity_lbs=data.max_capacity_lbs,
        volume_ft3=data.volume_ft3,
        cost_per_km=data.cost_per_km,
    )
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.patch("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(
    vehicle_id: int,
    data: VehicleUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.ADMIN, UserRole.MANAGER)),
):
    """Update vehicle (Admin/Manager only)."""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(vehicle, field, value)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.delete("/{vehicle_id}", status_code=204)
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.ADMIN)),
):
    """Delete vehicle (Admin only)."""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    db.delete(vehicle)
    db.commit()
