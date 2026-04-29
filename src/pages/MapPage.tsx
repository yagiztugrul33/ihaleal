import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Navigation, Star, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AUCTIONS } from "@/data/auctions";
import { ListingDocumentFooter } from "@/components/ListingDocumentFooter";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function MapPage() {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollAnimation(0.05);

  const allAuctions = [...AUCTIONS].sort((a, b) => b.investmentScore - a.investmentScore);

  return (
    <div ref={ref} className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-[#061428] to-[#0a0f1e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2 mb-2">
            <ArrowLeft className="w-4 h-4" /> Geri
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3 text-white">
            <Navigation className="w-8 h-8 text-cyan-400" />
            Haritada Keşfet
          </h1>
          <p className="mt-2 text-slate-400">Tüm gayrimenkul ihale ilanlarını konumlarıyla keşfedin.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden border-white/10 bg-white/[0.05] backdrop-blur-xl h-[500px] lg:h-[600px] shadow-xl shadow-black/30">
              <div className="w-full h-full bg-slate-900 relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d6337652.538633094!2d34.5!3d39.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1str!2str!4v1700000000000"
                  className="w-full h-full border-0 opacity-95"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Türkiye haritası"
                />
                <div className="absolute top-4 left-4 px-3 py-2 rounded-xl bg-black/65 backdrop-blur-md border border-cyan-400/20 shadow-lg">
                  <div className="text-sm font-bold text-white">{allAuctions.length} İlan</div>
                  <div className="text-xs text-cyan-100">{new Set(allAuctions.map((a) => a.city)).size} Şehir</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Side list */}
          <div className="lg:col-span-1">
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {allAuctions.map((auction, idx) => (
                <Card
                  key={auction.id}
                  className="border-white/10 bg-white/[0.04] backdrop-blur-md hover:border-cyan-400/30 transition-all cursor-pointer hover:-translate-y-0.5"
                  onClick={() => navigate(`/ilan/${auction.id}`)}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <CardContent className="p-3 flex flex-col gap-2">
                    <div className="flex gap-3">
                      <img loading="lazy" src={auction.images[0]} alt="" className="w-20 h-14 object-cover rounded-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold truncate">{auction.title}</h4>
                        <div className="flex items-center gap-1 text-xs mt-0.5">
                          <MapPin className="w-3 h-3 text-blue-400" />
                          <span>{auction.district}, {auction.city}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-sm font-bold text-blue-400">₺{(auction.currentBid / 1000000).toFixed(1)}M</span>
                          <span className="text-xs text-emerald-400 flex items-center gap-1"><Star className="w-3 h-3" /> {auction.investmentScore}</span>
                        </div>
                      </div>
                    </div>
                    <ListingDocumentFooter auction={auction} compact showTopRule={false} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* City clusters */}
        <div className={`mt-10 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h2 className="text-xl font-bold mb-5 text-white">Şehirlere göre ilanlar</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {["Istanbul", "Ankara", "Izmir", "Antalya", "Bursa", "Mugla"].map((city) => {
              const cityAuctions = allAuctions.filter((a) => a.city === city);
              if (cityAuctions.length === 0) return null;
              return (
                <Card key={city} className="border-white/10 bg-white/[0.04] backdrop-blur-md p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Home className="w-5 h-5 text-blue-400" />
                    <h3 className="font-bold">{city}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/5">{cityAuctions.length} ilan</span>
                  </div>
                  <div className="space-y-2">
                    {cityAuctions.slice(0, 3).map((a) => (
                      <button
                        key={a.id}
                        onClick={() => navigate(`/ilan/${a.id}`)}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.03] text-left transition-colors"
                      >
                        <span className="text-sm truncate flex-1">{a.district}</span>
                        <span className="text-sm text-blue-400">TRY {(a.currentBid / 1000000).toFixed(1)}M</span>
                      </button>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
