# V2 ExecPlan: Moderation, QoL, and UX Refresh

## Summary
V2 started with a roles foundation and has progressed through thread locking and reports.
This document now tracks completed slices and explicit deferrals.

## Current Status
- Completed PR10: Roles foundation (`user_roles`, role-based newsletter authorization).
- Completed PR11: Thread locking (`posts.is_locked` + mod/admin lock policy + locked-reply guard).
- Completed PR12: Reports pipeline (`reports` table + reporter/moderator RLS + `/moderation/reports`).
- Completed PR13: SA motorsport UI/UX redesign foundation (`/` landing refresh, `/forum` discovery, `/forum/[threadId]` detail, category model refresh).
- Completed PR14: forum IA refactor (`/forum` threads-first layout, `/forum/new`, `/forum/category/[slug]`, `/profile`).
- Completed PR15: anti-spam/rate-limit basics (DB cooldown triggers on posts/replies/reports + report burst cap + inline UI feedback).
- Deferred for now: hide/remove posts moderation slice.
- Remaining V2 priorities: optional QoL tuning and deferred moderation revisit decision.

## Goals
- Preserve completed moderation foundation and document validated behavior.
- Keep V2 work split into small reviewable PRs.
- Make defer/skip decisions explicit to avoid roadmap ambiguity.

## Scope
- Documentation of completed V2 slices and verification expectations.
- Record that hide/remove moderation is intentionally deferred.

## Out of Scope
- Re-opening already completed PR10/PR11/PR12/PR13 work.
- Implementing deferred hide/remove moderation in this cycle.

## Acceptance Criteria
1. Docs reflect completed V2 slices through PR15.
2. Docs explicitly state hide/remove moderation is deferred/skipped for now.
3. Remaining V2 priorities are documented without reintroducing deferred scope as active.

## Verification
- `SPEC.md` includes current V2 status and defer note.
- `plans/v2-execplan.md` reflects PR10/PR11/PR12 completion and remaining scope.
- `plans/pr13-v2-ui-redesign-execplan.md`, `plans/pr14-v2-forum-ia-refactor-execplan.md`, and `plans/pr15-v2-anti-spam-execplan.md` exist and align with implementation.
- `web/README.md` includes updated IA/status note with the defer decision.

## Risks / Mitigations
- Risk: team assumes hide/remove moderation is still in active implementation.
  - Mitigation: explicit deferred status in spec/plan/readme.
- Risk: roadmap drift after multiple merged PRs.
  - Mitigation: keep this file as the single V2 progress snapshot.
