-- PR15 verification: anti-spam objects and constraints

-- 1) Functions exist
select proname
from pg_proc
where pronamespace = 'public'::regnamespace
  and proname in (
    'enforce_posts_rate_limit',
    'enforce_replies_rate_limit',
    'enforce_reports_rate_limit'
  )
order by proname;

-- 2) Triggers exist
select tgname, tgrelid::regclass as table_name
from pg_trigger
where not tgisinternal
  and tgname in (
    'enforce_posts_rate_limit_before_insert',
    'enforce_replies_rate_limit_before_insert',
    'enforce_reports_rate_limit_before_insert'
  )
order by tgname;

-- 3) Indexes exist
select indexname, tablename
from pg_indexes
where schemaname = 'public'
  and indexname in (
    'posts_author_id_created_at_desc_idx',
    'replies_author_id_created_at_desc_idx',
    'reports_reporter_id_created_at_desc_idx'
  )
order by indexname;

-- 4) Duplicate-report constraints still active
select indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and indexname in (
    'reports_unique_reporter_thread_idx',
    'reports_unique_reporter_reply_idx'
  )
order by indexname;
