export type TaxRuntimeConfig = {
  sellerCommissionRate: number;
  buyerCommissionRate: number;
  vatRate: number;
  deedDutyRate: number;
  withholdingRate: number;
  rentalExemptionTry2026: number;
  saleTaxFreeAfterYears: number;
  revaluationRate2026: number;
};

export type TaxConfigAuditLog = {
  atIso: string;
  actor: string;
  changes: Partial<TaxRuntimeConfig>;
  note: string;
};

const STORAGE_KEY = "ihaleal_tax_runtime_config";
const AUDIT_KEY = "ihaleal_tax_runtime_config_audit";

export const TAX_RUNTIME_DEFAULTS: TaxRuntimeConfig = {
  sellerCommissionRate: 0.02,
  buyerCommissionRate: 0.02,
  vatRate: 0.2,
  deedDutyRate: 0.04,
  withholdingRate: 0.2,
  rentalExemptionTry2026: 58_000,
  saleTaxFreeAfterYears: 5,
  revaluationRate2026: 0.49,
};

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function sanitize(input: Partial<TaxRuntimeConfig>): Partial<TaxRuntimeConfig> {
  const out: Partial<TaxRuntimeConfig> = {};
  if (typeof input.sellerCommissionRate === "number") out.sellerCommissionRate = clamp01(input.sellerCommissionRate);
  if (typeof input.buyerCommissionRate === "number") out.buyerCommissionRate = clamp01(input.buyerCommissionRate);
  if (typeof input.vatRate === "number") out.vatRate = clamp01(input.vatRate);
  if (typeof input.deedDutyRate === "number") out.deedDutyRate = clamp01(input.deedDutyRate);
  if (typeof input.withholdingRate === "number") out.withholdingRate = clamp01(input.withholdingRate);
  if (typeof input.rentalExemptionTry2026 === "number") out.rentalExemptionTry2026 = Math.max(0, Math.round(input.rentalExemptionTry2026));
  if (typeof input.saleTaxFreeAfterYears === "number") out.saleTaxFreeAfterYears = Math.max(0, Math.round(input.saleTaxFreeAfterYears));
  if (typeof input.revaluationRate2026 === "number") out.revaluationRate2026 = clamp01(input.revaluationRate2026);
  return out;
}

export function getTaxRuntimeConfig(): TaxRuntimeConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return TAX_RUNTIME_DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<TaxRuntimeConfig>;
    return { ...TAX_RUNTIME_DEFAULTS, ...sanitize(parsed) };
  } catch {
    return TAX_RUNTIME_DEFAULTS;
  }
}

export function updateTaxRuntimeConfig(
  changes: Partial<TaxRuntimeConfig>,
  actor: string,
  note: string = "Mali müşavir onayı bekliyor (mock güncelleme).",
): TaxRuntimeConfig {
  const next = { ...getTaxRuntimeConfig(), ...sanitize(changes) };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  const logs = getTaxRuntimeAuditLog();
  const entry: TaxConfigAuditLog = {
    atIso: new Date().toISOString(),
    actor,
    changes: sanitize(changes),
    note,
  };
  logs.unshift(entry);
  localStorage.setItem(AUDIT_KEY, JSON.stringify(logs.slice(0, 30)));
  return next;
}

export function getTaxRuntimeAuditLog(): TaxConfigAuditLog[] {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TaxConfigAuditLog[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getTaxRuntimeConfigSignature(): string {
  const cfg = getTaxRuntimeConfig();
  const payload = [
    cfg.sellerCommissionRate,
    cfg.buyerCommissionRate,
    cfg.vatRate,
    cfg.deedDutyRate,
    cfg.withholdingRate,
    cfg.rentalExemptionTry2026,
    cfg.saleTaxFreeAfterYears,
    cfg.revaluationRate2026,
  ].join("|");
  return `taxcfg:${payload}`;
}

