import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Building2,
  ChevronRight,
  Clock3,
  Factory,
  Gavel,
  Globe,
  Headphones,
  Home as HomeIcon,
  Hotel,
  Landmark,
  MapPin,
  Radar,
  Shield,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
  Warehouse,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocale } from "@/contexts/LocaleContext";
import { PlatformModulesShowcase } from "@/sections/PlatformModulesShowcase";
import { RecentlyViewed } from "@/sections/RecentlyViewed";
import { ROUTES } from "@/constants/routes";
import { getAllProperties, getFeaturedAuctions } from "@/lib/demo-data";
import { formatTry } from "@/lib/valuation/valuationEngine";
import { getPropertyHero, getPropertyLocation, getPropertyTitle } from "@/types/property";
import type { CategoryKey } from "@/types/property";
import { BID_BOND_RATE, COMMISSION_RATE } from "@/lib/fees";
import { getSponsoredListings } from "@/ads/mockAds";
import { TerminalHero } from "@/components/cinematic/TerminalHero";
import { CinematicParticles } from "@/components/cinematic/CinematicParticles";
import { ScrollReveal } from "@/components/cinematic/ScrollReveal";
import { CinematicStatsBar } from "@/components/cinematic/CinematicStatsBar";

const BOARD_TICKER_CODES = ["KADIKÖY-D", "ÇEŞME-A", "LEVENT-O", "BODRUM-V"] as const;
const BOARD_FILTER_TABS = [
  { key: "active", label: "En Aktif" },
  { key: "rising", label: "Yükselen" },
  { key: "ending", label: "Bitiyor" },
] as const;
const TRUST_ICONS = [Shield, Users, Star, Headphones] as const;
const TRUST_LINKS = ["/guvenlik", ROUTES.ILANLAR, "/yorumlar", "/destek"] as const;

const H8_CATEGORIES: { key: CategoryKey; icon: typeof HomeIcon }[] = [
  { key: "konut", icon: HomeIcon },
  { key: "ticari", icon: Building2 },
  { key: "endustri", icon: Factory },
  { key: "konaklama", icon: Hotel },
  { key: "arsa", icon: MapPin },
  { key: "komple", icon: Landmark },
  { key: "altyapi", icon: Zap },
  { key: "devren", icon: Warehouse },
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

const CATEGORY_PATH: Partial<Record<string, string>> = {
  konaklama: "/ilanlar/turizm",
  altyapi: "/ilanlar/ges",
};
const CATEGORY_GRADIENTS: Record<string, string> = {
  konut: "from-blue-500/35 to-sky-500/20 border-blue-400/45",
  ticari: "from-teal-500/35 to-cyan-500/20 border-teal-400/45",
  endustri: "from-orange-500/35 to-amber-500/20 border-orange-400/45",
  konaklama: "from-violet-500/35 to-fuchsia-500/20 border-violet-400/45",
  arsa: "from-emerald-500/35 to-green-500/20 border-emerald-400/45",
  komple: "from-rose-500/35 to-red-500/20 border-rose-400/45",
  altyapi: "from-cyan-500/35 to-blue-500/20 border-cyan-400/45",
  devren: "from-slate-500/35 to-blue-900/20 border-slate-400/45",
};

const WHY_IHALAL_CARDS = [
  { title: "Banka Düzeyinde Güvenlik", text: "256-bit SSL, oturum koruması ve denetlenebilir teklif günlükleri.", href: "/guvenlik", Icon: Shield, highlight: true },
  { title: "Yapay Zeka Destekli Analiz", text: "Bölge bandı, emsal ve aşırı açılış uyarıları tek panelde.", href: "/degerleme", Icon: BarChart3, highlight: false },
  { title: "Risk & Analiz Merkezi", text: "Bina riski, deprem şeffaflık akışı ve acil plan modülleri tek merkezde.", href: "/modul/deprem-risk-haritasi", Icon: Radar, highlight: false },
  { title: "Şeffaf Teklif Geçmişi", text: "Manipülasyondan uzak, izlenebilir müzayede oturumları.", href: ROUTES.ILANLAR, Icon: Gavel, highlight: false },
  { title: "Küresel Erişim", text: "Türkiye geneli portföy; kurumsal ve bireysel katılım.", href: ROUTES.KURUMSAL, Icon: Globe, highlight: false },
  { title: "7/24 Destek", text: "Canlı ihale, evrak ve moderasyon hattı.", href: "/destek", Icon: Headphones, highlight: false },
] as const;

const PHOTO_SHOWCASE_CARDS = [
  {
    id: "showcase-1",
    title: "Levent Prime Residence",
    location: "Levent, Istanbul",
    price: "₺28.500.000",
    image: "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "showcase-2",
    title: "Bodrum Hills Villa",
    location: "Bodrum, Mugla",
    price: "₺42.900.000",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "showcase-3",
    title: "Maslak Campus Plaza",
    location: "Maslak, Istanbul",
    price: "₺61.400.000",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80",
  },
] as const;

type BoardFilter = (typeof BOARD_FILTER_TABS)[number]["key"];
type BoardRow = { id: string; code: string; title: string; bid: number; changePct: number; remainingMin: number; sparkline: number[] };
type MetricKey = "volume" | "active" | "avgRise" | "watchers";
type TradeFeedItem = { id: string; code: string; label: string; amount: number; tone: "up" | "down" | "sold"; at: string };

const REGION_INDEXES = [
  { name: "İstanbul Konut", value: 124.3, changePct: 1.7 },
  { name: "Ege Arsa", value: 111.6, changePct: -0.5 },
  { name: "Akdeniz Villa", value: 138.2, changePct: 2.1 },
  { name: "Ankara Ofis", value: 104.8, changePct: 0.8 },
] as const;

const TRUST_METRICS = [
  { key: "volume", label: "İşlem Hacmi", value: 12.8, suffix: "B", prefix: "₺", tone: "text-cyan-200" },
  { key: "users", label: "Doğrulanmış Kullanıcı", value: 68.9, suffix: "K+", prefix: "", tone: "text-emerald-200" },
  { key: "auctions", label: "Tamamlanan İhale", value: 12.84, suffix: "K", prefix: "", tone: "text-amber-200" },
  { key: "satisfaction", label: "Memnuniyet", value: 94, suffix: "%", prefix: "", tone: "text-violet-200" },
] as const;

const ROLE_GATEWAYS = [
  { role: "Yatırımcı", text: "Canlı ihale, maliyet ve risk paneliyle fırsat yakala.", href: "/borsa" },
  { role: "Emlakçı", text: "Portföy yayını, müşteri eşleştirme ve teklif takibini yönet.", href: "/emlakci/ozellikler/crm" },
  { role: "Müteahhit", text: "Lansman, ön satış ve proje bazlı satış süreçlerini dijitalleştir.", href: "/muteahhit" },
  { role: "Satıcı", text: "Mülkünü borsaya koy, rekabetle en doğru fiyata ulaş.", href: "/sat-basla" },
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
    return {
      id: item.id,
      code: BOARD_TICKER_CODES[i] ?? `KOD-${i + 1}`,
      title: getPropertyTitle(item),
      bid,
      changePct: Number(changePct.toFixed(1)),
      remainingMin: 340 - i * 44,
      sparkline: [0.91, 0.95, 0.97, 1.01, 1.03].map((m) => Math.round(bid * m)),
    };
  });
}

