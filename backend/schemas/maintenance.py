from pydantic import BaseModel
from typing import Optional
from models.maintenance import ServiceStatus, ServicePriority


class MaintenanceCreate(BaseModel):
    vehicle_id: int
    vehicle_name: str
    vehicle_code: Optional[str] = None
    service_type: str
    description: Optional[str] = None
    priority: ServicePriority = ServicePriority.MEDIUM
    cost: float = 0.0
    mechanic: Optional[str] = None
    service_date: Optional[str] = None


class MaintenanceUpdate(BaseModel):
    status: Optional[ServiceStatus] = None
    progress: Optional[int] = None
    cost: Optional[float] = None
    mechanic: Optional[str] = None


class MaintenanceResponse(BaseModel):
    id: int
    vehicle_id: int
    vehicle_name: str
    vehicle_code: Optional[str]
    service_type: str
    description: Optional[str]
    status: ServiceStatus
    priority: ServicePriority
    cost: float
    mechanic: Optional[str]
    progress: int
    service_date: Optional[str]

    class Config:
        from_attributes = True
