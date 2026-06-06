# LeadFlow Pro — Implementation Roadmap

**Stack:** Next.js App Router · FastAPI · Supabase Auth + PostgreSQL + Storage · Resend · DeepSeek  
**Last updated:** 2026-06-05  
**Rule:** Every page must pull from a real API endpoint before it is considered done. No mock data in production UI.

---

## How to read this file

Each phase is a self-contained unit of work. Complete one phase fully before starting the next.  
Each task shows: what currently exists → what needs to change → which backend endpoint is needed.

---

## Current Honest State: Page by Page

### Pages that are CLEAN (real data, no mocks)
| Page | Route | Status |
|---|---|---|
| Admin — Business List | `/admin/businesses` | ✅ Real |
| Admin — Create Business | `/admin/businesses/new` | ✅ Real |
| Admin — Edit Business | `/admin/businesses/[id]/edit` | ✅ Real |
| Owner — Leads List | `/dashboard/leads` | ✅ Real |
| Owner — Form Link | `/dashboard/form-link` | ✅ Real |
| Owner — Settings | `/dashboard/settings` | ✅ Real (save wired) |
| Owner — Dashboard Overview | `/dashboard` | ✅ Mostly real (chart is mock) |
| Public Form | `/forms/[slug]` | ✅ Real (services list is generic) |

### Pages that are DIRTY (mock data, needs cleaning)
| Page | Route | What is mock |
|---|---|---|
| Admin — Overview | `/admin` | Everything: KPI numbers, businesses list, activity feed, chart |
| Admin — Audit Logs | `/admin/audit` | Everything: AUDIT from mock.ts |
| Owner — Messages | `/dashboard/messages` | Everything: CONVERSATIONS from mock.ts |
| Owner — Follow-ups | `/dashboard/follow-ups` | Everything: FOLLOWUPS from mock.ts |
| Owner — Dashboard chart | `/dashboard` | LEAD_VOLUME from mock.ts |

### Pages that DO NOT EXIST YET
| Page | Route | What it needs |
|---|---|---|
| Lead Detail | `/dashboard/leads/[id]` | Full lead info, AI summary, message thread, send reply |

---

## Backend Endpoints: What Exists vs What's Missing

### Existing endpoints
```
Admin:
  POST   /admin/businesses                     create business + invite
  GET    /admin/businesses                     list all businesses
  GET    /admin/businesses/{id}                single business
  PATCH  /admin/businesses/{id}                update business
  POST   /admin/businesses/{id}/logo           upload logo
  POST   /admin/businesses/{id}/resend-invite  resend owner invite

Owner:
  GET    /owner/leads                          list leads
  PATCH  /owner/leads/{id}/status             update lead status
  GET    /owner/leads/{id}/messages            get messages for a lead
  GET    /owner/business                       owner's business profile
  PATCH  /owner/business                       update business profile
  GET    /owner/form                           active form slug

Public:
  GET    /public/forms/{slug}                  load form config
  POST   /public/forms/{slug}/submit           submit lead
```

### Missing endpoints (need to be built)
```
Owner:
  GET    /owner/leads/{id}                     single lead detail + AI summary
  POST   /owner/leads/{id}/messages            send a reply to a lead
  GET    /owner/metrics                        lead volume grouped by day (chart data)
  GET    /owner/followups                      list follow-ups for business
  PATCH  /owner/followups/{id}                 mark sent / reschedule / cancel

Admin:
  GET    /admin/metrics                        platform-wide KPI numbers
  GET    /admin/audit-logs                     paginated audit log list
  PATCH  /admin/businesses/{id}/status         pause / archive a business
```

---

---

# PHASE 1 — Lead Detail Page
**Goal:** Owner can click any lead and see everything about it in one place.  
**Why first:** This is the most visible gap. It also unlocks messages, AI summary, and status updates in context.

## 1A. Backend: GET /owner/leads/{id}

**File:** `backend/app/api/v1/routes/owner.py`

Add a route that returns the single lead plus its AI summary if one exists:

