import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Building2,
  ChevronRight,
  Clock3,
  Factory,
  Gavel,
  Globe,
  Headphones,
  Heart,
  Home as HomeIcon,
  Hotel,
  Landmark,
  MapPin,
  Radar,
  Search,
  Shield,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
  Warehouse,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocale } from "@/contexts/LocaleContext";
import { DepremTransparencyBand } from "@/components/home/DepremTransparencyBand";
import { LiveEarthquakeTicker } from "@/components/home/LiveEarthquakeTicker";
import { EmergencyActionBand } from "@/components/EmergencyActionBand";
import { PlatformModulesShowcase } from "@/sections/PlatformModulesShowcase";
import { ROUTES } from "@/constants/routes";
import { homeStepHref } from "@/data/nasilCalisirRoutes";
import { getAllProperties, getFeaturedAuctions } from "@/lib/demo-data";
import { formatTry } from "@/lib/valuation/valuationEngine";
import { getPropertyHero, getPropertyLocation, getPropertyTitle } from "@/types/property";
import type { CategoryKey } from "@/types/property";
import { BID_BOND_RATE, COMMISSION_RATE } from "@/lib/fees";

const BOARD_TICKER_CODES = ["KADIKÖY-D", "ÇEŞME-A", "LEVENT-O", "BODRUM-V"] as const;
const BOARD_FILTER_TABS = [
  { key: "active", label: "En Aktif" },
  { key: "rising", label: "Yükselen" },
  { key: "ending", label: "Bitiyor" },
] as const;
const TRUST_ICONS = [Shield, Users, Star, Headphones] as const;
const TRUST_LINKS = ["/guvenlik", ROUTES.ILANLAR, "/yorumlar", "/destek"] as const;
const STEP_ICONS = [Search, Shield, Gavel, Star] as const;
const STEP_NOS = ["01", "02", "03", "04"] as const;

const H8_CATEGORIES: {
  key: CategoryKey;
  icon: typeof HomeIcon;
  gradient: string;
}[] = [
  { key: "konut", icon: HomeIcon, gradient: "linear-gradient(135deg,#1e3a5f,#1d4ed8)" },
  { key: "ticari", icon: Building2, gradient: "linear-gradient(135deg,#134e4a,#0f766e)" },
  { key: "endustri", icon: Factory, gradient: "linear-gradient(135deg,#78350f,#b45309)" },
  { key: "konaklama", icon: Hotel, gradient: "linear-gradient(135deg,#5b21b6,#7c3aed)" },
  { key: "arsa", icon: MapPin, gradient: "linear-gradient(135deg,#14532d,#15803d)" },
  { key: "komple", icon: Landmark, gradient: "linear-gradient(135deg,#9f1239,#be123c)" },
  { key: "altyapi", icon: Zap, gradient: "linear-gradient(135deg,#0c4a6e,#0369a1)" },
  { key: "devren", icon: Warehouse, gradient: "linear-gradient(135deg,#374151,#4b5563)" },
];

const CATEGORY_LABELS: Record<string, string> = {
  konut: "Konut",
  ticari: "Ticari",
  endustri: "Endüstri",
  konaklama: "Turizm",
  arsa: "Arsa",
  komple: "Komple",
  altyapi: "GES",
  devren: "Devren",
};

/** Public URL slug (taxonomy key unchanged). */
const CATEGORY_PATH: Partial<Record<string, string>> = {
  konaklama: "/ilanlar/turizm",
  altyapi: "/ilanlar/ges",
};

const WHY_IHALAL_CARDS = [
  {
    title: "Banka Düzeyinde Güvenlik",
    text: "256-bit SSL, oturum koruması ve denetlenebilir teklif günlükleri.",
    href: "/guvenlik",
    Icon: Shield,
    highlight: false,
  },
  {
    title: "Yapay Zeka Destekli Analiz",
    text: "Bölge bandı, emsal ve aşırı açılış uyarıları tek panelde.",
    href: "/degerleme",
    Icon: BarChart3,
    highlight: false,
  },
  {
    title: "Risk & Analiz Merkezi",
    text: "Bina riski, deprem şeffaflık akışı ve acil plan modülleri tek merkezde.",
    href: "/modul/deprem-risk-haritasi",
    Icon: Activity,
    highlight: true,
  },
  {
    title: "Şeffaf Teklif Geçmişi",
    text: "Manipülasyondan uzak, izlenebilir müzayede oturumları.",
    href: ROUTES.ILANLAR,
    Icon: Gavel,
    highlight: false,
  },
  {
    title: "Küresel Erişim",
    text: "Türkiye geneli portföy; kurumsal ve bireysel katılım.",
    href: ROUTES.KURUMSAL,
    Icon: Globe,
    highlight: false,
  },
  {
    title: "7/24 Destek",
    text: "Canlı ihale, evrak ve moderasyon hattı.",
    href: "/destek",
    Icon: Headphones,
    highlight: false,
  },
] as const;

