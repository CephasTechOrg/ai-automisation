# AI Business Automation Platform Documentation

Working name: **ClientFlow AI**  
Purpose: A reusable multi-business automation platform that helps small businesses capture leads, respond faster, follow up automatically, and manage customer requests from one dashboard.

This documentation package defines the foundation before implementation so the system is not built on a weak structure.

## Core idea

Build **one platform** that can serve many businesses.

Each business gets:

- A public customer form link
- A business owner dashboard
- AI-generated lead summaries
- Automatic customer replies
- New-lead notifications
- Follow-up tracking
- Business settings and branding

The admin gets:

- A powerful admin portal
- Business onboarding tools
- Owner invite/login management
- Link generation
- System monitoring
- Audit logs

## Technology choices

- **Frontend/App:** Next.js
- **Authentication:** Supabase Auth
- **Database:** Supabase PostgreSQL
- **Storage:** Supabase Storage buckets
- **Email:** Resend
- **AI Provider:** DeepSeek API first, with provider abstraction so other AI models can be added later
- **Deployment:** Vercel for Next.js, Supabase for backend services

## Documents included

1. `PROJECT_DESCRIPTION.md` — product vision, target users, problem, solution, MVP scope
2. `SYSTEM_OVERVIEW.md` — simple explanation of how the whole system works
3. `ARCHITECTURE.md` — technical architecture and major system components
4. `DATABASE.md` — tables, relationships, indexes, RLS direction, schema foundation
5. `DATA_STRUCTURES.md` — core data structures, access patterns, queues, indexes, state machines, caching strategy
6. `AUTHENTICATION_AND_SECURITY.md` — Supabase Auth, admin/owner roles, RLS, server-side secrets
7. `EMAIL_AND_AI_AUTOMATION.md` — Resend email flows and DeepSeek AI integration strategy
8. `API_DESIGN.md` — recommended routes, server actions, API handlers, access rules
9. `ENVIRONMENT_VARIABLES.md` — required environment variables and secret handling
10. `FOLDER_STRUCTURE.md` — recommended Next.js project structure
11. `ADMIN_PORTAL.md` — admin portal responsibilities and workflows
12. `OWNER_DASHBOARD.md` — business owner dashboard responsibilities and workflows
13. `IMPLEMENTATION_ROADMAP.md` — two-week MVP plan and future expansion
14. `TODO.md` — practical build checklist
15. `REFERENCES.md` — official docs and implementation references

## Most important engineering principle

Every piece of business data must be connected to a `business_id`.

That means:

```text
businesses.id
  -> business_members.business_id
  -> forms.business_id
  -> leads.business_id
  -> messages.business_id
  -> follow_ups.business_id
  -> email_events.business_id
  -> ai_outputs.business_id
  -> audit_logs.business_id
```

This is what makes the system reusable, secure, and scalable.

## MVP rule

Do not start by building every feature.

Build the smallest version that can make money:

1. Admin creates a business.
2. System generates a public form link.
3. Admin invites the owner.
4. Owner logs in.
5. Customer submits the form.
6. Lead appears in owner dashboard.
7. AI summarizes the lead.
8. Resend emails the owner and customer.
9. Owner updates lead status.

Everything else can come later.
