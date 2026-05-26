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
// Hemen Al + Kapalı Teklif — KISIR FACADE (henüz bağlanmadı)
// ─────────────────────────────────────────────────────────────────────────────
//
// Bu iki metot şu an sıfır iş mantığı içerir. Sebep: ihaleal çekirdeğinde mobile
// için exposed JS helper YOK — `execute_buy_now` Postgres RPC'si web sayfaları
// içinde inline çağrılıyor (src/pages/auction/BuyNow.tsx), sealed-bid için ise
// çekirdekte hiç fonksiyon yok. İstemcide KYC/eşik/komisyon/ref-üretimi
// yapmıyoruz; aksi takdirde para mantığı client-side'a sızar.
//
// Çekirdek `executeBuyNow` (KYC + RPC sarmalayıcı) ve `submitSealedBid` (RPC + escrow)
// helper'ları bağlanınca bu facade'ler İNCE KÖPRÜYE dönüşür: parametreyi iletir,
// sonucu çevirir, başka mantık yok. Tasarım çekirdek görev sahibinin.

export type SubmitBuyNowParams = {
  auctionId: string;
  bidderId: string;
  buyNowPriceTry: number;
  kycVerified: boolean;
  termsAccepted: boolean;
};

export type SubmitBuyNowOutcome = {
  ok: false;
  status: 'not_wired';
  reason: 'core_api_missing';
};

/**
 * Hemen Al — KISIR FACADE.
 *
 * Çekirdek `execute_buy_now` helper'ı bağlanınca ince köprüye dönüşecek —
 * ŞU AN İSTEMCİDE PARA MANTIĞI YOK (güvenlik).
 */
export async function submitBuyNow(_params: SubmitBuyNowParams): Promise<SubmitBuyNowOutcome> {
  return { ok: false, status: 'not_wired', reason: 'core_api_missing' };
}

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
