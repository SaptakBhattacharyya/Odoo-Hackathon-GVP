from pydantic import BaseModel
from typing import Optional
from models.expense import ExpenseType


class ExpenseCreate(BaseModel):
    vehicle_id: Optional[int] = None
    vehicle_name: Optional[str] = None
    driver_name: Optional[str] = None
    expense_type: ExpenseType
    amount: float
    liters: Optional[float] = None
    description: Optional[str] = None
    expense_date: Optional[str] = None


class ExpenseResponse(BaseModel):
    id: int
    vehicle_id: Optional[int]
    vehicle_name: Optional[str]
    driver_name: Optional[str]
    expense_type: ExpenseType
    amount: float
    liters: Optional[float]
    description: Optional[str]
    expense_date: Optional[str]

    class Config:
        from_attributes = True
