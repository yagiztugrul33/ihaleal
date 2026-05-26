import { validateBid, calculateProxyBid, type BidValidationResult } from './borsa';

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
 * Mobile-side bid submission facade.
 *
 * Çekirdek `placeBidRpc` (src/lib/placeBid.ts) doğrudan çağrılmaz — sebep:
 *   1. Bu dosya bridge'in tüketici tarafıdır; çekirdek mantığı buradan değiştirilemez.
 *   2. Supabase istemcisi mobil tarafta Tool B (auth/secure-store) tarafından kurulur.
 *
 * Bu fonksiyon validateBid + calculateProxyBid (pure engine) üzerinden istemci-tarafı
 * doğrulamayı yapar; gerçek RPC çağrısı Tool B Supabase mobile client'ı bağladıktan
 * sonra burada `placeBidRpc({ auctionId, amountTry: final, idempotencyKey })` çağrısıyla
 * etkinleştirilmelidir.
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
