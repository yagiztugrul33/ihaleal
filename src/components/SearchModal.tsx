import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, MapPin, Home, Clock, ArrowRight, TrendingUp, Star } from "lucide-react";
import { getLocalAndStaticAuctions, loadAllAuctionsForSearch } from "@/lib/auctionsSource";
import { Button } from "@/components/ui/button";

interface SearchModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SearchModal({ isOpen, onClose, open, onOpenChange }: SearchModalProps) {
  const effectiveOpen = isOpen ?? open ?? false;
  const handleClose = onClose ?? (() => onOpenChange?.(false));
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState(() => getLocalAndStaticAuctions());

  useEffect(() => {
    if (!effectiveOpen) return;
    let ok = true;
    void loadAllAuctionsForSearch().then((rows) => {
      if (ok) setCatalog(rows);
    });
    return () => {
      ok = false;
    };
  }, [effectiveOpen]);

  const results = query.length >= 2 ? catalog.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.location.toLowerCase().includes(query.toLowerCase()) ||
    a.city.toLowerCase().includes(query.toLowerCase()) ||
    a.district.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase()) ||
    (a.tags && a.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())))
  ) : [];

  if (!effectiveOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
      onClick={handleClose}
      onKeyDown={(e) => { if (e.key === "Escape") handleClose(); }}
      role="button"
      tabIndex={-1}
      aria-label="Arama modalını kapat"
    >
      <div
        className="w-full max-w-2xl bg-[#0f1629] border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Arama"
      >
        <div className="p-4 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-slate-500 flex-shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ilan ara: sehir, semt, ilan adi..."
              className="flex-1 bg-transparent text-white text-lg placeholder:text-slate-600 outline-none"
            />
            {query && (
              <button onClick={() => setQuery("")} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            )}
            <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {query.length < 2 ? (
            <div className="p-5">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Populer Aramalar</div>
              <div className="flex flex-wrap gap-2">
                {["Istanbul", "Bodrum", "Villa", "3+1", "Deniz Manzarali", "Yatirimlik"].map((term) => (
                  <button key={term} onClick={() => setQuery(term)} className="px-3 py-1.5 rounded-lg bg-white/5 text-sm text-slate-400 hover:bg-white/10 hover:text-white transition-all">
                    {term}
                  </button>
                ))}
              </div>
              <div className="mt-5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Populer Sehirler</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {["Istanbul", "Ankara", "Izmir", "Antalya", "Bursa", "Mugla"].map((city) => (
                  <button key={city} onClick={() => setQuery(city)} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/5 text-sm text-slate-500 hover:text-slate-900 transition-all text-start">
                    <MapPin className="w-3.5 h-3.5" /> {city}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center">
              <Search className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500">Sonuc bulunamadi.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {results.slice(0, 10).map((auction) => (
                <button
                  key={auction.id}
                  onClick={() => { navigate(`/ilan/${auction.id}`); handleClose(); }}
                  className="w-full flex items-center gap-4 p-4 hover:bg-white/[0.03] transition-colors text-start"
                >
                  <img loading="lazy" src={auction.images[0]} alt="" className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{auction.title}</div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {auction.district}</span>
                      <span className="flex items-center gap-1"><Home className="w-3 h-3" /> {auction.category}</span>
                    </div>
                  </div>
                  <div className="text-end flex-shrink-0">
                    <div className="text-sm font-bold text-blue-400">TRY {(auction.currentBid / 1000000).toFixed(1)}M</div>
                    <div className="text-xs text-slate-500">AI {auction.investmentScore}</div>
                  </div>
                  <ArrowRight className="rtl:rotate-180 w-4 h-4 text-slate-600" />
                </button>
              ))}
              {results.length > 10 && (
                <div className="p-3 text-center">
                  <span className="text-xs text-slate-500">+{results.length - 10} sonuc daha...</span>
                </div>
              )}
              {query.length >= 2 && (
                <div className="p-3 border-t border-slate-200/80">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-slate-200 text-slate-200 hover:bg-white/5"
                    onClick={() => {
                      navigate(`/arama?q=${encodeURIComponent(query)}`);
                      handleClose();
                    }}
                  >
                    Tüm sonuçları sayfada göster
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
