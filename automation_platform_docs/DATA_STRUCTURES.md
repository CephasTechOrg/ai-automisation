# Data Structures and Scaling Foundation

## Why this file matters

A stable software system is not only about nice UI or many features. It depends on how well the data is structured, accessed, protected, and processed.

For this platform, the most important foundation is:

```text
Business isolation + fast lookup + reliable event tracking + predictable workflows
```

This file explains the data structures and access patterns that should guide implementation.

## Core data structure principle

The system is multi-tenant.

That means one codebase serves many businesses.

The main partition key is:

```text
business_id
```

Every business-owned object must connect back to `business_id`.

This is not optional.

## 1. Hash map idea: fast slug lookup

When a customer opens:

```text
/forms/bright-cleaning
```

The system must quickly find the correct form and business.

Conceptual data structure:

```ts
type SlugToFormMap = Map<string, FormConfig>;
```

Database version:

```sql
create unique index idx_forms_slug on forms(slug);
```

Access pattern:

```text
slug -> form -> business_id -> business settings
```

Time complexity goal:

```text
Lookup by slug: O(log n) in database using B-tree index
Cached lookup: O(1) average using in-memory/edge cache
```

Use case:

- Public form loading
- Link generation
- Business-specific branding

## 2. Relational graph: users to businesses

A user can belong to a business. Later, a user may belong to multiple businesses.

Conceptual structure:

```ts
type BusinessMembership = {
  userId: string;
  businessId: string;
  role: 'owner' | 'manager' | 'staff';
};
```

Database table:

```text
business_members
```

This acts like an edge table in a graph:

```text
User ---- membership ---- Business
```

Access pattern:

```text
logged_in_user_id -> business_members -> allowed business_ids
```

Why this matters:

- Dashboard isolation
- Team support later
- Role-based permissions

## 3. Ordered list: leads by newest first

Owners need to see latest leads quickly.

Conceptual structure:

```ts
type LeadList = Lead[];
```

Sorted by:

```text
created_at desc
```

Database index:

```sql
create index idx_leads_business_id_created_at
on leads(business_id, created_at desc);
```

Access pattern:

```text
business_id -> newest leads
```

Time complexity goal:

```text
Fetch latest leads: O(log n + k)
```

Where `k` is the number of rows returned.

Use pagination. Do not load all leads forever.

Recommended pagination:

- Cursor pagination using `created_at` and `id`
- Limit 20–50 leads per page

## 4. State machine: lead status

Lead status should behave like a controlled state machine, not random text.

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

Recommended transitions:

```text
new -> contacted
new -> spam
contacted -> follow_up_needed
contacted -> booked
follow_up_needed -> contacted
booked -> completed
booked -> lost
any active status -> archived
```

Why use a state machine?

- Prevents messy statuses
- Makes reporting easier
- Helps automation know what to do next
- Supports analytics later

Example:

```ts
const allowedTransitions = {
  new: ['contacted', 'spam', 'archived'],
  contacted: ['follow_up_needed', 'booked', 'lost', 'archived'],
  follow_up_needed: ['contacted', 'booked', 'lost', 'archived'],
  booked: ['completed', 'lost', 'archived'],
  completed: ['archived'],
  lost: ['archived'],
  spam: ['archived'],
  archived: []
};
```

## 5. Append-only event log: lead history

Instead of only storing the current lead status, also store lead events.

Table:

```text
lead_events
```

Example timeline:

```text
lead_created
ai_summary_generated
customer_confirmation_sent
owner_notification_sent
status_changed
follow_up_scheduled
follow_up_sent
```

Why this is powerful:

- Debugging becomes easier
- Owner can see lead history
- Admin can understand what happened
- Automations can be audited
- Future analytics becomes possible

Conceptual data structure:

```ts
type LeadEventLog = LeadEvent[];
```

This is an append-only list.

Do not edit old events unless there is a serious correction need.

## 6. Queue: email and follow-up tasks

Emails and follow-ups should not be treated as simple random actions. They are tasks.

Conceptual structure:

```ts
type TaskQueue = Queue<AutomationTask>;
```

Task examples:

```text
send_customer_confirmation
send_owner_notification
generate_ai_summary
send_follow_up
```

MVP version:

- Use database table `follow_ups`
- Use server-side scheduled job or Vercel Cron later

Later production version:

- Use queue system such as Upstash QStash, Inngest, Trigger.dev, BullMQ, or a worker service

Queue benefit:

- Retries
- Failure tracking
- No lost tasks
- Better scalability

## 7. Priority queue: scheduled follow-ups

Follow-ups are scheduled by time.

Conceptual structure:

```ts
type FollowUpPriorityQueue = PriorityQueue<FollowUpTask>;
```

Priority key:

```text
scheduled_at
```

Database index:

```sql
create index idx_follow_ups_scheduled_at_status
on follow_ups(scheduled_at, status);
```

Worker query:

```sql
select * from follow_ups
where status = 'scheduled'
and scheduled_at <= now()
order by scheduled_at asc
limit 50;
```

This behaves like a priority queue backed by PostgreSQL.

## 8. Cache: business/form configuration

Public forms may be loaded many times.

Business settings do not change every second, so they can be cached.

Cache key examples:

