import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Clock, Users, TrendingUp, MapPin, Flame, Calendar, BarChart3, GitCompare, Star, Filter, X, ChevronDown, Search, Heart, LayoutGrid, Map } from "lucide-react";
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
import { LoadingSkeletonGrid } from "@/components/async";
import type { Auction } from "@/types/auction";
import { AuctionsMapPanel } from "@/components/maps/ListingMapViews";
import { ListingFeaturedBadge } from "@/components/listing/ListingFeaturedBadge";
import { BenimIcinBulPanel } from "@/components/listing/BenimIcinBulPanel";

type DealFilter = "all" | "sale" | "rent";
type StatusFilter = "all" | "live" | "upcoming" | "ended";
const ROOM_OPTIONS = ["all", "1+0", "2+1", "3+1", "4+1", "5+"] as const;
type RoomFilter = (typeof ROOM_OPTIONS)[number];

function resolveDealType(a: Pick<Auction, "dealType" | "category">): "sale" | "rent" {
  return a.dealType ?? (a.category === "Kiralık" ? "rent" : "sale");
}

function parseDealFilter(value: string | null): DealFilter {
  if (value === "sale" || value === "rent") return value;
  return "all";
}

function parseStatusFilter(value: string | null): StatusFilter {
  if (value === "live" || value === "upcoming" || value === "ended") return value;
  return "all";
}

function parseRoomFilter(value: string | null): RoomFilter {
  if (value && ROOM_OPTIONS.includes(value as RoomFilter)) return value as RoomFilter;
  return "all";
}

function matchesRoomFilter(roomCount: string, roomFilter: RoomFilter): boolean {
  if (roomFilter === "all") return true;
  const rc = roomCount.trim();
  if (roomFilter === "5+") return /^[5-9]\+/.test(rc);
  return rc.startsWith(roomFilter) || rc.includes(roomFilter);
}

function readFiltersFromParams(params: URLSearchParams) {
  const min = Number(params.get("min") ?? "0");
  const max = Number(params.get("max") ?? "200000000");
  return {
    filter: parseStatusFilter(params.get("status")),
    priceRange: [
      Number.isFinite(min) ? min : 0,
      Number.isFinite(max) ? max : 200000000,
    ] as [number, number],
    selectedCity: params.get("city") || "all",
    dealTypeFilter: parseDealFilter(params.get("deal")),
    selectedCategory: params.get("cat") || "all",
    selectedRoom: parseRoomFilter(params.get("room")),
    searchQuery: params.get("q") || "",
  };
}

function buildParamsFromFilters(input: ReturnType<typeof readFiltersFromParams>): URLSearchParams {
  const next = new URLSearchParams();
  if (input.filter !== "all") next.set("status", input.filter);
  if (input.dealTypeFilter !== "all") next.set("deal", input.dealTypeFilter);
  if (input.selectedCity !== "all") next.set("city", input.selectedCity);
  if (input.selectedCategory !== "all") next.set("cat", input.selectedCategory);
  if (input.selectedRoom !== "all") next.set("room", input.selectedRoom);
  if (input.searchQuery.trim()) next.set("q", input.searchQuery.trim());
  if (input.priceRange[0] > 0) next.set("min", String(input.priceRange[0]));
  if (input.priceRange[1] < 200000000) next.set("max", String(input.priceRange[1]));
  return next;
}

