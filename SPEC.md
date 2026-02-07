# Playground Forums Spec (Repo B)

## Vision
Build a production-style forums mini-app (Next.js + Vercel + Supabase) that is linked or embedded from the Playground hub (Repo A), with explicit focus on learning auth, authorization, schema design, and delivery workflow.

## Audience
- Primary: project owner/learner building real deployment habits.
- Secondary: contributors reviewing changes through small PRs.

## Product Principles
- Keep V0 minimal and testable.
- Prefer explicit permissions over implicit trust.
- Separate static hub concerns (Repo A) from dynamic app concerns (Repo B).
- Keep documentation up-to-date with implementation.

## Versioned Scope

## V0: Setup + Hello Forum
- Next.js app deployed on Vercel.
- Supabase project connected.
- Email/password auth works (signup/login/reset).
- Session-aware hello page.
- Repo A `forums.html` embeds or links to deployed app.

## V1: MVP Forum
- Public read: categories, threads, posts.
- Authenticated write: create thread/reply.
- Minimal profile (display name).
- RLS for read/write ownership boundaries.

## V1.5: News/Newsletter
- Admin-only newsletter creation.
- Public newsletter feed.

## V2: Moderation and QoL
- Roles: admin/mod/user.
- Lock threads, hide/remove posts, reports.
- Pagination, search, anti-spam/rate limit basics.

## V2 Implementation Status (Current)
- Completed:
  - Roles foundation (`user_roles`, role-based RLS checks)
  - Thread locking (mod/admin lock/unlock + locked-reply guard)
  - Reports pipeline (report thread/reply + moderator review list)
- Deferred / Skipped for now:
  - Hide/remove posts moderation slice
- Remaining V2 focus:
  - Pagination/search/anti-spam-rate-limit basics

## V3: Platform Features
- In-app notifications.
- Realtime updates.
- Attachments/images (Supabase Storage).
- Admin dashboard.

## V4: Production Hardening
- Backup/restore habit.
- Logging/monitoring practice.
- Data retention/privacy notes.

## Non-Goals (Current)
- Complex rich-text editor.
- Advanced email pipeline.
- Multi-tenant forum architecture.

## Functional Requirements (Current Baseline)
- Authenticated identity and session visibility in UI.
- Persisted minimal user profile linked to auth user.
- Clear route separation for public vs auth-only actions.

## Non-Functional Requirements
- Reproducible setup via docs.
- No secret leakage in repo.
- Simple, maintainable dependency set.

## Acceptance Criteria Source of Truth
- Version-specific acceptance criteria are defined in `plans/*.md`.
- V0 criteria are in `plans/v0-execplan.md`.

## Out of Scope Repo Boundary
- Repo A changes are tracked separately, except for documented integration instructions.
