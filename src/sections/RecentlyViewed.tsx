import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Clock, MapPin, TrendingUp, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AUCTIONS } from "@/data/auctions";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ListingCoverImage } from "@/components/ListingCoverImage";
import { resolveListingDetailPath } from "@/lib/listingRoutes";

type AuctionItem = (typeof AUCTIONS)[number];

export function RecentlyViewed() {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollAnimation(0.1);

  const recentIds = useMemo(() => {
    try {
      const stored = localStorage.getItem("ihaleal_recently_viewed");
      const parsed: unknown = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
    } catch {
      return [];
    }
  }, []);

  const recentAuctions = useMemo(() => {
    return recentIds
      .map((id: string) => AUCTIONS.find((a) => a.id === id))
      .filter((auction): auction is AuctionItem => Boolean(auction))
      .slice(0, 4);
  }, [recentIds]);

  const personalizedAuctions = useMemo(() => {
    if (!recentAuctions.length) return [];
    const preferredDistricts = new Set(recentAuctions.map((a) => a.district));
    const preferredCategories = new Set(recentAuctions.map((a) => a.category));
    return AUCTIONS
      .filter((a) => !recentIds.includes(a.id))
      .map((a) => {
        let score = a.investmentScore;
        if (preferredDistricts.has(a.district)) score += 10;
        if (preferredCategories.has(a.category)) score += 6;
        return { auction: a, score };
      })
      .sort((x, y) => y.score - x.score)
      .slice(0, 4)
      .map((x) => x.auction);
  }, [recentAuctions, recentIds]);

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
            <p className="section-subtitle mt-1">Son ziyaret ettiğiniz gayrimenkul ilanları</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {recentAuctions.map((auction, idx: number) => (
            <Card
              key={auction.id}
              className="group card-warm overflow-hidden hover:border-[var(--color-accent)] transition-all duration-500 hover:-translate-y-1 cursor-pointer"
              onClick={() => navigate(resolveListingDetailPath(auction.id))}
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

        {personalizedAuctions.length > 0 ? (
          <div className={`mt-10 transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">Sana Ozel</h3>
                <p className="text-xs text-slate-400">Ilgine gore mock AI onerileri (yatirim tavsiyesi degildir).</p>
              </div>
              <Button variant="ghost" size="sm" className="text-cyan-300" onClick={() => navigate("/ilanlar")}>
                Tumunu gor <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {personalizedAuctions.map((auction, idx: number) => (
                <Card
                  key={auction.id}
                  className="group card-warm overflow-hidden border-cyan-500/25 bg-cyan-500/5 transition-all duration-500 hover:-translate-y-1 cursor-pointer"
                  onClick={() => navigate(resolveListingDetailPath(auction.id))}
                  style={{ transitionDelay: `${idx * 80}ms` }}
                >
                  <div className="relative h-36 overflow-hidden">
                    <ListingCoverImage src={auction.images[0]} alt={auction.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                    <span className="absolute left-2 top-2 rounded-md bg-cyan-500/80 px-2 py-1 text-[11px] font-semibold text-white">
                      Sana Ozel
                    </span>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="line-clamp-1 text-sm font-semibold text-white">{auction.title}</h4>
                    <p className="mt-1 text-xs text-slate-400">
                      {auction.district} · AI skor {auction.investmentScore}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