```python
@router.get('/leads/{lead_id}', response_model=APIResponse[dict])
async def lead_detail(lead_id: UUID, user: AuthUser = ..., db: AsyncSession = ...):
    bid = await business_id(db, user.id)
    lead = await db.get(Lead, lead_id)
    if not lead: raise NotFoundError('Lead not found')
    if lead.business_id != bid: raise ForbiddenError('Wrong business')
    # fetch AI output for this lead if it exists
    ai = (await db.execute(
        select(AIOutput).where(AIOutput.lead_id == lead_id)
    )).scalars().first()
    return APIResponse(data={
        'lead': LeadRead.model_validate(lead).model_dump(mode='json'),
        'ai': {
            'summary': ai.summary,
            'intent': ai.intent,
            'urgency': ai.urgency,
            'suggested_reply': ai.suggested_reply,
            'next_step': ai.next_step,
        } if ai else None
    })
```

Check what columns AIOutput actually has before writing this.

## 1B. Backend: POST /owner/leads/{id}/messages

**File:** `backend/app/api/v1/routes/owner.py`

Add a route that saves an owner reply and returns the saved message:

```python
@router.post('/leads/{lead_id}/messages', response_model=APIResponse[dict])
async def send_reply(lead_id: UUID, payload: OwnerReplyCreate, user: AuthUser = ..., db: AsyncSession = ...):
    bid = await business_id(db, user.id)
    lead = await db.get(Lead, lead_id)
    if not lead: raise NotFoundError('Lead not found')
    if lead.business_id != bid: raise ForbiddenError('Wrong business')
    msg = Message(
        lead_id=lead_id,
        business_id=bid,
        message_type='email',
        direction='outbound',
        content=payload.content,
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return APIResponse(data={'id': str(msg.id), 'content': msg.content, 'created_at': msg.created_at.isoformat()})
```

Add `OwnerReplyCreate` schema: `content: str = Field(min_length=1, max_length=5000)`.

## 1C. Frontend: /dashboard/leads/[id]/page.tsx

**Create new file:** `frontend/app/(owner)/dashboard/leads/[id]/page.tsx`

This page has three sections:

**Left column — Lead Info**
- Customer name, email, phone, service needed, preferred time, message (from lead)
- Status badge + dropdown to change status (calls PATCH /owner/leads/{id}/status)
- Created date / source

**Center column — Messages Thread**
- Fetch `GET /owner/leads/{id}/messages` on load
- Render messages: customer = left bubble, owner/system = right bubble
- Composer at bottom with Send button → `POST /owner/leads/{id}/messages`
- Optimistically append the new message to the list on send

**Right column — AI Summary**
- If `ai` is not null: show summary, intent badge, urgency badge, suggested reply
- If `ai` is null: show a placeholder "AI summary not yet generated" message
- "Use Suggestion" button pre-fills the composer with `suggested_reply`

**Back button** navigates to `/dashboard/leads`

## 1D. Frontend: Wire "Open Lead" in leads list

**File:** `frontend/app/(owner)/dashboard/leads/page.tsx`

Currently clicking a lead row does nothing. Change the row click or add an "Open" button:
```tsx
onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
```

---

# PHASE 2 — Clean the Messages Page
**Goal:** Replace 100% mock data with real API. Reframe the page as "leads with messages" rather than a standalone chat inbox.  
**Why this approach:** The backend stores messages per-lead, not as standalone conversations. The current mock CONVERSATIONS structure doesn't match reality.

## 2A. Reframe the Messages page

**File:** `frontend/app/(owner)/dashboard/messages/page.tsx`

**Current:** Hardcoded CONVERSATIONS mock array, fake send behavior.  
**New approach:**
- On load: fetch `GET /owner/leads` filtered to leads that have at least one message
- Left panel shows these leads as "conversations" (name, last message preview, time)
- Clicking a lead loads `GET /owner/leads/{id}/messages` into the right thread panel
- Send button posts to `POST /owner/leads/{id}/messages`
- "Open Lead" button navigates to `/dashboard/leads/{id}`

This reuses the existing lead list endpoint. No new backend endpoint needed — the messages and send endpoints are built in Phase 1.

## 2B. Remove mock imports

Remove: `import { CONVERSATIONS } from '@/lib/data/mock'`  
State becomes:
- `leads: LeadRead[]` — fetched from API
- `selectedLeadId: string | null`
- `messages: MessageItem[]` — fetched when lead is selected
- `draft: string`
- `sending: boolean`

---

# PHASE 3 — Owner Dashboard Chart (Lead Volume)
**Goal:** Replace mock LEAD_VOLUME with real per-day lead counts.

## 3A. Backend: GET /owner/metrics

**File:** `backend/app/api/v1/routes/owner.py`

Query leads grouped by day for the last 30 days:

