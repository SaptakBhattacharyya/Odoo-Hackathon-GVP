from pydantic import BaseModel
from typing import Optional
from models.vehicle import VehicleStatus, VehicleType


class VehicleCreate(BaseModel):
    name: str
    vehicle_type: VehicleType
    license_plate: str
    max_capacity_lbs: float = 0.0
    volume_ft3: float = 0.0
    cost_per_km: float = 0.0


class VehicleUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[VehicleStatus] = None
    fuel_level: Optional[float] = None
    mileage: Optional[float] = None
    assigned_driver_id: Optional[int] = None


class VehicleResponse(BaseModel):
    id: int
    vehicle_id: str
    name: str
    vehicle_type: VehicleType
    license_plate: str
    status: VehicleStatus
    fuel_level: float
    mileage: float
    max_capacity_lbs: float
    volume_ft3: float
    cost_per_km: float
    assigned_driver_id: Optional[int]

    class Config:
        from_attributes = True