```text
form:slug:bright-cleaning
business:id:{business_id}
```

Conceptual structure:

```ts
type Cache = Map<string, CachedValue>;
```

MVP:

- Use Next.js caching carefully
- Use Supabase query directly first

Later:

- Redis/Upstash cache for form configs
- Short TTL such as 5–15 minutes

Important:

After admin changes business branding or form settings, invalidate the cache.

## 9. Set: permissions and roles

Permissions should be checked with sets.

Example:

```ts
const adminPermissions = new Set([
  'business:create',
  'business:update',
  'business:deactivate',
  'owner:invite',
  'lead:read_all'
]);
```

Business owner permissions:

```ts
const ownerPermissions = new Set([
  'lead:read_own_business',
  'lead:update_status',
  'business:read_own_settings'
]);
```

Why use sets?

```text
Permission lookup: O(1) average
```

Do not scatter role checks everywhere. Centralize permissions.

## 10. JSON object: flexible form payloads

For MVP, use fixed fields:

```text
name
email
phone
service_needed
preferred_time
message
```

But store the full original submission in:

```text
raw_payload jsonb
```

Why?

- You can add custom fields later
- You do not lose data
- AI can process richer context
- The dashboard can display dynamic answers later

Example:

```json
{
  "home_size": "3 bedrooms",
  "service_type": "Deep cleaning",
  "preferred_day": "Saturday",
  "budget": "$200-$300"
}
```

## 11. Immutable snapshots: AI inputs

When sending data to AI, save a snapshot.

Table:

```text
ai_outputs.input_snapshot
```

Why?

- You know what data the AI saw
- You can debug poor AI responses
- You can compare prompt versions
- You can improve prompts over time

AI data structure:

```ts
type AIRequestSnapshot = {
  lead: Lead;
  business: BusinessSummary;
  promptVersion: string;
};
```

## 12. Idempotency keys: prevent duplicate submissions

Customers may double-click submit or network requests may retry.

Use an idempotency key for lead submission.

Conceptual structure:

```ts
type IdempotencyMap = Map<string, ExistingResult>;
```

Database table option:

```text
idempotency_keys
```

MVP simple approach:

- Disable submit button after click
- Add server-side duplicate detection using email/phone + form_id + short time window

Later stronger approach:

- Generate `idempotency_key` on form load
- Store processed key server-side

## 13. Rate limiting structure

Public forms can be abused.

Rate limit by:

```text
IP address
form slug
email
phone
```

Conceptual structure:

```ts
type RateLimitBucket = Map<string, TokenBucket>;
```

Key examples:

```text
rate:form:{slug}:ip:{ip}
rate:email:{email}
```

MVP:

- Basic server validation
- Honeypot field
- Optional CAPTCHA later

Production:

- Upstash Redis rate limiting
- IP throttling
- Spam detection

## 14. Search index direction

Owners may later search leads by name, phone, email, or service.

MVP:

```sql
where business_id = ?
and customer_name ilike '%query%'
```

Later:

- PostgreSQL full-text search
- Trigram indexes
- Search service if needed

Suggested index later:

```sql
create extension if not exists pg_trgm;
create index idx_leads_search_name on leads using gin (customer_name gin_trgm_ops);
```

## 15. Data access patterns to design for

The system should be optimized for these common queries:

### Public form lookup

```text
Input: slug
Output: form + business settings
```

### Owner dashboard lead list

```text
Input: logged-in user
Output: latest leads for business
```

### Lead detail

```text
Input: lead_id + logged-in user
Output: lead + messages + events + AI outputs
```

### Admin business list

```text
Input: super admin
Output: all businesses with status and owner email
```

### Follow-up worker

```text
Input: current time
Output: scheduled follow-ups due now
```

### Email event logging

```text
Input: email task result
Output: email_events record + message record
```

## 16. Scaling rules

### Do not load all records

Always paginate.

Bad:

```text
load all leads for business forever
```

Good:

```text
load latest 25 leads
load more with cursor
```

### Use indexes for common filters

Every common query should have a supporting index.

### Avoid business data leaks

Every dashboard query must filter by allowed business ID.

### Separate read models later

If analytics becomes slow, create summary tables:

```text
business_daily_metrics
lead_status_counts
email_delivery_stats
```

Do not calculate every dashboard statistic from raw data forever.

## 17. Strong foundation checklist

Use this before implementation:

- [ ] Every tenant-owned table has `business_id`
- [ ] Slugs have unique indexes
- [ ] Leads are indexed by `business_id` and `created_at`
- [ ] Lead statuses are controlled by enum/state machine logic
- [ ] AI outputs are stored separately
- [ ] Email events are logged separately
- [ ] Lead events are append-only
- [ ] Follow-ups are treated as queued tasks
- [ ] Dashboard queries are paginated
- [ ] Permissions are centralized
- [ ] Public submissions are rate-limited
- [ ] Sensitive keys are server-only
- [ ] RLS policies enforce business isolation

## Final engineering mindset

The database and data structures should make the safe path easy.

The system should naturally answer:

```text
Who owns this data?
Which business does this belong to?
Who is allowed to see it?
What happened to this lead?
What automation ran?
Did the email send?
What did AI generate?
```

If the data model can answer those questions clearly, the platform will be much stronger.
