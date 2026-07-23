-- ============================================================
-- MW3 LOADOUT VAULT — BATCH A MIGRATIONS
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ── COMMENTS ────────────────────────────────────────────────
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  loadout_id uuid references loadouts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  author text not null,
  body text not null check (char_length(body) <= 500)
);

alter table comments enable row level security;

drop policy if exists "Public can read comments" on comments;
drop policy if exists "Auth users can insert comments" on comments;
drop policy if exists "Users can delete own comments" on comments;

create policy "Public can read comments"
  on comments for select using (true);
create policy "Auth users can insert comments"
  on comments for insert with check (auth.uid() = user_id);
create policy "Users can delete own comments"
  on comments for delete using (auth.uid() = user_id);

-- ── RATINGS ─────────────────────────────────────────────────
create table if not exists ratings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  loadout_id uuid references loadouts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  score integer not null check (score >= 1 and score <= 5),
  unique (loadout_id, user_id)
);

alter table ratings enable row level security;

drop policy if exists "Public can read ratings" on ratings;
drop policy if exists "Auth users can upsert ratings" on ratings;

create policy "Public can read ratings"
  on ratings for select using (true);
create policy "Auth users can insert ratings"
  on ratings for insert with check (auth.uid() = user_id);
create policy "Users can update own rating"
  on ratings for update using (auth.uid() = user_id);

-- ── COLLECTIONS ──────────────────────────────────────────────
create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade not null,
  author text not null,
  name text not null check (char_length(name) <= 60),
  description text default '' check (char_length(description) <= 200),
  public boolean default true
);

alter table collections enable row level security;

drop policy if exists "Public can read public collections" on collections;
drop policy if exists "Auth users can insert collections" on collections;
drop policy if exists "Users can update own collections" on collections;
drop policy if exists "Users can delete own collections" on collections;

create policy "Public can read public collections"
  on collections for select using (public = true or auth.uid() = user_id);
create policy "Auth users can insert collections"
  on collections for insert with check (auth.uid() = user_id);
create policy "Users can update own collections"
  on collections for update using (auth.uid() = user_id);
create policy "Users can delete own collections"
  on collections for delete using (auth.uid() = user_id);

-- ── COLLECTION ITEMS ─────────────────────────────────────────
create table if not exists collection_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  collection_id uuid references collections(id) on delete cascade not null,
  loadout_id uuid references loadouts(id) on delete cascade not null,
  unique (collection_id, loadout_id)
);

alter table collection_items enable row level security;

drop policy if exists "Public can read collection items" on collection_items;
drop policy if exists "Collection owners can manage items" on collection_items;

create policy "Public can read collection items"
  on collection_items for select using (true);
create policy "Collection owners can insert items"
  on collection_items for insert with check (
    auth.uid() = (select user_id from collections where id = collection_id)
  );
create policy "Collection owners can delete items"
  on collection_items for delete using (
    auth.uid() = (select user_id from collections where id = collection_id)
  );

-- ── FOLLOWS ──────────────────────────────────────────────────
create table if not exists follows (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  follower_id uuid references auth.users(id) on delete cascade not null,
  following_id uuid references auth.users(id) on delete cascade not null,
  unique (follower_id, following_id),
  check (follower_id != following_id)
);

alter table follows enable row level security;

drop policy if exists "Public can read follows" on follows;
drop policy if exists "Auth users can follow" on follows;
drop policy if exists "Auth users can unfollow" on follows;

create policy "Public can read follows"
  on follows for select using (true);
create policy "Auth users can follow"
  on follows for insert with check (auth.uid() = follower_id);
create policy "Auth users can unfollow"
  on follows for delete using (auth.uid() = follower_id);

-- ── LOADOUT VERSIONS ─────────────────────────────────────────
create table if not exists loadout_versions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  loadout_id uuid references loadouts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  version integer not null default 1,
  title text not null,
  weapon_class text not null,
  attachments text not null,
  description text default '',
  changelog text default '' check (char_length(changelog) <= 200)
);

alter table loadout_versions enable row level security;

drop policy if exists "Public can read versions" on loadout_versions;
drop policy if exists "Auth users can insert versions" on loadout_versions;

create policy "Public can read versions"
  on loadout_versions for select using (true);
create policy "Auth users can insert versions"
  on loadout_versions for insert with check (auth.uid() = user_id);

-- ── RPC: AVERAGE RATING ──────────────────────────────────────
create or replace function get_avg_rating(p_loadout_id uuid)
returns numeric language sql stable as $$
  select coalesce(round(avg(score)::numeric, 1), 0)
  from ratings
  where loadout_id = p_loadout_id;
$$;

create or replace function get_rating_count(p_loadout_id uuid)
returns integer language sql stable as $$
  select count(*)::integer from ratings where loadout_id = p_loadout_id;
$$;

grant execute on function get_avg_rating(uuid) to anon, authenticated;
grant execute on function get_rating_count(uuid) to anon, authenticated;

-- ── RPC: FOLLOW COUNTS ───────────────────────────────────────
create or replace function get_follower_count(p_user_id uuid)
returns integer language sql stable as $$
  select count(*)::integer from follows where following_id = p_user_id;
$$;

create or replace function get_following_count(p_user_id uuid)
returns integer language sql stable as $$
  select count(*)::integer from follows where follower_id = p_user_id;
$$;

grant execute on function get_follower_count(uuid) to anon, authenticated;
grant execute on function get_following_count(uuid) to anon, authenticated;

-- ── RPC: CLONE LOADOUT ───────────────────────────────────────
create or replace function clone_loadout(
  p_loadout_id uuid,
  p_user_id uuid,
  p_author text
)
returns uuid language plpgsql security definer as $$
declare
  v_source loadouts%rowtype;
  v_new_id uuid;
begin
  select * into v_source from loadouts where id = p_loadout_id;
  if not found then raise exception 'Loadout not found'; end if;

  insert into loadouts (user_id, author, title, weapon_class, attachments, description, image_url)
  values (
    p_user_id, p_author,
    v_source.title || ' (Copy)',
    v_source.weapon_class,
    v_source.attachments,
    v_source.description,
    v_source.image_url
  )
  returning id into v_new_id;

  return v_new_id;
end;
$$;

grant execute on function clone_loadout(uuid, uuid, text) to authenticated;

-- ── ADD edit_count TO LOADOUTS ───────────────────────────────
alter table loadouts add column if not exists edit_count integer not null default 0;
alter table loadouts add column if not exists avg_rating numeric default 0;
alter table loadouts add column if not exists rating_count integer default 0;
