-- PR22 attachments verification

-- 1) table and key columns
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'attachments'
order by ordinal_position;

-- 2) indexes
select indexname, tablename
from pg_indexes
where schemaname = 'public'
  and tablename = 'attachments'
order by indexname;

-- 3) RLS policies
select policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename = 'attachments'
order by policyname;

-- 4) storage bucket policy readiness hint
-- run in Supabase SQL editor with storage schema visibility
select id, name, public
from storage.buckets
where name = 'forum-attachments';
