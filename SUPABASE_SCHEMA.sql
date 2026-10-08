create table if not exists public.users (
  uid text primary key,
  name text not null,
  character_index integer not null default 0,
  best_score integer not null default 0,
  games_played integer not null default 0,
  stats jsonb not null default '{}'::jsonb,
  achievements jsonb not null default '[]'::jsonb,
  access_code text,
  updated_at timestamptz not null default now()
);
create table if not exists public.leaderboard (
  uid text primary key references public.users(uid) on delete cascade,
  name text not null,
  character_index integer not null default 0,
  score integer not null default 0,
  kills integer not null default 0,
  night integer not null default 0,
  timestamp_ms bigint not null default 0,
  round_id text not null default 'normal',
  updated_at timestamptz not null default now()
);
alter table public.leaderboard add column if not exists round_id text not null default 'normal';
create index if not exists leaderboard_round_score_idx on public.leaderboard(round_id,score desc);
