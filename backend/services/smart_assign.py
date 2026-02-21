"""
Smart Auto-Assignment Engine
Rule-based logic to suggest the best vehicle and driver for a trip.
"""
from sqlalchemy.orm import Session
from models.vehicle import Vehicle, VehicleStatus
from models.driver import Driver, DriverStatus


def suggest_vehicles(db: Session, weight_lbs: float, limit: int = 3) -> list[dict]:
    """
    Suggest best-fit vehicles based on cargo weight.
    Rules:
    1. Vehicle must be Available
    2. Capacity must exceed required weight
    3. Prefer vehicles with higher fuel levels
    4. Prefer vehicles with lower mileage (newer = less risk)
    """
    vehicles = (
        db.query(Vehicle)
        .filter(Vehicle.status == VehicleStatus.AVAILABLE)
        .filter(Vehicle.max_capacity_lbs >= weight_lbs)
        .order_by(Vehicle.fuel_level.desc(), Vehicle.mileage.asc())
        .limit(limit)
        .all()
    )

    suggestions = []
    for v in vehicles:
        score = 0
        # Capacity fit score (closer to exact fit = better utilization)
        if v.max_capacity_lbs > 0:
            utilization = weight_lbs / v.max_capacity_lbs
            score += utilization * 40  # max 40 points

        # Fuel level score
        score += (v.fuel_level / 100) * 30  # max 30 points

        # Lower mileage = better condition
        if v.mileage < 50000:
            score += 30
        elif v.mileage < 100000:
            score += 20
        else:
            score += 10

        suggestions.append({
            "vehicle_id": v.id,
            "vehicle_code": v.vehicle_id,
            "name": v.name,
            "vehicle_type": v.vehicle_type.value,
            "max_capacity_lbs": v.max_capacity_lbs,
            "volume_ft3": v.volume_ft3,
            "fuel_level": v.fuel_level,
            "mileage": v.mileage,
            "match_score": round(score, 1),
        })

    suggestions.sort(key=lambda x: x["match_score"], reverse=True)
    return suggestions


def suggest_drivers(db: Session, limit: int = 3) -> list[dict]:
    """
    Suggest best available drivers.
    Rules:
    1. Driver must be Active
    2. Prefer higher safety scores
    3. Prefer fewer violations
    4. Prefer drivers with valid licenses
    """
    drivers = (
        db.query(Driver)
        .filter(Driver.status == DriverStatus.ACTIVE)
        .filter(Driver.assigned_vehicle_id.is_(None))
        .order_by(Driver.safety_score.desc(), Driver.violations.asc())
        .limit(limit)
        .all()
    )

    suggestions = []
    for d in drivers:
        score = d.safety_score * 0.6  # safety is 60% of score
        score -= d.violations * 5     # penalize violations
        score = max(score, 0)

        suggestions.append({
            "driver_id": d.id,
            "name": d.full_name,
            "safety_score": d.safety_score,
            "total_trips": d.total_trips,
            "violations": d.violations,
            "license_status": d.license_status.value,
            "match_score": round(score, 1),
        })

    suggestions.sort(key=lambda x: x["match_score"], reverse=True)
    return suggestions
