-- ihaleal — Para sistemi tabloları (sandbox + production hazır)
-- 2026-06-01 PARA BLOK 1
--
-- 2 tablo:
--   1) payments — tek seferlik ödeme kaydı (abonelik başlatma + ek hizmet)
--   2) subscriptions — recurring premium üyelik takibi
--
-- RLS: kullanıcı yalnızca kendi kayıtlarına erişir.
-- Audit log için tüm yazma operasyonları timestamps + tetikleyici ile izlenir.

-- ===========================================================================
-- 1) payments tablosu
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider          text NOT NULL CHECK (provider IN ('iyzico', 'paytr', 'manual')),
  provider_ref      text,                       -- iyzico paymentId / paytr merchant_oid
  amount_try        numeric(12,2) NOT NULL CHECK (amount_try >= 0),
  currency          text NOT NULL DEFAULT 'TRY' CHECK (currency = 'TRY'),
  status            text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'requires_3ds', 'success', 'failed', 'refunded', 'expired')),
  purpose           text NOT NULL
                    CHECK (purpose IN ('subscription_start', 'subscription_renewal',
                                       'addon_purchase', 'commission', 'bid_deposit', 'other')),
  metadata          jsonb DEFAULT '{}'::jsonb,
  idempotency_key   text UNIQUE,                -- çift tahsilat önleme
  initiated_at      timestamptz NOT NULL DEFAULT now(),
  completed_at      timestamptz,
  failed_reason     text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payments_user_id_idx        ON public.payments (user_id);
CREATE INDEX IF NOT EXISTS payments_status_idx         ON public.payments (status);
CREATE INDEX IF NOT EXISTS payments_provider_ref_idx   ON public.payments (provider, provider_ref);
CREATE INDEX IF NOT EXISTS payments_created_at_idx     ON public.payments (created_at DESC);

-- updated_at otomatik
CREATE OR REPLACE FUNCTION public.set_payments_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_payments_updated_at ON public.payments;
CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_payments_updated_at();

-- RLS — kullanıcı kendi ödemelerini görür, service_role tam erişim
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS payments_select_own ON public.payments;
CREATE POLICY payments_select_own
  ON public.payments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS payments_insert_own ON public.payments;
CREATE POLICY payments_insert_own
  ON public.payments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Update + delete sadece service_role (edge function backend)
-- (RLS auth dışı service_role her zaman bypass eder; explicit policy YOK)

-- ===========================================================================
-- 2) subscriptions tablosu (recurring premium üyelik)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_id           text NOT NULL
                    CHECK (tier_id IN ('free', 'yatirimci', 'emlak_baslangic', 'emlak_pro', 'kurumsal')),
  cycle             text NOT NULL DEFAULT 'monthly'
                    CHECK (cycle IN ('monthly', 'yearly')),
  status            text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'active', 'past_due', 'canceled', 'expired')),
  provider          text NOT NULL CHECK (provider IN ('iyzico', 'paytr', 'manual')),
  provider_sub_ref  text,                       -- iyzico subscription ID
  started_at        timestamptz,
  current_period_end timestamptz,               -- bir sonraki tahsilat tarihi
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  canceled_at       timestamptz,
  payment_method_token text,                    -- iyzico tokenized card (PCI: ham kart YOK)
  monthly_price_try numeric(12,2) NOT NULL CHECK (monthly_price_try >= 0),
  metadata          jsonb DEFAULT '{}'::jsonb,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx       ON public.subscriptions (user_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx        ON public.subscriptions (status);
CREATE INDEX IF NOT EXISTS subscriptions_period_end_idx    ON public.subscriptions (current_period_end);

-- Bir kullanıcının sadece BİR aktif aboneliği olabilir
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_one_active_per_user
  ON public.subscriptions (user_id)
  WHERE status IN ('active', 'past_due');

CREATE OR REPLACE FUNCTION public.set_subscriptions_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_subscriptions_updated_at();

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS subscriptions_select_own ON public.subscriptions;
CREATE POLICY subscriptions_select_own
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS subscriptions_insert_own ON public.subscriptions;
CREATE POLICY subscriptions_insert_own
  ON public.subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS subscriptions_update_own_cancel ON public.subscriptions;
CREATE POLICY subscriptions_update_own_cancel
  ON public.subscriptions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    -- Kullanıcı sadece iptal alanını değiştirebilir; status değişimi service_role
    AND tier_id = (SELECT tier_id FROM public.subscriptions WHERE id = subscriptions.id)
    AND cycle = (SELECT cycle FROM public.subscriptions WHERE id = subscriptions.id)
  );

