export const HOUSE_IMAGE_FALLBACKS = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1600607687644-c7f34b5b0f58?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb3?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1600585154154-712f8f9f0d1f?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1600607687645-c7171b42498f?auto=format&fit=crop&w=1600&q=80",
] as const;

export const LISTING_IMAGE_PLACEHOLDER = HOUSE_IMAGE_FALLBACKS[0];

export function normalizeListingImageUrl(input: string | undefined | null): string {
  const raw = String(input ?? "").trim();
  if (!raw) return LISTING_IMAGE_PLACEHOLDER;
  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) return raw;
  if (raw.startsWith("/")) return raw;
  return `/${raw.replace(/^\.?\//, "")}`;
}

export function normalizeAuctionImages(images: string[] | undefined | null): string[] {
  const cleaned = (images ?? []).map((u) => normalizeListingImageUrl(u)).filter(Boolean);
  return cleaned.length > 0 ? cleaned : [...HOUSE_IMAGE_FALLBACKS];
}

export function ensureHouseGalleryImages(images: string[] | undefined | null, minCount = 6): string[] {
  const normalized = normalizeAuctionImages(images);
  const out = [...normalized];
  while (out.length < minCount) {
    const fallback = HOUSE_IMAGE_FALLBACKS[out.length % HOUSE_IMAGE_FALLBACKS.length];
    out.push(fallback);
  }
  return out.slice(0, Math.max(minCount, out.length));
}
