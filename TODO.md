# LeadFlow Pro — TODO & Current State

**Last updated:** 2026-06-06  
**Stack:** Next.js · FastAPI · Supabase · DeepSeek · Resend

---

## What is complete

Everything below is built, wired to real API endpoints, and has zero mock data.

### Owner dashboard
- [x] Overview — real KPIs, real 14-day lead volume chart
- [x] Leads — full list with comm_status chips (AI replied / Owner replied / Acknowledged / New); slide-in detail panel with AI tab, Messages tab, Overview tab, Timeline tab
- [x] Leads — auto-marks lead as "contacted" when owner opens it (PATCH to DB, not just local state)
- [x] Leads — message thread shows customer bubble, owner bubble, AI auto-reply banner (green), acknowledgement banner (green, different label), follow-up banner (gray); ai_draft is filtered out and shown as amber draft card above composer
- [x] Messages — real lead-based thread view; loads from `/owner/leads` + `/owner/leads/{id}/messages`; sends via `/owner/leads/{id}/messages`; comm_status icons in lead list
- [x] My Form — full editor: form URL slug (with slug uniqueness check + broken-link warning), title, description, success message, services tag editor; live iframe preview of actual public form; real QR code from api.qrserver.com; Copy link box
- [x] Follow-ups — real list from API; send/reschedule/cancel actions wired
- [x] Settings — business profile, brand colour, contact info; all saves wired

### Admin portal
- [x] Overview — real platform KPIs, real recent businesses table, status management
- [x] Businesses — list with search/filter/pagination; pause/archive/activate from menu
- [x] Create Business — full multi-step form; auto-reply and approval toggles wired to API on submit
- [x] Edit Business — all fields, logo upload to Supabase Storage, services, status change
- [x] Owners — all owner accounts with business info; resend invite, copy email
- [x] Leads — cross-business lead list; filter by business/status/search; real CSV export
- [x] Automations — per-business toggle table: Smart Auto-Reply + Owner Approval Required; saves instantly via PATCH
- [x] Emails — Resend delivery log; filter by status; delivery rate stat; real CSV export
- [x] Audit Logs — full system event log; filter by business/action/search; real CSV export
- [x] Settings — platform health (API key status), service config, all-time stats, quick links

### Public form
- [x] Branded with business name, logo, colour
- [x] Service Needed: dropdown if services configured, free text otherwise
- [x] Immediate email reply to customer on submission (personalized AI or generic ack)
- [x] Success screen with next-steps card

### Backend / AI / Email
- [x] Full AI workflow: DeepSeek analyses lead → `suggested_reply`, `risk_level`, `confidence_score`, `blocked_topics`, `auto_send_allowed`
- [x] Safety gate (4 checks): `smart_auto_reply`, `!owner_approval_required`, `status==active`, `auto_send_allowed`
- [x] AI prompt instructs model to evaluate whether the **reply** makes risky commitments (not just whether the customer mentioned certain topics) — prevents over-blocking
- [x] Generic acknowledgement stored as message record in thread (was previously invisible to owner)
- [x] Email sender uses business name as display name: `"Clean Pro Services" <noreply@domain.com>`
- [x] `comm_status` correctly distinguishes `ai_replied` (subject starts "Re:") vs `acknowledged` (subject starts "We received") vs `owner_replied` vs `new`
- [x] Message thread returns `subject` field so frontend can show correct label per message
- [x] All 6 new admin endpoints: owners, cross-business leads, automations GET/PATCH, emails, settings
- [x] CSV export on audit logs, admin leads, admin emails (real browser download, not toast stub)
- [x] Mock import removed from `admin/businesses/page.tsx`

---

## What is NOT done (remaining work)

### High priority

**Supabase auth email branding**
- Invite emails and magic-link emails still show "Supabase" branding
- Fix: Supabase dashboard → Authentication → Email Templates
- Update invite email subject and body to say "LeadFlow Pro"
- Set redirect URL to `{your-domain}/auth/callback`

