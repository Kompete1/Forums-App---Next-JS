create extension if not exists pgcrypto;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('thread', 'reply')),
  thread_id uuid references public.posts(id) on delete cascade,
  reply_id uuid references public.replies(id) on delete cascade,
  reason text not null check (char_length(reason) between 1 and 500),
  notes text check (notes is null or char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  constraint reports_exactly_one_target_chk
    check (((thread_id is not null)::int + (reply_id is not null)::int) = 1),
  constraint reports_target_type_consistency_chk
    check (
      (target_type = 'thread' and thread_id is not null and reply_id is null)
      or
      (target_type = 'reply' and reply_id is not null and thread_id is null)
    )
);

create index if not exists reports_created_at_desc_idx
  on public.reports (created_at desc);

create index if not exists reports_target_thread_idx
  on public.reports (thread_id)
  where thread_id is not null;

create index if not exists reports_target_reply_idx
  on public.reports (reply_id)
  where reply_id is not null;

create unique index if not exists reports_unique_reporter_thread_idx
  on public.reports (reporter_id, thread_id)
  where thread_id is not null;

create unique index if not exists reports_unique_reporter_reply_idx
  on public.reports (reporter_id, reply_id)
  where reply_id is not null;

alter table public.reports enable row level security;

drop policy if exists "reports reporter insert" on public.reports;
create policy "reports reporter insert"
  on public.reports
  for insert
  with check (auth.uid() = reporter_id);

drop policy if exists "reports reporter own read" on public.reports;
create policy "reports reporter own read"
  on public.reports
  for select
  using (auth.uid() = reporter_id);

drop policy if exists "reports moderator read" on public.reports;
create policy "reports moderator read"
  on public.reports
  for select
  using (public.is_moderator_or_admin(auth.uid()));
