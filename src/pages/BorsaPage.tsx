import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, BriefcaseBusiness, Clock3, TrendingDown, TrendingUp } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLiveMarket } from "@/borsa/useLiveMarket";
import type { MarketAsset } from "@/borsa/useLiveMarket";
import {
  IHALEAL_INDEX_DISCLAIMER,
  MASTER_INFO_DISCLAIMER,
  PLATFORM_LEGAL_DEFINITION,
  PSP_FLOW_DISCLAIMER,
} from "@/legal/platformDisclaimers";
import "@/borsa/borsa.css";
import { Line, LineChart, ResponsiveContainer } from "recharts";

type TerminalTab = "piyasa" | "portfoy" | "izleme" | "veri";
type MarketTableTab = "en_aktif" | "yukselen" | "cok_islem" | "bitiyor";
type FlashDir = "up" | "down";
type FeedEvent = {
  id: string;
  code: string;
  price: number;
  type: "bid" | "sold";
  dir: FlashDir;
  relative: string;
};

const TERMINAL_TABS: Array<{ id: TerminalTab; label: string; disabled?: boolean }> = [
  { id: "piyasa", label: "Piyasa" },
  { id: "portfoy", label: "Portföy" },
  { id: "izleme", label: "İzleme", disabled: true },
  { id: "veri", label: "Veri", disabled: true },
];

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
  const { data } = useLiveMarket();
  const [activeTab, setActiveTab] = useState<TerminalTab>("piyasa");
  const [tableTab, setTableTab] = useState<MarketTableTab>("en_aktif");
  const [flashRows, setFlashRows] = useState<Record<string, FlashDir>>({});
  const [feedEvents, setFeedEvents] = useState<FeedEvent[]>([]);
  const [watchers, setWatchers] = useState(1892);
  const [summaryFlash, setSummaryFlash] = useState<FlashDir | null>(null);
  const [historyMap, setHistoryMap] = useState<Record<string, number[]>>({});
  const prevRef = useRef<MarketAsset[] | null>(null);

  useEffect(() => {
    setHistoryMap((prev) => {
      const next = { ...prev };
      data.forEach((item) => {
        const arr = [...(next[item.id] ?? []), item.price].slice(-12);
        next[item.id] = arr;
      });
      return next;
    });
  }, [data]);

  useEffect(() => {
    const prev = prevRef.current;
    if (!prev) {
      prevRef.current = data;
      return;
    }
    const prevMap = new Map(prev.map((p) => [p.id, p]));
    const nextFlash: Record<string, FlashDir> = {};
    const nextEvents: FeedEvent[] = [];
    data.forEach((item) => {
      const before = prevMap.get(item.id);
      if (!before || before.price === item.price) return;
      nextFlash[item.id] = item.dir;
      const sold = Math.random() < 0.14;
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
      setWatchers((p) => Math.max(1, p + (Math.random() > 0.5 ? 1 : -1)));
    }
    if (nextEvents.length > 0) {
      setFeedEvents((prevEvents) => [...nextEvents, ...prevEvents].slice(0, 8));
    }
    prevRef.current = data;
  }, [data]);

  const tickerRows = useMemo(
    () => TICKER_CODES.map((code) => data.find((d) => d.code === code)).filter((x): x is MarketAsset => Boolean(x)),
    [data],
  );

  const totalVolume = useMemo(() => data.reduce((acc, row) => acc + row.volume, 0), [data]);
  const averageChange = useMemo(() => data.reduce((acc, row) => acc + row.changePct, 0) / Math.max(1, data.length), [data]);

  const summaryCards = useMemo(
    () => [
      { key: "volume", label: "Toplam İşlem Hacmi", value: totalVolume.toLocaleString("tr-TR"), points: data.map((d) => d.volume), color: "#38bdf8" },
      { key: "active", label: "Aktif Varlık", value: String(data.length), points: data.map((d) => d.price / 1_000_000), color: "#22d3ee" },
      { key: "avg", label: "Ort. Değişim%", value: `${averageChange >= 0 ? "+" : ""}${averageChange.toFixed(2)}%`, points: data.map((d) => d.changePct), color: averageChange >= 0 ? "#22c55e" : "#f43f5e" },
      { key: "watchers", label: "İzleyen", value: watchers.toLocaleString("tr-TR"), points: data.map((_, i) => watchers - (data.length - i) * 2), color: "#c084fc" },
    ],
    [averageChange, data, totalVolume, watchers],
  );

  const regionIndexes = useMemo(() => {
    const grouped = REGION_HEAT.map((meta) => {
      const rows = data.filter((d) => d.region === meta.key);
      const index = rows.reduce((acc, r) => acc + r.price, 0) / Math.max(1, rows.length);
      const change = rows.reduce((acc, r) => acc + r.changePct, 0) / Math.max(1, rows.length);
      const trend = rows.flatMap((r) => historyMap[r.id] ?? []).slice(-10);
      return { ...meta, index, change, trend: trend.length ? trend : [index] };
    });
    return grouped;
  }, [data, historyMap]);

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

  const tableRows = useMemo(() => {
    const sorted = [...data];
    if (tableTab === "en_aktif") {
      return sorted.sort((a, b) => b.volume - a.volume);
    }
    if (tableTab === "yukselen") {
      return sorted.sort((a, b) => b.changePct - a.changePct);
    }
    if (tableTab === "cok_islem") {
      return sorted.sort((a, b) => b.volume - a.volume);
    }
    return sorted.sort((a, b) => a.remainingMin - b.remainingMin);
  }, [data, tableTab]);

  const sectionTitle =
    tableTab === "en_aktif" ? "En Aktif" : tableTab === "yukselen" ? "Yükselen" : tableTab === "cok_islem" ? "Çok İşlem" : "Bitiyor";

  return (
    <div className="borsa-root text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-700/60 bg-slate-950/95 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3 px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <Logo size="lg" />
            <div className="leading-tight">
              <p className="text-sm font-black tracking-[0.08em] text-[#E9C56A]">GAYRİMENKUL BORSASI</p>
              <p className="text-xs text-slate-400">gayrimenkul ticaret ve açık artırma platformu</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-slate-600 bg-slate-900/70 text-slate-200"
              onClick={() => navigate("/borsa/portfoy")}
            >
              <BriefcaseBusiness className="mr-1.5 h-4 w-4" /> Portföy
            </Button>
            <Button asChild variant="outline" className="border-slate-600 bg-slate-900/70 text-slate-200">
              <Link to="/">
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Ana Site
              </Link>
            </Button>
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-[1600px] items-center gap-2 px-4 pb-3 lg:px-6">
          {TERMINAL_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={cn(
                "borsa-nav-tab rounded-md border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em]",
                activeTab === tab.id ? "border-cyan-400/70 bg-cyan-500/15 text-cyan-200" : "border-slate-700 bg-slate-900/70 text-slate-400",
              )}
              disabled={tab.disabled}
              aria-disabled={tab.disabled ? "true" : "false"}
              onClick={() => {
                if (tab.disabled) return;
                if (tab.id === "portfoy") {
                  navigate("/borsa/portfoy");
                  return;
                }
                setActiveTab(tab.id);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1600px] space-y-4 px-4 py-4 lg:px-6">
        <section className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-2.5 text-[11px] leading-relaxed text-amber-100">
          <p>{PLATFORM_LEGAL_DEFINITION}</p>
          <p className="mt-1">{MASTER_INFO_DISCLAIMER}</p>
          <p className="mt-1">{PSP_FLOW_DISCLAIMER}</p>
        </section>
        <section className="borsa-card rounded-xl p-3">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-200">Piyasa Ticker</h2>
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

        <section className="grid gap-4 xl:grid-cols-3">
          <div className="space-y-4 xl:col-span-2">
            <article className="borsa-card rounded-xl p-3">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-[0.13em] text-slate-200">Varlık Tablosu</h3>
                <span className="text-xs text-slate-400">{sectionTitle}</span>
              </div>
              <div className="mb-3 flex flex-wrap gap-2">
                {[
                  { id: "en_aktif", label: "En Aktif" },
                  { id: "yukselen", label: "Yükselen" },
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
              <div className="overflow-x-auto">
                <table className="min-w-[760px] w-full text-sm">
                  <thead className="text-left text-[11px] uppercase tracking-[0.12em] text-slate-400">
                    <tr>
                      <th className="pb-2 pr-3">Kod</th>
                      <th className="pb-2 pr-3">Mülk</th>
                      <th className="pb-2 pr-3">Güncel ₺</th>
                      <th className="pb-2 pr-3">Değişim%</th>
                      <th className="pb-2 pr-3">Hacim</th>
                      <th className="pb-2">Süre</th>
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
                          onClick={() => navigate(`/ilan/${row.id}`)}
                        >
                          <td className="py-2.5 pr-3 font-semibold text-cyan-200">{row.code}</td>
                          <td className="py-2.5 pr-3 text-slate-200">{row.property}</td>
                          <td className="py-2.5 pr-3 font-bold text-white">{formatTry(row.price)}</td>
                          <td className={cn("py-2.5 pr-3 font-bold", up ? "text-emerald-300" : "text-rose-300")}>
                            {up ? "+" : ""}
                            {row.changePct.toFixed(2)}%
                          </td>
                          <td className="py-2.5 pr-3 text-slate-300">{row.volume.toLocaleString("tr-TR")}</td>
                          <td className="py-2.5 text-slate-300">{Math.floor(row.remainingMin / 60)}s {row.remainingMin % 60}dk</td>
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

          <div className="space-y-4">
            <article className="borsa-card rounded-xl p-3">
              <h3 className="mb-3 text-sm font-black uppercase tracking-[0.13em] text-slate-200">Isı Haritası</h3>
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
          </div>
        </section>
      </main>
      <footer className="border-t border-slate-700/60 bg-slate-950/90 px-4 py-3 text-[11px] text-slate-300 lg:px-6">
        <div className="mx-auto w-full max-w-[1600px] space-y-1">
          <p>{PLATFORM_LEGAL_DEFINITION}</p>
          <p>{PSP_FLOW_DISCLAIMER}</p>
        </div>
      </footer>
    </div>
  );
}
