create extension if not exists pgcrypto;

create table if not exists public.newsletter_admins (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.newsletters (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  body text not null check (char_length(body) between 1 and 12000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists newsletters_created_at_desc_idx
  on public.newsletters (created_at desc);

create index if not exists newsletters_author_id_idx
  on public.newsletters (author_id);

drop trigger if exists set_newsletters_updated_at on public.newsletters;
create trigger set_newsletters_updated_at
before update on public.newsletters
for each row execute function public.set_updated_at();

alter table public.newsletter_admins enable row level security;
alter table public.newsletters enable row level security;

drop policy if exists "newsletter_admins own read" on public.newsletter_admins;
create policy "newsletter_admins own read"
  on public.newsletter_admins
  for select
  using (auth.uid() = user_id);

drop policy if exists "newsletters public read" on public.newsletters;
create policy "newsletters public read"
  on public.newsletters
  for select
  using (true);

drop policy if exists "newsletters admin owner insert" on public.newsletters;
create policy "newsletters admin owner insert"
  on public.newsletters
  for insert
  with check (
    auth.uid() = author_id
    and exists (
      select 1
      from public.newsletter_admins na
      where na.user_id = auth.uid()
    )
  );

drop policy if exists "newsletters admin owner update" on public.newsletters;
create policy "newsletters admin owner update"
  on public.newsletters
  for update
  using (
    auth.uid() = author_id
    and exists (
      select 1
      from public.newsletter_admins na
      where na.user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = author_id
    and exists (
      select 1
      from public.newsletter_admins na
      where na.user_id = auth.uid()
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
      from public.newsletter_admins na
      where na.user_id = auth.uid()
    )
  );
