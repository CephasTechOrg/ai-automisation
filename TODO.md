# TODO.md — Backend Completion Tracker

Project: LeadFlow Pro / AI Lead Automation Platform  
Stack: Next.js App Router, Supabase Auth, Supabase PostgreSQL, Supabase Storage, Resend, DeepSeek AI  
Focus: Backend foundation, data quality, tenant isolation, automation reliability, and production readiness

---

## Status Legend

- `[x]` Completed in the current backend starter foundation
- `[~]` Partially completed; foundation exists but needs more implementation
- `[ ]` Still needs to be built
- `~~Canceled / Deferred~~` Not part of the MVP right now

---

# 1. Core Backend Foundation

- [x] Create Next.js backend starter structure using App Router API routes
- [x] Add clean backend folder organization
- [x] Add service-layer architecture
- [x] Add reusable API response helpers
- [x] Add reusable error handling foundation
- [x] Add environment variable example file
- [x] Add health check endpoint
- [x] Add backend README/setup guidance
- [x] Add Supabase client helpers
- [x] Add Supabase server-side auth foundation
- [x] Add Supabase admin client foundation for privileged server-only operations
- [x] Keep secret keys server-side only
- [x] Separate public routes, owner dashboard routes, and admin routes

---

# 2. Multi-Tenant System Foundation

- [x] Define `business_id` as the tenant boundary
- [x] Create database foundation around businesses, users, members, forms, leads, messages, follow-ups, emails, AI outputs, and audit logs
- [x] Connect leads to `business_id`
- [x] Connect forms to `business_id`
- [x] Connect messages to `business_id`
- [x] Connect follow-ups to `business_id`
- [x] Connect audit logs to `business_id`
- [x] Add business slug strategy for reusable public form links
- [x] Add admin-created business onboarding flow foundation
- [x] Add owner-to-business relationship using `business_members`
- [~] Support multiple owners/staff per business
- [ ] Add staff invitation flow
- [ ] Add business-level permissions beyond owner/admin
- [ ] Add business switching for users who manage multiple businesses

---

# 3. Supabase Authentication

- [x] Use Supabase Auth as the identity provider
- [x] Add profile table concept linked to Supabase Auth users
- [x] Add role system foundation: `super_admin`, `business_owner`, `staff`
- [x] Add admin-only route protection foundation
- [x] Add owner dashboard route protection foundation
- [x] Add backend helper to get authenticated user
- [x] Add backend helper to check admin role
- [x] Add backend helper to check business membership
- [~] Owner invitation flow foundation
- [ ] Implement full Supabase invite email flow in live project
- [ ] Implement login callback handling with production redirect URLs
- [ ] Implement password reset flow
- [ ] Implement magic-link login flow
- [ ] Add session refresh testing
- [ ] Add account deactivation handling
- [ ] Add staff role login behavior

---

# 4. Database Schema

- [x] Create initial SQL migration foundation
- [x] Add `profiles` table
- [x] Add `businesses` table
- [x] Add `business_members` table
- [x] Add `forms` table
- [x] Add `form_fields` table foundation
- [x] Add `leads` table
- [x] Add `messages` table
- [x] Add `follow_ups` table
- [x] Add `email_events` table
- [x] Add `ai_outputs` table
- [x] Add `audit_logs` table
- [x] Add timestamps
- [x] Add status enums/foundations
- [x] Add indexes for important query paths
- [~] Add complete foreign key constraints
- [~] Add complete check constraints
- [ ] Add database triggers for `updated_at`
- [ ] Add database views for dashboard metrics
- [ ] Add database functions for tenant checks
- [ ] Add seed data for realistic testing
- [ ] Add migration rollback strategy
- [ ] Add schema versioning notes

---

# 5. Row Level Security and Data Protection

- [x] Enable RLS-ready design
- [x] Design tenant isolation around `business_id`
- [x] Add RLS policy foundation
- [x] Admin can access all businesses conceptually
- [x] Owner can access only businesses they belong to conceptually
- [x] Public users can submit forms without logging in conceptually
- [~] Complete RLS policies for all tables
- [ ] Test RLS policies against a real Supabase project
- [ ] Add RLS policies for Supabase Storage
- [ ] Add RLS tests for owner isolation
- [ ] Add RLS tests for admin access
- [ ] Add RLS tests for public form submission
- [ ] Add security test cases for cross-business data leakage
- [ ] Add audit log events for sensitive reads/writes

---

# 6. Admin Backend

