-- ════════════════════════════════════════════════════════════════════════════
--   MASTER SQL — TEK PASTE
--   Tarih: 2026-05-30 gece sprint
--   Hedef: Supabase Dashboard SQL Editor (Production, wsjifesrdaeorrdzbvmk)
--   Kullanim: hepsini ayni anda yapistir, "Run" tikla. Idempotent (yeniden
--             calismaya guvenli). Hata gorursen STOP + raporla.
--
-- KAPSAM:
--   1) organizations + organization_members INSERT policy (FORCE-REAPPLY)
--      -> migration 20260530160000 "Remote up to date" diyor ama policy yok;
--         bu bloku Editor'da elle calistirmak migration history'sinden
--         bagimsiz olarak policy'i kesin sekilde olusturur.
--   2) client_errors tablosu + RLS + GRANT (migration 20260530180000 icerigi)
--      -> Frontend crash telemetrisi (Footer Gavel gibi sessiz hatalari yakalar)
--   3) watchlist tablosu + RLS + GRANT (YENI)
--      -> Sonraki tur "favoriler" frontend'i bunu kullanacak
--   4) En sona DOGRULAMA SELECT'leri:
--      - pg_policies'ten ilgili tablolar
--      - RLS'siz public tablolari (avlama)
--
-- DOKUNULMAYAN: place_bid/kyc-submit/ai-price-estimate/auctions/listings core
-- RLS, R12.x core (Borsa, Deprem, Komsuluk, Premium, AI Engine).
-- ════════════════════════════════════════════════════════════════════════════


-- ════════ 1) organizations + organization_members INSERT policy ═══════════
--
-- KOK NEDEN: 20260516120100_v2_multi_tenant.sql:68-76 yalniz SELECT policy
-- birakti. authenticated kullanici Register.tsx'te organizations INSERT'i
-- denerken "code:42501  hint:null  new row violates row-level security policy"
-- aliyor. Migration 20260530160000_rls_org_insert.sql dosyasi repo'da ama
-- prod'da policy gorulmuyor -> bu blok kesin uygular.

-- organizations: authenticated INSERT (herkes kendi sirketini yaratabilir)
DROP POLICY IF EXISTS "org_insert_authenticated" ON public.organizations;
CREATE POLICY "org_insert_authenticated" ON public.organizations
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- organization_members: INSERT (iki dar senaryo)
DROP POLICY IF EXISTS "om_insert_owner_or_admin" ON public.organization_members;
CREATE POLICY "om_insert_owner_or_admin" ON public.organization_members
  FOR INSERT TO authenticated
  WITH CHECK (
    -- (a) yeni org'a kendini OWNER olarak ekle (org henuz uyesiz olmali)
    (
      public.organization_members.user_id = auth.uid()
      AND public.organization_members.role = 'owner'
      AND NOT EXISTS (
        SELECT 1 FROM public.organization_members em
        WHERE em.organization_id = public.organization_members.organization_id
      )
    )
    -- (b) mevcut owner/admin uye ekler (baskasinin org'una owner enjekte edilemez)
    OR EXISTS (
      SELECT 1 FROM public.organization_members em
      WHERE em.organization_id = public.organization_members.organization_id
        AND em.user_id = auth.uid()
        AND em.role IN ('owner', 'admin')
        AND em.status = 'active'
    )
  );

-- GRANT (politika olsa da GRANT yoksa erisim reddedilir)
GRANT INSERT ON public.organizations TO authenticated;
GRANT INSERT ON public.organization_members TO authenticated;


-- ════════ 2) client_errors crash telemetrisi ════════════════════════════════
--
-- Migration 20260530180000 icerigi (repo'da). Idempotent.
-- Footer Gavel benzeri sessiz crash'leri DB'ye gondermek icin.

CREATE TABLE IF NOT EXISTS public.client_errors (
  id          BIGSERIAL PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  message     TEXT,
  stack       TEXT,
  route       TEXT,
  user_agent  TEXT,
  release_id  TEXT
);

CREATE INDEX IF NOT EXISTS client_errors_created_at_idx
  ON public.client_errors(created_at DESC);

ALTER TABLE public.client_errors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "client_errors_insert_anyone" ON public.client_errors;
CREATE POLICY "client_errors_insert_anyone" ON public.client_errors
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "client_errors_select_admin" ON public.client_errors;
CREATE POLICY "client_errors_select_admin" ON public.client_errors
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

GRANT INSERT ON public.client_errors TO anon, authenticated;
GRANT SELECT ON public.client_errors TO authenticated;
GRANT USAGE ON SEQUENCE public.client_errors_id_seq TO anon, authenticated;

-- Retention onerisi (master karari, periyodik calistir):
--   DELETE FROM public.client_errors WHERE created_at < NOW() - INTERVAL '30 days';


-- ════════ 3) watchlist (favori ilan) ════════════════════════════════════════
--
-- YENI tablo. Sonraki tur frontend favoriler bunu kullanacak.
-- Sade composite PK + RLS user_id=auth.uid().

CREATE TABLE IF NOT EXISTS public.watchlist (
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id  UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS watchlist_user_idx ON public.watchlist(user_id);
CREATE INDEX IF NOT EXISTS watchlist_listing_idx ON public.watchlist(listing_id);

ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "watchlist_select_self" ON public.watchlist;
CREATE POLICY "watchlist_select_self" ON public.watchlist
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "watchlist_insert_self" ON public.watchlist;
CREATE POLICY "watchlist_insert_self" ON public.watchlist
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "watchlist_delete_self" ON public.watchlist;
CREATE POLICY "watchlist_delete_self" ON public.watchlist
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

GRANT SELECT, INSERT, DELETE ON public.watchlist TO authenticated;


-- ════════ 4) DOGRULAMA SELECT'leri ══════════════════════════════════════════
--
-- ASAGIDAKILERI MASTER ELLE INCELEYIP RAPORLA. CIKTILAR:
--   (a) policy listesi -> beklenen policy'ler var mi
--   (b) RLS'siz public tablolari -> sizinti adayi

-- (a) Bu sprintin policy'leri
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  roles,
  qual    AS using_expr,
  with_check AS check_expr
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('organizations', 'organization_members', 'client_errors', 'watchlist')
ORDER BY tablename, policyname;

-- (b) RLS'siz public tablolari (gorunmez sizinti riskini ortaya koyar)
SELECT schemaname, tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND NOT rowsecurity
ORDER BY tablename;

-- (c) Hızlı pratik kanit: kendinizle authenticated INSERT denemesi
--     Onerilen test (Editor'da SET ROLE authenticated yapamiyoruz, ama
--     master local frontend'den Register flow'unu denedikten sonra
--     bir kullanicinin organizations INSERT'i 201 dondurmeli):
--
--     curl -X POST "https://wsjifesrdaeorrdzbvmk.supabase.co/rest/v1/organizations" \
--       -H "apikey: $ANON" -H "Authorization: Bearer $USER_JWT" \
--       -H "Content-Type: application/json" -H "Prefer: return=representation" \
--       -d '{"slug":"verify-${TS}","legal_name":"X","display_name":"X","org_type":"contractor"}'
--
--     Beklenen: 201 + body.id. 403 alirsan policy uygulanmadi.


-- ════════════════════════════════════════════════════════════════════════════
-- SON. Cikti tabani uzun degil, bu blok ~145 satir SQL. Tek Run yeterli.
-- Sorun cikarsa SELECT 'a)' bloklarini ayri ayri calistirip hatayi izle.
-- ════════════════════════════════════════════════════════════════════════════
