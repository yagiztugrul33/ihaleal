/**
 * Gerçek emsal + geçmiş verisine dayalı Ekonomik/Fiyat bölümü.
 *
 * generateMockReport()'un economic_* alanlarını (uydurma seed-jitter sayılar)
 * gerçek veriyle değiştirir:
 *  - Emsal fiyat bandı: fetchRemoteAuctionsCatalog() (gerçek Supabase auctions/listings)
 *    + emsalMotoru.findEmsaller() (gerçek benzerlik skorlaması).
 *  - Kendi ilan geçmişi: transactionHistory.loadListingHistory() — sadece
 *    fromDb===true olan gerçek sonuçlar kullanılır, demo fallback'e asla güvenilmez.
 *
 * Yeterli gerçek emsal (MIN_COMPARABLES eşiği) yoksa hiçbir sayı üretilmez —
 * rapor açıkça "yeterli veri yok" der. Ortalama kira için şu an güvenilir bir
 * gerçek kaynak yok (kiralık emsal ayrı bir kapsam) — bu alan her zaman null.
 */

import type { Auction } from "@/types/auction";
import { AUCTIONS } from "@/data/auctions";
import { findEmsaller, daysBetween, type EmsalRow } from "@/lib/reports/emsalMotoru";
import { loadListingHistory, totalValueChangePct } from "@/lib/reports/transactionHistory";
import { fetchRemoteAuctionsCatalog } from "@/lib/supabaseAuctionsFetch";
import type { PropertyAnalysisReportRecord } from "@/lib/aiAnalysis";

/**
 * Henüz tam bir `Auction` nesnesi olmayan bağlamlar (örn. ilan oluşturma formu,
 * kayıt tamamlanır tamamlanmaz) için emsal analizine yetecek asgari şekli üretir.
 * Sadece emsalMotoru/transactionHistory'nin okuduğu alanlar doldurulur.
 */
export function buildMinimalAuctionForAnalysis(fields: {
  id: string;
  city: string;
  district: string;
  category: string;
  grossSqm: number;
  startPriceTry: number;
  status?: Auction["status"];
  title?: string;
  marketingMode?: Auction["marketingMode"];
  images?: string[];
  startsAt?: string;
}): Auction {
  const template = JSON.parse(JSON.stringify(AUCTIONS[0])) as Auction;
  return {
    ...template,
    id: fields.id,
    city: fields.city,
    district: fields.district,
    category: fields.category,
    currentBid: fields.startPriceTry,
    startingBid: fields.startPriceTry,
    status: fields.status ?? "upcoming",
    propertyDetails: { ...template.propertyDetails, grossSqm: fields.grossSqm },
    ...(fields.title !== undefined ? { title: fields.title } : {}),
    ...(fields.marketingMode !== undefined ? { marketingMode: fields.marketingMode } : {}),
    ...(fields.images !== undefined ? { images: fields.images } : {}),
    ...(fields.startsAt !== undefined ? { startsAt: fields.startsAt } : {}),
  };
}

/** Güvenilir bir fiyat bandı göstermek için gereken asgari gerçek kapanmış/aktif emsal sayısı. */
export const MIN_COMPARABLES = 4;

/** Raporda listelenecek en fazla emsal ilan sayısı (şeffaflık tablosu). */
export const MAX_COMPARABLES_SHOWN = 8;

/** Sıralı emsal/pozisyon tablosunda gösterilen satır — hedef ilan işaretlenir. */
export type RankedEmsalRow = EmsalRow & { isTarget: boolean };

export type EconomicRealAnalysis =
  | {
      isReal: true;
      comparableCount: number;
      minComparableRequired: number;
      medianPricePerM2: number;
      minPricePerM2: number;
      maxPricePerM2: number;
      closingPremiumPct: number | null;
      closingSampleSize: number;
      historyFromDb: boolean;
      ownHistoryChangePct: number | null;
      /** Şeffaflık için gösterilen en benzer emsaller (en çok MAX_COMPARABLES_SHOWN adet). Satıcı kimliği içermez. */
      comparables: EmsalRow[];
      /** Bu ilanın kendi m² fiyatı (emsal karşılaştırması için). */
      targetPricePerM2: number;
      /** Bu ilanın kendi toplam fiyatı (₺). */
      targetTotalPrice: number;
      /** m² fiyatına göre emsaller arasındaki sıralaması (1 = en yüksek fiyat). */
      rank: { position: number; total: number; percentile: number };
      /** Tüm bulunan emsaller + hedef ilan, m² fiyatına göre artan sıralı — pozisyon grafiği/tablosu için. */
      rankedComparables: RankedEmsalRow[];
      /** Aynı şehirdeki gerçek ilanlardan satılık/kiralık sayısı (dealType alanı olmayanlar sayılmaz). */
      regionSaleCount: number;
      regionRentCount: number;
    }
  | {
      isReal: false;
      comparableCount: number;
      minComparableRequired: number;
      reason: "insufficient_comparables" | "missing_gross_sqm";
    };

