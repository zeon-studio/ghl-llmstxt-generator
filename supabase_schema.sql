-- Supabase Schema for GHL Sessions
-- Run this in the Supabase SQL Editor

create table if not exists public.sessions (
  location_id text primary key,
  access_token text not null,
  refresh_token text not null,
  expires_at bigint not null,
  user_id text,
  company_id text,
  location_name text,
  user_name text,
  email text,
  phone text,
  address text,
  city text,
  country text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.sessions enable row level security;

-- Example Policy: Allow all access for now (Update this for production security!)
-- Note: In a production app, you should restrict this to your server-side service role key.
create policy "Allow all access" on public.sessions for all using (true);
