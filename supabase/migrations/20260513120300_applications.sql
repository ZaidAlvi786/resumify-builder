-- applications: user's job-application tracker.
-- Soft delete via deleted_at so we can reconcile with the user's Google Sheet
-- on a delete event. RLS hides soft-deleted rows from the SELECT path.

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  role text not null,
  job_category text,
  job_url text,
  resume_id uuid references resumes(id) on delete set null,
  status text not null default 'saved'
    check (status in ('saved','applied','interviewing','offer','rejected','withdrawn')),
  applied_at timestamptz,
  notes text,
  jd_hash text,
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_applications_user_created on applications(user_id, created_at desc);
create index if not exists idx_applications_user_status on applications(user_id, status);

alter table applications enable row level security;

drop policy if exists "applications select own" on applications;
drop policy if exists "applications insert own" on applications;
drop policy if exists "applications update own" on applications;
drop policy if exists "applications delete own" on applications;

create policy "applications select own"
  on applications for select
  using (auth.uid() = user_id and deleted_at is null);
create policy "applications insert own"
  on applications for insert with check (auth.uid() = user_id);
create policy "applications update own"
  on applications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "applications delete own"
  on applications for delete using (auth.uid() = user_id);

drop trigger if exists update_applications_updated_at on applications;
create trigger update_applications_updated_at
  before update on applications
  for each row execute function update_updated_at_column();
