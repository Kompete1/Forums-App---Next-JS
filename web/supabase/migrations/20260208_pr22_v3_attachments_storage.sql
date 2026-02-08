create extension if not exists pgcrypto;

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  thread_id uuid references public.posts(id) on delete cascade,
  reply_id uuid references public.replies(id) on delete cascade,
  file_name text not null check (char_length(file_name) between 1 and 255),
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/gif')),
  byte_size integer not null check (byte_size > 0 and byte_size <= 5242880),
  storage_path text not null unique check (char_length(storage_path) between 1 and 500),
  created_at timestamptz not null default now(),
  constraint attachments_target_chk check (((thread_id is not null)::int + (reply_id is not null)::int) = 1)
);

create index if not exists attachments_thread_id_created_at_idx
  on public.attachments (thread_id, created_at desc)
  where thread_id is not null;

create index if not exists attachments_reply_id_created_at_idx
  on public.attachments (reply_id, created_at desc)
  where reply_id is not null;

create index if not exists attachments_owner_id_created_at_idx
  on public.attachments (owner_id, created_at desc);

alter table public.attachments enable row level security;

drop policy if exists "attachments public read" on public.attachments;
create policy "attachments public read"
  on public.attachments
  for select
  using (
    (thread_id is not null and exists (select 1 from public.posts p where p.id = thread_id))
    or (reply_id is not null and exists (select 1 from public.replies r where r.id = reply_id))
  );

drop policy if exists "attachments owner insert" on public.attachments;
create policy "attachments owner insert"
  on public.attachments
  for insert
  with check (
    auth.uid() = owner_id
    and (
      (thread_id is not null and exists (select 1 from public.posts p where p.id = thread_id and p.author_id = auth.uid()))
      or (reply_id is not null and exists (select 1 from public.replies r where r.id = reply_id and r.author_id = auth.uid()))
    )
  );

drop policy if exists "attachments owner or mod delete" on public.attachments;
create policy "attachments owner or mod delete"
  on public.attachments
  for delete
  using (auth.uid() = owner_id or public.is_moderator_or_admin(auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'forum-attachments',
  'forum-attachments',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "forum attachments public read" on storage.objects;
create policy "forum attachments public read"
  on storage.objects
  for select
  using (
    bucket_id = 'forum-attachments'
    and exists (
      select 1
      from public.attachments a
      where a.storage_path = name
        and (
          (a.thread_id is not null and exists (select 1 from public.posts p where p.id = a.thread_id))
          or (a.reply_id is not null and exists (select 1 from public.replies r where r.id = a.reply_id))
        )
    )
  );

drop policy if exists "forum attachments owner insert" on storage.objects;
create policy "forum attachments owner insert"
  on storage.objects
  for insert
  with check (
    bucket_id = 'forum-attachments'
    and auth.uid() is not null
    and split_part(name, '/', 1) = auth.uid()::text
  );

drop policy if exists "forum attachments owner or mod delete" on storage.objects;
create policy "forum attachments owner or mod delete"
  on storage.objects
  for delete
  using (
    bucket_id = 'forum-attachments'
    and auth.uid() is not null
    and (
      split_part(name, '/', 1) = auth.uid()::text
      or public.is_moderator_or_admin(auth.uid())
    )
  );
