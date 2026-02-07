# PR11 ExecPlan: V2 Thread Locking (Schema + RLS + Minimal UI)

## Summary
Add the first moderation control in V2: thread locking. Admins/mods can lock or unlock threads, and locked threads reject new replies at RLS level.

## Scope
- Schema updates on `posts` for lock state.
- SQL function for role-based moderator checks.
- RLS updates for moderator lock/unlock and reply-insert lock guard.
- Minimal `/forum` UI + server actions for lock/unlock controls.

## Out of Scope
- Reports workflow
- Content hide/remove moderation
- Moderator dashboard

## Acceptance Criteria
1. `npm run lint` passes in `web/`.
2. `npm run build` passes in `web/`.
3. Admin/mod can lock/unlock threads.
4. Locked state is visible in `/forum`.
5. Reply creation is blocked on locked threads by RLS.
6. Non-moderator users cannot lock/unlock threads.

## Verification
- Grant `mod` role to one user and verify lock/unlock controls work.
- Verify regular user sees no lock/unlock controls.
- Verify reply insert fails on locked thread and succeeds after unlock.
