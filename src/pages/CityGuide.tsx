import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, Building2, TrendingUp, Home, DollarSign,
  BarChart3, Star, Clock, Users, Percent, ArrowRight,
  LineChart, Activity, ChevronRight, Navigation,
  Landmark, Bus, GraduationCap, Heart, ShoppingBag, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AUCTIONS } from "@/data/auctions";
import { ListingDocumentFooter } from "@/components/ListingDocumentFooter";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart as ReLineChart, Line, PieChart as RePieChart, Pie, Cell, AreaChart, Area
} from "recharts";

const CITY_PROFILES: Record<string, {
  population: string; area: string; medianAge: number; incomePerCapita: string;
  avgPricePerSqm: number; annualGrowth: number; rentalYield: number;
  demandIndex: number; marketingDays: number; totalListings: number;
  description: string; highlights: string[];
  districts: { name: string; avgPrice: number; growth: number; type: string }[];
  transport: { type: string; desc: string }[];
  education: { name: string; level: string }[];
  hospitals: { name: string; type: string }[];
  lifestyle: string[];
}> = {
  Istanbul: {
    population: "15.8M", area: "5,343 km²", medianAge: 34.2, incomePerCapita: "₺485,000",
    avgPricePerSqm: 85200, annualGrowth: 22.4, rentalYield: 5.8,
    demandIndex: 92, marketingDays: 42, totalListings: 285420,
    description: "Türkiye'nin ekonomik ve kültürel başkenti. Avrupa ve Asya'yı birleştiren benzersiz coğrafyasıyla dünyanın en önemli metropollerinden biri.",
    highlights: ["Finans Merkezi", "Boğaz Manzarası", "Tarihi Yarımada", "AVM'ler"],
    districts: [
      { name: "Levent", avgPrice: 125000, growth: 18.5, type: "İş Merkezi" },
      { name: "Bebek", avgPrice: 180000, growth: 25.2, type: "Lüks" },
      { name: "Ataşehir", avgPrice: 78000, growth: 15.8, type: "Aile" },
      { name: "Kadıköy", avgPrice: 72000, growth: 20.1, type: "Merkez" },
      { name: "Maslak", avgPrice: 95000, growth: 16.5, type: "Rezidans" },
      { name: "Beşiktaş", avgPrice: 88000, growth: 19.8, type: "Merkez" },
    ],
    transport: [
      { type: "Metro", desc: "11 hat, 140+ istasyon" },
      { type: "Marmaray", desc: "Asya-Avrupa bağlantısı" },
      { type: "Metrobus", desc: "Anadolu Yakası hattı" },
      { type: "Vapur", desc: "Adalar ve Boğaz hatları" },
    ],
    education: [
      { name: "Koç Üniversitesi", level: "Özel" },
      { name: "İTÜ", level: "Devlet" },
      { name: "Boğaziçi Üniversitesi", level: "Devlet" },
      { name: "Sabancı Üniversitesi", level: "Özel" },
    ],
    hospitals: [
      { name: "Acıbadem", type: "Özel" },
      { name: "Florence Nightingale", type: "Özel" },
      { name: "İstanbul Üniversitesi Tıp", type: "Devlet" },
    ],
    lifestyle: ["Tarihi mekanlar", "Gece hayatı", "Gurme restoranlar", "Sanat galerileri", "Spor kulüpleri"],
  },
  Ankara: {
    population: "5.7M", area: "24,521 km²", medianAge: 33.8, incomePerCapita: "₺425,000",
    avgPricePerSqm: 38500, annualGrowth: 12.8, rentalYield: 5.5,
    demandIndex: 75, marketingDays: 38, totalListings: 87420,
    description: "Türkiye'nin başkenti ve en planlı şehirlerinden biri. Kamu sektörü, üniversiteler ve savunma sanayi merkezi.",
    highlights: ["Kamu Merkezi", "ODTÜ", "Anıtkabir", "Yüksek Kiracı"],
    districts: [
      { name: "Çankaya", avgPrice: 52000, growth: 11.2, type: "Merkez" },
      { name: "Eryaman", avgPrice: 32000, growth: 9.5, type: "Aile" },
      { name: "Keçiören", avgPrice: 28000, growth: 8.2, type: "Gelişen" },
    ],
    transport: [
      { type: "Ankaray", desc: "A1-A4 hatları" },
      { type: "Metro", desc: "M1-M4 hatları" },
      { type: "Banliyö", desc: "Şehir içi ulaşım" },
      { type: "EGO Otobüs", desc: "Geniş ağ" },
    ],
    education: [
      { name: "ODTÜ", level: "Devlet" },
      { name: "Bilkent Üniversitesi", level: "Özel" },
      { name: "Hacettepe Üniversitesi", level: "Devlet" },
    ],
    hospitals: [
      { name: "Hacettepe Tıp", type: "Devlet" },
      { name: "Bayındır", type: "Özel" },
    ],
    lifestyle: ["Parklar", "Müzeler", "Alışveriş merkezleri", "Spor kompleksleri"],
  },
  Izmir: {
    population: "4.5M", area: "11,891 km²", medianAge: 34.8, incomePerCapita: "₺465,000",
    avgPricePerSqm: 62500, annualGrowth: 18.6, rentalYield: 6.2,
    demandIndex: 82, marketingDays: 35, totalListings: 124680,
    description: "Ege'nin incisi. Deniz, güneş ve kültürün buluştuğu yaşanabilir şehir. Son yıllarda yüksek değer artışı.",
    highlights: ["Kordon", "Alsancak", "Ege Üniversitesi", "Yatırım Potansiyeli"],
    districts: [
      { name: "Alsancak", avgPrice: 85000, growth: 22.1, type: "Merkez" },
      { name: "Karşıyaka", avgPrice: 72000, growth: 19.5, type: "Sahil" },
      { name: "Bornova", avgPrice: 48000, growth: 15.2, type: "Aile" },
    ],
    transport: [
      { type: "İZBAN", desc: "Banliyö treni" },
      { type: "Metro", desc: "Konak-Bornova" },
      { type: "Vapur", desc: "Körfez içi" },
      { type: "Tramvay", desc: "Konak hattı" },
    ],
    education: [
      { name: "Ege Üniversitesi", level: "Devlet" },
      { name: "İYTE", level: "Devlet" },
      { name: "Yaşar Üniversitesi", level: "Özel" },
    ],
    hospitals: [
      { name: "Ege Üniversitesi Tıp", type: "Devlet" },
      { name: "Medical Park", type: "Özel" },
    ],
    lifestyle: ["Sahil yaşamı", "Lezzet durakları", "Festivaller", "Yelken"],
  },
  Antalya: {
    population: "2.7M", area: "20,177 km²", medianAge: 36.5, incomePerCapita: "₺380,000",
    avgPricePerSqm: 48000, annualGrowth: 24.2, rentalYield: 7.5,
    demandIndex: 88, marketingDays: 28, totalListings: 98500,
    description: "Turizm başkenti. Akdeniz iklimi, mavi bayraklı plajları ve golf sahalarıyla dünyaca ünlü. Yabancı yatırımcıların gözdesi.",
    highlights: ["Konyaaltı Plajı", "Kaleiçi", "Golf Sahaları", "Yabancı Talebi"],
    districts: [
      { name: "Konyaaltı", avgPrice: 65000, growth: 28.5, type: "Sahil" },
      { name: "Lara", avgPrice: 58000, growth: 25.1, type: "Turizm" },
      { name: "Kepez", avgPrice: 32000, growth: 18.2, type: "Gelişen" },
    ],
    transport: [
      { type: "Tramvay", desc: "AntRay" },
      { type: "Otobüs", desc: "Geniş ağ" },
      { type: "Havalimanı", desc: "Dünya 3. büyük" },
    ],
    education: [
      { name: "Akdeniz Üniversitesi", level: "Devlet" },
      { name: "Antalya Bilim Üniversitesi", level: "Özel" },
    ],
    hospitals: [
      { name: "Akdeniz Üniversitesi Tıp", type: "Devlet" },
      { name: "Anadolu", type: "Özel" },
    ],
    lifestyle: ["Plajlar", "Golf", "Tarihi mekanlar", "Doğa yürüyüşü"],
  },
  Bursa: {
    population: "3.2M", area: "10,813 km²", medianAge: 33.2, incomePerCapita: "₺395,000",
    avgPricePerSqm: 32000, annualGrowth: 11.5, rentalYield: 5.0,
    demandIndex: 68, marketingDays: 45, totalListings: 56200,
    description: "Sanayi ve tarih şehri. Uludağ kayağı, yeşil cami ve İpek Yolu üzerindeki konumuyla öne çıkar.",
    highlights: ["Uludağ", "Yeşil Bursa", "Osmangazi", "Sanayi Merkezi"],
    districts: [
      { name: "Nilüfer", avgPrice: 42000, growth: 10.5, type: "Aile" },
      { name: "Osmangazi", avgPrice: 38000, growth: 12.1, type: "Merkez" },
    ],
    transport: [
      { type: "Metro", desc: "Şehir içi" },
      { type: "Bursaray", desc: "Raylı sistem" },
      { type: "Teleferik", desc: "Uludağ" },
    ],
    education: [
      { name: "Bursa Teknik Üniversitesi", level: "Devlet" },
      { name: "Uludağ Üniversitesi", level: "Devlet" },
    ],
    hospitals: [
      { name: "Bursa Devlet", type: "Devlet" },
      { name: "Medicana", type: "Özel" },
    ],
    lifestyle: ["Kış sporları", "Tarihi camiler", "Doğal parklar"],
  },
  Mugla: {
    population: "1.1M", area: "12,654 km²", medianAge: 38.2, incomePerCapita: "₺420,000",
    avgPricePerSqm: 78000, annualGrowth: 28.5, rentalYield: 8.2,
    demandIndex: 90, marketingDays: 22, totalListings: 42500,
    description: "Türkiye'nin en yüksek değer artışına sahip bölgesi. Bodrum, Fethiye, Marmaris ve Datça ile turizm cenneti. Premium villa piyasası.",
    highlights: ["Bodrum Yalıkavak", "Marmaris", "Datça", "Yatırım Fırsatı"],
    districts: [
      { name: "Bodrum", avgPrice: 120000, growth: 32.5, type: "Lüks" },
      { name: "Fethiye", avgPrice: 58000, growth: 24.2, type: "Turizm" },
      { name: "Marmaris", avgPrice: 65000, growth: 26.8, type: "Turizm" },
      { name: "Datça", avgPrice: 85000, growth: 29.1, type: "Özel" },
    ],
    transport: [
      { type: "Milas Havalimanı", desc: "Bodrum yakını" },
      { type: "Dalaman Havalimanı", desc: "Fethiye yakını" },
      { type: "Marina", desc: "Yat turizmi" },
    ],
    education: [
      { name: "Muğla Sıtkı Koçman Üni.", level: "Devlet" },
    ],
    hospitals: [
      { name: "Bodrum Devlet", type: "Devlet" },
      { name: "Acıbadem Bodrum", type: "Özel" },
    ],
    lifestyle: ["Yat turizmi", "Plajlar", "Doğa sporları", "Gurme restoranlar"],
  },
};

