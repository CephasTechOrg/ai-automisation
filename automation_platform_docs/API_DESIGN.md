# API Design

## API style

Use Next.js route handlers and server actions.

Recommended:

- Public form submission through route handler
- Admin actions through server actions or protected route handlers
- Owner dashboard queries through server-side Supabase client with RLS

## Public API routes

### Get public form configuration

```http
GET /api/forms/:slug
```

Purpose:

- Load business form
- Load branding
- Check form is active

Response:

```json
{
  "form": {
    "id": "uuid",
    "slug": "bright-cleaning",
    "title": "Bright Cleaning Request Form",
    "description": "Tell us what you need."
  },
  "business": {
    "name": "Bright Cleaning Services",
    "logo_url": "...",
    "brand_color": "#2563EB"
  }
}
```

### Submit public form

```http
POST /api/forms/:slug/submit
```

Purpose:

- Customer submits lead

Request:

```json
{
  "customer_name": "Ama Boateng",
  "customer_email": "ama@example.com",
  "customer_phone": "7041234567",
  "service_needed": "Deep cleaning",
  "preferred_time": "Saturday afternoon",
  "message": "I need a 3-bedroom house cleaned this weekend.",
  "raw_payload": {}
}
```

Server steps:

```text
1. Validate slug
2. Find form
3. Check form active
4. Check business active
5. Validate payload
6. Rate-limit request
7. Insert lead
8. Create lead event
9. Generate AI summary
10. Save AI output
11. Send customer confirmation
12. Send owner notification
13. Return success
```

Response:

```json
{
  "success": true,
  "message": "Your request was submitted successfully."
}
```

## Auth routes/pages

### Login

```text
/login
```

Owner and admin use the same login page.

Redirect after login:

```text
super_admin -> /admin
business_owner -> /dashboard
```

### Accept invite

```text
/accept-invite
```

Used when business owner accepts invite and sets password.

## Admin server actions

### Create business

```text
createBusiness(input)
```

Input:

```ts
type CreateBusinessInput = {
  name: string;
  ownerEmail: string;
  ownerName?: string;
  industry?: string;
  phone?: string;
  websiteUrl?: string;
  brandColor?: string;
};
```

Server steps:

```text
1. Require super_admin
2. Validate input
3. Generate unique slug
4. Insert business
5. Insert default form
6. Create invite row
7. Invite owner through Supabase Auth Admin
8. Write audit log
9. Return form link
```

### Update business

```text
updateBusiness(businessId, input)
```

Requires:

```text
super_admin
```

### Deactivate business

```text
deactivateBusiness(businessId)
```

Requires:

```text
super_admin
```

Use `status = inactive`. Avoid hard delete.

### Resend owner invite

```text
resendOwnerInvite(businessId)
```

Requires:

```text
super_admin
```

## Owner server actions

### Get dashboard leads

```text
getOwnerLeads(filters)
```

Filters:

```ts
type LeadFilters = {
  status?: LeadStatus;
  cursor?: string;
  limit?: number;
  search?: string;
};
```

Server rules:

```text
1. Require authenticated user
2. Find user's business membership
3. Query leads for that business only
4. Return paginated results
```

### Update lead status

```text
updateLeadStatus(leadId, status)
```

Server rules:

```text
1. Require authenticated user
2. Confirm user belongs to lead's business
3. Validate status transition
4. Update lead
5. Write lead_event
```

### Add lead note

```text
addLeadNote(leadId, content)
```

Server rules:

```text
1. Require owner membership
2. Insert messages row with channel manual_note
3. Insert lead_event
```

### Send manual follow-up

```text
sendManualFollowUp(leadId, message)
```

Server rules:

```text
1. Require owner membership
2. Send email through Resend
3. Insert message
4. Insert email_event
5. Insert lead_event
```

## Validation rules

Use Zod or similar validation library.

### Business name

- Required
- 2–120 characters

### Slug

- Lowercase
- Letters, numbers, hyphens
- Unique

### Email

- Must be valid email

### Customer message

- Max length, for example 2,000 characters

### Phone

- Optional but normalized if provided

## Error response style

Return clear errors.

```json
{
  "success": false,
  "error": {
    "code": "FORM_NOT_FOUND",
    "message": "This form does not exist or is no longer active."
  }
}
```

Recommended error codes:

```text
UNAUTHORIZED
FORBIDDEN
FORM_NOT_FOUND
BUSINESS_INACTIVE
VALIDATION_ERROR
RATE_LIMITED
EMAIL_FAILED
AI_FAILED
INTERNAL_ERROR
```

## API security rules

- Do not trust `business_id` from the client for protected dashboard requests.
- Use logged-in user identity to determine business access.
- Public form submissions must be server-validated.
- Admin actions require server-side super_admin check.
- API keys stay server-side.
