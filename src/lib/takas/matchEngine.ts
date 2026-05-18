import type { TakasApplicationPayload } from "./types";

/**
 * Client-side preview match score (0-100).
 * Not a real match — backend does the actual lookup. This is just a UI signal
 * telling the user how "specific" their criteria are.
 *
 * Logic: the more specific criteria they provide, the higher the score
 * (= more confidence we can find a match). Vague criteria = lower score.
 */
export function previewMatchScore(payload: TakasApplicationPayload): number {
  let score = 30; // baseline for any submission

  // Hedef city/district specificity
  if (payload.desiredCity && payload.desiredCity.trim().length > 0) score += 10;
  if (payload.desiredDistrict && payload.desiredDistrict.trim().length > 0)
    score += 10;

  // Budget specificity
  if (payload.desiredBudgetTry > 0) score += 15;

  // Property type
  if (payload.desiredPropertyType) score += 10;

  // Size range
  if (payload.desiredMinM2 || payload.desiredMaxM2) score += 10;

  // Rooms
  if (payload.desiredRooms) score += 10;

  // Timeline urgency boost
  if (payload.timeline === "URGENT") score += 5;

  return Math.min(100, Math.max(0, Math.round(score)));
}
