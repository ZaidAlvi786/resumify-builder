-- google_integrations: per-user Google Sheets connection state.
-- Refresh token is stored encrypted (envelope-encrypted with GOOGLE_TOKEN_ENC_KEY
-- on the backend; key never leaves the server). Writes happen via service-role.

create table if not exists google_integrations (
  user_id uuid primary key references auth.users(id) on delete cascade,
  spreadsheet_id text not null,
  refresh_token_encrypted text not null,
  scopes text[] not null,
  connected_at timestamptz not null default timezone('utc'::text, now())
);

alter table google_integrations enable row level security;

drop policy if exists "google_integrations select own" on google_integrations;
create policy "google_integrations select own"
  on google_integrations for select using (auth.uid() = user_id);
-- inserts/updates/deletes only via service-role.

-- google_oauth_states: short-lived OAuth state + PKCE verifier holding pen.
-- One row per /integrations/google/start call. Deleted after redemption.
-- No RLS: accessed only by service-role during the OAuth round-trip.
create table if not exists google_oauth_states (
  state text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  code_verifier text not null,
  return_url text,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_google_oauth_states_user on google_oauth_states(user_id);
create index if not exists idx_google_oauth_states_expires on google_oauth_states(expires_at);
