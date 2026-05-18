/** Compact timestamp for report IDs (digits only — avoids Tailwind content-scan false positives). */
export function compactIsoTimestamp(date: Date = new Date()): string {
  return date.toISOString().replace(/\D/g, "").slice(0, 14);
}
