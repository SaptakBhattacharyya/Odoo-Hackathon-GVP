from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from models.driver import Driver, DriverStatus
from models.user import UserRole
from schemas.driver import DriverCreate, DriverUpdate, DriverResponse
from services.auth import get_current_user, require_role

router = APIRouter(prefix="/api/drivers", tags=["Drivers"])


@router.get("/", response_model=list[DriverResponse])
def list_drivers(
    status: Optional[DriverStatus] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    query = db.query(Driver)
    if status:
        query = query.filter(Driver.status == status)
    return query.order_by(Driver.safety_score.desc()).offset(skip).limit(limit).all()


@router.get("/stats")
def driver_stats(db: Session = Depends(get_db), _=Depends(get_current_user)):
    total = db.query(Driver).count()
    active = db.query(Driver).filter(Driver.status == DriverStatus.ACTIVE).count()
    from models.driver import LicenseStatus
    expired = db.query(Driver).filter(Driver.license_status == LicenseStatus.EXPIRED).count()
    from sqlalchemy import func
    avg_score = db.query(func.avg(Driver.safety_score)).scalar() or 0
    return {"total": total, "active": active, "on_leave": total - active, "expired_licenses": expired, "avg_safety_score": round(avg_score, 1)}


@router.get("/{driver_id}", response_model=DriverResponse)
def get_driver(driver_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver


@router.post("/", response_model=DriverResponse, status_code=201)
def create_driver(data: DriverCreate, db: Session = Depends(get_db), _=Depends(require_role(UserRole.ADMIN, UserRole.MANAGER))):
    driver = Driver(**data.model_dump())
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver


@router.patch("/{driver_id}", response_model=DriverResponse)
def update_driver(driver_id: int, data: DriverUpdate, db: Session = Depends(get_db), _=Depends(require_role(UserRole.ADMIN, UserRole.MANAGER))):
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(driver, field, value)
    db.commit()
    db.refresh(driver)
    return driver


@router.delete("/{driver_id}", status_code=204)
def delete_driver(driver_id: int, db: Session = Depends(get_db), _=Depends(require_role(UserRole.ADMIN))):
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    db.delete(driver)
    db.commit()
