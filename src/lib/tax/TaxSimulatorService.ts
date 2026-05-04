/**
 * TaxSimulatorService.ts
 * İhaleAL — Vergi / Harç Simülatörü
 * Yİ-ÜFE endeksleme, 5 yıl GV istisna, tapu harcı, net satıcı hesaplama.
 * UYARI: Bu hesaplama bilgilendirme amaçlıdır; resmi vergi hesabı değildir.
 */
import { z } from "zod";

// ============================================
// ZOD ŞEMA
// ============================================

export const TaxSimulatorInputSchema = z.object({
  purchaseDate: z.string().regex(/^\d{4}-\d{2}$/, "Format: YYYY-MM"),
  declaredPurchasePriceTry: z.number().positive().finite(),
  expectedSalePriceTry: z.number().positive().finite(),
  municipality: z.string().optional(),
  propertyType: z.enum(["konut", "arsa", "ticari", "tarla"]).optional(),
  isFirstResidence: z.boolean().default(false),
  areaM2: z.number().positive().optional(),
});

export type TaxSimulatorInput = z.infer<typeof TaxSimulatorInputSchema>;

// ============================================
// TİPLER
// ============================================

export interface YiUfeRecord {
  yearMonth: string;
  indexValue: number;
  source: "tuik_api" | "manual_entry" | "cached" | "tcmb_evds";
  stale: boolean;
}

export interface TaxBracket {
  year: number;
  limit: number;
  rate: number;
}

export interface TapuDutyConfig {
  totalRate: number;
  buyerShare: number;
  sellerShare: number;
  version: string;
}

export interface TaxConfig {
  annualGvExemption: number;
  fiveYearRuleMode: "calendar_day" | "month_boundary";
  yiUfeStaleThresholdDays: number;
}

export interface CostBreakdown {
  disclaimer: string;
  input: TaxSimulatorInput;
  deedDuty: {
    buyerShare: number;
    sellerShare: number;
    total: number;
    rateUsed: number;
    version: string;
  };
  capitalGainsTax: {
    taxableGain: number;
    isFiveYearExempt: boolean;
    annualExemption: number;
    taxBaseAfterExemption: number;
    taxAmount: number;
    bracketsApplied: Array<{ limit: number; rate: number; amount: number }>;
    yiUfeIndexedCost: number;
    yiUfeRateUsed: number;
  };
  platformFee: {
    baseAmount: number;
    vatRate: number;
    vatAmount: number;
    total: number;
    revenueTemplateId: string;
  };
  netToSeller: {
    grossSalePrice: number;
    minusDeedDuty: number;
    minusPlatformFee: number;
    minusCapitalGainsTax: number;
    minusOtherFees: number;
    estimatedNet: number;
  };
  warnings: string[];
}

// ============================================
// YARDIMCI FONKSİYONLAR (Pure)
// ============================================

export function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function parseYearMonth(ym: string): { year: number; month: number } {
  const [y, m] = ym.split("-").map(Number);
  return { year: y, month: m };
}

export function getPreviousYearMonth(ym: string): string {
  const { year, month } = parseYearMonth(ym);
  if (month === 1) return `${year - 1}-12`;
  return `${year}-${String(month - 1).padStart(2, "0")}`;
}

export function monthsBetween(ym1: string, ym2: string): number {
  const a = parseYearMonth(ym1);
  const b = parseYearMonth(ym2);
  return (b.year - a.year) * 12 + (b.month - a.month);
}

export function isFiveYearExempt(
  purchaseDate: string,
  saleDate: string,
  mode: "calendar_day" | "month_boundary"
): boolean {
  if (mode === "month_boundary") {
    return monthsBetween(purchaseDate, saleDate) >= 60;
  }
  const p = new Date(purchaseDate + "-01T00:00:00Z");
  const s = new Date(saleDate + "-01T00:00:00Z");
  const diffMs = s.getTime() - p.getTime();
  const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  return diffYears >= 5;
}