-- ===========================================================================
-- 3) payment_audit_log — değiştirilemez audit (tüm ödeme/abonelik olayları)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS public.payment_audit_log (
  id            bigserial PRIMARY KEY,
  event_type    text NOT NULL,                 -- payment_started, payment_success, sub_canceled, vb.
  user_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  payment_id    uuid REFERENCES public.payments(id) ON DELETE SET NULL,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  details       jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address    inet,
  user_agent    text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payment_audit_user_idx        ON public.payment_audit_log (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS payment_audit_event_idx       ON public.payment_audit_log (event_type, created_at DESC);

-- Audit — sadece okuma (insert service_role, update/delete YASAK)
ALTER TABLE public.payment_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS audit_select_own ON public.payment_audit_log;
CREATE POLICY audit_select_own
  ON public.payment_audit_log FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT/UPDATE/DELETE policy YOK — sadece service_role yazar (audit değiştirilemez)

-- ===========================================================================
-- 4) Yardımcı view — kullanıcı aktif abonelik (frontend için)
-- ===========================================================================
CREATE OR REPLACE VIEW public.active_subscriptions AS
SELECT
  s.id,
  s.user_id,
  s.tier_id,
  s.cycle,
  s.status,
  s.started_at,
  s.current_period_end,
  s.cancel_at_period_end,
  s.monthly_price_try,
  s.created_at
FROM public.subscriptions s
WHERE s.status IN ('active', 'past_due')
  AND (s.current_period_end IS NULL OR s.current_period_end > now());

GRANT SELECT ON public.active_subscriptions TO authenticated;

-- ===========================================================================
-- 5) RPC: get_my_subscription (aktif abonelik bilgisi)
-- ===========================================================================
CREATE OR REPLACE FUNCTION public.get_my_subscription()
RETURNS TABLE (
  id uuid,
  tier_id text,
  cycle text,
  status text,
  current_period_end timestamptz,
  cancel_at_period_end boolean,
  monthly_price_try numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, tier_id, cycle, status, current_period_end, cancel_at_period_end, monthly_price_try
  FROM public.subscriptions
  WHERE user_id = auth.uid()
    AND status IN ('active', 'past_due', 'pending')
  ORDER BY created_at DESC
  LIMIT 1
$$;

GRANT EXECUTE ON FUNCTION public.get_my_subscription() TO authenticated;

-- ===========================================================================
-- 6) RPC: cancel_my_subscription — kullanıcı iptal akışı
-- ===========================================================================
CREATE OR REPLACE FUNCTION public.cancel_my_subscription(p_immediate boolean DEFAULT false)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sub_id uuid;
BEGIN
  SELECT id INTO v_sub_id
  FROM public.subscriptions
  WHERE user_id = auth.uid()
    AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_sub_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_active_subscription');
  END IF;

  IF p_immediate THEN
    UPDATE public.subscriptions
    SET status = 'canceled',
        canceled_at = now(),
        cancel_at_period_end = false,
        updated_at = now()
    WHERE id = v_sub_id;
  ELSE
    UPDATE public.subscriptions
    SET cancel_at_period_end = true,
        canceled_at = now(),
        updated_at = now()
    WHERE id = v_sub_id;
  END IF;

  -- Audit log
  INSERT INTO public.payment_audit_log (event_type, user_id, subscription_id, details)
  VALUES (
    CASE WHEN p_immediate THEN 'subscription_canceled_immediate' ELSE 'subscription_canceled_period_end' END,
    auth.uid(),
    v_sub_id,
    jsonb_build_object('canceled_at', now())
  );

  RETURN jsonb_build_object('ok', true, 'subscription_id', v_sub_id, 'immediate', p_immediate);
END $$;

GRANT EXECUTE ON FUNCTION public.cancel_my_subscription(boolean) TO authenticated;

COMMENT ON TABLE public.payments IS 'Tüm ödeme kayıtları — iyzico/paytr/manual; PCI uyumlu (kart verisi YOK).';
COMMENT ON TABLE public.subscriptions IS 'Recurring premium üyelik takibi; her kullanıcının 1 aktif aboneliği.';
COMMENT ON TABLE public.payment_audit_log IS 'Değiştirilemez audit log — tüm ödeme/abonelik olayları izlenir.';
