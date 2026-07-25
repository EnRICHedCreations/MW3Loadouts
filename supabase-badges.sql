-- ============================================================
-- MW3 LOADOUT VAULT — BADGES
-- Run in Supabase SQL Editor
-- ============================================================

-- Badges table
create table if not exists badges (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade not null,
  badge text not null,
  unique (user_id, badge)
);

alter table badges enable row level security;

drop policy if exists "Public can read badges" on badges;
drop policy if exists "Auth users can insert badges" on badges;

create policy "Public can read badges"
  on badges for select using (true);

create policy "Auth users can insert own badges"
  on badges for insert with check (auth.uid() = user_id);

-- RPC to safely award a badge (ignores if already exists)
create or replace function award_badge(p_user_id uuid, p_badge text)
returns void language plpgsql security definer as $$
begin
  insert into badges (user_id, badge)
  values (p_user_id, p_badge)
  on conflict (user_id, badge) do nothing;
end;
$$;

grant execute on function award_badge(uuid, text) to authenticated;
