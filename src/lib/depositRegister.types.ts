/**
 * Teminat (bid bond / buy-now pre-authorize) facade tipleri.
 *
 * Pure type file — hiçbir runtime kod, hiçbir runtime modül import'u içermez.
 * Mobile facade'lar bu modülden tipleri re-export edebilir; web supabase client'ı
 * transitive olarak resolve etmek zorunda kalmaz.
 *
 * Mimari karar (2026-05-28, docs/arsiv/_audit/AKSAM_PLANI.md): mobile facade'lar `@/lib/supabase`
 * transitive bile import etmemeli — bu dosya bunun pre-req'i.
 *
 * Runtime: src/lib/depositRegister.ts (registerBidDeposit fonksiyonu).
 */

export type DepositContext = "bid" | "buy_now";

export type RegisterBidDepositParams = {
  listingId: string;
  auctionId: string;
  context: DepositContext;
  baseAmountTry: number;
  depositAmountTry: number;
  /** PSP (iyzico) ön-yetki referansı; mock veya unconfigured ortamda 'mock'. */
  preAuthRef: string;
  /** İstemci sabit anahtar; verilmezse helper üretir. Sunucu idempotency kontrol eder. */
  idempotencyKey?: string;
};

export type RegisterBidDepositResult =
  | { ok: true; status: "ok"; depositId: string }
  | { ok: false; status: "kyc_required"; message: string }
  | { ok: false; status: "auth_required"; message: string }
  | { ok: false; status: "rate_limited"; message: string }
  | { ok: false; status: "invalid_context"; message: string }
  | { ok: false; status: "listing_not_found"; message: string }
  | { ok: false; status: "preconditions_failed"; message: string }
  | { ok: false; status: "rpc_error"; message: string; code?: string }
  | { ok: false; status: "config_missing"; message: string };
