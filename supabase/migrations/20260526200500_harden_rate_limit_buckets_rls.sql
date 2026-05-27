begin;

alter table public.rate_limit_buckets enable row level security;

drop policy if exists "rate_limit_buckets_service_only" on public.rate_limit_buckets;
create policy "rate_limit_buckets_service_only" on public.rate_limit_buckets
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

commit;
