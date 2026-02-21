from sqlalchemy import Column, Integer, String, Float, DateTime, Enum as SAEnum
from sqlalchemy.sql import func
from database import Base
import enum


class VehicleStatus(str, enum.Enum):
    AVAILABLE = "Available"
    ON_TRIP = "On Trip"
    IN_SHOP = "In Shop"


class VehicleType(str, enum.Enum):
    SEDAN = "Sedan"
    VAN = "Van"
    TRUCK = "Truck"
    PICKUP = "Pickup"
    HEAVY = "Heavy"


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(String(20), unique=True, index=True, nullable=False)  # e.g. VH-001
    name = Column(String(100), nullable=False)
    vehicle_type = Column(SAEnum(VehicleType), nullable=False)
    license_plate = Column(String(20), unique=True, nullable=False)
    status = Column(SAEnum(VehicleStatus), default=VehicleStatus.AVAILABLE)
    fuel_level = Column(Float, default=100.0)  # percentage
    mileage = Column(Float, default=0.0)  # in km
    last_service_km = Column(Float, default=0.0)
    max_capacity_lbs = Column(Float, default=0.0)
    volume_ft3 = Column(Float, default=0.0)
    cost_per_km = Column(Float, default=0.0)
    assigned_driver_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
