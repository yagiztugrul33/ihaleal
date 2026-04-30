-- profiles_select_admin gibi politikalar "profiles" üzerinde tekrar "profiles" SELECT ederse
-- PostgreSQL 42P17 infinite recursion üretir. Admin kontrolü SECURITY DEFINER ile RLS dışında yapılır.

create or replace function public.is_profile_admin(check_uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select (p.is_admin = true or p.role = 'admin')
      from public.profiles p
      where p.id = check_uid
    ),
    false
  );
$$;

comment on function public.is_profile_admin(uuid) is
  'RLS içinde profiles.self-join özyinelemesini önlemek için; SECURITY DEFINER ile tek satır okur.';

grant execute on function public.is_profile_admin(uuid) to anon, authenticated, service_role;

drop policy if exists "profiles_select_admin" on public.profiles;

create policy "profiles_select_admin" on public.profiles
  for select using (public.is_profile_admin(auth.uid()));

-- REST üzerinden service_role ile okuma: bazı projelerde tablo oluşturulmuş ama service_role SELECT izni eksik kalır.
grant select on public.memberships to service_role;
grant select on public.bid_bonds to service_role;
