alter table public.agent_performance enable row level security;

-- SELECT politikaları
drop policy if exists "memberships_select_own" on public.memberships;
create policy "memberships_select_own" on public.memberships
  for select using (auth.uid() = user_id);

drop policy if exists "service_fees_select_own" on public.service_fees;
create policy "service_fees_select_own" on public.service_fees
  for select using (auth.uid() = user_id);

drop policy if exists "authorizations_select_related" on public.authorizations;
create policy "authorizations_select_related" on public.authorizations
  for select using (
    auth.uid() = owner_id
    or auth.uid() = authorized_by_agent_id
    or exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true
    )
  );

drop policy if exists "commission_records_select_party" on public.commission_records;
create policy "commission_records_select_party" on public.commission_records
  for select using (
    auth.uid() = seller_id
    or auth.uid() = buyer_id
    or auth.uid() = agent_id
    or exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true
    )
  );

drop policy if exists "agent_performance_select_own" on public.agent_performance;
create policy "agent_performance_select_own" on public.agent_performance
  for select using (
    auth.uid() = agent_id
    or exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true
    )
  );

grant select on public.memberships to authenticated;
grant select on public.service_fees to authenticated;
grant select on public.authorizations to authenticated;
grant select on public.commission_records to authenticated;
grant select on public.agent_performance to authenticated;

-- ===== v5 SON =====

-- ===== v6 BAŞLANGIÇ =====

-- memberships INSERT/UPDATE
grant insert, update on public.memberships to authenticated;

drop policy if exists "memberships_select_own" on public.memberships;
