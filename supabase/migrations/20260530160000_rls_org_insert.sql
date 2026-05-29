-- R14 P0 — organizations + organization_members INSERT policy + GRANT
-- KÖK NEDEN: 20260516120100_v2_multi_tenant.sql:68-76 yalnızca SELECT policy bıraktı.
-- RLS aktif olduğu için authenticated kullanıcı self-register akışında (Register.tsx) INSERT yapamıyor → 403.
-- Bu migration:
--   1) authenticated rol için organizations INSERT'i açar (WITH CHECK true — herkes kendi şirketini yaratabilir).
--   2) organization_members INSERT'i SADECE iki senaryoda izinli kılar:
--      a) Yeni org'a kendini owner olarak ekleme (NOT EXISTS — henüz kimse yok).
--      b) Mevcut org'a owner/admin üye eklemek.
--   3) authenticated rolüne INSERT grant'i verir (RLS politika varsa bile GRANT yoksa 403 olur).
-- Anon role hâlâ INSERT yapamaz (TO authenticated kısıtı + anon GRANT yok).

-- =========== organizations ===========
drop policy if exists "org_insert_authenticated" on public.organizations;
create policy "org_insert_authenticated" on public.organizations
  for insert to authenticated
  with check (true);

-- =========== organization_members ===========
drop policy if exists "om_insert_owner_or_admin" on public.organization_members;
create policy "om_insert_owner_or_admin" on public.organization_members
  for insert to authenticated
  with check (
    -- (a) Yeni org'a kendini owner olarak ekle (henüz hiçbir üye olmamalı)
    (
      public.organization_members.user_id = auth.uid()
      and public.organization_members.role = 'owner'
      and not exists (
        select 1 from public.organization_members em
        where em.organization_id = public.organization_members.organization_id
      )
    )
    -- (b) Mevcut org'a owner/admin tarafından üye eklenmesi
    or exists (
      select 1 from public.organization_members em
      where em.organization_id = public.organization_members.organization_id
        and em.user_id = auth.uid()
        and em.role in ('owner', 'admin')
        and em.status = 'active'
    )
  );

-- =========== GRANT INSERT ===========
-- Politika varsa bile GRANT yoksa erişim reddedilir.
grant insert on public.organizations to authenticated;
grant insert on public.organization_members to authenticated;

-- anon role açıkça atlanır (anon INSERT denenirse RLS+GRANT iki kat reddeder).
