import { compactIsoTimestamp } from "@/lib/dateCompact";
import type { GesFeasibilityResult } from "./gesEngine";
import type { ParcelFeasibilityReport } from "./parcelFeasibility";

function fmt(n: number, digits = 0): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("tr-TR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function reportId(prefix: string): string {
  const t = compactIsoTimestamp();
  return `${prefix}-${t}`;
}

export function buildGesPrefeasibilityReport(
  inputs: Record<string, string | number>,
  result: GesFeasibilityResult,
): string {
  const id = reportId("GES");
  const lines = [
    "# GES Ön Fizibilite Raporu",
    "",
    `- **Rapor ID:** ${id}`,
    `- **Tarih:** ${new Date().toLocaleString("tr-TR")}`,
    `- **Seviye:** ${result.studyLabel} (bankable değil)`,
    "",
    "## Yasal uyarı",
    "Bu belge yatırım tavsiyesi değildir. Ön fizibilite çıktısıdır; resmi EIA/ bağlantı/ ruhsat süreçlerinin yerine geçmez.",
    "",
    "## Girdiler",
    ...Object.entries(inputs).map(([k, v]) => `- **${k}:** ${v}`),
    "",
    "## Sonuç özeti",
    "| Metrik | Değer |",
    "| --- | --- |",
    `| Kullanılabilir alan | ${fmt(result.usableAreaM2)} m² |`,
    `| Panel adedi | ${fmt(result.panelCount)} |`,
    `| DC kapasite | ${fmt(result.dcCapacityKwp, 1)} kWp |`,
    `| Yıllık üretim | ${fmt(result.annualProductionKwh)} kWh |`,
    `| Kapasite faktörü | ${fmt(result.capacityFactor * 100, 1)}% |`,
    `| NPV | ${fmt(result.npvTry)} TRY |`,
    `| IRR | ${result.irrPct != null ? fmt(result.irrPct, 1) + "%" : "—"} |`,
    `| LCOE | ${fmt(result.lcoeTryPerKwh, 2)} TRY/kWh |`,
    `| Basit ROI | ${fmt(result.simpleRoiPct, 1)}% |`,
    `| Geri ödeme | ${result.paybackYear ?? "—"} yıl |`,
    `| Veri kaynağı | ${result.dataSource} |`,
    `| Güven | ${result.confidence} |`,
    "",
    "## Formüller",
    ...result.formulaTrace.map(
      (s) => `- **${s.label}:** ${s.formula} → ${fmt(s.result, 2)} ${s.unit ?? ""}`,
    ),
    "",
    "## Varsayımlar",
    ...result.assumptions.map((a) => `- ${a}`),
    "",
    "## Sınırlamalar",
    ...result.limitations.map((l) => `- ${l}`),
  ];
  return lines.join("\n");
}

export function buildParcelPrefeasibilityReport(
  inputs: Record<string, string | number>,
  result: ParcelFeasibilityReport,
): string {
  const id = reportId("PARSEL");
  const lines = [
    "# Parsel / İmar Ön Fizibilite Raporu",
    "",
    `- **Rapor ID:** ${id}`,
    `- **Tarih:** ${new Date().toLocaleString("tr-TR")}`,
    `- **Seviye:** ${result.studyLabel}`,
    "",
    "## Yasal uyarı",
    "Yatırım tavsiyesi değildir. Manuel EMSAL/TAKS girdileri resmi imar belgesi yerine geçmez.",
    "",
    "## Girdiler",
    ...Object.entries(inputs).map(([k, v]) => `- **${k}:** ${v}`),
    "",
    "## Sonuç tablosu",
    "| Metrik | Değer |",
    "| --- | --- |",
    `| Maks. inşaat (EMSAL) | ${fmt(result.maxConstructionAreaM2)} m² |`,
    `| Taban alanı (TAKS) | ${fmt(result.footprintM2)} m² |`,
    `| Kat | ${fmt(result.floors)} |`,
    `| Birim adedi | ${fmt(result.unitCount)} |`,
    `| Satılabilir alan | ${fmt(result.totalSellableM2)} m² |`,
    `| Gelir | ${fmt(result.revenueTry)} TRY |`,
    `| Maliyet | ${fmt(result.costsTry)} TRY |`,
    `| Müteahhit kârı | ${fmt(result.contractorProfitTry)} TRY |`,
    `| Kâr marjı | ${fmt(result.profitMarginPct, 1)}% |`,
    `| Fizibilite skoru | ${fmt(result.feasibilityScore)}/100 |`,
  ];
  if (result.warnings.length) {
    lines.push("", "## Uyarılar", ...result.warnings.map((w) => `- ${w}`));
  }
  lines.push(
    "",
    "## Varsayımlar",
    ...result.assumptions.map((a) => `- ${a}`),
    "",
    "## Sınırlamalar",
    ...result.limitations.map((l) => `- ${l}`),
    "",
    `**Güven:** ${result.confidence}`,
  );
  return lines.join("\n");
}

export {
  buildGesMarkdownReport,
  buildParcelMarkdownReport,
  reportId as engineeringReportId,
} from "./reports/markdownReports";
