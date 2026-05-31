/**
 * Emsal motoru — bir mülkün bölge emsalleri arasındaki yeri.
 *
 * Endeksa "9/21 sıralama" mantığı için catalog'tan benzer mülkleri toplar
 * + m²-fiyat, gün, durum tablosu üretir + sıralama hesaplar.
 *
 * KAPANIŞ ENDEKSİ (Endeksa'da YOK — bizim kozumuz):
 * Status='ended' mülklerden başlangıç vs. kapanış oranı hesaplar →
 * "Bu bölge ihaleleri ort. açılışın %X üstünde kapanıyor."
 */

import type { Auction } from "@/types/auction";

export interface EmsalRow {
  id: string;
  title: string;
  district: string;
  city: string;
  category: string;
  pricePerM2: number;
  grossM2: number;
  totalPrice: number;
  daysOnMarket: number;
  status: "live" | "ended" | "upcoming";
  similarity: number; // 0-100
}

export interface EmsalSummary {
  count: number;
  rows: EmsalRow[];
  medianPricePerM2: number;
  meanPricePerM2: number;
  minPricePerM2: number;
  maxPricePerM2: number;
  targetRank: { position: number; total: number; percentile: number };
  closingPremiumPct: number; // ortalama kapanış / başlangıç - 1
  closingSampleSize: number;
}

function daysBetween(iso?: string | null): number {
  if (!iso) return 0;
  const d = new Date(iso).getTime();
  if (!Number.isFinite(d)) return 0;
  return Math.max(0, Math.round((Date.now() - d) / 86_400_000));
}

function similarityScore(target: Auction, candidate: Auction): number {
  if (target.id === candidate.id) return 100;
  let score = 0;
  // Şehir 30 puan
  if (target.city && candidate.city && target.city === candidate.city) score += 30;
  // İlçe 25 puan
  if (target.district && candidate.district && target.district === candidate.district) score += 25;
  // Kategori 25 puan
  if (target.category && candidate.category && target.category === candidate.category) score += 25;
  // m² yakınlığı 20 puan
  const tM2 =
    (target.propertyDetails as Record<string, unknown> | undefined)?.grossSqm as number | undefined;
  const cM2 =
    (candidate.propertyDetails as Record<string, unknown> | undefined)?.grossSqm as number | undefined;
  if (tM2 && cM2 && tM2 > 0) {
    const ratio = Math.min(tM2, cM2) / Math.max(tM2, cM2);
    score += Math.round(20 * ratio);
  }
  return score;
}

export function findEmsaller(
  target: Auction,
  catalog: Auction[],
  maxCount = 20,
): EmsalSummary {
  const candidates: Array<{ a: Auction; sim: number }> = [];
  for (const c of catalog) {
    const sim = similarityScore(target, c);
    if (sim >= 30) candidates.push({ a: c, sim });
  }
  candidates.sort((a, b) => b.sim - a.sim);
  const top = candidates.slice(0, maxCount);

  const rows: EmsalRow[] = top.map(({ a, sim }) => {
    const props = (a.propertyDetails as Record<string, unknown> | undefined) ?? {};
    const grossM2 = (props.grossSqm as number) || 0;
    const totalPrice = a.currentBid || a.startingBid || 0;
    const ppm2 = grossM2 > 0 ? totalPrice / grossM2 : 0;
    return {
      id: a.id,
      title: a.title,
      district: a.district || "",
      city: a.city || "",
      category: a.category || "",
      pricePerM2: Math.round(ppm2),
      grossM2,
      totalPrice: Math.round(totalPrice),
      daysOnMarket: daysBetween(a.endDate ?? null),
      status:
        a.status === "live" ? "live" : a.status === "ended" ? "ended" : "upcoming",
      similarity: sim,
    };
  });

  // İstatistikler
  const ppm2s = rows.map((r) => r.pricePerM2).filter((v) => v > 0).sort((a, b) => a - b);
  const median = ppm2s.length > 0 ? ppm2s[Math.floor(ppm2s.length / 2)] : 0;
  const mean = ppm2s.length > 0 ? Math.round(ppm2s.reduce((a, b) => a + b, 0) / ppm2s.length) : 0;
  const min = ppm2s[0] ?? 0;
  const max = ppm2s[ppm2s.length - 1] ?? 0;

  // Hedefin sıralamadaki yeri (m² fiyat bazında)
  const tProps = (target.propertyDetails as Record<string, unknown> | undefined) ?? {};
  const tM2 = (tProps.grossSqm as number) || 0;
  const tPpm2 = tM2 > 0 ? (target.currentBid || target.startingBid || 0) / tM2 : 0;
  // Sıralama: yüksek fiyat = 1.
  const sorted = [...rows].sort((a, b) => b.pricePerM2 - a.pricePerM2);
  let position = sorted.findIndex((r) => r.pricePerM2 < tPpm2);
  if (position === -1) position = sorted.length;
  const total = Math.max(sorted.length, 1);
  const percentile = Math.round(((total - position) / total) * 100);

  // KAPANIŞ ENDEKSİ — status=ended olanlardan
  const closed = catalog.filter(
    (a) =>
      a.status === "ended" &&
      a.city === target.city &&
      a.startingBid &&
      a.currentBid,
  );
  let closingPremium = 0;
  if (closed.length > 0) {
    const sum = closed.reduce(
      (acc, a) => acc + (a.currentBid / a.startingBid - 1) * 100,
      0,
    );
    closingPremium = Math.round((sum / closed.length) * 10) / 10;
  }

  return {
    count: rows.length,
    rows,
    medianPricePerM2: median,
    meanPricePerM2: mean,
    minPricePerM2: min,
    maxPricePerM2: max,
    targetRank: { position: position + 1, total, percentile },
    closingPremiumPct: closingPremium,
    closingSampleSize: closed.length,
  };
}
