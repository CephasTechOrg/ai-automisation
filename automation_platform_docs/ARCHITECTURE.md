# Architecture

## Architecture style

The platform should be built as a **modular multi-tenant Next.js application** using Supabase as the backend platform.

Core systems:

- Next.js application
- Supabase Auth
- Supabase PostgreSQL database
- Supabase Storage
- Resend email service
- DeepSeek AI provider
- Server-side API layer
- Admin portal
- Owner dashboard
- Public customer form

## High-level architecture

```text
Customer
  -> Public Form /forms/[slug]
  -> Next.js Server/API
  -> Supabase Database
  -> DeepSeek AI Summary
  -> Resend Customer Auto-Reply
  -> Resend Owner Notification
  -> Owner Dashboard
```

```text
Admin
  -> Admin Portal /admin
  -> Server-side Admin Actions
  -> Supabase Auth Admin API
  -> Supabase Database
  -> Supabase Storage
  -> Audit Logs
```

```text
Owner
  -> Login /login
  -> Supabase Auth
  -> Dashboard /dashboard
  -> Supabase Database with RLS
  -> Leads, Messages, Follow-ups
```

## Main components

### 1. Next.js frontend

Responsibilities:

- Render public pages
- Render admin portal
- Render owner dashboard
- Handle forms
- Display leads
- Provide protected routes
- Call server actions/API routes

Recommended app routes:

```text
/app
  /(public)
    page.tsx
    forms/[slug]/page.tsx
  /(auth)
    login/page.tsx
    accept-invite/page.tsx
  /(admin)
    admin/page.tsx
    admin/businesses/page.tsx
    admin/businesses/new/page.tsx
    admin/businesses/[id]/page.tsx
  /(dashboard)
    dashboard/page.tsx
    dashboard/leads/page.tsx
    dashboard/leads/[id]/page.tsx
    dashboard/settings/page.tsx
```

### 2. Supabase Auth

Responsibilities:

- User signup/login
- Owner invitations
- Password reset
- Session management
- User identity

User roles should be stored in app tables, not only in frontend state.

Recommended roles:

```text
super_admin
business_owner
staff
```

For MVP:

```text
super_admin
business_owner
```

### 3. Supabase Database

Responsibilities:

- Store businesses
- Store profiles
- Store business membership
- Store forms
- Store leads
- Store messages
- Store follow-ups
- Store AI outputs
- Store email events
- Store audit logs

PostgreSQL should be treated as the source of truth.

### 4. Supabase Storage

Responsibilities:

- Business logos
- Business cover images
- Public brand assets
- Later: attachments if needed

Recommended bucket:

```text
business-assets
```

Recommended object path:

```text
businesses/{business_id}/logo.png
businesses/{business_id}/cover.png
```

### 5. Resend email layer

Responsibilities:

- Customer confirmation emails
- Owner new-lead alerts
- Follow-up emails
- Admin notifications

Email sending must happen server-side only.

### 6. AI provider layer

Responsibilities:

- Generate lead summaries
- Generate suggested next action
- Generate customer-friendly reply draft
- Later: classify intent, urgency, and lead quality

The system should start with DeepSeek, but it should not be hardcoded everywhere.

Create an AI adapter interface:

```ts
interface AIProvider {
  summarizeLead(input: LeadSummaryInput): Promise<LeadSummaryOutput>;
  draftCustomerReply(input: ReplyInput): Promise<ReplyOutput>;
}
```

Then create:

```text
DeepSeekProvider
OpenAIProvider later
ClaudeProvider later
GeminiProvider later
```

This prevents vendor lock-in.

## Runtime request flows

### Public form load

```text
GET /forms/[slug]
  -> read slug
  -> query forms by slug
  -> query business by business_id
  -> render form with business branding
```

### Lead submission

```text
POST /api/forms/[slug]/submit
  -> validate payload
  -> find form by slug
  -> check form is active
  -> check business is active
  -> insert lead with business_id and form_id
  -> generate AI summary
  -> save AI output
  -> send customer auto-reply
  -> send owner notification
  -> log email events
  -> return success response
```

### Owner dashboard load

```text
GET /dashboard
  -> Supabase checks session
  -> get user_id
  -> find business_members for user_id
  -> load leads where business_id is allowed
  -> render dashboard
```

### Admin creates business

```text
POST /admin/businesses/new
  -> require super_admin role
  -> validate input
  -> generate unique slug
  -> create business
  -> create default form
  -> invite owner through server-side Supabase Admin Auth
  -> create business_members relation when owner exists or through invite acceptance flow
  -> create audit log
  -> return form link and dashboard status
```

## Server-side security boundary

The following must happen only on the server:

- Creating/inviting users
- Using Supabase service role key
- Sending Resend emails
- Calling DeepSeek API
- Creating audit logs for admin actions
- Running scheduled follow-ups
- Any operation that bypasses normal user permissions

Never expose these keys to browser code:

- Supabase service role key
- Resend API key
- DeepSeek API key

## Multi-tenant boundary

The tenant boundary is `business_id`.

Every query must respect business ownership.

Correct:

```sql
select * from leads
where business_id in (
  select business_id
  from business_members
  where user_id = auth.uid()
);
```

Wrong:

```sql
select * from leads;
```

## Scalability direction

MVP can run on Supabase + Vercel.

As the system grows, add:

- Background job queue for scheduled follow-ups
- Redis or Upstash for rate limiting and caching
- Dedicated worker for AI/email tasks
- Event-driven architecture for automation
- Usage tracking per business
- Billing integration

## Reliability direction

Important events should be recorded.

Examples:

- Lead created
- AI summary generated
- Email sent
- Email failed
- Owner invited
- Business deactivated
- Follow-up scheduled
- Follow-up sent

This makes debugging easier and protects the business.
