create table if not exists public.agent_hits (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null,
  request_id text,
  method text not null,
  host text not null,
  path text not null,
  user_agent text not null,
  agent text,
  agent_kind text,
  agent_vendor text,
  classification_reason text not null,
  created_at timestamptz not null default now(),
  unique (request_id)
);

create index if not exists agent_hits_occurred_at_idx on public.agent_hits (occurred_at desc);
create index if not exists agent_hits_agent_idx on public.agent_hits (agent);
create index if not exists agent_hits_kind_idx on public.agent_hits (agent_kind);
create index if not exists agent_hits_path_idx on public.agent_hits (path);

alter table public.agent_hits enable row level security;

drop policy if exists "anonymous insert only" on public.agent_hits;
create policy "anonymous insert only"
  on public.agent_hits
  for insert
  to anon
  with check (true);

-- Review unrecognised traffic before adding new registry labels.
-- select user_agent, count(*) from public.agent_hits
-- where agent is null group by user_agent order by count(*) desc;
