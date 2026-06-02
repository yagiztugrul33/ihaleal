import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BarChart3, Bell, Clock3, MapPin, Search, Star, TrendingDown, TrendingUp } from "lucide-react";
import { FxRef } from "@/components/FxRef";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { INITIAL_MARKET_ASSETS, useLiveMarket } from "@/borsa/useLiveMarket";
import type { MarketAsset } from "@/borsa/useLiveMarket";
import {
  IHALEAL_INDEX_DISCLAIMER,
  MASTER_INFO_DISCLAIMER,
  PHYSICAL_ASSET_ONLY_DISCLAIMER,
  PLATFORM_LEGAL_DEFINITION,
  PSP_FLOW_DISCLAIMER,
} from "@/legal/platformDisclaimers";
import "@/borsa/borsa.css";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { createMarketSnapshot } from "@/lib/borsa/marketData";
import { buildOrderBook, maskBidder } from "@/lib/borsa/orderBook";
import { isOutbid } from "@/lib/borsa/auctionEngine";
import { BorsaAnalyticsDashboard } from "@/components/borsa/BorsaAnalyticsDashboard";
import { useLocale } from "@/contexts/LocaleContext";

type TerminalTab = "piyasa" | "varliklar" | "izleme" | "veri";
type MarketTableTab = "en_aktif" | "yukselen" | "dusen" | "cok_islem" | "bitiyor";
type FlashDir = "up" | "down";
type AlertDirection = "above" | "below";
type SortKey = "code" | "property" | "price" | "changePct" | "volume" | "remainingMin";
type SortDir = "asc" | "desc";
type FeedEvent = {
  id: string;
  code: string;
  price: number;
  type: "bid" | "sold";
  dir: FlashDir;
  relative: string;
};
type PriceAlert = {
  id: string;
  assetId: string;
  target: number;
  direction: AlertDirection;
  enabled: boolean;
};
type AutoBidRule = {
  id: string;
  assetId: string;
  maxBid: number;
  stepTry: number;
  enabled: boolean;
};

const REGION_HEAT = [
  { name: "İstanbul Konut", key: "istanbul" },
  { name: "Ege Arsa", key: "ege" },
  { name: "Akdeniz Villa", key: "akdeniz" },
  { name: "Ankara Ofis", key: "ankara" },
  { name: "Bodrum Tatil", key: "bodrum" },
] as const;

const TICKER_CODES = ["KADIKÖY-D", "ÇEŞME-A", "LEVENT-O", "BODRUM-V", "BEŞİKTAŞ-D", "İZMİR-K", "ANKARA-O"] as const;

function formatTry(value: number): string {
  return `₺${Math.round(value).toLocaleString("tr-TR")}`;
}

function getRegionLabel(region: string): string {
  if (region === "istanbul") return "İstanbul";
  if (region === "ege") return "Ege";
  if (region === "akdeniz") return "Akdeniz";
  if (region === "ankara") return "Ankara";
  if (region === "bodrum") return "Bodrum";
  return "Türkiye";
}

