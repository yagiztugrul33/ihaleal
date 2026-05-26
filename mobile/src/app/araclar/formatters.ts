export function parseNumericInput(raw: string): number {
  const trimmed = raw.trim();
  if (!trimmed) return Number.NaN;

  const normalized = trimmed
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^0-9.-]/g, "");

  const value = Number(normalized);
  return Number.isFinite(value) ? value : Number.NaN;
}

export function formatTl(value: number): string {
  return `${new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)} TL`;
}

export function formatPercent(value: number, digits = 2): string {
  return `%${value.toFixed(digits)}`;
}

export function formatGroupingInput(value: number, digits = 0): string {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}