const TRUSTED_BRANDS = ["JLL", "CBRE", "Colliers", "Knight Frank", "Cushman & Wakefield", "Savills", "EY"] as const;

const DEMO_TESTIMONIALS = [
  {
    name: "Ayşe Korkmaz",
    role: "Portföy Yöneticisi",
    company: "Atlas Gayrimenkul",
    date: "Mart 2026",
    quote:
      "Kapalı teklif modülü sayesinde müşteri görüşmelerini platform içinde tutuyoruz. Emsal ve AI bandı satıcı beklentisini hizalamayı kolaylaştırdı.",
    initials: "AK",
    hue: 220,
  },
  {
    name: "Mehmet Yıldız",
    role: "Gayrimenkul Değerleme Uzmanı",
    company: "SPK Lisanslı",
    date: "Şubat 2026",
    quote:
      "12 sekmeli ilan detayı ve ekspertiz indirme akışı, saha ziyaretinden önce ön analizi hızlandırıyor.",
    initials: "MY",
    hue: 200,
  },
  {
    name: "Zeynep Arslan",
    role: "Yatırımcı",
    company: "Ege Portföy",
    date: "Ocak 2026",
    quote:
      "Canlı ihale kartları ve deprem risk modülleri portföy takibini tek ekranda topluyor.",
    initials: "ZA",
    hue: 260,
  },
] as const;

type BoardFilter = (typeof BOARD_FILTER_TABS)[number]["key"];
type BoardRow = {
  id: string;
  code: string;
  title: string;
  bid: number;
  changePct: number;
  remainingMin: number;
  sparkline: number[];
};

type HeroMetrics = {
  volume: number;
  active: number;
  avgRise: number;
  watchers: number;
};
type MetricKey = "volume" | "active" | "avgRise" | "watchers";

type TradeFeedItem = {
  id: string;
  code: string;
  label: string;
  amount: number;
  tone: "up" | "down" | "sold";
  at: string;
};

const REGION_INDEXES = [
  { name: "İstanbul Konut", value: 124.3, changePct: 1.7 },
  { name: "Ege Arsa", value: 111.6, changePct: -0.5 },
  { name: "Akdeniz Villa", value: 138.2, changePct: 2.1 },
  { name: "Ankara Ofis", value: 104.8, changePct: 0.8 },
] as const;

