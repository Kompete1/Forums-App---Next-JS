select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'posts'
  and column_name = 'last_activity_at';

select indexname
from pg_indexes
where schemaname = 'public'
  and tablename = 'posts'
  and indexname in ('posts_last_activity_at_idx', 'posts_category_last_activity_at_idx');

select trigger_name
from information_schema.triggers
where event_object_schema = 'public'
  and event_object_table = 'replies'
  and trigger_name = 'bump_post_last_activity_after_reply_insert';
