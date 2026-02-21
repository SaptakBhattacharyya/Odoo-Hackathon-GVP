"""Seed realistic Indian fleet data"""
from database import SessionLocal, init_db
from models.vehicle import Vehicle, VehicleType, VehicleStatus
from models.driver import Driver, DriverStatus, LicenseStatus
from models.trip import Trip, TripStatus, TripPriority
from models.maintenance import MaintenanceRecord, ServiceStatus, ServicePriority
from models.expense import Expense, ExpenseType

init_db()
db = SessionLocal()

vehicles = [
    Vehicle(vehicle_id="VH-001", name="Tata Ace Gold", vehicle_type=VehicleType.VAN, license_plate="MH-12-AB-1234", status=VehicleStatus.AVAILABLE, fuel_level=78, mileage=45200, last_service_km=35000, max_capacity_lbs=1500, volume_ft3=120, cost_per_km=8.50),
    Vehicle(vehicle_id="VH-002", name="Mahindra Bolero Pickup", vehicle_type=VehicleType.PICKUP, license_plate="DL-01-CD-5678", status=VehicleStatus.ON_TRIP, fuel_level=45, mileage=62100, last_service_km=55000, max_capacity_lbs=1200, volume_ft3=95, cost_per_km=7.20),
    Vehicle(vehicle_id="VH-003", name="Ashok Leyland Dost+", vehicle_type=VehicleType.VAN, license_plate="KA-05-EF-9012", status=VehicleStatus.IN_SHOP, fuel_level=12, mileage=78500, last_service_km=50000, max_capacity_lbs=1600, volume_ft3=130, cost_per_km=9.00),
    Vehicle(vehicle_id="VH-004", name="Tata 407 Gold SFC", vehicle_type=VehicleType.TRUCK, license_plate="TN-09-GH-3456", status=VehicleStatus.AVAILABLE, fuel_level=92, mileage=31800, last_service_km=28000, max_capacity_lbs=3500, volume_ft3=280, cost_per_km=12.50),
    Vehicle(vehicle_id="VH-005", name="Eicher Pro 2049", vehicle_type=VehicleType.TRUCK, license_plate="AP-07-IJ-7890", status=VehicleStatus.ON_TRIP, fuel_level=55, mileage=89400, last_service_km=80000, max_capacity_lbs=5000, volume_ft3=400, cost_per_km=15.00),
    Vehicle(vehicle_id="VH-006", name="Maruti Suzuki Eeco Cargo", vehicle_type=VehicleType.VAN, license_plate="RJ-14-KL-2345", status=VehicleStatus.AVAILABLE, fuel_level=88, mileage=22300, last_service_km=20000, max_capacity_lbs=750, volume_ft3=60, cost_per_km=5.50),
    Vehicle(vehicle_id="VH-007", name="Mahindra Supro Maxitruck", vehicle_type=VehicleType.VAN, license_plate="GJ-06-MN-6789", status=VehicleStatus.ON_TRIP, fuel_level=33, mileage=56700, last_service_km=45000, max_capacity_lbs=1000, volume_ft3=85, cost_per_km=6.80),
    Vehicle(vehicle_id="VH-008", name="BharatBenz 1617R", vehicle_type=VehicleType.HEAVY, license_plate="UP-32-OP-0123", status=VehicleStatus.AVAILABLE, fuel_level=71, mileage=112000, last_service_km=100000, max_capacity_lbs=16000, volume_ft3=1200, cost_per_km=22.00),
    Vehicle(vehicle_id="VH-009", name="Tata Prima 4028.S", vehicle_type=VehicleType.HEAVY, license_plate="HR-26-QR-4567", status=VehicleStatus.IN_SHOP, fuel_level=5, mileage=145600, last_service_km=90000, max_capacity_lbs=25000, volume_ft3=1800, cost_per_km=28.00),
    Vehicle(vehicle_id="VH-010", name="Ashok Leyland 1920 HG", vehicle_type=VehicleType.TRUCK, license_plate="WB-02-ST-8901", status=VehicleStatus.AVAILABLE, fuel_level=64, mileage=67900, last_service_km=60000, max_capacity_lbs=8000, volume_ft3=650, cost_per_km=18.00),
    Vehicle(vehicle_id="VH-011", name="Tata Intra V30", vehicle_type=VehicleType.PICKUP, license_plate="TS-08-UV-3456", status=VehicleStatus.AVAILABLE, fuel_level=82, mileage=18500, last_service_km=15000, max_capacity_lbs=1100, volume_ft3=90, cost_per_km=6.00),
]
db.add_all(vehicles)
db.flush()
print(f"{len(vehicles)} vehicles added")

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
print(f"{len(drivers)} drivers added")

