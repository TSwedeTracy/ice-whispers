-- ICE WHISPERS — Supabase schema (Postgres)
-- Run this in the Supabase SQL editor for a new project.
-- Free tier is sufficient for MVP traffic.

create extension if not exists "uuid-ossp";

-- One row per anonymous visitor (identified by a long-lived cookie, see
-- lib/session.ts) or per signed-in user later. This is intentionally
-- decoupled from Supabase Auth so the free-tier flow works without forcing
-- sign-up, while still giving us a stable id to attach entitlements to.
create table if not exists visitors (
  id uuid primary key default uuid_generate_v4(),
  email text unique,               -- null until they sign up / subscribe
  created_at timestamptz not null default now()
);

-- Server-side enforcement of the free daily limit and the $0.99 top-up.
-- One row per visitor per UTC day.
create table if not exists usage_daily (
  visitor_id uuid not null references visitors(id) on delete cascade,
  usage_date date not null default (now() at time zone 'utc')::date,
  free_reading_used boolean not null default false,
  extra_readings_purchased int not null default 0, -- from the $0.99 top-up
  extra_readings_used int not null default 0,
  readings_today int not null default 0,          -- fair-use cap counter
  primary key (visitor_id, usage_date)
);

-- Subscription entitlement (ICE WHISPERS+). One row per visitor.
create table if not exists entitlements (
  visitor_id uuid primary key references visitors(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'inactive', -- inactive | active | day_pass | past_due | canceled
  plan text,                               -- seeker (100/month) | plus (500/month) | null for day pass
  current_period_start timestamptz,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

-- Every completed reading, stored so history never needs to regenerate
-- (and so we have an audit trail for support/abuse).
create table if not exists readings (
  id uuid primary key default uuid_generate_v4(),
  visitor_id uuid not null references visitors(id) on delete cascade,
  spread_type text not null,        -- 'daily' | 'three_norns' | 'five_cross'
  question text not null,
  cards jsonb not null,             -- [{runeId, reversed, position}]
  answer text not null,
  reading text not null,
  guidance text not null,
  whisper text not null,
  created_at timestamptz not null default now()
);
create index if not exists readings_visitor_idx on readings (visitor_id, created_at desc);

-- Physical deck waitlist.
create table if not exists waitlist (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  first_name text,
  country text,                     -- self-reported, used to decide print/ship regions
  source text,                      -- e.g. 'post_reading_cta'
  consent boolean not null default true,
  created_at timestamptz not null default now()
);

-- Forward-looking, not built in MVP: keeps the data model ready for a
-- future human-reader marketplace without requiring a migration later.
create table if not exists readers (
  id uuid primary key default uuid_generate_v4(),
  visitor_id uuid references visitors(id),
  display_name text,
  bio text,
  owns_physical_deck boolean not null default false,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── Added 2026-10 (accounts, ICE WHISPERS+, journal) ──────────────────────
alter table visitors add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table entitlements add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table entitlements add column if not exists billing_interval text;        -- month | year
create index if not exists entitlements_user_idx on entitlements (user_id);
alter table readings add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table readings add column if not exists saved boolean not null default false; -- in the member's journal
alter table readings add column if not exists notes text;
alter table readings add column if not exists outcome_notes text;               -- "what happened next"
alter table readings add column if not exists suggestions jsonb;
alter table readings add column if not exists language text;
alter table readings add column if not exists updated_at timestamptz;
create index if not exists readings_user_idx on readings (user_id, created_at desc);

-- Privacy: text of readings NOT saved to a journal is erased after 24 hours.
create extension if not exists pg_cron;
create or replace function purge_unsaved_reading_text() returns void
language sql security definer set search_path = public as $$
  update readings set question = '', reading = '', guidance = '', whisper = '', suggestions = null
   where saved = false and created_at < now() - interval '24 hours' and question <> '';
$$;
select cron.schedule('purge-unsaved-reading-text', '17 * * * *', 'select purge_unsaved_reading_text()');
