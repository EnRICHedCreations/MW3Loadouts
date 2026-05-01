-- Run this in your Supabase SQL Editor

-- 1. Create loadouts table
create table if not exists loadouts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  author text not null,
  title text not null,
  weapon_class text not null,
  attachments text not null,
  description text default '',
  image_url text
);

-- 2. Enable Row Level Security
alter table loadouts enable row level security;

-- 3. Allow anyone to read loadouts
create policy "Public can read loadouts"
  on loadouts for select
  using (true);

-- 4. Allow anyone to insert loadouts
create policy "Anyone can insert loadouts"
  on loadouts for insert
  with check (true);

-- 5. Create storage bucket for screenshots
-- Go to Storage > New Bucket > Name: loadout-screenshots > Public: true
-- OR run via dashboard (bucket creation via SQL is not supported directly)

-- 6. Allow public access to storage bucket
-- Run these after creating the bucket in the dashboard:
insert into storage.buckets (id, name, public)
values ('loadout-screenshots', 'loadout-screenshots', true)
on conflict (id) do nothing;

create policy "Anyone can upload screenshots"
  on storage.objects for insert
  with check (bucket_id = 'loadout-screenshots');

create policy "Public can view screenshots"
  on storage.objects for select
  using (bucket_id = 'loadout-screenshots');
