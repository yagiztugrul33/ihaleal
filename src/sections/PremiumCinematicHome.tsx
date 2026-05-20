import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  Building2,
  ChevronRight,
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
import { useLocale } from "@/contexts/LocaleContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cinematicEase, staggerContainer, staggerItem } from "@/lib/motion/presets";
import { DepremTransparencyBand } from "@/components/home/DepremTransparencyBand";
import { HeroLiveAuctionCard } from "@/components/home/HeroLiveAuctionCard";
import { LiveEarthquakeTicker } from "@/components/home/LiveEarthquakeTicker";
import { PlatformModulesShowcase } from "@/sections/PlatformModulesShowcase";
import { ROUTES } from "@/constants/routes";
import { homeStepHref } from "@/data/nasilCalisirRoutes";
import { getAllProperties, getFeaturedAuctions } from "@/lib/demo-data";
import { formatTry } from "@/lib/valuation/valuationEngine";
import { getPropertyHero, getPropertyLocation, getPropertyTitle } from "@/types/property";
import type { CategoryKey } from "@/types/property";

const STAT_ICONS = [BarChart3, Shield, Users, Star] as const;
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
    title: "Deprem Şeffaflık Omurgası",
    text: "Bina riski, canlı Kandilli akışı, aile acil planı ve risk haritası.",
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

const MARKET_TICKER_ROWS = [
  { symbol: "IST · KONUT", last: "₺74.200/m²", change: 1.8 },
  { symbol: "ANK · TICARI", last: "₺52.800/m²", change: -0.6 },
  { symbol: "IZM · VILLA", last: "₺91.400/m²", change: 2.4 },
  { symbol: "BUR · SANAYI", last: "₺38.700/m²", change: 0.9 },
  { symbol: "ANT · TURIZM", last: "₺68.100/m²", change: 1.2 },
  { symbol: "GES · ALTYAPI", last: "₺44.900/m²", change: -0.4 },
] as const;

const MARKET_SUMMARY = [
  { key: "volume", label: "24s Hacim", value: 128_400_000, suffix: "₺", delta: "+6.2%" },
  { key: "active", label: "Aktif İhale", value: 312, suffix: "", delta: "+12" },
  { key: "avgRise", label: "Ort. Artış", value: 14.8, suffix: "%", delta: "+1.1 puan" },
  { key: "investorFlow", label: "Yeni İzleyici", value: 1896, suffix: "", delta: "+8.4%" },
] as const;

