# Folder Structure

## Recommended Next.js structure

```text
clientflow-ai/
  app/
    (public)/
      page.tsx
      forms/
        [slug]/
          page.tsx
    (auth)/
      login/
        page.tsx
      accept-invite/
        page.tsx
    (admin)/
      admin/
        page.tsx
        businesses/
          page.tsx
          new/
            page.tsx
          [id]/
            page.tsx
        audit-logs/
          page.tsx
    (dashboard)/
      dashboard/
        page.tsx
        leads/
          page.tsx
          [id]/
            page.tsx
        settings/
          page.tsx
    api/
      forms/
        [slug]/
          route.ts
          submit/
            route.ts
      cron/
        follow-ups/
          route.ts
  components/
    ui/
    forms/
      PublicLeadForm.tsx
    admin/
      BusinessCreateForm.tsx
      BusinessTable.tsx
      InviteOwnerButton.tsx
    dashboard/
      LeadList.tsx
      LeadDetail.tsx
      LeadStatusBadge.tsx
      LeadTimeline.tsx
  lib/
    supabase/
      client.ts
      server.ts
      admin.ts
      middleware.ts
    auth/
      get-current-user.ts
      require-admin.ts
      require-business-member.ts
      permissions.ts
    ai/
      provider.ts
      deepseek-provider.ts
      prompts.ts
      types.ts
    email/
      resend-client.ts
      templates/
        customer-confirmation.tsx
        owner-new-lead.tsx
        follow-up.tsx
      send-email.ts
    db/
      businesses.ts
      leads.ts
      forms.ts
      audit-logs.ts
    validation/
      business.schema.ts
      lead.schema.ts
      auth.schema.ts
    utils/
      slugify.ts
      generate-form-link.ts
      errors.ts
      constants.ts
  types/
    database.types.ts
    business.ts
    lead.ts
    auth.ts
  supabase/
    migrations/
    seed.sql
  docs/
    README.md
    PROJECT_DESCRIPTION.md
    SYSTEM_OVERVIEW.md
    ARCHITECTURE.md
    DATABASE.md
    DATA_STRUCTURES.md
    AUTHENTICATION_AND_SECURITY.md
    EMAIL_AND_AI_AUTOMATION.md
    API_DESIGN.md
    ENVIRONMENT_VARIABLES.md
    ADMIN_PORTAL.md
    OWNER_DASHBOARD.md
    IMPLEMENTATION_ROADMAP.md
    TODO.md
  .env.local.example
  README.md
```

## Folder responsibilities

### `app/`

Contains routes and pages.

Use route groups to separate:

- Public pages
- Auth pages
- Admin pages
- Owner dashboard pages

### `components/`

Reusable UI components.

Separate by domain:

- `admin`
- `dashboard`
- `forms`
- `ui`

### `lib/supabase/`

Supabase clients.

- `client.ts` for browser client
- `server.ts` for server-side user session client
- `admin.ts` for service role client only

### `lib/auth/`

Authorization helpers.

Examples:

- `requireAdmin()`
- `requireBusinessMember()`
- `getCurrentUser()`

### `lib/ai/`

AI provider abstraction.

DeepSeek implementation should live here.

### `lib/email/`

Resend setup and email templates.

### `lib/db/`

Database access functions.

Keep database queries organized by domain.

### `lib/validation/`

Zod schemas or validation logic.

### `types/`

Shared TypeScript types.

### `supabase/`

Database migrations, SQL, seed data.

## Naming rules

Use clear domain names.

Good:

```text
businesses.ts
leads.ts
forms.ts
send-email.ts
require-admin.ts
```

Bad:

```text
helpers.ts
stuff.ts
utils2.ts
main.ts
```

## MVP folders to create first

Start with:

```text
app/forms/[slug]/page.tsx
app/api/forms/[slug]/submit/route.ts
app/login/page.tsx
app/admin/page.tsx
app/admin/businesses/new/page.tsx
app/dashboard/page.tsx
components/forms/PublicLeadForm.tsx
components/admin/BusinessCreateForm.tsx
components/dashboard/LeadList.tsx
lib/supabase/client.ts
lib/supabase/server.ts
lib/supabase/admin.ts
lib/ai/deepseek-provider.ts
lib/email/send-email.ts
lib/validation/lead.schema.ts
lib/validation/business.schema.ts
lib/utils/slugify.ts
```
