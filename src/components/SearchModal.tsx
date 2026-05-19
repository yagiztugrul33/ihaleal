import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  MapPin,
  Home,
  ArrowRight,
  Clock,
  FileText,
  Layers,
  TrendingUp,
} from "lucide-react";
import { getLocalAndStaticAuctions, loadAllAuctionsForSearch } from "@/lib/auctionsSource";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { KKA_HUB_PATH } from "@/lib/kkaHub";

const RECENT_KEY = "ihaleal_search_recent";
const POPULAR = ["İstanbul", "Bodrum", "Villa", "3+1", "Deniz manzaralı", "Yatırımlık"];
const CITIES = ["İstanbul", "Ankara", "İzmir", "Antalya", "Bursa", "Muğla"];

type PageHit = { type: "sayfa"; id: string; title: string; path: string; subtitle?: string };
type ModuleHit = { type: "modul"; id: string; title: string; path: string; subtitle?: string };

const STATIC_PAGES: PageHit[] = [
  { type: "sayfa", id: "nasil", title: "Nasıl çalışır", path: ROUTES.HOW_IT_WORKS },
  { type: "sayfa", id: "sss", title: "Sıkça sorulan sorular", path: "/sss" },
  { type: "sayfa", id: "fiyat", title: "Fiyatlandırma", path: "/fiyatlandirma" },
  { type: "sayfa", id: "iletisim", title: "İletişim", path: "/iletisim" },
  { type: "sayfa", id: "hakkimizda", title: "Hakkımızda", path: "/hakkimizda" },
  { type: "sayfa", id: "emlakci", title: "Emlakçı çözümleri", path: "/emlakci" },
  { type: "sayfa", id: "muteahhit", title: "Müteahhit çözümleri", path: "/muteahhit" },
];

const STATIC_MODULES: ModuleHit[] = [
  { type: "modul", id: "kka", title: "Kat karşılığı arsa", path: KKA_HUB_PATH, subtitle: "Hak ediş ve rayiç" },
  { type: "modul", id: "takas", title: "Takas / trade-in", path: "/takas" },
  { type: "modul", id: "ibuyer", title: "Anında teklif", path: ROUTES.IBUYER },
  { type: "modul", id: "ges", title: "GES arazi analizi", path: ROUTES.ARASTIRMA_GES },
  { type: "modul", id: "rapor", title: "Piyasa raporları", path: "/piyasa-raporlari" },
];

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string").slice(0, 8) : [];
  } catch {
    return [];
  }
}

function saveRecent(term: string) {
  const t = term.trim();
  if (t.length < 2) return;
  const next = [t, ...loadRecent().filter((r) => r.toLowerCase() !== t.toLowerCase())].slice(0, 8);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

export interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** @deprecated use open */
  isOpen?: boolean;
  /** @deprecated use onOpenChange */
  onClose?: () => void;
}

