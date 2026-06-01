/**
 * ihaleal — Para sistemi client (iyzico Edge function'a bağlanır)
 *
 * MOCK değil — gerçek Supabase Edge function çağrısı yapar.
 * Sandbox modunda (anahtar yok) → simülasyon; production → iyzico REST.
 *
 * Doktrin:
 *  - Tutar ASLA client'tan göndermez (sunucu kendi pricingTiers'a göre hesaplar)
 *  - Idempotency key zorunlu (çift tahsilat YASAK)
 *  - Kart bilgisi BU FONKSIYONA GELMEZ (iyzico tokenize eder, 3D Secure sayfası açar)
 *  - Auth gereklidir (anonim kullanıcı YOK)
 */

import { supabase } from "@/lib/supabase";
import type { TierId, BillingCycle } from "@/lib/pricingTiers";

export interface CreatePaymentResult {
  ok: boolean;
  sandbox?: boolean;
  payment_id?: string;
  status?: "pending" | "requires_3ds" | "success" | "failed";
  payment_page_url?: string;
  token?: string;
  message?: string;
  error?: string;
  detail?: string;
}

export interface CreateSubscriptionResult {
  ok: boolean;
  sandbox?: boolean;
  subscription_id?: string;
  status?: "pending" | "active" | "past_due" | "canceled" | "expired";
  tier_id?: TierId;
  cycle?: BillingCycle;
  price_try?: number;
  current_period_end?: string;
  message?: string;
  error?: string;
  detail?: string;
  current_tier?: string;
}

export interface CancelSubscriptionResult {
  ok: boolean;
  subscription_id?: string;
  immediate?: boolean;
  error?: string;
}

export interface ActiveSubscription {
  id: string;
  tier_id: TierId;
  cycle: BillingCycle;
  status: "active" | "past_due" | "pending";
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  monthly_price_try: number;
}

/** UUID benzeri idempotency key üret (browser crypto) */
function generateIdempotencyKey(prefix: string): string {
  const rand = (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${rand}`;
}

/** Tek seferlik ödeme başlat (addon vs.) */
export async function createPayment(args: {
  amountTry: number;
  purpose: "addon_purchase" | "commission" | "bid_deposit" | "other";
  description: string;
}): Promise<CreatePaymentResult> {
  const idempotency_key = generateIdempotencyKey("pay");
  return invokePayments<CreatePaymentResult>({
    action: "create_payment",
    amount_try: args.amountTry,
    purpose: args.purpose,
    description: args.description,
    idempotency_key,
  });
}

/**
 * Edge function'a DİREKT fetch (Supabase JS SDK invoke yerine).
 *
 * Neden: `supabase.functions.invoke` non-2xx response'larda body'yi parse etmez —
 * sadece "Edge Function returned a non-2xx status code" generic mesajı döner.
 * Direkt fetch ile 2xx ve 4xx/5xx ikisinde de gerçek body parse edilir →
 * server'ın `error/detail/hint` alanları kullanıcıya gösterilir.
 */
async function invokePayments<T extends { ok: boolean; error?: string; detail?: string }>(
  body: Record<string, unknown>,
): Promise<T> {
  try {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) {
      return { ok: false, error: "unauthorized", detail: "Oturum yok — giriş yapın" } as T;
    }
    const url = import.meta.env.VITE_SUPABASE_URL;
    if (!url) {
      return { ok: false, error: "config_error", detail: "VITE_SUPABASE_URL eksik" } as T;
    }
    const r = await fetch(`${url}/functions/v1/payments-iyzico`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY ?? "",
      },
      body: JSON.stringify(body),
    });
    const parsed = (await r.json().catch(() => null)) as Partial<T> & { hint?: string } | null;
    if (!r.ok) {
      const error = parsed?.error ?? `http_${r.status}`;
      const detail = (parsed?.detail ?? "") + (parsed?.hint ? ` · ${parsed.hint}` : "");
      return {
        ok: false,
        error,
        detail: detail.trim() || `HTTP ${r.status} — Edge function hatası`,
      } as T;
    }
    if (parsed && typeof parsed === "object") return parsed as T;
    return { ok: false, error: "empty_response" } as T;
  } catch (e) {
    return {
      ok: false,
      error: "network_error",
      detail: e instanceof Error ? e.message : String(e),
    } as T;
  }
}

/** Abonelik başlat (recurring premium üyelik) */
export async function createSubscription(args: {
  tierId: TierId;
  cycle: BillingCycle;
}): Promise<CreateSubscriptionResult> {
  return invokePayments<CreateSubscriptionResult>({
    action: "create_subscription",
    tier_id: args.tierId,
    cycle: args.cycle,
  });
}

/** Kullanıcı abonelik iptal */
export async function cancelSubscription(immediate: boolean = false): Promise<CancelSubscriptionResult> {
  try {
    const { data, error } = await supabase.functions.invoke<CancelSubscriptionResult>("payments-iyzico", {
      body: {
        action: "cancel_subscription",
        immediate,
      },
    });
    if (error) return { ok: false, error: "invoke_error" };
    return data ?? { ok: false, error: "empty_response" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/** Aktif abonelik getir (frontend gate için) */
export async function getActiveSubscription(): Promise<ActiveSubscription | null> {
  try {
    const { data, error } = await supabase.rpc("get_my_subscription");
    if (error || !data) return null;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return null;
    return {
      id: row.id,
      tier_id: row.tier_id as TierId,
      cycle: row.cycle as BillingCycle,
      status: row.status as "active" | "past_due" | "pending",
      current_period_end: row.current_period_end,
      cancel_at_period_end: !!row.cancel_at_period_end,
      monthly_price_try: Number(row.monthly_price_try),
    };
  } catch {
    return null;
  }
}

/** Ödeme durum sorgu */
export async function getPaymentStatus(paymentId: string): Promise<{ ok: boolean; status?: string; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("payments-iyzico", {
      body: { action: "get_status", payment_id: paymentId },
    });
    if (error) return { ok: false, error: error.message };
    const result = data as { ok: boolean; payment?: { status: string }; error?: string };
    return { ok: result.ok, status: result.payment?.status, error: result.error };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/** Diagnostic — edge function durum (sandbox/production) */
export async function getProviderStatus(): Promise<{
  ok: boolean;
  stage: "sandbox" | "production" | "unknown";
  sandbox_mode: boolean;
  secrets_configured: boolean;
}> {
  try {
    const { data, error } = await supabase.functions.invoke("payments-iyzico", {
      method: "GET",
    } as Parameters<typeof supabase.functions.invoke>[1]);
    if (error) return { ok: false, stage: "unknown", sandbox_mode: true, secrets_configured: false };
    const d = data as { stage: string; sandbox_mode: boolean; secrets_configured: boolean };
    return {
      ok: true,
      stage: (d.stage === "production" ? "production" : "sandbox"),
      sandbox_mode: !!d.sandbox_mode,
      secrets_configured: !!d.secrets_configured,
    };
  } catch {
    return { ok: false, stage: "unknown", sandbox_mode: true, secrets_configured: false };
  }
}
