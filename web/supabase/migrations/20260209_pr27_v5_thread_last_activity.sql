alter table public.posts
add column if not exists last_activity_at timestamptz;

update public.posts as p
set last_activity_at = greatest(
  p.created_at,
  coalesce(r.latest_reply_at, p.created_at)
)
from (
  select thread_id, max(created_at) as latest_reply_at
  from public.replies
  group by thread_id
) as r
where p.id = r.thread_id;

update public.posts
set last_activity_at = created_at
where last_activity_at is null;

alter table public.posts
alter column last_activity_at set default now();

create index if not exists posts_last_activity_at_idx
  on public.posts (last_activity_at desc);

create index if not exists posts_category_last_activity_at_idx
  on public.posts (category_id, last_activity_at desc);

create or replace function public.bump_post_last_activity_from_reply()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.posts
  set last_activity_at = greatest(coalesce(last_activity_at, created_at), new.created_at)
  where id = new.thread_id;

  return new;
end;
$$;

drop trigger if exists bump_post_last_activity_after_reply_insert on public.replies;
create trigger bump_post_last_activity_after_reply_insert
after insert on public.replies
for each row execute function public.bump_post_last_activity_from_reply();
