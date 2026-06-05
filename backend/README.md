# LeadFlow Pro — FastAPI Backend Starter

Strong FastAPI backend foundation for an AI lead automation platform.

## Stack
- FastAPI
- SQLAlchemy 2.x async
- Alembic migrations into Supabase PostgreSQL
- Supabase Auth JWT verification
- Supabase Admin invite foundation
- Resend email automation
- DeepSeek AI lead summaries and reply drafts
- Render deployment config

## Golden Rule
`business_id` is the tenant boundary. Every form, lead, message, follow-up, email event, AI output, and audit log must be tied to a business.

## Run
```bash
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```
