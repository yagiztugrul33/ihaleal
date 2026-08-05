import { MessageSquare, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSellerProfile } from "@/hooks/useSellerProfile";
import { KycVerifiedBadge } from "@/components/trust/KycVerifiedBadge";
import { PLATFORM_LISTING_CONTACT } from "@/lib/listingPolicy";

type Props = {
  sellerId: string | null;
  listingId: string;
  listingTitle: string;
};

export function SellerTrustCard({ sellerId, listingId, listingTitle }: Props) {
  const navigate = useNavigate();
  const { profile, loading } = useSellerProfile(sellerId);

  const displayName = profile?.fullName ?? PLATFORM_LISTING_CONTACT.displayName;
  const rating = profile?.avgRating ?? 0;
  const reviewCount = profile?.reviewCount ?? 0;

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/[0.03] p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">İlan sahibi</p>
          <p className="text-sm font-semibold text-white">{loading ? "Yükleniyor…" : displayName}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <KycVerifiedBadge verified={profile?.kycVerified} compact />
            {reviewCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-xs text-amber-300">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {rating.toFixed(1)} · {reviewCount} yorum
              </span>
            ) : (
              <span className="text-[11px] text-slate-500">Henüz değerlendirme yok</span>
            )}
          </div>
        </div>
      </div>
      <p className="text-[11px] leading-relaxed text-slate-500">
        Telefon numarası ilanda gösterilmez. İletişim yalnızca platform mesajlaşması üzerinden yürür.
      </p>
      <Button
        type="button"
        className="w-full gap-2 [background:var(--gradient-cta)] text-white h-10"
        onClick={() =>
          navigate(`/mesajlar?listing=${encodeURIComponent(listingId)}&title=${encodeURIComponent(listingTitle)}`)
        }
      >
        <MessageSquare className="h-4 w-4" />
        Mesaj gönder
      </Button>
    </div>
  );
}
