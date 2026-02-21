from sqlalchemy import Column, Integer, String, Float, DateTime, Enum as SAEnum
from sqlalchemy.sql import func
from database import Base
import enum


class ExpenseType(str, enum.Enum):
    FUEL = "Fuel"
    MAINTENANCE = "Maintenance"
    TOLLS = "Tolls"
    INSURANCE = "Insurance"
    OTHER = "Other"


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, nullable=True)
    vehicle_name = Column(String(200), nullable=True)
    driver_name = Column(String(200), nullable=True)
    expense_type = Column(SAEnum(ExpenseType), nullable=False)
    amount = Column(Float, nullable=False)
    liters = Column(Float, nullable=True)  # for fuel entries
    description = Column(String(500), nullable=True)
    expense_date = Column(String(20), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
