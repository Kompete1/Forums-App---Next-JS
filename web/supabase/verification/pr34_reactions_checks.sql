-- PR34 reactions verification checks

-- 1) table and columns
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'reactions'
order by ordinal_position;

-- 2) indexes
select indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and tablename = 'reactions'
order by indexname;

-- 3) constraints
select conname, pg_get_constraintdef(c.oid) as definition
from pg_constraint c
where c.conrelid = 'public.reactions'::regclass
order by conname;

-- 4) policies
select polname, pg_get_expr(polqual, polrelid) as using_expr, pg_get_expr(polwithcheck, polrelid) as with_check_expr
from pg_policy
where polrelid = 'public.reactions'::regclass
order by polname;
