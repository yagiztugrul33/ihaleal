drop policy if exists "memberships_select_self" on public.memberships;
create policy "memberships_select_self" on public.memberships
  for select using (auth.uid() = user_id);

drop policy if exists "memberships_insert_self" on public.memberships;
create policy "memberships_insert_self" on public.memberships
  for insert with check (auth.uid() = user_id);

drop policy if exists "memberships_update_admin" on public.memberships;
create policy "memberships_update_admin" on public.memberships
  for update using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

-- service_fees INSERT
grant insert on public.service_fees to authenticated;

drop policy if exists "service_fees_select_own" on public.service_fees;
drop policy if exists "service_fees_select_self" on public.service_fees;
create policy "service_fees_select_self" on public.service_fees
  for select using (auth.uid() = user_id);

drop policy if exists "service_fees_insert_self" on public.service_fees;
create policy "service_fees_insert_self" on public.service_fees
  for insert with check (auth.uid() = user_id);

-- authorizations INSERT
grant insert on public.authorizations to authenticated;

drop policy if exists "authorizations_select_related" on public.authorizations;
drop policy if exists "authorizations_select_owner" on public.authorizations;
create policy "authorizations_select_owner" on public.authorizations
  for select using (
    auth.uid() = owner_id
    or auth.uid() = authorized_by_agent_id
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    )
  );

drop policy if exists "authorizations_insert_owner" on public.authorizations;
create policy "authorizations_insert_owner" on public.authorizations
  for insert with check (auth.uid() = owner_id);

-- bid_bonds yeniden adlandırma
drop policy if exists "bid_bonds_select_own" on public.bid_bonds;
