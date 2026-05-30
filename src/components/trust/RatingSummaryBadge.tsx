import { Star } from "lucide-react";
import type { ListingRatingSummary } from "@/lib/listingReviews/listingReviewsClient";

type Props = {
  summary: ListingRatingSummary | undefined;
  compact?: boolean;
  className?: string;
};

export function RatingSummaryBadge({ summary, compact, className }: Props) {
  const count = summary?.reviewCount ?? 0;
  const avg = summary?.avgRating ?? 0;

  if (count === 0) {
    return (
      <span className={`text-xs text-slate-500 ${className ?? ""}`}>
        {compact ? "—" : "Henüz yorum yok"}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 text-xs text-amber-400 ${className ?? ""}`}>
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
      <span>{avg.toFixed(1)}</span>
      {!compact ? <span className="text-slate-500">({count} yorum)</span> : null}
    </span>
  );
}
