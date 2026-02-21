from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.maintenance import MaintenanceRecord, ServiceStatus
from models.user import UserRole
from schemas.maintenance import MaintenanceCreate, MaintenanceUpdate, MaintenanceResponse
from services.auth import get_current_user, require_role
from services.predictive import get_fleet_maintenance_alerts

router = APIRouter(prefix="/api/maintenance", tags=["Maintenance"])


@router.get("/", response_model=list[MaintenanceResponse])
def list_records(status: str = None, skip: int = 0, limit: int = 50, db: Session = Depends(get_db), _=Depends(get_current_user)):
    query = db.query(MaintenanceRecord)
    if status:
        query = query.filter(MaintenanceRecord.status == status)
    return query.order_by(MaintenanceRecord.id.desc()).offset(skip).limit(limit).all()


@router.get("/in-shop")
def get_in_shop(db: Session = Depends(get_db), _=Depends(get_current_user)):
    """Get all vehicles currently in shop (In Progress status)."""
    return db.query(MaintenanceRecord).filter(MaintenanceRecord.status == ServiceStatus.IN_PROGRESS).all()


@router.get("/predictions")
def get_predictions(db: Session = Depends(get_db), _=Depends(get_current_user)):
    """Get AI-predicted maintenance alerts for the entire fleet."""
    return get_fleet_maintenance_alerts(db)


@router.get("/stats")
def maintenance_stats(db: Session = Depends(get_db), _=Depends(get_current_user)):
    from sqlalchemy import func
    total = db.query(MaintenanceRecord).count()
    in_progress = db.query(MaintenanceRecord).filter(MaintenanceRecord.status == ServiceStatus.IN_PROGRESS).count()
    completed = db.query(MaintenanceRecord).filter(MaintenanceRecord.status == ServiceStatus.COMPLETED).count()
    total_cost = db.query(func.sum(MaintenanceRecord.cost)).scalar() or 0
    return {"total": total, "in_progress": in_progress, "completed": completed, "total_cost": round(total_cost, 2)}


@router.post("/", response_model=MaintenanceResponse, status_code=201)
def create_record(data: MaintenanceCreate, db: Session = Depends(get_db), _=Depends(require_role(UserRole.ADMIN, UserRole.MANAGER))):
    record = MaintenanceRecord(**data.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.patch("/{record_id}", response_model=MaintenanceResponse)
def update_record(record_id: int, data: MaintenanceUpdate, db: Session = Depends(get_db), _=Depends(require_role(UserRole.ADMIN, UserRole.MANAGER))):
    record = db.query(MaintenanceRecord).filter(MaintenanceRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    return record