function parseStatNumber(raw: string): number {
  const digits = raw.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
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
  const reduced = useReducedMotion();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const statTargets = useMemo(
    () => home.stats.map((s) => ({ ...s, target: parseStatNumber(s.value) })),
    [home.stats],
  );

  const [animatedStats, setAnimatedStats] = useState<number[]>(() =>
    statTargets.map(() => 0),
  );
  const [marketSummaryValues, setMarketSummaryValues] = useState<number[]>(() =>
    MARKET_SUMMARY.map(() => 0),
  );

  useEffect(() => {
    let frame = 0;
    const id = window.setInterval(() => {
      frame += 1;
      const p = Math.min(frame / 60, 1);
      setAnimatedStats(statTargets.map((s) => Math.floor(s.target * p)));
      if (p >= 1) window.clearInterval(id);
    }, 25);
    return () => window.clearInterval(id);
  }, [statTargets]);

  useEffect(() => {
    let frame = 0;
    const id = window.setInterval(() => {
      frame += 1;
      const progress = Math.min(frame / 70, 1);
      setMarketSummaryValues(
        MARKET_SUMMARY.map((item) =>
          item.key === "avgRise"
            ? Number((item.value * progress).toFixed(1))
            : Math.floor(item.value * progress),
        ),
      );
      if (progress >= 1) window.clearInterval(id);
    }, 20);
    return () => window.clearInterval(id);
  }, []);

  const stats = useMemo(
    () =>
      statTargets.map((stat, i) => ({
        ...stat,
        Icon: STAT_ICONS[i] ?? BarChart3,
        display:
          stat.value.includes("%") ? `${animatedStats[i]}%` : animatedStats[i].toLocaleString("tr-TR"),
      })),
    [animatedStats, statTargets],
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

  const statViewProps = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-40px" },
        transition: cinematicEase,
      };

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
          <div className="flex w-max min-w-full animate-[home-eq-marquee_38s_linear_infinite] items-center gap-3 px-4 py-2.5 [@media(max-width:768px)]:animate-none [@media(max-width:768px)]:flex-wrap">
            {[...MARKET_TICKER_ROWS, ...MARKET_TICKER_ROWS].map((row, idx) => {
              const up = row.change >= 0;
              return (
                <div
                  key={`${row.symbol}-${idx}`}
                  className={`inline-flex min-w-[200px] items-center justify-between gap-3 rounded-lg border px-3 py-2 text-xs ${
                    up
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                      : "border-rose-500/30 bg-rose-500/10 text-rose-200"
                  }`}
                >
                  <span className="font-semibold tracking-wide text-slate-100">{row.symbol}</span>
                  <span className="font-bold">{row.last}</span>
                  <span className="inline-flex items-center gap-1 font-bold">
                    {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    {up ? "+" : ""}
                    {row.change.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section
        className="relative mx-auto grid w-full max-w-[1240px] gap-6 px-4 pb-10 pt-10 lg:grid-cols-[1.2fr_1fr_0.9fr] lg:items-start lg:px-6"
        aria-labelledby="premium-hero-title"
      >
        <div className="absolute inset-0 -z-10 rounded-[32px] border border-blue-500/20 bg-gradient-to-b from-[#0a1628] via-[#0a1f3d] to-slate-950/95 shadow-[0_40px_120px_rgba(15,23,42,0.65)]" />
        <motion.div
          className="space-y-6 p-2 lg:space-y-7 lg:p-6"
          variants={reduced ? undefined : staggerContainer}
          initial={reduced ? false : "hidden"}
          animate={reduced ? undefined : "show"}
        >
          <motion.p className="inline-flex items-center rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-200" variants={reduced ? undefined : staggerItem}>
            Premium İhale Terminali
          </motion.p>
          <motion.h1 id="premium-hero-title" className="max-w-2xl text-4xl font-black leading-[1.04] tracking-[-0.02em] text-white lg:text-[3.3rem]" variants={reduced ? undefined : staggerItem}>
            {home.hero.titleLead}{" "}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              {home.hero.titleAccent}
            </span>
          </motion.h1>
          <motion.p className="max-w-2xl text-[15px] leading-7 text-slate-300 lg:text-[18px] lg:leading-8" variants={reduced ? undefined : staggerItem}>
            {home.hero.subtitle}
          </motion.p>
          <motion.div className="flex flex-wrap gap-3" variants={reduced ? undefined : staggerItem}>
            <Link className="inline-flex items-center rounded-xl border border-cyan-200/40 bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-[0_14px_34px_rgba(14,116,255,0.38)] transition hover:from-blue-400 hover:to-cyan-400" to={ROUTES.ILANLAR}>
              {home.hero.ctaExplore} <span aria-hidden="true">{"\u2192"}</span>
            </Link>
            <Link className="inline-flex items-center rounded-xl border border-slate-200/40 bg-slate-950/85 px-5 py-3 text-sm font-bold text-slate-50 shadow-[0_12px_28px_rgba(2,6,23,0.45)] transition hover:border-cyan-300/70 hover:text-cyan-100" to={ROUTES.NASIL_CALISIR}>
              {home.hero.ctaHow}
            </Link>
          </motion.div>
          <div className="lg:hidden">
            <HeroLiveAuctionCard
              className="border-blue-400/35 bg-slate-950/90"
              title={home.live.title}
              liveLabel={home.live.live}
              growthLabel={home.live.growth}
              viewLabel={home.live.view}
            />
          </div>
        </motion.div>

        <div className="premium-hero__visual relative hidden min-h-[360px] overflow-hidden rounded-3xl border border-slate-700/50 bg-slate-900 shadow-2xl lg:block" aria-label={home.aria.heroVisual}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(56,189,248,0.35),transparent_38%),radial-gradient(circle_at_76%_22%,rgba(59,130,246,0.28),transparent_42%),radial-gradient(circle_at_50%_78%,rgba(14,165,233,0.16),transparent_45%),linear-gradient(150deg,#020617_0%,#07152d_52%,#0b2445_100%)]" />
          <div className="absolute -left-20 top-16 h-64 w-64 rounded-full border border-cyan-400/20 bg-cyan-400/10 blur-2xl" aria-hidden="true" />
          <div className="absolute right-8 top-8 h-48 w-48 rounded-full border border-blue-400/20 bg-blue-500/10 blur-2xl" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/90 via-[#0d1f39]/70 to-transparent" />
          <div className="absolute left-8 top-8 right-8 grid grid-cols-2 gap-2 text-[11px] text-slate-300/80" aria-hidden="true">
            <span className="rounded-md border border-white/10 bg-slate-900/40 px-2 py-1">Likidite: canlı</span>
            <span className="rounded-md border border-white/10 bg-slate-900/40 px-2 py-1 text-right">Risk bandı: şeffaf</span>
            <span className="rounded-md border border-white/10 bg-slate-900/40 px-2 py-1">Emsal veri: aktif</span>
            <span className="rounded-md border border-white/10 bg-slate-900/40 px-2 py-1 text-right">Uyum: denetlenebilir</span>
          </div>
          <HeroLiveAuctionCard
            className="absolute bottom-5 left-5 right-5 border-blue-400/30 bg-[#081425]/90"
            title={home.live.title}
            liveLabel={home.live.live}
            growthLabel={home.live.growth}
            viewLabel={home.live.view}
          />
        </div>

        <aside className="grid gap-3 p-2 lg:p-6" aria-label={home.aria.statRail}>
          {stats.map((stat) => (
            <motion.article
              key={stat.label}
              className="rounded-2xl border border-blue-500/20 bg-slate-900/75 p-4 shadow-lg shadow-slate-950/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(37,99,235,0.22)]"
              {...statViewProps}
            >
              <span className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-300" aria-hidden="true">
                <stat.Icon className="h-4 w-4" />
              </span>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{stat.label}</p>
                <strong className="block text-2xl font-extrabold text-white">{stat.display}</strong>
                <small className="text-xs text-slate-400">{stat.vs}</small>
              </div>
              <b className="mt-2 inline-block text-xs font-bold text-emerald-300">{stat.delta}</b>
            </motion.article>
          ))}
        </aside>
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

      <DepremTransparencyBand />
      <LiveEarthquakeTicker />

      <section className="mx-auto mt-8 w-full max-w-[1240px] px-4 lg:px-6" aria-label="Piyasa özeti">
        <div className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/60 md:grid-cols-2 xl:grid-cols-4 xl:p-6">
          {MARKET_SUMMARY.map((item, i) => {
            const value = marketSummaryValues[i] ?? 0;
            const formatted =
              item.key === "volume"
                ? `${item.suffix}${Math.round(value).toLocaleString("tr-TR")}`
                : item.key === "avgRise"
                  ? `${value.toFixed(1)}${item.suffix}`
                  : `${Math.round(value).toLocaleString("tr-TR")}${item.suffix}`;
            return (
              <article
                key={item.key}
                className="rounded-2xl border border-slate-700/70 bg-slate-950/70 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/40 hover:shadow-[0_16px_45px_rgba(30,64,175,0.25)]"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                <strong className="mt-2 block text-2xl font-black text-white">{formatted}</strong>
                <p className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-300">
                  <TrendingUp className="h-3.5 w-3.5" /> {item.delta}
                </p>
              </article>
            );
          })}
        </div>
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
          <div className="premium-war-room__panel" />
          <div className="premium-war-room__panel premium-war-room__panel--accent" />
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
