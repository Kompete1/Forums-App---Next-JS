create extension if not exists pgcrypto;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  kind text not null check (kind in ('reply_received', 'thread_reported', 'report_status_changed')),
  thread_id uuid references public.posts(id) on delete cascade,
  reply_id uuid references public.replies(id) on delete cascade,
  report_id uuid references public.reports(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  constraint notifications_read_timestamp_chk check (
    (is_read = false and read_at is null)
    or
    (is_read = true and read_at is not null)
  )
);

create index if not exists notifications_recipient_created_at_desc_idx
  on public.notifications (recipient_id, created_at desc);

create index if not exists notifications_recipient_is_read_created_at_desc_idx
  on public.notifications (recipient_id, is_read, created_at desc);

create index if not exists notifications_unread_recipient_idx
  on public.notifications (recipient_id)
  where is_read = false;

create or replace function public.enforce_notifications_read_update()
returns trigger
language plpgsql
as $$
begin
  if new.recipient_id <> old.recipient_id
    or coalesce(new.actor_id, '00000000-0000-0000-0000-000000000000'::uuid) <> coalesce(old.actor_id, '00000000-0000-0000-0000-000000000000'::uuid)
    or new.kind <> old.kind
    or coalesce(new.thread_id, '00000000-0000-0000-0000-000000000000'::uuid) <> coalesce(old.thread_id, '00000000-0000-0000-0000-000000000000'::uuid)
    or coalesce(new.reply_id, '00000000-0000-0000-0000-000000000000'::uuid) <> coalesce(old.reply_id, '00000000-0000-0000-0000-000000000000'::uuid)
    or coalesce(new.report_id, '00000000-0000-0000-0000-000000000000'::uuid) <> coalesce(old.report_id, '00000000-0000-0000-0000-000000000000'::uuid)
    or new.payload <> old.payload
    or new.created_at <> old.created_at
  then
    raise exception 'NOTIFICATIONS_READ_ONLY_FIELDS';
  end if;

  if new.is_read = true and new.read_at is null then
    new.read_at = now();
  end if;

  if new.is_read = false then
    new.read_at = null;
  end if;

  return new;
end;
$$;

create or replace function public.create_reply_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  thread_author_id uuid;
begin
  select p.author_id
  into thread_author_id
  from public.posts p
  where p.id = new.thread_id;

  if thread_author_id is null then
    return new;
  end if;

  if thread_author_id = new.author_id then
    return new;
  end if;

  insert into public.notifications (
    recipient_id,
    actor_id,
    kind,
    thread_id,
    reply_id,
    payload
  )
  values (
    thread_author_id,
    new.author_id,
    'reply_received',
    new.thread_id,
    new.id,
    jsonb_build_object('reply_preview', left(new.body, 120))
  );

  return new;
end;
$$;

create or replace function public.create_report_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (
    recipient_id,
    actor_id,
    kind,
    thread_id,
    reply_id,
    report_id,
    payload
  )
  select distinct
    ur.user_id,
    new.reporter_id,
    'thread_reported',
    new.thread_id,
    new.reply_id,
    new.id,
    jsonb_build_object('target_type', new.target_type, 'reason', left(new.reason, 180))
  from public.user_roles ur
  where ur.role in ('admin'::public.app_role, 'mod'::public.app_role)
    and ur.user_id <> new.reporter_id;

  return new;
end;
$$;

alter table public.notifications enable row level security;

drop policy if exists "notifications recipient read" on public.notifications;
create policy "notifications recipient read"
  on public.notifications
  for select
  using (auth.uid() = recipient_id);

drop policy if exists "notifications recipient update" on public.notifications;
create policy "notifications recipient update"
  on public.notifications
  for update
  using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);

drop trigger if exists enforce_notifications_read_update_before_update on public.notifications;
create trigger enforce_notifications_read_update_before_update
before update on public.notifications
for each row execute function public.enforce_notifications_read_update();

drop trigger if exists create_reply_notification_after_insert on public.replies;
create trigger create_reply_notification_after_insert
after insert on public.replies
for each row execute function public.create_reply_notification();

drop trigger if exists create_report_notification_after_insert on public.reports;
create trigger create_report_notification_after_insert
after insert on public.reports
for each row execute function public.create_report_notification();
