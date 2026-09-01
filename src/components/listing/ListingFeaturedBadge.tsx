import { Badge } from "@/components/ui/badge";
import { FEATURED_BADGE_LABELS, FEATURED_BADGE_STYLES, type FeaturedBadgeKind } from "@/lib/listingFeatured";

type Props = {
  isFeatured?: boolean;
  badge?: FeaturedBadgeKind | null;
};

export function ListingFeaturedBadge({ isFeatured, badge }: Props) {
  if (badge) {
    return (
      <Badge className={`text-xs font-normal ${FEATURED_BADGE_STYLES[badge]}`}>
        {FEATURED_BADGE_LABELS[badge]}
      </Badge>
    );
  }
  if (isFeatured) {
    return <Badge className="bg-violet-500/90 text-white text-xs">Öne Çıkan</Badge>;
  }
  return null;
}