export function getYiUfeValue(records: YiUfeRecord[], yearMonth: string): number | null {
  const rec = records.find((r) => r.yearMonth === yearMonth);
  if (!rec || rec.stale) return null;
  return rec.indexValue;
}

/**
 * Yİ-ÜFE endeksli maliyet: Alış fiyatı × (Satış önceki ay endeksi / Alış ayı endeksi)
 */
export function indexCost(
  purchasePrice: number,
  purchaseYM: string,
  saleYM: string,
  records: YiUfeRecord[]
): { indexedCost: number; rateUsed: number; error?: string } {
  const purchaseIdx = getYiUfeValue(records, purchaseYM);
  const salePrevYM = getPreviousYearMonth(saleYM);
  const saleIdx = getYiUfeValue(records, salePrevYM);

  if (purchaseIdx == null || saleIdx == null) {
    return { indexedCost: purchasePrice, rateUsed: 1, error: "Yİ-ÜFE verisi eksik veya stale" };
  }

  const rate = saleIdx / purchaseIdx;
  return { indexedCost: r2(purchasePrice * rate), rateUsed: r2(rate) };
}

export function calculateGV(
  taxableGain: number,
  brackets: TaxBracket[]
): { taxAmount: number; bracketsApplied: Array<{ limit: number; rate: number; amount: number }> } {
  let remaining = Math.max(0, taxableGain);
  let totalTax = 0;
  const applied: Array<{ limit: number; rate: number; amount: number }> = [];

  // Sıralı bracket'lar (limit artan)
  const sorted = [...brackets].sort((a, b) => a.limit - b.limit);
  let previousLimit = 0;

  for (const bracket of sorted) {
    if (remaining <= 0) break;
    const bracketSize = bracket.limit === Infinity ? remaining : bracket.limit - previousLimit;
    const taxableInBracket = Math.min(remaining, Math.max(0, bracketSize));
    const taxInBracket = r2(taxableInBracket * bracket.rate);

    applied.push({ limit: bracket.limit, rate: bracket.rate, amount: taxInBracket });
    totalTax += taxInBracket;
    remaining -= taxableInBracket;
    previousLimit = bracket.limit;
  }

  return { taxAmount: r2(totalTax), bracketsApplied: applied };
}

export function calculateDeedDuty(
  salePrice: number,
  config: TapuDutyConfig
): { buyerShare: number; sellerShare: number; total: number } {
  const total = r2(salePrice * config.totalRate);
  const buyerShare = r2(total * config.buyerShare);
  const sellerShare = r2(total * config.sellerShare);
  return { buyerShare, sellerShare, total };
}

// ============================================
// ANA SERVİS
// ============================================

export interface TaxSimulatorDeps {
  yiUfeRecords: YiUfeRecord[];
  taxBrackets: TaxBracket[];
  config: TaxConfig;
  tapuDutyConfig: TapuDutyConfig;
  platformFeeRate: number; // Örn: 0.04 (commission engine'den)
  platformVatRate: number; // Örn: 0.20
  otherFeesEstimate: number; // Ekspertiz + avukat tahmini
  currentDate?: string;      // "YYYY-MM", varsayılan: bugün
}

