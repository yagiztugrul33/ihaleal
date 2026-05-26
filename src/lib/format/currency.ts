/**
 * Tek noktadan TRY para formatlayıcısı.
 *
 * Bu dosyadan ÖNCE 12+ ayrı dosyada inline `formatTry` tanımı vardı (Borsa sayfaları,
 * ibuyer/ges formları, kat karşılığı portalları, mobil bridge). Hepsi aynı niyetle
 * (Türkçe locale, sıfır ondalık) yazılmıştı.
 *
 * Canonical kaynak: web `src/lib/valuation/valuationEngine.ts` `Intl.NumberFormat`
 * kullanıyor. Bu modül onu canonical hâle getirdi; valuationEngine re-export ediyor.
 */

const tryFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

const tryFormatterWithDecimals = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Standart format: "₺1.234.567" (tam sayı, Türkçe locale). */
export function formatTry(value: number): string {
  if (!Number.isFinite(value)) return tryFormatter.format(0);
  return tryFormatter.format(value);
}

/** Ondalıklı format: "₺1.234.567,89". */
export function formatTryWithDecimals(value: number): string {
  if (!Number.isFinite(value)) return tryFormatterWithDecimals.format(0);
  return tryFormatterWithDecimals.format(value);
}

/** Kısa milyon notasyonu: "₺1,2 M". */
export function formatTryCompact(value: number): string {
  if (!Number.isFinite(value)) return "₺0";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `₺${(value / 1_000_000_000).toFixed(2).replace(".", ",")} Mrd`;
  if (abs >= 1_000_000) return `₺${(value / 1_000_000).toFixed(2).replace(".", ",")} M`;
  if (abs >= 1_000) return `₺${(value / 1_000).toFixed(1).replace(".", ",")} B`;
  return `₺${Math.round(value)}`;
}
