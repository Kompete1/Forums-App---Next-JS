create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'app_role'
      and n.nspname = 'public'
  ) then
    create type public.app_role as enum ('admin', 'mod', 'user');
  end if;
end
$$;

create table if not exists public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create index if not exists user_roles_role_idx
  on public.user_roles (role);

insert into public.user_roles (user_id, role)
select p.id, 'user'::public.app_role
from public.profiles p
on conflict (user_id, role) do nothing;

create or replace function public.handle_new_profile_default_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'user'::public.app_role)
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

drop trigger if exists on_profile_created_set_default_role on public.profiles;
create trigger on_profile_created_set_default_role
after insert on public.profiles
for each row execute procedure public.handle_new_profile_default_role();

alter table public.user_roles enable row level security;

drop policy if exists "user_roles own read" on public.user_roles;
create policy "user_roles own read"
  on public.user_roles
  for select
  using (auth.uid() = user_id);

drop policy if exists "newsletters admin owner insert" on public.newsletters;
create policy "newsletters admin owner insert"
  on public.newsletters
  for insert
  with check (
    auth.uid() = author_id
    and exists (
      select 1
      from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role = 'admin'::public.app_role
    )
  );

drop policy if exists "newsletters admin owner update" on public.newsletters;
drop policy if exists "newsletters admin owner_update" on public.newsletters;
create policy "newsletters admin owner update"
  on public.newsletters
  for update
  using (
    auth.uid() = author_id
    and exists (
      select 1
      from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role = 'admin'::public.app_role
    )
  )
  with check (
    auth.uid() = author_id
    and exists (
      select 1
      from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role = 'admin'::public.app_role
    )
  );

drop policy if exists "newsletters admin owner delete" on public.newsletters;
create policy "newsletters admin owner delete"
  on public.newsletters
  for delete
  using (
    auth.uid() = author_id
    and exists (
      select 1
      from public.user_roles ur
      where ur.user_id = auth.uid()
        and ur.role = 'admin'::public.app_role
    )
  );
