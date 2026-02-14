-- PR42 thread pinning verification checks

-- 1) columns
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'posts'
  and column_name in ('is_pinned', 'pinned_at', 'pinned_by')
order by column_name;

-- 2) indexes
select indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and tablename = 'posts'
  and indexname in ('posts_is_pinned_last_activity_idx', 'posts_category_is_pinned_last_activity_idx')
order by indexname;

-- 3) owner update policy should block owner edits to moderation-managed columns
select polname, pg_get_expr(polqual, polrelid) as using_expr, pg_get_expr(polwithcheck, polrelid) as with_check_expr
from pg_policy
where polrelid = 'public.posts'::regclass
  and polname = 'posts owner update';
