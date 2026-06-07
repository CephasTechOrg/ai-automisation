# LeadFlow Pro

AI-powered lead automation platform for small businesses. Each business gets a branded public form, AI lead summaries, automatic email replies, and a full owner dashboard — all on a single multi-tenant platform.

## What it does

```
Admin creates business → owner gets invite email
Customer submits public form → lead saved → AI analyses → email sent to customer (from business name)
Owner logs in → sees leads + AI summaries → replies → follows up
Admin monitors → full audit trail, email logs, automation controls
```

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router, `'use client'`) |
| Backend | FastAPI · Python 3.11 · asyncpg |
| Auth | Supabase Auth (ES256 JWT) |
| Database | Supabase PostgreSQL · SQLAlchemy 2.x async |
| Storage | Supabase Storage (business logos) |
| Email | Resend (branded with business name as sender) |
| AI | DeepSeek (`deepseek-v4-flash`) |

## Project structure

```
ai-automation/
├── backend/
│   ├── app/
│   │   ├── api/v1/routes/
│   │   │   ├── admin.py          # All /admin/* endpoints
│   │   │   ├── owner.py          # All /owner/* endpoints
│   │   │   └── public.py         # /public/forms/* (no auth)
│   │   ├── models/
│   │   │   ├── domain.py         # All SQLAlchemy ORM models
│   │   │   └── enums.py          # All StrEnum definitions
│   │   ├── schemas/              # Pydantic request/response models
│   │   ├── services/
│   │   │   └── core_services.py  # EmailService, DeepSeekService, LeadWorkflowService, BusinessService
│   │   └── core/
│   │       ├── config.py         # Settings (env vars)
│   │       ├── database.py       # Async DB session
│   │       ├── security.py       # JWT auth, role guards
│   │       └── errors.py         # Custom exception types
│   ├── alembic/                  # DB migrations
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── (owner)/dashboard/    # All owner pages (protected)
│   │   ├── (admin)/admin/        # All admin pages (protected, super_admin only)
│   │   ├── (auth)/login/         # Login page
│   │   └── forms/[slug]/         # Public customer form (no auth)
│   ├── components/
│   │   ├── ui/                   # Shared UI components
│   │   └── shell/                # Sidebar, AppShell
│   ├── lib/
│   │   ├── api/client.ts         # Typed API fetch wrapper
│   │   └── hooks/                # useApiToken, useIsMobile
│   └── middleware.ts             # Auth redirect (exempts /forms, /login, /auth)
└── automation_platform_docs/     # Architecture reference docs
```

## Tenant boundary

`business_id` is the isolation key for everything. Every lead, message, form, follow-up, email event, AI output, and audit log is scoped to a `business_id`. The backend enforces this on every request — the frontend never decides what data a user can see.

## Three entry points

| URL | Who | Auth |
|---|---|---|
| `/admin` | Platform super-admin | Supabase JWT, `role=super_admin` |
| `/dashboard` | Business owner | Supabase JWT, `role=business_owner` |
| `/forms/[slug]` | Customer | None — fully public |

---

## Current Feature State (as of 2026-06-06)

### Owner Dashboard — all pages complete

| Page | Route | Notes |
|---|---|---|
| Overview | `/dashboard` | Real KPIs, real lead volume chart (14 days) |
| Leads | `/dashboard/leads` | List + slide-in detail panel: AI tab, Messages tab, Overview tab, Timeline tab |
| Messages | `/dashboard/messages` | Lead-based thread view; real sends via API |
| My Form | `/dashboard/form` | Full editor: URL slug, title, description, services, live iframe preview, real QR code |
| Follow-ups | `/dashboard/follow-ups` | List of scheduled/sent/overdue follow-ups with send + reschedule actions |
| Settings | `/dashboard/settings` | Business profile, branding, contact info |

### Admin Portal — all pages complete

| Page | Route | Notes |
|---|---|---|
| Overview | `/admin` | Real platform KPIs, recent businesses table, quick actions |
| Businesses | `/admin/businesses` | List with search/filter, pagination, status management |
| Create Business | `/admin/businesses/new` | Full form: business info + owner invite + automation toggles |
| Edit Business | `/admin/businesses/[id]/edit` | Edit all fields, logo upload, services, status |
| Owners | `/admin/owners` | All business owner accounts; resend invite, copy email |
| Leads | `/admin/leads` | Cross-business lead list; filterable by business/status; CSV export |
| Automations | `/admin/automations` | Per-business toggle: Smart Auto-Reply, Owner Approval Required |
| Emails | `/admin/emails` | Full Resend email delivery log; sent/failed/queued; CSV export |
| Audit Logs | `/admin/audit` | Full system event log; searchable + filterable; real CSV export |
| Settings | `/admin/settings` | Platform health: API key status, AI config, all-time stats |

### Public Form — complete

- Branded with business name, logo, brand colour
- Service Needed field: dropdown if services configured, free text otherwise
- AI auto-reply or generic acknowledgement sent immediately on submission
- Success state with "what happens next" steps

---

## AI Auto-Reply System

When a customer submits a form:

1. **Lead is created** in the DB, customer message stored
2. **DeepSeek analyses** the lead and returns JSON with: `summary`, `urgency`, `intent`, `suggested_reply`, `tags`, `risk_level`, `confidence_score`, `blocked_topics`, `auto_send_allowed`
3. **AI draft stored** as internal `ai_draft` message (never shown to customer)
4. **Safety gate** runs four checks:
   - `business.smart_auto_reply == True`
   - `business.owner_approval_required == False`
   - `business.status == active`
   - `ai.auto_send_allowed == True`
