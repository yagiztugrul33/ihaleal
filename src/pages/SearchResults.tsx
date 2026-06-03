import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, MapPin, Home, Search, SlidersHorizontal, Grid3x3, MapIcon, X, Building2, Gavel, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLocalAndStaticAuctions, loadAllAuctionsForSearch } from "@/lib/auctionsSource";
import { ListingDocumentFooter } from "@/components/ListingDocumentFooter";
import { ListingNumberBadge } from "@/components/ListingNumberBadge";
import { getListingNumber } from "@/lib/listingNumber";
import { LoadingSkeletonGrid, EmptyState } from "@/components/async";
import { useLocale } from "@/contexts/LocaleContext";
import { useSavedSearches } from "@/hooks/useSavedSearches";
import { SavedSearchesPanel } from "@/components/search/SavedSearchesPanel";
import { SearchFilterChips } from "@/components/search/SearchFilterChips";
import { SearchAutocomplete } from "@/components/search/SearchAutocomplete";
import { MapPolygonSearch } from "@/components/search/MapPolygonSearch";
import { PageBreadcrumbs } from "@/components/seo/PageBreadcrumbs";
import { encodePolygonParam, parsePolygonParam, pointInPolygon } from "@/lib/geo/pointInPolygon";
import { cn } from "@/lib/utils";

function normalize(s: string) {
  return s.trim().toLowerCase();
}

const PAGE_SIZE = 12;
type SortKey = "relevance" | "price_asc" | "price_desc" | "date_desc" | "popularity" | "sqm_desc";
type ViewMode = "grid" | "list" | "map";

// Mülk tip taksonomisi — mevcut Auction.category alanından heuristic eşleme.
const PROPERTY_TYPES = [
  { key: "konut", label: "Konut (Daire+Villa)", match: ["daire", "villa", "konut", "rezidans", "stüdyo", "ev"] },
  { key: "ticari", label: "Ticari (Ofis+Dükkan)", match: ["ofis", "dükkan", "iş yeri", "ticari", "plaza", "mağaza"] },
  { key: "arsa", label: "Arsa", match: ["arsa", "imar"] },
  { key: "tarla", label: "Tarla", match: ["tarla", "tarım"] },
  { key: "diger", label: "Diğer", match: [] },
] as const;
type PropertyType = (typeof PROPERTY_TYPES)[number]["key"];

function classifyType(category: string): PropertyType {
  const c = normalize(category);
  for (const t of PROPERTY_TYPES) {
    if (t.match.some((m) => c.includes(m))) return t.key;
  }
  return "diger";
}

const AUCTION_MODES = [
  { key: "auction", label: "Açık artırma", icon: Gavel },
  { key: "sealed_offers", label: "Kapalı teklif", icon: Eye },
  { key: "listing_only", label: "Sadece ilan", icon: Building2 },
] as const;
type AuctionMode = (typeof AUCTION_MODES)[number]["key"];

const AUCTION_STATUS = [
  { key: "live", label: "Devam eden" },
  { key: "upcoming", label: "Yaklaşan" },
  { key: "ended", label: "Biten" },
] as const;
type AuctionStatus = (typeof AUCTION_STATUS)[number]["key"];

function parseSort(v: string | null): SortKey {
  if (v === "price_asc" || v === "price_desc" || v === "date_desc" || v === "popularity" || v === "sqm_desc") return v;
  return "relevance";
}
function parseView(v: string | null): ViewMode {
  return v === "map" || v === "list" ? v : "grid";
}
function parseNumber(v: string | null): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}
function parseSet<T extends string>(v: string | null, valid: readonly T[]): T[] {
  if (!v) return [];
  return v.split(",").filter((x): x is T => (valid as readonly string[]).includes(x));
}

function formatTRY(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M ₺`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K ₺`;
  return `${value.toLocaleString("tr-TR")} ₺`;
}

