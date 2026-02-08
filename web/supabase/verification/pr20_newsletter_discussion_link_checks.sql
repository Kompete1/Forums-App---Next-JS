-- PR20 newsletter discussion link verification

-- 1) posts column exists
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'posts'
  and column_name = 'source_newsletter_id';

-- 2) foreign key exists
select conname, conrelid::regclass as table_name
from pg_constraint
where conrelid = 'public.posts'::regclass
  and contype = 'f'
  and conname like '%source_newsletter_id%';

-- 3) index exists
select indexname, tablename
from pg_indexes
where schemaname = 'public'
  and tablename = 'posts'
  and indexname = 'posts_source_newsletter_id_created_at_desc_idx';
