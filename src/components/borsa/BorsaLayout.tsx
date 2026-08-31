import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Activity, Clock3, Search } from "lucide-react";
import { ShareButton } from "@/components/ShareButton";
import { INITIAL_MARKET_ASSETS } from "@/borsa/useLiveMarket";
import { createMarketSnapshot } from "@/lib/borsa/marketData";

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
    <div className="min-h-screen" style={{ background: "var(--zemin)", color: "var(--metin)" }}>
      {/* Site geneli Navbar zaten Layout üzerinden render ediliyor — bu shell
          artık kendi logo/arama-kutusu-dışı/Giriş/Tema/Kullanıcı setini
          TEKRARLAMIYOR (B4.2: çift header). Yalnız Borsa'ya özgü olanlar
          kaldı: varlık arama + canlı saat + paylaş + sekme navigasyonu. */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{ borderColor: "var(--cizgi)", background: "var(--zemin-yumusak)" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-8 2xl:px-12">
          <div
            className="flex min-w-[280px] flex-1 items-center gap-2 rounded-[3px] border px-2 py-1.5 md:max-w-xl"
            style={{ borderColor: "var(--cizgi)", background: "var(--zemin)" }}
          >
            <Search className="h-4 w-4" style={{ color: "var(--metin-ikincil)" }} />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitSearch();
              }}
              placeholder="Kod / lokasyon ara (örn. KADIKÖY, ÇEŞME)"
              className="h-8 w-full bg-transparent text-sm outline-none"
              style={{ color: "var(--metin)" }}
            />
            <button
              type="button"
              onClick={submitSearch}
              className="rounded-[3px] border px-2 py-1 text-[11px] font-normal"
              style={{ borderColor: "var(--cizgi)", color: "var(--metin)" }}
            >
              Ara
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-[3px] border px-2 py-1 text-[11px]"
              style={{ borderColor: "var(--cizgi)", color: "var(--metin-ikincil)" }}
            >
              <Clock3 className="h-3.5 w-3.5" />
              {now.toLocaleTimeString("tr-TR")}
            </span>
            <ShareButton
              title="Ihaleal Borsa"
              url={location.pathname + location.search}
              inviteText="Gayrimenkul Borsasi terminalini inceleyin."
            />
          </div>
        </div>

        <nav className="flex items-center gap-2 overflow-x-auto border-t px-4 py-2 lg:px-8 2xl:px-12" style={{ borderColor: "var(--cizgi)" }}>
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
                className="shrink-0 rounded-[3px] border px-3 py-1.5 text-xs font-normal uppercase tracking-[0.12em] transition"
                style={
                  active
                    ? { borderColor: "var(--metin-ikincil)", background: "var(--zemin)", color: "var(--metin)" }
                    : { borderColor: "var(--cizgi)", color: "var(--metin-ikincil)" }
                }
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

      <footer
        className="fixed bottom-0 start-0 end-0 z-40 border-t px-4 py-2 lg:px-8 2xl:px-12"
        style={{ borderColor: "var(--cizgi)", background: "var(--zemin-yumusak)" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]" style={{ color: "var(--metin-ikincil)" }}>
          <div className="inline-flex items-center gap-2" style={{ color: "var(--metrik-yesil)" }}>
            <Activity className="h-3.5 w-3.5 animate-pulse" />
            Canlı bağlantı: aktif
          </div>
          <span>Son güncelleme: {now.toLocaleTimeString("tr-TR")}</span>
          <span className="rounded-[3px] border px-2 py-0.5" style={{ borderColor: "var(--cizgi)", color: "var(--sinyal-turuncu)" }}>
            Demo veri
          </span>
          <span style={{ color: "var(--metin)" }}>Toplam hacim: ₺{Math.round(marketStats.totalVolumeTry).toLocaleString("tr-TR")}</span>
        </div>
      </footer>
    </div>
  );
}
