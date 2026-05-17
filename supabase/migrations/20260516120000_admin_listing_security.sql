-- Admin ilan onayi: RLS (is_profile_admin) + SECURITY DEFINER RPC + audit

drop policy if exists "listings_select_admin" on public.listings;
create policy "listings_select_admin" on public.listings
  for select using (public.is_profile_admin(auth.uid()));

drop policy if exists "listings_update_admin" on public.listings;
create policy "listings_update_admin" on public.listings
  for update
  using (public.is_profile_admin(auth.uid()))
  with check (public.is_profile_admin(auth.uid()));

drop policy if exists "memberships_update_admin" on public.memberships;
create policy "memberships_update_admin" on public.memberships
  for update using (public.is_profile_admin(auth.uid()));

create or replace function public.admin_approve_listing(p_listing_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.listings%rowtype;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  if not public.is_profile_admin(v_uid) then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  update public.listings
  set status = 'active', updated_at = now()
  where id = p_listing_id
  returning * into v_row;

  if not found then
    raise exception 'listing_not_found' using errcode = 'P0002';
  end if;

  insert into public.audit_log (actor_id, action, entity_type, entity_id, payload)
  values (
    v_uid,
    'admin_approve_listing',
    'listings',
    p_listing_id,
    jsonb_build_object('status', 'active')
  );

  return jsonb_build_object('ok', true, 'listing_id', p_listing_id, 'status', v_row.status);
end;
$$;

revoke all on function public.admin_approve_listing(uuid) from public;
grant execute on function public.admin_approve_listing(uuid) to authenticated;

comment on function public.admin_approve_listing(uuid) is
  'Admin ilan onayi; auth.uid() + is_profile_admin zorunlu.';