export function Auctions({
  hideIntro = false,
  layout = "home",
}: {
  /** Tam sayfa `/ihaleler` için üst başlık gizlenir */
  hideIntro?: boolean;
  layout?: "home" | "page";
}) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilters = layout === "page" ? readFiltersFromParams(searchParams) : null;
  const { ref, isVisible } = useScrollAnimation(0.1);
  const [filter, setFilter] = useState<StatusFilter>(initialFilters?.filter ?? "all");
  const [selectedAuction, setSelectedAuction] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>(initialFilters?.priceRange ?? [0, 200000000]);
  const [selectedCity, setSelectedCity] = useState(initialFilters?.selectedCity ?? "all");
  const [dealTypeFilter, setDealTypeFilter] = useState<DealFilter>(initialFilters?.dealTypeFilter ?? "all");
  const [selectedCategory, setSelectedCategory] = useState(initialFilters?.selectedCategory ?? "all");
  const [selectedRoom, setSelectedRoom] = useState<RoomFilter>(initialFilters?.selectedRoom ?? "all");
  const [searchQuery, setSearchQuery] = useState(initialFilters?.searchQuery ?? "");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [catalog, setCatalog] = useState(() => getLocalAndStaticAuctions());
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const skipParamReadRef = useRef(false);

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

  useEffect(() => {
    if (layout !== "page") return;
    if (skipParamReadRef.current) {
      skipParamReadRef.current = false;
      return;
    }
    const parsed = readFiltersFromParams(searchParams);
    setFilter(parsed.filter);
    setPriceRange(parsed.priceRange);
    setSelectedCity(parsed.selectedCity);
    setDealTypeFilter(parsed.dealTypeFilter);
    setSelectedCategory(parsed.selectedCategory);
    setSelectedRoom(parsed.selectedRoom);
    setSearchQuery(parsed.searchQuery);
  }, [searchParams, layout]);

  const syncUrlFromFilters = useCallback(() => {
    if (layout !== "page") return;
    const next = buildParamsFromFilters({
      filter,
      priceRange,
      selectedCity,
      dealTypeFilter,
      selectedCategory,
      selectedRoom,
      searchQuery,
    });
    if (next.toString() === searchParams.toString()) return;
    skipParamReadRef.current = true;
    setSearchParams(next, { replace: true });
  }, [
    layout,
    filter,
    priceRange,
    selectedCity,
    dealTypeFilter,
    selectedCategory,
    selectedRoom,
    searchQuery,
    searchParams,
    setSearchParams,
  ]);

  useEffect(() => {
    syncUrlFromFilters();
  }, [syncUrlFromFilters]);

  const cities = useMemo(() => [...new Set(catalog.map((a) => a.city))], [catalog]);
  const categories = useMemo(() => [...new Set(catalog.map((a) => a.category))].sort(), [catalog]);
  const filtered = useMemo(() => {
    const rows = catalog.filter((a) => {
      if (filter !== "all" && a.status !== filter) return false;
      if (a.currentBid < priceRange[0] || a.currentBid > priceRange[1]) return false;
      if (selectedCity !== "all" && a.city !== selectedCity) return false;
      if (dealTypeFilter !== "all" && resolveDealType(a) !== dealTypeFilter) return false;
      if (selectedCategory !== "all" && a.category !== selectedCategory) return false;
      if (!matchesRoomFilter(a.propertyDetails?.roomCount ?? "", selectedRoom)) return false;
      if (searchQuery) {
        const sq = searchQuery.toLowerCase();
        const inTitle = a.title.toLowerCase().includes(sq);
        const inNo = getListingNumber(a).toLowerCase().includes(sq);
        if (!inTitle && !inNo) return false;
      }
      return true;
    });
    return rows.sort((a, b) => {
      const af = a.isFeatured ? 1 : 0;
      const bf = b.isFeatured ? 1 : 0;
      if (af !== bf) return bf - af;
      return (b.viewCount ?? 0) - (a.viewCount ?? 0);
    });
  }, [catalog, filter, priceRange, selectedCity, dealTypeFilter, selectedCategory, selectedRoom, searchQuery]);

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
  const isHome = layout === "home";

  return (
    <section id="auctions" className={sectionPad} data-demo="true">
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
          <LoadingSkeletonGrid count={6} className="mb-6" />
        ) : null}

        <div className={`mb-8 transition-all duration-700 delay-100 ${isVisible ? "opacity-100" : "opacity-0"}`}>
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Konum, kelime veya ilan no (ILN-...)" className={isHome ? "pl-10 bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text)]" : "pl-10 bg-slate-900/50 border-white/10 text-white placeholder:text-slate-600"} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["all", "live", "upcoming", "ended"] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f ? "btn-primary !py-2 !px-4" : isHome ? "bg-[var(--color-bg-soft)] text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-card)]" : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"}`}>
                  {f === "all" ? "Tümü" : f === "live" ? "Canlı" : f === "upcoming" ? "Yaklaşan" : "Tamamlandı"}
                </button>
              ))}
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className={`gap-2 ${isHome ? "btn-ghost" : "border-white/10 text-slate-400 hover:text-white hover:bg-white/5"}`}>
                <Filter className="w-4 h-4" /> {showFilters ? <X className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode((v) => (v === "list" ? "map" : "list"))}
                className={`gap-2 ${isHome ? "btn-ghost" : "border-white/10 text-slate-400 hover:text-white hover:bg-white/5"}`}
                aria-pressed={viewMode === "map"}
              >
                {viewMode === "list" ? <Map className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
                {viewMode === "list" ? "Harita" : "Liste"}
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className={`mt-4 p-5 rounded-2xl grid md:grid-cols-2 lg:grid-cols-4 gap-5 animate-scale-in ${isHome ? "card-warm" : "bg-slate-900/50 border border-white/5"}`}>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">İşlem Tipi</label>
                <select value={dealTypeFilter} onChange={(e) => setDealTypeFilter(parseDealFilter(e.target.value))} className={`w-full px-3 py-2 rounded-lg border text-sm ${isHome ? "bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text)]" : "bg-slate-950 border-white/10 text-white"}`}>
                  <option value="all">Satılık + Kiralık</option>
                  <option value="sale">Satılık</option>
                  <option value="rent">Kiralık</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Fiyat Aralığı</label>
                <Slider value={priceRange} onValueChange={(v) => setPriceRange(v as [number, number])} max={200000000} step={1000000} className="w-full" />
                <div className="flex justify-between text-xs text-slate-500 mt-2"><span>₺{(priceRange[0] / 1000000).toFixed(0)}M</span><span>₺{(priceRange[1] / 1000000).toFixed(0)}M</span></div>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Şehir</label>
                <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-sm ${isHome ? "bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text)]" : "bg-slate-950 border-white/10 text-white"}`}>
                  <option value="all">Tüm Şehirler</option>
                  {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Mülk Tipi</label>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className={`w-full px-3 py-2 rounded-lg border text-sm ${isHome ? "bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text)]" : "bg-slate-950 border-white/10 text-white"}`}>
                  <option value="all">Tüm Tipler</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Oda</label>
                <select value={selectedRoom} onChange={(e) => setSelectedRoom(parseRoomFilter(e.target.value))} className={`w-full px-3 py-2 rounded-lg border text-sm ${isHome ? "bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text)]" : "bg-slate-950 border-white/10 text-white"}`}>
                  <option value="all">Tümü</option>
                  {ROOM_OPTIONS.filter((r) => r !== "all").map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex items-end justify-end md:col-span-2 lg:col-span-4">
                <button onClick={() => { setPriceRange([0, 200000000]); setSelectedCity("all"); setDealTypeFilter("all"); setSelectedCategory("all"); setSelectedRoom("all"); setSearchQuery(""); setFilter("all"); }} className="text-xs text-slate-500 hover:text-blue-400 transition-colors">Filtreleri Temizle</button>
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

        {layout === "page" && !catalogLoading ? (
          <div className="mb-8">
            <BenimIcinBulPanel catalog={catalog} />
          </div>
        ) : null}

        {viewMode === "map" ? (
          <AuctionsMapPanel auctions={filtered} className="mb-8" />
        ) : null}

        {viewMode === "list" ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((auction, idx) => (
            <Card key={auction.id} className={`property-card group overflow-hidden card-luxury !p-0 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: `${idx * 100}ms` }}>
              <div className="relative h-52 overflow-hidden">
                <ListingCoverImage src={auction.images[0]} alt={auction.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className={`absolute inset-0 bg-gradient-to-t ${isHome ? "from-black/50" : "from-slate-950"} via-transparent to-transparent`} />
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                  <ListingFeaturedBadge isFeatured={auction.isFeatured} badge={auction.featuredBadge} />
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
                <h3 onClick={() => navigate(`/ilan/${auction.id}`)} className={`text-base font-bold line-clamp-2 transition-colors cursor-pointer ${isHome ? "hover:text-[var(--color-primary)]" : "text-white group-hover:text-blue-400"}`} style={isHome ? { color: "var(--color-text)" } : undefined}>{auction.title}</h3>
                <div className="flex items-center gap-2 text-sm mt-1" style={{ color: "var(--color-text-muted)" }}><MapPin className="w-3.5 h-3.5" />{auction.location}</div>
                <div className={`flex items-center gap-2 mb-3 mt-2 p-2.5 rounded-lg border ${isHome ? "bg-[var(--color-bg-soft)] border-[var(--color-border)]" : "bg-white/[0.03] border-white/5"}`}>
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">AI Değerleme</span><span className="text-blue-400 font-semibold">₺{(auction.aiPredictedPrice / 1000000).toFixed(1)}M</span></div>
                    <div className={`h-1.5 rounded-full overflow-hidden ${isHome ? "bg-[var(--color-border)]" : "bg-white/10"}`}><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-400" style={{ width: `${Math.min((auction.currentBid / auction.aiPredictedPrice) * 100, 100)}%` }} /></div>
                  </div>
                </div>
                <div className={`flex flex-wrap items-end justify-between gap-3 pt-4 border-t ${isHome ? "border-[var(--color-border)]" : "border-white/5"}`}>
                  <div>
                    <div className="text-xs text-slate-500 mb-0.5">Güncel Teklif</div>
                    <div className="text-lg font-bold text-blue-400">₺{auction.currentBid.toLocaleString("tr-TR")}</div>
                    <div className="text-xs text-slate-600">₺{auction.pricePerSqm.toLocaleString("tr-TR")}/m²</div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-2"><span className="flex items-center gap-1"><Users className="w-3 h-3" />{auction.bidderCount}</span>{auction.status === "live" && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{Math.max(0, Math.floor((new Date(auction.endDate).getTime() - Date.now()) / 3600000))}s</span>}</div>
                    <div className="flex gap-1.5">
                      {isHome ? (
                        <>
                          <button type="button" onClick={() => navigate(`/ilan/${auction.id}`)} className="btn-ghost text-xs h-8 px-3 inline-flex items-center">Detaylar</button>
                          <button type="button" onClick={() => { setSelectedAuction(auction); setBidAmount((auction.currentBid + 50000).toString()); }} className="btn-primary text-xs h-8 px-3 inline-flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" />Teklif Ver</button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => navigate(`/ilan/${auction.id}`)} className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5 text-xs h-8 px-3">Detaylar</Button>
                          <Button size="sm" onClick={() => { setSelectedAuction(auction); setBidAmount((auction.currentBid + 50000).toString()); }} className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-400 hover:to-teal-300 text-white font-semibold text-xs h-8 px-3"><TrendingUp className="w-3.5 h-3.5 mr-1" />Teklif Ver</Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <ListingDocumentFooter auction={auction} />
              </CardContent>
            </Card>
          ))}
        </div>
        ) : null}

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
                setDealTypeFilter("all");
                setSelectedCategory("all");
                setSelectedRoom("all");
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