export type RealEconomicResult = {
  overrides: Partial<PropertyAnalysisReportRecord>;
  analysis: EconomicRealAnalysis;
};

/** Bir ilan için gerçek emsal/geçmiş verisinden Ekonomik bölüm override'ı hesaplar. */
export async function computeRealEconomicSection(auction: Auction): Promise<RealEconomicResult> {
  const grossSqm = auction.propertyDetails?.grossSqm ?? 0;
  const catalog = await fetchRemoteAuctionsCatalog();
  // Katalog hedef ilanın kendisini de içerebilir — bir ilanı kendisiyle "emsal"
  // olarak karşılaştırmamak (sim=100, medyanı bozar) için hariç tutulur.
  const emsal = findEmsaller(auction, catalog.filter((a) => a.id !== auction.id));

  if (grossSqm <= 0) {
    return {
      overrides: {
        economic_fair_market_value_try: null,
        economic_lower_bound_try: null,
        economic_upper_bound_try: null,
        economic_avg_rent_try: null,
        economic_price_trend_3y_pct: null,
        economic_price_trend_5y_pct: null,
      },
      analysis: {
        isReal: false,
        comparableCount: emsal.count,
        minComparableRequired: MIN_COMPARABLES,
        reason: "missing_gross_sqm",
      },
    };
  }

  if (emsal.count < MIN_COMPARABLES) {
    return {
      overrides: {
        economic_fair_market_value_try: null,
        economic_lower_bound_try: null,
        economic_upper_bound_try: null,
        economic_avg_rent_try: null,
        economic_price_trend_3y_pct: null,
        economic_price_trend_5y_pct: null,
      },
      analysis: {
        isReal: false,
        comparableCount: emsal.count,
        minComparableRequired: MIN_COMPARABLES,
        reason: "insufficient_comparables",
      },
    };
  }

  const { history, fromDb } = await loadListingHistory(auction);
  const ownHistoryChangePct = fromDb && history.length >= 2 ? totalValueChangePct(history) : null;

  const targetTotalPrice = auction.currentBid || auction.startingBid || 0;
  const targetPricePerM2 = Math.round(targetTotalPrice / grossSqm);
  const targetRow: RankedEmsalRow = {
    id: auction.id,
    title: auction.title,
    district: auction.district || "",
    city: auction.city || "",
    category: auction.category || "",
    pricePerM2: targetPricePerM2,
    grossM2: grossSqm,
    totalPrice: Math.round(targetTotalPrice),
    daysOnMarket: auction.startsAt ? daysBetween(auction.startsAt) : 0,
    daysOnMarketKnown: Boolean(auction.startsAt),
    status: auction.status === "live" ? "live" : auction.status === "ended" ? "ended" : "upcoming",
    similarity: 100,
    isTarget: true,
    imageUrl: auction.images?.[0],
  };
  const rankedComparables: RankedEmsalRow[] = [
    ...emsal.rows.map((r) => ({ ...r, isTarget: false })),
    targetRow,
  ].sort((a, b) => a.pricePerM2 - b.pricePerM2);

  // Bölgedeki (aynı şehir) gerçek ilanların satılık/kiralık dağılımı — emsal benzerlik
  // eşiğinden bağımsız, sadece şehir eşleşmesine dayalı daha geniş bir sayım.
  const sameCityListings = catalog.filter((a) => a.city && auction.city && a.city === auction.city);
  const regionSaleCount = sameCityListings.filter((a) => a.dealType === "sale").length;
  const regionRentCount = sameCityListings.filter((a) => a.dealType === "rent").length;

  return {
    overrides: {
      economic_fair_market_value_try: Math.round(emsal.medianPricePerM2 * grossSqm),
      economic_lower_bound_try: Math.round(emsal.minPricePerM2 * grossSqm),
      economic_upper_bound_try: Math.round(emsal.maxPricePerM2 * grossSqm),
      // Kiralık emsal ayrı bir veri seti gerektiriyor — şu an güvenilir gerçek kaynağı yok.
      economic_avg_rent_try: null,
      economic_price_trend_3y_pct: ownHistoryChangePct,
      economic_price_trend_5y_pct: null,
      economic_municipal_plan_alignment: null,
    },
    analysis: {
      isReal: true,
      comparableCount: emsal.count,
      minComparableRequired: MIN_COMPARABLES,
      medianPricePerM2: emsal.medianPricePerM2,
      minPricePerM2: emsal.minPricePerM2,
      maxPricePerM2: emsal.maxPricePerM2,
      closingPremiumPct: emsal.closingSampleSize > 0 ? emsal.closingPremiumPct : null,
      closingSampleSize: emsal.closingSampleSize,
      historyFromDb: fromDb,
      ownHistoryChangePct,
      comparables: emsal.rows.slice(0, MAX_COMPARABLES_SHOWN),
      targetPricePerM2,
      targetTotalPrice: Math.round(targetTotalPrice),
      rank: emsal.targetRank,
      rankedComparables,
      regionSaleCount,
      regionRentCount,
    },
  };
}
