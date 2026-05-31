/**
 * Mülk sicili (listing_transaction_history) fetcher + deterministic fallback.
 *
 * - Önce DB'den `get_listing_history` RPC ile çekmeye çalışır.
 * - Boş dönerse (henüz seed edilmemişse), catalog Auction'ından deterministic
 *   demo geçmiş üretir: ilk listeleme + 1-2 fiyat değişikliği veya tek satış.
 *
 * Master onayı dahilinde — tablo public read, sahip bilgisi yok, sadece tarih
 * + tutar + tip.
 */

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Auction } from "@/types/auction";

export type ListingTxType = "listing" | "sale" | "price_change";

export interface ListingTransaction {
  date: string; // ISO
  type: ListingTxType;
  priceTry: number;
  ownerChanged: boolean;
  source: "platform" | "tkgm" | "external" | "demo";
  notes?: string;
}

/** Deterministik küçük varyans (0..1) — id+seed'den üretilir. */
function det(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Catalog Auction'ından deterministic demo geçmiş üretir. */
export function generateDemoHistory(auction: Auction): ListingTransaction[] {
  const h = hashId(auction.id);
  const txCount = 1 + (h % 3); // 1..3 işlem
  const currentPrice =
    auction.currentBid || auction.startingBid || auction.estimatedValue || 0;
  const out: ListingTransaction[] = [];
  const now = Date.now();

  // İlk listeleme — 2-5 yıl önce, %20-40 daha düşük fiyat
  const initialYearsBack = 2 + Math.floor(det(h) * 3);
  const initialPrice = Math.round(currentPrice * (0.6 + det(h + 1) * 0.2));
  out.push({
    date: new Date(now - initialYearsBack * 365 * 86_400_000).toISOString(),
    type: "listing",
    priceTry: initialPrice,
    ownerChanged: false,
    source: "demo",
    notes: "İlk platform listemesi (demo).",
  });

  if (txCount >= 2) {
    // Bir satış — yarı yolda
    const saleYearsBack = Math.max(1, Math.floor(initialYearsBack / 2));
    const salePrice = Math.round(currentPrice * (0.75 + det(h + 2) * 0.1));
    out.push({
      date: new Date(now - saleYearsBack * 365 * 86_400_000).toISOString(),
      type: "sale",
      priceTry: salePrice,
      ownerChanged: true,
      source: "demo",
      notes: "Önceki satış işlemi (demo).",
    });
  }

  if (txCount >= 3) {
    // Bir fiyat güncellemesi — son 6 ay
    const monthsBack = 1 + Math.floor(det(h + 3) * 5);
    const updatePrice = Math.round(currentPrice * (0.95 + det(h + 4) * 0.05));
    out.push({
      date: new Date(now - monthsBack * 30 * 86_400_000).toISOString(),
      type: "price_change",
      priceTry: updatePrice,
      ownerChanged: false,
      source: "demo",
      notes: "Liste fiyatı güncellemesi (demo).",
    });
  }

  // Bugün — mevcut liste/teklif
  out.push({
    date: new Date(now).toISOString(),
    type: auction.status === "ended" ? "sale" : "listing",
    priceTry: currentPrice,
    ownerChanged: false,
    source: "demo",
    notes: "Şu anki listeleme (demo — kapanış gerçekleştiğinde sale).",
  });

  return out;
}

/** DB'den çek, boş ise demo fallback. */
export async function loadListingHistory(
  auction: Auction,
): Promise<{ history: ListingTransaction[]; fromDb: boolean }> {
  if (!isSupabaseConfigured()) {
    return { history: generateDemoHistory(auction), fromDb: false };
  }
  try {
    const { data, error } = await supabase.rpc("get_listing_history", {
      p_listing_id: auction.id,
    });
    if (error || !Array.isArray(data) || data.length === 0) {
      return { history: generateDemoHistory(auction), fromDb: false };
    }
    const history: ListingTransaction[] = data.map((r: Record<string, unknown>) => ({
      date: String(r.transaction_date),
      type: (r.transaction_type as ListingTxType) || "listing",
      priceTry: Number(r.price_try) || 0,
      ownerChanged: Boolean(r.owner_changed),
      source: (r.source as ListingTransaction["source"]) || "platform",
      notes: r.notes ? String(r.notes) : undefined,
    }));
    return { history, fromDb: true };
  } catch {
    return { history: generateDemoHistory(auction), fromDb: false };
  }
}

/** El değiştirme sayısı (sale + ownerChanged true). */
export function ownershipChanges(history: ListingTransaction[]): number {
  return history.filter((t) => t.ownerChanged).length;
}

/** Toplam değer değişim % (ilk → güncel). */
export function totalValueChangePct(history: ListingTransaction[]): number {
  if (history.length < 2) return 0;
  const first = history[0].priceTry;
  const last = history[history.length - 1].priceTry;
  if (first <= 0) return 0;
  return Math.round(((last - first) / first) * 1000) / 10;
}

/** Yıllık bileşik getiri %. */
export function annualizedReturnPct(history: ListingTransaction[]): number {
  if (history.length < 2) return 0;
  const first = history[0];
  const last = history[history.length - 1];
  const years =
    (new Date(last.date).getTime() - new Date(first.date).getTime()) /
    (365 * 86_400_000);
  if (years < 0.5 || first.priceTry <= 0) return 0;
  const r = Math.pow(last.priceTry / first.priceTry, 1 / years) - 1;
  return Math.round(r * 1000) / 10;
}

/** Amortisman: bina yaşı × yıpranma oranı (basit hesap). */
export function amortizationCostTry(
  estimatedValueTry: number,
  buildingAgeYears: number,
): { yearlyRate: number; totalAmortization: number; remainingValue: number } {
  // Türkiye'de konut yıpranma oranı ~%2/yıl (50 yıllık ekonomik ömür varsayımı)
  const yearlyRate = 0.02;
  const totalRate = Math.min(buildingAgeYears * yearlyRate, 0.8); // max %80
  return {
    yearlyRate,
    totalAmortization: Math.round(estimatedValueTry * totalRate),
    remainingValue: Math.round(estimatedValueTry * (1 - totalRate)),
  };
}
