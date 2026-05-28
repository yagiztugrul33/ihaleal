/**
 * Teminat (bid bond / buy-now pre-authorize) ön-yetki kaydı — mobile-specific facade.
 *
 * Mimari karar (2026-05-28, _audit/AKSAM_PLANI.md): web `src/lib/depositRegister.ts`
 * runtime'ı `@/lib/supabase` browser-tabanlı client kullanır; mobile'da fail eder.
 * Bu mobile facade:
 *   - Tipleri pure type modülünden re-export eder (`@/lib/depositRegister.types`)
 *     — transitive supabase resolve gerekmiyor, tek doğruluk kaynağı.
 *   - Runtime'ı mobile authClient (SecureStore adapter) ile yeniden implemente eder.
 *
 * Web mantığıyla birebir tutarlı (KYC ön-check + idempotency + discriminated union).
 *
 * KYC redirect facade'da YAPILMAZ (K-2A onayı): sadece `{status:'kyc_required'}`
 * döner. UI ekran `Linking.openURL('https://www.ihaleal.com/kyc')` çağırır.
 */
import { getRpcClient } from "./_rpcClient";

// Tipler pure type modülünden re-export — tek doğruluk kaynağı, supabase YOK
export type {
  DepositContext,
  RegisterBidDepositParams,
  RegisterBidDepositResult,
} from "@/lib/depositRegister.types";

import type {
  RegisterBidDepositParams,
  RegisterBidDepositResult,
} from "@/lib/depositRegister.types";

const KYC_REQUIRED_MESSAGE =
  "Teminat/ödeme yetkisi için KYC doğrulaması zorunlu. Profilinizden kimlik doğrulamayı tamamlayın.";

function parseRpcRow(data: unknown): Record<string, unknown> | null {
  if (data == null) return null;
  if (typeof data === "object" && !Array.isArray(data)) {
    return data as Record<string, unknown>;
  }
  if (typeof data === "string") {
    try {
      const o = JSON.parse(data) as unknown;
      return typeof o === "object" && o !== null && !Array.isArray(o)
        ? (o as Record<string, unknown>)
        : null;
    } catch {
      return null;
    }
  }
  return null;
}

function readString(row: Record<string, unknown>, key: string): string | undefined {
  const v = row[key];
  return typeof v === "string" ? v : undefined;
}

/**
 * Teminat (ön-yetki) kaydı — mobile authClient + sunucu RPC.
 *
 * Discriminated union döner; çağıran (mobile ekran) `result.status` üzerinden UI
 * feedback yapar. KYC redirect UI tarafında handle edilir.
 */
export async function registerBidDeposit(
  params: RegisterBidDepositParams,
): Promise<RegisterBidDepositResult> {
  // Config / client init (env eksikse throw eder)
  let client;
  try {
    client = await getRpcClient();
  } catch (e) {
    return {
      ok: false,
      status: "config_missing",
      message:
        e instanceof Error
          ? e.message
          : "Supabase yapılandırması eksik. EXPO_PUBLIC_SUPABASE_URL ve EXPO_PUBLIC_SUPABASE_ANON_KEY tanımlayın.",
    };
  }

  // Auth
  const { data: authData } = await client.auth.getUser();
  const user = authData.user;
  if (!user) {
    return {
      ok: false,
      status: "auth_required",
      message: "Teminat kaydı için giriş yapmalısınız.",
    };
  }

  // İstemci-tarafı KYC ön-kontrolü (hızlı UX; otorite sunucuda)
  const profileRes = await client
    .from("profiles")
    .select("kyc_status")
    .eq("id", user.id)
    .maybeSingle();
  const profile = profileRes?.data;
  const kycStatus =
    profile && typeof profile === "object" && "kyc_status" in profile
      ? (profile as { kyc_status?: unknown }).kyc_status
      : undefined;
  if (kycStatus !== "verified") {
    return {
      ok: false,
      status: "kyc_required",
      message: KYC_REQUIRED_MESSAGE,
    };
  }

  // RPC
  const key = params.idempotencyKey ?? crypto.randomUUID();
  const { data, error } = await client.rpc("register_bid_deposit", {
    p_listing_id: params.listingId,
    p_auction_id: params.auctionId,
    p_base_amount_try: params.baseAmountTry,
    p_deposit_amount_try: params.depositAmountTry,
    p_pre_auth_ref: params.preAuthRef,
    p_context: params.context,
    p_idempotency_key: key,
  });

  if (error) {
    return {
      ok: false,
      status: "rpc_error",
      message: error.message ?? "Sunucu hatası.",
      code: error.code,
    };
  }

  const row = parseRpcRow(data);
  if (!row) {
    return {
      ok: false,
      status: "rpc_error",
      message: "Sunucu yanıtı okunamadı.",
    };
  }

  const status = readString(row, "status");
  const message = readString(row, "message");
  const code = readString(row, "code");

  if (status === "ok") {
    const depositId = readString(row, "deposit_id");
    if (!depositId) {
      return {
        ok: false,
        status: "rpc_error",
        message: "Sunucu 'ok' yanıtı deposit_id alanını içermedi.",
      };
    }
    return { ok: true, status: "ok", depositId };
  }

  // Sunucu hata mesajlarını eşleştir (web depositRegister.ts ile birebir)
  if (code === "kyc_required") {
    return {
      ok: false,
      status: "kyc_required",
      message: message ?? KYC_REQUIRED_MESSAGE,
    };
  }
  if (message && /çok sık deneme/i.test(message)) {
    return { ok: false, status: "rate_limited", message };
  }
  if (message && /geçersiz işlem bağlamı/i.test(message)) {
    return { ok: false, status: "invalid_context", message };
  }
  if (message && /ilan bulunamadı/i.test(message)) {
    return { ok: false, status: "listing_not_found", message };
  }

  return {
    ok: false,
    status: "preconditions_failed",
    message: message ?? "Teminat kaydı tamamlanamadı.",
  };
}
