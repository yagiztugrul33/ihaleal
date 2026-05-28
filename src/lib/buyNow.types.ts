/**
 * Hemen Al (execute_buy_now) facade tipleri.
 *
 * Pure type file — runtime kod yok, supabase import yok.
 * Mobile facade'lar bu modülden tipleri re-export edebilir.
 *
 * Mimari karar (2026-05-28, _audit/AKSAM_PLANI.md).
 * Runtime: src/lib/buyNow.ts (executeBuyNow fonksiyonu).
 */

export type ExecuteBuyNowParams = {
  listingId: string;
  depositId: string;
  /** İstemci sabit anahtar; verilmezse helper üretir. Sunucu idempotency'i kontrol eder. */
  idempotencyKey?: string;
};

export type ExecuteBuyNowResult =
  | { ok: true; status: "ok"; buyNowId: string; amountTry: number }
  | { ok: true; status: "duplicate"; message: string }
  | { ok: false; status: "kyc_required"; message: string }
  | { ok: false; status: "auth_required"; message: string }
  | { ok: false; status: "preconditions_failed"; message: string }
  | { ok: false; status: "rpc_error"; message: string; code?: string }
  | { ok: false; status: "config_missing"; message: string };
