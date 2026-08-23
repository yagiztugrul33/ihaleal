/**
 * Teklif (place_bid) facade tipleri.
 *
 * Pure type file — runtime kod yok, supabase import yok.
 * Mobile facade'lar bu modülden tipleri re-export edebilir.
 *
 * Mimari karar (2026-05-28, docs/arsiv/_audit/AKSAM_PLANI.md).
 * Runtime: src/lib/placeBid.ts (placeBidRpc + parsePositiveTryFromInput + minNextBidTry).
 */

export type PlaceBidResult =
  | { ok: true; status: "ok"; amount: number }
  | { ok: true; status: "duplicate"; message: string }
  | { ok: false; message: string; code?: string };
