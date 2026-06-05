# References

Use official documentation when implementing provider-specific features.

## Supabase

Supabase overview:

https://supabase.com/

Supabase Auth:

https://supabase.com/docs/guides/auth

Supabase users:

https://supabase.com/docs/guides/auth/users

Supabase user/profile data:

https://supabase.com/docs/guides/auth/managing-user-data

Supabase Row Level Security:

https://supabase.com/docs/guides/database/postgres/row-level-security

Supabase Storage:

https://supabase.com/docs/guides/storage

Supabase Storage access control:

https://supabase.com/docs/guides/storage/security/access-control

Supabase Admin Auth invite:

https://supabase.com/docs/reference/javascript/auth-admin-inviteuserbyemail

## Resend

Resend API introduction:

https://resend.com/docs/api-reference/introduction

Resend API key handling:

https://resend.com/docs/knowledge-base/how-to-handle-api-keys

Resend API keys:

https://resend.com/docs/dashboard/api-keys/introduction

## DeepSeek

DeepSeek API docs:

https://api-docs.deepseek.com/

DeepSeek API authentication:

https://api-docs.deepseek.com/api/deepseek-api

## Notes

- Keep provider secrets server-side only.
- Use Supabase RLS for database-level access control.
- Use server-side routes/actions for privileged work.
- Keep the AI provider replaceable through an adapter pattern.
