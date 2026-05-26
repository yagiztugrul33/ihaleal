import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Activity, ArrowLeft, Clock3, LogIn, Search, UserCircle2, Wallet } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/ShareButton";
import { ChatWidget } from "@/components/ChatWidget";
import { INITIAL_MARKET_ASSETS } from "@/borsa/useLiveMarket";
import { createMarketSnapshot } from "@/lib/borsa/marketData";
import { cn } from "@/lib/utils";

const BORSA_TABS = [
  { to: "/borsa", label: "Piyasa" },
  { to: "/borsa/varliklar", label: "Varlıklar" },
  { to: "/borsa/portfoy", label: "Portföy" },
  { to: "/borsa/izleme", label: "İzleme" },
  { to: "/borsa/veri", label: "Veri/Analiz" },
] as const;

export function BorsaLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchInput, setSearchInput] = useState("");
  const [now, setNow] = useState(() => new Date());
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const query = new URLSearchParams(location.search).get("q") ?? "";
    setSearchInput(query);
  }, [location.search]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const marketStats = useMemo(
    () =>
      createMarketSnapshot(
        INITIAL_MARKET_ASSETS.map((asset) => ({
          id: asset.id,
          code: asset.code,
          property: asset.property,
          price: asset.price,
          changePct: asset.changePct,
          volume: asset.volume,
        })),
      ),
    [],
  );

  const submitSearch = () => {
    const next = searchInput.trim();
    navigate(next ? `/borsa?q=${encodeURIComponent(next)}` : "/borsa");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-xl">
        <div className="grid gap-3 px-4 py-3 lg:px-8 2xl:px-12">
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
            <Logo size="lg" />
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#E9C56A]">Gayrimenkul Borsası</p>
              <p className="text-[11px] font-semibold text-cyan-100">TÜRKİYE'NİN GAYRİMENKUL BORSASI</p>
              <p className="text-[11px] text-muted-foreground">Profesyonel işlem terminali</p>
            </div>
          </div>
            <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-200">Demo veri</span>
          </div>
          <div className="flex w-full items-center gap-2 rounded-lg border border-border bg-secondary px-2 py-1.5 md:max-w-xl">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitSearch();
              }}
              placeholder="Kod / lokasyon ara (örn. KADIKÖY, ÇEŞME)"
              className="h-8 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={submitSearch}
              className="rounded-md border border-cyan-400/40 bg-cyan-500/15 px-2 py-1 text-[11px] font-semibold text-cyan-100"
            >
              Ara
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-2 py-1 text-[11px] text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5 text-cyan-300" />
              {now.toLocaleTimeString("tr-TR")}
            </span>
            <Button type="button" size="sm" className="h-8 text-xs" onClick={() => navigate("/giris")}>
              <LogIn className="mr-1.5 h-3.5 w-3.5" />
              Borsaya giriş
            </Button>
            <Button type="button" size="sm" variant="outline" className="h-8 text-xs" onClick={() => navigate("/borsa/portfoy")}>
              <Wallet className="mr-1.5 h-3.5 w-3.5" />
              Portföy
            </Button>
            <Button asChild type="button" size="sm" variant="outline" className="h-8 text-xs">
              <Link to="/">
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Ana Site
              </Link>
            </Button>
            <ShareButton
              title="İhaleal Borsa"
              url={location.pathname + location.search}
              inviteText="Gayrimenkul Borsası terminalini inceleyin."
              className="inline-flex h-8 items-center rounded-md border border-border bg-secondary px-2 text-xs text-muted-foreground hover:text-foreground"
            />
            <button
              type="button"
              className="inline-flex h-8 items-center rounded-md border border-border bg-secondary px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setIsDark((prev) => !prev)}
            >
              Tema: {isDark ? "Koyu" : "Aydınlık"}
            </button>
            <details className="relative">
              <summary className="inline-flex h-8 cursor-pointer list-none items-center rounded-md border border-border bg-secondary px-2 text-xs text-muted-foreground hover:text-foreground">
                <UserCircle2 className="mr-1.5 h-3.5 w-3.5" />
                Kullanıcı
              </summary>
              <div className="absolute right-0 top-9 z-20 w-44 rounded-lg border border-border bg-card p-2 shadow-xl">
                <Link to="/profil" className="block rounded px-2 py-1 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground">
                  Profil
                </Link>
                <Link to="/panel" className="mt-1 block rounded px-2 py-1 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground">
                  Kullanıcı paneli
                </Link>
              </div>
            </details>
          </div>
        </div>

        <nav className="flex items-center gap-2 overflow-x-auto border-t border-border px-4 py-2 lg:px-8 2xl:px-12">
          {BORSA_TABS.map((tab) => {
            const active =
              tab.to === "/borsa/varliklar"
                ? location.pathname.startsWith("/borsa/varlik")
                : tab.to === "/borsa"
                  ? location.pathname === "/borsa"
                  : location.pathname.startsWith(tab.to);
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={cn(
                  "shrink-0 rounded-md border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition",
                  active
                    ? "border-cyan-400/70 bg-cyan-500/15 text-cyan-100"
                    : "border-slate-700 bg-slate-900/70 text-slate-400 hover:border-slate-500 hover:text-slate-200",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <div className="pb-16">
        <Outlet />
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 px-4 py-2 backdrop-blur-lg lg:px-8 2xl:px-12">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="inline-flex items-center gap-2 text-emerald-300">
            <Activity className="h-3.5 w-3.5 animate-pulse" />
            Canlı bağlantı: aktif
          </div>
          <span className="text-muted-foreground">Son güncelleme: {now.toLocaleTimeString("tr-TR")}</span>
          <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-amber-200">Demo veri</span>
          <span className="text-cyan-200">Toplam hacim: ₺{Math.round(marketStats.totalVolumeTry).toLocaleString("tr-TR")}</span>
        </div>
      </footer>

      <ChatWidget />
    </div>
  );
}
