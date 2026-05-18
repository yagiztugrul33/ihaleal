import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function write(rel, content) {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, "utf8");
  console.log("wrote", rel);
}

write(
  "src/lib/engineering/gesEngine.ts",
  `import { isPvgisSolarResponse, normalizePvgisMonthly, type PvgisSolarResponse } from "@/lib/data/pvgisTypes";
import {
  DEFAULT_DEGRADATION_PCT_YEAR,
  DEFAULT_PERFORMANCE_RATIO,
  HOURS_PER_YEAR,
} from "./ges/constants";
import { irrBisection, lcoe, npv } from "./ges/financial";

export class GesValidationError extends Error {
  readonly field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = "GesValidationError";
    this.field = field;
  }
}

const FALLBACK_MONTHLY_SHAPE = [
  0.055, 0.065, 0.085, 0.095, 0.105, 0.11, 0.115, 0.105, 0.095, 0.08, 0.055, 0.05,
] as const;

const STUDY_LABEL = "ön fizibilite" as const;

export type GesFeasibilityInput = {
  landAreaM2: number;
  dcCapacityKwp?: number;
  panelWp?: number;
  panelAreaM2?: number;
  landUseFactor?: number;
  annualGhiKwhM2: number;
  pvgis?: PvgisSolarResponse | null;
  performanceRatio?: number;
  electricityPriceTryPerKwh: number;
  capexTryPerKwp: number;
  annualOpexTry: number;
  discountRatePct: number;
  projectYears?: number;
  degradationPctPerYear?: number;
};

export type FormulaTraceStep = {
  label: string;
  formula: string;
  result: number;
  unit?: string;
};

export type GesFeasibilityResult = {
  studyLabel: typeof STUDY_LABEL;
  bankable: false;
  dataSource: "pvgis_monthly" | "ghi_annual_fallback";
  usableAreaM2: number;
  panelCount: number;
  dcCapacityKwp: number;
  annualProductionKwh: number;
  monthlyProductionKwh: [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ];
  capacityFactor: number;
  degradationPctPerYear: number;
  yearlyCashFlow: number[];
  npvTry: number;
  irrPct: number | null;
  lcoeTryPerKwh: number;
  simpleRoiPct: number;
  paybackYear: number | null;
  suitabilityScore: number;
  investmentScore: number;
  riskScore: number;
  confidence: "high" | "medium" | "low";
  assumptions: string[];
  limitations: string[];
  formulaTrace: FormulaTraceStep[];
};

function requirePositive(name: string, value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new GesValidationError(\`\${name} pozitif ve sonlu olmalıdır\`, name);
  }
}

function requireNonNegative(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new GesValidationError(\`\${name} negatif olamaz\`, name);
  }
}

function clampScore(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function assertOutputFinite(result: GesFeasibilityResult): void {
  const nums: number[] = [
    result.usableAreaM2,
    result.panelCount,
    result.dcCapacityKwp,
    result.annualProductionKwh,
    ...result.monthlyProductionKwh,
    result.capacityFactor,
    result.degradationPctPerYear,
    result.npvTry,
    result.lcoeTryPerKwh,
    result.simpleRoiPct,
    result.suitabilityScore,
    result.investmentScore,
    result.riskScore,
    ...result.yearlyCashFlow,
  ];
  if (result.irrPct != null) nums.push(result.irrPct);
  if (result.paybackYear != null) nums.push(result.paybackYear);
  for (const v of nums) {
    if (!Number.isFinite(v)) {
      throw new Error("GES çıktısında sonlu olmayan değer");
    }
  }
}

function tuple12(monthly: number[]): GesFeasibilityResult["monthlyProductionKwh"] {
  return monthly as GesFeasibilityResult["monthlyProductionKwh"];
}

export function calculateGesFeasibility(input: GesFeasibilityInput): GesFeasibilityResult {
  requirePositive("landAreaM2", input.landAreaM2);
  requirePositive("annualGhiKwhM2", input.annualGhiKwhM2);
  requireNonNegative("electricityPriceTryPerKwh", input.electricityPriceTryPerKwh);
  requirePositive("capexTryPerKwp", input.capexTryPerKwp);
  requireNonNegative("annualOpexTry", input.annualOpexTry);
  requirePositive("discountRatePct", input.discountRatePct);

  if (input.pvgis != null && !isPvgisSolarResponse(input.pvgis)) {
    throw new GesValidationError("pvgis geçersiz yanıt", "pvgis");
  }

  const landUseFactor = input.landUseFactor ?? 0.65;
  if (!Number.isFinite(landUseFactor) || landUseFactor <= 0 || landUseFactor > 1) {
    throw new GesValidationError("landUseFactor 0–1 arasında olmalıdır", "landUseFactor");
  }

  const panelWp = input.panelWp ?? 550;
  const panelAreaM2 = input.panelAreaM2 ?? 2.2;
  const pr = input.performanceRatio ?? DEFAULT_PERFORMANCE_RATIO;
  const degradationPctPerYear = input.degradationPctPerYear ?? DEFAULT_DEGRADATION_PCT_YEAR;
  const projectYears = input.projectYears ?? 25;
  const discountRate = input.discountRatePct / 100;
  const formulaTrace: FormulaTraceStep[] = [];

  const usableAreaM2 = input.landAreaM2 * landUseFactor;
  let panelCount = Math.max(1, Math.floor(usableAreaM2 / panelAreaM2));
  let dcCapacityKwp = input.dcCapacityKwp ?? (panelCount * panelWp) / 1000;

  if (input.dcCapacityKwp != null) {
    requirePositive("dcCapacityKwp", input.dcCapacityKwp);
    dcCapacityKwp = input.dcCapacityKwp;
    panelCount = Math.max(1, Math.round((dcCapacityKwp * 1000) / panelWp));
  }

  let dataSource: GesFeasibilityResult["dataSource"] = "ghi_annual_fallback";
  let monthlyIrradiation: number[];

  if (input.pvgis?.monthlyIrradiationKwhM2?.length === 12) {
    monthlyIrradiation = normalizePvgisMonthly(input.pvgis.monthlyIrradiationKwhM2);
    dataSource = "pvgis_monthly";
  } else {
    const annual = input.pvgis?.annualIrradiationKwhM2 ?? input.annualGhiKwhM2;
    monthlyIrradiation = FALLBACK_MONTHLY_SHAPE.map((w) => w * annual);
    dataSource = "ghi_annual_fallback";
  }

  const monthlyProduction = monthlyIrradiation.map((irr) => dcCapacityKwp * irr * pr);
  formulaTrace.push({
    label: "Aylık üretim",
    formula: "E_m = P_dc[kWp] × H_m[kWh/m²] × PR",
    result: monthlyProduction.reduce((a, b) => a + b, 0) / 12,
    unit: "kWh/ay (ortalama)",
  });

  const annualProductionKwh = monthlyProduction.reduce((a, b) => a + b, 0);
  const acKw = dcCapacityKwp * 0.95;
  const capacityFactor = annualProductionKwh / (acKw * HOURS_PER_YEAR);

  const d = degradationPctPerYear / 100;
  const annualEnergyByYear: number[] = [];
  for (let y = 1; y <= projectYears; y++) {
    annualEnergyByYear.push(annualProductionKwh * Math.pow(1 - d, y - 1));
  }

  const capexTry = dcCapacityKwp * input.capexTryPerKwp;
  const yearlyCashFlow: number[] = [];
  let totalNet = -capexTry;
  for (let y = 1; y <= projectYears; y++) {
    const revenue = annualEnergyByYear[y - 1] * input.electricityPriceTryPerKwh;
    const net = revenue - input.annualOpexTry;
    yearlyCashFlow.push(net);
    totalNet += net;
  }

  const npvTry = npv(capexTry, yearlyCashFlow, discountRate);
  const irrDec = irrBisection(capexTry, yearlyCashFlow);
  const irrPct = irrDec != null ? irrDec * 100 : null;
  const opexSeries = Array(projectYears).fill(input.annualOpexTry);
  const lcoeTryPerKwh = lcoe(capexTry, opexSeries, annualEnergyByYear, discountRate);

  let paybackYear: number | null = null;
  let cum = -capexTry;
  for (let y = 1; y <= projectYears; y++) {
    cum += yearlyCashFlow[y - 1];
    if (cum >= 0) {
      paybackYear = y;
      break;
    }
  }

  const simpleRoiPct = capexTry > 0 ? (totalNet / capexTry) * 100 : 0;

  const suitabilityScore = clampScore(
    (input.annualGhiKwhM2 / 20) * 10 + capacityFactor * 120 + (dataSource === "pvgis_monthly" ? 10 : 0),
  );
  const investmentScore = clampScore(
    (irrPct ?? 0) * 1.5 + (npvTry > 0 ? 30 : 0) + Math.min(25, simpleRoiPct / 4),
  );
  const riskScore = clampScore(
    100 -
      suitabilityScore * 0.35 -
      investmentScore * 0.35 -
      (dataSource === "pvgis_monthly" ? 15 : 0),
  );

  const confidence: GesFeasibilityResult["confidence"] =
    dataSource === "pvgis_monthly" ? "medium" : "low";

  const assumptions = [
    \`Kullanılabilir alan = arazi × \${(landUseFactor * 100).toFixed(0)}%\`,
    \`PR = \${(pr * 100).toFixed(1)}% (IEC kayıp yığını özeti)\`,
    \`Yıllık bozulma = %\${degradationPctPerYear}\`,
    "Elektrik fiyatı sabit; enflasyon/PPA indekslemesi yok",
    STUDY_LABEL,
  ];

  const limitations = [
    "Bu çıktı bankable fizibilite değildir; ön fizibilite seviyesindedir.",
    "Vergi, kaldıraç, curtailment ve şebeke bağlantı maliyeti modelde yoktur.",
    dataSource === "ghi_annual_fallback"
      ? "PVGIS aylık veri yok — mevsimsel profil GHI üzerinden dağıtıldı."
      : "PVGIS aylık ışınım ile üretim hesaplandı; saatlik simülasyon yok.",
    "Yatırım tavsiyesi değildir.",
  ];

  const result: GesFeasibilityResult = {
    studyLabel: STUDY_LABEL,
    bankable: false,
    dataSource,
    usableAreaM2,
    panelCount,
    dcCapacityKwp,
    annualProductionKwh,
    monthlyProductionKwh: tuple12(monthlyProduction),
    capacityFactor,
    degradationPctPerYear,
    yearlyCashFlow,
    npvTry,
    irrPct,
    lcoeTryPerKwh: Number.isFinite(lcoeTryPerKwh) ? lcoeTryPerKwh : 0,
    simpleRoiPct,
    paybackYear,
    suitabilityScore,
    investmentScore,
    riskScore,
    confidence,
    assumptions,
    limitations,
    formulaTrace,
  };

  assertOutputFinite(result);
  return result;
}
`,
);

