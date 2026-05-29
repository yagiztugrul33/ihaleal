import type { PropertyMarketingMode } from "@/types/auction";

/**
 * Demo notu: Bu dosya kural tabanli simulasyon mantigi icerir.
 * Gercek islem; placeBid / preAuthorize / odeme / escrow cekirdegi ve lisansli PSP akisi uzerinden calismalidir.
 * Hukuki ve vergisel baglayicilik icin uzman onayi gerekir.
 */

export type AuctionFormat = "timed" | "live" | "sealed";
export type SoftCloseMode = "extend" | "reset";

export type SoftClosePolicy = {
  thresholdMinutes: number;
  extensionMinutes: number;
  mode?: SoftCloseMode;
};

export type BidValidationResult =
  | { valid: true; requiredMinimum: number }
  | { valid: false; requiredMinimum: number; error: string };

export type RankedBid = {
  bidder: string;
  amount: number;
  timestamp: string | number | Date;
};

export type CorePlaceBidFn<TResponse> = (input: {
  auctionId: string;
  bidderId: string;
  amount: number;
  format: AuctionFormat;
}) => Promise<TResponse>;

const DEFAULT_SOFT_CLOSE: SoftClosePolicy = {
  thresholdMinutes: 3,
  extensionMinutes: 2,
  mode: "extend",
};

function toMs(value: string | number | Date): number {
  if (typeof value === "number") return value;
  if (value instanceof Date) return value.getTime();
  return new Date(value).getTime();
}

export function toAuctionFormat(marketingMode: PropertyMarketingMode): AuctionFormat {
  if (marketingMode === "sealed_offers") return "sealed";
  return "timed";
}

/**
 * UI/akisa gore "auction" modunu timed veya live olarak acar.
 */
export function resolveAuctionFormat(params: {
  marketingMode: PropertyMarketingMode;
  liveSession: boolean;
}): AuctionFormat {
  if (params.marketingMode === "sealed_offers") return "sealed";
  if (params.marketingMode === "auction" && params.liveSession) return "live";
  return "timed";
}

/**
 * Proxy/vekil teklif:
 * Kullanici limiti mevcut en yuksek tekliften yuksekse sistem min artis kadar arttirir (limiti asmadan).
 */
export function calculateProxyBid(currentBid: number, userMax: number, increment: number): number {
  if (increment <= 0) return Math.max(currentBid, 0);
  if (userMax <= currentBid) return currentBid;
  return Math.min(userMax, currentBid + increment);
}

/**
 * Soft close / anti-sniping:
 * Bitise threshold dakika kala gelen teklifte sureyi uzatir veya bid zamanina resetler.
 */
export function shouldExtend(
  endTime: string | number | Date,
  bidTime: string | number | Date,
  policy: SoftClosePolicy | number = DEFAULT_SOFT_CLOSE,
): number {
  const resolvedPolicy: SoftClosePolicy =
    typeof policy === "number"
      ? {
          thresholdMinutes: policy,
          extensionMinutes: Math.max(1, policy),
          mode: "extend",
        }
      : {
          thresholdMinutes: policy.thresholdMinutes,
          extensionMinutes: policy.extensionMinutes,
          mode: policy.mode ?? "extend",
        };

  const endMs = toMs(endTime);
  const bidMs = toMs(bidTime);
  const thresholdMs = resolvedPolicy.thresholdMinutes * 60_000;
  const extensionMs = Math.max(1, resolvedPolicy.extensionMinutes) * 60_000;

  if (!Number.isFinite(endMs) || !Number.isFinite(bidMs)) return endMs;
  if (bidMs >= endMs) return endMs;
  if (endMs - bidMs > thresholdMs) return endMs;

  if (resolvedPolicy.mode === "reset") return bidMs + extensionMs;
  return endMs + extensionMs;
}

export function validateBid(currentBid: number, newBid: number, minIncrement: number): BidValidationResult {
  const requiredMinimum = currentBid + Math.max(1, minIncrement);
  if (!Number.isFinite(newBid) || newBid <= 0) {
    return { valid: false, requiredMinimum, error: "Teklif gecersiz." };
  }
  if (newBid < requiredMinimum) {
    return {
      valid: false,
      requiredMinimum,
      error: `Teklif en az ${requiredMinimum.toLocaleString("tr-TR")} olmalidir.`,
    };
  }
  return { valid: true, requiredMinimum };
}

export function isReserveMet(highestBid: number, reserve: number): boolean {
  if (reserve <= 0) return highestBid > 0;
  return highestBid >= reserve;
}

export function nextWinner(bids: RankedBid[], defaulted: string[] = []): RankedBid | null {
  const excluded = new Set(defaulted.map((x) => x.toLowerCase("tr-TR")));
  const ranked = [...bids].sort((a, b) => {
    if (b.amount !== a.amount) return b.amount - a.amount;
    return toMs(a.timestamp) - toMs(b.timestamp);
  });
  return ranked.find((bid) => !excluded.has(bid.bidder.toLowerCase("tr-TR"))) ?? null;
}

export function isOutbid(myBid: number | null | undefined, currentHighest: number): boolean {
  if (myBid == null || !Number.isFinite(myBid)) return false;
  return currentHighest > myBid;
}

/**
 * Core bid akisini yalnizca cagirir; cekirdek implementasyonuna dokunmaz.
 */
export async function submitBidViaCore<TResponse>(params: {
  placeBid: CorePlaceBidFn<TResponse>;
  auctionId: string;
  bidderId: string;
  amount: number;
  marketingMode: PropertyMarketingMode;
  liveSession?: boolean;
}): Promise<TResponse> {
  return params.placeBid({
    auctionId: params.auctionId,
    bidderId: params.bidderId,
    amount: params.amount,
    format: resolveAuctionFormat({
      marketingMode: params.marketingMode,
      liveSession: Boolean(params.liveSession),
    }),
  });
}
