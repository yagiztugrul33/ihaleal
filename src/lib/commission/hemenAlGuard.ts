import { z } from "zod";

export interface HemenAlAttempt {
  userId: string;
  listingId: string;
  commissionAmount: number;
  timestamp: Date;
}

export const HemenAlGuardSchema = z.object({
  isAllowed: z.boolean(),
  blockDurationMinutes: z.number(),
  preAuthAmount: z.number(),
  message: z.string(),
});

export type HemenAlGuardResult = z.infer<typeof HemenAlGuardSchema>;

const FIFTEEN_MS = 15 * 60 * 1000;

export class HemenAlGuard {
  private readonly activeLocks = new Map<string, number>();
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();

  attemptHemenAl(attempt: HemenAlAttempt): HemenAlGuardResult {
    const now = attempt.timestamp.getTime();
    const existing = this.activeLocks.get(attempt.listingId);
    if (existing != null && now - existing < FIFTEEN_MS) {
      return HemenAlGuardSchema.parse({
        isAllowed: false,
        blockDurationMinutes: 15,
        preAuthAmount: 0,
        message: "Bu mulk su anda baska bir kullanici tarafindan Hemen Al ile kilitlenmis.",
      });
    }

    const prev = this.timers.get(attempt.listingId);
    if (prev) clearTimeout(prev);

    this.activeLocks.set(attempt.listingId, now);
    const t = setTimeout(() => {
      this.activeLocks.delete(attempt.listingId);
      this.timers.delete(attempt.listingId);
    }, FIFTEEN_MS);
    this.timers.set(attempt.listingId, t);

    return HemenAlGuardSchema.parse({
      isAllowed: true,
      blockDurationMinutes: 15,
      preAuthAmount: Math.round(attempt.commissionAmount * 100) / 100,
      message: "Mulk 15 dakikaligina rezerve edildi; tam komisyon tutari bloke edilmelidir (PSP entegrasyonu).",
    });
  }

  applyPenaltyIfFailed(listingId: string, commissionAmount: number): {
    penaltyApplied: boolean;
    amount: number;
    message: string;
  } {
    if (this.activeLocks.has(listingId)) {
      const prev = this.timers.get(listingId);
      if (prev) clearTimeout(prev);
      this.timers.delete(listingId);
      this.activeLocks.delete(listingId);
      return {
        penaltyApplied: true,
        amount: Math.round(commissionAmount * 100) / 100,
        message: "15 dk icinde tamamlanmadi; kotuye kullanim cezasi politikasina gore tahsilat (PSP).",
      };
    }
    return { penaltyApplied: false, amount: 0, message: "" };
  }

  /** Test ve SSR icin tum kilitleri temizle */
  resetAll(): void {
    for (const t of this.timers.values()) clearTimeout(t);
    this.timers.clear();
    this.activeLocks.clear();
  }
}

export const hemenAlGuard = new HemenAlGuard();