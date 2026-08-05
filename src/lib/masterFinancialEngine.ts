/**
 * Kat karsiligi (land_share) — MASTER_RULES v2.3 (taslak): rayic uzerinden %4 + KDV havuzu;
 * Ihaleal / emlakci payi havuz icinde bolunur. Ayrica muteahhit / arsa sahibi odeme yukleri.
 * Kiralik: rentalCommissionEngine.ts | Satis ornek: fees.ts + commission/engine.ts
 */
import { commissionEngine } from "./commission/engine";
// Oranlar zod bagimsiz `./commission/rates` modulunden — sadece sabiti okuyan
// cagri noktalari (ChatWidget) vendor-zod'u kritik yola cekmesin.
import { COMMISSION_POOL_VAT_RATE, LAND_SHARE_TOTAL_EX_VAT_RATE } from "./commission/rates";
import { feeBadgeLabel } from "./fees";

export type LandEquityListingType = "kat_karsiligi";

export interface LandEquityCommissionInput {
  expertOrParcelValueTry: number;
  /** Varsayilan: tek emlakci senaryosu */
  isIndividual?: boolean;
  hasOneAgent?: boolean;
  hasTwoAgents?: boolean;
  landShareAgreement?: { ownerAcceptsCommission: boolean };
}

export interface LandEquityCommissionResult {
  platformTry: number;
  agentPoolTry: number;
  /** Toplam hizmet bedeli matrahi (KDV haric), rayic * LAND_SHARE_TOTAL_EX_VAT_RATE */
  totalServicePoolTry: number;
  contractorTry: number;
  ownerTry: number;
  totalKdvTry: number;
  totalWithKdvTry: number;
}

function roundTry(n: number): number {
  return Math.round(n * 100) / 100;
}

function validatePositiveFinite(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(label + " must be positive finite");
  }
  if (value > 1e15) throw new RangeError(label + " exceeds safety cap");
}

export function distributeLandEquityCommission(input: LandEquityCommissionInput): LandEquityCommissionResult {
  validatePositiveFinite(input.expertOrParcelValueTry, "expertOrParcelValueTry");
  const isIndividual = input.isIndividual === true;
  const hasTwo = input.hasTwoAgents === true;
  const hasOne = hasTwo ? false : input.hasOneAgent !== false && !isIndividual;

  const res = commissionEngine.calculate({
    type: "land_share",
    baseAmount: input.expertOrParcelValueTry,
    isIndividual,
    hasOneAgent: hasOne,
    hasTwoAgents: hasTwo,
    landShareAgreement: input.landShareAgreement,
  });

  return {
    platformTry: res.platformShare,
    agentPoolTry: res.agentShare,
    totalServicePoolTry: res.totalCommission,
    contractorTry: res.contractorCommission,
    ownerTry: res.ownerCommission,
    totalKdvTry: res.totalKDV,
    totalWithKdvTry: res.totalWithKDV,
  };
}

export type ConstitutionListingType = "kat_karsiligi";

export interface CommissionDistributionInput {
  listingType: "kat_karsiligi";
  valueTry: number;
  isPlatformFoundClient?: boolean;
  dualAgentReferredClient?: boolean;
}

export interface CommissionDistributionResult {
  platformTry: number;
  portfolioOrSingleAgentTry: number;
  buyerSideAgentTry?: number;
  totalFeePoolTry?: number;
}

export function distributeCommission(input: CommissionDistributionInput): CommissionDistributionResult {
  const r = distributeLandEquityCommission({
    expertOrParcelValueTry: input.valueTry,
    isIndividual: false,
    hasOneAgent: !input.dualAgentReferredClient,
    hasTwoAgents: input.dualAgentReferredClient === true,
    landShareAgreement: { ownerAcceptsCommission: false },
  });
  return {
    platformTry: r.platformTry,
    portfolioOrSingleAgentTry: r.agentPoolTry,
    totalFeePoolTry: r.totalServicePoolTry,
  };
}

export interface BypassPenaltyAuditEvent {
  timestamp: string;
  userId: string;
  listingId: string;
  blockAmountTry: number;
  isBypass: boolean;
}

export function calculateBypassPenalty(input: { blockAmountTry: number; isBypass: boolean }): number {
  validatePositiveFinite(input.blockAmountTry, "blockAmountTry");
  if (input.isBypass) return roundTry(input.blockAmountTry);
  return 0;
}

export function buildBypassPenaltyAuditEvent(params: {
  userId: string;
  listingId: string;
  blockAmountTry: number;
  isBypass: boolean;
}): BypassPenaltyAuditEvent {
  return {
    timestamp: new Date().toISOString(),
    userId: params.userId,
    listingId: params.listingId,
    blockAmountTry: roundTry(params.blockAmountTry),
    isBypass: params.isBypass,
  };
}

export function canReceiveCommissionPayout(params: {
  isVerified: boolean;
  hasRealEstateTradeLicense: boolean;
}): boolean {
  return params.isVerified === true && params.hasRealEstateTradeLicense === true;
}

// KKA oran sabitleri tek kaynak: ./commission/rates (zod bagimsiz). Buradan
// yeniden disa aktarilir; mevcut cagri noktalari degismeden calisir. Ilk boyama
// icin sadece SABIT gerektiren moduller dogrudan ./commission/rates kullanmali,
// aksi halde bu dosya uzerinden commission/engine -> zod kritik yola girer.
export { KKA_SERVICE_POOL_RATE_EX_VAT, KKA_SERVICE_POOL_VAT_RATE } from "./commission/rates";

/**
 * Ana sayfa / hero şerit metni: ihale komisyonu (`fees`) + KKA havuzu oranları (`commission/engine` ile senkron).
 */
export function heroRevenueStripLine(): string {
  const poolPct = (LAND_SHARE_TOTAL_EX_VAT_RATE * 100).toFixed(0);
  const vatPct = (COMMISSION_POOL_VAT_RATE * 100).toFixed(0);
  return `İhale matrahı: ${feeBadgeLabel()} · Kat karşılığı (MASTER_RULES, taslak): rayıç üzerinden %${poolPct} + KDV %${vatPct} hizmet havuzu — komisyon motoru ile aynı oranlar.`;
}