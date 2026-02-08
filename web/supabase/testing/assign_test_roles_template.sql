-- Template: assign test roles in user_roles
-- Replace emails with your test account emails created in Supabase Auth.
-- Safe to rerun; uses upsert behavior.

with selected_users as (
  select id, email
  from auth.users
  where email in (
    'test-admin@example.com',
    'test-mod@example.com',
    'test-user-a@example.com',
    'test-user-b@example.com'
  )
)
insert into public.user_roles (user_id, role)
select su.id, roles.role::public.app_role
from selected_users su
join lateral (
  values
    (case when su.email = 'test-admin@example.com' then 'admin' end),
    (case when su.email = 'test-mod@example.com' then 'mod' end),
    (case when su.email in ('test-user-a@example.com', 'test-user-b@example.com') then 'user' end)
) as roles(role) on roles.role is not null
on conflict (user_id, role) do nothing;

-- Verify
select u.email, ur.role, ur.created_at
from public.user_roles ur
join auth.users u on u.id = ur.user_id
where u.email in (
  'test-admin@example.com',
  'test-mod@example.com',
  'test-user-a@example.com',
  'test-user-b@example.com'
)
order by u.email, ur.role;
