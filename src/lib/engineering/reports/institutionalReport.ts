import type { SiteEnvironmentalBundle } from "@/lib/data/siteEnvironmentalData";
import type { SiteIntelligenceResult } from "../urban/siteIntelligence";
import { DEFAULT_DISCLAIMER } from "../core/types";
import { fmtNum, fmtScore } from "../formatDisplay";
import { buildGesFeasibilityMarkdown } from "./gesFeasibilityReport";

export function buildInstitutionalSiteReport(
  result: SiteIntelligenceResult,
  environmental?: SiteEnvironmentalBundle | null,
): string {
  const lines: string[] = [
    "# Kurumsal Site Istihbarat Raporu",
    "",
    "## Yonetici Ozeti",
    ...result.executiveSummary.map((l) => `- ${l}`),
    "",
    `**Stratejik skor (indikatif):** ${fmtScore(result.strategicScore)}/100`,
    environmental
      ? `**Veri kalitesi:** ${environmental.dataQuality} (${new Date(environmental.fetchedAt).toLocaleString("tr-TR")})`
      : "",
    "",
    "## Jeoteknik",
    `- Vs30: ${result.soil.value.vs30Mps.toFixed(0)} m/s (${result.soil.value.zeminSinifi})`,
    `- Sivislasma indeksi: ${result.soil.value.liquefactionIndex}/100`,
    `- Tasima gucu (indikatif): ${result.soil.value.bearingCapacityKpaIndicative} kPa`,
    ...result.soil.value.recommendations.map(
      (r) => `- **${r.label}** (${r.suitabilityScore}/100): ${r.rationale}`,
    ),
    "",
    "## Deprem Muhendisligi",
    `- Tasarim PGA: ${fmtNum(result.seismic.value.designPgaG, { digits: 2, suffix: "g" })}`,
    `- Risk: ${result.seismic.value.seismicRiskScore}/100 | Dayaniklilik: ${result.seismic.value.resilienceScore}/100`,
    ...result.seismic.value.retrofitHints.map((h) => `- ${h}`),
    "",
    "## Afet Riski",
    `- Bilesik tehlike: ${result.disaster.value.compositeHazardScore}/100`,
    `- Baskin: ${result.disaster.value.dominantHazards.join(", ") || "—"}`,
    ...result.disaster.value.mitigations.map((m) => `- ${m}`),
    "",
    "## Yangin Guvenligi (on tarama)",
    `- Uyum skoru: ${result.fire.value.complianceScore}/100`,
    ...result.fire.value.issues.map((i) => `- ${i}`),
    "",
  ];

  if (result.environmental?.pvgis) {
    lines.push(
      "## Cevresel Veri (PVGIS)",
      `- Yillik isinim: ${result.environmental.pvgis.annualIrradiationKwhM2.toFixed(0)} kWh/m²`,
      `- Kaynak: ${result.environmental.pvgis.source}`,
      "",
    );
  }

  if (result.ges) {
    lines.push("## GES Ozeti", buildGesFeasibilityMarkdown(result.ges), "");
  }

  lines.push(
    "## AI Yorum",
    ...result.aiReasoning.map((r) => `- ${r}`),
    "",
    "## Sinirlamalar",
    ...result.soil.limitations.map((l) => `- ${l}`),
    "",
    "## Yasal Uyari",
    DEFAULT_DISCLAIMER.legal,
  );

  return lines.join("\n");
}