export function SearchModal({ open, onOpenChange, isOpen, onClose }: SearchModalProps) {
  const isOpenResolved = open ?? isOpen ?? false;
  const setOpen = useCallback(
    (v: boolean) => {
      onOpenChange?.(v);
      if (!v) onClose?.();
    },
    [onOpenChange, onClose],
  );

  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState(() => getLocalAndStaticAuctions());
  const [recent, setRecent] = useState<string[]>(() => loadRecent());
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpenResolved) return;
    setQuery("");
    setActiveIndex(0);
    setRecent(loadRecent());
    let ok = true;
    void loadAllAuctionsForSearch().then((rows) => {
      if (ok) setCatalog(rows);
    });
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      ok = false;
      window.clearTimeout(t);
    };
  }, [isOpenResolved]);

  const q = query.trim().toLowerCase();

  const ilanlar = useMemo(() => {
    if (q.length < 2) return [];
    return catalog
      .filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q) ||
          a.city.toLowerCase().includes(q) ||
          a.district.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          (a.tags && a.tags.some((t) => t.toLowerCase().includes(q))),
      )
      .slice(0, 8);
  }, [catalog, q]);

  const sayfalar = useMemo(() => {
    if (q.length < 2) return [];
    return STATIC_PAGES.filter(
      (p) => p.title.toLowerCase().includes(q) || p.path.toLowerCase().includes(q),
    );
  }, [q]);

  const moduller = useMemo(() => {
    if (q.length < 2) return [];
    return STATIC_MODULES.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.path.toLowerCase().includes(q) ||
        (m.subtitle && m.subtitle.toLowerCase().includes(q)),
    );
  }, [q]);

  type FlatRow =
    | { kind: "ilan"; id: string; label: string; sub?: string; path: string; image?: string; price?: string }
    | { kind: "sayfa" | "modul"; id: string; label: string; sub?: string; path: string };

  const flatResults: FlatRow[] = useMemo(() => {
    const rows: FlatRow[] = [];
    ilanlar.forEach((a) =>
      rows.push({
        kind: "ilan",
        id: a.id,
        label: a.title,
        sub: a.district,
        path: `/ilan/${a.id}`,
        image: a.images[0],
        price: `₺${(a.currentBid / 1_000_000).toFixed(1)}M`,
      }),
    );
    sayfalar.forEach((p) => rows.push({ kind: "sayfa", id: p.id, label: p.title, path: p.path }));
    moduller.forEach((m) => rows.push({ kind: "modul", id: m.id, label: m.title, sub: m.subtitle, path: m.path }));
    return rows;
  }, [ilanlar, sayfalar, moduller]);

  const go = (path: string, term?: string) => {
    if (term) {
      saveRecent(term);
      setRecent(loadRecent());
    }
    navigate(path);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (flatResults.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter" && flatResults[activeIndex]) {
      e.preventDefault();
      const row = flatResults[activeIndex];
      go(row.path, query);
    }
  };

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  if (!isOpenResolved) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 px-4 pt-24 backdrop-blur-sm"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Arama"
    >
      <div
        className="animate-scale-in w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-[#0f1629] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-200/80 p-4">
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 shrink-0 text-slate-500" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="İlan, sayfa veya modül ara…"
              className="flex-1 bg-transparent text-lg text-white outline-none placeholder:text-slate-600"
              autoComplete="off"
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} className="rounded-lg p-1.5 text-slate-500 hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            ) : null}
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-slate-500 hover:bg-white/10">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div ref={listRef} className="max-h-[60vh] overflow-y-auto">
          {q.length < 2 ? (
            <div className="p-5 space-y-5">
              {recent.length > 0 ? (
                <div>
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <Clock className="h-3.5 w-3.5" /> Son aramalar
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => setQuery(term)}
                        className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-slate-400 hover:bg-white/10 hover:text-white"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <div>
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <TrendingUp className="h-3.5 w-3.5" /> Popüler aramalar
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setQuery(term)}
                      className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-slate-400 transition-all hover:bg-white/10 hover:text-white"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Popüler şehirler</div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {CITIES.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setQuery(city)}
                      className="flex items-center gap-2 rounded-xl bg-white/[0.02] p-2.5 text-left text-sm text-slate-500 transition-all hover:bg-white/5 hover:text-white"
                    >
                      <MapPin className="h-3.5 w-3.5" /> {city}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : flatResults.length === 0 ? (
            <div className="p-8 text-center">
              <Search className="mx-auto mb-3 h-10 w-10 text-slate-700" />
              <p className="text-slate-500">Sonuç bulunamadı.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {ilanlar.length > 0 ? (
                <section className="p-2">
                  <p className="px-2 py-1 text-xs font-semibold uppercase text-slate-500">İlanlar</p>
                  {ilanlar.map((auction, i) => {
                    const idx = flatResults.findIndex((r) => r.kind === "ilan" && r.id === auction.id);
                    return (
                      <button
                        key={auction.id}
                        type="button"
                        onClick={() => go(`/ilan/${auction.id}`, query)}
                        className={`flex w-full items-center gap-4 rounded-lg p-3 text-left transition-colors ${
                          idx === activeIndex ? "bg-blue-500/15" : "hover:bg-white/[0.03]"
                        }`}
                      >
                        <img loading="lazy" src={auction.images[0]} alt="" className="h-12 w-16 shrink-0 rounded-lg object-cover" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-white">{auction.title}</div>
                          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                            <MapPin className="h-3 w-3" /> {auction.district}
                            <Home className="h-3 w-3" /> {auction.category}
                          </div>
                        </div>
                        <div className="shrink-0 text-right text-sm font-bold text-blue-400">
                          ₺{(auction.currentBid / 1_000_000).toFixed(1)}M
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-600" />
                      </button>
                    );
                  })}
                </section>
              ) : null}
              {sayfalar.length > 0 ? (
                <section className="p-2">
                  <p className="px-2 py-1 text-xs font-semibold uppercase text-slate-500">Sayfalar</p>
                  {sayfalar.map((p) => {
                    const idx = flatResults.findIndex((r) => r.kind === "sayfa" && r.id === p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => go(p.path, query)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${
                          idx === activeIndex ? "bg-blue-500/15 text-white" : "text-slate-300 hover:bg-white/[0.03]"
                        }`}
                      >
                        <FileText className="h-4 w-4 text-violet-400" />
                        {p.title}
                      </button>
                    );
                  })}
                </section>
              ) : null}
              {moduller.length > 0 ? (
                <section className="p-2">
                  <p className="px-2 py-1 text-xs font-semibold uppercase text-slate-500">Modüller</p>
                  {moduller.map((m) => {
                    const idx = flatResults.findIndex((r) => r.kind === "modul" && r.id === m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => go(m.path, query)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${
                          idx === activeIndex ? "bg-blue-500/15 text-white" : "text-slate-300 hover:bg-white/[0.03]"
                        }`}
                      >
                        <Layers className="h-4 w-4 text-cyan-400" />
                        <span>
                          {m.title}
                          {m.subtitle ? <span className="ml-2 text-xs text-slate-500">{m.subtitle}</span> : null}
                        </span>
                      </button>
                    );
                  })}
                </section>
              ) : null}
              <div className="border-t border-slate-200/80 p-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-slate-200 text-slate-200 hover:bg-white/5"
                  onClick={() => {
                    navigate(`/arama?q=${encodeURIComponent(query)}`);
                    setOpen(false);
                  }}
                >
                  Tüm sonuçları sayfada göster
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
