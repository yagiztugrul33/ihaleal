export type BorsaRegionCode = "istanbul" | "ege" | "akdeniz" | "ankara" | "bodrum";

export const BORSA_REGIONS: { code: BorsaRegionCode; label: string }[] = [
  { code: "istanbul", label: "İstanbul" },
  { code: "ege", label: "Ege" },
  { code: "akdeniz", label: "Akdeniz" },
  { code: "ankara", label: "Ankara" },
  { code: "bodrum", label: "Bodrum" },
];

export function regionLabel(code: string): string {
  return BORSA_REGIONS.find((r) => r.code === code)?.label ?? code;
}
