-- Run this in your Supabase SQL Editor

-- 1. Add likes and views columns to existing loadouts table
alter table loadouts
  add column if not exists likes integer not null default 0,
  add column if not exists views integer not null default 0;

-- 2. RPC: increment likes
create or replace function increment_likes(loadout_id uuid)
returns void language sql as $$
  update loadouts set likes = likes + 1 where id = loadout_id;
$$;

-- 3. RPC: decrement likes (floor at 0)
create or replace function decrement_likes(loadout_id uuid)
returns void language sql as $$
  update loadouts set likes = greatest(likes - 1, 0) where id = loadout_id;
$$;

-- 4. RPC: increment views
create or replace function increment_views(loadout_id uuid)
returns void language sql as $$
  update loadouts set views = views + 1 where id = loadout_id;
$$;
