-- ============================================================
-- FLEETMATRICS — DATABASE SCHEMA
-- Description: Fleet management system for vehicles, drivers,
-- trips, maintenance, and expense tracking.
--
-- Authentication handled by Supabase Auth.
-- This schema only stores application data.
-- ============================================================



-- ============================================================
-- SECTION 1 — TABLES
-- ============================================================


-- ============================================================
-- USERS TABLE
-- Stores system users like managers, dispatchers, finance team.
-- This table mirrors auth.users (same UUID).
-- User accounts are auto-created after signup.
-- ============================================================

CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Full name of user
  name TEXT NOT NULL,

  -- Login email (must be unique)
  email TEXT UNIQUE NOT NULL,

  -- User role determines permissions in system
  role TEXT NOT NULL CHECK (
    role IN ('manager', 'dispatcher', 'safety_officer', 'finance')
  ),

  -- Profile image URL
  avatar_url TEXT,

  -- Whether account is active
  is_active BOOLEAN DEFAULT TRUE,

  -- Manager approval required for access
  is_approved BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);



-- ============================================================
-- VEHICLES TABLE
-- Stores all fleet vehicles and their operational status.
-- ============================================================

CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Unique vehicle identifier
  license_plate TEXT UNIQUE NOT NULL,

  -- Vehicle details
  model TEXT NOT NULL,
  make TEXT,

  -- Manufacturing year constraint
  year INT CHECK (year >= 1990 AND year <= 2030),

  -- Vehicle category
  type TEXT NOT NULL CHECK (
    type IN ('sedan', 'van', 'truck', 'heavy_truck')
  ),

  -- Maximum cargo capacity
  capacity_kg NUMERIC(10,2) NOT NULL CHECK (capacity_kg > 0),

  -- Total distance driven
  odometer_km NUMERIC(10,2) DEFAULT 0 CHECK (odometer_km >= 0),

  -- Current vehicle availability
  status TEXT NOT NULL DEFAULT 'available' CHECK (
    status IN ('available', 'on_trip', 'in_shop', 'retired')
  ),

  acquisition_cost NUMERIC(12,2),
  insurance_expiry DATE,

  -- Fuel type used
  fuel_type TEXT CHECK (
    fuel_type IN ('petrol', 'diesel', 'electric', 'hybrid')
  ),

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);



-- ============================================================
-- DRIVERS TABLE
-- Stores driver information, license data, and performance.
-- ============================================================

CREATE TABLE public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,

  -- Government license identifier
  license_number TEXT UNIQUE NOT NULL,

  -- License category determines allowed vehicle types
  license_class TEXT NOT NULL CHECK (
    license_class IN ('B', 'C', 'D', 'E')
  ),

  license_expiry DATE NOT NULL,

  -- Current driver availability
  status TEXT NOT NULL DEFAULT 'on_duty' CHECK (
    status IN ('on_duty', 'on_break', 'busy', 'suspended')
  ),

  -- Safety score from 0–100 calculated by system
  safety_score NUMERIC(5,2) DEFAULT 100.0
    CHECK (safety_score >= 0 AND safety_score <= 100),

  -- Performance metrics
  total_trips INT DEFAULT 0,
  completed_trips INT DEFAULT 0,
  cancelled_trips INT DEFAULT 0,
  total_accidents INT DEFAULT 0,
  total_complaints INT DEFAULT 0,

  hire_date DATE,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);



-- ============================================================
-- TRIPS TABLE
-- Represents a delivery or transport job.
-- Links vehicle + driver + cargo details.
-- ============================================================

CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Assigned vehicle
  vehicle_id UUID NOT NULL
    REFERENCES public.vehicles(id) ON DELETE RESTRICT,

  -- Assigned driver
  driver_id UUID NOT NULL
    REFERENCES public.drivers(id) ON DELETE RESTRICT,

  origin TEXT NOT NULL,
  destination TEXT NOT NULL,

  -- Cargo details
  cargo_weight_kg NUMERIC(10,2) NOT NULL CHECK (cargo_weight_kg > 0),
  cargo_description TEXT,

  -- Trip lifecycle state
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN (
      'draft',
      'dispatched',
      'in_transit',
      'completed',
      'cancelled'
    )
  ),

  -- Trip metrics
  fuel_estimate NUMERIC(10,2),
  fuel_actual NUMERIC(10,2),
  distance_km NUMERIC(10,2),

  odometer_start NUMERIC(10,2),
  odometer_end NUMERIC(10,2),

  dispatched_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,

  -- User who created trip
  created_by UUID REFERENCES public.users(id),

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);



-- ============================================================
-- MAINTENANCE LOGS TABLE
-- Tracks vehicle repairs and issues.
-- Automatically changes vehicle availability.
-- ============================================================

CREATE TABLE public.maintenance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  vehicle_id UUID NOT NULL
    REFERENCES public.vehicles(id) ON DELETE CASCADE,

  issue_title TEXT NOT NULL,
  description TEXT,

  -- Issue severity level
  severity TEXT DEFAULT 'medium'
    CHECK (severity IN ('low', 'medium', 'high', 'critical')),

  cost NUMERIC(10,2) DEFAULT 0 CHECK (cost >= 0),

  -- Repair progress
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'resolved')),

  scheduled_date DATE,
  resolved_date DATE,

  technician_name TEXT,
  workshop_name TEXT,

  -- File storage path for receipts
  receipt_url TEXT,

  created_by UUID REFERENCES public.users(id),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);



-- ============================================================
-- EXPENSES TABLE
-- Tracks operational costs like fuel, tolls, repairs.
-- Used by finance team for approvals.
-- ============================================================

CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES public.drivers(id),
  vehicle_id UUID REFERENCES public.vehicles(id),

  fuel_cost NUMERIC(10,2) DEFAULT 0 CHECK (fuel_cost >= 0),
  misc_cost NUMERIC(10,2) DEFAULT 0 CHECK (misc_cost >= 0),

  -- Auto calculated field
  total_cost NUMERIC(10,2)
    GENERATED ALWAYS AS (fuel_cost + misc_cost) STORED,

  fuel_liters NUMERIC(8,2),
  distance_km NUMERIC(10,2),

  receipt_url TEXT,

  category TEXT CHECK (
    category IN ('fuel', 'toll', 'parking', 'repair', 'misc')
  ),

  -- Approval workflow
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),

  approved_by UUID REFERENCES public.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);