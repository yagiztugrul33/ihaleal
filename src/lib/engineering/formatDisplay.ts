/** Safe display helpers — never render NaN/undefined/null to users */

export function fmtNum(
  value: number | null | undefined,
  options?: { digits?: number; suffix?: string; fallback?: string },
): string {
  const fallback = options?.fallback ?? "—";
  if (value == null || !Number.isFinite(value)) return fallback;
  const digits = options?.digits ?? 0;
  const formatted = value.toLocaleString("tr-TR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return options?.suffix ? `${formatted}${options.suffix}` : formatted;
}

export function fmtScore(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return String(Math.round(Math.max(0, Math.min(100, value))));
}

export function fmtPct(value: number | null | undefined, digits = 1): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return `%${value.toFixed(digits)}`;
}

export type RiskBand = "low" | "medium" | "high" | "critical";

export function riskBandFromScore(score: number): RiskBand {
  if (!Number.isFinite(score)) return "medium";
  if (score >= 75) return "critical";
  if (score >= 55) return "high";
  if (score >= 35) return "medium";
  return "low";
}

export const RISK_BAND_STYLES: Record<RiskBand, string> = {
  low: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  medium: "text-amber-300 bg-amber-500/10 border-amber-500/30",
  high: "text-orange-300 bg-orange-500/10 border-orange-500/30",
  critical: "text-red-300 bg-red-500/10 border-red-500/30",
};