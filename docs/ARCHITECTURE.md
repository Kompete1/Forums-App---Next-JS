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

## Route Boundaries (Current)
- `/`: landing page with SA motorsport hero carousel and latest thread/category entry points.
- `/forum`: global thread discovery (threads-first, filter rail, pagination, create-thread CTA).
- `/forum/new`: dedicated thread creation form.
- `/forum/category/[slug]`: category-specific thread discovery.
- `/forum/[threadId]`: thread detail (replying, reporting, owner edit/delete, mod lock/unlock).
- `/categories`: category directory for forum taxonomy.
- `/profile`: account settings and display name updates.
- `/moderation/reports`: role-gated moderation report review.
- `/newsletter`: public feed with admin-only creation.
- `/forum/new?fromNewsletter=<newsletter-id>`: prefilled thread creation from newsletter CTA.
- `/forum?newsletter=<newsletter-id>`: linked-discussion filtering for newsletter topics.
- `/notifications`: signed-in inbox for reply/report notifications with read-state controls.
- `/admin`: moderator/admin operational dashboard with read-only operational summaries.
- Header shell: signed-in avatar menu + notification bell dropdown + theme toggle (light/dark tokens).
- `/profile?tab=activity`: signed-in activity view (recent threads/replies/notifications).
- Writer UX: markdown toolbar + preview (feature-flagged) + local draft autosave for `/forum/new` and `/forum/[threadId]` reply composer.

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
- V2+: moderation roles, search, UI readability and domain-focused IA, anti-spam, and QoL additions.
- V3:
  - Completed: notifications + realtime inbox refresh.
  - Completed: PR19 forum UX polish.
  - Completed: PR20 newsletter discussion bridge.
  - Completed: PR21 test fixtures.
  - Completed: PR22 attachments and storage.
  - Completed: PR23 admin dashboard.
- V4:
  - Active: PR24 production hardening pack (headers, logging hygiene, retention/runbook docs).
