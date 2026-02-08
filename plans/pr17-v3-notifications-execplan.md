# PR17 ExecPlan: V3 Notifications Bundle (Schema + Events + Inbox + Realtime)

## Summary
Launch V3 with a full notifications vertical slice: schema, trigger-driven event generation, inbox UI, read-state controls, header unread badge, and realtime inbox refresh.

## Goals
- Persist notifications with strict recipient-scoped RLS.
- Generate notifications from reply and report actions.
- Provide a signed-in notifications inbox with mark-read controls.
- Surface unread count in top navigation.
- Add baseline e2e coverage and explicit manual checks for role-sensitive flows.

## Non-goals
- Push/email notifications.
- Attachments/storage workflows.
- Admin dashboard feature buildout.
- Deferred hide/remove moderation slice.

## Interfaces and Data Model
- New route: `web/src/app/notifications/page.tsx`
- New db helper: `web/src/lib/db/notifications.ts`
- New realtime client helper: `web/src/components/notifications-realtime-sync.tsx`
- New migration: `web/supabase/migrations/20260208_pr17_v3_notifications.sql`

`public.notifications` columns:
- `id uuid pk default gen_random_uuid()`
- `recipient_id uuid not null references public.profiles(id) on delete cascade`
- `actor_id uuid null references public.profiles(id) on delete set null`
- `kind text not null check (kind in ('reply_received', 'thread_reported', 'report_status_changed'))`
- `thread_id uuid null references public.posts(id) on delete cascade`
- `reply_id uuid null references public.replies(id) on delete cascade`
- `report_id uuid null references public.reports(id) on delete cascade`
- `payload jsonb not null default '{}'::jsonb`
- `is_read boolean not null default false`
- `created_at timestamptz not null default now()`
- `read_at timestamptz null`

## Authorization / RLS
- `select`: recipient-only (`auth.uid() = recipient_id`)
- `update`: recipient-only (`auth.uid() = recipient_id`)
- no insert/delete policies for client role
- trigger-generated inserts use security-definer functions
- before-update guard trigger blocks changes to non-read fields

## Step-by-step Implementation
1. Add PR17 migration with notifications table/indexes/RLS/functions/triggers.
2. Add notifications db helper APIs for list + read updates + unread count.
3. Add `/notifications` page with paginated list + mark one/all read actions.
4. Add header notifications nav link + unread badge.
5. Add realtime component to refresh inbox on notification insert/update for current user.
6. Extend Playwright e2e for notifications route/read-state and optional dual-user reply notification flow.
7. Update docs (`SPEC.md`, `README.md`, `web/README.md`, `web/docs/testing-manual.md`, `plans/v2-execplan.md`).

## Acceptance Criteria
1. `npm run lint` passes.
2. `npm run build` passes.
3. `npm run test:e2e` passes (dual-user notification scenario skips when secondary creds are absent).
4. Signed-in users can open `/notifications`, mark one read, and mark all read.
5. Header shows notifications link and unread count badge (capped at `99+`).
6. Reply on another user's thread creates recipient notification.
7. New reports create moderator/admin notifications.

## Verification
- Local:
  - `npm run lint`
  - `npm run build`
  - `npm run test:e2e`
- Supabase dashboard:
  - apply `20260208_pr17_v3_notifications.sql`
- Manual:
  - verify moderator report notifications and self-notification skip
  - verify realtime refresh in `/notifications`
  - verify cross-user notification access denial
