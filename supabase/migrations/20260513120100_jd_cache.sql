-- jd_cache: deterministic JD-analysis cache keyed by sha256(jd_text).
-- Shared across users (no user_id, no RLS) because JD content is public
-- and the hash is non-enumerable. Only backend service-role writes here.
-- A nightly cleanup job should prune rows older than 30 days.

create table if not exists jd_cache (
  hash text primary key,
  analysis jsonb not null,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_jd_cache_created_at on jd_cache(created_at);
