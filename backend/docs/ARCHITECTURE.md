# Architecture

Next.js frontend calls FastAPI. FastAPI verifies Supabase Auth JWTs, performs tenant checks, runs service workflows, stores data in Supabase Postgres through SQLAlchemy/Alembic, and calls Resend/DeepSeek from server-side service layers.