**Automated follow-up cron job**
- Follow-up records are created in DB (+24h after lead submission)
- But nothing auto-sends them — they stay in "scheduled" state forever
- Fix: add a background scheduler (APScheduler inside FastAPI, or Render Cron Job) that runs every hour, finds `FollowUp` records where `scheduled_at <= now()` and `status == scheduled`, sends the email, marks them `sent`

### Medium priority

**Owner — approve & send AI draft**
- The AI draft is shown in the Messages tab above the composer
- Owner can click "Approve & Send" to send the AI-drafted reply
- This endpoint (`POST /owner/leads/{id}/approve-ai-reply`) needs to be wired end-to-end and tested with a real lead that was blocked by the safety gate

**Admin — deactivate owner account**
- Owners page shows all accounts but "deactivate" does nothing (no endpoint)
- Would need: `PATCH /admin/owners/{id}/status` → sets `BusinessMember.is_active = False` and potentially suspends Supabase user

### Low priority / future phases

| Feature | Phase | Notes |
|---|---|---|
| SMS notifications to customer | 3 | Twilio integration |
| SMS notifications to owner | 3 | New lead alert by text |
| Staff role invite flow | 3 | DB supports it (`BusinessMember.role=staff`) but no UI to invite staff |
| Team member management | 3 | Owner can add/remove staff, set permissions |
| Subscription / billing | 4 | Stripe integration, plan limits (lead count, AI calls) |
| CRM integrations | 4 | HubSpot, Salesforce webhook export |
| Advanced analytics | 4 | Conversion rate, average response time, follow-up effectiveness |
| Custom form fields | 4 | Owner can add/remove form fields beyond the 7 default ones |
| White-label domain | 4 | Each business gets their own subdomain for forms |

---

## Architecture decisions that matter

### Safety gate logic
The gate is intentionally simple. The AI's `auto_send_allowed` field is the single source of truth for whether the reply is safe. The gate does NOT re-evaluate `risk_level` or `blocked_topics` separately — that was causing over-blocking (e.g. customer saying "tomorrow" triggered `booking_confirmation` even when the reply made no such promise).

### Auto-reply vs acknowledgement — same DB type
Both are stored as `MessageType.AUTO_REPLY`. They're distinguished by subject prefix:
- Personalized: subject starts with `Re:`
- Generic ack: subject starts with `We received your request`

This avoids needing a DB migration for a new enum value. If this distinction gets complex later, add `MessageType.ACKNOWLEDGEMENT` with an Alembic migration.

### Public form routing
`/forms/[slug]` is outside `(owner)` route group → uses root layout only → no dashboard shell. Middleware correctly exempts `/forms` from auth redirect. Never use `router.push('/forms/...')` from within the dashboard — always use `window.open(url, '_blank')` or `<a target="_blank">`.

### Email from-name
`_build_from(display_name)` extracts the email address from `RESEND_FROM_EMAIL` and builds `"Business Name" <addr@domain>`. The domain must remain the Resend-verified domain. Only the display name changes.

---

## End-to-end happy path (for testing or handoff)

1. Admin logs in → `/admin` → "Add Business" → fills form → submits → owner gets invite email
2. Owner clicks invite link → `/auth/set-password` → sets password → redirected to `/dashboard`
3. Owner goes to "My Form" → sees form URL → copies it (or clicks "Open Form ↗")
4. Customer opens `https://yourdomain.com/forms/your-biz` → fills form → submits
5. Customer receives email from `"Your Business Name" <noreply@yourdomain.com>`
6. Owner dashboard → Leads → sees new lead with comm_status chip (green = AI replied, amber = ack)
7. Owner clicks lead → sees message thread: customer message + AI banner; AI tab shows suggested reply
8. Owner types a reply → Send → customer gets email from business name
9. Admin → Emails → sees delivery log with all sent emails
10. Admin → Automations → toggles Smart Auto-Reply on/off per business instantly