write(
  "src/lib/engineering/parcelFeasibility.ts",
  `export class ParcelValidationError extends Error {
  readonly field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = "ParcelValidationError";
    this.field = field;
  }
}

export type ParcelFeasibilityInput = {
  landAreaM2: number;
  emsal: number;
  taks: number;
  maxFloors: number;
  netUnitM2?: number;
  salePriceTryPerM2?: number;
  constructionCostTryPerM2?: number;
  contractorMarginPct?: number;
};

export type ParcelFeasibilityResult = {
  studyLabel: "ön fizibilite — manuel imar";
  maxConstructionAreaM2: number;
  footprintM2: number;
  floors: number;
  unitCount: number;
  totalSellableM2: number;
  revenueTry: number;
  costsTry: number;
  contractorProfitTry: number;
  profitMarginPct: number;
  feasibilityScore: number;
  warnings: string[];
  assumptions: string[];
  limitations: string[];
  confidence: "low" | "medium";
};

function requirePositive(name: string, value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new ParcelValidationError(\`\${name} pozitif ve sonlu olmalıdır\`, name);
  }
}

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function assertFiniteResult(r: ParcelFeasibilityResult): void {
  const nums = [
    r.maxConstructionAreaM2,
    r.footprintM2,
    r.floors,
    r.unitCount,
    r.totalSellableM2,
    r.revenueTry,
    r.costsTry,
    r.contractorProfitTry,
    r.profitMarginPct,
    r.feasibilityScore,
  ];
  for (const v of nums) {
    if (!Number.isFinite(v)) throw new Error("Parsel çıktısında sonlu olmayan değer");
  }
}

export function calculateParcelFeasibility(
  input: ParcelFeasibilityInput,
): ParcelFeasibilityResult {
  requirePositive("landAreaM2", input.landAreaM2);
  requirePositive("emsal", input.emsal);
  if (!Number.isFinite(input.taks) || input.taks <= 0 || input.taks > 1) {
    throw new ParcelValidationError("taks 0–1 arasında olmalıdır", "taks");
  }
  requirePositive("maxFloors", input.maxFloors);

  const netUnitM2 = input.netUnitM2 ?? 95;
  const salePrice = input.salePriceTryPerM2 ?? 45_000;
  const constructionCost = input.constructionCostTryPerM2 ?? 18_000;
  const contractorMarginPct = input.contractorMarginPct ?? 12;

  const maxConstructionAreaM2 = input.landAreaM2 * input.emsal;
  const footprintM2 = input.landAreaM2 * input.taks;
  const floorsFromArea =
    footprintM2 > 0 ? Math.max(1, Math.floor(maxConstructionAreaM2 / footprintM2)) : 1;
  const floors = Math.min(input.maxFloors, floorsFromArea);

  const grossBuiltM2 = footprintM2 * floors;
  const efficiency = 0.82;
  const totalSellableM2 = grossBuiltM2 * efficiency;
  const unitCount = Math.max(0, Math.floor(totalSellableM2 / netUnitM2));

  const revenueTry = totalSellableM2 * salePrice;
  const directCost = grossBuiltM2 * constructionCost;
  const contractorProfitTry = directCost * (contractorMarginPct / 100);
  const costsTry = directCost + contractorProfitTry;
  const profit = revenueTry - costsTry;
  const profitMarginPct = revenueTry > 0 ? (profit / revenueTry) * 100 : 0;

  const feasibilityScore = clampScore(
    profitMarginPct * 1.2 + Math.min(30, unitCount / 5) + Math.min(20, input.emsal * 8),
  );

  const warnings: string[] = [
    "Manuel imar girdileri (EMSAL/TAKS) resmi imar planı yerine geçmez.",
    "Ön fizibilite — yatırım tavsiyesi değildir.",
  ];
  if (floors < input.maxFloors) {
    warnings.push("Taban alanı EMSAL kotasını sınırlıyor; kat adedi düşürüldü.");
  }
  if (unitCount === 0) {
    warnings.push("Satılabilir birim sayısı sıfır — girdileri gözden geçirin.");
  }

  const assumptions = [
    \`EMSAL toplam inşaat = arazi × \${input.emsal}\`,
    \`TAKS taban alanı = arazi × \${input.taks}\`,
    \`Net verimlilik = %\${(efficiency * 100).toFixed(0)}\`,
    \`Birim net alan = \${netUnitM2} m²\`,
  ];

  const limitations = [
    "Belediye imar planı, ifraz/tevhit ve ruhsat süreçleri modele dahil değildir.",
    "Finansman, KDV, hakediş ve pazarlama maliyetleri basitleştirilmiştir.",
    "Ön fizibilite — bankable proforma değildir.",
  ];

  const result: ParcelFeasibilityResult = {
    studyLabel: "ön fizibilite — manuel imar",
    maxConstructionAreaM2,
    footprintM2,
    floors,
    unitCount,
    totalSellableM2,
    revenueTry,
    costsTry,
    contractorProfitTry,
    profitMarginPct,
    feasibilityScore,
    warnings,
    assumptions,
    limitations,
    confidence: "low",
  };

  assertFiniteResult(result);
  return result;
}
`,
);

