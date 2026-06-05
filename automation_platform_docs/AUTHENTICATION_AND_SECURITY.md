# Authentication and Security

## Auth provider

Use Supabase Auth.

Users will log into your platform, not directly into Supabase.

Supabase Auth handles:

- Login
- Sessions
- Password reset
- Magic links if enabled
- Invite flow
- Authenticated user identity

## User types

### Super Admin

This is the platform owner/admin.

Can:

- Create businesses
- Invite business owners
- View all businesses
- View all leads if needed
- Deactivate businesses
- Manage platform settings

### Business Owner

This is the client.

Can:

- Log into dashboard
- View their own business leads
- Update lead statuses
- Copy form link
- Manage limited business settings

### Staff

Later role.

Can:

- View assigned business data
- Help manage leads

Do not build staff permissions in the MVP unless necessary.

## Recommended login flow

### Admin login

Admin uses:

```text
/login
```

After login:

```text
if role == super_admin -> /admin
```

### Owner login

Owner uses the same login page:

```text
/login
```

After login:

```text
if role == business_owner -> /dashboard
```

The dashboard is reusable. The business data shown depends on `business_members`.

## Owner invite flow

Recommended flow:

```text
1. Admin creates business
2. Admin enters owner email
3. Server creates or invites Supabase Auth user
4. business_invites row is created
5. Owner receives invite email
6. Owner accepts invite and sets password
7. System creates/updates profile
8. System connects user to business through business_members
9. Owner logs into /dashboard
```

## Important server-only operations

These must never run in browser/client code:

- Supabase Admin Auth user invite
- Supabase service role operations
- Resend email sending
- DeepSeek API calls
- Writing audit logs for privileged actions
- Deactivating businesses
- Changing user roles

## Environment key safety

Client-safe keys:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Server-only secrets:

```text
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
DEEPSEEK_API_KEY
```

Never put server-only secrets in frontend components.

## Route protection

### Public routes

```text
/
/login
/forms/[slug]
```

### Owner routes

```text
/dashboard
/dashboard/leads
/dashboard/settings
```

Require:

```text
authenticated user + business_members record
```

### Admin routes

```text
/admin
/admin/businesses
/admin/businesses/new
```

Require:

```text
authenticated user + profile.role = super_admin
```

## Row Level Security

Enable RLS on public tables.

Owners should only access rows connected to businesses they belong to.

Admin should access everything only through trusted role checks.

## Business isolation rule

A business owner must never be able to access another business's:

- Leads
- Messages
- AI summaries
- Emails
- Follow-ups
- Settings
- Form configuration

The database should enforce this, not only the frontend.

## Public form security

Public customer forms are open to the internet, so protect them.

Recommended controls:

- Validate all input server-side
- Use rate limiting
- Use honeypot field
- Reject inactive forms
- Reject inactive/suspended businesses
- Limit message length
- Sanitize content before rendering
- Log suspicious activity

## Admin portal security

Admin portal has superpowers, so add protections:

- Only super_admin can access
- All admin actions are logged
- Confirmation for destructive actions
- No hard delete for businesses in MVP
- Deactivate instead of delete
- Server-side permission checks always

## Audit logs

Log important actions:

```text
business_created
business_updated
business_deactivated
owner_invited
invite_resent
role_changed
form_updated
lead_deleted
settings_changed
```

Audit log fields:

```text
actor_user_id
business_id
action
entity_type
entity_id
metadata
created_at
```

## Session handling

Use Supabase session helpers for Next.js.

General rule:

- Server components/server actions should verify the user server-side.
- Client UI can hide/show buttons, but server permissions make the final decision.

## Common security mistakes to avoid

### Mistake 1: trusting frontend business_id

Bad:

```text
Frontend sends business_id and backend trusts it.
```

Good:

```text
Backend uses logged-in user to determine allowed business_id.
```

### Mistake 2: exposing service role key

Bad:

```text
Using SUPABASE_SERVICE_ROLE_KEY in client component.
```

Good:

```text
Use service role key only in server route/action.
```

### Mistake 3: no RLS

Bad:

```text
Public schema tables exposed without RLS.
```

Good:

```text
Enable RLS and define policies for every exposed table.
```

### Mistake 4: no audit logs

Bad:

```text
Admin can change things but system has no record.
```

Good:

```text
Every sensitive admin action creates an audit log.
```
