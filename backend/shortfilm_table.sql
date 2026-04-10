-- Run this in your Supabase SQL Editor
create table if not exists shortfilm_registrations (
  id                  uuid primary key default gen_random_uuid(),
  submitted_at        timestamptz not null default now(),

  -- Film details
  film_title          text not null,
  genre               text not null,
  duration            integer not null,         -- in minutes
  synopsis            text,
  film_url            text not null,
  film_language       text,

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

-- Optional: enable RLS so only authenticated service-role can write
-- alter table shortfilm_registrations enable row level security;

-- Also add shortfilm to form_settings so admin can toggle it open/closed
insert into form_settings (id, name, is_open)
values ('shortfilm', 'Short Film Contest', true)
on conflict (id) do nothing;