export default function CityGuide() {
  const { cityName } = useParams<{ cityName: string }>();
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollAnimation(0.05);
  const [activeTab, setActiveTab] = useState("overview");

  const city = cityName ? CITY_PROFILES[cityName] : null;
  const cityAuctions = useMemo(() => {
    if (!cityName) return [];
    return AUCTIONS.filter((a) => a.city === cityName).sort((a, b) => b.investmentScore - a.investmentScore);
  }, [cityName]);

  if (!city || !cityName) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Şehir Bulunamadı</h2>
          <p className="text-slate-500 mb-6">Aradığınız şehir rehberi mevcut değil.</p>
          <Button onClick={() => navigate("/sehirler")} className="bg-gradient-to-r from-blue-500 to-teal-400 text-white">
            Tüm Şehirleri Gör
          </Button>
        </div>
      </div>
    );
  }

  const priceHistory = city.districts.map((d) => ({ district: d.name, price: d.avgPrice, growth: d.growth }));

  return (
    <div ref={ref} className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 mb-2">
            <ArrowLeft className="rtl:rotate-180 w-4 h-4" /> Geri
          </Button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                <MapPin className="w-8 h-8 text-blue-400" />
                {cityName} Şehir Rehberi
              </h1>
              <p className="mt-2 max-w-2xl">{city.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {city.highlights.map((h) => (
                <Badge key={h} className="bg-blue-500/10 text-blue-400 border-blue-500/20">{h}</Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <Card className="border-slate-200/80 p-4">
            <div className="flex items-center gap-2 mb-2"><Users className="w-5 h-5 text-blue-400" /><span className="text-sm text-slate-400">Nüfus</span></div>
            <div className="text-2xl font-bold">{city.population}</div>
            <div className="text-xs text-slate-500">{city.area}</div>
          </Card>
          <Card className="border-slate-200/80 p-4">
            <div className="flex items-center gap-2 mb-2"><DollarSign className="w-5 h-5 text-emerald-400" /><span className="text-sm text-slate-400">m² Fiyat</span></div>
            <div className="text-2xl font-bold text-emerald-400">₺{city.avgPricePerSqm.toLocaleString()}</div>
            <div className="text-xs text-emerald-400">+{city.annualGrowth}% yıllık</div>
          </Card>
          <Card className="border-slate-200/80 p-4">
            <div className="flex items-center gap-2 mb-2"><Percent className="w-5 h-5 text-violet-400" /><span className="text-sm text-slate-400">Kira Getirisi</span></div>
            <div className="text-2xl font-bold text-violet-400">%{city.rentalYield}</div>
            <div className="text-xs text-slate-500">Ortalama</div>
          </Card>
          <Card className="border-slate-200/80 p-4">
            <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-5 h-5 text-amber-400" /><span className="text-sm text-slate-400">Talep Endeksi</span></div>
            <div className="text-2xl font-bold text-amber-400">{city.demandIndex}/100</div>
            <div className="text-xs text-slate-500">{city.marketingDays} gün satış</div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { key: "overview", label: "Genel Bakış", icon: <BarChart3 className="w-4 h-4" /> },
            { key: "districts", label: "Semtler", icon: <MapPin className="w-4 h-4" /> },
            { key: "auctions", label: `İlanlar (${cityAuctions.length})`, icon: <Home className="w-4 h-4" /> },
            { key: "transport", label: "Ulaşım", icon: <Navigation className="w-4 h-4" /> },
            { key: "lifestyle", label: "Yaşam", icon: <Heart className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.key ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25" : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Price Chart */}
            <Card className="border-slate-200/80 p-5">
              <h3 className="text-lg font-bold mb-4">Semt Bazında m² Fiyatları</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="district" stroke="#71717a" fontSize={11} />
                    <YAxis stroke="#71717a" fontSize={11} tickFormatter={(v) => `₺${(v/1000).toFixed(0)}K`} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                    <Bar dataKey="price" name="m² Fiyat (₺)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Growth Chart */}
            <Card className="border-slate-200/80 p-5">
              <h3 className="text-lg font-bold mb-4">Yıllık Değer Artışı (%)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ReLineChart data={priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="district" stroke="#71717a" fontSize={11} />
                    <YAxis stroke="#71717a" fontSize={11} unit="%" />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                    <Line type="monotone" dataKey="growth" name="Artış %" stroke="#10b981" strokeWidth={3} dot={{ r: 5, fill: "#10b981" }} />
                  </ReLineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Info Grid */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="border-slate-200/80 p-4">
                <div className="flex items-center gap-2 mb-3"><GraduationCap className="w-5 h-5 text-blue-400" /><h4 className="font-bold">Eğitim</h4></div>
                <div className="space-y-2">
                  {city.education.map((e) => (
                    <div key={e.name} className="flex justify-between text-sm">
                      <span>{e.name}</span>
                      <span className="text-slate-500">{e.level}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="border-slate-200/80 p-4">
                <div className="flex items-center gap-2 mb-3"><Heart className="w-5 h-5 text-pink-400" /><h4 className="font-bold">Hastaneler</h4></div>
                <div className="space-y-2">
                  {city.hospitals.map((h) => (
                    <div key={h.name} className="flex justify-between text-sm">
                      <span>{h.name}</span>
                      <span className="text-slate-500">{h.type}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="border-slate-200/80 p-4">
                <div className="flex items-center gap-2 mb-3"><Star className="w-5 h-5 text-amber-400" /><h4 className="font-bold">Yaşam Tarzı</h4></div>
                <div className="flex flex-wrap gap-2">
                  {city.lifestyle.map((l) => (
                    <span key={l} className="px-2.5 py-1 rounded-lg bg-white/5 text-xs">{l}</span>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "districts" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {city.districts.map((d) => (
              <Card key={d.name} className="border-slate-200/80 p-4 hover:border-blue-500/20 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-lg">{d.name}</h4>
                  <Badge className="bg-blue-500/10 text-blue-400">{d.type}</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">m² Fiyat</span>
                    <span className="font-semibold">₺{d.avgPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Yıllık Artış</span>
                    <span className="text-emerald-400 font-semibold">+{d.growth}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 mt-2">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500" style={{ width: `${Math.min(d.growth * 2, 100)}%` }} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "auctions" && (
          <div className="space-y-4">
            {cityAuctions.length === 0 ? (
              <div className="text-center py-16">
                <Home className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500">Bu şehirde henüz ilan bulunmuyor.</p>
              </div>
            ) : (
              cityAuctions.map((auction) => (
                <Card key={auction.id} className="border-slate-200/80 hover:border-blue-500/20 transition-all cursor-pointer" onClick={() => navigate(`/ilan/${auction.id}`)}>
                  <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                    <img loading="lazy" src={auction.images[0]} alt="" className="w-full sm:w-40 h-24 object-cover rounded-xl flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-bold">{auction.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                            <MapPin className="w-3.5 h-3.5" /> {auction.location}
                          </div>
                        </div>
                        <Badge className={auction.investmentScore >= 85 ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"}>
                          AI {auction.investmentScore}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-sm font-bold text-blue-400">₺{auction.currentBid.toLocaleString("tr-TR")}</span>
                        <span className="text-sm text-emerald-400 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> %{auction.areaStats.rentalYield} getiri</span>
                        <span className="text-sm text-slate-500">{auction.bidderCount} teklif</span>
                      </div>
                      <ListingDocumentFooter auction={auction} compact showTopRule={false} />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === "transport" && (
          <div className="grid md:grid-cols-2 gap-4">
            {city.transport.map((t) => (
              <Card key={t.type} className="border-slate-200/80 p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Bus className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold">{t.type}</h4>
                  <p className="text-sm text-slate-400">{t.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "lifestyle" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {city.lifestyle.map((item, idx) => (
              <Card key={idx} className="border-slate-200/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-pink-400" />
                  </div>
                  <span className="font-medium">{item}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
