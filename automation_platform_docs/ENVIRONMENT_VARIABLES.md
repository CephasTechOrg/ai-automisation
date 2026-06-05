# Environment Variables

## Purpose

This file lists the environment variables required for the platform.

Never commit real secrets to GitHub.

Use `.env.local` for local development.

Use your deployment platform secrets manager for production.

## Supabase variables

### Public Supabase URL

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
```

Used by client and server code.

Safe to expose.

### Public Supabase anon key

```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

Used by browser/client-side Supabase client.

Safe to expose, but protected by RLS policies.

### Supabase service role key

```bash
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

Server-only.

Used for:

- Admin user invites
- Trusted server operations
- Bypassing RLS only when absolutely needed

Never expose this key in frontend code.

## Resend variables

### Resend API key

```bash
RESEND_API_KEY="re_xxxxxxxxx"
```

Server-only.

Used for sending:

- Customer confirmation emails
- Owner new-lead alerts
- Follow-up emails
- Admin notifications

### Default from email

```bash
RESEND_FROM_EMAIL="ClientFlow AI <noreply@yourdomain.com>"
```

Use a verified domain in Resend before production.

### Admin notification email

```bash
ADMIN_NOTIFICATION_EMAIL="you@example.com"
```

Used for platform alerts.

## DeepSeek AI variables

### DeepSeek API key

```bash
DEEPSEEK_API_KEY="your-deepseek-api-key"
```

Server-only.

### DeepSeek base URL

```bash
DEEPSEEK_BASE_URL="https://api.deepseek.com"
```

### DeepSeek model

```bash
DEEPSEEK_MODEL="deepseek-chat"
```

Change later if you use a different DeepSeek model.

## App variables

### App URL

```bash
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Production example:

```bash
NEXT_PUBLIC_APP_URL="https://yourapp.com"
```

Used for generating:

- Form links
- Invite redirects
- Email links

### App environment

```bash
APP_ENV="development"
```

Allowed values:

```text
development
staging
production
```

## Security variables

### Internal cron secret

```bash
CRON_SECRET="long-random-secret"
```

Used later for scheduled follow-up jobs.

### Webhook secret

```bash
WEBHOOK_SECRET="long-random-secret"
```

Used later for verifying provider webhooks.

## Optional future variables

### Upstash Redis

```bash
UPSTASH_REDIS_REST_URL="your-url"
UPSTASH_REDIS_REST_TOKEN="your-token"
```

Used later for:

- Rate limiting
- Caching
- Queueing

### Stripe

```bash
STRIPE_SECRET_KEY="sk_live_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_xxx"
```

Used later for billing.

### Twilio

```bash
TWILIO_ACCOUNT_SID="xxx"
TWILIO_AUTH_TOKEN="xxx"
TWILIO_PHONE_NUMBER="+15551234567"
```

Used later for SMS.

## Example `.env.local`

```bash
# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
APP_ENV="development"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Resend
RESEND_API_KEY="re_xxxxxxxxx"
RESEND_FROM_EMAIL="ClientFlow AI <noreply@yourdomain.com>"
ADMIN_NOTIFICATION_EMAIL="you@example.com"

# DeepSeek
DEEPSEEK_API_KEY="your-deepseek-api-key"
DEEPSEEK_BASE_URL="https://api.deepseek.com"
DEEPSEEK_MODEL="deepseek-chat"

# Security
CRON_SECRET="long-random-secret"
WEBHOOK_SECRET="long-random-secret"
```

## Secret handling checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] Service role key is never used in client components
- [ ] Resend API key is server-only
- [ ] DeepSeek API key is server-only
- [ ] Production secrets are set in deployment platform
- [ ] API keys are rotated if exposed
- [ ] Separate dev and production keys are used
