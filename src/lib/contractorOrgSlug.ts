import { slugifyTr } from "@/lib/finance/kkaParselImarEngine";

/** Müteahhit org slug — ASCII + kısa rastgele suffix (unique constraint). */
export function buildContractorOrgSlug(companyName: string): string {
  const base =
    slugifyTr(companyName)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "muteahhit";
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}
