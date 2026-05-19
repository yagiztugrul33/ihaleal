import type { NasilCalisirStepSlug } from "@/data/nasilCalisirContent";

/** Ana sayfa 4 adım kartı → detay rotası */
export const HOME_STEP_TO_DETAIL: Record<number, NasilCalisirStepSlug | "kyc"> = {
  0: "kesfet",
  1: "kyc",
  2: "teklif",
  3: "kazan",
};

export function homeStepHref(index: number): string {
  const slug = HOME_STEP_TO_DETAIL[index];
  if (slug === "kyc") return "/kyc";
  return `/how-it-works/adim/${slug}`;
}
