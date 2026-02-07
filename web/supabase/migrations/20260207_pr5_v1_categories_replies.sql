create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (char_length(slug) between 1 and 60),
  name text not null unique check (char_length(name) between 1 and 80),
  description text,
  created_at timestamptz not null default now()
);

insert into public.categories (slug, name, description)
values ('general', 'General', 'General discussion')
on conflict (slug) do nothing;

alter table public.posts
add column if not exists category_id uuid;

update public.posts
set category_id = c.id
from public.categories c
where c.slug = 'general'
  and public.posts.category_id is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'posts_category_id_fkey'
      and conrelid = 'public.posts'::regclass
  ) then
    alter table public.posts
    add constraint posts_category_id_fkey
    foreign key (category_id) references public.categories(id) on delete restrict;
  end if;
end
$$;

alter table public.posts
alter column category_id set not null;

create index if not exists posts_category_id_created_at_idx
  on public.posts (category_id, created_at desc);

create table if not exists public.replies (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists replies_thread_id_created_at_idx
  on public.replies (thread_id, created_at asc);

create index if not exists replies_author_id_idx
  on public.replies (author_id);

drop trigger if exists set_replies_updated_at on public.replies;
create trigger set_replies_updated_at
before update on public.replies
for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.replies enable row level security;

drop policy if exists "categories public read" on public.categories;
create policy "categories public read"
  on public.categories
  for select
  using (true);

drop policy if exists "replies public read" on public.replies;
create policy "replies public read"
  on public.replies
  for select
  using (true);

drop policy if exists "replies owner insert" on public.replies;
create policy "replies owner insert"
  on public.replies
  for insert
  with check (auth.uid() = author_id);

drop policy if exists "replies owner update" on public.replies;
create policy "replies owner update"
  on public.replies
  for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

drop policy if exists "replies owner delete" on public.replies;
create policy "replies owner delete"
  on public.replies
  for delete
  using (auth.uid() = author_id);