- [x] Add admin businesses route foundation
- [x] Add create business API foundation
- [x] Add business slug generation logic
- [x] Add owner invite/onboarding concept
- [x] Add audit logging for admin actions foundation
- [x] Add admin role guard foundation
- [~] Add full admin business management endpoints
- [ ] Implement list businesses with pagination
- [ ] Implement search businesses
- [ ] Implement filter businesses by status/industry/plan
- [ ] Implement get single business details
- [ ] Implement update business details
- [ ] Implement pause/deactivate business
- [ ] Implement resend owner invite
- [ ] Implement transfer business ownership
- [ ] Implement admin dashboard metrics endpoint
- [ ] Implement admin recent activity endpoint
- [ ] Implement admin audit logs endpoint
- [ ] Add admin action rate limits

---

# 7. Owner Dashboard Backend

- [x] Add owner dashboard business route foundation
- [x] Add owner leads route foundation
- [x] Add business membership guard foundation
- [x] Ensure dashboard data is loaded from authenticated user membership, not from frontend trust
- [~] Add lead listing endpoint
- [~] Add lead status update foundation
- [ ] Implement dashboard overview metrics endpoint
- [ ] Implement recent leads endpoint
- [ ] Implement lead volume chart endpoint
- [ ] Implement AI insights endpoint
- [ ] Implement get single lead detail endpoint
- [ ] Implement update lead status endpoint fully
- [ ] Implement add note to lead
- [ ] Implement assign lead to owner/staff
- [ ] Implement owner settings endpoint
- [ ] Implement form management endpoint
- [ ] Implement public form link copy tracking
- [ ] Implement owner activity timeline endpoint

---

# 8. Public Form Backend

- [x] Add public form route foundation
- [x] Add dynamic form loading by slug foundation
- [x] Add public lead submission foundation
- [x] Connect submitted lead to `business_id`
- [x] Add lead validation foundation
- [x] Add business lookup by slug
- [x] Add AI summary call after lead submission foundation
- [x] Add Resend email notification foundation
- [~] Add custom form fields foundation
- [ ] Implement full custom field validation
- [ ] Implement spam protection
- [ ] Implement CAPTCHA or Turnstile
- [ ] Implement public form rate limiting by IP
- [ ] Implement duplicate lead detection
- [ ] Implement submit success email
- [ ] Implement form inactive/paused state
- [ ] Implement business paused state
- [ ] Implement public form analytics events
- [ ] Implement file attachment support if needed

---

# 9. Messages and Communication Backend

## Recommended Message Logic

The system should support both automation and human review.

Automatic:
- Send a safe acknowledgement email immediately after form submission.
- Optionally send scheduled follow-up emails when enabled.
- Store all automated messages in the `messages` table.

Owner-controlled:
- Owner can see all messages connected to each lead.
- AI can draft suggested replies.
- Owner can edit, approve, copy, or send the suggested reply.
- Owner can manually send follow-up messages.

- [x] Add `messages` table foundation
- [x] Add direction concept: inbound/outbound
- [x] Add message channel concept: email, form, system
- [x] Add email event tracking foundation
- [~] Add auto-reply email service foundation
- [~] Add owner notification email foundation
- [ ] Implement full message thread endpoint
- [ ] Implement owner manual reply endpoint
- [ ] Implement AI suggested reply endpoint
- [ ] Implement send suggested reply endpoint
- [ ] Implement message status tracking: queued, sent, failed, opened, clicked
- [ ] Implement inbound email parsing later
- [ ] Implement reply-to lead email routing later
- [ ] Implement message timeline view data endpoint
- [ ] Implement email failure retry
- [ ] Implement unsubscribe/compliance footer for marketing-style emails
- [ ] Implement email template variables
- [ ] Implement owner notification preferences

~~Canceled / Deferred for MVP: full two-way live chat~~  
~~Canceled / Deferred for MVP: Instagram DM integration~~  
~~Canceled / Deferred for MVP: WhatsApp Business API integration~~  
~~Canceled / Deferred for MVP: SMS messaging with Twilio~~

---

# 10. AI Automation Backend