export default function SearchResults() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const c = t.common;
  const [params, setParams] = useSearchParams();
  const initialQ = params.get("q") || "";
  const [query, setQuery] = useState(initialQ);
  const [catalog, setCatalog] = useState(() => getLocalAndStaticAuctions());
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setQuery(params.get("q") || "");
  }, [params]);

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
          setCatalogError(c.errorLoad);
          setCatalog(getLocalAndStaticAuctions());
        }
      })
      .finally(() => {
        if (ok) setCatalogLoading(false);
      });
    return () => {
      ok = false;
    };
  }, [c.errorLoad]);

  // URL state — filtreler paylaşılabilir + saved-search ile uyumlu
  const sortKey = parseSort(params.get("sort"));
  const viewMode = parseView(params.get("view"));
  const page = Math.max(1, Number(params.get("page") || "1") || 1);
  const polygon = parsePolygonParam(params.get("poly"));
  const ptypes = parseSet<PropertyType>(params.get("ptype"), PROPERTY_TYPES.map((x) => x.key));
  const modes = parseSet<AuctionMode>(params.get("mode"), AUCTION_MODES.map((x) => x.key));
  const statuses = parseSet<AuctionStatus>(params.get("status"), AUCTION_STATUS.map((x) => x.key));
  const priceMin = parseNumber(params.get("pmin"));
  const priceMax = parseNumber(params.get("pmax"));
  const sqmMin = parseNumber(params.get("smin"));
  const sqmMax = parseNumber(params.get("smax"));
  const city = (params.get("city") || "").trim();
  const district = (params.get("district") || "").trim();

  // Mevcut katalogtan il/ilçe listesi (dinamik)
  const cityOptions = useMemo(() => {
    const set = new Set(catalog.map((a) => a.city).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "tr-TR"));
  }, [catalog]);
  const districtOptions = useMemo(() => {
    if (!city) return [];
    const set = new Set(catalog.filter((a) => a.city === city).map((a) => a.district).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "tr-TR"));
  }, [catalog, city]);

  const results = useMemo(() => {
    const q = normalize(query);
    const hasAnyFilter =
      q.length >= 2 ||
      polygon ||
      ptypes.length > 0 ||
      modes.length > 0 ||
      statuses.length > 0 ||
      priceMin !== undefined ||
      priceMax !== undefined ||
      sqmMin !== undefined ||
      sqmMax !== undefined ||
      city ||
      district;
    if (!hasAnyFilter) return [];
    let filtered = catalog;
    if (q.length >= 2) {
      filtered = filtered.filter((a) => {
        const ln = normalize(getListingNumber(a));
        return (
          normalize(a.title).includes(q) ||
          normalize(a.location).includes(q) ||
          normalize(a.city).includes(q) ||
          normalize(a.district).includes(q) ||
          normalize(a.category).includes(q) ||
          ln.includes(q) ||
          (a.tags && a.tags.some((tag) => normalize(tag).includes(q)))
        );
      });
    }
    if (polygon) {
      filtered = filtered.filter((a) => pointInPolygon(a.mapLat, a.mapLng, polygon));
    }
    if (ptypes.length > 0) {
      filtered = filtered.filter((a) => ptypes.includes(classifyType(a.category)));
    }
    if (modes.length > 0) {
      filtered = filtered.filter((a) => {
        const m = a.marketingMode ?? (a.negotiationMode === "sealed_offer" ? "sealed_offers" : "auction");
        return modes.includes(m as AuctionMode);
      });
    }
    if (statuses.length > 0) {
      filtered = filtered.filter((a) => statuses.includes(a.status as AuctionStatus));
    }
    if (priceMin !== undefined) filtered = filtered.filter((a) => a.currentBid >= priceMin);
    if (priceMax !== undefined) filtered = filtered.filter((a) => a.currentBid <= priceMax);
    if (sqmMin !== undefined) filtered = filtered.filter((a) => (a.propertyDetails?.grossSqm ?? 0) >= sqmMin);
    if (sqmMax !== undefined) filtered = filtered.filter((a) => (a.propertyDetails?.grossSqm ?? 0) <= sqmMax);
    if (city) filtered = filtered.filter((a) => a.city === city);
    if (district) filtered = filtered.filter((a) => a.district === district);
    return filtered;
  }, [query, catalog, polygon, ptypes, modes, statuses, priceMin, priceMax, sqmMin, sqmMax, city, district]);

  const sortedResults = useMemo(() => {
    const copy = [...results];
    if (sortKey === "price_asc") copy.sort((a, b) => a.currentBid - b.currentBid);
    else if (sortKey === "price_desc") copy.sort((a, b) => b.currentBid - a.currentBid);
    else if (sortKey === "date_desc") {
      copy.sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
    } else if (sortKey === "popularity") {
      copy.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
    } else if (sortKey === "sqm_desc") {
      copy.sort((a, b) => (b.propertyDetails?.grossSqm ?? 0) - (a.propertyDetails?.grossSqm ?? 0));
    }
    return copy;
  }, [results, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sortedResults.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedResults = sortedResults.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const savedSearchesApi = useSavedSearches(catalog);

  const patchParams = (patch: Record<string, string | undefined>) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [k, v] of Object.entries(patch)) {
        if (!v) next.delete(k);
        else next.set(k, v);
      }
      return next;
    }, { replace: true });
  };

  const toggleSetParam = <T extends string>(param: string, current: T[], value: T) => {
    const set = new Set<T>(current);
    if (set.has(value)) set.delete(value);
    else set.add(value);
    patchParams({ [param]: set.size > 0 ? Array.from(set).join(",") : undefined, page: undefined });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = query.trim();
    patchParams({ q: next || undefined, page: undefined });
  };

  const clearAllFilters = () => {
    setQuery("");
    patchParams({
      q: undefined, sort: undefined, poly: undefined, page: undefined,
      ptype: undefined, mode: undefined, status: undefined,
      pmin: undefined, pmax: undefined, smin: undefined, smax: undefined,
      city: undefined, district: undefined,
    });
  };

  const activeFilterCount =
    (query.trim().length >= 2 ? 1 : 0) +
    (polygon ? 1 : 0) +
    ptypes.length + modes.length + statuses.length +
    (priceMin !== undefined ? 1 : 0) + (priceMax !== undefined ? 1 : 0) +
    (sqmMin !== undefined ? 1 : 0) + (sqmMax !== undefined ? 1 : 0) +
    (city ? 1 : 0) + (district ? 1 : 0);

  // —— Filtre panel UI (yeniden kullanılabilir) ——
  const FilterPanel = (
    <aside className="space-y-4 text-sm" aria-label="Arama filtreleri">
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Mülk Tipi</h3>
        <div className="space-y-1">
          {PROPERTY_TYPES.map((t) => (
            <label key={t.key} className="flex items-center gap-2 text-slate-200 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={ptypes.includes(t.key)}
                onChange={() => toggleSetParam<PropertyType>("ptype", ptypes, t.key)}
                className="h-4 w-4 accent-blue-500"
              />
              <span>{t.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Konum</h3>
        <select
          value={city}
          onChange={(e) => patchParams({ city: e.target.value || undefined, district: undefined, page: undefined })}
          className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white mb-2"
          aria-label="İl"
        >
          <option value="">Tüm iller</option>
          {cityOptions.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={district}
          onChange={(e) => patchParams({ district: e.target.value || undefined, page: undefined })}
          disabled={!city || districtOptions.length === 0}
          className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white disabled:opacity-50"
          aria-label="İlçe"
        >
          <option value="">{city ? "Tüm ilçeler" : "Önce il seçin"}</option>
          {districtOptions.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </section>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Fiyat (₺)</h3>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number" min={0} step={100000}
            value={priceMin ?? ""}
            onChange={(e) => patchParams({ pmin: e.target.value || undefined, page: undefined })}
            placeholder="Min"
            className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white"
            aria-label="Minimum fiyat"
          />
          <input
            type="number" min={0} step={100000}
            value={priceMax ?? ""}
            onChange={(e) => patchParams({ pmax: e.target.value || undefined, page: undefined })}
            placeholder="Max"
            className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white"
            aria-label="Maksimum fiyat"
          />
        </div>
      </section>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Alan (m²)</h3>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number" min={0} step={10}
            value={sqmMin ?? ""}
            onChange={(e) => patchParams({ smin: e.target.value || undefined, page: undefined })}
            placeholder="Min"
            className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white"
            aria-label="Minimum m²"
          />
          <input
            type="number" min={0} step={10}
            value={sqmMax ?? ""}
            onChange={(e) => patchParams({ smax: e.target.value || undefined, page: undefined })}
            placeholder="Max"
            className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white"
            aria-label="Maksimum m²"
          />
        </div>
      </section>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
          <Gavel className="w-3.5 h-3.5 text-amber-400" /> İhale Tipi
        </h3>
        <div className="space-y-1">
          {AUCTION_MODES.map((m) => (
            <label key={m.key} className="flex items-center gap-2 text-slate-200 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={modes.includes(m.key)}
                onChange={() => toggleSetParam<AuctionMode>("mode", modes, m.key)}
                className="h-4 w-4 accent-amber-400"
              />
              <m.icon className="w-3.5 h-3.5 opacity-80" />
              <span>{m.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">İhale Durumu</h3>
        <div className="space-y-1">
          {AUCTION_STATUS.map((s) => (
            <label key={s.key} className="flex items-center gap-2 text-slate-200 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={statuses.includes(s.key)}
                onChange={() => toggleSetParam<AuctionStatus>("status", statuses, s.key)}
                className="h-4 w-4 accent-emerald-400"
              />
              <span>{s.label}</span>
            </label>
          ))}
        </div>
      </section>

      {activeFilterCount > 0 ? (
        <Button type="button" variant="outline" size="sm" onClick={clearAllFilters} className="w-full gap-2">
          <X className="w-4 h-4" /> Filtreleri Temizle ({activeFilterCount})
        </Button>
      ) : null}
    </aside>
  );

  // —— İlan kart ——
  const renderCard = (auction: typeof catalog[number]) => {
    const ptype = classifyType(auction.category);
    const mode = auction.marketingMode ?? (auction.negotiationMode === "sealed_offer" ? "sealed_offers" : "auction");
    const modeDef = AUCTION_MODES.find((m) => m.key === mode);
    const sqm = auction.propertyDetails?.grossSqm;
    return (
      <button
        key={`${auction.id}-${auction.title}`}
        type="button"
        onClick={() => navigate(`/ilan/${auction.id}`)}
        className="group text-start rounded-2xl border border-white/10 bg-slate-900/40 hover:border-blue-500/40 hover:bg-slate-900/70 transition-all overflow-hidden flex flex-col"
      >
        <div className="relative aspect-[16/10] bg-slate-800 overflow-hidden">
          <img
            loading="lazy"
            src={auction.images[0]}
            alt={auction.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
          {modeDef ? (
            <span className="absolute top-2 start-2 inline-flex items-center gap-1 rounded-md bg-slate-950/85 backdrop-blur px-2 py-1 text-[10px] font-semibold text-amber-200 border border-amber-400/30">
              <modeDef.icon className="w-3 h-3" /> {modeDef.label}
            </span>
          ) : null}
          <span className={cn(
            "absolute top-2 end-2 inline-flex items-center rounded-md px-2 py-1 text-[10px] font-semibold backdrop-blur",
            auction.status === "live" ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/40" :
            auction.status === "upcoming" ? "bg-cyan-500/20 text-cyan-200 border border-cyan-400/40" :
            "bg-slate-700/60 text-slate-300 border border-slate-500/40",
          )}>
            {auction.status === "live" ? "Canlı" : auction.status === "upcoming" ? "Yaklaşan" : "Bitti"}
          </span>
        </div>
        <div className="p-3 flex-1 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <ListingNumberBadge auction={auction} compact />
            <span className="text-[10px] uppercase tracking-wider text-slate-500">{PROPERTY_TYPES.find((t) => t.key === ptype)?.label}</span>
          </div>
          <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2">{auction.title}</h3>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{auction.district}, {auction.city}</span>
          </div>
          <div className="flex items-center justify-between mt-auto pt-2">
            <div className="text-base font-bold text-blue-400">{formatTRY(auction.currentBid)}</div>
            {sqm ? <div className="text-xs text-slate-400">{sqm} m²</div> : null}
          </div>
        </div>
      </button>
    );
  };

  const hasAnyFilter = activeFilterCount > 0;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-900 gap-2 mb-6">
          <ArrowLeft className="rtl:rotate-180 w-4 h-4" /> Geri
        </Button>

        <PageBreadcrumbs
          className="mb-4"
          items={[
            { label: "Ana sayfa", href: "/" },
            { label: "İlan arama" },
          ]}
        />

        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3 mb-2">
          <Search className="w-8 h-8 text-blue-400" />
          İlan arama
        </h1>
        <p className="text-slate-400 text-sm mb-6">
          {catalog.length.toLocaleString("tr-TR")} ilan kataloğunda; mülk tipi, fiyat, konum ve ihale parametrelerine göre filtreleyin.
        </p>

        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 mb-4">
          <SearchAutocomplete
            className="flex-1"
            value={query}
            onChange={setQuery}
            onSelect={(v) => {
              setQuery(v);
              patchParams({ q: v || undefined, page: undefined });
            }}
            placeholder="Şehir, ilçe, başlık veya ilan no (ILN-...)"
          />
          <Button type="submit" className="bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold h-11 px-6">
            Ara
          </Button>
        </form>

        {/* Üst toolbar: filtre toggle (mobile), görünüm, sıralama */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFiltersOpen((v) => !v)}
              className="gap-2 lg:hidden"
              aria-expanded={filtersOpen}
              aria-controls="search-filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtreler {activeFilterCount > 0 ? `(${activeFilterCount})` : null}
            </Button>
            <div className="inline-flex rounded-lg border border-white/10 bg-slate-950 p-0.5">
              {[
                { key: "grid" as const, label: "Kart", icon: Grid3x3 },
                { key: "list" as const, label: "Liste", icon: Home },
                { key: "map" as const, label: "Harita", icon: MapIcon },
              ].map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => patchParams({ view: v.key === "grid" ? undefined : v.key })}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                    viewMode === v.key ? "bg-blue-500/20 text-blue-200" : "text-slate-400 hover:text-white",
                  )}
                  aria-pressed={viewMode === v.key}
                >
                  <v.icon className="w-3.5 h-3.5" /> {v.label}
                </button>
              ))}
            </div>
          </div>
          {hasAnyFilter && !catalogLoading ? (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-slate-400">{sortedResults.length} sonuç</span>
              <select
                value={sortKey}
                onChange={(e) => patchParams({ sort: e.target.value === "relevance" ? undefined : e.target.value, page: "1" })}
                className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
                aria-label="Sıralama"
              >
                <option value="relevance">İlgililik</option>
                <option value="price_asc">Fiyat (artan)</option>
                <option value="price_desc">Fiyat (azalan)</option>
                <option value="date_desc">Bitiş tarihi (yeni)</option>
                <option value="sqm_desc">m² (büyük)</option>
                <option value="popularity">Görüntülenme</option>
              </select>
            </div>
          ) : null}
        </div>

        <SearchFilterChips
          className="mb-4"
          chips={[
            ...(query.trim().length >= 2 ? [{ key: "q", label: `"${query.trim()}"`, onRemove: () => { setQuery(""); patchParams({ q: undefined, page: undefined }); } }] : []),
            ...(city ? [{ key: "city", label: `İl: ${city}`, onRemove: () => patchParams({ city: undefined, district: undefined, page: undefined }) }] : []),
            ...(district ? [{ key: "district", label: `İlçe: ${district}`, onRemove: () => patchParams({ district: undefined, page: undefined }) }] : []),
            ...ptypes.map((t) => ({ key: `ptype-${t}`, label: PROPERTY_TYPES.find((x) => x.key === t)?.label ?? t, onRemove: () => toggleSetParam<PropertyType>("ptype", ptypes, t) })),
            ...modes.map((m) => ({ key: `mode-${m}`, label: AUCTION_MODES.find((x) => x.key === m)?.label ?? m, onRemove: () => toggleSetParam<AuctionMode>("mode", modes, m) })),
            ...statuses.map((s) => ({ key: `status-${s}`, label: AUCTION_STATUS.find((x) => x.key === s)?.label ?? s, onRemove: () => toggleSetParam<AuctionStatus>("status", statuses, s) })),
            ...(priceMin !== undefined ? [{ key: "pmin", label: `≥ ${formatTRY(priceMin)}`, onRemove: () => patchParams({ pmin: undefined, page: undefined }) }] : []),
            ...(priceMax !== undefined ? [{ key: "pmax", label: `≤ ${formatTRY(priceMax)}`, onRemove: () => patchParams({ pmax: undefined, page: undefined }) }] : []),
            ...(sqmMin !== undefined ? [{ key: "smin", label: `≥ ${sqmMin} m²`, onRemove: () => patchParams({ smin: undefined, page: undefined }) }] : []),
            ...(sqmMax !== undefined ? [{ key: "smax", label: `≤ ${sqmMax} m²`, onRemove: () => patchParams({ smax: undefined, page: undefined }) }] : []),
            ...(polygon ? [{ key: "poly", label: "Harita alanı", onRemove: () => patchParams({ poly: undefined, page: "1" }) }] : []),
            ...(sortKey !== "relevance" ? [{ key: "sort", label: sortKey === "price_asc" ? "Fiyat ↑" : sortKey === "price_desc" ? "Fiyat ↓" : sortKey === "popularity" ? "Görüntülenme" : sortKey === "sqm_desc" ? "m² (büyük)" : "Bitiş tarihi", onRemove: () => patchParams({ sort: undefined, page: "1" }) }] : []),
          ]}
          onClearAll={activeFilterCount > 0 ? clearAllFilters : undefined}
        />

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Filtre panel — desktop her zaman, mobile collapse */}
          <div
            id="search-filters"
            className={cn(
              "rounded-2xl border border-white/10 bg-slate-900/40 p-4 sticky top-24 self-start",
              filtersOpen ? "block" : "hidden lg:block",
            )}
          >
            {FilterPanel}
          </div>

          <div>
            {viewMode === "map" ? (
              <MapPolygonSearch
                onPolygonComplete={(coords) => patchParams({ poly: encodePolygonParam(coords), page: undefined })}
                onClear={() => patchParams({ poly: undefined, page: undefined })}
              />
            ) : null}

            <SavedSearchesPanel
              api={savedSearchesApi}
              currentQuery={query}
              onApplySearch={(q) => {
                setQuery(q);
                patchParams({ q: q || undefined, page: undefined });
              }}
            />

            {catalogError ? (
              <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100" role="status">
                {catalogError}
              </p>
            ) : null}

            {catalogLoading ? (
              <LoadingSkeletonGrid count={6} />
            ) : !hasAnyFilter ? (
              <EmptyState
                title="Aramaya başlayın"
                description="Anahtar kelime girin, mülk tipi/konum seçin veya harita üzerinde alan çizin."
              />
            ) : sortedResults.length === 0 ? (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-8 text-center">
                <h2 className="text-lg font-semibold text-white mb-2">Bu kriterlerle eşleşen ilan bulunamadı</h2>
                <p className="text-sm text-slate-400 mb-5 max-w-md mx-auto">
                  Filtreleri biraz gevşetmeyi deneyin: fiyat veya m² aralığını genişletin, daha az mülk tipi seçin
                  ya da konum filtresini kaldırın.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button type="button" variant="outline" size="sm" onClick={clearAllFilters}>
                    Tüm Filtreleri Temizle
                  </Button>
                  {city ? (
                    <Button type="button" variant="outline" size="sm" onClick={() => patchParams({ city: undefined, district: undefined, page: undefined })}>
                      İl filtresini kaldır
                    </Button>
                  ) : null}
                  {(priceMin !== undefined || priceMax !== undefined) ? (
                    <Button type="button" variant="outline" size="sm" onClick={() => patchParams({ pmin: undefined, pmax: undefined, page: undefined })}>
                      Fiyat filtresini kaldır
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : (
              <>
                <div className={cn(
                  "gap-4",
                  viewMode === "list" ? "flex flex-col" : "grid sm:grid-cols-2 xl:grid-cols-3",
                )}>
                  {pagedResults.map((auction) => renderCard(auction))}
                </div>
                {pagedResults.length > 0 ? (
                  <div className="mt-4">
                    <ListingDocumentFooter auction={pagedResults[0]} compact />
                  </div>
                ) : null}
                {totalPages > 1 ? (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button type="button" variant="outline" size="sm" disabled={safePage <= 1}
                      onClick={() => patchParams({ page: String(safePage - 1) })}>Önceki</Button>
                    <span className="text-sm text-slate-400">Sayfa {safePage} / {totalPages}</span>
                    <Button type="button" variant="outline" size="sm" disabled={safePage >= totalPages}
                      onClick={() => patchParams({ page: String(safePage + 1) })}>Sonraki</Button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
