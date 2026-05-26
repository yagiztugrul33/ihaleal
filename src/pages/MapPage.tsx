import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Navigation, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AUCTIONS } from "@/data/auctions";
import { ListingDocumentFooter } from "@/components/ListingDocumentFooter";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function MapPage() {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollAnimation(0.05);
  const [cityFilter, setCityFilter] = useState("");

  const allAuctions = [...AUCTIONS].sort((a, b) => b.investmentScore - a.investmentScore);
  const filtered = cityFilter.trim()
    ? allAuctions.filter(
        (a) =>
          a.city.toLowerCase().includes(cityFilter.toLowerCase()) ||
          a.district.toLowerCase().includes(cityFilter.toLowerCase())
      )
    : allAuctions;
  const heatRows = Object.entries(
    filtered.reduce<Record<string, { count: number; avgScore: number }>>((acc, row) => {
      const key = row.city;
      if (!acc[key]) acc[key] = { count: 0, avgScore: 0 };
      const nextCount = acc[key].count + 1;
      acc[key].avgScore = (acc[key].avgScore * acc[key].count + row.investmentScore) / nextCount;
      acc[key].count = nextCount;
      return acc;
    }, {}),
  )
    .map(([city, value]) => ({
      city,
      count: value.count,
      avgScore: Math.round(value.avgScore),
      heat: Math.min(100, Math.round(value.count * 14 + value.avgScore * 0.5)),
    }))
    .sort((a, b) => b.heat - a.heat);
  const districtHeatRows = filtered
    .map((row) => ({
      key: `${row.city}-${row.district}`,
      city: row.city,
      district: row.district,
      score: row.investmentScore,
      bidTry: row.currentBid,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return (
    <div ref={ref} className="intelligence-page min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-2 gap-2 text-slate-300">
            <ArrowLeft className="h-4 w-4" /> Geri
          </Button>
          <p className="badge-corp mb-3">Harita Görünümü</p>
          <h1 className="section-heading flex items-center gap-3 text-3xl md:text-4xl">
            <Navigation className="h-8 w-8 text-blue-400" aria-hidden />
            Türkiye Gayrimenkul Haritası
          </h1>
          <p className="section-subtitle mt-2">
            İlanları harita üzerinde keşfedin. Bölge, fiyat ve tür filtreleyin.
          </p>
        </div>

        <div className="card-luxury mb-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Şehir / ilçe
            </label>
            <input
              type="text"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              placeholder="İstanbul, Ankara…"
              className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500/40 focus:outline-none"
            />
          </div>
          <div className="flex flex-col justify-end">
            <p className="text-2xl font-bold text-blue-400">{filtered.length}</p>
            <p className="text-xs text-slate-400">Gösterilen ilan</p>
          </div>
          <div className="flex flex-col justify-end">
            <p className="text-2xl font-bold text-emerald-400">{new Set(allAuctions.map((a) => a.city)).size}</p>
            <p className="text-xs text-slate-400">Şehir kapsamı</p>
          </div>
          <div className="flex items-end">
            <Link to="/ilanlar" className="btn-secondary w-full justify-center text-center">
              Listede görüntüle
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="card-luxury !p-0 overflow-hidden h-[500px] lg:h-[600px] border-white/10">
              <div className="relative h-full w-full bg-slate-950">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d6337652.538633094!2d34.5!3d39.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1str!2str!4v1700000000000"
                  className="h-full w-full border-0 opacity-95"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Türkiye haritası"
                />
                <div className="absolute left-4 top-4 rounded-xl border border-blue-500/25 bg-slate-950/80 px-3 py-2 shadow-lg backdrop-blur-md">
                  <p className="text-sm font-bold text-white">{filtered.length} ilan</p>
                  <p className="text-xs text-slate-400">
                    {new Set(filtered.map((a) => a.city)).size} şehir
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="card-luxury mb-3 border-white/10">
              <CardContent className="p-3">
                <h2 className="text-sm font-semibold text-white">Şehir ısı haritası (talep yoğunluğu)</h2>
                <div className="mt-2 space-y-2">
                  {heatRows.slice(0, 6).map((row) => (
                    <div key={row.city}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300">{row.city}</span>
                        <span className="text-cyan-300">
                          Isı {row.heat}/100 · {row.count} ilan
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400"
                          style={{ width: `${row.heat}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="card-luxury mb-3 border-white/10">
              <CardContent className="p-3">
                <h2 className="text-sm font-semibold text-white">Bölgesel ısı matrisi (ilan + skor)</h2>
                <div className="mt-2 space-y-2">
                  {districtHeatRows.map((row) => (
                    <div key={row.key} className="rounded-lg border border-white/10 bg-black/20 px-2 py-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300">
                          {row.city} / {row.district}
                        </span>
                        <span className="text-amber-300">Skor {row.score}</span>
                      </div>
                      <div className="mt-1 text-[11px] text-slate-400">
                        Teklif: ₺{row.bidTry.toLocaleString("tr-TR")}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <div className="max-h-[600px] space-y-3 overflow-y-auto pr-1">
              {filtered.map((auction, idx) => (
                <Card
                  key={auction.id}
                  className="property-card card-luxury !p-0 cursor-pointer border-white/10"
                  onClick={() => navigate(`/ilan/${auction.id}`)}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <CardContent className="flex flex-col gap-2 p-3">
                    <div className="flex gap-3">
                      <img
                        loading="lazy"
                        src={auction.images[0]}
                        alt=""
                        className="h-14 w-20 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-bold text-white">{auction.title}</h4>
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                          <MapPin className="h-3 w-3 text-blue-400" aria-hidden />
                          <span>
                            {auction.district}, {auction.city}
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-center justify-between">
                          <span className="property-price text-sm">
                            ₺{(auction.currentBid / 1_000_000).toFixed(1)}M
                          </span>
                          <span className="ai-score-pill flex items-center gap-1">
                            <Star className="h-3 w-3" aria-hidden /> {auction.investmentScore}
                          </span>
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

        <div
          className={`mt-10 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <h2 className="section-heading mb-5 text-xl">Şehirlere göre ilanlar</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {["İstanbul", "Ankara", "İzmir", "Antalya", "Bursa", "Muğla"].map((city) => {
              const cityAuctions = allAuctions.filter((a) => a.city === city);
              if (cityAuctions.length === 0) return null;
              return (
                <Card key={city} className="card-luxury p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-lg font-bold text-white">{city}</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-400">
                      {cityAuctions.length} ilan
                    </span>
                  </div>
                  <div className="space-y-2">
                    {cityAuctions.slice(0, 3).map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => navigate(`/ilan/${a.id}`)}
                        className="flex w-full items-center justify-between rounded-lg p-2 text-left transition-colors hover:bg-white/5"
                      >
                        <span className="flex-1 truncate text-sm text-slate-300">{a.district}</span>
                        <span className="text-sm font-semibold text-blue-400">
                          ₺{(a.currentBid / 1_000_000).toFixed(1)}M
                        </span>
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