- [x] Add DeepSeek AI service foundation
- [x] Add structured lead summary prompt foundation
- [x] Add AI output storage table foundation
- [x] Add AI summary fields concept: summary, urgency, intent, suggested reply, next step
- [~] Add AI call after public form submission
- [ ] Implement robust JSON parsing for AI responses
- [ ] Add AI timeout handling
- [ ] Add AI retry strategy
- [ ] Add fallback summary if AI fails
- [ ] Add prompt versioning
- [ ] Add AI output cost/usage tracking
- [ ] Add AI safety rules for customer replies
- [ ] Add owner approval mode for AI replies
- [ ] Add auto-send toggle per business
- [ ] Add AI insights endpoint for dashboard
- [ ] Add lead scoring algorithm
- [ ] Add urgency classifier
- [ ] Add intent classifier
- [ ] Add suggested next best action logic
- [ ] Add model provider abstraction to switch from DeepSeek to another model later

---

# 11. Follow-Up Automation Backend

- [x] Add follow-ups table foundation
- [x] Add follow-up concept tied to business and lead
- [~] Add scheduled follow-up foundation
- [ ] Implement follow-up creation after lead submission
- [ ] Implement follow-up scheduler
- [ ] Implement cron job or background job route
- [ ] Implement send due follow-ups
- [ ] Implement follow-up retry on failure
- [ ] Implement cancel follow-up when lead is booked/lost
- [ ] Implement reschedule follow-up
- [ ] Implement mark follow-up complete
- [ ] Implement follow-up analytics
- [ ] Implement business-level follow-up settings
- [ ] Implement owner manual approval before follow-up if enabled

---

# 12. Email Backend with Resend

- [x] Add Resend client foundation
- [x] Keep Resend API key server-side
- [x] Add owner new-lead notification email foundation
- [x] Add customer auto-reply email foundation
- [x] Add email event table foundation
- [~] Add email sending service layer
- [ ] Verify sending domain in Resend
- [ ] Implement production email templates
- [ ] Implement branded business email templates
- [ ] Implement template variables
- [ ] Implement email status tracking
- [ ] Implement failed email retry
- [ ] Implement admin email logs
- [ ] Implement email rate limiting
- [ ] Add support for different sender names per business
- [ ] Add reply-to configuration
- [ ] Add resend invite email endpoint
- [ ] Add follow-up email template

---

# 13. Storage Backend

- [x] Add Supabase Storage concept for business assets
- [x] Define bucket idea: `business-assets`
- [x] Define path strategy: `businesses/{business_id}/logo.png`
- [~] Add logo upload concept
- [ ] Create actual Supabase bucket
- [ ] Add storage upload endpoint
- [ ] Add storage delete/replace endpoint
- [ ] Add file size validation
- [ ] Add file type validation
- [ ] Add public/private bucket decision
- [ ] Add storage RLS policies
- [ ] Add business logo update flow
- [ ] Add signed URL support if private assets are used

---

# 14. Validation and Data Quality

- [x] Add Zod validation foundation
- [x] Add request schema patterns
- [x] Add slug validation foundation
- [x] Add email validation foundation
- [x] Add phone field foundation
- [~] Add complete schemas for all endpoints
- [ ] Add custom validation errors
- [ ] Add normalized phone number handling
- [ ] Add normalized email lowercase handling
- [ ] Add sanitized text fields
- [ ] Add max length limits everywhere
- [ ] Add form field validation engine
- [ ] Add duplicate slug handling
- [ ] Add duplicate owner invite handling
- [ ] Add duplicate lead detection
- [ ] Add safe HTML/email escaping
- [ ] Add strict enum validation for statuses

---

# 15. Rate Limiting and Abuse Protection

- [x] Add rate limiting foundation
- [~] Add public form submission rate limit concept
- [ ] Implement persistent rate limiter
- [ ] Add IP-based rate limit for public forms
- [ ] Add user-based rate limit for dashboard actions
- [ ] Add admin action rate limit
- [ ] Add AI generation rate limit
- [ ] Add email sending rate limit
- [ ] Add spam detection
- [ ] Add bot protection
- [ ] Add request logging for abuse monitoring

---

# 16. Audit Logging

- [x] Add audit logs table foundation
- [x] Add audit logging concept
- [x] Add audit logs for admin action foundation
- [~] Add reusable audit log service
- [ ] Log business created
- [ ] Log business updated
- [ ] Log owner invited
- [ ] Log invite resent
- [ ] Log business paused/deactivated
- [ ] Log lead status changed
- [ ] Log email sent
- [ ] Log AI summary generated
- [ ] Log settings changed
- [ ] Add audit logs API endpoint
- [ ] Add filters for audit logs
- [ ] Add retention policy

---

# 17. API Design

