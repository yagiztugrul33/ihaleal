import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Clock, MapPin, TrendingUp, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AUCTIONS } from "@/data/auctions";
import type { Auction } from "@/types/auction";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ListingCoverImage } from "@/components/ListingCoverImage";

export function RecentlyViewed() {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollAnimation(0.1);

  const recentIds = useMemo(() => {
    try {
      const stored = localStorage.getItem("ihaleal_recently_viewed");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  const recentAuctions = useMemo(() => {
    return recentIds
      .map((id: string) => AUCTIONS.find((a: Auction) => a.id === id))
      .filter((a: Auction | undefined): a is Auction => Boolean(a))
      .slice(0, 4);
  }, [recentIds]);

  if (recentAuctions.length === 0) return null;

  return (
    <section ref={ref} className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <div>
            <h2 className="section-heading flex items-center gap-3">
              <Eye className="w-7 h-7 text-sky-400" />
              Son Inceledikleriniz
            </h2>
            <p className="section-subtitle mt-1">Son ziyaret ettiginiz gayrimenkul ihaleleri</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {recentAuctions.map((auction: Auction, idx: number) => (
            <Card
              key={auction.id}
              className="group card-warm overflow-hidden hover:border-[var(--color-accent)] transition-all duration-500 hover:-translate-y-1 cursor-pointer"
              onClick={() => navigate(`/ilan/${auction.id}`)}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <div className="relative h-40 overflow-hidden">
                <ListingCoverImage src={auction.images[0]} alt={auction.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <div className="absolute top-3 left-3">
                  {auction.status === "live" && (
                    <span className="px-2.5 py-1 rounded-lg bg-red-500/90 text-white text-xs font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Canli
                    </span>
                  )}
                </div>
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur text-white text-xs font-bold">
                  AI {auction.investmentScore}
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold line-clamp-1 transition-colors group-hover:text-[var(--color-primary)]" style={{ color: "var(--color-text)" }}>{auction.title}</h3>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                  <MapPin className="w-3 h-3" /> {auction.district}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <div className="text-xs text-slate-500">Teklif</div>
                    <div className="text-sm font-bold text-sky-400">TRY {auction.currentBid.toLocaleString("tr-TR")}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Getiri</div>
                    <div className="text-sm text-emerald-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> %{auction.areaStats.rentalYield}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
