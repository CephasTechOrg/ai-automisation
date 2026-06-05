# Database Design

## Database choice

Use Supabase PostgreSQL.

PostgreSQL is the source of truth for:

- Businesses
- Users/profiles
- Business membership
- Forms
- Leads
- Messages
- AI outputs
- Emails
- Follow-ups
- Audit logs

## Main principle

Every business-owned record must include `business_id`.

This is the most important database rule.

```text
business_id = tenant boundary
```

If a table contains business data but does not include `business_id`, think carefully before accepting that design.

## Tables

## 1. `profiles`

Supabase Auth stores login users in `auth.users`. The app should store public app user data in `profiles`.

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role text not null default 'business_owner',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Allowed roles:

```text
super_admin
business_owner
staff
```

MVP roles:

```text
super_admin
business_owner
```

## 2. `businesses`

Stores each business/tenant.

```sql
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  industry text,
  owner_email text not null,
  phone text,
  website_url text,
  logo_url text,
  brand_color text default '#2563EB',
  status text not null default 'active',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Allowed statuses:

```text
active
inactive
suspended
archived
```

## 3. `business_members`

Connects users to businesses.

This table makes the dashboard reusable.

```sql
create table public.business_members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  unique (business_id, user_id)
);
```

Allowed roles:

```text
owner
manager
staff
```

MVP role:

```text
owner
```

## 4. `business_invites`

Stores owner invitations before the owner fully logs in.

```sql
create table public.business_invites (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  email text not null,
  role text not null default 'owner',
  status text not null default 'pending',
  invited_by uuid references public.profiles(id),
  accepted_by uuid references public.profiles(id),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  unique (business_id, email)
);
```

Statuses:

```text
pending
accepted
expired
revoked
```

## 5. `forms`

Stores public form configuration.

```sql
create table public.forms (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  slug text not null unique,
  title text not null,
  description text,
  success_message text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

In the MVP, each business can have one default form.

Later, each business can have many forms.

## 6. `form_fields`

Optional for MVP. Use later when adding custom forms.

```sql
create table public.form_fields (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  label text not null,
  field_key text not null,
  field_type text not null,
  required boolean not null default false,
  options jsonb,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (form_id, field_key)
);
```

Allowed field types:

```text
text
email
phone
textarea
select
multi_select
date
time
datetime
number
checkbox
```

## 7. `leads`

Stores customer submissions.

```sql
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  form_id uuid references public.forms(id) on delete set null,
  customer_name text not null,
  customer_email text,
  customer_phone text,
  service_needed text,
  preferred_time text,
  message text,
  raw_payload jsonb,
  ai_summary text,
  ai_priority text,
  status text not null default 'new',
  source text not null default 'public_form',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Lead statuses:

```text
new
contacted
follow_up_needed
booked
completed
lost
spam
archived
```

## 8. `lead_events`

Append-only timeline of lead actions.

```sql
create table public.lead_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  actor_user_id uuid references public.profiles(id),
  event_type text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);
```

Examples:

```text
lead_created
ai_summary_generated
email_sent
status_changed
note_added
follow_up_scheduled
follow_up_sent
```

## 9. `messages`

Stores communication records.

```sql
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  direction text not null,
  channel text not null,
  subject text,
  content text not null,
  provider_message_id text,
  status text not null default 'created',
  created_at timestamptz not null default now()
);
```

Directions:

```text
inbound
outbound
internal
```

Channels:

```text
form
email
sms
whatsapp
manual_note
```

## 10. `email_events`

Logs emails sent through Resend.

```sql
create table public.email_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  message_id uuid references public.messages(id) on delete set null,
  recipient_email text not null,
  email_type text not null,
  provider text not null default 'resend',
  provider_message_id text,
  status text not null default 'queued',
  error_message text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);