- [x] Add API route foundation
- [x] Add clean route grouping
- [x] Add admin route pattern
- [x] Add dashboard route pattern
- [x] Add public form route pattern
- [x] Add health route
- [~] Add REST endpoint coverage
- [ ] Implement full admin API coverage
- [ ] Implement full owner dashboard API coverage
- [ ] Implement full form management API coverage
- [ ] Implement full message API coverage
- [ ] Implement full follow-up API coverage
- [ ] Add OpenAPI-style documentation
- [ ] Add request/response examples
- [ ] Add error code reference
- [ ] Add pagination helpers
- [ ] Add sorting helpers
- [ ] Add filtering helpers

---

# 18. Testing

- [ ] Add unit tests for utility functions
- [ ] Add unit tests for slug generation
- [ ] Add unit tests for validation schemas
- [ ] Add unit tests for tenant guard logic
- [ ] Add integration tests for public form submission
- [ ] Add integration tests for owner dashboard access
- [ ] Add integration tests for admin business creation
- [ ] Add integration tests for RLS policies
- [ ] Add mocked tests for Resend
- [ ] Add mocked tests for DeepSeek
- [ ] Add end-to-end test for full flow:
  - admin creates business
  - owner invited
  - customer submits form
  - lead appears in dashboard
  - emails are sent
  - AI summary is created

---

# 19. Observability and Production Readiness

- [ ] Add structured logging
- [ ] Add request IDs
- [ ] Add error tracking
- [ ] Add admin system health endpoint
- [ ] Add email delivery monitoring
- [ ] Add AI failure monitoring
- [ ] Add database performance monitoring
- [ ] Add slow query checks
- [ ] Add usage metrics
- [ ] Add plan/limit monitoring
- [ ] Add backup strategy
- [ ] Add environment-specific config
- [ ] Add deployment checklist
- [ ] Add production security checklist

---

# 20. Billing and Plans

~~Canceled / Deferred for MVP: Stripe billing~~  
~~Canceled / Deferred for MVP: automated subscription enforcement~~  
~~Canceled / Deferred for MVP: usage-based billing~~  
~~Canceled / Deferred for MVP: invoices and payment receipts~~

Future tasks:
- [ ] Add plans table
- [ ] Add usage limits per business
- [ ] Add lead usage tracking
- [ ] Add AI usage tracking
- [ ] Add email usage tracking
- [ ] Add billing status to admin portal
- [ ] Add Stripe integration later

---

# 21. Integrations

~~Canceled / Deferred for MVP: HubSpot integration~~  
~~Canceled / Deferred for MVP: Salesforce integration~~  
~~Canceled / Deferred for MVP: Zapier integration~~  
~~Canceled / Deferred for MVP: Google Calendar integration~~  
~~Canceled / Deferred for MVP: WhatsApp Business API~~  
~~Canceled / Deferred for MVP: Instagram/Facebook DM integration~~

Future tasks:
- [ ] Add webhook foundation
- [ ] Add outbound webhook events
- [ ] Add inbound webhook receiver
- [ ] Add integration settings table
- [ ] Add API key management for businesses

---

# 22. Backend Build Priority From Here

## Phase 1 — Make MVP Actually Work

- [ ] Connect starter code to real Supabase project
- [ ] Run SQL migrations
- [ ] Create first super admin profile
- [ ] Create business from admin route
- [ ] Generate form link
- [ ] Submit public form
- [ ] Save lead to Supabase
- [ ] Generate AI summary with DeepSeek
- [ ] Send owner notification with Resend
- [ ] Send customer auto-reply with Resend
- [ ] Owner logs in and views lead

## Phase 2 — Make It Safe

- [ ] Complete RLS policies
- [ ] Test tenant isolation
- [ ] Add rate limiting
- [ ] Add spam protection
- [ ] Add audit logs everywhere
- [ ] Add validation on every route
- [ ] Add error handling and fallbacks

## Phase 3 — Make It Useful

- [ ] Add lead status updates
- [ ] Add AI suggested replies
- [ ] Add manual owner reply
- [ ] Add follow-up scheduling
- [ ] Add dashboard metrics
- [ ] Add form settings
- [ ] Add owner settings

## Phase 4 — Make It Production-Ready

- [ ] Add tests
- [ ] Add observability
- [ ] Add deployment checklist
- [ ] Add usage limits
- [ ] Add billing later
- [ ] Add integrations later

---

# Final Backend Truth

The backend foundation is started, but the system is not complete until the live Supabase project, real RLS policies, real email delivery, real AI calls, and full endpoint coverage are implemented and tested.

The most important rule remains:

`business_id` is the tenant boundary.

Every backend feature must protect that boundary.
