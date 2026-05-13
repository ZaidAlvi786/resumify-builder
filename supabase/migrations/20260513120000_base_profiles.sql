-- base_profiles: one row per user, the source-of-truth career history.
-- Everything else (tailoring, skeleton, extension) reads from this.

create table if not exists base_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  content jsonb not null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_base_profiles_user_id on base_profiles(user_id);

alter table base_profiles enable row level security;

drop policy if exists "base_profiles select own" on base_profiles;
drop policy if exists "base_profiles insert own" on base_profiles;
drop policy if exists "base_profiles update own" on base_profiles;
drop policy if exists "base_profiles delete own" on base_profiles;

create policy "base_profiles select own"
  on base_profiles for select using (auth.uid() = user_id);
create policy "base_profiles insert own"
  on base_profiles for insert with check (auth.uid() = user_id);
create policy "base_profiles update own"
  on base_profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "base_profiles delete own"
  on base_profiles for delete using (auth.uid() = user_id);

drop trigger if exists update_base_profiles_updated_at on base_profiles;
create trigger update_base_profiles_updated_at
  before update on base_profiles
  for each row execute function update_updated_at_column();
