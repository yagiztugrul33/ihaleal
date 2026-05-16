import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, MapPin, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getLocalAndStaticAuctions, loadAllAuctionsForSearch } from "@/lib/auctionsSource";
import { ListingDocumentFooter } from "@/components/ListingDocumentFooter";
import { ListingNumberBadge } from "@/components/ListingNumberBadge";
import { getListingNumber } from "@/lib/listingNumber";

function normalize(s: string) {
  return s.trim().toLowerCase();
}

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

        {query.length < 2 ? (
          <p className="text-slate-500 text-sm">Aramak için en az 2 karakter girin.</p>
        ) : results.length === 0 ? (
          <Card className="bg-slate-900/50 border-slate-200/80">
            <CardContent className="p-8 text-center text-slate-500">Sonuç bulunamadı.</CardContent>
          </Card>
        ) : (
          <ul className="space-y-3">
            {results.map((auction) => (
              <li key={`${auction.id}-${auction.title}`}>
                <button
                  type="button"
                  onClick={() => navigate(`/ilan/${auction.id}`)}
                  className="w-full text-left rounded-xl border border-slate-200/80 bg-slate-900/40 hover:border-blue-500/30 hover:bg-slate-900/70 transition-colors p-4 flex gap-4"
                >
                  <img loading="lazy" src={auction.images[0]} alt="" className="w-24 h-16 object-cover rounded-lg flex-shrink-0" />
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
        )}
      </div>
    </div>
  );
}
