import { z } from "zod";

export const PenaltyTypeSchema = z.enum([
  "early_cancel",
  "post_match_cancel",
  "bypass",
  "hemen_al_abuse",
]);
export type PenaltyType = z.infer<typeof PenaltyTypeSchema>;

export const PenaltyInputSchema = z.object({
  type: PenaltyTypeSchema,
  /** Kiralik: genelde aylik kira / taban. Satilik / arsa: matrah veya rayic. */
  baseAmount: z.number().positive().finite(),
  transactionType: z.enum(["rental", "sale", "land_share"]),
  isOwner: z.boolean(),
});

export type PenaltyInput = z.infer<typeof PenaltyInputSchema>;

export const PenaltyResultSchema = z.object({
  penaltyAmount: z.number(),
  reason: z.string(),
  description: z.string(),
});

export type PenaltyResult = z.infer<typeof PenaltyResultSchema>;

function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

export class PenaltyEngine {
  calculate(raw: PenaltyInput): PenaltyResult {
    const input = PenaltyInputSchema.parse(raw);
    const { type, baseAmount, transactionType, isOwner } = input;
    let penalty = 0;
    let reason = "";

    switch (type) {
      case "early_cancel":
        penalty = transactionType === "rental" ? r2(baseAmount * 0.1) : r2(baseAmount * 0.01);
        reason = "Eslesme oncesi iptal";
        break;
      case "post_match_cancel":
        penalty =
          transactionType === "rental" ? r2(baseAmount) : r2(baseAmount * 0.02);
        reason = "Eslesme sonrasi cayma";
        break;
      case "bypass":
        penalty = r2(baseAmount * 10);
        reason = "Aradan cikma (kacirilan komisyon uzerinden ornek carpan)";
        break;
      case "hemen_al_abuse":
        penalty = r2(baseAmount);
        reason = "Hemen Al kotuye kullanim";
        break;
    }

    const side = isOwner ? "Mulk / arsa sahibi tarafi" : "Alici / kiraci / muteahhit tarafi";
    const description = reason + " - " + side;

    return PenaltyResultSchema.parse({
      penaltyAmount: r2(penalty),
      reason,
      description,
    });
  }
}

export const penaltyEngine = new PenaltyEngine();