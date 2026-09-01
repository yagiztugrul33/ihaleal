import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, MapPin, Home, Clock, ArrowRight, TrendingUp, Star, CornerDownLeft } from "lucide-react";
import { getLocalAndStaticAuctions, loadAllAuctionsForSearch } from "@/lib/auctionsSource";
import { Button } from "@/components/ui/button";

/** Ö2 komut paleti: Ctrl+K rota + modül araması (yeni bağımlılık yok, statik liste). */
type PageCommand = { title: string; href: string; keywords: string; group: string };

const PAGE_COMMANDS: PageCommand[] = [
  { title: "Ana Sayfa", href: "/", keywords: "anasayfa home giris", group: "Sayfa" },
  { title: "İhale Arama", href: "/ihaleler", keywords: "ihale arama muzayede auction ilan", group: "Modül" },
  { title: "Canlı İhaleler", href: "/ihaleler", keywords: "canli ihale muzayede live", group: "Modül" },
  { title: "Gayrimenkul Borsası", href: "/borsa", keywords: "borsa teklif emir defteri fiyat", group: "Modül" },
  { title: "Harita", href: "/harita", keywords: "harita map konum parsel", group: "Modül" },
  { title: "Analiz & Raporlar", href: "/analiz", keywords: "analiz analytics endeks rapor grafik", group: "Modül" },
  { title: "Portföyüm (Panel)", href: "/panel", keywords: "panel portfoy dashboard hesap", group: "Modül" },
  { title: "Risk Merkezi — Deprem Haritası", href: "/modul/deprem-risk-haritasi", keywords: "deprem risk afet zemin", group: "Modül" },
  { title: "Bina Risk Sorgu", href: "/modul/bina-risk-sorgu", keywords: "bina risk sorgu yapi", group: "Modül" },
  { title: "Parsel Zekâsı", href: "/modul/parsel-zekasi", keywords: "parsel ada imar tapu", group: "Modül" },
  { title: "Favorilerim", href: "/favoriler", keywords: "favori begeni kayitli", group: "Sayfa" },
  { title: "Kayıtlı Aramalarım", href: "/aramalarim", keywords: "kayitli arama alarm", group: "Sayfa" },
  { title: "Mesajlar", href: "/mesajlar", keywords: "mesaj sohbet chat konusma", group: "Sayfa" },
  { title: "Bildirimler", href: "/bildirimler", keywords: "bildirim uyari notification", group: "Sayfa" },
  { title: "Belgelerim", href: "/belgeler", keywords: "belge evrak dokuman", group: "Sayfa" },
  { title: "Raporlar", href: "/raporlar", keywords: "rapor aylik pdf", group: "Sayfa" },
  { title: "Mortgage Hesaplayıcı", href: "/mortgage", keywords: "mortgage kredi konut hesap faiz", group: "Araç" },
  { title: "Komisyon Hesaplayıcı", href: "/komisyon-hesaplayici", keywords: "komisyon hesap ucret", group: "Araç" },
  { title: "Değerleme", href: "/degerleme", keywords: "degerleme ekspertiz fiyat tahmin", group: "Araç" },
  { title: "Karşılaştır", href: "/karsilastir", keywords: "karsilastir compare kiyasla", group: "Araç" },
  { title: "Nasıl Çalışır", href: "/nasil-calisir", keywords: "nasil calisir rehber yardim sss", group: "Sayfa" },
  { title: "Fiyatlandırma", href: "/fiyatlandirma", keywords: "fiyat paket uyelik premium abonelik", group: "Sayfa" },
  { title: "Ayarlar", href: "/ayarlar", keywords: "ayar tercih hesap profil", group: "Sayfa" },
  { title: "İletişim", href: "/iletisim", keywords: "iletisim destek yardim", group: "Sayfa" },
];

