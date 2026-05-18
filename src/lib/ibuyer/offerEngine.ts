import { safeAutomatedOfferAmount } from "@/lib/engineering/safeCalc";

/** Automated offer: market * 0.82 - market * (score/100) * 0.15 */
export function calculateAutomatedOfferAmount(
  marketValueTry: number,
  riskScore: number,
): number {
  try {
    const amount = safeAutomatedOfferAmount(marketValueTry, riskScore);
    return amount ?? 0;
  } catch {
    return 0;
  }
}

export function offerExpiresAtIso(fromDate: Date = new Date()): string {
  const expires = new Date(fromDate.getTime() + 72 * 60 * 60 * 1000);
  return expires.toISOString();
}