```

Email types:

```text
owner_invite
customer_confirmation
owner_new_lead_alert
follow_up
admin_alert
```

## 11. `ai_outputs`

Stores AI-generated outputs.

```sql
create table public.ai_outputs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  provider text not null default 'deepseek',
  model text,
  output_type text not null,
  prompt_version text,
  input_snapshot jsonb,
  output jsonb not null,
  status text not null default 'success',
  error_message text,
  created_at timestamptz not null default now()
);
```

Output types:

```text
lead_summary
reply_draft
priority_classification
follow_up_suggestion
```

## 12. `follow_ups`

Stores scheduled follow-up tasks.

```sql
create table public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  scheduled_at timestamptz not null,
  status text not null default 'scheduled',
  channel text not null default 'email',
  message_template text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Statuses:

```text
scheduled
sent
cancelled
failed
skipped
```

## 13. `audit_logs`

Tracks important admin and security-sensitive actions.

```sql
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles(id),
  business_id uuid references public.businesses(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);
```

Examples:

```text
business_created
business_updated
business_deactivated
owner_invited
invite_resent
owner_removed
form_updated
lead_deleted
```

## Recommended indexes

Indexes are critical for performance.

```sql
create index idx_businesses_slug on public.businesses(slug);
create index idx_forms_slug on public.forms(slug);
create index idx_forms_business_id on public.forms(business_id);
create index idx_business_members_user_id on public.business_members(user_id);
create index idx_business_members_business_id on public.business_members(business_id);
create index idx_leads_business_id_created_at on public.leads(business_id, created_at desc);
create index idx_leads_business_id_status on public.leads(business_id, status);
create index idx_messages_lead_id_created_at on public.messages(lead_id, created_at asc);
create index idx_follow_ups_scheduled_at_status on public.follow_ups(scheduled_at, status);
create index idx_email_events_business_id_created_at on public.email_events(business_id, created_at desc);
create index idx_ai_outputs_lead_id_created_at on public.ai_outputs(lead_id, created_at desc);
create index idx_audit_logs_actor_created_at on public.audit_logs(actor_user_id, created_at desc);
```

## Row Level Security direction

Enable RLS on all public tables.

```sql
alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.business_members enable row level security;
alter table public.forms enable row level security;
alter table public.leads enable row level security;
alter table public.messages enable row level security;
alter table public.follow_ups enable row level security;
alter table public.email_events enable row level security;
alter table public.ai_outputs enable row level security;
alter table public.audit_logs enable row level security;
```

## Helper functions

Recommended helper function:

```sql
create or replace function public.is_super_admin()
returns boolean
language sql
security definer
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
    and role = 'super_admin'
  );
$$;
```

Recommended membership helper:

```sql
create or replace function public.is_business_member(target_business_id uuid)
returns boolean
language sql
security definer
as $$
  select exists (
    select 1
    from public.business_members
    where business_id = target_business_id
    and user_id = auth.uid()
  );
$$;
```

## Example RLS policy idea for leads

```sql
create policy "business members can read their leads"
on public.leads
for select
using (
  public.is_super_admin()
  or public.is_business_member(business_id)
);
```

## Public form insert strategy

The public form needs to allow unauthenticated customers to submit leads.

Safer approach:

- Do not allow direct anonymous insert into `leads` from the browser.
- Use a server route: `POST /api/forms/[slug]/submit`.
- The server validates the slug, validates payload, checks business/form status, applies rate limit, and inserts the lead.

This gives more control and avoids public database abuse.

## Data deletion strategy

For MVP:

- Avoid hard deleting businesses.
- Use `status = 'archived'` or `status = 'inactive'`.
- Keep audit logs.

For leads:

- Let owners archive leads.
- Admin can hard delete only if necessary.

## Database success checklist

- Every tenant-owned table has `business_id`.
- Slugs are unique.
- Owner membership is stored in `business_members`.
- Leads are indexed by business and created date.
- RLS is enabled.
- Public submissions go through server-side validation.
- AI outputs and emails are logged.
- Admin actions are audit logged.
