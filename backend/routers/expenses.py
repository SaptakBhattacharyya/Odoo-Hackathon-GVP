from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models.expense import Expense, ExpenseType
from models.user import UserRole
from schemas.expense import ExpenseCreate, ExpenseResponse
from services.auth import get_current_user, require_role

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])


@router.get("/", response_model=list[ExpenseResponse])
def list_expenses(expense_type: str = None, skip: int = 0, limit: int = 50, db: Session = Depends(get_db), _=Depends(get_current_user)):
    query = db.query(Expense)
    if expense_type:
        query = query.filter(Expense.expense_type == expense_type)
    return query.order_by(Expense.id.desc()).offset(skip).limit(limit).all()


@router.get("/stats")
def expense_stats(db: Session = Depends(get_db), _=Depends(get_current_user)):
    total_spend = db.query(func.sum(Expense.amount)).scalar() or 0
    total_entries = db.query(Expense).count()
    total_fuel_liters = db.query(func.sum(Expense.liters)).filter(Expense.expense_type == ExpenseType.FUEL).scalar() or 0
    fuel_spend = db.query(func.sum(Expense.amount)).filter(Expense.expense_type == ExpenseType.FUEL).scalar() or 0
    maintenance_spend = db.query(func.sum(Expense.amount)).filter(Expense.expense_type == ExpenseType.MAINTENANCE).scalar() or 0
    avg_amount = round(total_spend / max(total_entries, 1), 2)
    return {
        "total_spend": round(total_spend, 2),
        "total_amount": round(total_spend, 2),
        "total_entries": total_entries,
        "avg_amount": avg_amount,
        "fuel_spend": round(fuel_spend, 2),
        "maintenance_spend": round(maintenance_spend, 2),
        "total_fuel_liters": round(total_fuel_liters, 1),
        "avg_fuel_efficiency": 8.5,
    }


@router.get("/breakdown")
def expense_breakdown(db: Session = Depends(get_db), _=Depends(get_current_user)):
    """Get expense breakdown by type."""
    breakdown = []
    for etype in ExpenseType:
        total = db.query(func.sum(Expense.amount)).filter(Expense.expense_type == etype).scalar() or 0
        count = db.query(Expense).filter(Expense.expense_type == etype).count()
        breakdown.append({"type": etype.value, "total": round(total, 2), "count": count})
    return breakdown


@router.post("/", response_model=ExpenseResponse, status_code=201)
def create_expense(data: ExpenseCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    expense = Expense(**data.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense
