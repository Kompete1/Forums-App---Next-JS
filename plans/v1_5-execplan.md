# V1.5 ExecPlan: Newsletter (Admin Create + Public Feed)

## 1. Summary
Deliver V1.5 as a minimal, production-style slice:
- Public read newsletter feed.
- Admin-only newsletter creation.

This PR keeps scope narrow by introducing a dedicated newsletter admin mapping table and a single newsletter route/UI.

## 2. Goals
- Add newsletter persistence in Supabase with clear ownership fields.
- Enforce admin-only create/update/delete via RLS.
- Keep feed publicly readable.
- Provide a minimal in-app newsletter page for read and create flows.

## 3. Non-goals
- Moderation roles (`admin/mod/user`) beyond newsletter admin mapping.
- Newsletter scheduling, templates, or email delivery.
- Rich text editing, attachments, or search.

## 4. Assumptions and Defaults
- Newsletter admin status is managed manually in Supabase Dashboard for V1.5.
- One table `newsletter_admins` controls newsletter admin permissions.
- Forum and newsletter concerns remain separate except shared auth/profile context.

## 5. User Journeys
1. Guest visitor opens `/newsletter` and can read published entries.
2. Authenticated non-admin opens `/newsletter` and sees read-only feed.
3. Authenticated admin opens `/newsletter`, sees create form, submits newsletter, and sees it in feed.

## 6. Interfaces and Data Model
- `public.newsletter_admins`
  - `user_id uuid primary key references public.profiles(id) on delete cascade`
  - `created_at timestamptz not null default now()`
- `public.newsletters`
  - `id uuid primary key default gen_random_uuid()`
  - `author_id uuid not null references public.profiles(id) on delete cascade`
  - `title text not null check (char_length(title) between 1 and 160)`
  - `body text not null check (char_length(body) between 1 and 12000)`
  - `created_at timestamptz not null default now()`
  - `updated_at timestamptz not null default now()`

App helpers:
- `src/lib/db/newsletters.ts`
  - `listNewsletters()`
  - `createNewsletter({ title, body })`
- `src/lib/db/newsletter-admins.ts`
  - `isCurrentUserNewsletterAdmin()`

Route:
- `src/app/newsletter/page.tsx`
  - Public feed render
  - Admin-only create form using server action

## 7. Authorization / RLS Policy Plan
- Enable RLS on `newsletter_admins` and `newsletters`.
- `newsletter_admins` policies:
  - select own row only (`auth.uid() = user_id`)
  - no insert/update/delete policies (managed via dashboard/service role)
- `newsletters` policies:
  - public read (`using (true)`)
  - admin owner insert (`with check auth.uid() = author_id and exists admin row`)
  - admin owner update/delete with same ownership + admin constraint

## 8. Step-by-step Implementation Plan
1. Add migration for `newsletter_admins` + `newsletters` + indexes + trigger + RLS policies.
2. Add db helpers for admin-check and newsletter list/create.
3. Add `/newsletter` page with public feed and admin create server action.
4. Add nav links to newsletter from existing pages.
5. Update `web/README.md` with exact migration apply and admin bootstrap/test steps.

## 9. Manual Platform Steps
- Apply PR3 -> PR5 -> new V1.5 migration in order.
- Add at least one admin mapping row in `newsletter_admins` from Supabase Dashboard using a known `profiles.id`.

## 10. Acceptance Criteria
1. Guest can read `/newsletter` feed.
2. Authenticated non-admin cannot create newsletter entries.
3. Authenticated admin can create newsletter entries.
4. Non-admin update/delete attempts on newsletters are rejected.
5. `npm run lint` and `npm run build` pass in `web/`.

## 11. Verification Steps
- Run `npm run lint` and `npm run build` in `web/`.
- Manual checks:
  - Guest feed visibility.
  - Non-admin no create UI + failed write attempts.
  - Admin create success and feed refresh.

## 12. Risks and Mitigations
- Risk: no admin row configured so create appears unavailable.
  - Mitigation: explicit README bootstrap SQL for `newsletter_admins`.
- Risk: policy logic drift.
  - Mitigation: keep policy expressions centralized and documented.

## 13. Rollback / Backout
- If migration introduces issues, ship a corrective migration disabling writes and preserving public read.
- If UI issues occur, keep `/newsletter` read-only while policy/data fix is deployed.
