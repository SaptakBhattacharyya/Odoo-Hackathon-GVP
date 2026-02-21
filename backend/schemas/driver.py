from pydantic import BaseModel
from typing import Optional
from models.driver import DriverStatus, LicenseStatus


class DriverCreate(BaseModel):
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    license_expiry: Optional[str] = None


class DriverUpdate(BaseModel):
    status: Optional[DriverStatus] = None
    safety_score: Optional[float] = None
    violations: Optional[int] = None
    license_status: Optional[LicenseStatus] = None
    license_expiry: Optional[str] = None
    assigned_vehicle_id: Optional[int] = None


class DriverResponse(BaseModel):
    id: int
    full_name: str
    email: Optional[str]
    phone: Optional[str]
    status: DriverStatus
    safety_score: float
    total_trips: int
    violations: int
    license_status: LicenseStatus
    license_expiry: Optional[str]
    assigned_vehicle_id: Optional[int]

    class Config:
        from_attributes = True