const trLower = (s: string) => s.toLocaleLowerCase("tr");

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
  const [activeIndex, setActiveIndex] = useState(0);

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

  const results = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return catalog.filter((a) =>
      a.title.toLowerCase().includes(q) ||
      a.location.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.district.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      (a.tags && a.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }, [query, catalog]);

  // Ö2: rota + modül eşleşmesi — başlık, anahtar kelime ve href üstünden TR-duyarlı arama
  const pageResults = useMemo(() => {
    if (query.length < 2) return [];
    const q = trLower(query.trim());
    return PAGE_COMMANDS.filter(
      (p) => trLower(p.title).includes(q) || p.keywords.includes(q) || p.href.includes(q)
    ).slice(0, 6);
  }, [query]);

  // Klavye navigasyonu: sayfalar + ilanlar tek listede gezilir
  const navigableHrefs = useMemo(
    () => [
      ...pageResults.map((p) => p.href),
      ...results.slice(0, 10).map((a) => `/ilan/${a.id}`),
    ],
    [pageResults, results]
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!navigableHrefs.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % navigableHrefs.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + navigableHrefs.length) % navigableHrefs.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const href = navigableHrefs[activeIndex] ?? navigableHrefs[0];
      navigate(href);
      handleClose();
    }
  };

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
        className="w-full max-w-2xl bg-[#0f1629] border border-slate-200 rounded-[20px] shadow-2xl overflow-hidden animate-scale-in"
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
              onKeyDown={handleInputKeyDown}
              placeholder="Sayfa, modül veya ilan ara..."
              aria-label="Komut paleti: sayfa, modül veya ilan ara"
              className="flex-1 bg-transparent text-white text-lg placeholder:text-slate-600 outline-none"
            />
            {query && (
              <button onClick={() => setQuery("")} className="p-1.5 rounded-[10px] hover:bg-white/10 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-1 rounded-[3px] border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-normal text-slate-500">
              Ctrl K
            </kbd>
            <button onClick={handleClose} className="p-1.5 rounded-[10px] hover:bg-white/10 text-slate-500">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {query.length < 2 ? (
            <div className="p-5">
              <div className="text-xs font-normal text-slate-500 uppercase tracking-wider mb-3">Populer Aramalar</div>
              <div className="flex flex-wrap gap-2">
                {["Istanbul", "Bodrum", "Villa", "3+1", "Deniz Manzarali", "Yatirimlik"].map((term) => (
                  <button key={term} onClick={() => setQuery(term)} className="px-3 py-1.5 rounded-[10px] bg-white/5 text-sm text-slate-400 hover:bg-white/10 hover:text-white transition-all">
                    {term}
                  </button>
                ))}
              </div>
              <div className="mt-5 text-xs font-normal text-slate-500 uppercase tracking-wider mb-3">Populer Sehirler</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {["Istanbul", "Ankara", "Izmir", "Antalya", "Bursa", "Mugla"].map((city) => (
                  <button key={city} onClick={() => setQuery(city)} className="flex items-center gap-2 p-2.5 rounded-[20px] bg-white/[0.02] hover:bg-white/5 text-sm text-slate-500 hover:text-slate-900 transition-all text-start">
                    <MapPin className="w-3.5 h-3.5" /> {city}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 && pageResults.length === 0 ? (
            <div className="p-8 text-center">
              <Search className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500">Sonuc bulunamadi.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {pageResults.length > 0 && (
                <div className="p-2" data-testid="palette-page-results">
                  <div className="px-2 pb-1 pt-1 text-xs font-normal uppercase tracking-wider text-slate-500">
                    Sayfalar &amp; Modüller
                  </div>
                  {pageResults.map((p, idx) => (
                    <button
                      key={p.href}
                      onClick={() => { navigate(p.href); handleClose(); }}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`flex w-full items-center gap-3 rounded-[20px] px-3 py-2.5 text-start transition-colors ${
                        idx === activeIndex ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5"
                      }`}
                    >
                      <ArrowRight className="rtl:rotate-180 h-4 w-4 shrink-0 text-[var(--metin-ikincil)]" />
                      <span className="min-w-0 flex-1 truncate text-sm font-normal">{p.title}</span>
                      <span className="rounded-[3px] border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">{p.group}</span>
                      {idx === activeIndex ? <CornerDownLeft className="h-3.5 w-3.5 text-slate-500" /> : null}
                    </button>
                  ))}
                </div>
              )}
              {results.slice(0, 10).map((auction, li) => (
                <button
                  key={auction.id}
                  onClick={() => { navigate(`/ilan/${auction.id}`); handleClose(); }}
                  onMouseEnter={() => setActiveIndex(pageResults.length + li)}
                  className={`w-full flex items-center gap-4 p-4 transition-colors text-start ${
                    pageResults.length + li === activeIndex ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
                  }`}
                >
                  <img loading="lazy" src={auction.images[0]} alt="" className="w-16 h-12 object-cover rounded-[10px] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-normal text-white truncate">{auction.title}</div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {auction.district}</span>
                      <span className="flex items-center gap-1"><Home className="w-3 h-3" /> {auction.category}</span>
                    </div>
                  </div>
                  <div className="text-end flex-shrink-0">
                    <div className="text-sm font-normal text-[var(--metin-ikincil)]">TRY {(auction.currentBid / 1000000).toFixed(1)}M</div>
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
