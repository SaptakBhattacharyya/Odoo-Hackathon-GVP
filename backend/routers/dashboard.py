from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models.vehicle import Vehicle, VehicleStatus
from models.driver import Driver, DriverStatus
from models.trip import Trip, TripStatus
from models.maintenance import MaintenanceRecord, ServiceStatus
from models.expense import Expense, ExpenseType
from services.auth import get_current_user
from services.predictive import get_fleet_maintenance_alerts

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/overview")
def dashboard_overview(db: Session = Depends(get_db), _=Depends(get_current_user)):
    """Get complete dashboard overview for the Command Center."""
    # Fleet stats
    total_vehicles = db.query(Vehicle).count()
    available = db.query(Vehicle).filter(Vehicle.status == VehicleStatus.AVAILABLE).count()
    on_trip = db.query(Vehicle).filter(Vehicle.status == VehicleStatus.ON_TRIP).count()
    in_shop = db.query(Vehicle).filter(Vehicle.status == VehicleStatus.IN_SHOP).count()
    utilization = round((on_trip / total_vehicles * 100), 1) if total_vehicles > 0 else 0

    # Driver stats
    total_drivers = db.query(Driver).count()
    active_drivers = db.query(Driver).filter(Driver.status == DriverStatus.ACTIVE).count()
    avg_safety = db.query(func.avg(Driver.safety_score)).scalar() or 0

    # Trip stats
    active_trips = db.query(Trip).filter(Trip.status == TripStatus.IN_TRANSIT).count()
    loading_trips = db.query(Trip).filter(Trip.status == TripStatus.LOADING).count()
    total_trips = db.query(Trip).count()

    # Expense summary
    total_spend = db.query(func.sum(Expense.amount)).scalar() or 0

    # Maintenance alerts (predictive)
    maintenance_alerts = get_fleet_maintenance_alerts(db)

    return {
        "fleet": {
            "total_vehicles": total_vehicles,
            "available": available,
            "on_trip": on_trip,
            "in_shop": in_shop,
            "utilization_rate": utilization,
        },
        "drivers": {
            "total": total_drivers,
            "active": active_drivers,
            "avg_safety_score": round(avg_safety, 1),
        },
        "trips": {
            "active": active_trips,
            "loading": loading_trips,
            "pending_cargo": loading_trips,
            "total": total_trips,
        },
        "expenses": {
            "total_spend": round(total_spend, 2),
        },
        "maintenance_alerts": maintenance_alerts[:5],  # top 5 alerts
    }
