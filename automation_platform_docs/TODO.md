# Build TODO

## Project setup

- [ ] Create Next.js app
- [ ] Install Supabase client packages
- [ ] Install Resend package
- [ ] Install Zod
- [ ] Create `.env.local`
- [ ] Create `.env.local.example`
- [ ] Set up Supabase browser client
- [ ] Set up Supabase server client
- [ ] Set up Supabase admin client

## Database

- [ ] Create profiles table
- [ ] Create businesses table
- [ ] Create business_members table
- [ ] Create business_invites table
- [ ] Create forms table
- [ ] Create leads table
- [ ] Create lead_events table
- [ ] Create messages table
- [ ] Create email_events table
- [ ] Create ai_outputs table
- [ ] Create follow_ups table
- [ ] Create audit_logs table
- [ ] Add indexes
- [ ] Enable RLS
- [ ] Add RLS helper functions
- [ ] Add RLS policies
- [ ] Seed super_admin user/profile

## Auth

- [ ] Build login page
- [ ] Add Supabase login
- [ ] Add logout
- [ ] Add role-based redirects
- [ ] Protect admin routes
- [ ] Protect owner dashboard routes
- [ ] Add owner invite acceptance flow

## Admin portal

- [ ] Admin overview page
- [ ] Business list page
- [ ] Create business page
- [ ] Business detail page
- [ ] Generate slug function
- [ ] Create default form after business creation
- [ ] Invite owner
- [ ] Copy form link
- [ ] Deactivate business
- [ ] Audit logs

## Public form

- [ ] Create `/forms/[slug]` page
- [ ] Load business by slug
- [ ] Load form config
- [ ] Display branded form
- [ ] Validate submission
- [ ] Submit through server route
- [ ] Save lead with business_id
- [ ] Show success message
- [ ] Add honeypot spam field

## Owner dashboard

- [ ] Dashboard overview
- [ ] Lead list
- [ ] Lead detail page
- [ ] Lead status badge
- [ ] Update lead status
- [ ] Add lead note
- [ ] Show AI summary
- [ ] Show form link
- [ ] Copy form link

## Email

- [ ] Set up Resend client
- [ ] Create customer confirmation template
- [ ] Create owner new-lead template
- [ ] Send customer confirmation
- [ ] Send owner notification
- [ ] Log email events
- [ ] Handle email failure

## AI

- [ ] Create AI provider interface
- [ ] Create DeepSeek provider
- [ ] Create lead summary prompt
- [ ] Generate AI summary after lead submission
- [ ] Store AI output
- [ ] Show AI summary in dashboard
- [ ] Add fallback if AI fails

## Reliability

- [ ] Add structured error handling
- [ ] Add server-side validation everywhere
- [ ] Add loading/empty/error states
- [ ] Add pagination for leads
- [ ] Add basic rate limiting
- [ ] Add audit logs for admin actions

## Demo and launch

- [ ] Create 2 sample businesses
- [ ] Test customer form flow
- [ ] Test owner login flow
- [ ] Test admin creation flow
- [ ] Test email delivery
- [ ] Test AI summary
- [ ] Record demo video
- [ ] Prepare outreach message
