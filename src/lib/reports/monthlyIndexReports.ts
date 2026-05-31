/**
 * Aylık endeks raporları — Master Dalga 3-3.
 *
 * Mevcut regionalPriceData + price_index altyapısından hesap-tabanlı
 * son N aylık rapor üretir. Backend report history aktive edildiğinde
 * gerçek zaman serisi entegre olur; şimdilik canlı baz fiyat +
 * deterministik varyans ile demo niteliğinde tutarlı raporlar.
 */

import { REGIONAL_PRICE_DATA, type CityKey } from "@/lib/valuation/regionalPriceData";

export type ReportCategory = "konut" | "ticari" | "arsa";
export type ReportCity = CityKey;

export interface MonthlyReportRow {
  category: ReportCategory;
  avgSalePerM2: number;
  avgRentPerM2: number;
  changePct: number; // Aylık değişim
  yearlyChangePct: number; // Yıllık değişim
}

export interface MonthlyIndexReport {
  id: string;
  city: ReportCity;
  cityLabel: string;
  year: number;
  month: number; // 1-12
  monthLabel: string; // "Mart 2026" gibi
  publishedAt: string; // ISO
  summary: string;
  rows: MonthlyReportRow[];
  overallIndex: number;
  overallChangePct: number;
  topDistricts: { name: string; salePerM2: number; rentPerM2: number }[];
}

const MONTH_NAMES_TR = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

const CATEGORY_COEFFS: Record<ReportCategory, { saleMul: number; rentMul: number; volatility: number }> = {
  konut: { saleMul: 1.0, rentMul: 1.0, volatility: 1.0 },
  ticari: { saleMul: 1.45, rentMul: 1.7, volatility: 1.3 },
  arsa: { saleMul: 0.6, rentMul: 0.3, volatility: 1.5 },
};

/** Deterministik küçük varyans — id + ay'dan üretilir, her render aynı sonuç */
function deterministicVariance(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x); // 0..1
}

function variance(seed: number, range: number): number {
  return (deterministicVariance(seed) - 0.5) * range;
}

/**
 * Belirli bir şehir için aylık raporu üret.
 * `monthsBack`: 0 = bu ay, 1 = geçen ay...
 */
export function generateMonthlyReport(city: CityKey, monthsBack: number): MonthlyIndexReport | null {
  const cp = REGIONAL_PRICE_DATA.find((c) => c.key === city);
  if (!cp) return null;

  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
  const year = target.getFullYear();
  const month = target.getMonth() + 1;
  const monthLabel = `${MONTH_NAMES_TR[month - 1]} ${year}`;
  const reportId = `${city}-${year}-${String(month).padStart(2, "0")}`;
  const seedBase = year * 12 + month;

  const rows: MonthlyReportRow[] = (["konut", "ticari", "arsa"] as ReportCategory[]).map((cat) => {
    const coeff = CATEGORY_COEFFS[cat];
    const saleBase = cp.salePerM2 * coeff.saleMul;
    const rentBase = cp.rentPerM2 * coeff.rentMul;
    const monthlySeed = seedBase + cat.charCodeAt(0);
    const monthlyChange = variance(monthlySeed, 6 * coeff.volatility); // ±%3'ten %4.5'a göre kategori
    const yearlySeed = seedBase * 7 + cat.charCodeAt(1);
    const yearlyChange = 18 + variance(yearlySeed, 14 * coeff.volatility); // ortalama %18 yıllık
    // Aylar geriye gittikçe fiyat düşer (yıllık trend asıl)
    const monthlyDecay = Math.pow(1 + monthlyChange / 100, -monthsBack);
    return {
      category: cat,
      avgSalePerM2: Math.round(saleBase * monthlyDecay),
      avgRentPerM2: Math.round(rentBase * monthlyDecay),
      changePct: Math.round(monthlyChange * 100) / 100,
      yearlyChangePct: Math.round(yearlyChange * 100) / 100,
    };
  });

  // Genel endeks: ağırlıklı ortalama (konut %60, ticari %25, arsa %15)
  const overallIndex = Math.round(
    rows[0].avgSalePerM2 * 0.6 + rows[1].avgSalePerM2 * 0.25 + rows[2].avgSalePerM2 * 0.15,
  );
  const overallChangePct = Math.round(
    (rows[0].changePct * 0.6 + rows[1].changePct * 0.25 + rows[2].changePct * 0.15) * 100,
  ) / 100;

  // İlçe top 3 (regional data varsa)
  const topDistricts = cp.districts
    ? Object.entries(cp.districts)
        .map(([name, p]) => ({ name, salePerM2: p.salePerM2, rentPerM2: p.rentPerM2 }))
        .sort((a, b) => b.salePerM2 - a.salePerM2)
        .slice(0, 3)
    : [];

  const summary =
    `${cp.label}'da ${monthLabel} dönemi ${overallChangePct > 0 ? "yükseliş" : overallChangePct < 0 ? "düşüş" : "yatay seyir"} ` +
    `(%${overallChangePct > 0 ? "+" : ""}${overallChangePct.toFixed(2)} aylık). ` +
    `Konut ₺${rows[0].avgSalePerM2.toLocaleString("tr-TR")}/m², ` +
    `ticari ₺${rows[1].avgSalePerM2.toLocaleString("tr-TR")}/m², ` +
    `arsa ₺${rows[2].avgSalePerM2.toLocaleString("tr-TR")}/m². ` +
    `Yıllık ortalama getiri: %${rows[0].yearlyChangePct.toFixed(1)}.`;

  // Yayın tarihi: o ayın 1'i
  const publishedAt = new Date(year, month - 1, 1).toISOString();

  return {
    id: reportId,
    city,
    cityLabel: cp.label,
    year,
    month,
    monthLabel,
    publishedAt,
    summary,
    rows,
    overallIndex,
    overallChangePct,
    topDistricts,
  };
}

/** Son N ay × tüm büyük şehirler için rapor listesi (en yeni ilk). */
export function generateAllReports(monthsBack = 12): MonthlyIndexReport[] {
  const cities = REGIONAL_PRICE_DATA.map((c) => c.key);
  const out: MonthlyIndexReport[] = [];
  for (let mb = 0; mb < monthsBack; mb++) {
    for (const city of cities) {
      const r = generateMonthlyReport(city, mb);
      if (r) out.push(r);
    }
  }
  // En yeni ilk
  return out.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export const CATEGORY_LABEL_TR: Record<ReportCategory, string> = {
  konut: "Konut",
  ticari: "Ticari",
  arsa: "Arsa",
};
