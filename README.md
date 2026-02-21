# 🚛 FleetMetrics — Fleet Management System

A full-stack fleet management platform with an AI-powered chatbot, built for logistics companies to manage vehicles, drivers, trips, expenses, maintenance, and analytics.

## ⚡ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Backend | Supabase (Auth, PostgreSQL, RLS, RPC) |
| AI Chatbot | FastAPI, LangChain, Google Gemini 2.5 Flash, ChromaDB |
| Charts | Recharts |
| State | Zustand, React Query |
| Forms | React Hook Form + Zod |

## 📸 Features

- **Dashboard** — Real-time fleet overview with KPI cards and charts
- **Vehicles** — CRUD, status tracking (available/on_trip/in_shop/retired), fuel type, odometer
- **Drivers** — Safety scores, license management, trip history
- **Trips** — Full lifecycle (draft → dispatched → in_transit → completed/cancelled)
- **Expenses** — Submit, approve/reject with categories (fuel, toll, parking, repair, misc)
- **Maintenance** — Log issues with severity levels, track repairs
- **Users** — Role-based access (manager, dispatcher, safety_officer, finance)
- **Analytics** — Utilization rates, fuel trends, cost breakdowns
- **AI Chatbot** — RAG-based assistant powered by Gemini + ChromaDB
- **Auth** — Google OAuth + email/password with manager approval flow

## 📁 Project Structure

```
fleetmetrics/
├── src/
│   ├── app/
│   │   ├── dashboard/          # Main dashboard pages
│   │   │   ├── analytics/      # Fleet analytics
│   │   │   ├── drivers/        # Driver management
│   │   │   ├── expenses/       # Expense tracking
│   │   │   ├── maintenance/    # Maintenance logs
│   │   │   ├── trips/          # Trip dispatch
│   │   │   ├── users/          # User management
│   │   │   └── vehicles/       # Vehicle fleet
│   │   ├── auth/               # Auth callback
│   │   ├── login/              # Login & register
│   │   └── pending-approval/   # Awaiting approval page
│   ├── components/
│   │   ├── ChatWidget.tsx      # AI chatbot floating widget
│   │   └── dashboard/          # Sidebar & shared UI
│   └── lib/
│       ├── supabase/           # Supabase client (browser, server, middleware)
│       └── hooks/              # Custom React hooks
├── chatbot/                    # FastAPI + LangChain backend
│   ├── main.py                 # FastAPI server (endpoints)
│   ├── rag_chain.py            # RAG chain with ChromaDB + Gemini
│   ├── data_loader.py          # Knowledge base loader
│   ├── config.py               # Environment config
│   ├── knowledge_base/         # Markdown docs for RAG
│   └── requirements.txt        # Python dependencies
└── .env.local                  # Environment variables
```

## 🚀 Setup & Installation

### Prerequisites

- **Node.js** 18+
- **Python** 3.10+
- **Supabase** project (with database tables set up)
- **Google API Key** (for Gemini AI)

### 1. Clone & Install Frontend

```bash
git clone https://github.com/your-username/fleetmetrics.git
cd fleetmetrics
npm install
```

### 2. Configure Environment

Create `.env.local` in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GOOGLE_API_KEY=your-google-api-key
```

### 3. Install & Run AI Chatbot

```bash
cd chatbot
pip install -r requirements.txt
uvicorn main:app --reload
```

Server starts at `http://localhost:8000`.

### 4. Run Frontend

```bash
# From root directory
npm run dev
```

App starts at `http://localhost:3000`.

### 5. Initialize Chatbot Data

After both servers are running, either:
- Click the **chat bubble** (bottom-right in dashboard) → hit **"Load Fleet Data"**
- Or call: `POST http://localhost:8000/ingest`

## 🗄️ Database Schema (Supabase)

| Table | Description |
|-------|-------------|
| `users` | App users with roles (manager/dispatcher/safety_officer/finance) |
| `vehicles` | Fleet vehicles with status, type, capacity, odometer |
| `drivers` | Drivers with license info, safety scores, trip stats |
| `trips` | Transport jobs with lifecycle tracking |
| `expenses` | Cost records with approval workflow |
| `maintenance_logs` | Vehicle maintenance and repair tracking |

All tables have **RLS enabled** with role-based policies.

## 🤖 AI Chatbot Architecture

```
User → ChatWidget (React) → FastAPI → LangChain RAG Chain
                                          ├── ChromaDB (vector store)
                                          ├── Google Gemini 2.5 Flash (LLM)
                                          └── knowledge_base/*.md (source docs)
```

- **Embeddings**: `gemini-embedding-001`
- **Vector Store**: ChromaDB (persistent, local)
- **LLM**: Gemini 2.5 Flash with conversational memory
- **Knowledge Base**: Expandable — add `.md` files to `chatbot/knowledge_base/`

### Chatbot API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/ingest` | Load knowledge base into ChromaDB |
| `POST` | `/chat` | Send message, get AI response |
| `DELETE` | `/sessions/{id}` | Clear chat history |

## 🔐 Auth Flow

1. User registers via email/password or Google OAuth
2. Account goes to **pending approval** state
3. Manager approves user from the Users page
4. Approved users can access the dashboard based on their role

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## 📄 License

squad-0
