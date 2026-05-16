import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Users, TrendingUp, MapPin, Flame, Calendar, BarChart3, GitCompare, Star, Filter, X, ChevronDown, Search, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useFavorites } from "@/hooks/useFavorites";
import { getLocalAndStaticAuctions, loadAllAuctionsForSearch } from "@/lib/auctionsSource";
import { ListingDocumentFooter } from "@/components/ListingDocumentFooter";
import { ListingCoverImage } from "@/components/ListingCoverImage";
import { ListingNumberBadge } from "@/components/ListingNumberBadge";
import { getListingNumber } from "@/lib/listingNumber";

export function Auctions({
  hideIntro = false,
  layout = "home",
}: {
  /** Tam sayfa `/ihaleler` için üst başlık gizlenir */
  hideIntro?: boolean;
  layout?: "home" | "page";
}) {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollAnimation(0.1);
  const [filter, setFilter] = useState<"all" | "live" | "upcoming" | "ended">("all");
  const [selectedAuction, setSelectedAuction] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000000]);
  const [selectedCity, setSelectedCity] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [catalog, setCatalog] = useState(() => getLocalAndStaticAuctions());
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  useEffect(() => {
    let ok = true;
    setCatalogLoading(true);
    setCatalogError(null);
    void loadAllAuctionsForSearch()
      .then((rows) => {
        if (ok) setCatalog(rows);
      })
      .catch(() => {
        if (ok) {
          setCatalogError("Uzak liste alınamadı; yerel demo kayıtları gösteriliyor.");
          setCatalog(getLocalAndStaticAuctions());
        }
      })
      .finally(() => {
        if (ok) setCatalogLoading(false);
      });
    return () => {
      ok = false;
    };
  }, []);

  const cities = useMemo(() => [...new Set(catalog.map((a) => a.city))], [catalog]);
  const filtered = useMemo(() => {
    return catalog.filter((a) => {
      if (filter !== "all" && a.status !== filter) return false;
      if (a.currentBid < priceRange[0] || a.currentBid > priceRange[1]) return false;
      if (selectedCity !== "all" && a.city !== selectedCity) return false;
      if (searchQuery) {
        const sq = searchQuery.toLowerCase();
        const inTitle = a.title.toLowerCase().includes(sq);
        const inNo = getListingNumber(a).toLowerCase().includes(sq);
        if (!inTitle && !inNo) return false;
      }
      return true;
    });
  }, [catalog, filter, priceRange, selectedCity, searchQuery]);

  const { toggleFavorite, isFavorite } = useFavorites();

  const handleBid = () => {
    if (!selectedAuction || !bidAmount) return;
    setSelectedAuction(null);
    setBidAmount("");
  };

  const handleFavoriteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    toggleFavorite(id);
  };

  const toggleCompare = (id: string) => {
    setCompareList((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const sectionPad = layout === "page" ? "relative py-10 lg:py-14" : "relative py-24 lg:py-32";

  return (
    <section id="auctions" className={sectionPad} data-demo="true">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-transparent to-slate-100/60 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px]" />

      <div ref={ref} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!hideIntro && (
          <div className={`text-center mb-10 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <h2 className="section-heading mb-4">Canlı İhaleler</h2>
            <p className="section-subtitle mx-auto">
              Güncel gayrimenkul ve yatırım fırsatlarına göz atın. AI değerleme ve yatırım skoru ile en doğru fırsatları bulun.
            </p>
          </div>
        )}

        {catalogError ? (
          <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100" role="status">
            {catalogError}
          </p>
        ) : null}
        {catalogLoading ? (
          <p className="mb-6 text-sm text-slate-500" aria-live="polite">
            İlanlar yükleniyor…
          </p>
        ) : null}

        <div className={`mb-8 transition-all duration-700 delay-100 ${isVisible ? "opacity-100" : "opacity-0"}`}>
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Konum, kelime veya ilan no (ILN-...)" className="pl-10 bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["all", "live", "upcoming", "ended"] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f ? "bg-gradient-to-r from-blue-500 to-teal-400 text-white shadow-lg shadow-blue-500/20" : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"}`}>
                  {f === "all" ? "Tümü" : f === "live" ? "Canlı" : f === "upcoming" ? "Yaklaşan" : "Tamamlandı"}
                </button>
              ))}
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="border-white/10 text-slate-400 hover:text-white hover:bg-white/5 gap-2">
                <Filter className="w-4 h-4" /> {showFilters ? <X className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 p-5 rounded-2xl bg-slate-900/50 border border-white/5 grid md:grid-cols-3 gap-5 animate-scale-in">
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Fiyat Aralığı</label>
                <Slider value={priceRange} onValueChange={(v) => setPriceRange(v as [number, number])} max={200000000} step={1000000} className="w-full" />
                <div className="flex justify-between text-xs text-slate-500 mt-2"><span>₺{(priceRange[0] / 1000000).toFixed(0)}M</span><span>₺{(priceRange[1] / 1000000).toFixed(0)}M</span></div>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Şehir</label>
                <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-sm text-white">
                  <option value="all">Tüm Şehirler</option>
                  {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-end justify-end">
                <button onClick={() => { setPriceRange([0, 200000000]); setSelectedCity("all"); setSearchQuery(""); }} className="text-xs text-slate-500 hover:text-blue-400 transition-colors">Filtreleri Temizle</button>
              </div>
            </div>
          )}

          {compareList.length > 0 && (
            <div className="mt-3 flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 animate-fade-in">
              <GitCompare className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-400">{compareList.length} ilan seçildi</span>
              <Button size="sm" onClick={() => navigate(`/karsilastir?ids=${compareList.join(",")}`)} className="bg-gradient-to-r from-blue-500 to-teal-400 text-white text-xs h-7">Karşılaştır</Button>
              <button onClick={() => setCompareList([])} className="text-xs text-slate-500 hover:text-white ml-auto">Temizle</button>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((auction, idx) => (
            <Card key={auction.id} className={`group bg-white/[0.06] backdrop-blur-xl border border-white/10 overflow-hidden hover:border-cyan-400/25 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-500/10 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: `${idx * 100}ms` }}>
              <div className="relative h-52 overflow-hidden">
                <ListingCoverImage src={auction.images[0]} alt={auction.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <div className="absolute top-3 left-3 flex gap-2">
                  {auction.status === "live" && <Badge className="bg-red-500/90 text-white gap-1 animate-pulse"><Flame className="w-3 h-3" /> Canlı</Badge>}
                  {auction.status === "upcoming" && <Badge variant="outline" className="border-sky-500/30 text-sky-400 gap-1"><Calendar className="w-3 h-3" /> Yaklaşan</Badge>}
                  <Badge variant="outline" className={`gap-1 text-xs ${auction.investmentScore >= 85 ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : auction.investmentScore >= 70 ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-slate-500/20 text-slate-400 border-slate-500/30"}`}><Star className="w-3 h-3" /> {auction.investmentScore}</Badge>
                </div>
                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); toggleCompare(auction.id); }} className={`p-2 rounded-lg backdrop-blur-md transition-colors ${compareList.includes(auction.id) ? "bg-blue-500 text-white" : "bg-black/50 text-white hover:bg-black/70"}`}><GitCompare className="w-4 h-4" /></button>
                  <button onClick={(e) => handleFavoriteClick(e, auction.id)} className={`p-2 rounded-lg backdrop-blur-md transition-colors ${isFavorite(auction.id) ? "bg-pink-500 text-white" : "bg-black/50 text-white hover:bg-black/70"}`}><Heart className={`w-4 h-4 ${isFavorite(auction.id) ? "fill-current" : ""}`} /></button>
                </div>
              </div>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <ListingNumberBadge auction={auction} compact />
                </div>
                <h3 onClick={() => navigate(`/ilan/${auction.id}`)} className="text-base font-bold text-white line-clamp-2 group-hover:text-blue-400 transition-colors cursor-pointer">{auction.title}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1"><MapPin className="w-3.5 h-3.5" />{auction.location}</div>
                <div className="flex items-center gap-2 mb-3 mt-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">AI Değerleme</span><span className="text-blue-400 font-semibold">₺{(auction.aiPredictedPrice / 1000000).toFixed(1)}M</span></div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-400" style={{ width: `${Math.min((auction.currentBid / auction.aiPredictedPrice) * 100, 100)}%` }} /></div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div>
                    <div className="text-xs text-slate-500 mb-0.5">Güncel Teklif</div>
                    <div className="text-lg font-bold text-blue-400">₺{auction.currentBid.toLocaleString("tr-TR")}</div>
                    <div className="text-xs text-slate-600">₺{auction.pricePerSqm.toLocaleString("tr-TR")}/m²</div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-2"><span className="flex items-center gap-1"><Users className="w-3 h-3" />{auction.bidderCount}</span>{auction.status === "live" && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{Math.max(0, Math.floor((new Date(auction.endDate).getTime() - Date.now()) / 3600000))}s</span>}</div>
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => navigate(`/ilan/${auction.id}`)} className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-xs h-8 px-3">Detaylar</Button>
                      <Button size="sm" onClick={() => { setSelectedAuction(auction); setBidAmount((auction.currentBid + 50000).toString()); }} className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-400 hover:to-teal-300 text-white font-semibold text-xs h-8 px-3"><TrendingUp className="w-3.5 h-3.5 mr-1" />Teklif Ver</Button>
                    </div>
                  </div>
                </div>
                <ListingDocumentFooter auction={auction} />
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && !catalogLoading && (
          <div className="text-center py-20 animate-fade-in rounded-2xl border border-white/10 bg-slate-950/30 px-4">
            <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" aria-hidden />
            <p className="text-slate-300 font-medium mb-1">Bu filtrelerle ilan bulunamadı.</p>
            <p className="text-sm text-slate-500 mb-6">Aramayı veya fiyat aralığını genişletmeyi deneyin.</p>
            <Button
              type="button"
              variant="outline"
              className="border-white/15 text-slate-200"
              onClick={() => {
                setFilter("all");
                setPriceRange([0, 200000000]);
                setSelectedCity("all");
                setSearchQuery("");
              }}
            >
              Filtreleri sıfırla
            </Button>
          </div>
        )}
      </div>

      <Dialog open={!!selectedAuction} onOpenChange={() => setSelectedAuction(null)}>
        <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-md">
          <DialogHeader><DialogTitle className="text-xl font-bold">Teklif Ver</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-3 rounded-xl bg-white/5">
              <p className="text-sm text-slate-400">{selectedAuction?.title}</p>
              <p className="text-lg font-bold text-blue-400 mt-1">₺{selectedAuction?.currentBid?.toLocaleString("tr-TR")}</p>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[10000, 50000, 100000, 250000, 500000].map((inc) => (
                <button key={inc} onClick={() => setBidAmount((selectedAuction?.currentBid + inc).toString())} className="px-2 py-2 rounded-lg bg-white/5 hover:bg-blue-500/20 text-xs font-semibold text-white transition-colors">+₺{(inc / 1000).toFixed(0)}K</button>
              ))}
            </div>
            <div><label className="text-sm text-slate-400 mb-1.5 block">Teklif Tutarı (₺)</label><Input type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} className="bg-slate-950 border-white/10 text-white focus:ring-blue-500" placeholder="örn: 3000000" /></div>
          </div>
          <DialogFooter><Button onClick={handleBid} className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-400 hover:to-teal-300 text-white font-bold">Teklif Ver</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}