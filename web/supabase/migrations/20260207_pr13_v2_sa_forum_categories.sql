create extension if not exists pgcrypto;

do $$
begin
  -- Rename legacy "general" slug only when the new slug is not already present.
  if exists (select 1 from public.categories where slug = 'general')
     and not exists (select 1 from public.categories where slug = 'general-paddock') then
    update public.categories
    set slug = 'general-paddock',
        name = 'General Paddock',
        description = 'Introductions and general South African motorsport chat'
    where slug = 'general';
  end if;
end
$$;

insert into public.categories (slug, name, description)
values
  ('general-paddock', 'General Paddock', 'Introductions and general South African motorsport chat'),
  ('karting-discussions', 'Karting Discussions', 'Kart setup, classes, clubs, and race weekends'),
  ('main-circuit-discussions', 'Main Circuit Discussions', 'Circuit racing, classes, teams, and racecraft'),
  ('rally-off-road-discussions', 'Rally & Off-Road Discussions', 'Rally, rally-raid, and off-road competition'),
  ('sim-racing-discussions', 'Sim Racing Discussions', 'Sim rigs, platforms, league racing, and driver crossover'),
  ('driver-development-and-licensing', 'Driver Development & Licensing', 'Training, licensing pathways, and coaching'),
  ('events-and-track-days-sa', 'Events & Track Days (SA)', 'Upcoming races, test days, and South African motorsport events')
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description;
