# Implementation Roadmap

## Goal

Build a working MVP in about two weeks that can be shown to real businesses and used to collect paid beta clients.

Do not overbuild.

## MVP outcome

At the end of the MVP, the system should support this flow:

```text
Admin creates business
-> system generates form link
-> owner receives invite
-> owner logs in
-> customer submits form
-> owner sees lead
-> AI summary is generated
-> customer gets confirmation email
-> owner gets new-lead email
```

## Week 1: Foundation

### Day 1: Project setup

- Create Next.js project
- Connect Supabase
- Set up environment variables
- Create Supabase clients
- Set up basic UI layout
- Add `.env.local.example`

### Day 2: Database schema

- Create tables
- Add indexes
- Enable RLS
- Create helper functions
- Seed super_admin profile

### Day 3: Auth and role routing

- Supabase login
- Protected dashboard routes
- Protected admin routes
- Role-based redirects

### Day 4: Admin create business

- Admin business creation page
- Slug generation
- Business insert
- Default form insert
- Owner invite logic
- Audit log creation

### Day 5: Public form

- `/forms/[slug]` page
- Load business/form by slug
- Display branded form
- Submit lead to server route
- Validate input
- Save lead

## Week 2: Automation and dashboard

### Day 6: Owner dashboard

- Dashboard page
- Lead list
- Lead detail page
- Lead status update
- Lead timeline basics

### Day 7: Email automation

- Resend setup
- Customer confirmation email
- Owner new-lead alert
- Email event logging

### Day 8: AI integration

- DeepSeek provider
- Lead summary prompt
- Store AI output
- Show AI summary in dashboard

### Day 9: Polish and safety

- Error handling
- Loading states
- Empty states
- Rate limiting basics
- Honeypot field
- Better validation

### Day 10: Demo readiness

- Test full flow
- Create sample businesses
- Record demo
- Fix bugs
- Prepare sales message

## MVP launch checklist

- [ ] Admin can create business
- [ ] Business gets unique slug
- [ ] Public form link works
- [ ] Customer can submit lead
- [ ] Lead saved with correct business_id
- [ ] Owner can log in
- [ ] Owner sees only own leads
- [ ] AI summary generated
- [ ] Customer email sent
- [ ] Owner email sent
- [ ] Audit logs created
- [ ] RLS policies active
- [ ] Secrets are server-only

## After MVP

### Phase 2

- Custom form fields
- Manual follow-up emails
- Owner settings
- QR code generation
- Better analytics

### Phase 3

- Scheduled follow-ups
- SMS notifications
- WhatsApp integration
- Business subscription plans
- Stripe billing

### Phase 4

- Team/staff accounts
- CRM integrations
- AI suggested replies
- Multi-form businesses
- Advanced reporting

## Do not build first

Do not start with these before MVP works:

- Complex AI agents
- WhatsApp integration
- SMS integration
- Payments
- Full CRM
- Multi-language support
- Advanced analytics
- Mobile app

Build the revenue path first.
