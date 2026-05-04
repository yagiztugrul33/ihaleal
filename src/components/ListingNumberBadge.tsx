import type { Auction } from "@/types/auction";
import { getListingNumber } from "@/lib/listingNumber";
import { Badge } from "@/components/ui/badge";

export function ListingNumberBadge({
  auction,
  className = "",
  compact = false,
}: {
  auction: Auction;
  className?: string;
  compact?: boolean;
}) {
  const no = getListingNumber(auction);
  return (
    <Badge
      variant="outline"
      className={`font-mono border-cyan-500/35 text-cyan-100 bg-cyan-950/40 ${compact ? "text-[9px] px-1.5 py-0" : "text-[10px] sm:text-xs px-2 py-0.5"} ${className}`}
      title="Ilan numarasi — sozlesme ve destek hattinda kullanin"
    >
      İlan {no}
    </Badge>
  );
}
