create extension if not exists pgcrypto;

create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('thread', 'reply')),
  thread_id uuid references public.posts(id) on delete cascade,
  reply_id uuid references public.replies(id) on delete cascade,
  kind text not null default 'like' check (kind = 'like'),
  created_at timestamptz not null default now(),
  constraint reactions_exactly_one_target_chk
    check (((thread_id is not null)::int + (reply_id is not null)::int) = 1),
  constraint reactions_target_type_consistency_chk
    check (
      (target_type = 'thread' and thread_id is not null and reply_id is null)
      or
      (target_type = 'reply' and reply_id is not null and thread_id is null)
    )
);

create index if not exists reactions_thread_idx
  on public.reactions (thread_id, created_at desc)
  where thread_id is not null;

create index if not exists reactions_reply_idx
  on public.reactions (reply_id, created_at desc)
  where reply_id is not null;

create index if not exists reactions_author_idx
  on public.reactions (author_id, created_at desc);

create unique index if not exists reactions_unique_author_thread_kind_idx
  on public.reactions (author_id, thread_id, kind)
  where thread_id is not null;

create unique index if not exists reactions_unique_author_reply_kind_idx
  on public.reactions (author_id, reply_id, kind)
  where reply_id is not null;

alter table public.reactions enable row level security;

drop policy if exists "reactions public read" on public.reactions;
create policy "reactions public read"
  on public.reactions
  for select
  using (true);

drop policy if exists "reactions owner insert with self-like guard" on public.reactions;
create policy "reactions owner insert with self-like guard"
  on public.reactions
  for insert
  with check (
    auth.uid() = author_id
    and kind = 'like'
    and (
      (target_type = 'thread'
        and thread_id is not null
        and exists (
          select 1
          from public.posts p
          where p.id = reactions.thread_id
            and p.author_id <> auth.uid()
        )
      )
      or
      (target_type = 'reply'
        and reply_id is not null
        and exists (
          select 1
          from public.replies r
          where r.id = reactions.reply_id
            and r.author_id <> auth.uid()
        )
      )
    )
  );
