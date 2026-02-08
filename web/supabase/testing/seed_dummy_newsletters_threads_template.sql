-- Template: seed dummy newsletters and optional seed thread placeholders.
-- Replace test email values with real test accounts from auth.users.
-- Seed marker: [SEED] used for safe cleanup in reset template.

with chosen_users as (
  select id, email
  from auth.users
  where email in ('test-admin@example.com', 'test-user-a@example.com')
),
admin_user as (
  select id
  from chosen_users
  where email = 'test-admin@example.com'
  limit 1
),
default_category as (
  select id
  from public.categories
  where slug = 'general-paddock'
  limit 1
)
insert into public.newsletters (author_id, title, body)
select
  a.id,
  v.title,
  v.body
from admin_user a
cross join (
  values
    ('[SEED] Weekend Preview: Kyalami', 'Seed newsletter body for testing discussion CTA and forum linkage.'),
    ('[SEED] Rally Route Notes', 'Seed newsletter body for testing category and discussion workflows.')
) as v(title, body)
on conflict do nothing;

-- Optional seed threads (uses whichever regular test user exists)
insert into public.posts (author_id, category_id, title, body)
select
  u.id,
  c.id,
  '[SEED] Thread from fixture setup',
  'Seed thread body for moderation/report/reply regression checks.'
from chosen_users u
cross join default_category c
where u.email = 'test-user-a@example.com'
  and not exists (
    select 1
    from public.posts p
    where p.author_id = u.id
      and p.title = '[SEED] Thread from fixture setup'
  );

-- Verify seeded records
select id, title, created_at
from public.newsletters
where title like '[SEED]%'
order by created_at desc;
