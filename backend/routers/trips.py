from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.trip import Trip, TripStatus
from models.vehicle import Vehicle, VehicleStatus
from models.driver import Driver
from models.user import UserRole
from schemas.trip import TripCreate, TripUpdate, TripResponse
from services.auth import get_current_user, require_role
from services.smart_assign import suggest_vehicles, suggest_drivers

router = APIRouter(prefix="/api/trips", tags=["Trips"])


def _generate_trip_id(db: Session) -> str:
    count = db.query(Trip).count()
    return f"TR-{str(count + 1001).zfill(4)}"


@router.get("/", response_model=list[TripResponse])
def list_trips(status: str = None, skip: int = 0, limit: int = 50, db: Session = Depends(get_db), _=Depends(get_current_user)):
    query = db.query(Trip)
    if status:
        query = query.filter(Trip.status == status)
    return query.order_by(Trip.id.desc()).offset(skip).limit(limit).all()


@router.get("/suggestions/vehicles")
def get_vehicle_suggestions(weight_lbs: float = 0, db: Session = Depends(get_db), _=Depends(get_current_user)):
    """Get smart vehicle suggestions based on cargo weight."""
    return suggest_vehicles(db, weight_lbs)


@router.get("/suggestions/drivers")
def get_driver_suggestions(db: Session = Depends(get_db), _=Depends(get_current_user)):
    """Get smart driver suggestions."""
    return suggest_drivers(db)


@router.post("/", response_model=TripResponse, status_code=201)
def create_trip(data: TripCreate, db: Session = Depends(get_db), _=Depends(require_role(UserRole.ADMIN, UserRole.MANAGER, UserRole.DISPATCHER))):
    driver_name = None
    vehicle_name = None

    if data.driver_id:
        driver = db.query(Driver).filter(Driver.id == data.driver_id).first()
        if driver:
            driver_name = driver.full_name

    if data.vehicle_id:
        vehicle = db.query(Vehicle).filter(Vehicle.id == data.vehicle_id).first()
        if vehicle:
            vehicle_name = f"{vehicle.name} {vehicle.vehicle_id}"
            vehicle.status = VehicleStatus.ON_TRIP
            db.add(vehicle)

    trip = Trip(
        trip_id=_generate_trip_id(db),
        origin=data.origin,
        destination=data.destination,
        cargo_description=data.cargo_description,
        weight_lbs=data.weight_lbs,
        driver_id=data.driver_id,
        driver_name=driver_name,
        vehicle_id=data.vehicle_id,
        vehicle_name=vehicle_name,
        priority=data.priority,
        departure_date=data.departure_date,
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip


@router.patch("/{trip_id}", response_model=TripResponse)
def update_trip(trip_id: int, data: TripUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # If marking as delivered, free up the vehicle
    if data.status == TripStatus.DELIVERED and trip.vehicle_id:
        vehicle = db.query(Vehicle).filter(Vehicle.id == trip.vehicle_id).first()
        if vehicle:
            vehicle.status = VehicleStatus.AVAILABLE
            db.add(vehicle)

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(trip, field, value)
    db.commit()
    db.refresh(trip)
    return trip
