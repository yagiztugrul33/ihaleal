import { validateBid, calculateProxyBid, type BidValidationResult } from './borsa';

// ─────────────────────────────────────────────────────────────────────────────
// Açık teklif — ONAYLI facade (çekirdek auctionEngine + placeBid.ts'i çağırır)
// ─────────────────────────────────────────────────────────────────────────────

export type SubmitBidParams = {
  auctionId: string;
  bidderId: string;
  currentBid: number;
  newBid: number;
  minIncrement: number;
  userMaxProxy?: number;
};

export type SubmitBidOutcome =
  | { ok: true; status: 'accepted'; finalAmount: number; proxy: boolean }
  | { ok: false; status: 'invalid'; message: string; requiredMinimum: number };

/**
 * Açık teklif facade — ince köprü.
 *
 * Saf çekirdek motorlarını çağırır:
 *   - `validateBid` (src/lib/borsa/auctionEngine.ts)
 *   - `calculateProxyBid` (src/lib/borsa/auctionEngine.ts)
 *
 * Gerçek RPC çağrısı: Tool B Supabase mobil istemcisini bağladığında bu noktadan
 * `placeBidRpc({ auctionId, amountTry: finalAmount, idempotencyKey })` çağrılır
 * (src/lib/placeBid.ts — sunucu place_bid RPC'sini sarmalar).
 */
export async function submitBid(params: SubmitBidParams): Promise<SubmitBidOutcome> {
  const validation: BidValidationResult = validateBid(
    params.currentBid,
    params.newBid,
    params.minIncrement,
  );
  if (!validation.valid) {
    return {
      ok: false,
      status: 'invalid',
      message: validation.error,
      requiredMinimum: validation.requiredMinimum,
    };
  }

  let finalAmount = params.newBid;
  let proxy = false;
  if (params.userMaxProxy && params.userMaxProxy > params.newBid) {
    finalAmount = calculateProxyBid(params.newBid, params.userMaxProxy, params.minIncrement);
    proxy = finalAmount > params.newBid;
  }

  // TODO: Tool B Supabase client bağlandığında gerçek RPC çağrısı:
  //   const result = await placeBidRpc({ auctionId: params.auctionId, amountTry: finalAmount });
  // Şimdilik UI testi için simülasyon:
  await new Promise((r) => setTimeout(r, 250));

  return { ok: true, status: 'accepted', finalAmount, proxy };
}

// ─────────────────────────────────────────────────────────────────────────────
// Hemen Al — çekirdek `executeBuyNow` helper'i (src/lib/buyNow.ts) artık BAĞLI.
// Bu dosyadan kaldırıldı; mobil ekran `mobile/shared/buyNow.ts` üzerinden import eder.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// Kapalı Teklif — KISIR FACADE (henüz bağlanmadı; ayrı çekirdek görevi)
// ─────────────────────────────────────────────────────────────────────────────
//
// Sealed-bid çekirdekte RPC'si henüz yok. Ayrı bir çekirdek görevi olarak
// tasarlanacak; mobil tarafta o helper bağlanınca bu facade ince köprüye dönüşür.
// Şu an sıfır iş mantığı içerir.

export type SubmitSealedBidParams = {
  auctionId: string;
  bidderId: string;
  amountTry: number;
  reserveTry?: number;
  termsAccepted: boolean;
};

export type SubmitSealedBidOutcome = {
  ok: false;
  status: 'not_wired';
  reason: 'core_api_missing';
};

/**
 * Kapalı Teklif — KISIR FACADE.
 *
 * Çekirdek sealed-bid helper'ı bağlanınca ince köprüye dönüşecek —
 * ŞU AN İSTEMCİDE PARA MANTIĞI YOK (güvenlik).
 */
export async function submitSealedBid(_params: SubmitSealedBidParams): Promise<SubmitSealedBidOutcome> {
  return { ok: false, status: 'not_wired', reason: 'core_api_missing' };
}
