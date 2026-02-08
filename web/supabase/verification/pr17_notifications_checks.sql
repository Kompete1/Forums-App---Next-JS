-- PR17 notifications verification

-- 1) table and columns
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'notifications'
order by ordinal_position;

-- 2) functions
select proname
from pg_proc
where pronamespace = 'public'::regnamespace
  and proname in (
    'enforce_notifications_read_update',
    'create_reply_notification',
    'create_report_notification'
  )
order by proname;

-- 3) triggers
select tgname, tgrelid::regclass as table_name
from pg_trigger
where not tgisinternal
  and tgname in (
    'enforce_notifications_read_update_before_update',
    'create_reply_notification_after_insert',
    'create_report_notification_after_insert'
  )
order by tgname;

-- 4) indexes
select indexname, tablename
from pg_indexes
where schemaname = 'public'
  and indexname in (
    'notifications_recipient_created_at_desc_idx',
    'notifications_recipient_is_read_created_at_desc_idx',
    'notifications_unread_recipient_idx'
  )
order by indexname;

-- 5) rls policies
select policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename = 'notifications'
order by policyname;
