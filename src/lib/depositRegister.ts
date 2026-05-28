/**
 * Teminat (bid bond / buy-now pre-authorize) ön-yetki kaydı — ince köprü.
 *
 * Çekirdek `register_bid_deposit` Postgres RPC'sini sarar; istemci-tarafı
 * `kyc_status` kontrolü SADECE hızlı UX feedback için, otorite sunucudadır
 * (20260527120000_buy_now_kyc_guard.sql migration'ı sunucuda sert KYC
 * enforcement uygular; istemci atlatılamaz).
 *
 * Bu helper'ın sorumluluğu:
 *   - Auth ve KYC ön kontrolü (UX hız) → tipli erken-çıkış sonucu
 *   - RPC çağrısı + sunucu yanıtını discriminated union'a çevirme
 *   - PostgrestError → rpc_error
 *
 * Helper'ın YAPMADIĞI (çağıranda kalır):
 *   - Toast / Alert
 *   - sessionStorage / Notification dispatch
 *   - Navigate / Yönlendirme
 *   - State (set...) güncellemesi
 *
 * `src/lib/buyNow.ts` paterninin aynısı — iki taraflı (bid + buy_now) deposit
 * akışını tek noktaya toplar.
 */
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type {
  DepositContext,
  RegisterBidDepositParams,
  RegisterBidDepositResult,
} from "./depositRegister.types";

// Tipleri ayrı modülden re-export — mobile facade'lar transitive supabase resolve
// etmek zorunda kalmadan tipleri kullanabilsin (mimari karar 2026-05-28).
export type {
  DepositContext,
  RegisterBidDepositParams,
  RegisterBidDepositResult,
};

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
 * Teminat (ön-yetki) kaydı — istemci-tarafı pre-check + sunucu RPC.
 *
 * Discriminated union döner; çağıran `result.status` üzerinden UI feedback yapar.
 */
export async function registerBidDeposit(
  params: RegisterBidDepositParams,
): Promise<RegisterBidDepositResult> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      status: "config_missing",
      message:
        "Supabase yapılandırması eksik. Bu işlem yalnızca yapılandırılmış ortamda çalışır.",
    };
  }

  // Auth
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;
  if (!user) {
    return {
      ok: false,
      status: "auth_required",
      message: "Teminat kaydı için giriş yapmalısınız.",
    };
  }

  // İstemci-tarafı KYC ön-kontrolü (hızlı UX; otorite sunucuda).
  const { data: profile } = await supabase
    .from("profiles")
    .select("kyc_status")
    .eq("id", user.id)
    .maybeSingle();
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
  const { data, error } = await supabase.rpc("register_bid_deposit", {
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
      message: error.message,
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

  // status === "error" (veya bilinmeyen)
  // Sunucu mesajlarını eşleştir (register_bid_deposit prosrc — KYC guard sonrası)
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
