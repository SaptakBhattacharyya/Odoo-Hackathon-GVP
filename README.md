# Odoo-Hackathon-GVP
<div align="center">

# 🚚 FleetFlow — Fleet Management System

### Full-Stack, Role-Based Fleet Operations Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)]
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)]
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)]
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-UI-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)]
[![Hackathon](https://img.shields.io/badge/Odoo_Hackathon-2026-orange?style=for-the-badge)]

FleetFlow is a **production-grade fleet management system** built to streamline vehicle dispatch, driver operations, maintenance tracking, and real-time analytics.  
Designed with **role-based access control, real-time updates, and operational safety** in mind.

</div>

---

## 🚀 Features

- 🔐 Role-Based Access Control (Manager / Dispatcher / Driver)
- 🚗 Vehicle & Driver Registry
- 📍 Trip Dispatch & Real-Time Status Tracking
- 🛠 Maintenance & Expense Logging
- 📊 Operational Analytics & ROI Metrics
- ⚡ Real-Time Updates via Supabase Realtime
- 📄 PDF & CSV Export for Reports

---

## 🛠 Tech Stack

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui  
- Zustand (Global State)
- TanStack Query (Server State)
- React Hook Form + Zod (Validation)
- Recharts (Analytics)
- jsPDF + file-saver (Exports)

**Backend**
- Supabase (PostgreSQL 15)
- Supabase Auth
- Supabase Realtime
- Supabase Storage

---

## 🏗 Project Structure (Next.js 14 App Router)

```txt
/app
  /(auth)            → Authentication (Login / Register)
  /(dashboard)       → Main dashboard shell
  layout.tsx         → Root layout
/components          → Reusable UI components (shadcn/ui)
/hooks               → Custom hooks (Supabase, queries)
/lib
  supabase-client.ts → Supabase client setup
  utils.ts           → Shared utilities
/types               → TypeScript types (DB schema)
drivers (License info, safety score, duty status).
trips (Route data, assigned vehicle/driver, timestamps).
expenses and maintenance_logs (Financial and operational history).
4. Real-time Features
Utilizes Supabase Realtime to push database changes to the dashboard immediately, ensuring dispatchers and managers see the latest fleet status without page refreshes.
