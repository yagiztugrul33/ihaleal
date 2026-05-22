export function resolveListingDetailPath(id: string): string {
  const value = String(id ?? "").trim();
  if (!value) return "/ilanlar";
  if (/^prop-\d{3,}$/i.test(value)) return `/ilanlar/${value.toLowerCase()}`;
  return `/ilan/${value}`;
}
