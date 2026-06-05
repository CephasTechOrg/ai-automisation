# System Overview

## Simple explanation

This system is one platform used by many businesses.

Each business gets its own:

- Public customer form link
- Owner dashboard
- Leads
- Messages
- AI summaries
- Emails
- Settings

But all businesses run on the same codebase.

This type of system is called a **multi-tenant system**.

## Main concept

The system works because every important record is tied to a `business_id`.

```text
Business
  -> Owner
  -> Form
  -> Leads
  -> Messages
  -> Follow-ups
  -> AI summaries
  -> Emails
```

The `business_id` keeps each business separated.

## Three main doors

### 1. Admin Portal

URL:

```text
/admin
```

Used by the platform owner.

The admin portal is the command center.

Admin can:

- Create a business
- Invite the owner
- Generate form link
- Edit settings
- View all activity
- Deactivate businesses

### 2. Owner Dashboard

URL:

```text
/dashboard
```

Used by business owners.

All owners use the same dashboard URL, but they only see their own business data.

Example:

```text
Bright Cleaning owner logs in -> sees Bright Cleaning leads only
Fresh Cuts owner logs in -> sees Fresh Cuts leads only
Nana Catering owner logs in -> sees Nana Catering leads only
```

### 3. Public Form

URL pattern:

```text
/forms/[business_slug]
```

Examples:

```text
/forms/bright-cleaning
/forms/fresh-cuts-barber
/forms/nana-catering
```

Customers use this form. Customers do not log in.

The slug in the URL tells the system which business the form belongs to.

## Full business onboarding flow

```text
1. Admin logs into /admin
2. Admin clicks Add Business
3. Admin enters business name, owner email, industry, phone, and branding
4. System creates business row
5. System generates unique slug
6. System creates public form record
7. System invites owner through Supabase Auth
8. Owner receives invite email
9. Owner accepts invite and sets password
10. Owner logs into /dashboard
11. Owner copies public form link
12. Owner shares link in Instagram bio, website, WhatsApp, Google Business Profile, or QR code
```

## Full lead submission flow

```text
1. Customer opens /forms/bright-cleaning
2. System reads slug: bright-cleaning
3. System finds the business and form
4. Customer fills the form
5. Lead is saved with business_id
6. DeepSeek AI summarizes the request
7. Resend sends confirmation to customer
8. Resend sends new-lead alert to owner
9. Lead appears in owner dashboard
10. Owner updates status
```

## How dashboard isolation works

When an owner logs in, Supabase Auth gives the app the user ID.

The system checks:

```text
business_members where user_id = logged_in_user_id
```

Then it finds the owner’s `business_id`.

After that, the dashboard only loads rows connected to that `business_id`.

Example:

```text
SELECT * FROM leads WHERE business_id = owner_business_id;
```

The frontend should never decide what business data a user can access. The backend/database rules must enforce it.

## MVP mental model

```text
Admin creates the business.
Owner manages the leads.
Customer submits the request.
AI helps summarize.
Email helps notify and follow up.
Supabase keeps auth, database, and storage organized.
```

## Non-negotiable principles

1. Every business has a unique `business_id`.
2. Every public form belongs to one business.
3. Every lead belongs to one business.
4. Every owner account is connected through `business_members`.
5. Admin privileges must be server-protected.
6. Supabase Row Level Security must protect business data.
7. API keys must never be exposed in browser code.
8. AI must be replaceable through an adapter layer.
9. Email sending must be logged.
10. Important admin actions must be audit logged.
