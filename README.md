# Playground Forums (Repo B)

Forums mini-app built with Next.js, deployed on Vercel, and backed by Supabase Auth + Postgres.

## Status
- Current milestone: `V0` planning and docs baseline.
- Implementation begins after plan approval.

## Repository Role
- This repository contains the dynamic forums application.
- The static Playground hub lives in a separate repo (Repo A) and links/embeds this app.

## Prerequisites
- Node.js LTS
- npm
- Supabase account/project
- Vercel account connected to GitHub

## Environment Variables
Copy `.env.example` to `.env.local` and fill in values from Supabase:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Do not commit `.env.local`.

## Workflow
1. Read `SPEC.md` for scoped requirements.
2. Read `PLANS.md` for planning standards.
3. Execute from `plans/v0-execplan.md` for V0.
4. Ship one logical chunk per PR.

## Docs Index
- `AGENTS.md`: operating rules for Codex and contributors
- `SPEC.md`: product scope and requirements
- `PLANS.md`: ExecPlan standard
- `plans/v0-execplan.md`: detailed V0 implementation plan
- `docs/ARCHITECTURE.md`: system architecture and boundaries
- `SECURITY.md`: secrets, auth, and RLS safety guidance
- `CONTRIBUTING.md`: contribution workflow