write(
  "src/lib/engineering/reportBuilder.ts",
  `import type { GesFeasibilityResult } from "./gesEngine";
import type { ParcelFeasibilityResult } from "./parcelFeasibility";

function fmt(n: number, digits = 0): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("tr-TR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function reportId(prefix: string): string {
  const t = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  return \`\${prefix}-\${t}\`;
}

export function buildGesPrefeasibilityReport(
  inputs: Record<string, string | number>,
  result: GesFeasibilityResult,
): string {
  const id = reportId("GES");
  const lines = [
    "# GES Ön Fizibilite Raporu",
    "",
    \`- **Rapor ID:** \${id}\`,
    \`- **Tarih:** \${new Date().toLocaleString("tr-TR")}\`,
    \`- **Seviye:** \${result.studyLabel} (bankable değil)\`,
    "",
    "## Yasal uyarı",
    "Bu belge yatırım tavsiyesi değildir. Ön fizibilite çıktısıdır; resmi EIA/ bağlantı/ ruhsat süreçlerinin yerine geçmez.",
    "",
    "## Girdiler",
    ...Object.entries(inputs).map(([k, v]) => \`- **\${k}:** \${v}\`),
    "",
    "## Sonuç özeti",
    "| Metrik | Değer |",
    "| --- | --- |",
    \`| Kullanılabilir alan | \${fmt(result.usableAreaM2)} m² |\`,
    \`| Panel adedi | \${fmt(result.panelCount)} |\`,
    \`| DC kapasite | \${fmt(result.dcCapacityKwp, 1)} kWp |\`,
    \`| Yıllık üretim | \${fmt(result.annualProductionKwh)} kWh |\`,
    \`| Kapasite faktörü | \${fmt(result.capacityFactor * 100, 1)}% |\`,
    \`| NPV | \${fmt(result.npvTry)} TRY |\`,
    \`| IRR | \${result.irrPct != null ? fmt(result.irrPct, 1) + "%" : "—"} |\`,
    \`| LCOE | \${fmt(result.lcoeTryPerKwh, 2)} TRY/kWh |\`,
    \`| Basit ROI | \${fmt(result.simpleRoiPct, 1)}% |\`,
    \`| Geri ödeme | \${result.paybackYear ?? "—"} yıl |\`,
    \`| Veri kaynağı | \${result.dataSource} |\`,
    \`| Güven | \${result.confidence} |\`,
    "",
    "## Formüller",
    ...result.formulaTrace.map(
      (s) => \`- **\${s.label}:** \${s.formula} → \${fmt(s.result, 2)} \${s.unit ?? ""}\`,
    ),
    "",
    "## Varsayımlar",
    ...result.assumptions.map((a) => \`- \${a}\`),
    "",
    "## Sınırlamalar",
    ...result.limitations.map((l) => \`- \${l}\`),
  ];
  return lines.join("\\n");
}

export function buildParcelPrefeasibilityReport(
  inputs: Record<string, string | number>,
  result: ParcelFeasibilityResult,
): string {
  const id = reportId("PARSEL");
  const lines = [
    "# Parsel / İmar Ön Fizibilite Raporu",
    "",
    \`- **Rapor ID:** \${id}\`,
    \`- **Tarih:** \${new Date().toLocaleString("tr-TR")}\`,
    \`- **Seviye:** \${result.studyLabel}\`,
    "",
    "## Yasal uyarı",
    "Yatırım tavsiyesi değildir. Manuel EMSAL/TAKS girdileri resmi imar belgesi yerine geçmez.",
    "",
    "## Girdiler",
    ...Object.entries(inputs).map(([k, v]) => \`- **\${k}:** \${v}\`),
    "",
    "## Sonuç tablosu",
    "| Metrik | Değer |",
    "| --- | --- |",
    \`| Maks. inşaat (EMSAL) | \${fmt(result.maxConstructionAreaM2)} m² |\`,
    \`| Taban alanı (TAKS) | \${fmt(result.footprintM2)} m² |\`,
    \`| Kat | \${fmt(result.floors)} |\`,
    \`| Birim adedi | \${fmt(result.unitCount)} |\`,
    \`| Satılabilir alan | \${fmt(result.totalSellableM2)} m² |\`,
    \`| Gelir | \${fmt(result.revenueTry)} TRY |\`,
    \`| Maliyet | \${fmt(result.costsTry)} TRY |\`,
    \`| Müteahhit kârı | \${fmt(result.contractorProfitTry)} TRY |\`,
    \`| Kâr marjı | \${fmt(result.profitMarginPct, 1)}% |\`,
    \`| Fizibilite skoru | \${fmt(result.feasibilityScore)}/100 |\`,
  ];
  if (result.warnings.length) {
    lines.push("", "## Uyarılar", ...result.warnings.map((w) => \`- \${w}\`));
  }
  lines.push(
    "",
    "## Varsayımlar",
    ...result.assumptions.map((a) => \`- \${a}\`),
    "",
    "## Sınırlamalar",
    ...result.limitations.map((l) => \`- \${l}\`),
    "",
    \`**Güven:** \${result.confidence}\`,
  );
  return lines.join("\\n");
}
`,
);

