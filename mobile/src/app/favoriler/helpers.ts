export function formatTl(value: number): string {
  return `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(value)} TL`;
}
