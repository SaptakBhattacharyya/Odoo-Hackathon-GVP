from sqlalchemy import Column, Integer, String, Float, DateTime, Enum as SAEnum
from sqlalchemy.sql import func
from database import Base
import enum


class ServiceStatus(str, enum.Enum):
    SCHEDULED = "Scheduled"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"


class ServicePriority(str, enum.Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, nullable=False)
    vehicle_name = Column(String(100), nullable=False)
    vehicle_code = Column(String(20), nullable=True)  # e.g. #402
    service_type = Column(String(200), nullable=False)
    description = Column(String(500), nullable=True)
    status = Column(SAEnum(ServiceStatus), default=ServiceStatus.SCHEDULED)
    priority = Column(SAEnum(ServicePriority), default=ServicePriority.MEDIUM)
    cost = Column(Float, default=0.0)
    mechanic = Column(String(200), nullable=True)
    progress = Column(Integer, default=0)  # 0-100 percentage
    service_date = Column(String(20), nullable=True)
    mileage_at_service = Column(Float, default=0.0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
