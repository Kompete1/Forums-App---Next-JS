# Architecture

## System Context
- Repo A: static Playground hub on GitHub Pages.
- Repo B (this repo): Next.js forums app on Vercel.
- Supabase: authentication + PostgreSQL + RLS policies.

Repo A points users into Repo B using an iframe and/or direct link.

## Runtime Boundaries
- Browser talks directly to Supabase using anon key for safe client operations.
- Protected writes are constrained by Supabase RLS policies.
- Vercel hosts frontend and optional server-side routes/components.

## Data/Auth Flow (V0)
1. User opens app route in Repo B deployment.
2. User signs up or logs in via Supabase Auth.
3. Session state drives UI on hello page.
4. Profile row is created for each auth user (trigger-based).

## Security Boundary Notes
- Secrets remain in `.env.local` and Vercel env vars.
- Only `NEXT_PUBLIC_*` values needed for client-side Supabase initialization.
- Authorization is enforced by database policies, not only UI.

## Deployment Flow
1. Push branch/PR to GitHub.
2. Vercel creates preview deployment.
3. Merge to main for production deployment.
4. Repo A references production URL.

## Evolution Points
- V1: categories/threads/posts schema and RLS expansion.
- V1.5: newsletter tables and admin-only policies.
- V2+: moderation roles, search, anti-spam, and QoL additions.
