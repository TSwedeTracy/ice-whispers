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
  primary key (visitor_id, usage_date)
);

-- Subscription entitlement (ICE WHISPERS+). One row per visitor.
create table if not exists entitlements (
  visitor_id uuid primary key references visitors(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'inactive', -- inactive | active | past_due | canceled
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
