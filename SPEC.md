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
- UI/UX redesign for readability and domain-specific information architecture.

## V2 Implementation Status (Current)
- Completed:
  - Roles foundation (`user_roles`, role-based RLS checks)
  - Thread locking (mod/admin lock/unlock + locked-reply guard)
  - Reports pipeline (report thread/reply + moderator review list)
  - Anti-spam/rate-limit basics (DB-enforced cooldowns for thread/reply/report + report burst cap)
  - Hardening baseline (Playwright e2e smoke coverage + standardized write feedback parsing + verification assets)
  - South African motorsport UI/UX refresh foundations:
    - Landing-first IA (`/`, `/forum`, `/forum/[threadId]`)
    - Readability-first design system and navigation shell
    - SA motorsport category model including sim racing
- Deferred / Skipped for now:
  - Hide/remove posts moderation slice
- Remaining V2 focus:
  - Optional refinements only (tuning cooldown values/UX copy if needed)

## V3: Platform Features
- In-app notifications.
- Realtime updates.
- Attachments/images (Supabase Storage).
- Admin dashboard.

## V3 Implementation Status (Active)
- Completed:
  - PR17 notifications bundle:
    - `notifications` schema + recipient-scoped RLS
    - trigger-driven notification events for replies/reports
    - `/notifications` inbox + read-state controls
    - header unread badge + realtime inbox refresh
  - PR19 forum UX polish and layout refinements
  - PR20 newsletter -> forum discussion bridge
  - PR21 dummy users/mods + test fixture SQL templates
  - PR22 attachments/images (Supabase Storage)
- In progress:
  - PR23 admin dashboard
- Planned next:
  - PR24 production hardening pack

## V4: Production Hardening
- Backup/restore habit.
- Logging/monitoring practice.
- Data retention/privacy notes.
- Planned execution slice:
  - PR24 production hardening pack

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

## Documentation Sync Contract
- Every feature PR must include:
  - one new `plans/<pr>-execplan.md`
  - a `SPEC.md` status update
  - at least one verification-doc update (`web/README.md` or `web/docs/testing-manual.md`)
- No PR is done until docs explicitly cover:
  - what changed
  - how it was verified
  - what remains pending
- Root `README.md` milestone pointer must match the active PR.

## Out of Scope Repo Boundary
- Repo A changes are tracked separately, except for documented integration instructions.
