/**
 * Hemen Al (execute_buy_now) — mobile-specific facade.
 *
 * Mimari karar (2026-05-28, _audit/AKSAM_PLANI.md): web `src/lib/buyNow.ts`
 * runtime'ı `@/lib/supabase` browser-tabanlı client kullanır; mobile'da fail eder.
 * Bu mobile facade:
 *   - Tipleri pure type modülünden re-export eder (`@/lib/buyNow.types`)
 *   - Runtime'ı mobile authClient (SecureStore adapter) ile yeniden implemente eder
 *
 * Web mantığıyla birebir tutarlı (KYC ön-check + idempotency + discriminated union).
 *
 * Bu facade SAF execute_buy_now çağrısı yapar — deposit zincirleme YOK.
 * Çağıran önce `registerBidDeposit({context:'buy_now', ...})` ile deposit yaratır,
 * dönüş depositId'sini bu facade'a `params.depositId` olarak verir.
 *
 * KYC redirect facade'da YAPILMAZ (K-2A): sadece `{status:'kyc_required'}` döner.
 * UI ekran `Linking.openURL('https://www.ihaleal.com/kyc')` çağırır.
 */
import { getRpcClient } from "./_rpcClient";

// Tipler pure type modülünden re-export — tek doğruluk kaynağı, supabase YOK
export type { ExecuteBuyNowParams, ExecuteBuyNowResult } from "@/lib/buyNow.types";

import type {
  ExecuteBuyNowParams,
  ExecuteBuyNowResult,
} from "@/lib/buyNow.types";

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
 * Hemen Al — mobile authClient + sunucu RPC.
 *
 * Discriminated union döner; çağıran (mobile ekran) `result.status` üzerinden UI
 * feedback yapar. KYC redirect UI tarafında handle edilir.
 */
export async function executeBuyNow(
  params: ExecuteBuyNowParams,
): Promise<ExecuteBuyNowResult> {
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
      message: "Hemen Al için giriş yapmalısınız.",
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
  const { data, error } = await client.rpc("execute_buy_now", {
    p_listing_id: params.listingId,
    p_deposit_id: params.depositId,
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
