/**
 * Pazarlık Asistanı — sadece "sadece ilan" (sabit fiyatlı, açık artırma dışı) satış modunda
 * anlamlıdır. İhalede fiyat rekabetçi teklifle oluşur; "pazarlık" kavramı yoktur.
 *
 * Önerilen indirim aralığı iki gerçek çıpaya dayanır:
 *  - Alt sınır: sıralı emsal listesinde bu ilandan bir sıra ucuz olan GERÇEK emsalin fiyatı
 *    (varsa) — "en azından şu kadarını isteyebilirsin" düzeyinde somut bir referans.
 *  - Üst sınır: bölge medyanına inmek için gereken fark — daha iddialı ama yine emsallere
 *    dayalı bir çıpa.
 * Bu bir istatistiksel kesinlik değil, şeffaf bir sezgiseldir; ilanın kendisi zaten medyanın
 * altındaysa veya hiç emsal yoksa öneri üretilmez.
 */

import type { PropertyMarketingMode } from "@/types/auction";
import type { EconomicRealAnalysis } from "@/lib/reports/realEconomicAnalysis";

export type NegotiationInsight =
  | {
      applicable: true;
      overMedianPct: number;
      nearestCheaperPct: number | null;
      avgDaysOnMarket: number | null;
      knownDaysSampleSize: number;
      suggestedLowPct: number | null;
      suggestedHighPct: number | null;
      suggestedLowTry: number | null;
      suggestedHighTry: number | null;
    }
  | { applicable: false };

export function computeNegotiationInsight(
  analysis: EconomicRealAnalysis,
  marketingMode: PropertyMarketingMode | undefined,
): NegotiationInsight {
  if (marketingMode !== "listing_only") return { applicable: false };
  if (!analysis.isReal) return { applicable: false };
  if (analysis.targetPricePerM2 <= 0 || analysis.medianPricePerM2 <= 0) return { applicable: false };

  const overMedianPct = ((analysis.targetPricePerM2 - analysis.medianPricePerM2) / analysis.medianPricePerM2) * 100;

  const sorted = analysis.rankedComparables;
  const targetIdx = sorted.findIndex((r) => r.isTarget);
  const nearestCheaper = targetIdx > 0 ? sorted[targetIdx - 1] : null;
  const nearestCheaperPct =
    nearestCheaper && nearestCheaper.pricePerM2 > 0
      ? ((analysis.targetPricePerM2 - nearestCheaper.pricePerM2) / analysis.targetPricePerM2) * 100
      : null;

  const others = sorted.filter((r) => !r.isTarget);
  const knownDays = others.filter((r) => r.daysOnMarketKnown);
  const avgDaysOnMarket =
    knownDays.length > 0 ? Math.round(knownDays.reduce((a, r) => a + r.daysOnMarket, 0) / knownDays.length) : null;

  let suggestedLowPct: number | null = null;
  let suggestedHighPct: number | null = null;

  if (overMedianPct > 0) {
    suggestedHighPct = Math.round(overMedianPct * 10) / 10;
    if (nearestCheaperPct != null && nearestCheaperPct > 0 && nearestCheaperPct < overMedianPct) {
      suggestedLowPct = Math.round(nearestCheaperPct * 10) / 10;
    } else {
      // Gerçek bir komşu emsal referansı yoksa: gerçek medyan farkının yarısı — açıkça
      // sezgisel bir alt sınır (üst sınır her zaman gerçek medyan farkı kalır).
      suggestedLowPct = Math.round((overMedianPct / 2) * 10) / 10;
    }
  }

  const suggestedLowTry = suggestedLowPct != null ? Math.round((analysis.targetTotalPrice * suggestedLowPct) / 100) : null;
  const suggestedHighTry = suggestedHighPct != null ? Math.round((analysis.targetTotalPrice * suggestedHighPct) / 100) : null;

  return {
    applicable: true,
    overMedianPct: Math.round(overMedianPct * 10) / 10,
    nearestCheaperPct: nearestCheaperPct != null ? Math.round(nearestCheaperPct * 10) / 10 : null,
    avgDaysOnMarket,
    knownDaysSampleSize: knownDays.length,
    suggestedLowPct,
    suggestedHighPct,
    suggestedLowTry,
    suggestedHighTry,
  };
}
