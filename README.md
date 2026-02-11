# Playground Forums (Repo B)

Forums mini-app built with Next.js, deployed on Vercel, and backed by Supabase Auth + Postgres.

## Status
- Current milestone: `UX Proposal Reconciliation + Remaining Gap Close PR36` implementation wave.

## Repository Role
- This repository contains the dynamic forums application.
- The static Playground hub lives in a separate repo (Repo A) and links/embeds this app.
- The Next.js application code lives in `web/`.

## Prerequisites
- Node.js LTS
- npm

## Workflow
1. Read `SPEC.md` for scoped requirements.
2. Read `PLANS.md` for planning standards.
3. Execute from the relevant current ExecPlan in `plans/` (latest: `plans/pr36-v5-ux-gap-close-execplan.md`).
4. Ship one logical chunk per PR.

UX redesign planning baseline:
- `docs/ux-proposal.md`
- `docs/ux-implementation-plan.md`
- `docs/design-tokens.md`

## Local Run
1. `cd web`
2. `npm install`
3. `npm run dev`
4. Open `http://localhost:3000`

## Smoke Check
1. Open `http://localhost:3000/` and confirm landing page renders.
2. Open `http://localhost:3000/forum` and confirm thread discovery renders.
3. Open `http://localhost:3000/health` and confirm response body is plain `OK`.

## Docs Index
- `AGENTS.md`: operating rules for Codex and contributors
- `SPEC.md`: product scope and requirements
- `PLANS.md`: ExecPlan standard
- `plans/v0-execplan.md`: detailed V0 implementation plan
- `docs/ARCHITECTURE.md`: system architecture and boundaries
- `docs/ux-proposal.md`: imported UX redesign proposal
- `docs/ux-implementation-plan.md`: PR-sized UX implementation roadmap
- `docs/design-tokens.md`: visual token decisions for the redesign
- `SECURITY.md`: secrets, auth, and RLS safety guidance
- `CONTRIBUTING.md`: contribution workflow
