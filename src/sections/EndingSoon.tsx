import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, MapPin, ArrowRight, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AUCTIONS } from "@/data/auctions";
import { ListingDocumentFooter } from "@/components/ListingDocumentFooter";
import { ListingCoverImage } from "@/components/ListingCoverImage";
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
    <section ref={ref} className="py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className={`flex items-center justify-between mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <div>
            <h2 className="text-2xl md:text-3xl font-normal flex items-center gap-3" style={{ color: "var(--color-text)" }}>
              <span className="flex h-10 w-10 items-center justify-center rounded-[20px] bg-[var(--zemin-yumusak)] ring-1 ring-[var(--cizgi)]">
                <Flame className="w-5 h-5 text-[var(--metin-ikincil)]" aria-hidden />
              </span>
              Yakında Biten İhaleler
            </h2>
            <p className="mt-1" style={{ color: "var(--color-text-muted)" }}>Son teklif süresi yaklaşan fırsatları kaçırmayın</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/ihaleler")} className="hidden md:flex btn-ghost">
            Tüm ihaleler <ArrowRight className="rtl:rotate-180 w-4 h-4 ms-1" />
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {endingSoon.map((auction, idx) => {
            const time = getTimeRemaining(auction.endDate);
            return (
              <Card
                key={auction.id}
                className={`group card-warm overflow-hidden hover:border-[var(--cizgi)] transition-all duration-500 hover:-translate-y-1 cursor-pointer ${time.isUrgent ? "ring-1 ring-[var(--cizgi)]" : ""}`}
                onClick={() => navigate(`/ilan/${auction.id}`)}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div className="relative h-44 overflow-hidden">
                  <ListingCoverImage src={auction.images[0]} alt={auction.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 [background:var(--gradient-scrim)]" />
                  <div className="absolute top-3 start-3 flex items-center gap-2">
                    <span
                      className="px-2.5 py-1 rounded-[10px] text-xs font-normal flex items-center gap-1 bg-[var(--zemin-yumusak)]"
                      style={{ color: time.isUrgent ? "var(--sinyal-turuncu)" : "white" }}
                    >
                      {time.isUrgent ? <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "var(--sinyal-turuncu)" }} /> : null}
                      <Clock className="w-3 h-3" />
                      {time.days}g {time.hours}s {time.minutes}d
                    </span>
                  </div>
                  {auction.bidderCount > 15 && (
                    <div className="absolute top-3 end-3 px-2.5 py-1 rounded-[10px] bg-[var(--zemin-yumusak)] text-white text-xs font-normal">
                      {auction.bidderCount} Teklif
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-normal line-clamp-1 transition-colors group-hover:text-[var(--color-accent)]" style={{ color: "var(--color-text)" }}>{auction.title}</h3>
                  <div className="flex items-center gap-1 text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                    <MapPin className="w-3 h-3" /> {auction.district}, {auction.city}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200/80">
                    <div>
                      <div className="text-xs text-slate-500">Güncel teklif</div>
                      <div className="text-base font-normal text-[var(--metin-ikincil)]">₺{auction.currentBid.toLocaleString("tr-TR")}</div>
                    </div>
                    <div className="text-end">
                      <div className="text-xs text-slate-500">m² fiyat</div>
                      <div className="text-sm" style={{ color: "var(--color-text)" }}>₺{auction.pricePerSqm.toLocaleString("tr-TR")}</div>
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
