import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, MapPin, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getLocalAndStaticAuctions, loadAllAuctionsForSearch } from "@/lib/auctionsSource";
import { ListingDocumentFooter } from "@/components/ListingDocumentFooter";
import { ListingNumberBadge } from "@/components/ListingNumberBadge";
import { ListingCoverImage } from "@/components/ListingCoverImage";
import { getListingNumber } from "@/lib/listingNumber";
import { resolveListingDetailPath } from "@/lib/listingRoutes";
import { formatTry } from "@/lib/valuation/valuationEngine";

function normalize(s: string) {
  return s.trim().toLowerCase();
}

const QUICK_SEARCHES = ["Kadıköy", "Villa", "İzmir", "Arsa", "İhale"] as const;

export default function SearchResults() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const initialQ = params.get("q") || "";
  const [query, setQuery] = useState(initialQ);
  const [catalog, setCatalog] = useState(() => getLocalAndStaticAuctions());

  useEffect(() => {
    setQuery(params.get("q") || "");
  }, [params]);

  useEffect(() => {
    let ok = true;
    void loadAllAuctionsForSearch().then((rows) => {
      if (ok) setCatalog(rows);
    });
    return () => {
      ok = false;
    };
  }, []);

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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = query.trim();
    setParams(next ? { q: next } : {});
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-900 gap-2 mb-6">
          <ArrowLeft className="w-4 h-4" /> Geri
        </Button>

        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3 mb-2">
          <Search className="w-8 h-8 text-blue-400" />
          İlan arama
        </h1>
        <p className="text-slate-400 text-sm mb-2">İl, ilçe, kategori veya ilan numarasına göre hızlı arama yapın.</p>
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

        {query.length < 2 ? (
          <div className="space-y-3">
            <p className="text-slate-500 text-sm">Aramak için en az 2 karakter girin.</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_SEARCHES.map((term) => (
                <button
                  key={term}
                  type="button"
                  className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-xs text-slate-300 transition hover:border-cyan-400/60 hover:text-white"
                  onClick={() => {
                    setQuery(term);
                    setParams({ q: term });
                  }}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        ) : results.length === 0 ? (
          <Card className="bg-slate-900/50 border-slate-200/80">
            <CardContent className="space-y-3 p-8 text-center text-slate-500">
              <p>Sonuç bulunamadı.</p>
              <p className="text-xs text-slate-400">Daha geniş bir arama terimi deneyin veya hazır aramalardan birini seçin.</p>
              <div className="flex flex-wrap justify-center gap-2">
                {QUICK_SEARCHES.map((term) => (
                  <button
                    key={`empty-${term}`}
                    type="button"
                    className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-xs text-slate-300 transition hover:border-cyan-400/60 hover:text-white"
                    onClick={() => {
                      setQuery(term);
                      setParams({ q: term });
                    }}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-3">
            {results.map((auction) => (
              <li key={`${auction.id}-${auction.title}`}>
                <button
                  type="button"
                  onClick={() => navigate(resolveListingDetailPath(auction.id))}
                  className="w-full min-w-0 text-left rounded-xl border border-slate-200/80 bg-slate-900/40 p-4 transition-colors hover:border-blue-500/30 hover:bg-slate-900/70"
                >
                  <div className="flex min-w-0 gap-4">
                    <ListingCoverImage
                      src={auction.images[0]}
                      alt={auction.title}
                      className="h-16 w-24 flex-shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
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
                    <div className="flex-shrink-0 self-center text-sm font-bold text-blue-400">
                      {formatTry(auction.currentBid)}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