```python
@router.get('/metrics', response_model=APIResponse[dict])
async def owner_metrics(user: AuthUser = ..., db: AsyncSession = ...):
    bid = await business_id(db, user.id)
    # SQLAlchemy: group by date(created_at), count leads
    # return list of {label: 'Jun 1', v: 4}
```

Use SQLAlchemy `func.date()` and `func.count()`. Return last 14 days of data.

## 3B. Frontend: Wire chart in dashboard/page.tsx

**File:** `frontend/app/(owner)/dashboard/page.tsx`

- Remove `import { LEAD_VOLUME } from '@/lib/data/mock'`
- Add `const [chartData, setChartData] = useState<{label:string;v:number}[]>([])`
- In the same `useEffect` that fetches leads, also fetch `GET /owner/metrics`
- Pass `chartData` to `<AreaChart data={chartData} />`
- While loading, show empty/skeleton state

---

# PHASE 4 — Admin Overview Page
**Goal:** Replace 100% mock KPIs, business list, and activity feed with real data.

## 4A. Backend: GET /admin/metrics

**File:** `backend/app/api/v1/routes/admin.py`

Return platform-wide numbers in one call:
```json
{
  "total_businesses": 12,
  "active_businesses": 9,
  "total_leads_today": 4,
  "total_leads_this_week": 28,
  "platform_growth": [{"label": "Jun 1", "v": 3}, ...]
}
```

Query `Business`, `Lead` tables with appropriate date filters.

## 4B. Backend: PATCH /admin/businesses/{id}/status

**File:** `backend/app/api/v1/routes/admin.py`

Currently the Pause/Archive button only shows a toast. Add a proper status update:
```python
@router.patch('/businesses/{business_id}/status', response_model=APIResponse[BusinessRead])
async def set_status(business_id: UUID, payload: BusinessStatusUpdate, ...):
    # payload: { status: 'paused' | 'archived' | 'active' }
```

## 4C. Frontend: Admin Overview page

**File:** `frontend/app/(admin)/admin/page.tsx`

**Current:** BUSINESSES, ACTIVITY, PLATFORM_GROWTH all from mock.ts. KPI values hardcoded.  
**New:**
- Remove all mock imports
- Fetch `GET /admin/metrics` → populate KPI cards and chart
- Fetch `GET /admin/businesses?limit=5` → show recent businesses list (endpoint already exists)
- Wire Pause Business menu action to `PATCH /admin/businesses/{id}/status`

---

# PHASE 5 — Admin Audit Logs
**Goal:** Show real system activity instead of mock AUDIT data.

## 5A. Backend: Write to audit_logs table

**File:** `backend/app/api/v1/routes/admin.py`

Every admin action should write a row. Add a helper and call it in:
- `POST /admin/businesses` → log `business_created`
- `POST /admin/businesses/{id}/resend-invite` → log `invite_resent`
- `PATCH /admin/businesses/{id}` → log `business_updated`
- `PATCH /admin/businesses/{id}/status` → log `business_status_changed`

```python
async def log_action(db, admin_id, action, business_id=None, meta=None):
    db.add(AuditLog(
        actor_id=admin_id,
        action=action,
        business_id=business_id,
        meta=meta or {}
    ))
```

## 5B. Backend: GET /admin/audit-logs

Return paginated audit logs with actor name, action, business name, timestamp:
```python
@router.get('/audit-logs', response_model=APIResponse[list[dict]])
async def audit_logs(limit: int = 50, offset: int = 0, ...):
    ...
```

## 5C. Frontend: Admin Audit page

**File:** `frontend/app/(admin)/admin/audit/page.tsx`

- Remove `import { AUDIT } from '@/lib/data/mock'`
- Fetch `GET /admin/audit-logs` with pagination
- Filter/search client-side on returned data (or add query params to backend)

---

# PHASE 6 — Follow-ups
**Goal:** Owner can see scheduled follow-ups, send them, and reschedule.  
**Note:** This is the heaviest phase — requires the most new backend work.

## 6A. Backend: Follow-up endpoints

**File:** `backend/app/api/v1/routes/owner.py`

```
GET    /owner/followups              list follow-ups (filter by state: due/scheduled/overdue/sent)
PATCH  /owner/followups/{id}         update state (sent, cancelled, rescheduled)
POST   /owner/followups              manually create a follow-up for a lead
```