export default function PremiumCinematicHome() {
  const { t } = useLocale();
  const home = t.home;
  const navigate = useNavigate();
  const [heroRows, setHeroRows] = useState<BoardRow[]>(() => buildHeroRows());
  const [heroFilter, setHeroFilter] = useState<BoardFilter>("active");
  const [flashRowId, setFlashRowId] = useState<string | null>(null);
  const [flashDirection, setFlashDirection] = useState<"up" | "down">("up");
  const [tradeFeed, setTradeFeed] = useState<TradeFeedItem[]>([]);
  const [heroMetrics, setHeroMetrics] = useState({ volume: 126_400_000, active: 284, avgRise: 2.6, watchers: 1932 });
  const [flashMetricKey, setFlashMetricKey] = useState<MetricKey | null>(null);
  const [liveTrustMetrics, setLiveTrustMetrics] = useState(() =>
    TRUST_METRICS.map((metric) => ({ key: metric.key, value: metric.value })),
  );

  useEffect(() => {
    const seeded = buildHeroRows().slice(0, 4).map((row, idx) => ({
      id: `${row.id}-seed-${idx}`,
      code: row.code,
      label: row.title,
      amount: row.bid,
      tone: row.changePct >= 0 ? "up" : "down",
      at: new Date(Date.now() - idx * 90_000).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
    })) as TradeFeedItem[];
    setTradeFeed(seeded);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      const metricKeys: MetricKey[] = ["volume", "active", "avgRise", "watchers"];
      setFlashMetricKey(metricKeys[Math.floor(Math.random() * metricKeys.length)]);
      setHeroRows((prev) => {
        if (!prev.length) return prev;
        const index = Math.floor(Math.random() * prev.length);
        const updated = [...prev];
        const current = updated[index];
        const sign = Math.random() > 0.3 ? 1 : -1;
        const nextBid = Math.max(80_000, Math.round(current.bid + current.bid * (Math.random() * 0.003 + 0.0008) * sign));
        updated[index] = { ...current, bid: nextBid, changePct: Number((current.changePct + (sign > 0 ? 0.2 : -0.15)).toFixed(1)), remainingMin: Math.max(3, current.remainingMin - Math.floor(Math.random() * 3)), sparkline: [...current.sparkline.slice(-5), nextBid] };
        setFlashDirection(sign > 0 ? "up" : "down");
        setFlashRowId(current.id);
        setTradeFeed((prevFeed) => {
          const sold = Math.random() < 0.13;
          const tone: TradeFeedItem["tone"] = sold ? "sold" : sign > 0 ? "up" : "down";
          return [{ id: `${current.id}-${Date.now()}`, code: current.code, label: sold ? "SATILDI bildirimi" : "Yeni teklif", amount: nextBid, tone, at: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) }, ...prevFeed].slice(0, 8);
        });
        return updated;
      });
      setHeroMetrics((prev) => ({ volume: prev.volume + Math.round(Math.random() * 2_100_000 - 650_000), active: Math.max(210, prev.active + Math.round(Math.random() * 7 - 3)), avgRise: Number((prev.avgRise + (Math.random() > 0.5 ? 0.1 : -0.08)).toFixed(1)), watchers: Math.max(1200, prev.watchers + Math.round(Math.random() * 22 - 8)) }));
    }, 2600);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => {
    const id = window.setInterval(() => {
      setLiveTrustMetrics((prev) =>
        prev.map((item) => ({
          ...item,
          value: Number((item.value + Math.random() * 0.12).toFixed(2)) as typeof item.value,
        })),
      );
    }, 3000);
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

  const tickerRows = useMemo(() => heroRows.map((row) => ({ code: row.code, bid: row.bid, changePct: row.changePct })), [heroRows]);
  const filteredRows = useMemo(() => {
    const rows = [...heroRows];
    if (heroFilter === "rising") return rows.sort((a, b) => b.changePct - a.changePct);
    if (heroFilter === "ending") return rows.sort((a, b) => a.remainingMin - b.remainingMin);
    return rows.sort((a, b) => b.bid - a.bid);
  }, [heroRows, heroFilter]);
  const metricCards = useMemo(() => [
    { key: "volume", label: "İşlem Hacmi", value: `₺${Math.max(0, heroMetrics.volume).toLocaleString("tr-TR")}`, sparkline: [82, 86, 84, 90, 95, 98] },
    { key: "active", label: "Aktif İhale", value: heroMetrics.active.toLocaleString("tr-TR"), sparkline: [278, 281, 283, 284, 284, 284] },
    { key: "avgRise", label: "Ort. Artış", value: `%${heroMetrics.avgRise.toFixed(1)}`, sparkline: [1.4, 1.8, 2.1, 2.4, 2.6, heroMetrics.avgRise] },
    { key: "watchers", label: "İzleyen", value: heroMetrics.watchers.toLocaleString("tr-TR"), sparkline: [1610, 1680, 1750, 1820, 1890, heroMetrics.watchers] },
  ], [heroMetrics]);
  const categoryCards = useMemo(() => {
    const all = getAllProperties();
    return H8_CATEGORIES.map((meta) => ({ ...meta, count: all.filter((p) => p.taxonomy.category === meta.key).length }));
  }, []);
  const liveAuctions = useMemo(() => getFeaturedAuctions(4), []);
  const sponsoredOpportunities = useMemo(() => getSponsoredListings(4), []);
  const borsaHowCards = useMemo(
    () => [
      {
        id: "b1",
        label: "B1",
        title: "İlanını Koy",
        text: "Keşif ücretsiz. Mülkünü borsaya ekle, AI değerleme ile başlangıç fiyatı.",
        href: "/sat-basla",
        classes: "border-sky-400/35 bg-sky-500/10 text-sky-200",
      },
      {
        id: "b2",
        label: "B2",
        title: "Canlı Teklif",
        text: "Alıcılar kredi kartı blokeli ciddi teklif verir. Maskeli order book, manipülasyonsuz.",
        href: "/ihaleler",
        classes: "border-emerald-400/35 bg-emerald-500/10 text-emerald-200",
      },
      {
        id: "b3",
        label: "B3",
        title: "Güvenli Kazan",
        text: "En yüksek teklif kazanır. Escrow, KYC, korumalı ödeme.",
        href: "/guvenlik",
        classes: "border-amber-400/35 bg-amber-500/10 text-amber-200",
      },
      {
        id: "b4",
        label: "B4",
        title: "Devir & Ödeme",
        text: "Tapu devri + ödeme korumalı. Cayma koruması, yedek alıcı.",
        href: "/nasil-calisir",
        classes: "border-violet-400/35 bg-violet-500/10 text-violet-200",
      },
    ],
    [],
  );
  const unifiedFeaturedItems = useMemo(() => {
    const showcase = PHOTO_SHOWCASE_CARDS.map((card) => ({ id: `showcase-${card.id}`, title: card.title, location: card.location, priceLabel: card.price, image: card.image, href: ROUTES.ILANLAR, sponsored: false, source: "Vitrin" }));
    const live = liveAuctions.map((item) => ({ id: `live-${item.id}`, title: getPropertyTitle(item), location: getPropertyLocation(item), priceLabel: formatTry(item.currentBidTry ?? item.priceTry ?? item.startingBidTry ?? 0), image: getPropertyHero(item) ?? "/images/auction-1.jpg", href: `/ilanlar/${item.id}`, sponsored: false, source: "Canlı Müzayede" }));
    const sponsored = sponsoredOpportunities.map((item) => ({ id: `sponsored-${item.id}`, title: getPropertyTitle(item), location: getPropertyLocation(item), priceLabel: formatTry(item.currentBidTry ?? item.priceTry ?? item.startingBidTry ?? 0), image: getPropertyHero(item) ?? "/images/auction-2.jpg", href: `/ilan/${item.id}`, sponsored: true, source: "Sponsorlu" }));
    return [...showcase, ...live, ...sponsored];
  }, [liveAuctions, sponsoredOpportunities]);

  return (
    <div className="premium-home relative overflow-x-clip bg-background text-foreground" data-testid="premium-cinematic-home">
      <CinematicParticles />
      <div className="premium-home__glow-orb premium-home__glow-orb--violet" aria-hidden="true" />
      <div className="premium-home__glow-orb premium-home__glow-orb--cyan" aria-hidden="true" />
      <div className="premium-home__noise" aria-hidden="true" />
      <div className="premium-home__grid" aria-hidden="true" />

      <section className="relative mx-auto mt-4 w-full max-w-[1240px] px-4 pb-2 lg:px-6" aria-labelledby="premium-hero-title">
        <div className="premium-hero-shell rounded-[32px] border border-border bg-card p-4 shadow-xl lg:p-6">
          <div className="mb-5 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,1fr)]">
            <div className="space-y-2">
              <TerminalHero />
              <CinematicStatsBar />
            </div>
            <aside className="hidden xl:block min-w-0 space-y-4">
              <Card className="border border-border bg-card/80"><CardContent className="space-y-3 p-4"><h3 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground">Bölge Endeksleri</h3>{REGION_INDEXES.map((item) => { const up = item.changePct >= 0; return (<div key={item.name} className="flex items-center justify-between rounded-lg border border-border bg-secondary px-3 py-2"><span className="text-sm text-muted-foreground">{item.name}</span><span className={`text-xs font-bold ${up ? "text-emerald-300" : "text-rose-300"}`}>{up ? "+" : ""}{item.changePct.toFixed(1)}%</span></div>); })}</CardContent></Card>
            </aside>
          </div>
          <div className="mb-4 space-y-2 rounded-2xl border border-border bg-secondary/60 px-3 py-3">
            <div className="market-board-ticker__viewport"><div className="market-board-ticker__lane">{[0, 1].map((dup) => (<div key={dup} className="market-board-ticker__seq">{tickerRows.map((row) => { const up = row.changePct >= 0; return (<div key={`${dup}-${row.code}`} className={`market-board-ticker__chip ${up ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-rose-500/30 bg-rose-500/10 text-rose-200"}`}><span className="font-semibold tracking-wide text-foreground">{row.code}</span><span className="font-bold">{formatTry(row.bid)}</span><span className="inline-flex items-center gap-1 font-bold">{up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}{up ? "+" : ""}{row.changePct.toFixed(1)}%</span></div>); })}</div>))}</div></div>
            <div className="market-board-ticker__viewport"><div className="market-board-ticker__lane">{[0, 1].map((dup) => (<div key={dup} className="market-board-ticker__seq">{tradeFeed.map((item) => (<button key={`${dup}-${item.id}`} type="button" onClick={() => navigate("/ihaleler")} className={`market-board-ticker__chip ${item.tone === "sold" ? "border-amber-500/35 bg-amber-500/10 text-amber-200" : item.tone === "up" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-rose-500/30 bg-rose-500/10 text-rose-200"}`}><span className="font-semibold tracking-wide text-foreground">{item.code}</span><span className="font-bold">{item.tone === "sold" ? "SATILDI" : formatTry(item.amount)}</span><span className="text-[10px] text-muted-foreground">{item.label} · {item.at}</span></button>))}</div>))}</div></div>
          </div>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,1fr)]">
            <div className="min-w-0 space-y-5">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metricCards.map((metric) => (<Card key={metric.key} className={`border border-border bg-card ${flashMetricKey === metric.key ? "premium-metric-card--flash" : ""}`}><CardContent className="p-4"><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{metric.label}</p><strong className="mt-1 block text-2xl font-black text-foreground">{metric.value}</strong><svg viewBox="0 0 100 100" className="mt-2 h-8 w-full" preserveAspectRatio="none"><polyline fill="none" stroke={metric.key === "avgRise" ? "#facc15" : "#38bdf8"} strokeWidth="4" points={sparklinePath(metric.sparkline)} /></svg></CardContent></Card>))}</div>
              <Card className="border border-border bg-card"><CardContent className="p-4"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-bold text-foreground">En Aktif İhaleler</h2><div className="flex flex-wrap gap-2">{BOARD_FILTER_TABS.map((tab) => (<Button key={tab.key} size="sm" variant={heroFilter === tab.key ? "default" : "outline"} className={heroFilter === tab.key ? "bg-blue-600 text-white hover:bg-blue-500" : "border-border bg-secondary text-muted-foreground hover:bg-secondary/80"} onClick={() => setHeroFilter(tab.key)}>{tab.label}</Button>))}</div></div><div className="overflow-x-auto"><table className="min-w-[720px] w-full text-sm text-muted-foreground"><thead className="text-start text-[11px] uppercase tracking-[0.14em] text-muted-foreground"><tr><th className="pb-2 pe-3">Kod</th><th className="pb-2 pe-3">Mülk</th><th className="pb-2 pe-3">Teklif</th><th className="pb-2 pe-3">Değişim%</th><th className="pb-2">Süre</th></tr></thead><tbody>{filteredRows.map((row) => { const up = row.changePct >= 0; return (<tr key={row.id} className={`cursor-pointer border-t border-border transition ${flashRowId === row.id ? (flashDirection === "up" ? "bg-emerald-500/15" : "bg-rose-500/15") : "hover:bg-secondary/80"}`} onClick={() => navigate(`/ilanlar/${row.id}`)}><td className="py-2.5 pe-3 font-semibold text-primary">{row.code}</td><td className="py-2.5 pe-3 text-foreground">{row.title}</td><td className="py-2.5 pe-3 font-bold text-foreground">{formatTry(row.bid)}</td><td className={`py-2.5 pe-3 font-bold ${up ? "text-emerald-300" : "text-rose-300"}`}>{up ? "+" : ""}{row.changePct.toFixed(1)}%</td><td className="py-2.5 text-muted-foreground"><span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{`${Math.floor(row.remainingMin / 60)}s ${row.remainingMin % 60}dk`}</span></td></tr>); })}</tbody></table></div></CardContent></Card>
            </div>
            <aside className="min-w-0 space-y-4 xl:hidden">
              <Card className="border border-border bg-card"><CardContent className="space-y-3 p-4"><h3 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground">Bölge Endeksleri</h3>{REGION_INDEXES.map((item) => { const up = item.changePct >= 0; return (<div key={item.name} className="flex items-center justify-between rounded-lg border border-border bg-secondary px-3 py-2"><span className="text-sm text-muted-foreground">{item.name}</span><span className={`text-xs font-bold ${up ? "text-emerald-300" : "text-rose-300"}`}>{up ? "+" : ""}{item.changePct.toFixed(1)}%</span></div>); })}</CardContent></Card>
              <Card className="border border-border bg-card"><CardContent className="space-y-3 p-4"><h3 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground">Güven Göstergeleri</h3><p className="inline-flex items-center gap-2 text-sm text-muted-foreground"><Shield className="h-4 w-4 text-cyan-300" /> KYC doğrulama</p><p className="inline-flex items-center gap-2 text-sm text-muted-foreground"><Landmark className="h-4 w-4 text-cyan-300" /> Escrow destekli ödeme</p><p className="inline-flex items-center gap-2 text-sm text-muted-foreground"><Zap className="h-4 w-4 text-cyan-300" /> Anti-sniping</p><div className="rounded-lg border border-border bg-secondary p-3 text-xs text-muted-foreground"><p>Teminat: %{Math.round(BID_BOND_RATE * 100)}</p><p className="mt-1">Komisyon: %{Math.round(COMMISSION_RATE * 100)}</p></div></CardContent></Card>
            </aside>
            <aside className="min-w-0 hidden xl:block space-y-4">
              <Card className="border border-border bg-card"><CardContent className="space-y-3 p-4"><h3 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground">Güven Göstergeleri</h3><p className="inline-flex items-center gap-2 text-sm text-muted-foreground"><Shield className="h-4 w-4 text-cyan-300" /> KYC doğrulama</p><p className="inline-flex items-center gap-2 text-sm text-muted-foreground"><Landmark className="h-4 w-4 text-cyan-300" /> Escrow destekli ödeme</p><p className="inline-flex items-center gap-2 text-sm text-muted-foreground"><Zap className="h-4 w-4 text-cyan-300" /> Anti-sniping</p><div className="rounded-lg border border-border bg-secondary p-3 text-xs text-muted-foreground"><p>Teminat: %{Math.round(BID_BOND_RATE * 100)}</p><p className="mt-1">Komisyon: %{Math.round(COMMISSION_RATE * 100)}</p></div></CardContent></Card>
            </aside>
          </div>
          <Card className="mt-5 border border-border bg-card">
            <CardContent className="space-y-5 p-5 lg:p-6">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Kategoriler</p>
                <h2 className="text-2xl font-black text-foreground lg:text-3xl">Canlı Kategori Pazarı</h2>
                <p className="text-sm text-muted-foreground">
                  Tüm portföy tek bakışta: kategoriye gir, ilan yoğunluğunu gör, doğrudan uygun listeye geç.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {categoryCards.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Link
                      key={cat.key}
                      to={CATEGORY_PATH[cat.key] ?? `/ilanlar/${cat.key}`}
                      className={`group flex min-h-[108px] items-center gap-3 rounded-2xl border bg-gradient-to-br px-4 py-4 transition duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/30 ${CATEGORY_GRADIENTS[cat.key] ?? "from-slate-500/20 to-slate-900/10 border-slate-400/30"}`}
                    >
                      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black/25 text-white ring-1 ring-white/15">
                        <Icon className="h-6 w-6" />
                      </span>
                      <span className="min-w-0">
                        <strong className="block text-base font-extrabold text-white lg:text-lg">
                          {CATEGORY_LABELS[cat.key] ?? cat.key}
                        </strong>
                        <span className="mt-1 block text-sm text-slate-100/95">{cat.count} ilan</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <ScrollReveal parallax>
      <section className="mx-auto mt-8 w-full max-w-[1240px] px-4 lg:px-6">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xl lg:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Gayrimenkul Borsası</p>
          <h2 className="mt-2 text-3xl font-black text-foreground lg:text-4xl">Borsa nasıl çalışır?</h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-muted-foreground lg:text-base">
            İlanını borsaya koy, alıcılar açık artırmayla teklif versin. Fiyatı sen değil gerçek piyasa belirlesin
            — şeffaf, güvenli, en yüksek teklif kazanır.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {borsaHowCards.map((card) => (
              <Link
                key={card.id}
                to={card.href}
                className={`group rounded-2xl border p-4 transition hover:-translate-y-0.5 ${card.classes}`}
              >
                <span className="text-xs font-bold uppercase tracking-[0.14em]">{card.label}</span>
                <h3 className="mt-2 text-lg font-bold text-foreground">{card.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{card.text}</p>
              </Link>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-secondary p-4 lg:p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-foreground lg:text-2xl">
                  Sabit fiyat değil, gerçek değer — rekabet en yüksek değeri ortaya çıkarır
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Canlı ihale akışıyla fiyat keşfi otomatik işler, alıcı ve satıcı için tek panelden şeffaf takip sağlanır.
                </p>
              </div>
              <Button asChild className="h-11 px-5 text-sm font-bold">
                <Link to="/borsa">Borsaya Gir</Link>
              </Button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <article className="rounded-xl border border-border bg-card p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Canlı Piyasa</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Aktif ihale: <strong className="text-foreground">{heroMetrics.active}</strong> · Hacim:{" "}
                  <strong className="text-foreground">
                    ₺{Math.max(0, heroMetrics.volume).toLocaleString("tr-TR")}
                  </strong>
                </p>
              </article>
              <article className="rounded-xl border border-border bg-card p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Şeffaf Komisyon</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  %{Math.round(COMMISSION_RATE * 100)} + %{Math.round(COMMISSION_RATE * 100)}, gizli ücret yok.
                </p>
                <Link to="/komisyon-hesaplayici" className="mt-2 inline-flex text-xs font-semibold text-primary hover:text-foreground">
                  Komisyon hesaplayıcı →
                </Link>
              </article>
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>

      <ScrollReveal delayMs={80}>
      <section className="mx-auto mt-8 w-full max-w-[1240px] px-4 lg:px-6">
        <div className="mb-5 flex items-center justify-between gap-4"><h2 className="text-2xl font-black text-foreground lg:text-3xl">Öne Çıkan İhaleler</h2><Link to={ROUTES.ILANLAR} className="rounded-lg border border-primary/35 bg-card px-3 py-1.5 text-sm font-bold text-primary transition hover:border-primary/70 hover:text-foreground">Tümünü Gör</Link></div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{unifiedFeaturedItems.map((item) => (<Link key={item.id} to={item.href} aria-label={`${item.title} — ${item.location}`} className="group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/45"><div className="relative h-40" aria-hidden="true" style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.2), rgba(0,0,0,.6)), url(${item.image})`, backgroundSize: "cover", backgroundPosition: "center" }}><span className={`absolute start-3 top-3 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold ${item.sponsored ? "bg-emerald-500/90 text-white" : "bg-rose-500/90 text-white"}`}>{item.sponsored ? "SPONSORLU" : "CANLI"}</span></div><div className="space-y-2 p-4"><p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{item.source}</p><h3 className="line-clamp-2 text-base font-bold text-foreground">{item.title}</h3><p className="text-xs text-muted-foreground">{item.location}</p><strong className="block text-lg font-extrabold text-foreground">{item.priceLabel}</strong></div></Link>))}</div>
      </section>
      </ScrollReveal>

      <ScrollReveal delayMs={120}>
      <section className="mx-auto mt-8 w-full max-w-[1240px] px-4 lg:px-6">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xl lg:p-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Güven & Kurumsal</p>
          <h2 className="mt-2 text-2xl font-black text-foreground lg:text-3xl">Canlı Güven Göstergeleri</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Escrow, KYC, komisyon şeffaflığı ve kart blokaj kuralı teklif akışında ilk görünen güven katmanıdır.
          </p>
          <div className="mt-5 grid gap-3 rounded-2xl border border-border bg-secondary p-4 md:grid-cols-4">
            {TRUST_METRICS.map((metric, idx) => {
              const current = liveTrustMetrics[idx]?.value ?? metric.value;
              const valueLabel =
                metric.key === "satisfaction"
                  ? `${Math.min(99.9, current).toFixed(1)}${metric.suffix}`
                  : `${metric.prefix}${current.toFixed(2)}${metric.suffix}`;
              return (
                <article key={metric.label} className="rounded-xl border border-border bg-card px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{metric.label}</p>
                  <p className={`mt-2 text-2xl font-black ${metric.tone}`}>{valueLabel}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">Canlı demo metrik</p>
                </article>
              );
            })}
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-xl border border-border bg-secondary p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Escrow</p>
              <p className="mt-2 text-sm text-muted-foreground">Ödeme, devir koşulları tamamlanmadan serbest bırakılmaz.</p>
            </article>
            <article className="rounded-xl border border-border bg-secondary p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">KYC</p>
              <p className="mt-2 text-sm text-muted-foreground">Kimlik doğrulama adımı teklif ve ödeme güvenliğini güçlendirir.</p>
            </article>
            <article className="rounded-xl border border-border bg-secondary p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Şeffaf Komisyon</p>
              <p className="mt-2 text-sm text-muted-foreground">
                %{Math.round(COMMISSION_RATE * 100)} + %{Math.round(COMMISSION_RATE * 100)} sabit model, gizli ücret yok.
              </p>
            </article>
            <article className="rounded-xl border border-border bg-secondary p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Kart Blokajı</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Teminat %{Math.round(BID_BOND_RATE * 100)} ön yetki olarak rezerve edilir, kazanmazsanız çözülür.
              </p>
            </article>
          </div>
          <h3 className="mt-6 text-xl font-black text-foreground lg:text-2xl">{home.investor.heading}</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{WHY_IHALAL_CARDS.map((card) => (<Link key={card.title} to={card.href} className={card.highlight ? "premium-why-card premium-why-card--highlight" : "premium-why-card"}><span className="premium-why-card__icon"><card.Icon className="h-5 w-5" /></span><h3>{card.title}</h3><p>{card.text}</p><ChevronRight className="premium-why-card__chev" /></Link>))}</div>
          <div className="mt-5 premium-trust-strip">{home.trust.map((item, i) => { const Icon = TRUST_ICONS[i] ?? Shield; return (<Link key={item.title} to={TRUST_LINKS[i] ?? ROUTES.ILANLAR} className="premium-trust-strip__item"><Icon className="h-4 w-4 text-primary" /><strong>{item.title}</strong><span>{item.sub}</span></Link>); })}</div>
          <section className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {ROLE_GATEWAYS.map((item) => (
              <Link key={item.role} to={item.href} className="rounded-xl border border-border bg-secondary p-4 transition hover:border-primary/40">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{item.role}</p>
                <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
                <span className="mt-3 inline-flex items-center text-xs font-semibold text-primary">Panele git →</span>
              </Link>
            ))}
          </section>
        </div>
      </section>
      </ScrollReveal>

      <ScrollReveal delayMs={160}>
      <section className="mx-auto mt-8 w-full max-w-[1240px] px-4 lg:px-6">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xl lg:p-8">
          <h2 className="text-2xl font-black text-foreground lg:text-3xl">Platform Modülleri</h2>
          <p className="mt-2 text-sm text-muted-foreground">GES, değerleme, araştırma zekâsı ve stratejik karar odası tek bölümde.</p>
          <div className="mt-5"><PlatformModulesShowcase embedded /></div>
          <div className="mt-6 premium-war-room"><div className="premium-war-room__copy"><p className="premium-war-room__eyebrow">Stratejik Karar Odası</p><h3>Zekâ Merkezi — kurumsal karar terminali</h3><p>Parsel istihbaratı, GES fizibilite, iBuyer senaryoları ve Palantir-tarzı war room tek çatıda. Demo ortamında senaryo verisi; üretimde RLS ve denetim kaydı hedeflenir.</p><Button asChild className="premium-btn premium-btn--primary h-auto">
                <Link to={ROUTES.WAR_ROOM}>
                  Karar odasına git <Radar className="h-4 w-4" />
                </Link>
              </Button></div><div className="premium-war-room__visual"><div className="premium-war-room__panel"><p className="premium-war-room__panel-title">Saha Alarmı</p><p className="premium-war-room__panel-text">Kritik bölgelerde teklif yoğunluğu, fiyat sıçraması ve likidite baskısı tek kartta izlenir.</p><span className="premium-war-room__panel-chip">Canlı veri akışı</span></div><div className="premium-war-room__panel premium-war-room__panel--accent"><p className="premium-war-room__panel-title">Risk Triage</p><p className="premium-war-room__panel-text">Deprem, ekspertiz ve belge sinyalleri birleşik skorla aksiyon listesine düşer.</p><span className="premium-war-room__panel-chip">Analiz hazır</span></div></div></div>
        </div>
      </section>
      </ScrollReveal>

      <ScrollReveal delayMs={200}>
      <section className="mx-auto mt-8 w-full max-w-[1240px] px-4 lg:px-6">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-xl lg:p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">Risk Araçları</p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-black text-foreground">Deprem Risk Şeffaflığı</h2>
            <Button asChild size="sm" className="rounded-lg px-4">
              <Link to="/modul/deprem-risk-haritasi">Risk Merkezi&apos;ne Git</Link>
            </Button>
          </div>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Her ilanda deprem risk skoru, fay mesafesi ve bölge analizi. Akıllı karar için risk araçları.
          </p>
        </div>
      </section>
      </ScrollReveal>

      <ScrollReveal delayMs={240}>
      <section className="mx-auto mt-8 w-full max-w-[1240px] px-4 lg:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          <article className="flex h-full flex-col rounded-2xl border border-amber-400/35 bg-card p-4"><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-amber-300">Kampanya</p><h3 className="mt-2 text-lg font-bold text-foreground">İlk 100 İşlemde Sıfır Komisyon</h3><p className="mt-2 flex-1 text-sm text-muted-foreground">Yeni alıcı ve satıcılar için demo kampanya akışı. Erken dönem işlem maliyeti avantajı.</p><Button asChild size="sm" className="mt-3 w-full rounded-lg"><Link to="/kampanyalar">Kampanyaları Gör</Link></Button></article>
          <article className="flex h-full flex-col rounded-2xl border border-cyan-400/35 bg-card p-4"><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-cyan-300">Reklam</p><h3 className="mt-2 text-lg font-bold text-foreground">Akıllı Konut Kredisi Teklifleri</h3><p className="mt-2 flex-1 text-sm text-muted-foreground">İlan fiyatına göre hızlı taksit simülasyonu ve kredi planlama akışı (mock sponsor).</p><Button asChild size="sm" className="mt-3 w-full rounded-lg"><Link to="/mortgage">İncele</Link></Button></article>
          <article className="flex h-full flex-col rounded-2xl border border-emerald-400/35 bg-card p-4"><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-300">Sponsorlu</p><h3 className="mt-2 text-lg font-bold text-foreground">Sigorta & Taşınma Paketi</h3><p className="mt-2 flex-1 text-sm text-muted-foreground">DASK, konut sigortası ve taşınma servisleri tek panelde — mock sponsor.</p><Button asChild size="sm" className="mt-3 w-full rounded-lg"><Link to="/modul/deprem-sigortasi">Teklif Al</Link></Button></article>
        </div>
      </section>
      </ScrollReveal>

      <ScrollReveal delayMs={280}>
      <section className="mx-auto mt-8 w-full max-w-[1240px] px-4 lg:px-6">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xl lg:p-8">
          <h2 className="text-2xl font-black text-foreground lg:text-3xl">Kurumsal Güven Panosu</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Logo vitrinleri yerine ölçülebilir ve dürüst güven metrikleri gösterilir (demo verisi).
          </p>
          <section className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <article className="rounded-xl border border-border bg-secondary p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">İşlem Hacmi</p>
              <strong className="mt-2 block text-2xl font-black text-foreground">₺12.8B+</strong>
              <p className="mt-1 text-xs text-muted-foreground">Son 12 ay demo toplamı</p>
            </article>
            <article className="rounded-xl border border-border bg-secondary p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Doğrulanmış Kullanıcı</p>
              <strong className="mt-2 block text-2xl font-black text-foreground">68.9K+</strong>
              <p className="mt-1 text-xs text-muted-foreground">KYC adımı tamamlayan hesaplar</p>
            </article>
            <article className="rounded-xl border border-border bg-secondary p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Escrow Uyum</p>
              <strong className="mt-2 block text-2xl font-black text-foreground">%96.4</strong>
              <p className="mt-1 text-xs text-muted-foreground">Escrow kurallarıyla kapanan işlemler</p>
            </article>
            <article className="rounded-xl border border-border bg-secondary p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">KYC Uyum</p>
              <strong className="mt-2 block text-2xl font-black text-foreground">%97.2</strong>
              <p className="mt-1 text-xs text-muted-foreground">Kimlik doğrulama tamamlama oranı</p>
            </article>
            <article className="rounded-xl border border-border bg-secondary p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Sertifika Durumu</p>
              <strong className="mt-2 block text-xl font-black text-foreground">ISO 27001 (Demo)</strong>
              <p className="mt-1 text-xs text-muted-foreground">Canlıya geçişte resmi audit gerekir</p>
            </article>
          </section>
        </div>
      </section>
      </ScrollReveal>

      <ScrollReveal delayMs={320}>
      <section className="mx-auto mt-8 w-full max-w-[1240px] px-4 pb-10 lg:px-6">
        <RecentlyViewed />
      </section>
      </ScrollReveal>
    </div>
  );
}
