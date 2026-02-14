alter table public.posts
add column if not exists is_pinned boolean not null default false,
add column if not exists pinned_at timestamptz,
add column if not exists pinned_by uuid references public.profiles(id) on delete set null;

create index if not exists posts_is_pinned_last_activity_idx
  on public.posts (is_pinned desc, last_activity_at desc, created_at desc);

create index if not exists posts_category_is_pinned_last_activity_idx
  on public.posts (category_id, is_pinned desc, last_activity_at desc, created_at desc);

-- Harden owner updates so moderation-managed columns cannot be modified by authors.
drop policy if exists "posts owner update" on public.posts;
create policy "posts owner update"
  on public.posts
  for update
  using (auth.uid() = author_id)
  with check (
    auth.uid() = author_id
    and exists (
      select 1
      from public.posts p
      where p.id = id
        and p.author_id = auth.uid()
        and p.is_locked is not distinct from is_locked
        and p.locked_at is not distinct from locked_at
        and p.locked_by is not distinct from locked_by
        and p.is_pinned is not distinct from is_pinned
        and p.pinned_at is not distinct from pinned_at
        and p.pinned_by is not distinct from pinned_by
    )
  );