trips = [
    Trip(trip_id="TR-1001", origin="Mumbai, MH", destination="Pune, MH", cargo_description="Cotton Textiles", weight_lbs=1500, driver_name="Suresh Kumar", vehicle_name="Tata Ace Gold VH-001", status=TripStatus.IN_TRANSIT, priority=TripPriority.NORMAL, eta="3h 30m", distance_km=150),
    Trip(trip_id="TR-1002", origin="Delhi, DL", destination="Jaipur, RJ", cargo_description="Pharmaceutical Supplies", weight_lbs=900, driver_name="Anita Devi", vehicle_name="Mahindra Bolero VH-002", status=TripStatus.IN_TRANSIT, priority=TripPriority.HIGH, eta="5h 15m", distance_km=280),
    Trip(trip_id="TR-1003", origin="Chennai, TN", destination="Bangalore, KA", cargo_description="FMCG Products", weight_lbs=2000, driver_name="Rajesh Patel", vehicle_name="Tata 407 Gold VH-004", status=TripStatus.LOADING, priority=TripPriority.NORMAL, eta="6h 20m", distance_km=350),
    Trip(trip_id="TR-1004", origin="Hyderabad, TS", destination="Visakhapatnam, AP", cargo_description="Spices & Dry Fruits", weight_lbs=800, driver_name="Meena Kumari", vehicle_name="Eicher Pro VH-005", status=TripStatus.IN_TRANSIT, priority=TripPriority.URGENT, eta="8h 10m", distance_km=620),
    Trip(trip_id="TR-1005", origin="Ahmedabad, GJ", destination="Mumbai, MH", cargo_description="Chemical Drums", weight_lbs=4500, driver_name="Vikram Singh", vehicle_name="BharatBenz 1617R VH-008", status=TripStatus.DELIVERED, priority=TripPriority.HIGH, distance_km=530),
    Trip(trip_id="TR-1006", origin="Kolkata, WB", destination="Patna, BR", cargo_description="Rice & Grains (50kg bags)", weight_lbs=6000, driver_name="Ravi Shankar", vehicle_name="Ashok Leyland 1920 VH-010", status=TripStatus.DELIVERED, priority=TripPriority.NORMAL, distance_km=560),
    Trip(trip_id="TR-1007", origin="Lucknow, UP", destination="Varanasi, UP", cargo_description="Handloom Silk Sarees", weight_lbs=500, driver_name="Kavita Nair", vehicle_name="Mahindra Supro VH-007", status=TripStatus.IN_TRANSIT, priority=TripPriority.NORMAL, eta="5h 00m", distance_km=320),
    Trip(trip_id="TR-1008", origin="Nagpur, MH", destination="Indore, MP", cargo_description="Oranges (Fresh Produce)", weight_lbs=3000, driver_name="Suresh Kumar", vehicle_name="Tata Intra V30 VH-011", status=TripStatus.DELIVERED, priority=TripPriority.URGENT, distance_km=480),
]
db.add_all(trips)
db.flush()
print(f"{len(trips)} trips added")

maint = [
    MaintenanceRecord(vehicle_id=3, vehicle_name="Ashok Leyland Dost+", vehicle_code="#KA05", service_type="Brake Drum & Shoe Replace", status=ServiceStatus.IN_PROGRESS, priority=ServicePriority.HIGH, cost=4500, mechanic="Ramesh Auto Works", progress=40, service_date="Feb 16, 2026"),
    MaintenanceRecord(vehicle_id=9, vehicle_name="Tata Prima 4028.S", vehicle_code="#HR26", service_type="Engine Overhaul", status=ServiceStatus.IN_PROGRESS, priority=ServicePriority.HIGH, cost=35000, mechanic="Tata Authorised Service", progress=20, service_date="Feb 14, 2026"),
    MaintenanceRecord(vehicle_id=1, vehicle_name="Tata Ace Gold", vehicle_code="#MH12", service_type="Clutch Plate & Pressure Plate", status=ServiceStatus.COMPLETED, priority=ServicePriority.MEDIUM, cost=6500, mechanic="Sunil Motor Garage", progress=100, service_date="Feb 10, 2026"),
    MaintenanceRecord(vehicle_id=5, vehicle_name="Eicher Pro 2049", vehicle_code="#AP07", service_type="Diesel Filter + Air Filter", status=ServiceStatus.COMPLETED, priority=ServicePriority.LOW, cost=2200, mechanic="Eicher Service Center", progress=100, service_date="Feb 12, 2026"),
    MaintenanceRecord(vehicle_id=8, vehicle_name="BharatBenz 1617R", vehicle_code="#UP32", service_type="Tyre Replacement (MRF 4x)", status=ServiceStatus.SCHEDULED, priority=ServicePriority.MEDIUM, cost=28000, mechanic="MRF Tyre Zone", progress=0, service_date="Feb 25, 2026"),
    MaintenanceRecord(vehicle_id=4, vehicle_name="Tata 407 Gold SFC", vehicle_code="#TN09", service_type="Suspension Leaf Spring", status=ServiceStatus.COMPLETED, priority=ServicePriority.HIGH, cost=8500, mechanic="Ramesh Auto Works", progress=100, service_date="Feb 08, 2026"),
]
db.add_all(maint)
db.flush()
print(f"{len(maint)} maintenance records added")

