# Admin Portal

## Purpose

The admin portal is the command center of the platform.

It is where the platform owner can create businesses, invite owners, generate form links, monitor activity, and manage the entire system.

URL:

```text
/admin
```

## Who can access it?

Only users with:

```text
profile.role = super_admin
```

## Admin portal core pages

```text
/admin
/admin/businesses
/admin/businesses/new
/admin/businesses/[id]
/admin/audit-logs
```

## MVP admin features

### 1. Admin overview

Show:

- Total businesses
- Active businesses
- Total leads
- Leads today
- Failed emails
- Recent business activity

### 2. Business list

Show table:

```text
Business name
Owner email
Industry
Status
Form link
Created date
Actions
```

Actions:

```text
View
Edit
Copy form link
Resend invite
Deactivate
```

### 3. Create business

Fields:

```text
Business name
Owner full name
Owner email
Industry
Phone
Website
Brand color
Logo upload
```

When submitted:

```text
1. Generate unique business slug
2. Create business row
3. Create default form row
4. Create invite row
5. Send Supabase Auth invite
6. Write audit log
7. Show generated form link
```

### 4. Business detail page

Show:

- Business profile
- Owner information
- Form link
- Status
- Recent leads
- Email activity
- AI activity
- Audit history

### 5. Invite management

Admin can:

- Send owner invite
- Resend owner invite
- Revoke invite
- See invite status

Invite statuses:

```text
pending
accepted
expired
revoked
```

### 6. Business status management

Allowed statuses:

```text
active
inactive
suspended
archived
```

Behavior:

- `active`: form is live, dashboard works
- `inactive`: form not accepting new leads
- `suspended`: owner access may be restricted
- `archived`: hidden from normal operations

Do not hard delete businesses in MVP.

## Admin security rules

- Every admin page must check server-side role.
- Every admin action must check server-side role.
- Every sensitive admin action must create audit log.
- Service role key must only be used server-side.

## Admin audit log examples

```text
business_created
business_updated
business_deactivated
owner_invited
invite_resent
form_link_copied
logo_uploaded
status_changed
```

## Admin create business success output

After creation, show:

```text
Business created successfully.

Owner invite sent to: owner@example.com

Public form link:
https://yourapp.com/forms/bright-cleaning

Owner dashboard:
https://yourapp.com/dashboard
```

## Admin portal future features

- Billing status
- Plan limits
- Usage analytics
- AI token usage
- Email delivery reports
- Failed automation retry
- Client notes
- White-label settings
