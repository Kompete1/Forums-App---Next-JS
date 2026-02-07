create extension if not exists pgcrypto;

alter table public.posts
add column if not exists is_locked boolean not null default false,
add column if not exists locked_at timestamptz,
add column if not exists locked_by uuid references public.profiles(id) on delete set null;

create index if not exists posts_is_locked_idx on public.posts (is_locked);

create or replace function public.is_moderator_or_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = uid
      and ur.role in ('admin'::public.app_role, 'mod'::public.app_role)
  );
$$;

drop policy if exists "posts moderator lock update" on public.posts;
create policy "posts moderator lock update"
  on public.posts
  for update
  using (public.is_moderator_or_admin(auth.uid()))
  with check (public.is_moderator_or_admin(auth.uid()));

drop policy if exists "replies owner insert" on public.replies;
create policy "replies owner insert"
  on public.replies
  for insert
  with check (
    auth.uid() = author_id
    and exists (
      select 1
      from public.posts p
      where p.id = thread_id
        and p.is_locked = false
    )
  );
