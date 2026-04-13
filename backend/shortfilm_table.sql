-- Run this in your Supabase SQL Editor
create table if not exists shortfilm_registrations (
  id                  uuid primary key default gen_random_uuid(),
  submitted_at        timestamptz not null default now(),

  -- Film details
  film_title          text not null,
  genre               text not null,
  duration            integer not null check (duration >= 1 and duration <= 3),  -- strict 1–3 minutes
  synopsis            text,
  film_url            text not null,
  film_language       text,

  -- Participation
  participation_type  text not null default 'individual',  -- 'individual' | 'team'
  team_members        jsonb,                               -- array of up to 3 member names (team only)

  -- Accessibility compliance (mandatory per event rules)
  has_subtitles         boolean not null default false,
  has_audio_description boolean not null default false,

  -- Director / Team
  director_name       text not null,
  team_name           text,
  college_name        text,

  -- Contact
  contact_name        text not null,
  contact_email       text not null,
  contact_phone       text not null,

  -- Extra
  additional_info     text,

  -- Payment
  razorpay_order_id   text,
  razorpay_payment_id text,
  payment_status      text not null default 'created',

  -- Admin review
  status              text not null default 'pending',
  admin_note          text
);

-- Migration: add new columns if table already exists
alter table shortfilm_registrations
  add column if not exists participation_type  text not null default 'individual',
  add column if not exists team_members        jsonb,
  add column if not exists has_subtitles         boolean not null default false,
  add column if not exists has_audio_description boolean not null default false;

-- Optional: enable RLS so only authenticated service-role can write
-- alter table shortfilm_registrations enable row level security;

-- Also add shortfilm to form_settings so admin can toggle it open/closed
insert into form_settings (id, name, is_open)
values ('shortfilm', 'Short Film Contest', true)
on conflict (id) do nothing;
