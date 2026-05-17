import type { GesAnalysisResult } from "../ges/gesEngine";
import { DEFAULT_DISCLAIMER } from "../core/types";
import { fmtPct } from "../formatDisplay";

export function buildGesFeasibilityMarkdown(result: GesAnalysisResult): string {
  const { irradiance, production, financial, scorecard } = result;
  const lines = [
    "# GES Fizibilite Ozeti (Indikatif)",
    "",
    "## Yonetici Ozeti",
    ...result.aiReasoning.map((r) => `- ${r}`),
    "",
    "## Muhendislik Metrikleri",
    `- Yillik POA: **${irradiance.value.annualPoaKwhM2.toFixed(0)}** kWh/m²/yil`,
    `- Y1 uretim: **${production.value.annualEnergyKwhYear1.toLocaleString("tr-TR")}** kWh`,
    `- Kapasite faktoru: **%${(production.value.capacityFactor * 100).toFixed(1)}**`,
    `- PR: **%${(result.pvSystem.value.computedPerformanceRatio * 100).toFixed(1)}**`,
    "",
    "## Finansal (basitlestirilmis DCF)",
    `- NPV: **${financial.value.npvTry.toLocaleString("tr-TR")}** TRY`,
    `- IRR: **${fmtPct(financial.value.irrPct)}**`,
    `- LCOE: **${financial.value.lcoeTryPerKwh.toFixed(2)}** TRY/kWh`,
    "",
    "## Skor Karti (0-100, indikatif)",
    `| Alan | Skor |`,
    `|------|------|`,
    `| GES uygunluk | ${scorecard.gesSuitability} |`,
    `| Altyapi | ${scorecard.infrastructure} |`,
    `| Karlilik | ${scorecard.profitability} |`,
    `| Cevre | ${scorecard.environmental} |`,
    `| Genel | ${scorecard.overall} |`,
    "",
    "## Metodoloji",
    `- ${irradiance.methodology.name} (${irradiance.methodology.standard ?? "ref"})`,
    `- ${financial.methodology.name}`,
    "",
    "## Sinirlamalar",
    ...result.financial.limitations.map((l) => `- ${l}`),
    "",
    "## Yasal Uyari",
    DEFAULT_DISCLAIMER.legal,
  ];
  return lines.join("\n");
}