5. **If gate passes** → personalized AI reply emailed to customer; stored as `auto_reply` message (subject: `Re: ...`)
6. **If gate fails** → generic acknowledgement emailed to customer; stored as `auto_reply` message (subject: `We received your request — ...`)
7. **Owner alert** always sent to `business.contact_email`
8. **Follow-up scheduled** for +24 hours

### Distinguishing AI reply vs acknowledgement

Both are stored as `MessageType.AUTO_REPLY` records. The subject prefix distinguishes them:
- `Re: ...` → personalized AI reply (`comm_status = ai_replied`)
- `We received your request — ...` → generic ack (`comm_status = acknowledged`)

The frontend thread and the comm_status chip on the lead card both reflect this correctly.

### Email sender branding

All customer-facing emails use the business name as the display name:
```
"Clean Pro Services" <noreply@yourdomain.com>
```
The verified Resend sending domain never changes — only the display name is swapped per business.

---

## Database Models

| Model | Table | Key fields |
|---|---|---|
| `Profile` | `profiles` | `id`, `email`, `full_name`, `role` (super_admin/business_owner/staff) |
| `Business` | `businesses` | `id`, `name`, `slug`, `status`, `smart_auto_reply`, `owner_approval_required`, `brand_color` |
| `BusinessMember` | `business_members` | `business_id`, `user_id`, `role` (owner/staff), `is_active` |
| `Form` | `forms` | `business_id`, `slug` (unique), `title`, `description`, `services` (JSONB), `is_active` |
| `Lead` | `leads` | `business_id`, `customer_name/email/phone`, `service_needed`, `status`, `source` |
| `Message` | `messages` | `lead_id`, `message_type` (customer_message/auto_reply/ai_draft/owner_reply/follow_up), `direction`, `content`, `subject` |
| `FollowUp` | `follow_ups` | `lead_id`, `scheduled_at`, `status` (scheduled/sent/canceled/failed) |
| `EmailEvent` | `email_events` | `to_email`, `subject`, `status` (queued/sent/failed), `provider_message_id` |
| `AIOutput` | `ai_outputs` | `lead_id`, `model`, `structured_output` (full JSON from DeepSeek) |
| `AuditLog` | `audit_logs` | `actor_user_id`, `business_id`, `action`, `details` (JSON) |

---

## API Endpoints

### Public (no auth)
```
GET   /public/forms/{slug}          load public form config
POST  /public/forms/{slug}/submit   submit a lead (triggers full AI + email workflow)
```

### Owner (`require_owner_or_staff`)
```
GET   /owner/leads                  list leads with comm_status per lead
GET   /owner/leads/{id}             lead detail + AI output + auto_sent flag
GET   /owner/leads/{id}/messages    message thread (excludes ai_draft from visual; includes subject)
POST  /owner/leads/{id}/messages    send owner reply (emails customer, stored in DB)
PATCH /owner/leads/{id}/status      update lead status
GET   /owner/followups              list follow-ups
PATCH /owner/followups/{id}         update follow-up (send/reschedule/cancel)
GET   /owner/business               owner's business profile
PATCH /owner/business               update business profile
GET   /owner/form                   form config
PATCH /owner/form                   update form (slug uniqueness checked, 409 if taken)
GET   /owner/metrics                lead volume by day (last 14 days)
```

### Admin (`require_super_admin`)
```
GET   /admin/metrics                platform KPIs + 14-day chart
GET   /admin/businesses             list all businesses
POST  /admin/businesses             create business + invite owner
GET   /admin/businesses/{id}        single business
PATCH /admin/businesses/{id}        update business
POST  /admin/businesses/{id}/logo   upload logo to Supabase Storage
PATCH /admin/businesses/{id}/status pause / activate / archive
POST  /admin/businesses/{id}/resend-invite  resend owner invite email
GET   /admin/businesses/{id}/form   get business form config
PATCH /admin/businesses/{id}/form   update business form config
GET   /admin/owners                 list all owner accounts with business info
GET   /admin/leads                  cross-business lead list (filter by business_id, status)
GET   /admin/automations            per-business automation config
PATCH /admin/automations/{id}       toggle smart_auto_reply / owner_approval_required
GET   /admin/emails                 email delivery log (filter by status)
GET   /admin/settings               platform health + system stats
GET   /admin/audit-logs             paginated system event log
```

---

## Getting started

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # fill in all values
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Interactive API docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local  # fill in all values
npm run dev                        # runs on http://localhost:3000
```

### Required environment variables

**Backend `.env`:**
```
DATABASE_URL=postgresql+asyncpg://...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_JWKS_URL=https://xxx.supabase.co/auth/v1/.well-known/jwks.json
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=LeadFlow Pro <noreply@yourdomain.com>
DEEPSEEK_API_KEY=sk-...
FRONTEND_URL=http://localhost:3000
```

**Frontend `.env.local`:**
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## Test credentials (local dev)

| Role | Email | Password |
|---|---|---|
| Super Admin | cephas.bonsuosei@gmail.com | AdminTest@2026 |
| Business Owner | cephasbonsuosei003@gmail.com | TestOwner@123 |

---

## Known gaps / future work

| Item | Priority | Notes |
|---|---|---|
| Supabase auth email branding | Medium | Invite + magic-link emails still show "Supabase" — fix in Supabase dashboard → Auth → Email Templates |
| Automated follow-up cron | Medium | Follow-ups are created in DB but not auto-sent — needs a background job (APScheduler or Render cron) |
| SMS notifications | Low | Twilio integration planned for Phase 3 |
| Team accounts (staff role) | Low | `BusinessMember.role=staff` exists in DB but staff invite flow not built |
| CRM integrations | Low | Planned for Phase 4 |
| Subscription / billing | Low | Planned for Phase 4 |