function sparklinePath(values: number[]): string {
  if (!values.length) return "";
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);
  return values
    .map((v, i) => {
      const x = (i / Math.max(1, values.length - 1)) * 100;
      const y = 100 - ((v - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");
}

function buildHeroRows(): BoardRow[] {
  const featured = getFeaturedAuctions(4);
  return featured.map((item, i) => {
    const starting = item.startingBidTry ?? item.priceTry ?? 1_500_000;
    const bid = item.currentBidTry ?? starting;
    const changePct = starting > 0 ? ((bid - starting) / starting) * 100 : 0;
    const line = [0.91, 0.95, 0.97, 1.01, 1.03].map((m) => Math.round(bid * m));
    return {
      id: item.id,
      code: BOARD_TICKER_CODES[i] ?? `KOD-${i + 1}`,
      title: getPropertyTitle(item),
      bid,
      changePct: Number(changePct.toFixed(1)),
      remainingMin: 340 - i * 44,
      sparkline: line,
    };
  });
}

function formatRemaining(raw: unknown): string {
  if (typeof raw !== "string" || !raw) return "Süre güncelleniyor";
  const ms = new Date(raw).getTime() - Date.now();
  if (!Number.isFinite(ms) || ms <= 0) return "Süre doldu";
  const totalMinutes = Math.floor(ms / 60000);
  const d = Math.floor(totalMinutes / (60 * 24));
  const h = Math.floor((totalMinutes % (60 * 24)) / 60);
  const m = totalMinutes % 60;
  if (d > 0) return `${d}g ${h}s kaldı`;
  return `${h}s ${m}dk kaldı`;
}

export default function PremiumCinematicHome() {
  const { t } = useLocale();
  const home = t.home;
  const navigate = useNavigate();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [heroRows, setHeroRows] = useState<BoardRow[]>(() => buildHeroRows());
  const [heroFilter, setHeroFilter] = useState<BoardFilter>("active");
  const [flashRowId, setFlashRowId] = useState<string | null>(null);
  const [flashDirection, setFlashDirection] = useState<"up" | "down">("up");
  const [heroMetrics, setHeroMetrics] = useState<HeroMetrics>({
    volume: 126_400_000,
    active: 284,
    avgRise: 2.6,
    watchers: 1932,
  });
  const [flashMetricKey, setFlashMetricKey] = useState<MetricKey | null>(null);
  const [flashTickerCode, setFlashTickerCode] = useState<string | null>(null);
  const [tradeFeed, setTradeFeed] = useState<TradeFeedItem[]>([]);

  useEffect(() => {
    const seeded = buildHeroRows().slice(0, 4).map((row, idx) => ({
        id: `${row.id}-seed-${idx}`,
        code: row.code,
        label: row.title,
        amount: row.bid,
        tone: row.changePct >= 0 ? "up" : "down",
        at: new Date(Date.now() - idx * 90_000).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      }));
    setTradeFeed(seeded);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      const metricKeys: MetricKey[] = ["volume", "active", "avgRise", "watchers"];
      const randomMetric = metricKeys[Math.floor(Math.random() * metricKeys.length)];
      setFlashMetricKey(randomMetric);
      setHeroRows((prev) => {
        if (!prev.length) return prev;
        const index = Math.floor(Math.random() * prev.length);
        const updated = [...prev];
        const current = updated[index];
        const move = current.bid * (Math.random() * 0.003 + 0.0008);
        const sign = Math.random() > 0.3 ? 1 : -1;
        const nextBid = Math.max(80_000, Math.round(current.bid + move * sign));
        updated[index] = {
          ...current,
          bid: nextBid,
          changePct: Number((current.changePct + (sign > 0 ? 0.2 : -0.15)).toFixed(1)),
          remainingMin: Math.max(3, current.remainingMin - Math.floor(Math.random() * 3)),
          sparkline: [...current.sparkline.slice(-5), nextBid],
        };
        setFlashDirection(sign > 0 ? "up" : "down");
        setFlashRowId(current.id);
        setFlashTickerCode(current.code);
        setTradeFeed((prevFeed) => {
          const sold = Math.random() < 0.13;
          const tone: TradeFeedItem["tone"] = sold ? "sold" : sign > 0 ? "up" : "down";
          const entry: TradeFeedItem = {
            id: `${current.id}-${Date.now()}`,
            code: current.code,
            label: sold ? "SATILDI bildirimi" : "Yeni teklif",
            amount: nextBid,
            tone,
            at: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
          };
          return [entry, ...prevFeed].slice(0, 8);
        });
        return updated;
      });
      setHeroMetrics((prev) => ({
        volume: prev.volume + Math.round((Math.random() * 2_100_000 - 650_000)),
        active: Math.max(210, prev.active + Math.round(Math.random() * 7 - 3)),
        avgRise: Number((prev.avgRise + (Math.random() > 0.5 ? 0.1 : -0.08)).toFixed(1)),
        watchers: Math.max(1200, prev.watchers + Math.round(Math.random() * 22 - 8)),
      }));
    }, 2600);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!flashRowId) return;
    const id = window.setTimeout(() => setFlashRowId(null), 900);
    return () => window.clearTimeout(id);
  }, [flashRowId]);

  useEffect(() => {
    if (!flashMetricKey) return;
    const id = window.setTimeout(() => setFlashMetricKey(null), 700);
    return () => window.clearTimeout(id);
  }, [flashMetricKey]);

  useEffect(() => {
    if (!flashTickerCode) return;
    const id = window.setTimeout(() => setFlashTickerCode(null), 650);
    return () => window.clearTimeout(id);
  }, [flashTickerCode]);

  const tickerRows = useMemo(() => heroRows.map((row) => ({ code: row.code, bid: row.bid, changePct: row.changePct })), [heroRows]);

  const filteredRows = useMemo(() => {
    const rows = [...heroRows];
    if (heroFilter === "rising") return rows.sort((a, b) => b.changePct - a.changePct);
    if (heroFilter === "ending") return rows.sort((a, b) => a.remainingMin - b.remainingMin);
    return rows.sort((a, b) => b.bid - a.bid);
  }, [heroRows, heroFilter]);

  const metricCards = useMemo(
    () => [
      {
        key: "volume",
        label: "İşlem Hacmi",
        value: `₺${Math.max(0, heroMetrics.volume).toLocaleString("tr-TR")}`,
        sparkline: [82, 86, 84, 90, 95, 98],
      },
      {
        key: "active",
        label: "Aktif İhale",
        value: heroMetrics.active.toLocaleString("tr-TR"),
        sparkline: [278, 281, 283, 284, 284, 284],
      },
      {
        key: "avgRise",
        label: "Ort. Artış",
        value: `%${heroMetrics.avgRise.toFixed(1)}`,
        sparkline: [1.4, 1.8, 2.1, 2.4, 2.6, heroMetrics.avgRise],
      },
      {
        key: "watchers",
        label: "İzleyen",
        value: heroMetrics.watchers.toLocaleString("tr-TR"),
        sparkline: [1610, 1680, 1750, 1820, 1890, heroMetrics.watchers],
      },
    ],
    [heroMetrics],
  );

  const steps = useMemo(
    () =>
      home.how.steps.map((step, i) => ({
        no: STEP_NOS[i] ?? String(i + 1).padStart(2, "0"),
        title: step.title,
        text: step.desc,
        Icon: STEP_ICONS[i] ?? Search,
        href: homeStepHref(i),
      })),
    [home.how.steps],
  );

  const categoryCards = useMemo(() => {
    const all = getAllProperties();
    return H8_CATEGORIES.map((meta) => ({
      ...meta,
      count: all.filter((p) => p.taxonomy.category === meta.key).length,
    }));
  }, []);

  const liveAuctions = useMemo(() => getFeaturedAuctions(4), []);

  return (
    <div
      className="premium-home relative overflow-x-clip bg-slate-950 text-slate-100"
      data-testid="premium-cinematic-home"
    >
      <div className="premium-home__noise" aria-hidden="true" />
      <div className="premium-home__grid" aria-hidden="true" />

      <section className="mx-auto w-full max-w-[1240px] px-4 pt-5 lg:px-6">
        <div className="overflow-hidden rounded-xl border border-blue-500/25 bg-[#071325]/90 shadow-[0_18px_60px_rgba(2,6,23,0.45)]">
          <div className="border-b border-slate-800/80 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-200/90">
            Piyasa Akışı
          </div>
          <div className="market-board-ticker__viewport px-3 py-2.5">
            <div className="market-board-ticker__lane">
              {[0, 1].map((dup) => (
                <div key={dup} className="market-board-ticker__seq">
                  {tickerRows.map((row) => {
                    const up = row.changePct >= 0;
                    return (
                      <div
                        key={`${dup}-${row.code}`}
                        className={`market-board-ticker__chip ${
                          up
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                            : "border-rose-500/30 bg-rose-500/10 text-rose-200"
                        } ${flashTickerCode === row.code ? (up ? "market-board-ticker__chip--flash-up" : "market-board-ticker__chip--flash-down") : ""}`}
                      >
                        <span className="font-semibold tracking-wide text-slate-100">{row.code}</span>
                        <span className="font-bold">{formatTry(row.bid)}</span>
                        <span className="inline-flex items-center gap-1 font-bold">
                          {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                          {up ? "+" : ""}
                          {row.changePct.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto mt-4 w-full max-w-[1240px] px-4 pb-10 lg:px-6" aria-labelledby="premium-hero-title">
        <div className="rounded-[32px] border border-blue-500/20 bg-gradient-to-b from-[#0a1628] via-[#0a1f3d] to-slate-950/95 p-4 shadow-[0_40px_120px_rgba(15,23,42,0.65)] lg:p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-3">
              <Badge className="border border-blue-400/30 bg-blue-500/10 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-200">
                Borsa Paneli
              </Badge>
              <h1 id="premium-hero-title" className="text-4xl font-black leading-[1.04] tracking-[-0.02em] text-white lg:text-[3.2rem]">
                Gayrimenkul Borsası
              </h1>
              <p className="max-w-2xl text-[15px] leading-7 text-slate-300 lg:text-[18px] lg:leading-8">
                Şeffaf, gerçek zamanlı, AI destekli açık artırma
              </p>
            </div>
            <Button asChild className="h-11 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-5 text-sm font-bold text-white hover:from-blue-400 hover:to-cyan-400">
              <Link to={ROUTES.ILANLAR}>
                İhaleleri Keşfet <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {metricCards.map((metric) => (
                  <Card
                    key={metric.key}
                    className={`border border-slate-700/80 bg-slate-950/75 ${
                      flashMetricKey === metric.key ? "premium-metric-card--flash" : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{metric.label}</p>
                      <strong className="mt-1 block text-2xl font-black text-white">{metric.value}</strong>
                      {metric.key === "active" ? (
                        <p className="mt-1 text-xs font-semibold text-cyan-200">Aktif İhale: {heroMetrics.active}</p>
                      ) : null}
                      <svg viewBox="0 0 100 100" className="mt-2 h-8 w-full" preserveAspectRatio="none" aria-hidden>
                        <polyline
                          fill="none"
                          stroke={metric.key === "avgRise" ? "#facc15" : "#38bdf8"}
                          strokeWidth="4"
                          points={sparklinePath(metric.sparkline)}
                        />
                      </svg>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="border border-slate-700/80 bg-slate-950/75">
                <CardContent className="p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-bold text-white">En Aktif İhaleler</h2>
                    <div className="flex flex-wrap gap-2">
                      {BOARD_FILTER_TABS.map((tab) => (
                        <Button
                          key={tab.key}
                          size="sm"
                          variant={heroFilter === tab.key ? "default" : "outline"}
                          className={
                            heroFilter === tab.key
                              ? "bg-blue-600 text-white hover:bg-blue-500"
                              : "border-slate-600 bg-slate-900 text-slate-200 hover:bg-slate-800"
                          }
                          onClick={() => setHeroFilter(tab.key)}
                        >
                          {tab.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-[720px] w-full text-sm text-slate-200">
                      <thead className="text-left text-[11px] uppercase tracking-[0.14em] text-slate-400">
                        <tr>
                          <th className="pb-2 pr-3">Kod</th>
                          <th className="pb-2 pr-3">Mülk</th>
                          <th className="pb-2 pr-3">Teklif</th>
                          <th className="pb-2 pr-3">Değişim%</th>
                          <th className="pb-2">Süre</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRows.map((row) => {
                          const up = row.changePct >= 0;
                          return (
                            <tr
                              key={row.id}
                              onClick={() => navigate(`/ilanlar/${row.id}`)}
                              className={`cursor-pointer border-t border-slate-800/80 transition ${
                                flashRowId === row.id
                                  ? flashDirection === "up"
                                    ? "bg-emerald-500/15"
                                    : "bg-rose-500/15"
                                  : "hover:bg-slate-900/70"
                              }`}
                            >
                              <td className="py-2.5 pr-3 font-semibold text-cyan-200">{row.code}</td>
                              <td className="py-2.5 pr-3 text-slate-100">{row.title}</td>
                              <td className="py-2.5 pr-3 font-bold text-white">{formatTry(row.bid)}</td>
                              <td className={`py-2.5 pr-3 font-bold ${up ? "text-emerald-300" : "text-rose-300"}`}>
                                {up ? "+" : ""}
                                {row.changePct.toFixed(1)}%
                              </td>
                              <td className="py-2.5 text-slate-300">
                                <span className="inline-flex items-center gap-1">
                                  <Clock3 className="h-3.5 w-3.5 text-slate-500" />
                                  {`${Math.floor(row.remainingMin / 60)}s ${row.remainingMin % 60}dk`}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            <aside className="space-y-4">
              <Card className="border border-slate-700/80 bg-slate-950/75">
                <CardContent className="space-y-3 p-4">
                  <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-200">Bölge Endeksleri</h3>
                  {REGION_INDEXES.map((item) => {
                    const up = item.changePct >= 0;
                    return (
                      <div key={item.name} className="flex items-center justify-between rounded-lg border border-slate-700/80 bg-slate-900/70 px-3 py-2">
                        <span className="text-sm text-slate-200">{item.name}</span>
                        <span className={`text-xs font-bold ${up ? "text-emerald-300" : "text-rose-300"}`}>
                          {up ? "+" : ""}
                          {item.changePct.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="border border-slate-700/80 bg-slate-950/75">
                <CardContent className="space-y-2 p-4">
                  <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-200">Güven Göstergeleri</h3>
                  <p className="inline-flex items-center gap-2 text-sm text-slate-300"><Shield className="h-4 w-4 text-cyan-300" /> KYC doğrulama</p>
                  <p className="inline-flex items-center gap-2 text-sm text-slate-300"><Landmark className="h-4 w-4 text-cyan-300" /> Lisanslı ödeme</p>
                  <p className="inline-flex items-center gap-2 text-sm text-slate-300"><Zap className="h-4 w-4 text-cyan-300" /> Anti-sniping</p>
                  <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-xs text-slate-300">
                    <p>Teminat: %{Math.round(BID_BOND_RATE * 100)}</p>
                    <p className="mt-1">Komisyon: %{Math.round(COMMISSION_RATE * 100)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-700/80 bg-slate-950/75">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-200">Canlı İşlem Akışı</h3>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300">
                      <i className="market-live-dot" aria-hidden /> CANLI
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {tradeFeed.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigate("/ihaleler")}
                        className={`w-full rounded-lg border px-2.5 py-2 text-left transition ${
                          item.tone === "sold"
                            ? "border-amber-500/35 bg-amber-500/10"
                            : item.tone === "up"
                              ? "border-emerald-500/30 bg-emerald-500/10"
                              : "border-rose-500/30 bg-rose-500/10"
                        }`}
                      >
                        <p className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-slate-100">{item.code}</span>
                          <span className={item.tone === "sold" ? "text-amber-200" : item.tone === "up" ? "text-emerald-200" : "text-rose-200"}>
                            {item.tone === "sold" ? "SATILDI" : formatTry(item.amount)}
                          </span>
                        </p>
                        <p className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                          <span>{item.label}</span>
                          <span>{item.at}</span>
                        </p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </section>

      <section className="premium-trust-strip" aria-label={home.aria.trustRow}>
        {home.trust.map((item, i) => {
          const Icon = TRUST_ICONS[i] ?? Shield;
          return (
            <Link key={item.title} to={TRUST_LINKS[i] ?? ROUTES.ILANLAR} className="premium-trust-strip__item">
              <Icon className="h-4 w-4 text-blue-400" aria-hidden />
              <strong>{item.title}</strong>
              <span>{item.sub}</span>
            </Link>
          );
        })}
      </section>

      <section className="mx-auto mt-10 w-full max-w-[1240px] px-4 lg:px-6" id="how-it-works" aria-labelledby="premium-process-title">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/60 lg:p-8">
          <h2 id="premium-process-title" className="text-2xl font-black text-white lg:text-3xl">
            {home.how.title}
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-300 lg:text-base">{home.how.subtitle}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step) => (
            <Link key={step.no} to={step.href} className="premium-step--link group rounded-2xl border border-slate-700/70 bg-slate-950/75 p-4 transition hover:border-blue-400/50 hover:bg-slate-900">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300" aria-hidden="true">
                <step.Icon className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300/90">{step.no}</span>
                <h3 className="text-lg font-bold text-white group-hover:text-blue-200">{step.title}</h3>
                <p className="text-sm text-slate-400">{step.text}</p>
              </div>
            </Link>
          ))}
        </div>
          <div className="mt-6">
            <Link to={ROUTES.HOW_IT_WORKS} className="inline-flex items-center rounded-xl border border-cyan-300/35 bg-slate-950/80 px-5 py-2.5 text-sm font-bold text-cyan-100 shadow-[0_10px_24px_rgba(2,6,23,0.4)] transition hover:border-cyan-200/70 hover:text-white">
            Tüm rehber ve tanıtım videosu
          </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 w-full max-w-[1240px] px-4 pb-4 lg:px-6" aria-labelledby="premium-auctions-title">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id="premium-auctions-title" className="text-2xl font-black text-white lg:text-3xl">
            {home.featured.heading}
          </h2>
          <Link to={ROUTES.ILANLAR} className="rounded-lg border border-cyan-400/30 bg-slate-950/75 px-3 py-1.5 text-sm font-bold text-cyan-200 transition hover:border-cyan-300/70 hover:text-white">
            {home.featured.viewAll}
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {liveAuctions.map((p) => {
            const isFavorite = favoriteIds.includes(p.id);
            return (
            <Link key={p.id} to={`/ilanlar/${p.id}`} className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/75 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/45 hover:shadow-[0_18px_50px_rgba(15,23,42,0.65)]">
              <div
                className="relative h-40"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.15), rgba(0,0,0,.55)), url(${getPropertyHero(p) ?? "/images/auction-1.jpg"})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-rose-500/90 px-2 py-1 text-[11px] font-bold text-white">
                  <i aria-hidden className="h-1.5 w-1.5 rounded-full bg-white" /> LIVE
                </span>
                <button
                  type="button"
                  className="absolute right-3 top-3 rounded-full bg-black/40 p-2 text-white/90"
                  aria-label={isFavorite ? "Favorilerden çıkar" : "Favoriye ekle"}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setFavoriteIds((prev) =>
                      prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id],
                    );
                  }}
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? "fill-current text-rose-400" : ""}`} />
                </button>
              </div>
              <div className="space-y-3 p-4">
                <h3 className="line-clamp-2 text-base font-bold text-white">{getPropertyTitle(p)}</h3>
                <p className="flex items-center gap-1 text-xs text-slate-400">
                  <MapPin className="h-3.5 w-3.5" aria-hidden /> {getPropertyLocation(p)}
                </p>
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <small className="block text-[11px] uppercase tracking-wide text-slate-500">Cari Teklif</small>
                    <strong className="text-lg font-extrabold text-white">{p.currentBidTry != null ? formatTry(p.currentBidTry) : "—"}</strong>
                  </div>
                  <b className="text-sm font-bold text-emerald-300 transition-colors duration-500 group-hover:text-emerald-200">
                    {(() => {
                      const start = p.startingBidTry ?? p.priceTry ?? p.currentBidTry ?? 0;
                      if (!start || !p.currentBidTry) return "+4%";
                      const pct = Math.max(1, Math.round(((p.currentBidTry - start) / start) * 100));
                      return `+${pct}%`;
                    })()}
                  </b>
                </div>
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-950/60 p-2 text-[11px] text-slate-300">
                  <span className="font-medium">Canlı ihale</span>
                  <span className="text-right">{p.bidCount ?? 0} teklif</span>
                  <span className="col-span-2 text-slate-400">
                    {formatRemaining((p.details?.auctionEndDate as string | undefined) ?? (p.details?.endDate as string | undefined))}
                  </span>
                </div>
              </div>
            </Link>
            );
          })}
        </div>
      </section>

      <section className="premium-why-grid" aria-labelledby="premium-why-title">
        <h2 id="premium-why-title">{home.investor.heading}</h2>
        <div className="premium-why-grid__cards">
          {WHY_IHALAL_CARDS.map((card) => (
            <Link
              key={card.title}
              to={card.href}
              className={card.highlight ? "premium-why-card premium-why-card--highlight" : "premium-why-card"}
            >
              <span className="premium-why-card__icon" aria-hidden>
                <card.Icon className="h-5 w-5" />
              </span>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
              <ChevronRight className="premium-why-card__chev" aria-hidden />
            </Link>
          ))}
        </div>
      </section>

      <section className="premium-war-room" aria-labelledby="premium-war-room-title">
        <div className="premium-war-room__copy">
          <p className="premium-war-room__eyebrow">Stratejik War Room</p>
          <h2 id="premium-war-room-title">Intelligence Hub — kurumsal karar terminali</h2>
          <p>
            Parsel istihbaratı, GES fizibilite, iBuyer senaryoları ve Palantir-tarzı war room tek çatıda.
            Demo ortamında senaryo verisi; üretimde RLS ve denetim kaydı hedeflenir.
          </p>
          <Link to={ROUTES.WAR_ROOM} className="premium-btn premium-btn--primary">
            War Room&apos;a git <Radar className="h-4 w-4" />
          </Link>
        </div>
        <div className="premium-war-room__visual" aria-hidden>
          <div className="premium-war-room__panel">
            <p className="premium-war-room__panel-title">Saha Alarmı</p>
            <p className="premium-war-room__panel-text">
              Kritik bölgelerde teklif yoğunluğu, fiyat sıçraması ve likidite baskısı tek kartta izlenir.
            </p>
            <span className="premium-war-room__panel-chip">Canlı veri akışı</span>
          </div>
          <div className="premium-war-room__panel premium-war-room__panel--accent">
            <p className="premium-war-room__panel-title">Risk Triage</p>
            <p className="premium-war-room__panel-text">
              Deprem, ekspertiz ve belge sinyalleri birleşik skorla aksiyon listesine düşer.
            </p>
            <span className="premium-war-room__panel-chip">Analiz hazır</span>
          </div>
        </div>
      </section>

      <section className="premium-categories" aria-labelledby="premium-categories-title">
        <h2 id="premium-categories-title">{home.categories.heading}</h2>
        <div className="premium-categories__track premium-categories__track--h8">
          {categoryCards.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.key}
                to={CATEGORY_PATH[cat.key] ?? `/ilanlar/${cat.key}`}
                className="premium-category-card premium-category-card--rich premium-category-card--calm"
                style={{ backgroundImage: cat.gradient }}
              >
                <span className="premium-category-card__icon" aria-hidden>
                  <Icon className="h-6 w-6" />
                </span>
                <strong>{CATEGORY_LABELS[cat.key] ?? cat.key}</strong>
                <span className="premium-category-card__count">{cat.count} ilan</span>
              </Link>
            );
          })}
        </div>
      </section>

      <PlatformModulesShowcase embedded />

      <section className="mx-auto mt-10 w-full max-w-[1240px] px-4 lg:px-6" aria-labelledby="risk-analiz-title">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/60 lg:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 id="risk-analiz-title" className="text-xl font-black text-white lg:text-2xl">
              Risk & Analiz
            </h2>
            <Link
              to="/modul/deprem-risk-haritasi"
              className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-200 hover:text-white"
            >
              Detay modüller
            </Link>
          </div>
          <DepremTransparencyBand />
          <LiveEarthquakeTicker />
          <div className="mt-4">
            <EmergencyActionBand />
          </div>
        </div>
      </section>

      <section className="premium-testimonials" aria-labelledby="premium-testimonials-title">
        <h2 id="premium-testimonials-title">{home.testimonials.heading}</h2>
        <div className="premium-testimonials__grid premium-testimonials__grid--three">
          {DEMO_TESTIMONIALS.map((item) => (
            <article key={item.name} className="premium-testimonial-card">
              <div
                className="premium-testimonial-card__avatar"
                style={{
                  background: `linear-gradient(135deg, hsl(${item.hue} 70% 45%), hsl(${item.hue} 80% 55%))`,
                }}
                aria-hidden
              >
                {item.initials}
              </div>
              <div className="premium-testimonial-card__stars" aria-label="5 yıldız">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="premium-star premium-star--on" fill="currentColor" />
                ))}
              </div>
              <blockquote>{item.quote}</blockquote>
              <footer>
                <strong>{item.name}</strong>
                <span>
                  {item.role} · {item.company}
                </span>
                <time>{item.date}</time>
              </footer>
            </article>
          ))}
        </div>
        <p className="premium-testimonials__cta">
          <Link to="/yorumlar">Tüm yorumlar</Link>
        </p>
      </section>

      <section className="premium-certs-band" aria-label="Uyumluluk rozetleri">
        {home.how.certs.map((cert) => (
          <div key={cert.title} className="premium-certs-band__item">
            <strong>
              {cert.flag ? `${cert.flag} ` : ""}
              {cert.title}
            </strong>
            <span>{cert.sub}</span>
          </div>
        ))}
      </section>

      <section className="premium-institutions" aria-labelledby="premium-trusted-title">
        <p id="premium-trusted-title">{home.trusted.title}</p>
        <div className="premium-institutions__logos">
          {TRUSTED_BRANDS.map((brand) => (
            <span key={brand} className="premium-institutions__logo">
              {brand}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
