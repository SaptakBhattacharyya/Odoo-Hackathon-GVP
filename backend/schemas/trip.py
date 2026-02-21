from pydantic import BaseModel
from typing import Optional
from models.trip import TripStatus, TripPriority


class TripCreate(BaseModel):
    origin: str
    destination: str
    cargo_description: Optional[str] = None
    weight_lbs: float = 0.0
    driver_id: Optional[int] = None
    vehicle_id: Optional[int] = None
    priority: TripPriority = TripPriority.NORMAL
    departure_date: Optional[str] = None


class TripUpdate(BaseModel):
    status: Optional[TripStatus] = None
    driver_id: Optional[int] = None
    vehicle_id: Optional[int] = None
    eta: Optional[str] = None


class TripResponse(BaseModel):
    id: int
    trip_id: str
    origin: str
    destination: str
    cargo_description: Optional[str]
    weight_lbs: float
    driver_id: Optional[int]
    driver_name: Optional[str]
    vehicle_id: Optional[int]
    vehicle_name: Optional[str]
    status: TripStatus
    priority: TripPriority
    eta: Optional[str]
    departure_date: Optional[str]
    distance_km: float

    class Config:
        from_attributes = True