write(
  "tsconfig.test.json",
  `{
  "extends": "./tsconfig.app.json",
  "compilerOptions": {
    "types": ["vitest/globals"],
    "noEmit": true
  },
  "include": [
    "src/constants/routes.ts",
    "src/lib/data/pvgisTypes.ts",
    "src/lib/engineering/core/methodology.ts",
    "src/lib/engineering/core/pipeline.ts",
    "src/lib/engineering/core/types.ts",
    "src/lib/engineering/ges/constants.ts",
    "src/lib/engineering/ges/financial.ts",
    "src/lib/engineering/gesEngine.ts",
    "src/lib/engineering/parcelFeasibility.ts",
    "src/lib/engineering/reportBuilder.ts",
    "tests/engineering/verified-core.test.ts"
  ]
}
`,
);

write(
  "tests/engineering/verified-core.test.ts",
  `import { describe, expect, it } from "vitest";
import { normalizePvgisMonthly } from "@/lib/data/pvgisTypes";
import {
  GesValidationError,
  calculateGesFeasibility,
} from "@/lib/engineering/gesEngine";
import {
  ParcelValidationError,
  calculateParcelFeasibility,
} from "@/lib/engineering/parcelFeasibility";
import { buildGesPrefeasibilityReport, buildParcelPrefeasibilityReport } from "@/lib/engineering/reportBuilder";

function assertNoBadNumbers(obj: unknown, path = "root"): void {
  if (obj == null) return;
  if (typeof obj === "number") {
    expect(Number.isFinite(obj), path).toBe(true);
    return;
  }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => assertNoBadNumbers(v, \`\${path}[\${i}]\`));
    return;
  }
  if (typeof obj === "object") {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      assertNoBadNumbers(v, \`\${path}.\${k}\`);
    }
  }
}

const baseGes = {
  landAreaM2: 100_000,
  annualGhiKwhM2: 1780,
  electricityPriceTryPerKwh: 2.8,
  capexTryPerKwp: 12_000,
  annualOpexTry: 600_000,
  discountRatePct: 10,
  dcCapacityKwp: 5000,
};

describe("verified GES core", () => {
  it("returns finite outputs for valid input", () => {
    const r = calculateGesFeasibility(baseGes);
    assertNoBadNumbers(r);
    expect(r.studyLabel).toBe("ön fizibilite");
    expect(r.bankable).toBe(false);
    expect(r.monthlyProductionKwh).toHaveLength(12);
  });

  it("throws GesValidationError on invalid land", () => {
    expect(() => calculateGesFeasibility({ ...baseGes, landAreaM2: -1 })).toThrow(GesValidationError);
  });

  it("uses PVGIS monthly formula", () => {
    const monthly = normalizePvgisMonthly(Array(12).fill(100));
    const pr = 0.82;
    const dc = 1000;
    const r = calculateGesFeasibility({
      ...baseGes,
      dcCapacityKwp: dc,
      performanceRatio: pr,
      pvgis: {
        source: "pvgis_live",
        lat: 37,
        lon: 32,
        tiltDeg: 25,
        annualIrradiationKwhM2: 1200,
        monthlyIrradiationKwhM2: monthly,
        fetchedAt: new Date().toISOString(),
        providerAvailable: true,
      },
    });
    expect(r.dataSource).toBe("pvgis_monthly");
    expect(r.monthlyProductionKwh[0]).toBeCloseTo(dc * monthly[0] * pr, 4);
    expect(r.annualProductionKwh).toBeCloseTo(
      r.monthlyProductionKwh.reduce((a, b) => a + b, 0),
      2,
    );
  });

  it("falls back to ghi profile when no PVGIS monthly", () => {
    const r = calculateGesFeasibility(baseGes);
    expect(r.dataSource).toBe("ghi_annual_fallback");
  });

  it("allows null IRR when cashflows do not bracket", () => {
    const r = calculateGesFeasibility({
      ...baseGes,
      electricityPriceTryPerKwh: 0.01,
      annualOpexTry: 50_000_000,
    });
    expect(r.irrPct).toBeNull();
    assertNoBadNumbers(r);
  });

  it("builds markdown report without NaN", () => {
    const r = calculateGesFeasibility(baseGes);
    const md = buildGesPrefeasibilityReport({ arazi: "100000 m2" }, r);
    expect(md).toContain("ön fizibilite");
    expect(md).not.toMatch(/NaN|undefined|Infinity/);
  });
});

describe("verified parcel core", () => {
  const baseParcel = {
    landAreaM2: 2500,
    emsal: 1.2,
    taks: 0.35,
    maxFloors: 8,
  };

  it("computes EMSAL and TAKS areas", () => {
    const r = calculateParcelFeasibility(baseParcel);
    expect(r.maxConstructionAreaM2).toBeCloseTo(2500 * 1.2, 4);
    expect(r.footprintM2).toBeCloseTo(2500 * 0.35, 4);
    assertNoBadNumbers(r);
  });

  it("throws on invalid emsal", () => {
    expect(() => calculateParcelFeasibility({ ...baseParcel, emsal: 0 })).toThrow(
      ParcelValidationError,
    );
  });

  it("includes manual imar disclaimers", () => {
    const r = calculateParcelFeasibility(baseParcel);
    expect(r.warnings.some((w) => w.toLowerCase().includes("imar"))).toBe(true);
    expect(r.limitations.some((l) => l.includes("ön fizibilite"))).toBe(true);
  });

  it("builds parcel markdown report", () => {
    const r = calculateParcelFeasibility(baseParcel);
    const md = buildParcelPrefeasibilityReport({ ada: "1", parsel: "2" }, r);
    expect(md).toContain("Yatırım tavsiyesi değildir");
    expect(md).not.toMatch(/NaN|undefined|Infinity/);
  });
});
`,
);

write(
  "tests/core.test.cjs",
  `const { spawnSync } = require("node:child_process");

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: true, env: process.env });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

run("npx", ["tsc", "-p", "tsconfig.test.json", "--noEmit"]);
run("npx", ["vitest", "run", "tests/engineering/verified-core.test.ts"]);
console.log("core.test.cjs OK");
`,
);

write(
  "VERIFY_EVIDENCE.md",
  `# Verified Intelligence Core — Evidence

## Test run

- Command: \`node tests/core.test.cjs\`
- Status: _(pending)_
- Timestamp: _(pending)_

## Lint / build

- \`npm run lint\`: _(pending)_
- \`npm run build\`: _(pending)_
- Bundle hash: _(pending)_

## Commit

- Hash: _(pending)_
- Message: fix(intelligence): apply verified GES and parcel feasibility core

## Screenshots

_(to be added after UI verification)_
`,
);

console.log("part2 engine/tests done");
