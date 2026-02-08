create extension if not exists pgcrypto;

create index if not exists posts_author_id_created_at_desc_idx
  on public.posts (author_id, created_at desc);

create index if not exists replies_author_id_created_at_desc_idx
  on public.replies (author_id, created_at desc);

create index if not exists reports_reporter_id_created_at_desc_idx
  on public.reports (reporter_id, created_at desc);

create or replace function public.enforce_posts_rate_limit()
returns trigger
language plpgsql
as $$
declare
  last_created_at timestamptz;
begin
  select p.created_at
  into last_created_at
  from public.posts p
  where p.author_id = new.author_id
  order by p.created_at desc
  limit 1;

  if last_created_at is not null and (now() - last_created_at) < interval '60 seconds' then
    raise exception 'RATE_LIMIT_THREAD_COOLDOWN';
  end if;

  return new;
end;
$$;

create or replace function public.enforce_replies_rate_limit()
returns trigger
language plpgsql
as $$
declare
  last_created_at timestamptz;
begin
  select r.created_at
  into last_created_at
  from public.replies r
  where r.author_id = new.author_id
  order by r.created_at desc
  limit 1;

  if last_created_at is not null and (now() - last_created_at) < interval '20 seconds' then
    raise exception 'RATE_LIMIT_REPLY_COOLDOWN';
  end if;

  return new;
end;
$$;

create or replace function public.enforce_reports_rate_limit()
returns trigger
language plpgsql
as $$
declare
  last_created_at timestamptz;
  recent_count bigint;
begin
  select rp.created_at
  into last_created_at
  from public.reports rp
  where rp.reporter_id = new.reporter_id
  order by rp.created_at desc
  limit 1;

  if last_created_at is not null and (now() - last_created_at) < interval '30 seconds' then
    raise exception 'RATE_LIMIT_REPORT_COOLDOWN';
  end if;

  select count(*)
  into recent_count
  from public.reports rp
  where rp.reporter_id = new.reporter_id
    and rp.created_at >= (now() - interval '15 minutes');

  if recent_count >= 10 then
    raise exception 'RATE_LIMIT_REPORT_BURST';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_posts_rate_limit_before_insert on public.posts;
create trigger enforce_posts_rate_limit_before_insert
before insert on public.posts
for each row execute function public.enforce_posts_rate_limit();

drop trigger if exists enforce_replies_rate_limit_before_insert on public.replies;
create trigger enforce_replies_rate_limit_before_insert
before insert on public.replies
for each row execute function public.enforce_replies_rate_limit();

drop trigger if exists enforce_reports_rate_limit_before_insert on public.reports;
create trigger enforce_reports_rate_limit_before_insert
before insert on public.reports
for each row execute function public.enforce_reports_rate_limit();
