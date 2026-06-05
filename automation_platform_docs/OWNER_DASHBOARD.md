# Owner Dashboard

## Purpose

The owner dashboard is where each business owner manages customer leads.

URL:

```text
/dashboard
```

All owners use the same dashboard URL. The data shown depends on the logged-in user's business membership.

## Who can access it?

Authenticated users who are connected to a business through:

```text
business_members
```

## Dashboard core sections

### 1. Overview

Show:

- New leads
- Contacted leads
- Follow-up needed
- Booked leads
- Lost leads
- Total leads this week

### 2. Lead list

Show latest leads:

```text
Customer name
Service needed
AI summary preview
Status
Created date
Action button
```

Filters:

```text
All
New
Contacted
Follow-up needed
Booked
Completed
Lost
```

### 3. Lead detail

Show:

- Customer name
- Email
- Phone
- Service needed
- Preferred time
- Full message
- AI summary
- Suggested next action
- Lead status
- Timeline/events
- Notes
- Email/message history

Actions:

```text
Mark contacted
Mark booked
Mark lost
Archive
Send follow-up
Add note
```

### 4. Form link section

Show the business public form link:

```text
https://yourapp.com/forms/bright-cleaning
```

Buttons:

```text
Copy link
Open form
Download QR code later
```

### 5. Settings

MVP settings:

```text
Business name
Phone
Website
Logo
Brand color
Owner email display
```

Admin may control some fields in MVP.

## Dashboard data isolation

The owner dashboard should never ask the frontend which business to load.

Correct flow:

```text
1. Owner logs in
2. Server gets user ID
3. Server checks business_members
4. Server gets allowed business_id
5. Server loads leads for that business only
```

Wrong flow:

```text
Frontend sends business_id and server trusts it
```

## Lead status workflow

Allowed statuses:

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

Simple flow:

```text
New lead comes in
-> owner contacts customer
-> mark as contacted
-> if customer responds positively, mark as booked
-> if service is done, mark as completed
-> if customer does not respond, mark follow_up_needed or lost
```

## Owner notification flow

When a lead is created:

```text
1. Owner receives email notification
2. Owner logs into dashboard
3. Owner views lead
4. Owner takes action
```

Later, add SMS/WhatsApp notifications.

## MVP owner dashboard pages

```text
/dashboard
/dashboard/leads
/dashboard/leads/[id]
/dashboard/settings
```

## Future owner dashboard features

- Team members
- SMS replies
- WhatsApp integration
- Calendar booking
- Lead analytics
- AI response suggestions
- Custom form fields
- Automated follow-up rules
- Payment requests
