-- ═══════════════════════════════════════════════════════════════════════════
-- RB1 + RB2 — RLS HARDENING (atomik tek migration)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- AMAÇ:
--   Müfettiş + sistem röntgeni bulgularından kalan 2 RLS sertleştirme bloğu:
--     RB1) corporate_leads + organizations RLS sertleştir
--     RB2) bid_bonds orphan policy temizliği (3 policy DROP, tablo KORU)
--
-- ÖN-KONTROL KANITI (2026-05-28, _audit/tmp_rb1_rb2_precheck.sql canlı sonuç):
--
--   corporate_leads policies (3) — DUBLİKE + GENİŞ:
--     - allow_insert_all      [INSERT anon+authenticated, with_check=true]    ← KORU
--     - allow_select_all      [SELECT anon+authenticated, qual=true]          ← DROP (geniş okuma)
--     - cl_insert_anyone      [INSERT public, with_check=true]                ← DROP (dublike)
--   meşru akış: src/pages/CorporateContact.tsx anon INSERT (form), SELECT yok
--   row count: 1 (production)
--
--   organizations policies (2):
--     - org_public_read       [SELECT public, qual=true]                      ← DROP (public sızıntı)
--     - org_select_member     [SELECT public, qual=EXISTS active member]      ← KORU
--   meşru akış: src/hooks/useActiveOrg.ts authenticated user kendi org'u
--   row count: 4 (production)
--   hassas kolonlar: contact_email, contact_phone, tax_number, ai_quota_*, settings
--
--   bid_bonds policies (3) — ORPHAN (prosrc referansı 0, rowcount 0):
--     - bid_bonds_insert_self [INSERT public, with_check=auth.uid()=bidder]   ← DROP
--     - bid_bonds_select_self [SELECT public, qual=auth.uid()=bidder]         ← DROP
--     - bid_bonds_update_self [UPDATE public, qual+with_check=auth.uid()=...] ← DROP
--   bid_bonds tablosunu hiçbir RPC kullanmıyor (precheck: bid_bonds_referenced_by_fn
--   = NONE). place_bid bond check'i 20260430150000 override'da kaldırılmış.
--   Tablo orphan; sadece policy temizliği — tablo + grant DROP edilmiyor
--   (gelecekte tekrar policy yazma seçeneği açık kalır).
--
-- DEĞİŞMEYEN:
--   - Tablo + kolonlar
--   - Grant'ler (authenticated table-level grants korunuyor)
--   - has_org_role helper function
--   - RLS ENABLED bayrağı (3 tablo da hâlâ aktif)
--
-- DEPLOY:
--   _audit/migration_deploy/extra_rb1_rb2.sql üzerinden atomik BEGIN/COMMIT +
--   36-check regression (6 RB self + 29 önceki regression + 1 migration row).
--
-- REVERSE:
--   _audit/migration_deploy/extra_rb1_rb2.sql REVERSE bloğunda atomik geri-alma
--   SQL'i mevcut (cl_insert_anyone + allow_select_all + org_public_read +
--   bid_bonds 3 policy + schema_migrations DELETE).
-- ═══════════════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────────────────
-- RB1 / corporate_leads: dublike INSERT + geniş SELECT temizliği
-- ──────────────────────────────────────────────────────────────────────────

drop policy if exists cl_insert_anyone on public.corporate_leads;
drop policy if exists allow_select_all on public.corporate_leads;

-- Admin SELECT (lead listesi yönetim için)
create policy corporate_leads_select_admin
  on public.corporate_leads
  for select
  to public
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (p.is_admin = true or p.role = 'admin')
    )
  );

-- allow_insert_all KORUNUYOR (anon+authenticated form INSERT akışı için).

-- ──────────────────────────────────────────────────────────────────────────
-- RB1 / organizations: public_read sızıntısı kapatma + admin SELECT
-- ──────────────────────────────────────────────────────────────────────────

drop policy if exists org_public_read on public.organizations;

-- Admin SELECT (org yönetim ekranı için)
create policy org_select_admin
  on public.organizations
  for select
  to public
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and (p.is_admin = true or p.role = 'admin')
    )
  );

-- org_select_member KORUNUYOR (active organization_members SELECT — useActiveOrg.ts).

-- ──────────────────────────────────────────────────────────────────────────
-- RB2 / bid_bonds: 3 orphan policy temizliği (tablo + grants KORUNUYOR)
-- ──────────────────────────────────────────────────────────────────────────

drop policy if exists bid_bonds_insert_self on public.bid_bonds;
drop policy if exists bid_bonds_select_self on public.bid_bonds;
drop policy if exists bid_bonds_update_self on public.bid_bonds;

-- RLS aktif kalır (relrowsecurity=true) ama policy yok → service_role dışında
-- hiçbir rol erişemez. Tablo orphan iz temizliği.