export class TaxSimulatorService {
  estimate(rawInput: TaxSimulatorInput, deps: TaxSimulatorDeps): CostBreakdown {
    const input = TaxSimulatorInputSchema.parse(rawInput);
    const warnings: string[] = [];

    const currentDate = deps.currentDate || this.getCurrentYearMonth();

    // 1) Tapu Harcı
    const deedDuty = calculateDeedDuty(input.expectedSalePriceTry, deps.tapuDutyConfig);

    // 2) Yİ-ÜFE Endeksli Maliyet
    const { indexedCost, rateUsed, error } = indexCost(
      input.declaredPurchasePriceTry,
      input.purchaseDate,
      currentDate,
      deps.yiUfeRecords
    );
    if (error) warnings.push(`Yİ-ÜFE: ${error}`);

    // 3) 5 Yıl İstisna Kontrolü
    const fiveYearExempt = isFiveYearExempt(
      input.purchaseDate,
      currentDate,
      deps.config.fiveYearRuleMode
    );

    // 4) Değer Artış Kazancı
    const rawGain = r2(input.expectedSalePriceTry - indexedCost);
    const taxableGain = fiveYearExempt ? 0 : Math.max(0, rawGain);

    if (fiveYearExempt && rawGain > 0) {
      warnings.push(
        `5 yıldan uzun süre geçtiği için değer artış kazancı istisna uygulanmıştır (kazanç: ${rawGain.toLocaleString("tr-TR")} TRY). YMM onayı şarttır.`
      );
    }

    // 5) Yıllık İstisna
    const annualExemption = deps.config.annualGvExemption;
    const taxBase = Math.max(0, taxableGain - annualExemption);

    // 6) Dilimli GV
    const gvResult = calculateGV(taxBase, deps.taxBrackets);

    // 7) Platform SaaS Bedeli (Commission Engine'den)
    const platformBase = r2(input.expectedSalePriceTry * deps.platformFeeRate);
    const platformVat = r2(platformBase * deps.platformVatRate);
    const platformTotal = r2(platformBase + platformVat);

    // 8) 150m² / Konut İlk İkamet İstisna (varsa)
    if (input.isFirstResidence && input.areaM2 && input.areaM2 <= 150) {
      warnings.push(
        "150 m² ve altı konut tek ikamet istisna potansiyeli mevcut. Tapu sicil ve belediye kaydı ile doğrulama gerekir."
      );
    }

    // 9) Düşük gösterim / Tapu uyarısı
    if (input.declaredPurchasePriceTry < indexedCost * 0.5) {
      warnings.push(
        "Tapu beyan alış fiyatı Yİ-ÜFE endeksli maliyetin %50'sinden düşük. Düşük gösterim riski — avukat onaylı şablona bakınız."
      );
    }

    // 10) Net Hesaplama
    const estimatedNet = r2(
      input.expectedSalePriceTry -
        deedDuty.sellerShare -
        platformTotal -
        gvResult.taxAmount -
        deps.otherFeesEstimate
    );

    return {
      disclaimer:
        "Bu hesaplama bilgilendirme amaçlıdır. Resmi vergi hesabı değildir. YMM ve tapu sicil müdürlüğü onayı gereklidir.",
      input,
      deedDuty: {
        buyerShare: deedDuty.buyerShare,
        sellerShare: deedDuty.sellerShare,
        total: deedDuty.total,
        rateUsed: deps.tapuDutyConfig.totalRate,
        version: deps.tapuDutyConfig.version,
      },
      capitalGainsTax: {
        taxableGain: rawGain,
        isFiveYearExempt: fiveYearExempt,
        annualExemption,
        taxBaseAfterExemption: taxBase,
        taxAmount: gvResult.taxAmount,
        bracketsApplied: gvResult.bracketsApplied,
        yiUfeIndexedCost: indexedCost,
        yiUfeRateUsed: rateUsed,
      },
      platformFee: {
        baseAmount: platformBase,
        vatRate: deps.platformVatRate,
        vatAmount: platformVat,
        total: platformTotal,
        revenueTemplateId: "IHALEAL-SAAS-001",
      },
      netToSeller: {
        grossSalePrice: input.expectedSalePriceTry,
        minusDeedDuty: deedDuty.sellerShare,
        minusPlatformFee: platformTotal,
        minusCapitalGainsTax: gvResult.taxAmount,
        minusOtherFees: deps.otherFeesEstimate,
        estimatedNet,
      },
      warnings,
    };
  }

  private getCurrentYearMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }
}

export const taxSimulatorService = new TaxSimulatorService();
