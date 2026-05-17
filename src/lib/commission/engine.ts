/**
 * Birlesik komisyon motoru (MASTER_RULES v2.3, taslak).
 * KDV matrah uzerinden hesaplanir; KDV ayri satirda (totalWithKDV).
 */
import { z } from "zod";

export const TransactionTypeSchema = z.enum(["rental", "sale", "transfer_rental", "land_share"]);
export type TransactionType = z.infer<typeof TransactionTypeSchema>;

export const LandShareAgreementSchema = z.object({
  ownerAcceptsCommission: z.boolean(),
});
export type LandShareAgreement = z.infer<typeof LandShareAgreementSchema>;

export const CommissionInputSchema = z
  .object({
    type: TransactionTypeSchema,
    /** Kiralik: 1 aylik kira. Satilik / arsa rayici: islem matrahi. */
    baseAmount: z.number().positive().finite(),
    isIndividual: z.boolean(),
    hasOneAgent: z.boolean(),
    hasTwoAgents: z.boolean(),
    landShareAgreement: LandShareAgreementSchema.optional(),
  })
  .superRefine((d, ctx) => {
    if (d.hasOneAgent && d.hasTwoAgents) {
      ctx.addIssue({ code: "custom", message: "hasOneAgent ve hasTwoAgents birlikte olamaz" });
    }
    if (d.isIndividual && (d.hasOneAgent || d.hasTwoAgents)) {
      ctx.addIssue({ code: "custom", message: "isIndividual iken emlakci bayraklari kapali olmali" });
    }
  });

export type CommissionInput = z.infer<typeof CommissionInputSchema>;

export const CommissionResultSchema = z.object({
  totalCommission: z.number(),
  platformShare: z.number(),
  agentShare: z.number(),
  ownerCommission: z.number(),
  contractorCommission: z.number(),
  totalKDV: z.number(),
  totalWithKDV: z.number(),
  breakdown: z.string(),
  currency: z.literal("TRY"),
});

export type CommissionResult = z.infer<typeof CommissionResultSchema>;

/** KDV, komisyon / KKA hizmet havuzu matrahı üzerinden (çıktı satırı). */
export const COMMISSION_POOL_VAT_RATE = 0.2 as const;

/** land_share: rayiç üzerinden toplam hizmet bedeli matrahı (KDV hariç, MASTER_RULES taslak). */
export const LAND_SHARE_TOTAL_EX_VAT_RATE = 0.04 as const;

const VAT = COMMISSION_POOL_VAT_RATE;

function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

function splitPool(
  type: TransactionType,
  pool: number,
  isIndividual: boolean,
  hasOneAgent: boolean,
  hasTwoAgents: boolean,
): { platformShare: number; agentShare: number } {
  if (pool <= 0) return { platformShare: 0, agentShare: 0 };
  if (type === "land_share") {
    if (isIndividual) return { platformShare: r2(pool), agentShare: 0 };
    if (hasTwoAgents) {
      const p = r2(pool * 0.25);
      return { platformShare: p, agentShare: r2(pool - p) };
    }
    if (hasOneAgent) {
      const p = r2(pool * 0.5);
      return { platformShare: p, agentShare: r2(pool - p) };
    }
    const p = r2(pool * 0.5);
    return { platformShare: p, agentShare: r2(pool - p) };
  }
  if (isIndividual) return { platformShare: r2(pool), agentShare: 0 };
  if (hasOneAgent) {
    const p = r2(pool * 0.5);
    return { platformShare: p, agentShare: r2(pool - p) };
  }
  if (hasTwoAgents) {
    const p = r2(pool * 0.25);
    return { platformShare: p, agentShare: r2(pool - p) };
  }
  return { platformShare: r2(pool), agentShare: 0 };
}

export class CommissionEngine {
  calculate(raw: CommissionInput): CommissionResult {
    const input = CommissionInputSchema.parse(raw);
    const { type, baseAmount, isIndividual, hasOneAgent, hasTwoAgents, landShareAgreement } = input;

    let totalExKDV = 0;
    let ownerCommission = 0;
    let contractorCommission = 0;

    switch (type) {
      case "rental":
      case "transfer_rental":
        totalExKDV = r2(baseAmount);
        break;
      case "sale":
        totalExKDV = r2(baseAmount * 0.04);
        break;
      case "land_share": {
        totalExKDV = r2(baseAmount * LAND_SHARE_TOTAL_EX_VAT_RATE);
        const ownerAccepts = landShareAgreement?.ownerAcceptsCommission === true;
        const halfExVat = r2(baseAmount * (LAND_SHARE_TOTAL_EX_VAT_RATE / 2));
        if (ownerAccepts) {
          ownerCommission = halfExVat;
          contractorCommission = halfExVat;
        } else {
          ownerCommission = 0;
          contractorCommission = r2(totalExKDV);
        }
        break;
      }
    }

    const { platformShare, agentShare } = splitPool(
      type,
      totalExKDV,
      isIndividual,
      hasOneAgent,
      hasTwoAgents,
    );

    const totalKDV = r2(totalExKDV * VAT);
    const totalWithKDV = r2(totalExKDV + totalKDV);

    let breakdown: string;
    if (type === "land_share") {
      const p = (LAND_SHARE_TOTAL_EX_VAT_RATE * 100).toFixed(0);
      const h = ((LAND_SHARE_TOTAL_EX_VAT_RATE / 2) * 100).toFixed(0);
      breakdown = `Kat karsiligi: toplam %${p} (KDV haric). Muteahhit min %${h}; arsa sahibi noterde kabul ederse +%${h}, etmezse muteahhit tum %${p} uzerlenir. | Havuz bolusumu: Ihaleal/Emlakci kurallarina gore.`;
    } else if (type === "sale") {
      breakdown = "Satilik: toplam %4 + KDV (ornek model: alici %2 + satici %2 matrah dagilimi faturada ayri satir).";
    } else {
      breakdown = "Kiralik / devren: matrah 1 aylik kira + KDV (devir bedeli komisyona dahil degil).";
    }
    breakdown ??= "Standart komisyon";

    return CommissionResultSchema.parse({
      totalCommission: r2(totalExKDV),
      platformShare: r2(platformShare),
      agentShare: r2(agentShare),
      ownerCommission: r2(ownerCommission),
      contractorCommission: r2(contractorCommission),
      totalKDV: r2(totalKDV),
      totalWithKDV: r2(totalWithKDV),
      breakdown,
      currency: "TRY",
    });
  }
}

export const commissionEngine = new CommissionEngine();