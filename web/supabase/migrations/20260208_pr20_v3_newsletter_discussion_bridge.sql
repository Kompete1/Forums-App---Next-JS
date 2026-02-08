create extension if not exists pgcrypto;

alter table public.posts
add column if not exists source_newsletter_id uuid
references public.newsletters(id) on delete set null;

create index if not exists posts_source_newsletter_id_created_at_desc_idx
  on public.posts (source_newsletter_id, created_at desc);
