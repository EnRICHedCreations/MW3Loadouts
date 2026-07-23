-- Run this in your Supabase SQL Editor (MW3 project)

-- 1. Profiles table
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

drop policy if exists "Public can read profiles" on profiles;
drop policy if exists "Users can insert own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
create policy "Public can read profiles" on profiles for select using (true);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- 2. Loadouts table
create table if not exists loadouts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete set null,
  author text not null,
  title text not null,
  weapon_class text not null,
  attachments text not null,
  description text default '',
  image_url text,
  likes integer not null default 0,
  views integer not null default 0
);

alter table loadouts enable row level security;

drop policy if exists "Public can read loadouts" on loadouts;
drop policy if exists "Anyone can insert loadouts" on loadouts;
drop policy if exists "Anyone can update likes and views" on loadouts;
create policy "Public can read loadouts" on loadouts for select using (true);
create policy "Anyone can insert loadouts" on loadouts for insert with check (true);
create policy "Anyone can update likes and views" on loadouts for update using (true) with check (true);

-- 3. Storage
insert into storage.buckets (id, name, public)
values ('loadout-screenshots', 'loadout-screenshots', true)
on conflict (id) do nothing;

drop policy if exists "Anyone can upload screenshots" on storage.objects;
drop policy if exists "Public can view screenshots" on storage.objects;
create policy "Anyone can upload screenshots" on storage.objects for insert with check (bucket_id = 'loadout-screenshots');
create policy "Public can view screenshots" on storage.objects for select using (bucket_id = 'loadout-screenshots');

-- 4. RPC functions
create or replace function increment_likes(loadout_id uuid)
returns void language sql as $$ update loadouts set likes = likes + 1 where id = loadout_id; $$;
create or replace function decrement_likes(loadout_id uuid)
returns void language sql as $$ update loadouts set likes = greatest(likes - 1, 0) where id = loadout_id; $$;
create or replace function increment_views(loadout_id uuid)
returns void language sql as $$ update loadouts set views = views + 1 where id = loadout_id; $$;

grant execute on function increment_likes(uuid) to anon, authenticated;
grant execute on function decrement_likes(uuid) to anon, authenticated;
grant execute on function increment_views(uuid) to anon, authenticated;

-- 5. Auth trigger (optional - only needed if you add login to MW3)
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', 'operator_' || substr(new.id::text, 1, 8)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- 6. Keepalive cron (enable pg_cron under Database > Extensions first)
-- select cron.schedule('keepalive', '0 */3 * * *', $$ select count(*) from loadouts $$);
