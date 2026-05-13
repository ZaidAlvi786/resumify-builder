-- extension_handoffs: short-lived single-use tokens that move a JD from the
-- Chrome extension to the web app. 128-bit id, 10-min TTL, used_at set on
-- redemption. Writes happen via service-role from /api/extension/handoff.

create table if not exists extension_handoffs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('tailor','skeleton','save')),
  job_description text not null,
  job_url text,
  company text,
  role text,
  used_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_extension_handoffs_user_id on extension_handoffs(user_id);
create index if not exists idx_extension_handoffs_expires_at on extension_handoffs(expires_at);

alter table extension_handoffs enable row level security;

drop policy if exists "extension_handoffs select own" on extension_handoffs;
create policy "extension_handoffs select own"
  on extension_handoffs for select using (auth.uid() = user_id);
-- inserts/updates only via service-role (no policy needed for that path).
