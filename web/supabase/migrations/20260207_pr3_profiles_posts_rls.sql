create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text check (display_name is null or char_length(display_name) between 1 and 40),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_created_at_desc_idx on public.posts (created_at desc);
create index if not exists posts_author_id_idx on public.posts (author_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'display_name', '')
  )
  on conflict (id) do update
  set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_posts_updated_at on public.posts;
create trigger set_posts_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

insert into public.profiles (id, email, display_name)
select
  u.id,
  coalesce(u.email, ''),
  nullif(u.raw_user_meta_data ->> 'display_name', '')
from auth.users u
on conflict (id) do update
set email = excluded.email;

alter table public.profiles enable row level security;
alter table public.posts enable row level security;

drop policy if exists "profiles public read" on public.profiles;
create policy "profiles public read"
  on public.profiles
  for select
  using (true);

drop policy if exists "profiles owner insert" on public.profiles;
create policy "profiles owner insert"
  on public.profiles
  for insert
  with check (auth.uid() = id);

drop policy if exists "profiles owner update" on public.profiles;
create policy "profiles owner update"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "posts public read" on public.posts;
create policy "posts public read"
  on public.posts
  for select
  using (true);

drop policy if exists "posts owner insert" on public.posts;
create policy "posts owner insert"
  on public.posts
  for insert
  with check (auth.uid() = author_id);

drop policy if exists "posts owner update" on public.posts;
create policy "posts owner update"
  on public.posts
  for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

drop policy if exists "posts owner delete" on public.posts;
create policy "posts owner delete"
  on public.posts
  for delete
  using (auth.uid() = author_id);
