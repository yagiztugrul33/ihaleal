import { useCallback, useEffect, useState } from "react";
import {
  fetchListingRatingSummaries,
  type ListingRatingSummary,
} from "@/lib/listingReviews/listingReviewsClient";

export function useListingRatings(listingIds: string[]) {
  const [ratings, setRatings] = useState<Map<string, ListingRatingSummary>>(new Map());
  const [loading, setLoading] = useState(false);

  const key = listingIds.slice().sort().join(",");

  const reload = useCallback(async () => {
    if (!key) {
      setRatings(new Map());
      return;
    }
    setLoading(true);
    try {
      const map = await fetchListingRatingSummaries(listingIds);
      setRatings(map);
    } finally {
      setLoading(false);
    }
  }, [key, listingIds]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { ratings, loading, reload };
}
