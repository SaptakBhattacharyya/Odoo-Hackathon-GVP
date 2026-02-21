from sqlalchemy import Column, Integer, String, Float, DateTime, Enum as SAEnum
from sqlalchemy.sql import func
from database import Base
import enum


class DriverStatus(str, enum.Enum):
    ACTIVE = "Active"
    ON_LEAVE = "On Leave"
    SUSPENDED = "Suspended"


class LicenseStatus(str, enum.Enum):
    VALID = "Valid"
    EXPIRING = "Expiring"
    EXPIRED = "Expired"


class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(200), nullable=False)
    email = Column(String(255), unique=True, nullable=True)
    phone = Column(String(20), nullable=True)
    status = Column(SAEnum(DriverStatus), default=DriverStatus.ACTIVE)
    safety_score = Column(Float, default=100.0)  # 0-100
    total_trips = Column(Integer, default=0)
    violations = Column(Integer, default=0)
    license_status = Column(SAEnum(LicenseStatus), default=LicenseStatus.VALID)
    license_expiry = Column(String(20), nullable=True)
    assigned_vehicle_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
