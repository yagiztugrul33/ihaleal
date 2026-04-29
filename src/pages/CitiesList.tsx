import { useNavigate } from "react-router-dom";
import { MapPin, TrendingUp, DollarSign, Users, Percent, ArrowRight, Building2, Navigation } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { AUCTIONS } from "@/data/auctions";

const CITIES = [
  {
    name: "İstanbul",
    image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&fit=crop",
    population: "15.8M",
    avgPricePerSqm: 85200,
    annualGrowth: 22.4,
    rentalYield: 5.8,
    demandIndex: 92,
    listingCount: 0,
    tag: "Finans Merkezi",
    color: "from-blue-500/20 to-purple-500/20",
  },
  {
    name: "Ankara",
    image: "https://images.unsplash.com/photo-1563299796-1758ed990f6a?w=800&fit=crop",
    population: "5.7M",
    avgPricePerSqm: 38500,
    annualGrowth: 12.8,
    rentalYield: 5.5,
    demandIndex: 75,
    listingCount: 0,
    tag: "Başkent",
    color: "from-emerald-500/20 to-teal-500/20",
  },
  {
    name: "İzmir",
    image: "https://images.unsplash.com/photo-1589561253898-768105ca91a8?w=800&fit=crop",
    population: "4.5M",
    avgPricePerSqm: 62500,
    annualGrowth: 18.6,
    rentalYield: 6.2,
    demandIndex: 82,
    listingCount: 0,
    tag: "Ege'nin İncisi",
    color: "from-orange-500/20 to-amber-500/20",
  },
  {
    name: "Antalya",
    image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&fit=crop",
    population: "2.7M",
    avgPricePerSqm: 48000,
    annualGrowth: 24.2,
    rentalYield: 7.5,
    demandIndex: 88,
    listingCount: 0,
    tag: "Turizm Başkenti",
    color: "from-cyan-500/20 to-blue-500/20",
  },
  {
    name: "Bursa",
    image: "https://images.unsplash.com/photo-1593115057326-e9db8f537a2c?w=800&fit=crop",
    population: "3.2M",
    avgPricePerSqm: 32000,
    annualGrowth: 11.5,
    rentalYield: 5.0,
    demandIndex: 68,
    listingCount: 0,
    tag: "Yeşil Bursa",
    color: "from-green-500/20 to-emerald-500/20",
  },
  {
    name: "Muğla",
    image: "https://images.unsplash.com/photo-1600195077077-7c815f540a3d?w=800&fit=crop",
    population: "1.1M",
    avgPricePerSqm: 78000,
    annualGrowth: 28.5,
    rentalYield: 8.2,
    demandIndex: 90,
    listingCount: 0,
    tag: "Premium Bölge",
    color: "from-violet-500/20 to-pink-500/20",
  },
];

export default function CitiesList() {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollAnimation(0.05);

  // Calculate listing counts
  const citiesWithCounts = CITIES.map((city) => ({
    ...city,
    listingCount: AUCTIONS.filter((a) => a.city === city.name).length,
  })).sort((a, b) => b.annualGrowth - a.annualGrowth);

  return (
    <div ref={ref} className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <Navigation className="w-8 h-8 text-blue-400" />
            Şehir Rehberi
          </h1>
          <p className="mt-2 max-w-2xl">
            Türkiye'nin en popüler gayrimenkul piyasalarını keşfedin. Her şehir için detaylı fiyat analizi, semt raporları ve yatırım fırsatları.
          </p>
        </div>

        {/* Stats */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <Card className="border-white/5 p-4">
            <div className="flex items-center gap-2 mb-2"><MapPin className="w-5 h-5 text-blue-400" /><span className="text-sm text-slate-400">Şehir</span></div>
            <div className="text-2xl font-bold">{CITIES.length}</div>
          </Card>
          <Card className="border-white/5 p-4">
            <div className="flex items-center gap-2 mb-2"><Building2 className="w-5 h-5 text-emerald-400" /><span className="text-sm text-slate-400">Toplam İlan</span></div>
            <div className="text-2xl font-bold text-emerald-400">{AUCTIONS.length}</div>
          </Card>
          <Card className="border-white/5 p-4">
            <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-5 h-5 text-amber-400" /><span className="text-sm text-slate-400">En Yüksek Artış</span></div>
            <div className="text-2xl font-bold text-amber-400">%+28.5</div>
            <div className="text-xs text-slate-500">Muğla</div>
          </Card>
          <Card className="border-white/5 p-4">
            <div className="flex items-center gap-2 mb-2"><Percent className="w-5 h-5 text-violet-400" /><span className="text-sm text-slate-400">En İyi Getiri</span></div>
            <div className="text-2xl font-bold text-violet-400">%8.2</div>
            <div className="text-xs text-slate-500">Muğla</div>
          </Card>
        </div>

        {/* City Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {citiesWithCounts.map((city, idx) => (
            <Card
              key={city.name}
              className="group border-white/5 overflow-hidden hover:border-blue-500/20 transition-all duration-500 hover:-translate-y-1 cursor-pointer"
              onClick={() => navigate(`/sehir/${city.name}`)}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <div className="relative h-48 overflow-hidden">
                <img loading="lazy" src={city.image} alt={city.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-blue-500/90 text-white text-xs font-bold">
                  {city.tag}
                </div>
                <div className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-white/10 backdrop-blur text-white text-xs font-bold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +{city.annualGrowth}%
                </div>
                <div className="absolute bottom-3 left-3">
                  <h3 className="text-2xl font-bold text-white">{city.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-300 mt-1">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {city.population}</span>
                    <span>{city.listingCount} ilan</span>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-xs text-slate-500">m² Fiyat</div>
                    <div className="text-sm font-bold text-blue-400">₺{city.avgPricePerSqm.toLocaleString()}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-slate-500">Getiri</div>
                    <div className="text-sm font-bold text-emerald-400">%{city.rentalYield}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-slate-500">Talep</div>
                    <div className="text-sm font-bold text-amber-400">{city.demandIndex}/100</div>
                  </div>
                </div>
                <Button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-400 hover:to-teal-300 text-white font-semibold">
                  Detaylı İncele <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparison Table */}
        <div className={`mt-10 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h2 className="text-xl font-bold mb-4">Şehir Karşılaştırma</h2>
          <Card className="border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left p-4 text-slate-400 font-medium">Şehir</th>
                    <th className="text-right p-4 text-slate-400 font-medium">m² Fiyat</th>
                    <th className="text-right p-4 text-slate-400 font-medium">Yıllık Artış</th>
                    <th className="text-right p-4 text-slate-400 font-medium">Kira Getirisi</th>
                    <th className="text-right p-4 text-slate-400 font-medium">Talep Endeksi</th>
                    <th className="text-right p-4 text-slate-400 font-medium">İlan</th>
                  </tr>
                </thead>
                <tbody>
                  {citiesWithCounts.map((city) => (
                    <tr
                      key={city.name}
                      className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => navigate(`/sehir/${city.name}`)}
                    >
                      <td className="p-4 font-semibold flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-400" /> {city.name}
                      </td>
                      <td className="p-4 text-right font-semibold text-blue-400">₺{city.avgPricePerSqm.toLocaleString()}</td>
                      <td className="p-4 text-right text-emerald-400">+{city.annualGrowth}%</td>
                      <td className="p-4 text-right text-violet-400">%{city.rentalYield}</td>
                      <td className="p-4 text-right text-amber-400">{city.demandIndex}</td>
                      <td className="p-4 text-right">{city.listingCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