expenses = [
    Expense(vehicle_name="Tata Ace Gold #MH12", driver_name="Suresh K.", expense_type=ExpenseType.FUEL, amount=4500, liters=50, expense_date="Feb 20"),
    Expense(vehicle_name="Mahindra Bolero #DL01", driver_name="Anita D.", expense_type=ExpenseType.FUEL, amount=5800, liters=65, expense_date="Feb 20"),
    Expense(vehicle_name="Eicher Pro 2049 #AP07", driver_name="Meena K.", expense_type=ExpenseType.FUEL, amount=8200, liters=92, expense_date="Feb 19"),
    Expense(vehicle_name="BharatBenz 1617R #UP32", driver_name="Vikram S.", expense_type=ExpenseType.FUEL, amount=12500, liters=140, expense_date="Feb 18"),
    Expense(vehicle_name="Ashok Leyland Dost #KA05", driver_name="Rajesh P.", expense_type=ExpenseType.MAINTENANCE, amount=4500, expense_date="Feb 16"),
    Expense(vehicle_name="Tata Prima #HR26", driver_name="Ravi S.", expense_type=ExpenseType.MAINTENANCE, amount=35000, expense_date="Feb 14"),
    Expense(vehicle_name="Tata Ace Gold #MH12", driver_name="Suresh K.", expense_type=ExpenseType.TOLLS, amount=850, description="Mumbai-Pune Expressway Toll (FASTag)", expense_date="Feb 20"),
    Expense(vehicle_name="BharatBenz 1617R #UP32", driver_name="Vikram S.", expense_type=ExpenseType.TOLLS, amount=1200, description="NH-48 Ahmedabad-Mumbai Toll", expense_date="Feb 18"),
    Expense(vehicle_name="Eicher Pro 2049 #AP07", driver_name="Meena K.", expense_type=ExpenseType.TOLLS, amount=650, description="Hyderabad ORR Toll Plaza", expense_date="Feb 19"),
    Expense(expense_type=ExpenseType.INSURANCE, amount=85000, description="Q1 2026 Bajaj Allianz Fleet Insurance", expense_date="Feb 01"),
    Expense(expense_type=ExpenseType.INSURANCE, amount=42000, description="ICICI Lombard Vehicle Insurance (5 units)", expense_date="Jan 15"),
    Expense(vehicle_name="Tata 407 Gold #TN09", driver_name="Rajesh P.", expense_type=ExpenseType.FUEL, amount=6100, liters=68, expense_date="Feb 17"),
    Expense(vehicle_name="Mahindra Supro #GJ06", driver_name="Kavita N.", expense_type=ExpenseType.FUEL, amount=3100, liters=35, expense_date="Feb 16"),
    Expense(vehicle_name="Maruti Eeco #RJ14", driver_name="Amit Y.", expense_type=ExpenseType.FUEL, amount=2400, liters=28, expense_date="Feb 15"),
    Expense(vehicle_name="Ashok Leyland 1920 #WB02", driver_name="Ravi S.", expense_type=ExpenseType.FUEL, amount=14200, liters=160, expense_date="Feb 14"),
    Expense(vehicle_name="Tata Intra V30 #TS08", driver_name="Suresh K.", expense_type=ExpenseType.MAINTENANCE, amount=3200, description="Battery replacement - Amara Raja", expense_date="Feb 13"),
    Expense(expense_type=ExpenseType.OTHER, amount=15000, description="GPS Tracker Install (3 vehicles) - MapmyIndia", expense_date="Feb 10"),
    Expense(expense_type=ExpenseType.OTHER, amount=8500, description="Driver Uniform & Safety Kit (8 drivers)", expense_date="Feb 08"),
]
db.add_all(expenses)

db.commit()
db.close()
print(f"{len(expenses)} expenses added")
print("All done!")
