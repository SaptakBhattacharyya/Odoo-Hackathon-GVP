"""
Seed script — Populates the database with demo data for the hackathon.
Run: python seed.py
"""
from database import SessionLocal, init_db
from models.user import User, UserRole
from models.vehicle import Vehicle, VehicleType, VehicleStatus
from models.driver import Driver, DriverStatus, LicenseStatus
from models.trip import Trip, TripStatus, TripPriority
from models.maintenance import MaintenanceRecord, ServiceStatus, ServicePriority
from models.expense import Expense, ExpenseType
from services.auth import hash_password


def seed():
    init_db()
    db = SessionLocal()

    # Check if already seeded
    if db.query(User).count() > 0:
        print("Database already seeded. Skipping.")
        db.close()
        return

    print("🌱 Seeding database...")

    # --- Users (Indian names) ---
    users = [
        User(email="admin@fleetflow.in", username="admin", hashed_password=hash_password("admin123"), full_name="Arjun Mehta", role=UserRole.ADMIN),
        User(email="manager@fleetflow.in", username="manager", hashed_password=hash_password("manager123"), full_name="Priya Sharma", role=UserRole.MANAGER),
        User(email="dispatcher@fleetflow.in", username="dispatcher", hashed_password=hash_password("dispatch123"), full_name="Rahul Verma", role=UserRole.DISPATCHER),
        User(email="driver@fleetflow.in", username="driver", hashed_password=hash_password("driver123"), full_name="Suresh Kumar", role=UserRole.DRIVER),
    ]
    db.add_all(users)
    db.flush()
    print(f"  ✅ {len(users)} users created")

    # --- Vehicles (Indian models & plates) ---
    vehicles = [
        Vehicle(vehicle_id="VH-001", name="Tata Ace", vehicle_type=VehicleType.VAN, license_plate="MH-12-AB-1234", status=VehicleStatus.AVAILABLE, fuel_level=78, mileage=45200, last_service_km=35000, max_capacity_lbs=1500, volume_ft3=120, cost_per_km=8.50),
        Vehicle(vehicle_id="VH-002", name="Mahindra Bolero Pickup", vehicle_type=VehicleType.PICKUP, license_plate="DL-01-CD-5678", status=VehicleStatus.ON_TRIP, fuel_level=45, mileage=62100, last_service_km=55000, max_capacity_lbs=1200, volume_ft3=95, cost_per_km=7.20),
        Vehicle(vehicle_id="VH-003", name="Ashok Leyland Dost", vehicle_type=VehicleType.VAN, license_plate="KA-05-EF-9012", status=VehicleStatus.IN_SHOP, fuel_level=12, mileage=78500, last_service_km=50000, max_capacity_lbs=1600, volume_ft3=130, cost_per_km=9.00),
        Vehicle(vehicle_id="VH-004", name="Tata 407", vehicle_type=VehicleType.TRUCK, license_plate="TN-09-GH-3456", status=VehicleStatus.AVAILABLE, fuel_level=92, mileage=31800, last_service_km=28000, max_capacity_lbs=3500, volume_ft3=280, cost_per_km=12.50),
        Vehicle(vehicle_id="VH-005", name="Eicher Pro 2049", vehicle_type=VehicleType.TRUCK, license_plate="AP-07-IJ-7890", status=VehicleStatus.ON_TRIP, fuel_level=55, mileage=89400, last_service_km=80000, max_capacity_lbs=5000, volume_ft3=400, cost_per_km=15.00),
        Vehicle(vehicle_id="VH-006", name="Maruti Suzuki Eeco", vehicle_type=VehicleType.VAN, license_plate="RJ-14-KL-2345", status=VehicleStatus.AVAILABLE, fuel_level=88, mileage=22300, last_service_km=20000, max_capacity_lbs=750, volume_ft3=60, cost_per_km=5.50),
        Vehicle(vehicle_id="VH-007", name="Mahindra Supro", vehicle_type=VehicleType.VAN, license_plate="GJ-06-MN-6789", status=VehicleStatus.ON_TRIP, fuel_level=33, mileage=56700, last_service_km=45000, max_capacity_lbs=1000, volume_ft3=85, cost_per_km=6.80),
        Vehicle(vehicle_id="VH-008", name="BharatBenz 1617", vehicle_type=VehicleType.HEAVY, license_plate="UP-32-OP-0123", status=VehicleStatus.AVAILABLE, fuel_level=71, mileage=112000, last_service_km=100000, max_capacity_lbs=16000, volume_ft3=1200, cost_per_km=22.00),
        Vehicle(vehicle_id="VH-009", name="Tata Prima", vehicle_type=VehicleType.HEAVY, license_plate="HR-26-QR-4567", status=VehicleStatus.IN_SHOP, fuel_level=5, mileage=145600, last_service_km=90000, max_capacity_lbs=25000, volume_ft3=1800, cost_per_km=28.00),
        Vehicle(vehicle_id="VH-010", name="Ashok Leyland 1920", vehicle_type=VehicleType.TRUCK, license_plate="WB-02-ST-8901", status=VehicleStatus.AVAILABLE, fuel_level=64, mileage=67900, last_service_km=60000, max_capacity_lbs=8000, volume_ft3=650, cost_per_km=18.00),
    ]
    db.add_all(vehicles)
    db.flush()
    print(f"  ✅ {len(vehicles)} vehicles created")

    # --- Drivers (Indian names) ---
    drivers = [
        Driver(full_name="Suresh Kumar", email="suresh@fleetflow.in", safety_score=95, total_trips=234, violations=0, license_status=LicenseStatus.VALID, license_expiry="Dec 2027"),
        Driver(full_name="Anita Devi", email="anita@fleetflow.in", safety_score=92, total_trips=198, violations=1, license_status=LicenseStatus.VALID, license_expiry="Mar 2027"),
        Driver(full_name="Rajesh Patel", email="rajesh@fleetflow.in", safety_score=88, total_trips=312, violations=2, license_status=LicenseStatus.VALID, license_expiry="Aug 2026"),
        Driver(full_name="Meena Kumari", email="meena@fleetflow.in", safety_score=91, total_trips=156, violations=0, license_status=LicenseStatus.VALID, license_expiry="Nov 2027"),
        Driver(full_name="Vikram Singh", email="vikram@fleetflow.in", safety_score=78, total_trips=267, violations=4, license_status=LicenseStatus.EXPIRING, license_expiry="Mar 2026"),
        Driver(full_name="Amit Yadav", email="amit@fleetflow.in", safety_score=85, total_trips=189, violations=1, status=DriverStatus.ON_LEAVE, license_status=LicenseStatus.VALID, license_expiry="Jul 2027"),
        Driver(full_name="Kavita Nair", email="kavita@fleetflow.in", safety_score=93, total_trips=145, violations=0, license_status=LicenseStatus.VALID, license_expiry="Sep 2027"),
        Driver(full_name="Ravi Shankar", email="ravi@fleetflow.in", safety_score=72, total_trips=301, violations=6, license_status=LicenseStatus.EXPIRED, license_expiry="Jan 2026"),
    ]
    db.add_all(drivers)
    db.flush()
    print(f"  ✅ {len(drivers)} drivers created")

    # --- Trips (Indian routes) ---
    trips = [
        Trip(trip_id="TR-1024", origin="Mumbai, MH", destination="Pune, MH", cargo_description="Textiles", weight_lbs=1500, driver_name="Suresh Kumar", vehicle_name="Tata Ace VH-001", status=TripStatus.IN_TRANSIT, priority=TripPriority.NORMAL, eta="3h 45m", distance_km=150),
        Trip(trip_id="TR-1023", origin="Delhi, DL", destination="Jaipur, RJ", cargo_description="Medicines", weight_lbs=900, driver_name="Anita Devi", vehicle_name="Mahindra Bolero VH-002", status=TripStatus.DELIVERED, priority=TripPriority.HIGH, distance_km=280),
        Trip(trip_id="TR-1022", origin="Bangalore, KA", destination="Chennai, TN", cargo_description="Auto Parts", weight_lbs=2000, driver_name="Rajesh Patel", vehicle_name="Ashok Leyland Dost VH-003", status=TripStatus.LOADING, priority=TripPriority.NORMAL, eta="5h 20m", distance_km=350),
        Trip(trip_id="TR-1021", origin="Hyderabad, TS", destination="Visakhapatnam, AP", cargo_description="Spices & Dry Fruits", weight_lbs=800, driver_name="Meena Kumari", vehicle_name="Eicher Pro VH-005", status=TripStatus.IN_TRANSIT, priority=TripPriority.URGENT, eta="6h 10m", distance_km=620),
    ]
    db.add_all(trips)
    db.flush()
    print(f"  ✅ {len(trips)} trips created")

    # --- Maintenance ---
    maintenance_records = [
        MaintenanceRecord(vehicle_id=3, vehicle_name="Ashok Leyland Dost", vehicle_code="#KA05", service_type="Brake Pad Replace", status=ServiceStatus.IN_PROGRESS, priority=ServicePriority.HIGH, cost=4500, mechanic="Ramesh Mechanic", progress=40, service_date="Feb 16, 2026"),
        MaintenanceRecord(vehicle_id=1, vehicle_name="Tata Ace", vehicle_code="#MH12", service_type="Clutch Plate Repair", status=ServiceStatus.IN_PROGRESS, priority=ServicePriority.HIGH, cost=6500, mechanic="Sunil Garage", progress=65, service_date="Feb 18, 2026"),
        MaintenanceRecord(vehicle_id=2, vehicle_name="Mahindra Bolero", vehicle_code="#DL01", service_type="Oil Change & Filter", status=ServiceStatus.COMPLETED, priority=ServicePriority.LOW, cost=1800, mechanic="Hari Motors", progress=100, service_date="Feb 17, 2026"),
        MaintenanceRecord(vehicle_id=4, vehicle_name="Tata 407", vehicle_code="#TN09", service_type="Tyre Replacement", status=ServiceStatus.COMPLETED, priority=ServicePriority.MEDIUM, cost=8000, mechanic="Sunil Garage", progress=100, service_date="Feb 15, 2026"),
        MaintenanceRecord(vehicle_id=1, vehicle_name="Tata Ace", vehicle_code="#MH12", service_type="AC Compressor Repair", status=ServiceStatus.SCHEDULED, priority=ServicePriority.MEDIUM, cost=3500, mechanic="Hari Motors", progress=0, service_date="Feb 22, 2026"),
    ]
    db.add_all(maintenance_records)
    db.flush()
    print(f"  ✅ {len(maintenance_records)} maintenance records created")

    # --- Expenses (₹ amounts) ---
    expenses = [
        Expense(vehicle_name="Tata Ace #MH12", driver_name="Suresh K.", expense_type=ExpenseType.FUEL, amount=4500, liters=50, expense_date="Feb 20"),
        Expense(vehicle_name="Mahindra Bolero #DL01", driver_name="Anita D.", expense_type=ExpenseType.MAINTENANCE, amount=6500, expense_date="Feb 19"),
        Expense(vehicle_name="Ashok Leyland Dost #KA05", driver_name="Rajesh P.", expense_type=ExpenseType.FUEL, amount=5200, liters=58, expense_date="Feb 19"),
        Expense(vehicle_name="Tata 407 #TN09", driver_name="Meena K.", expense_type=ExpenseType.TOLLS, amount=850, expense_date="Feb 18"),
        Expense(vehicle_name="BharatBenz 1617 #UP32", driver_name="Vikram S.", expense_type=ExpenseType.MAINTENANCE, amount=12000, expense_date="Feb 16"),
        Expense(expense_type=ExpenseType.INSURANCE, amount=85000, description="Q1 2026 Fleet Insurance Premium", expense_date="Feb 18"),
        Expense(vehicle_name="Maruti Eeco #RJ14", driver_name="Amit Y.", expense_type=ExpenseType.FUEL, amount=2400, liters=28, expense_date="Feb 17"),
        Expense(vehicle_name="Mahindra Supro #GJ06", driver_name="Kavita N.", expense_type=ExpenseType.FUEL, amount=3100, liters=35, expense_date="Feb 16"),
    ]
    db.add_all(expenses)

    db.commit()
    db.close()
    print(f"  ✅ {len(expenses)} expense records created")
    print("\n🎉 Database seeded successfully!")
    print("\n📋 Login credentials:")
    print("  Admin:      admin / admin123")
    print("  Manager:    manager / manager123")
    print("  Dispatcher: dispatcher / dispatch123")
    print("  Driver:     driver / driver123")


if __name__ == "__main__":
    seed()
