-- ==========================================================
-- SUPABASE SCHEMA — MALAM KELAM
-- ==========================================================
-- Jalankan di Supabase SQL Editor.
-- Sesuaikan RLS dengan sistem auth/backend yang digunakan.
--
-- Jangan menaruh service_role key di frontend.

create table if not exists public.users (
  uid text primary key,
  name text not null,
  character_index integer not null default 0,
  best_score bigint not null default 0,
  games_played integer not null default 0,
  stats jsonb not null default '{}'::jsonb,
  achievements jsonb not null default '[]'::jsonb,
  access_code text not null default '',
  skin_unlocked integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leaderboard (
  uid text primary key,
  name text not null,
  character_index integer not null default 0,
  score bigint not null default 0,
  kills integer not null default 0,
  night integer not null default 0,
  timestamp bigint not null,
  updated_at timestamptz not null default now()
);

create index if not exists leaderboard_score_idx
on public.leaderboard (score desc);

-- Contoh policy development ONLY.
-- Untuk production, kaitkan uid dengan Supabase Auth.
alter table public.users enable row level security;
alter table public.leaderboard enable row level security;

-- Contoh read policy.
create policy "leaderboard_read"
on public.leaderboard
for select
using (true);

-- Jangan membuka insert/update tanpa validasi untuk production.
-- Score tournament sebaiknya divalidasi di Edge Function/server.
