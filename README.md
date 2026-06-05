# LeadFlow Pro

A multi-tenant AI lead automation platform for small businesses. Each business gets a branded public form link, AI-powered lead summaries, automatic email notifications, and an owner dashboard — all running on a single shared platform.

## What it does

```
Admin creates business → generates form link → invites owner
Customer submits form → lead saved → AI summarizes → emails sent
Owner logs in → sees leads → updates status → follows up
```

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router) |
| Backend | FastAPI (Python 3.11) |
| Auth | Supabase Auth (JWT) |
| Database | Supabase PostgreSQL (async SQLAlchemy) |
| Storage | Supabase Storage |
| Email | Resend |
| AI | DeepSeek (`deepseek-v4-flash` / `deepseek-v4-pro`) |
| Deployment | Render (backend), Vercel (frontend) |

## Project structure

```
ai-automation/
├── backend/          # FastAPI API server
├── frontend/         # Next.js app (in progress)
└── automation_platform_docs/   # Architecture and planning docs
```

## Core principle

`business_id` is the tenant boundary. Every form, lead, message, follow-up, email event, AI output, and audit log must be tied to a `business_id`. The backend enforces this — the frontend never decides what data a user can access.

## Three entry points

| Route | Who uses it |
|---|---|
| `/admin` | Platform admin — creates businesses, invites owners |
| `/dashboard` | Business owner — views leads, messages, AI summaries |
| `/forms/[slug]` | Customer — submits a service request (no login required) |

## Getting started

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in your values
alembic upgrade head
uvicorn app.main:app --reload
```

API docs available at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # fill in your values
npm run dev
```

## Environment variables

See [`backend/.env.example`](backend/.env.example) and [`frontend/.env.local`](frontend/.env.local) for all required variables.

Required for the backend to start:

```
DATABASE_URL
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_JWKS_URL
```

## Roadmap

- **Phase 1 (MVP):** Lead capture, AI summary, email notifications, owner dashboard
- **Phase 2:** Custom form fields, manual follow-ups, owner settings, QR codes
- **Phase 3:** Scheduled follow-ups, SMS, business subscription plans
- **Phase 4:** Team accounts, CRM integrations, advanced analytics

See [`automation_platform_docs/IMPLEMENTATION_ROADMAP.md`](automation_platform_docs/IMPLEMENTATION_ROADMAP.md) for the full plan.
