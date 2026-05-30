export type FeaturedBadgeKind = "urgent" | "opportunity" | "price_drop";

export const FEATURED_BADGE_LABELS: Record<FeaturedBadgeKind, string> = {
  urgent: "Acil",
  opportunity: "Fırsat",
  price_drop: "Fiyatı Düştü",
};

export const FEATURED_BADGE_STYLES: Record<FeaturedBadgeKind, string> = {
  urgent: "bg-red-500/90 text-white border-red-400/40",
  opportunity: "bg-amber-500/90 text-white border-amber-400/40",
  price_drop: "bg-emerald-500/90 text-white border-emerald-400/40",
};
