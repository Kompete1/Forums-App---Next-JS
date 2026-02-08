-- Template: reset seeded dummy content
-- Deletes only rows marked with [SEED] prefix.
-- Review counts before running deletes in shared environments.

-- Preview counts
select 'newsletters' as object, count(*) as rows_to_delete
from public.newsletters
where title like '[SEED]%'
union all
select 'posts' as object, count(*) as rows_to_delete
from public.posts
where title like '[SEED]%'
union all
select 'replies' as object, count(*) as rows_to_delete
from public.replies
where body like '[SEED]%';

-- Delete seeded replies first (FK safety)
delete from public.replies
where body like '[SEED]%';

-- Delete seeded posts
delete from public.posts
where title like '[SEED]%';

-- Delete seeded newsletters
delete from public.newsletters
where title like '[SEED]%';
