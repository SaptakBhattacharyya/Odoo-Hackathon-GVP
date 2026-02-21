# FleetMetrics — Fleet Management System

FleetMetrics is a comprehensive fleet management platform designed for logistics and transport companies to effectively manage their entire fleet operations.

## System Overview

FleetMetrics helps fleet managers, dispatchers, safety officers, and finance teams coordinate vehicles, drivers, trips, maintenance, and expenses in one unified dashboard.

## Vehicles

The fleet consists of multiple vehicle types:
- **Sedan** — Light passenger and small cargo transport
- **Van** — Medium cargo and delivery operations
- **Truck** — Standard freight and logistics
- **Heavy Truck** — Large-scale cargo and long-haul transport

### Vehicle Statuses
- **Available** — Ready for dispatch and assignment to trips
- **On Trip** — Currently assigned to an active trip
- **In Shop** — Undergoing maintenance or repairs
- **Retired** — Decommissioned and no longer in active service

### Vehicle Properties
Each vehicle is tracked with: license plate, make, model, year, type, capacity (kg), odometer reading (km), fuel type (petrol/diesel/electric/hybrid), acquisition cost, insurance expiry date, and status.

## Drivers

Drivers are the backbone of fleet operations. Each driver is tracked with their personal details, license information, and performance metrics.

### Driver Statuses
- **On Duty** — Available and ready for trip assignment
- **On Break** — Currently on scheduled break
- **Busy** — Assigned to an active trip or task
- **Suspended** — Temporarily suspended from duty

### Driver Metrics
- **Safety Score** — A score from 0 to 100 based on driving behavior, incidents, and compliance
- **Total Trips** — Total number of trips assigned
- **Completed Trips** — Successfully completed trips
- **Cancelled Trips** — Trips that were cancelled
- **Total Accidents** — Number of accidents on record
- **Total Complaints** — Number of complaints received

### License Classes
- **Class B** — Standard passenger vehicles
- **Class C** — Light commercial vehicles
- **Class D** — Heavy commercial vehicles
- **Class E** — Articulated heavy vehicles

## Trips

Trips represent cargo transport operations from origin to destination.

### Trip Lifecycle
1. **Draft** — Trip is created but not yet dispatched
2. **Dispatched** — Trip is approved and assigned to a driver and vehicle
3. **In Transit** — Vehicle is actively on the road
4. **Completed** — Trip successfully finished
5. **Cancelled** — Trip was cancelled (with reason recorded)

### Trip Details
Each trip records: vehicle ID, driver ID, origin, destination, cargo weight (kg), cargo description, fuel estimate, actual fuel used, distance (km), odometer start/end readings, dispatch time, completion time, and any cancellation details.

## Expenses

All fleet-related costs are tracked and managed through the expense system.

### Expense Categories
- **Fuel** — Fuel costs for trip operations
- **Toll** — Highway and road toll charges
- **Parking** — Parking fees during trips
- **Repair** — Vehicle repair and parts costs
- **Misc** — Miscellaneous fleet expenses

### Expense Workflow
1. **Pending** — Expense submitted, awaiting review
2. **Approved** — Expense reviewed and approved by manager
3. **Rejected** — Expense rejected (with reason provided)

### Expense Fields
Each expense tracks: trip ID, driver ID, vehicle ID, fuel cost, miscellaneous cost, total cost (auto-calculated), fuel liters, distance, receipt URL, category, approval status, approver, and rejection reason.

## Maintenance

The maintenance module tracks vehicle upkeep, repairs, and service history.

### Maintenance Severity Levels
- **Low** — Minor issues, can wait for scheduled service
- **Medium** — Moderate issues, should be addressed soon
- **High** — Serious issues, requires priority attention
- **Critical** — Safety-critical issues, vehicle must be taken off road immediately

### Maintenance Statuses
- **Open** — Issue identified and logged
- **In Progress** — Repair or service work underway
- **Resolved** — Issue fixed and vehicle cleared

### Maintenance Details
Each log records: vehicle ID, issue title, description, severity, cost, status, scheduled date, resolved date, technician name, workshop name, and receipt URL.

## User Roles

FleetMetrics supports role-based access control:

- **Manager** — Full administrative access. Can manage users, approve expenses, oversee all operations, and access analytics
- **Dispatcher** — Can create and manage trips, assign drivers and vehicles, and track trip status
- **Safety Officer** — Monitors driver safety scores, reviews incidents, and manages maintenance issues
- **Finance** — Manages expenses, reviews financial reports, and handles cost tracking

## Analytics & Reporting

The dashboard provides real-time analytics including:
- Fleet utilization rates
- Trip completion statistics
- Fuel consumption trends
- Maintenance cost analysis
- Driver performance rankings
- Expense breakdowns by category
- Vehicle status distribution
- Revenue and cost per kilometer metrics

## How to Use FleetMetrics

### For Managers
- Access the Dashboard for a high-level overview of all fleet operations
- Go to Users page to approve new registrations and manage team members
- Review and approve pending expenses
- Monitor analytics for cost optimization opportunities

### For Dispatchers
- Create new trips by specifying origin, destination, cargo, driver, and vehicle
- Monitor active trips in real-time
- Update trip status as it progresses through the lifecycle

### For Safety Officers
- Review driver safety scores and incident reports
- Log maintenance issues when problems are identified
- Track maintenance resolution progress

### For Finance
- Review and process pending expenses
- Track fuel costs and identify savings opportunities
- Generate expense reports by category, vehicle, or driver
