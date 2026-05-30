import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, MapPin, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getLocalAndStaticAuctions, loadAllAuctionsForSearch } from "@/lib/auctionsSource";
import { ListingDocumentFooter } from "@/components/ListingDocumentFooter";
import { ListingNumberBadge } from "@/components/ListingNumberBadge";
import { getListingNumber } from "@/lib/listingNumber";
import { LoadingState, LoadingSkeletonGrid, ErrorState, EmptyState } from "@/components/async";
import { useLocale } from "@/contexts/LocaleContext";
import { useSavedSearches } from "@/hooks/useSavedSearches";
import { SavedSearchesPanel } from "@/components/search/SavedSearchesPanel";
import { SearchFilterChips } from "@/components/search/SearchFilterChips";
import { PageBreadcrumbs } from "@/components/seo/PageBreadcrumbs";

function normalize(s: string) {
  return s.trim().toLowerCase();
}

const PAGE_SIZE = 8;
type SortKey = "relevance" | "price_asc" | "price_desc" | "date_desc";

function parseSort(v: string | null): SortKey {
  if (v === "price_asc" || v === "price_desc" || v === "date_desc") return v;
  return "relevance";
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

  const results = useMemo(() => {
    const q = normalize(query);
    if (q.length < 2) return [];
    const all = catalog;
    return all.filter((a) => {
      const ln = normalize(getListingNumber(a));
      return (
        normalize(a.title).includes(q) ||
        normalize(a.location).includes(q) ||
        normalize(a.city).includes(q) ||
        normalize(a.district).includes(q) ||
        normalize(a.category).includes(q) ||
        ln.includes(q) ||
        (a.tags && a.tags.some((t) => normalize(t).includes(q)))
      );
    });
  }, [query, catalog]);

  const sortKey = parseSort(params.get("sort"));
  const page = Math.max(1, Number(params.get("page") || "1") || 1);

  const sortedResults = useMemo(() => {
    const copy = [...results];
    if (sortKey === "price_asc") copy.sort((a, b) => a.currentBid - b.currentBid);
    else if (sortKey === "price_desc") copy.sort((a, b) => b.currentBid - a.currentBid);
    else if (sortKey === "date_desc") {
      copy.sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = query.trim();
    patchParams({ q: next || undefined, page: undefined });
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-900 gap-2 mb-6">
          <ArrowLeft className="w-4 h-4" /> Geri
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
        <p className="text-slate-400 text-sm mb-2">Şema.org SearchAction ile uyumlu arama sayfası (demo veri + tarayıcıda kayıtlı ilanlar).</p>
        <p className="text-sm text-slate-500 mb-6">
          Platform ücreti (taslak):{" "}
          <button type="button" className="text-teal-400 hover:underline" onClick={() => navigate("/komisyon-modeli")}>komisyon modeli</button>
          {" · "}
          <button type="button" className="text-teal-400 hover:underline" onClick={() => navigate("/favoriler")}>favorilerim</button>
        </p>

        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 mb-8">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Şehir, semt, başlık veya ilan no (ILN-...)"
            className="bg-slate-950 border-slate-200 text-white h-11"
            aria-label="Arama kutusu"
          />
          <Button type="submit" className="bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold h-11 px-6">
            Ara
          </Button>
        </form>

        <SavedSearchesPanel
          api={savedSearchesApi}
          currentQuery={query}
          onApplySearch={(q) => {
            setQuery(q);
            patchParams({ q: q || undefined, page: undefined });
          }}
        />

        <SearchFilterChips
          className="mb-4"
          chips={[
            ...(query.trim().length >= 2
              ? [{ key: "q", label: `Arama: ${query.trim()}`, onRemove: () => { setQuery(""); patchParams({ q: undefined, page: undefined }); } }]
              : []),
            ...(sortKey !== "relevance"
              ? [{
                  key: "sort",
                  label: sortKey === "price_asc" ? "Fiyat ↑" : sortKey === "price_desc" ? "Fiyat ↓" : "Tarih",
                  onRemove: () => patchParams({ sort: undefined, page: "1" }),
                }]
              : []),
          ]}
          onClearAll={
            query.trim() || sortKey !== "relevance"
              ? () => {
                  setQuery("");
                  patchParams({ q: undefined, sort: undefined, page: undefined });
                }
              : undefined
          }
        />

        {query.length >= 2 && !catalogLoading ? (
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">{sortedResults.length} sonuç</p>
            <select
              value={sortKey}
              onChange={(e) => patchParams({ sort: e.target.value === "relevance" ? undefined : e.target.value, page: "1" })}
              className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
              aria-label="Sıralama"
            >
              <option value="relevance">İlgililik</option>
              <option value="price_asc">Fiyat (artan)</option>
              <option value="price_desc">Fiyat (azalan)</option>
              <option value="date_desc">Tarih (yeni)</option>
            </select>
          </div>
        ) : null}

        {catalogError ? (
          <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100" role="status">
            {catalogError}
          </p>
        ) : null}

        {catalogLoading ? (
          <LoadingSkeletonGrid count={4} />
        ) : query.length < 2 ? (
          <EmptyState title={c.emptySearch} description="Aramak için en az 2 karakter girin." />
        ) : results.length === 0 ? (
          <EmptyState title={c.emptyResults} description="Farklı bir kelime veya ilan numarası deneyin." />
        ) : (
          <>
          <ul className="space-y-3">
            {pagedResults.map((auction) => (
              <li key={`${auction.id}-${auction.title}`}>
                <button
                  type="button"
                  onClick={() => navigate(`/ilan/${auction.id}`)}
                  className="w-full text-left rounded-xl border border-slate-200/80 bg-slate-900/40 hover:border-blue-500/30 hover:bg-slate-900/70 transition-colors p-4 flex gap-4"
                >
                  <img loading="lazy" src={auction.images[0]} alt={auction.title} className="w-24 h-16 object-cover rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <ListingNumberBadge auction={auction} compact />
                    </div>
                    <div className="font-medium text-white truncate">{auction.title}</div>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {auction.district}, {auction.city}
                      </span>
                      <span className="flex items-center gap-1">
                        <Home className="w-3 h-3" /> {auction.category}
                      </span>
                    </div>
                    <ListingDocumentFooter auction={auction} compact />
                  </div>
                  <div className="text-sm font-bold text-blue-400 flex-shrink-0 self-center">
                    {(auction.currentBid / 1_000_000).toFixed(1)}M ₺
                  </div>
                </button>
              </li>
            ))}
          </ul>
          {totalPages > 1 ? (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={safePage <= 1}
                onClick={() => patchParams({ page: String(safePage - 1) })}
              >
                Önceki
              </Button>
              <span className="text-sm text-slate-400">
                Sayfa {safePage} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={safePage >= totalPages}
                onClick={() => patchParams({ page: String(safePage + 1) })}
              >
                Sonraki
              </Button>
            </div>
          ) : null}
          </>
        )}
      </div>
    </div>
  );
}
