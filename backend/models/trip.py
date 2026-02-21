from sqlalchemy import Column, Integer, String, Float, DateTime, Enum as SAEnum
from sqlalchemy.sql import func
from database import Base
import enum


class TripStatus(str, enum.Enum):
    LOADING = "Loading"
    IN_TRANSIT = "In Transit"
    DELIVERED = "Delivered"
    CANCELLED = "Cancelled"


class TripPriority(str, enum.Enum):
    NORMAL = "Normal"
    HIGH = "High"
    URGENT = "Urgent"


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(String(20), unique=True, index=True, nullable=False)  # e.g. TR-1024
    origin = Column(String(200), nullable=False)
    destination = Column(String(200), nullable=False)
    cargo_description = Column(String(500), nullable=True)
    weight_lbs = Column(Float, default=0.0)
    driver_id = Column(Integer, nullable=True)
    driver_name = Column(String(200), nullable=True)
    vehicle_id = Column(Integer, nullable=True)
    vehicle_name = Column(String(200), nullable=True)
    status = Column(SAEnum(TripStatus), default=TripStatus.LOADING)
    priority = Column(SAEnum(TripPriority), default=TripPriority.NORMAL)
    eta = Column(String(50), nullable=True)
    departure_date = Column(String(20), nullable=True)
    distance_km = Column(Float, default=0.0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
