"""
Predictive Maintenance Engine
Simple threshold-based logic to predict upcoming maintenance needs.
"""
from sqlalchemy.orm import Session
from models.vehicle import Vehicle
from models.maintenance import MaintenanceRecord, ServiceStatus
from config import settings


def check_vehicle_maintenance(vehicle: Vehicle) -> list[dict]:
    """
    Check if a vehicle needs maintenance based on mileage thresholds.
    Returns a list of predicted maintenance tasks.
    """
    alerts = []
    km_since_service = vehicle.mileage - vehicle.last_service_km

    if km_since_service >= settings.OIL_CHANGE_KM:
        alerts.append({
            "vehicle_id": vehicle.id,
            "vehicle_name": vehicle.name,
            "vehicle_code": vehicle.vehicle_id,
            "service_type": "Oil Change",
            "urgency": "High" if km_since_service > settings.OIL_CHANGE_KM * 1.2 else "Medium",
            "km_overdue": round(km_since_service - settings.OIL_CHANGE_KM, 1),
            "message": f"Oil change overdue by {round(km_since_service - settings.OIL_CHANGE_KM, 1)} km",
        })

    if km_since_service >= settings.TIRE_ROTATION_KM:
        alerts.append({
            "vehicle_id": vehicle.id,
            "vehicle_name": vehicle.name,
            "vehicle_code": vehicle.vehicle_id,
            "service_type": "Tire Rotation",
            "urgency": "Medium",
            "km_overdue": round(km_since_service - settings.TIRE_ROTATION_KM, 1),
            "message": f"Tire rotation due — {round(km_since_service - settings.TIRE_ROTATION_KM, 1)} km overdue",
        })

    if km_since_service >= settings.BRAKE_CHECK_KM:
        alerts.append({
            "vehicle_id": vehicle.id,
            "vehicle_name": vehicle.name,
            "vehicle_code": vehicle.vehicle_id,
            "service_type": "Brake Inspection",
            "urgency": "High",
            "km_overdue": round(km_since_service - settings.BRAKE_CHECK_KM, 1),
            "message": f"Brake inspection critically overdue by {round(km_since_service - settings.BRAKE_CHECK_KM, 1)} km",
        })

    if km_since_service >= settings.FULL_INSPECTION_KM:
        alerts.append({
            "vehicle_id": vehicle.id,
            "vehicle_name": vehicle.name,
            "vehicle_code": vehicle.vehicle_id,
            "service_type": "Full Inspection",
            "urgency": "Critical",
            "km_overdue": round(km_since_service - settings.FULL_INSPECTION_KM, 1),
            "message": f"Full inspection overdue by {round(km_since_service - settings.FULL_INSPECTION_KM, 1)} km",
        })

    # Low fuel alert
    if vehicle.fuel_level < 15:
        alerts.append({
            "vehicle_id": vehicle.id,
            "vehicle_name": vehicle.name,
            "vehicle_code": vehicle.vehicle_id,
            "service_type": "Refueling",
            "urgency": "High",
            "km_overdue": 0,
            "message": f"Fuel critically low at {vehicle.fuel_level}%",
        })

    return alerts


def get_fleet_maintenance_alerts(db: Session) -> list[dict]:
    """Scan all vehicles and generate maintenance predictions."""
    vehicles = db.query(Vehicle).all()
    all_alerts = []
    for v in vehicles:
        alerts = check_vehicle_maintenance(v)
        all_alerts.extend(alerts)

    # Sort by urgency
    urgency_order = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}
    all_alerts.sort(key=lambda x: urgency_order.get(x["urgency"], 4))
    return all_alerts
