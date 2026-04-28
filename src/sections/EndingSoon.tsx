import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Flame, TrendingUp, MapPin, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AUCTIONS } from "@/data/auctions";
import { ListingDocumentFooter } from "@/components/ListingDocumentFooter";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

function getTimeRemaining(endDate: string) {
  const total = new Date(endDate).getTime() - Date.now();
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / (1000 * 60)) % 60);
  return { total, days, hours, minutes, isUrgent: days < 3 };
}

export function EndingSoon() {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollAnimation(0.1);

  const endingSoon = useMemo(() => {
    return AUCTIONS.filter((a) => a.status === "live")
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
      .slice(0, 4);
  }, []);

  if (endingSoon.length === 0) return null;

  return (
    <section ref={ref} className="py-16 bg-[#0d1321]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <Flame className="w-7 h-7 text-orange-400" />
              Yakında biten ihaleler
            </h2>
            <p className="text-slate-400 mt-1">Son teklif süresi yaklaşan fırsatları kaçırmayın</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/")} className="hidden md:flex border-white/10 text-slate-400 hover:text-white hover:bg-white/5">
            Tüm ihaleler <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {endingSoon.map((auction, idx) => {
            const time = getTimeRemaining(auction.endDate);
            return (
              <Card
                key={auction.id}
                className={`group bg-slate-900/50 border-white/5 overflow-hidden hover:border-orange-500/20 transition-all duration-500 hover:-translate-y-1 cursor-pointer ${time.isUrgent ? "ring-1 ring-red-500/20" : ""}`}
                onClick={() => navigate(`/ilan/${auction.id}`)}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div className="relative h-44 overflow-hidden">
                  <img src={auction.images[0]} alt={auction.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${time.isUrgent ? "bg-red-500 text-white animate-pulse" : "bg-orange-500/90 text-white"}`}>
                      <Clock className="w-3 h-3" />
                      {time.days}g {time.hours}s {time.minutes}d
                    </span>
                  </div>
                  {auction.bidderCount > 15 && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-blue-500/90 text-white text-xs font-bold">
                      {auction.bidderCount} Teklif
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-white line-clamp-1 group-hover:text-orange-400 transition-colors">{auction.title}</h3>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3 h-3" /> {auction.district}, {auction.city}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                    <div>
                      <div className="text-xs text-slate-500">Güncel teklif</div>
                      <div className="text-base font-bold text-orange-400">₺{auction.currentBid.toLocaleString("tr-TR")}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">m² fiyat</div>
                      <div className="text-sm text-white">₺{auction.pricePerSqm.toLocaleString("tr-TR")}</div>
                    </div>
                  </div>
                  <ListingDocumentFooter auction={auction} compact showTopRule={false} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
