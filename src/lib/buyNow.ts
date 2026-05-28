/**
 * Hemen Al (buy-now) helper — ince köprü.
 *
 * Çekirdek `execute_buy_now` Postgres RPC'sini sarar; istemci-tarafı `kyc_status`
 * kontrolü SADECE hızlı UX feedback için, otorite sunucudadır
 * (20260527120000_buy_now_kyc_guard.sql migration'ı sunucuda sert KYC enforcement
 * uygular; istemci atlatılamaz).
 *
 * Bu helper'ın sorumluluğu:
 *   - Auth ve KYC önön kontrolü (UX hız) → tipli erken-çıkış sonucu
 *   - RPC çağrısı + sunucu yanıtını discriminated union'a çevirme
 *   - PostgrestError → rpc_error
 *
 * Helper'ın YAPMADIĞI (çağıranda kalır):
 *   - Toast / Alert
 *   - sessionStorage / Notification dispatch
 *   - Navigate / Yönlendirme
 *   - State (set...) güncellemesi
 *
 * Bu, dosyada eski `BuyNow.tsx` + `AuctionDetail.tsx` içine gömülü mantığın aynısını
 * tek noktaya toplar; iki çağıran tek import'la bunu kullanır.
 */
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { ExecuteBuyNowParams, ExecuteBuyNowResult } from "./buyNow.types";

// Tipleri ayrı modülden re-export — mobile facade'lar transitive supabase resolve
// etmek zorunda kalmadan tipleri kullanabilsin (mimari karar 2026-05-28).
export type { ExecuteBuyNowParams, ExecuteBuyNowResult };

const KYC_REQUIRED_MESSAGE =
  "Hemen Al için KYC doğrulaması zorunlu. Profilinizden kimlik doğrulamayı tamamlayın.";

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

function readNumber(row: Record<string, unknown>, key: string): number | undefined {
  const v = row[key];
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim().length > 0) {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

/**
 * Hemen Al akışı — istemci-tarafı pre-check + sunucu RPC.
 *
 * Discriminated union döner; çağıran `result.status` üzerinden UI feedback yapar.
 */
export async function executeBuyNow(params: ExecuteBuyNowParams): Promise<ExecuteBuyNowResult> {
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
      message: "Hemen Al için giriş yapmalısınız.",
    };
  }

  // İstemci-tarafı KYC ön-kontrolü (hızlı UX; otorite sunucuda).
  // Sunucu yine de kendi enforcement'ını yapar — bu sadece kullanıcıyı RPC turuna
  // sokmadan önce hızlı geri bildirim.
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
  const { data, error } = await supabase.rpc("execute_buy_now", {
    p_listing_id: params.listingId,
    p_deposit_id: params.depositId,
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
    const buyNowId = readString(row, "buy_now_id");
    const amountTry = readNumber(row, "amount");
    if (!buyNowId || amountTry == null) {
      return {
        ok: false,
        status: "rpc_error",
        message: "Sunucu 'ok' yanıtı eksik alan döndürdü.",
      };
    }
    return { ok: true, status: "ok", buyNowId, amountTry };
  }

  if (status === "duplicate") {
    return {
      ok: true,
      status: "duplicate",
      message: message ?? "Bu işlem zaten kayıtlı.",
    };
  }

  // status === "error" (veya bilinmeyen)
  if (code === "kyc_required") {
    return {
      ok: false,
      status: "kyc_required",
      message: message ?? KYC_REQUIRED_MESSAGE,
    };
  }

  return {
    ok: false,
    status: "preconditions_failed",
    message: message ?? "İşlem tamamlanamadı.",
  };
}