Also wire follow-up auto-creation in `LeadWorkflowService.submit()` after a lead is saved:
- Create a follow-up scheduled for +24 hours by default

## 6B. Frontend: Follow-ups page

**File:** `frontend/app/(owner)/dashboard/follow-ups/page.tsx`

- Remove `import { FOLLOWUPS } from '@/lib/data/mock'`
- Fetch `GET /owner/followups` on load, filter by tab (due/scheduled/overdue/sent)
- "Send" button → `PATCH /owner/followups/{id}` with `{ state: 'sent' }`
- "Reschedule" → show a date picker → `PATCH /owner/followups/{id}` with new `scheduled_at`
- KPI counts come from the API response counts, not hardcoded

---

# PHASE 7 — Verify AI + Email are Actually Working
**Goal:** Confirm the automation runs end-to-end after a form submission. This is not UI work — it's operational verification.

## 7A. Verify DeepSeek integration

- Submit a test lead through the public form
- Check the `ai_outputs` table in Supabase: did a row get created?
- If not: check `LeadWorkflowService.submit()` — is the AI call being awaited correctly? Are DeepSeek env vars set?
- If yes: check what columns are populated (summary, intent, urgency, suggested_reply, next_step)

## 7B. Verify Resend email delivery

- Submit a test lead
- Check Resend dashboard: did an email attempt appear?
- If not: check env var `RESEND_API_KEY` and the sending domain is verified in Resend
- Owner notification email: goes to the business `contact_email`
- Customer auto-reply: goes to `customer_email` submitted in the form

## 7C. Update Supabase auth email templates

In the Supabase dashboard → Auth → Email Templates:
- Invite email: change "Supabase" to "LeadFlow Pro"
- Magic link email: same
- Set the redirect URL in invite to `{your-domain}/auth/callback`

---

# PHASE 8 — Public Form: Per-Business Services
**Goal:** The "Service Needed" dropdown shows services relevant to each business, not a generic list.

## 8A. Backend: Add services field to Form model

Options (pick one):
- Simple: add a `services: list[str]` JSONB column to the `forms` table
- Proper: add a `form_services` table with `form_id`, `name`, `order`

Recommend the JSONB column for MVP speed.

Migration needed: `ALTER TABLE forms ADD COLUMN services JSONB DEFAULT '[]'`

## 8B. Backend: Return services in GET /public/forms/{slug}

Add `services: list[str]` to `PublicFormRead` schema. Return from the form config endpoint.

## 8C. Admin: Let admin set services when editing a business

In the Edit Business page, add a tag/multi-input field for services. Save via `PATCH /admin/businesses/{id}` → updates the form's services field.

## 8D. Frontend: Public form uses real services list

**File:** `frontend/app/forms/[slug]/page.tsx`

- Remove `import { SERVICES } from '@/lib/data/mock'`
- Use `config.services` from the API response as the Select options
- Fall back to a generic list only if `config.services` is empty

---

# Clean-up Checklist (after all phases done)

- [ ] Delete or gut `frontend/lib/data/mock.ts` — any remaining imports are a bug
- [ ] Confirm no page imports from `mock.ts`
- [ ] Confirm TypeScript passes with zero errors
- [ ] Test the full flow end-to-end:
  1. Admin creates a business → owner gets invite email
  2. Owner clicks invite link → lands on /auth/set-password → sets password → logs in
  3. Owner copies form link from dashboard
  4. Customer opens form link → fills in form → submits
  5. Lead appears in owner's leads list
  6. Owner clicks lead → sees full detail, AI summary, auto-reply message
  7. Owner sends a reply from the lead detail page
  8. Admin opens overview → sees real business count and lead stats

---

# Summary: Phase Order and Rationale

| Phase | What | Why this order |
|---|---|---|
| 1 | Lead detail page + send reply | Most visible gap; owner has nowhere to go after seeing a lead |
| 2 | Clean Messages page | Reuses Phase 1 endpoints; no extra backend work |
| 3 | Owner dashboard chart | Quick win; one new endpoint, one state swap |
| 4 | Admin overview + pause business | Admin portal should reflect real state |
| 5 | Admin audit logs | Safety/accountability; low user impact but builds trust |
| 6 | Follow-ups | Heaviest backend work; do after the core loop is solid |
| 7 | Verify AI + email | Operational; can be done anytime but confirms the automation actually runs |
| 8 | Per-business services | Polish; generic list works fine for MVP |
