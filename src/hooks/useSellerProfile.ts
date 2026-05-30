import { useCallback, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type SellerProfileSummary = {
  id: string;
  fullName: string;
  kycVerified: boolean;
  avgRating: number;
  reviewCount: number;
};

export function useSellerProfile(sellerId: string | null) {
  const [profile, setProfile] = useState<SellerProfileSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!sellerId || !isSupabaseConfigured()) {
      setProfile(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data: row, error: profileErr } = await supabase
        .from("profiles")
        .select("id, full_name, kyc_status")
        .eq("id", sellerId)
        .maybeSingle();

      if (profileErr) {
        setProfile(null);
        setError("Profil yüklenemedi.");
        return;
      }

      const { data: reviews, error: reviewErr } = await supabase
        .from("listing_reviews")
        .select("rating")
        .eq("reviewed_id", sellerId);

      if (reviewErr) {
        setProfile(null);
        setError("Değerlendirmeler yüklenemedi.");
        return;
      }
      let avgRating = 0;
      let reviewCount = 0;
      if (reviews?.length) {
        reviewCount = reviews.length;
        const sum = reviews.reduce((acc, r) => acc + Number(r.rating ?? 0), 0);
        avgRating = Math.round((sum / reviewCount) * 10) / 10;
      }
      if (row) {
        setProfile({
          id: String(row.id),
          fullName: String(row.full_name ?? "Satıcı"),
          kycVerified: row.kyc_status === "verified",
          avgRating,
          reviewCount,
        });
      } else {
        setProfile(null);
      }
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { profile, loading, error, reload };
}
