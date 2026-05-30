-- client_errors — frontend runtime crash telemetrisi (anon INSERT, admin SELECT)
-- Amac: bugunki Gavel crash gibi gozetimsiz uretim hatalarini DB'de yakalamak.
-- Risk: dusuk (yeni tablo, mevcut hicbir akisi etkilemez). Spam riski: 30 gun retention nofitsi notla bagli.

CREATE TABLE IF NOT EXISTS public.client_errors (
  id          BIGSERIAL PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  message     TEXT,
  stack       TEXT,
  route       TEXT,
  user_agent  TEXT,
  release_id  TEXT  -- vercel build id (opsiyonel)
);

CREATE INDEX IF NOT EXISTS client_errors_created_at_idx ON public.client_errors(created_at DESC);

ALTER TABLE public.client_errors ENABLE ROW LEVEL SECURITY;

-- INSERT: anon + authenticated, WITH CHECK true (crash report anonim mumkun)
DROP POLICY IF EXISTS "client_errors_insert_anyone" ON public.client_errors;
CREATE POLICY "client_errors_insert_anyone" ON public.client_errors
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- SELECT: sadece admin
DROP POLICY IF EXISTS "client_errors_select_admin" ON public.client_errors;
CREATE POLICY "client_errors_select_admin" ON public.client_errors
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- GRANT'ler (politika varsa bile GRANT yoksa erisim reddedilir)
GRANT INSERT ON public.client_errors TO anon, authenticated;
GRANT SELECT ON public.client_errors TO authenticated;
GRANT USAGE ON SEQUENCE public.client_errors_id_seq TO anon, authenticated;

-- Retention notu (master icin): 30+ gun eski kayitlari periyodik temizle:
--   DELETE FROM public.client_errors WHERE created_at < NOW() - INTERVAL '30 days';
-- Spam riski: kotuye kullanim olursa rate-limit middleware (Edge Function) ile katmanlanabilir.