function Sparkline({ points, color = "#38bdf8" }: { points: number[]; color?: string }) {
  const data = points.map((v, i) => ({ i, v }));
  return (
    <div className="h-11 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function BorsaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLocale();
  const b = t.borsa;
  const { data, loading, isLive, error: marketError, regionHeat } = useLiveMarket();
  const [tableTab, setTableTab] = useState<MarketTableTab>("en_aktif");
  const [sortKey, setSortKey] = useState<SortKey>("volume");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [tableSearch, setTableSearch] = useState("");
  const [guideOpen, setGuideOpen] = useState(true);
  const [flashRows, setFlashRows] = useState<Record<string, FlashDir>>({});
  const [feedEvents, setFeedEvents] = useState<FeedEvent[]>([]);
  const [watchers, setWatchers] = useState(1892);
  const [summaryFlash, setSummaryFlash] = useState<FlashDir | null>(null);
  const [historyMap, setHistoryMap] = useState<Record<string, number[]>>({});
  const [watchlistIds, setWatchlistIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem("borsa_watchlist_ids");
      if (!raw) return INITIAL_MARKET_ASSETS.slice(0, 3).map((row) => row.id);
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map((x) => String(x)) : [];
    } catch {
      return INITIAL_MARKET_ASSETS.slice(0, 3).map((row) => row.id);
    }
  });
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(() => {
    try {
      const raw = localStorage.getItem("borsa_price_alerts");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as PriceAlert[]) : [];
    } catch {
      return [];
    }
  });
  const [autoBidRules, setAutoBidRules] = useState<AutoBidRule[]>(() => {
    try {
      const raw = localStorage.getItem("borsa_auto_bid_rules");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as AutoBidRule[]) : [];
    } catch {
      return [];
    }
  });
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [alertTarget, setAlertTarget] = useState("");
  const [alertDirection, setAlertDirection] = useState<AlertDirection>("above");
  const [ruleMaxBid, setRuleMaxBid] = useState("");
  const [ruleStep, setRuleStep] = useState("50000");
  const [selectedBookAssetId, setSelectedBookAssetId] = useState("");
  const [myBidDraft, setMyBidDraft] = useState("");
  const [myBidsByAsset, setMyBidsByAsset] = useState<Record<string, number>>(() => {
    try {
      const raw = localStorage.getItem("borsa_my_bid_by_asset");
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? (parsed as Record<string, number>) : {};
    } catch {
      return {};
    }
  });
  const prevRef = useRef<MarketAsset[] | null>(null);
  const activeTab = useMemo<TerminalTab>(() => {
    if (location.pathname.startsWith("/borsa/izleme")) return "izleme";
    if (location.pathname.startsWith("/borsa/veri")) return "veri";
    if (location.pathname.startsWith("/borsa/varliklar")) return "varliklar";
    return "piyasa";
  }, [location.pathname]);
  const q = useMemo(() => new URLSearchParams(location.search).get("q")?.trim().toLocaleLowerCase("tr-TR") ?? "", [location.search]);
  const filteredData = useMemo(() => {
    if (!q) return data;
    return data.filter((item) => {
      const region = getRegionLabel(item.region).toLocaleLowerCase("tr-TR");
      const basis = `${item.code} ${item.property} ${region}`.toLocaleLowerCase("tr-TR");
      return basis.includes(q);
    });
  }, [data, q]);

  useEffect(() => {
    if (!selectedAssetId && data[0]?.id) {
      setSelectedAssetId(data[0].id);
    }
  }, [data, selectedAssetId]);

  useEffect(() => {
    localStorage.setItem("borsa_watchlist_ids", JSON.stringify(watchlistIds));
  }, [watchlistIds]);

  useEffect(() => {
    localStorage.setItem("borsa_price_alerts", JSON.stringify(priceAlerts));
  }, [priceAlerts]);

  useEffect(() => {
    localStorage.setItem("borsa_auto_bid_rules", JSON.stringify(autoBidRules));
  }, [autoBidRules]);

  useEffect(() => {
    localStorage.setItem("borsa_my_bid_by_asset", JSON.stringify(myBidsByAsset));
  }, [myBidsByAsset]);

  useEffect(() => {
    setHistoryMap((prev) => {
      const next = { ...prev };
      filteredData.forEach((item) => {
        const arr = [...(next[item.id] ?? []), item.price].slice(-12);
        next[item.id] = arr;
      });
      return next;
    });
  }, [filteredData]);

  useEffect(() => {
    const prev = prevRef.current;
    if (!prev) {
      prevRef.current = filteredData;
      return;
    }
    const prevMap = new Map(prev.map((p) => [p.id, p]));
    const nextFlash: Record<string, FlashDir> = {};
    const nextEvents: FeedEvent[] = [];
    filteredData.forEach((item) => {
      const before = prevMap.get(item.id);
      if (!before || before.price === item.price) return;
      nextFlash[item.id] = item.dir;
      const sold = item.dir === "down" && item.changePct <= -0.5;
      nextEvents.push({
        id: `${item.id}-${Date.now()}`,
        code: item.code,
        price: item.price,
        type: sold ? "sold" : "bid",
        dir: item.dir,
        relative: "az önce",
      });
    });
    if (Object.keys(nextFlash).length > 0) {
      setFlashRows((prevFlash) => ({ ...prevFlash, ...nextFlash }));
      const upCount = Object.values(nextFlash).filter((value) => value === "up").length;
      setSummaryFlash(upCount >= Math.ceil(Object.keys(nextFlash).length / 2) ? "up" : "down");
      window.setTimeout(() => {
        setFlashRows((prevFlash) => {
          const cloned = { ...prevFlash };
          Object.keys(nextFlash).forEach((id) => delete cloned[id]);
          return cloned;
        });
      }, 600);
      window.setTimeout(() => setSummaryFlash(null), 600);
      setWatchers((p) => Math.max(1, p + (item.dir === "up" ? 1 : 0)));
    }
    if (nextEvents.length > 0) {
      setFeedEvents((prevEvents) => [...nextEvents, ...prevEvents].slice(0, 8));
    }
    prevRef.current = filteredData;
  }, [filteredData]);

  const tickerRows = useMemo(
    () => TICKER_CODES.map((code) => filteredData.find((d) => d.code === code)).filter((x): x is MarketAsset => Boolean(x)),
    [filteredData],
  );

  const totalVolume = useMemo(() => filteredData.reduce((acc, row) => acc + row.volume, 0), [filteredData]);
  const averageChange = useMemo(
    () => filteredData.reduce((acc, row) => acc + row.changePct, 0) / Math.max(1, filteredData.length),
    [filteredData],
  );
  const marketSnapshot = useMemo(
    () =>
      createMarketSnapshot(
        filteredData.map((row) => ({
          id: row.id,
          code: row.code,
          property: row.property,
          price: row.price,
          changePct: row.changePct,
          volume: row.volume,
        })),
      ),
    [filteredData],
  );

  const summaryCards = useMemo(
    () => [
      { key: "volume", label: "Toplam İşlem Hacmi", value: totalVolume.toLocaleString("tr-TR"), points: filteredData.map((d) => d.volume), color: "#38bdf8" },
      { key: "active", label: "Aktif Varlık", value: String(filteredData.length), points: filteredData.map((d) => d.price / 1_000_000), color: "#22d3ee" },
      { key: "avg", label: "Ort. Değişim%", value: `${averageChange >= 0 ? "+" : ""}${averageChange.toFixed(2)}%`, points: filteredData.map((d) => d.changePct), color: averageChange >= 0 ? "#22c55e" : "#f43f5e" },
      { key: "watchers", label: "İzleyen", value: watchers.toLocaleString("tr-TR"), points: filteredData.map((_, i) => watchers - (filteredData.length - i) * 2), color: "#c084fc" },
    ],
    [averageChange, filteredData, totalVolume, watchers],
  );

  const regionIndexes = useMemo(() => {
    const grouped = REGION_HEAT.map((meta) => {
      const dbStat = isLive ? regionHeat.find((r) => r.key === meta.key) : undefined;
      const rows = filteredData.filter((d) => d.region === meta.key);
      const index =
        dbStat && dbStat.index > 0
          ? dbStat.index
          : rows.reduce((acc, r) => acc + r.price, 0) / Math.max(1, rows.length);
      const change =
        dbStat && (dbStat.change !== 0 || rows.length === 0)
          ? dbStat.change
          : rows.reduce((acc, r) => acc + r.changePct, 0) / Math.max(1, rows.length);
      const trend = rows.flatMap((r) => historyMap[r.id] ?? []).slice(-10);
      return { ...meta, index, change, trend: trend.length ? trend : [index] };
    });
    return grouped;
  }, [filteredData, historyMap, isLive, regionHeat]);

  const heatCells = useMemo(
    () =>
      regionIndexes.map((item) => ({
        ...item,
        tone:
          item.change > 0.4
            ? "bg-emerald-500/35 border-emerald-400/40"
            : item.change < -0.4
              ? "bg-rose-500/35 border-rose-400/40"
              : "bg-slate-700/50 border-slate-500/40",
      })),
    [regionIndexes],
  );
  const bestRisers = useMemo(() => [...filteredData].sort((a, b) => b.changePct - a.changePct).slice(0, 3), [filteredData]);
  const endingSoon = useMemo(() => [...filteredData].sort((a, b) => a.remainingMin - b.remainingMin).slice(0, 3), [filteredData]);

  const tableRows = useMemo(() => {
    const normalizedSearch = tableSearch.trim().toLocaleLowerCase("tr-TR");
    let rows = [...filteredData];
    if (normalizedSearch) {
      rows = rows.filter((row) =>
        `${row.code} ${row.property} ${getRegionLabel(row.region)}`
          .toLocaleLowerCase("tr-TR")
          .includes(normalizedSearch),
      );
    }
    if (tableTab === "en_aktif") {
      rows = rows.sort((a, b) => b.volume - a.volume);
    }
    if (tableTab === "yukselen") {
      rows = rows.sort((a, b) => b.changePct - a.changePct);
    }
    if (tableTab === "dusen") {
      rows = rows.sort((a, b) => a.changePct - b.changePct);
    }
    if (tableTab === "cok_islem") {
      rows = rows.sort((a, b) => b.volume - a.volume);
    }
    if (tableTab === "bitiyor") {
      rows = rows.sort((a, b) => a.remainingMin - b.remainingMin);
    }

    const dirMultiplier = sortDir === "asc" ? 1 : -1;
    rows.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv, "tr") * dirMultiplier;
      return ((Number(av) || 0) - (Number(bv) || 0)) * dirMultiplier;
    });
    return rows;
  }, [filteredData, sortDir, sortKey, tableSearch, tableTab]);

  const sectionTitle =
    tableTab === "en_aktif"
      ? "En Aktif"
      : tableTab === "yukselen"
        ? "Yükselen"
        : tableTab === "dusen"
          ? "Düşen"
          : tableTab === "cok_islem"
            ? "Çok İşlem"
            : "Bitiyor";
  const watchlistRows = useMemo(
    () => filteredData.filter((row) => watchlistIds.includes(row.id)),
    [filteredData, watchlistIds],
  );
  const activeAlerts = useMemo(
    () =>
      priceAlerts
        .filter((alert) => alert.enabled)
        .map((alert) => {
          const asset = filteredData.find((row) => row.id === alert.assetId);
          if (!asset) return { ...alert, hit: false, current: 0, code: "—" };
          const hit = alert.direction === "above" ? asset.price >= alert.target : asset.price <= alert.target;
          return { ...alert, hit, current: asset.price, code: asset.code };
        }),
    [filteredData, priceAlerts],
  );

  useEffect(() => {
    if (!selectedBookAssetId && tableRows[0]?.id) {
      setSelectedBookAssetId(tableRows[0].id);
    }
  }, [selectedBookAssetId, tableRows]);

  const selectedBookAsset = useMemo(
    () => filteredData.find((row) => row.id === selectedBookAssetId) ?? tableRows[0] ?? null,
    [filteredData, selectedBookAssetId, tableRows],
  );

  const orderBookLevels = useMemo(() => {
    if (!selectedBookAsset) return [];
    const seed = Array.from({ length: 6 }, (_, idx) => {
      const spread = (idx + 1) * 10_000;
      const bidPrice = Math.max(1, Math.round(selectedBookAsset.price - spread));
      const askPrice = Math.round(selectedBookAsset.price + spread);
      const bidVolume = Math.max(1, Math.round(selectedBookAsset.volume / (18 + idx * 3)));
      const askVolume = Math.max(1, Math.round(selectedBookAsset.volume / (20 + idx * 3)));
      return {
        bid: { bidder: `${selectedBookAsset.code}-B${idx + 1}`, price: bidPrice, quantity: bidVolume, side: "bid" as const },
        ask: { bidder: `${selectedBookAsset.code}-A${idx + 1}`, price: askPrice, quantity: askVolume, side: "ask" as const },
      };
    });
    const book = buildOrderBook(seed.flatMap((item) => [item.bid, item.ask]));
    const maxLen = Math.max(book.bids.length, book.asks.length);
    return Array.from({ length: maxLen }, (_, idx) => ({
      level: idx + 1,
      bidPrice: book.bids[idx]?.price ?? 0,
      askPrice: book.asks[idx]?.price ?? 0,
      bidVolume: book.bids[idx]?.quantity ?? 0,
      askVolume: book.asks[idx]?.quantity ?? 0,
      bidderMask: maskBidder(`${selectedBookAsset.code}${idx + 1}`),
    }));
  }, [selectedBookAsset]);
  const myOrderBid = selectedBookAsset ? myBidsByAsset[selectedBookAsset.id] ?? null : null;
  const myOrderRank = selectedBookAsset && myOrderBid
    ? Math.max(1, orderBookLevels.filter((level) => level.bidPrice > myOrderBid).length + 1)
    : null;
  const currentlyOutbid = selectedBookAsset
    ? isOutbid(myOrderBid, orderBookLevels[0]?.bidPrice ?? selectedBookAsset.price)
    : false;
  const myOrderStatus =
    selectedBookAsset && myOrderBid
      ? currentlyOutbid
        ? "geçildin"
        : "kazanıyorsun"
      : null;

  const toggleWatchlist = (assetId: string) => {
    setWatchlistIds((prev) => (prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId]));
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(key === "code" || key === "property" ? "asc" : "desc");
  };

  const submitMyOrderBid = () => {
    if (!selectedBookAsset) return;
    const normalized = Number(myBidDraft.replace(/[^\d]/g, ""));
    if (!Number.isFinite(normalized) || normalized <= 0) return;
    setMyBidsByAsset((prev) => ({ ...prev, [selectedBookAsset.id]: normalized }));
    setMyBidDraft("");
  };

  const createPriceAlert = () => {
    const target = Number(alertTarget);
    if (!selectedAssetId || !Number.isFinite(target) || target <= 0) return;
    setPriceAlerts((prev) => [
      {
        id: `${selectedAssetId}-${Date.now()}`,
        assetId: selectedAssetId,
        target,
        direction: alertDirection,
        enabled: true,
      },
      ...prev,
    ]);
    setAlertTarget("");
  };

  const createAutoBidRule = () => {
    const maxBid = Number(ruleMaxBid);
    const stepTry = Number(ruleStep);
    if (!selectedAssetId || !Number.isFinite(maxBid) || maxBid <= 0 || !Number.isFinite(stepTry) || stepTry <= 0) return;
    setAutoBidRules((prev) => [
      {
        id: `${selectedAssetId}-${Date.now()}`,
        assetId: selectedAssetId,
        maxBid,
        stepTry,
        enabled: true,
      },
      ...prev,
    ]);
    setRuleMaxBid("");
  };

  return (
    <main className="borsa-root w-full space-y-4 px-4 py-4 text-slate-100 lg:px-8 2xl:px-12">
        <section className="grid gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,1fr)]">
          <article className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 to-slate-950 p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-200">Gayrimenkul Borsası</p>
            <h1 className="mt-1 text-2xl font-black text-white lg:text-3xl">Canlı terminale hoş geldiniz</h1>
            <p className="mt-2 text-sm text-slate-300">
              Kod, fiyat, değişim ve hacim birlikte okunur. Yeşil yükselişi, kırmızı düşüşü gösterir; satır tıklayınca teklif akışına geçersiniz.
            </p>
            <button
              type="button"
              onClick={() => setGuideOpen((prev) => !prev)}
              className="mt-3 inline-flex rounded-md border border-cyan-400/45 bg-cyan-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-100"
            >
              Nasıl okunur? {guideOpen ? "Gizle" : "Göster"}
            </button>
            {guideOpen ? (
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-emerald-200">Yeşil / Kırmızı</p>
                  <p className="mt-1 text-xs text-slate-300">Yeşil yükseliş, kırmızı geri çekilme; trend yönünü tek bakışta okursun.</p>
                </div>
                <div className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 p-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-cyan-200">Kod ve Hacim</p>
                  <p className="mt-1 text-xs text-slate-300">Kod varlığın kısa kimliği; hacim o varlıkta işlem derinliğini gösterir.</p>
                </div>
                <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-amber-200">{b.bidStream}</p>
                  <p className="mt-1 text-xs text-slate-300">Satırı aç, order book ve süreyi incele, sonra detaydan teklif ver.</p>
                </div>
              </div>
            ) : null}
          </article>
          <article className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-black uppercase tracking-[0.13em] text-slate-200">Bugünün Fırsatları</h2>
            <div className="mt-3 space-y-2">
              {bestRisers.map((row) => (
                <button
                  key={`riser-${row.id}`}
                  type="button"
                  onClick={() => navigate(`/borsa/varlik/${row.id}`)}
                  className="flex w-full items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-left transition hover:bg-emerald-500/20"
                >
                  <span className="text-xs font-semibold text-emerald-100">{row.code}</span>
                  <span className="text-xs font-bold text-emerald-200">+{row.changePct.toFixed(2)}%</span>
                </button>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              {endingSoon.map((row) => (
                <button
                  key={`ending-${row.id}`}
                  type="button"
                  onClick={() => navigate(`/borsa/varlik/${row.id}`)}
                  className="flex w-full items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-left transition hover:bg-amber-500/20"
                >
                  <span className="text-xs font-semibold text-amber-100">{row.code}</span>
                  <span className="text-xs font-bold text-amber-200">{Math.floor(row.remainingMin / 60)}s {row.remainingMin % 60}dk</span>
                </button>
              ))}
            </div>
          </article>
        </section>

        <section className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-2.5 text-[11px] leading-relaxed text-amber-100">
          <p>{PLATFORM_LEGAL_DEFINITION}</p>
          <p className="mt-1">{MASTER_INFO_DISCLAIMER}</p>
          <p className="mt-1">{PSP_FLOW_DISCLAIMER}</p>
          <p className="mt-1">{PHYSICAL_ASSET_ONLY_DISCLAIMER}</p>
        </section>
        <section className="borsa-card rounded-xl p-3">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-200">{b.marketTicker}</h2>
            <span className="text-[11px] text-slate-400">CANLI</span>
          </div>
          <div className="borsa-ticker" data-testid="borsa-ticker">
            <div className="borsa-ticker__track" data-testid="borsa-ticker-track">
              {[0, 1].map((dup) =>
                tickerRows.map((row) => {
                  const up = row.changePct >= 0;
                  return (
                    <div
                      key={`${dup}-${row.code}`}
                      className={cn("borsa-chip", up ? "borsa-chip--up" : "borsa-chip--down")}
                      title={`${row.property} · ${getRegionLabel(row.region)} · ${formatTry(row.price)}`}
                    >
                      <span>{row.code}</span>
                      <span>{formatTry(row.price)}</span>
                      <span className="inline-flex items-center gap-1">
                        {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                        {up ? "+" : ""}
                        {row.changePct.toFixed(2)}%
                      </span>
                    </div>
                  );
                }),
              )}
            </div>
          </div>
        </section>

        {/* Dalga 3-2: Şehir endeksi hızlı geçiş şeridi — /borsa/sehir/:il drilldown */}
        <section className="rounded-xl border border-cyan-500/25 bg-slate-900/45 px-3 py-2.5" data-testid="borsa-city-ribbon">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
            <h2 className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-200">Şehir Endeksleri</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 hidden sm:inline">Şehir tıkla → endeks + ilçe + ilanlar</span>
              <button
                type="button"
                onClick={() => navigate("/raporlar")}
                className="inline-flex items-center gap-1 rounded-md border border-violet-400/40 bg-violet-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-violet-200 hover:bg-violet-500/20"
                data-testid="raporlar-link"
              >
                <BarChart3 className="w-3 h-3" /> Aylık raporları gör
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { slug: "istanbul", label: "İstanbul" },
              { slug: "ankara", label: "Ankara" },
              { slug: "izmir", label: "İzmir" },
              { slug: "bursa", label: "Bursa" },
              { slug: "antalya", label: "Antalya" },
              { slug: "adana", label: "Adana" },
              { slug: "konya", label: "Konya" },
              { slug: "gaziantep", label: "Gaziantep" },
              { slug: "kocaeli", label: "Kocaeli" },
              { slug: "mugla", label: "Muğla" },
            ].map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => navigate(`/borsa/sehir/${c.slug}`)}
                className="inline-flex items-center gap-1 rounded-full border border-slate-700/60 bg-slate-950/50 px-2.5 py-1 text-[11px] text-slate-200 hover:border-cyan-400/40 hover:text-cyan-200 transition-colors"
              >
                <MapPin className="w-3 h-3" /> {c.label}
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <article
              key={card.key}
              className={cn(
                "borsa-card rounded-xl p-3",
                summaryFlash === "up" && "borsa-flash-up",
                summaryFlash === "down" && "borsa-flash-down",
              )}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-slate-400">{card.label}</p>
              <p className="mt-1 text-2xl font-black text-white">{card.value}</p>
              <Sparkline points={card.points} color={card.color} />
            </article>
          ))}
        </section>

        <section
          className={cn(
            "grid gap-3 xl:grid-cols-5",
            activeTab !== "piyasa" && activeTab !== "varliklar" && "hidden",
          )}
        >
          <article className="borsa-card rounded-xl p-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-cyan-200">{b.marketSummary}</p>
            <p className="mt-2 text-xs text-slate-300">{b.totalVolume}: <strong className="text-white" dir="ltr">₺{marketSnapshot.totalVolumeTry.toLocaleString("tr-TR")}</strong></p>
            <p className="mt-1 text-xs text-slate-300">{b.tradeCount}: <strong className="text-white" dir="ltr">{marketSnapshot.tradeCount.toLocaleString("tr-TR")}</strong></p>
            <p className="mt-1 text-xs text-slate-300">Ort. işlem: <strong className="text-white">₺{marketSnapshot.averageTradeSizeTry.toLocaleString("tr-TR")}</strong></p>
            <p className="mt-1 text-xs text-slate-300">{b.activeOrders}: <strong className="text-white" dir="ltr">{marketSnapshot.activeOrders.toLocaleString("tr-TR")}</strong></p>
          </article>
          <article className="borsa-card rounded-xl p-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-200">Likidite & Derinlik</p>
            <p className="mt-2 text-xs text-slate-300">Spread: <strong className="text-white">₺{marketSnapshot.liquidity.spread.toLocaleString("tr-TR")}</strong></p>
            <p className="mt-1 text-xs text-slate-300">Derinlik: <strong className="text-white">{marketSnapshot.liquidity.depth.toLocaleString("tr-TR")} lot</strong></p>
            <p className="mt-1 text-xs text-slate-300">En likit 3: <strong className="text-white">{marketSnapshot.liquidity.mostLiquidCodes.join(" · ")}</strong></p>
          </article>
          <article className="borsa-card rounded-xl p-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-amber-200">Fiyat Hareketi</p>
            <p className="mt-2 text-xs text-slate-300">Gün yüksek/düşük: <strong className="text-white">{formatTry(marketSnapshot.range.dayHigh)}<FxRef amountTry={marketSnapshot.range.dayHigh} variant="compact" /> / {formatTry(marketSnapshot.range.dayLow)}<FxRef amountTry={marketSnapshot.range.dayLow} variant="compact" /></strong></p>
            <p className="mt-1 text-xs text-slate-300">{b.openClose}: <strong className="text-white" dir="ltr">{formatTry(marketSnapshot.range.open)}<FxRef amountTry={marketSnapshot.range.open} variant="compact" /> / {formatTry(marketSnapshot.range.close)}<FxRef amountTry={marketSnapshot.range.close} variant="compact" /></strong></p>
            <p className="mt-1 text-xs text-slate-300">Volatilite: <strong className="text-white">{marketSnapshot.volatility.marketStdDev.toLocaleString("tr-TR")}</strong></p>
          </article>
          <article className="borsa-card rounded-xl p-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-violet-200">{b.marketBreadth}</p>
            <p className="mt-2 text-xs text-slate-300">Yükselen: <strong className="text-emerald-300">{marketSnapshot.breadth.rising}</strong></p>
            <p className="mt-1 text-xs text-slate-300">Düşen: <strong className="text-rose-300">{marketSnapshot.breadth.falling}</strong></p>
            <p className="mt-1 text-xs text-slate-300">Sabit: <strong className="text-white">{marketSnapshot.breadth.flat}</strong></p>
            <p className="mt-1 text-xs text-slate-300">En çok işlem: <strong className="text-white">{marketSnapshot.liquidity.mostLiquidCodes.join(", ")}</strong></p>
          </article>
          <article className="borsa-card rounded-xl p-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-cyan-200">Segment Dağılımı</p>
            <p className="mt-2 text-xs text-slate-300">Konut: <strong className="text-white">%{marketSnapshot.segmentDistributionPct.konut.toLocaleString("tr-TR")}</strong></p>
            <p className="mt-1 text-xs text-slate-300">Ticari: <strong className="text-white">%{marketSnapshot.segmentDistributionPct.ticari.toLocaleString("tr-TR")}</strong></p>
            <p className="mt-1 text-xs text-slate-300">Arsa: <strong className="text-white">%{marketSnapshot.segmentDistributionPct.arsa.toLocaleString("tr-TR")}</strong></p>
            <p className="mt-1 text-xs text-slate-300">Turizm: <strong className="text-white">%{marketSnapshot.segmentDistributionPct.turizm.toLocaleString("tr-TR")}</strong></p>
          </article>
        </section>

        <section
          className={cn(
            "grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,1fr)]",
            activeTab !== "piyasa" && activeTab !== "varliklar" && "hidden",
          )}
        >
          <div className="min-w-0 space-y-4">
            <article className="borsa-card rounded-xl p-3">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-[0.13em] text-slate-200">Varlık Tablosu</h3>
                <span className="text-xs text-slate-400">{sectionTitle}</span>
              </div>
              <div className="mb-3 flex flex-wrap gap-2">
                {[
                  { id: "en_aktif", label: "En Aktif" },
                  { id: "yukselen", label: "Yükselen" },
                  { id: "dusen", label: "Düşen" },
                  { id: "cok_islem", label: "Çok İşlem" },
                  { id: "bitiyor", label: "Bitiyor" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={cn(
                      "rounded-md border px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.11em]",
                      tableTab === tab.id
                        ? "border-cyan-400/70 bg-cyan-500/15 text-cyan-200"
                        : "border-slate-700 bg-slate-900/70 text-slate-400",
                    )}
                    onClick={() => setTableTab(tab.id as MarketTableTab)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <div className="inline-flex min-w-[220px] flex-1 items-center gap-2 rounded-md border border-slate-700 bg-slate-900/70 px-2 py-1.5">
                  <Search className="h-3.5 w-3.5 text-slate-400" />
                  <input
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    placeholder="Kod / mülk / lokasyon ara"
                    className="w-full bg-transparent text-xs text-slate-200 placeholder:text-slate-500 outline-none"
                  />
                </div>
                <span className="text-[11px] text-slate-400">{tableRows.length} sonuç</span>
              </div>
              <div className="overflow-x-auto">
                <table className="pro-table min-w-[860px] w-full text-sm">
                  <thead className="text-left text-[11px] uppercase tracking-[0.12em] text-slate-400">
                    <tr>
                      <th className="pb-2 pr-3" title="Favori">★</th>
                      <th className="pb-2 pr-3" title="Borsadaki kısa varlık kodu">
                        <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort("code")}>
                          Kod {sortKey === "code" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                        </button>
                      </th>
                      <th className="pb-2 pr-3" title="İlan başlığı ve mülk tipi">
                        <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort("property")}>
                          Mülk {sortKey === "property" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                        </button>
                      </th>
                      <th className="pb-2 pr-3" title="Son gerçekleşen teklif/fiyat">
                        <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort("price")}>
                          Güncel ₺ {sortKey === "price" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                        </button>
                      </th>
                      <th className="pb-2 pr-3" title="Başlangıça göre yüzde değişim">
                        <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort("changePct")}>
                          24s Değişim% {sortKey === "changePct" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                        </button>
                      </th>
                      <th className="pb-2 pr-3" title="Son penceredeki işlem yoğunluğu (lot)">
                        <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort("volume")}>
                          Hacim {sortKey === "volume" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                        </button>
                      </th>
                      <th className="pb-2 pr-3" title="İhalenin kapanmasına kalan süre">
                        <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort("remainingMin")}>
                          Süre {sortKey === "remainingMin" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                        </button>
                      </th>
                      <th className="pb-2" title="Hızlı işlem düğmeleri">Aksiyon</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((row) => {
                      const up = row.changePct >= 0;
                      return (
                        <tr
                          key={row.id}
                          className={cn(
                            "cursor-pointer border-t border-slate-800/80 transition hover:bg-slate-900/70",
                            flashRows[row.id] === "up" && "borsa-flash-up",
                            flashRows[row.id] === "down" && "borsa-flash-down",
                          )}
                          onClick={() => {
                            setSelectedBookAssetId(row.id);
                            navigate(`/borsa/varlik/${row.id}`);
                          }}
                        >
                          <td className="py-2.5 pr-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleWatchlist(row.id);
                              }}
                              className={cn(
                                "inline-flex h-6 w-6 items-center justify-center rounded border text-[10px]",
                                watchlistIds.includes(row.id)
                                  ? "border-amber-400/60 bg-amber-500/20 text-amber-200"
                                  : "border-slate-600 bg-slate-900/60 text-slate-500",
                              )}
                              title={watchlistIds.includes(row.id) ? "Favoriden çıkar" : "Favoriye ekle"}
                            >
                              <Star className="h-3.5 w-3.5" fill={watchlistIds.includes(row.id) ? "currentColor" : "none"} />
                            </button>
                          </td>
                          <td className="py-2.5 pr-3 font-semibold text-cyan-200">{row.code}</td>
                          <td className="py-2.5 pr-3 text-slate-200">{row.property}</td>
                          <td className="py-2.5 pr-3 font-bold text-white">{formatTry(row.price)}<FxRef amountTry={row.price} variant="compact" /></td>
                          <td className={cn("py-2.5 pr-3 font-bold", up ? "text-emerald-300" : "text-rose-300")}>
                            {up ? "+" : ""}
                            {row.changePct.toFixed(2)}%
                          </td>
                          <td className="py-2.5 pr-3 text-slate-300">{row.volume.toLocaleString("tr-TR")}</td>
                          <td className="py-2.5 pr-3 text-slate-300">{Math.floor(row.remainingMin / 60)}s {row.remainingMin % 60}dk</td>
                          <td className="py-2.5">
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/borsa/varlik/${row.id}`);
                                }}
                                className="rounded-md border border-cyan-400/50 bg-cyan-500/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-cyan-100"
                              >
                                Detay
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/borsa/varlik/${row.id}?intent=bid`);
                                }}
                                className="rounded-md border border-emerald-400/50 bg-emerald-500/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-100"
                              >
                                Teklif Ver
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </article>

            <article className="borsa-card rounded-xl p-3">
              <h3 className="mb-3 text-sm font-black uppercase tracking-[0.13em] text-slate-200">Bölge Endeksleri</h3>
              <p className="mb-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-2 text-[11px] text-amber-100">
                İhaleal Endeksi: {IHALEAL_INDEX_DISCLAIMER}
              </p>
              <p className="mb-2 text-xs text-slate-300">
                Endeks yukarıysa o bölgede teklif iştahı artıyor, aşağıysa fiyatlama daha seçici ilerliyor.
              </p>
              <div className="space-y-2">
                {regionIndexes.map((idx) => {
                  const up = idx.change >= 0;
                  return (
                    <div key={idx.name} className="grid grid-cols-[1.1fr_auto_auto_100px] items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900/65 px-3 py-2">
                      <span className="text-sm text-slate-200">{idx.name}</span>
                      <span className="text-sm font-bold text-white">{formatTry(idx.index)}</span>
                      <span className={cn("text-xs font-bold", up ? "text-emerald-300" : "text-rose-300")}>
                        {up ? "+" : ""}
                        {idx.change.toFixed(2)}%
                      </span>
                      <Sparkline points={idx.trend} color={up ? "#22c55e" : "#f43f5e"} />
                    </div>
                  );
                })}
              </div>
            </article>
          </div>

          <div className="min-w-0 space-y-4">
            <article className="borsa-card rounded-xl p-3">
              <h3 className="mb-3 text-sm font-black uppercase tracking-[0.13em] text-slate-200">Isı Haritası</h3>
              <p className="mb-2 text-xs text-slate-300">
                Isı haritası bölgesel momentumu görselleştirir: daha canlı ton daha güçlü fiyat hareketini gösterir.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {heatCells.map((cell) => (
                  <div
                    key={cell.name}
                    className={cn("rounded-lg border px-3 py-2.5 transition", cell.tone)}
                    title={`${cell.name} · ${formatTry(cell.index)} · ${cell.change.toFixed(2)}%`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-100">{cell.name}</p>
                    <p className="mt-1 text-lg font-black text-white">{formatTry(cell.index)}</p>
                    <p className={cn("text-xs font-bold", cell.change >= 0 ? "text-emerald-200" : "text-rose-200")}>
                      {cell.change >= 0 ? "+" : ""}
                      {cell.change.toFixed(2)}%
                    </p>
                  </div>
                ))}
              </div>
            </article>

            <article className="borsa-card rounded-xl p-3">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-[0.13em] text-slate-200">Canlı Piyasa Akışı</h3>
                <BarChart3 className="h-4 w-4 text-cyan-300" />
              </div>
              <div className="space-y-2">
                {feedEvents.length === 0 ? (
                  <p className="rounded-lg border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-xs text-slate-400">
                    Akış bekleniyor...
                  </p>
                ) : (
                  feedEvents.slice(0, 8).map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-xs",
                        event.type === "sold"
                          ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                          : event.dir === "up"
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                            : "border-rose-500/40 bg-rose-500/10 text-rose-200",
                      )}
                    >
                      <p className="font-semibold">
                        {event.code} {event.type === "sold" ? "●SATILDI" : `${formatTry(event.price)} teklif`}
                      </p>
                      <p className="mt-0.5 text-slate-300">{event.relative}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                <Clock3 className="h-3.5 w-3.5" />
                Anlık güncelleme periyodu: 2.5 sn
              </div>
            </article>

            <article className="borsa-card rounded-xl p-3">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-[0.13em] text-slate-200">{b.orderBookPreviewMasked}</h3>
                <span className="text-[11px] text-slate-300">{selectedBookAsset?.code ?? "—"}</span>
              </div>
              <div className="mb-3 rounded-lg border border-cyan-400/30 bg-cyan-500/10 p-2 text-xs">
                <p className="text-cyan-100">
                  Kendi teklifin:
                  {myOrderBid ? <> {formatTry(myOrderBid)}<FxRef amountTry={myOrderBid} variant="compact" /> · {myOrderRank ?? "-"}. sıradasın</> : " henüz yok"}
                </p>
                <p className={cn("mt-1", myOrderStatus === "kazanıyorsun" ? "text-emerald-200" : "text-amber-200")}>
                  {myOrderStatus
                    ? `${myOrderStatus} · ${watchers.toLocaleString("tr-TR")} kişi izliyor`
                    : `Teklif ver, sıranı canlı takip et · ${watchers.toLocaleString("tr-TR")} kişi izliyor`}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <input
                    value={myBidDraft}
                    onChange={(e) => setMyBidDraft(e.target.value)}
                    placeholder="Kendi teklifin (₺)"
                    className="min-w-[10rem] flex-1 rounded-md border border-cyan-400/40 bg-secondary px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground"
                  />
                  <button
                    type="button"
                    onClick={submitMyOrderBid}
                    className="rounded-md border border-cyan-400/60 bg-cyan-500/20 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-cyan-100"
                  >
                    Teklifimi Kaydet
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="text-left uppercase tracking-[0.1em] text-slate-300">
                    <tr>
                      <th className="pb-2 pr-2">Seviye</th>
                      <th className="pb-2 pr-2">Alış ₺</th>
                      <th className="pb-2 pr-2">Lot</th>
                      <th className="pb-2 pr-2">Satış ₺</th>
                      <th className="pb-2 pr-2">Lot</th>
                      <th className="pb-2">{b.bidder}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderBookLevels.map((level) => (
                      <tr key={level.level} className="border-t border-slate-800/80 text-slate-200">
                        <td className="py-1.5 pr-2">{level.level}</td>
                        <td className="py-1.5 pr-2 text-emerald-300">{formatTry(level.bidPrice)}<FxRef amountTry={level.bidPrice} variant="compact" /></td>
                        <td className="py-1.5 pr-2">{level.bidVolume.toLocaleString("tr-TR")}</td>
                        <td className="py-1.5 pr-2 text-rose-300">{formatTry(level.askPrice)}<FxRef amountTry={level.askPrice} variant="compact" /></td>
                        <td className="py-1.5 pr-2">{level.askVolume.toLocaleString("tr-TR")}</td>
                        <td className="py-1.5 text-slate-300">{level.bidderMask}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-[11px] text-slate-300">
                Gizlilik gereği kullanıcı kimlikleri maskelidir (`A***z`). Açık artırmada order book görünür; pazarlık modunda teklifler özel kalır.
              </p>
            </article>

            <article className="borsa-card rounded-xl p-3">
              <h3 className="text-sm font-black uppercase tracking-[0.13em] text-slate-200">Nasıl Teklif Veririm?</h3>
              <ol className="mt-3 space-y-2 text-xs text-slate-300">
                <li className="rounded-lg border border-slate-700/80 bg-slate-900/70 p-2.5">1) Varlığı incele: tablo satırından ilan detayını aç.</li>
                <li className="rounded-lg border border-slate-700/80 bg-slate-900/70 p-2.5">2) Stratejini kur: order book ve süreye göre teklif aralığını belirle.</li>
                <li className="rounded-lg border border-slate-700/80 bg-slate-900/70 p-2.5">3) Aksiyon al: "Teklif Ver" ile ihaleye gir, "İzle" ile takibe al.</li>
              </ol>
              <div className="mt-3 grid gap-2">
                <Button type="button" className="h-9 text-xs font-semibold" onClick={() => navigate("/nasil-calisir")}>
                  Borsa Nasıl Çalışır
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 border-cyan-400/60 bg-cyan-500/10 text-xs font-semibold text-cyan-100"
                  onClick={() => navigate("/")}
                >
                  AI Asistanına Sor
                </Button>
              </div>
            </article>
          </div>
        </section>

        <section className={cn("grid gap-4 xl:grid-cols-[1.4fr_1fr]", activeTab !== "izleme" && "hidden")}>
          <article className="borsa-card rounded-xl p-3">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-[0.13em] text-slate-200">İzleme Listesi</h3>
              <span className="text-xs text-slate-400">{watchlistRows.length} varlık</span>
            </div>
            <div className="space-y-2">
              {filteredData.map((row) => {
                const selected = watchlistIds.includes(row.id);
                return (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => toggleWatchlist(row.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition",
                      selected
                        ? "border-cyan-400/60 bg-cyan-500/10 text-cyan-100"
                        : "border-slate-700/80 bg-slate-900/70 text-slate-200 hover:border-slate-500",
                    )}
                  >
                    <span className="font-semibold">{row.code}</span>
                    <span className="text-xs">{selected ? "İzleniyor" : "İzle"}</span>
                  </button>
                );
              })}
            </div>
          </article>

          <article className="borsa-card rounded-xl p-3">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-[0.13em] text-slate-200">Fiyat Alarmı</h3>
              <Bell className="h-4 w-4 text-cyan-300" />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="rounded-md border border-border bg-secondary px-2.5 py-2 text-sm text-foreground"
              >
                {filteredData.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.code}
                  </option>
                ))}
              </select>
              <select
                value={alertDirection}
                onChange={(e) => setAlertDirection(e.target.value as AlertDirection)}
                className="rounded-md border border-border bg-secondary px-2.5 py-2 text-sm text-foreground"
              >
                <option value="above">Üzeri</option>
                <option value="below">Altı</option>
              </select>
              <input
                value={alertTarget}
                onChange={(e) => setAlertTarget(e.target.value)}
                placeholder="Hedef fiyat (₺)"
                className="rounded-md border border-border bg-secondary px-2.5 py-2 text-sm text-foreground placeholder:text-muted-foreground sm:col-span-2"
              />
              <button
                type="button"
                onClick={createPriceAlert}
                className="rounded-md border border-cyan-400/60 bg-cyan-500/15 px-2.5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-100 sm:col-span-2"
              >
                Alarm Ekle
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {activeAlerts.length === 0 ? (
                <p className="rounded-lg border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-xs text-slate-400">
                  Henüz aktif alarm yok.
                </p>
              ) : (
                activeAlerts.map((alert) => (
                  <div key={alert.id} className="rounded-lg border border-slate-700/80 bg-slate-900/70 px-3 py-2">
                    <p className="text-xs font-semibold text-slate-100">
                      {alert.code} · {alert.direction === "above" ? "Üzeri" : "Altı"} {formatTry(alert.target)}
                    </p>
                    <p className={cn("mt-1 text-[11px]", alert.hit ? "text-emerald-300" : "text-slate-400")}>
                      Güncel: {formatTry(alert.current)} {alert.hit ? "· Tetiklendi (demo)" : ""}
                    </p>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>

        <section className={cn("grid gap-4 lg:grid-cols-2", activeTab !== "veri" && "hidden")}>
          <article className="borsa-card rounded-xl p-3 lg:col-span-2">
            <BorsaAnalyticsDashboard />
          </article>
          <article className="borsa-card rounded-xl p-3 lg:col-span-2">
            <h3 className="mb-3 text-sm font-black uppercase tracking-[0.13em] text-slate-200">{b.marketDataSummary}</h3>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-2.5 text-xs text-cyan-100">
                <p>Spread: ₺{marketSnapshot.liquidity.spread.toLocaleString("tr-TR")}</p>
                <p className="mt-1">Derinlik: {marketSnapshot.liquidity.depth.toLocaleString("tr-TR")} lot</p>
              </div>
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-100">
                <p>Yükselen: {marketSnapshot.breadth.rising}</p>
                <p className="mt-1">Düşen: {marketSnapshot.breadth.falling}</p>
              </div>
              <div className="rounded-lg border border-violet-500/30 bg-violet-500/10 p-2.5 text-xs text-violet-100">
                <p>Konut: %{marketSnapshot.segmentDistributionPct.konut}</p>
                <p className="mt-1">Ticari: %{marketSnapshot.segmentDistributionPct.ticari}</p>
              </div>
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-100">
                <p>Arsa: %{marketSnapshot.segmentDistributionPct.arsa}</p>
                <p className="mt-1">Volatilite: {marketSnapshot.volatility.marketStdDev}</p>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-slate-300">
              {loading
                ? "Piyasa verisi yükleniyor…"
                : isLive
                  ? "Kaynak: platform ilanları + transaction_stats / price_index (canlı)."
                  : marketError
                    ? `Demo modu: ${marketError}`
                    : "Demo modu: borsa tabloları henüz dolu değil veya migration uygulanmadı."}
            </p>
          </article>
          <article className="borsa-card rounded-xl p-3">
            <h3 className="mb-3 text-sm font-black uppercase tracking-[0.13em] text-slate-200">Otomatik Teklif (Demo)</h3>
            <p className="mb-3 rounded-md border border-amber-500/35 bg-amber-500/10 px-2.5 py-2 text-[11px] text-amber-100">
              Bu panel simülasyondur. Gerçek emir göndermez; yalnızca strateji taslağını yerelde saklar.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="rounded-md border border-border bg-secondary px-2.5 py-2 text-sm text-foreground"
              >
                {filteredData.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.code}
                  </option>
                ))}
              </select>
              <input
                value={ruleMaxBid}
                onChange={(e) => setRuleMaxBid(e.target.value)}
                placeholder="Maks teklif (₺)"
                className="rounded-md border border-border bg-secondary px-2.5 py-2 text-sm text-foreground placeholder:text-muted-foreground"
              />
              <input
                value={ruleStep}
                onChange={(e) => setRuleStep(e.target.value)}
                placeholder="Artış adımı (₺)"
                className="rounded-md border border-border bg-secondary px-2.5 py-2 text-sm text-foreground placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={createAutoBidRule}
                className="rounded-md border border-cyan-400/60 bg-cyan-500/15 px-2.5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-100"
              >
                Kural Ekle
              </button>
            </div>
          </article>
          <article className="borsa-card rounded-xl p-3">
            <h3 className="mb-3 text-sm font-black uppercase tracking-[0.13em] text-slate-200">Kural Listesi</h3>
            <div className="space-y-2">
              {autoBidRules.length === 0 ? (
                <p className="rounded-lg border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-xs text-slate-400">
                  Kural bulunmuyor.
                </p>
              ) : (
                autoBidRules.map((rule) => {
                  const asset = filteredData.find((row) => row.id === rule.assetId);
                  return (
                    <div key={rule.id} className="rounded-lg border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-xs">
                      <p className="font-semibold text-slate-100">{asset?.code ?? "—"}</p>
                      <p className="mt-0.5 text-slate-300">
                        Maks: {formatTry(rule.maxBid)} · Adım: {formatTry(rule.stepTry)}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setAutoBidRules((prev) =>
                              prev.map((item) => (item.id === rule.id ? { ...item, enabled: !item.enabled } : item)),
                            )
                          }
                          className={cn(
                            "rounded border px-2 py-0.5 text-[10px] uppercase tracking-[0.1em]",
                            rule.enabled
                              ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-200"
                              : "border-slate-600 bg-slate-800 text-slate-400",
                          )}
                        >
                          {rule.enabled ? "Aktif" : "Pasif"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setAutoBidRules((prev) => prev.filter((item) => item.id !== rule.id))}
                          className="rounded border border-rose-500/40 bg-rose-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] text-rose-200"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </article>
        </section>
      </main>
  );
}
