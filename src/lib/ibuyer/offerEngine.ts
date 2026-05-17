/** Automated offer: market * 0.82 - market * (score/100) * 0.15 */
export function calculateAutomatedOfferAmount(
  marketValueTry: number,
  riskScore: number,
): number {
  const raw =
    marketValueTry * 0.82 - marketValueTry * (riskScore / 100) * 0.15;
  return Math.round(raw * 100) / 100;
}

export function offerExpiresAtIso(fromDate: Date = new Date()): string {
  const expires = new Date(fromDate.getTime() + 72 * 60 * 60 * 1000);
  return expires.toISOString();
}
