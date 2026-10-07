CREATE TABLE if not exists public.users (
   uid text
PRIMARY KEY,
  name text not null,
  character_index integer not null default 0,
  best_score integer not null default 0,
  games_played integer not null default 0,
  stats jsonb not null default '{}'::jsonb,
  achievements jsonb not null default '[]'::jsonb,
  access_code text,
  updated_at timestamptz not null default now(
) 
);
CREATE TABLE if not exists public.leaderboard (
   uid text
PRIMARY KEY
REFERENCES public.users(
  uid
) on delete cascade,
  name text not null,
  character_index integer not null default 0,
  score integer not null default 0,
  kills integer not null default 0,
  night integer not null default 0,
  timestamp_ms bigint not null default 0,
  updated_at timestamptz not null default now(
) 
); create index if not exists leaderboard_score_idx on public.leaderboard(
  score desc
);
