<div align="center">

# 🚛 FleetMetrics — Fleet Management System

### Full-Stack Fleet Platform with AI-Powered Operations Assistant

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)]
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)]
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)]
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)]
[![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)]

A full-stack fleet management platform with an **AI-powered chatbot**, built for logistics companies to manage **vehicles, drivers, trips, expenses, maintenance, and analytics** in one unified dashboard.

</div>

---

## ⚡ Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Backend | Supabase (Auth, PostgreSQL, RLS, RPC) |
| AI Chatbot | FastAPI, LangChain, Google Gemini 2.5 Flash, ChromaDB |
| Charts | Recharts |
| State | Zustand, TanStack Query |
| Forms | React Hook Form + Zod |

---

## ✨ Key Features

- 📊 **Dashboard** — Real-time fleet KPIs & performance charts  
- 🚗 **Vehicles** — CRUD, lifecycle status (available/on_trip/in_shop/retired)  
- 👨‍✈️ **Drivers** — License management, safety scores, trip history  
- 🧭 **Trips** — Full lifecycle (draft → dispatched → in_transit → completed/cancelled)  
- 💰 **Expenses** — Approval workflow (fuel, toll, parking, repair, misc)  
- 🛠 **Maintenance** — Issue logging with severity levels  
- 👥 **Users** — Role-based access (manager, dispatcher, safety_officer, finance)  
- 📈 **Analytics** — Utilization, fuel trends, cost breakdowns  
- 🤖 **AI Chatbot** — RAG-based fleet assistant (Gemini + ChromaDB)  
- 🔐 **Auth** — Google OAuth + Email/Password with manager approval flow  

---

## 📁 Project Structure

```txt
fleetmetrics/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── analytics/
│   │   │   ├── drivers/
│   │   │   ├── expenses/
│   │   │   ├── maintenance/
│   │   │   ├── trips/
│   │   │   ├── users/
│   │   │   └── vehicles/
│   │   ├── auth/
│   │   ├── login/
│   │   └── pending-approval/
│   ├── components/
│   │   ├── ChatWidget.tsx
│   │   └── dashboard/
│   └── lib/
│       ├── supabase/
│       └── hooks/
├── chatbot/
│   ├── main.py
│   ├── rag_chain.py
│   ├── data_loader.py
│   ├── config.py
│   ├── knowledge_base/
│   └── requirements.txt
└── .env.local
