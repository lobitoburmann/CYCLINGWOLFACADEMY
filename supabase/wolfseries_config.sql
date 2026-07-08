-- WolfSeries leader config (names, points, photo URLs)
create table if not exists public.wolfseries_config (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.wolfseries_config enable row level security;

create policy "Public read wolfseries_config"
  on public.wolfseries_config
  for select
  using (true);

create policy "Public write wolfseries_config"
  on public.wolfseries_config
  for insert
  with check (true);

create policy "Public update wolfseries_config"
  on public.wolfseries_config
  for update
  using (true);

-- Storage: use bucket athlete-documents with objects under wolfseries/
-- Example paths: wolfseries/lider-general.jpg, wolfseries/lider-montana.jpg
