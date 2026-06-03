import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Gavel,
  Globe,
  Headphones,
  Heart,
  Home,
  MapPin,
  Play,
  Search,
  Shield,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WaveBackground } from "@/components/home/WaveBackground";
import { ROUTES } from "@/constants/routes";
import { useLocale } from "@/contexts/LocaleContext";
import { PlatformModulesShowcase } from "@/sections/PlatformModulesShowcase";

/** Referans mockup — gece lüks villa hero */
const HERO_VILLA =
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1400&q=85&auto=format";

const PROP_IMGS = [
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80&auto=format",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80&auto=format",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80&auto=format",
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80&auto=format",
];

const pageBg: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #0a0e1a 0%, #0f1729 50%, #0a0e1a 100%)",
  color: "#e2e8f0",
};

const TRUST_ICONS: LucideIcon[] = [Shield, Users, Star, Headphones];
const STAT_ICONS: LucideIcon[] = [Home, Check, Users, Star];
const STEP_ICONS: LucideIcon[] = [Search, Shield, Gavel, Trophy];
const SIDEBAR_ICONS: LucideIcon[] = [Shield, BarChart3, CheckCircle2, Globe, Headphones];
const SIDEBAR_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

export function HomeTarget() {
  const { t } = useLocale();
  const h = t.home;
  const [stats, setStats] = useState({ a: 0, b: 0, c: 0, d: 0 });

  useEffect(() => {
    const target = { a: 12458, b: 3127, c: 10843, d: 98 };
    let i = 0;
    const tm = setInterval(() => {
      i++;
      const p = i / 60;
      setStats({
        a: Math.floor(target.a * p),
        b: Math.floor(target.b * p),
        c: Math.floor(target.c * p),
        d: Math.floor(target.d * p),
      });
      if (i >= 60) clearInterval(tm);
    }, 25);
    return () => clearInterval(tm);
  }, []);

  const statValues = [
    stats.a.toLocaleString(),
    stats.b.toLocaleString(),
    stats.c.toLocaleString(),
    `${stats.d}%`,
  ];
  const statChanges = ["+12.5%", "+8.3%", "+15.2%", "+2.1%"];

  return (
    <div style={pageBg} className="home-target-page">
      <section
        className="home-target-hero relative min-h-[min(88vh,760px)] overflow-hidden px-4 pb-16 pt-8 sm:px-6"
        aria-labelledby="home-hero-title"
      >
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background: "linear-gradient(180deg, #0a0e1a 0%, #0f1729 55%, #0a0e1a 100%)",
          }}
        />
        <WaveBackground className="z-[1]" />
        <div
          className="pointer-events-none absolute inset-0 z-[1] opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148,163,184,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,.04) 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="home-target-hero-grid relative z-[2] mx-auto grid max-w-[1500px] grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(340px,1.15fr)_minmax(240px,260px)] xl:gap-6">
          <div className="flex min-w-0 flex-col gap-6 xl:max-w-[560px]">
            <div
              className="inline-flex items-center gap-2.5 rounded-full border border-slate-600/30 px-4 py-2 text-sm backdrop-blur-md"
              style={{ background: "rgba(15, 23, 41, 0.65)" }}
            >
              <Shield className="h-4 w-4 text-blue-400" strokeWidth={2} />
              <span className="text-slate-200">{h.hero.badge}</span>
              <span
                className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"
                aria-hidden
              />
            </div>

            <h1
              id="home-hero-title"
              className="text-[clamp(2.25rem,5.5vw,4.25rem)] font-extrabold leading-[1.06] tracking-[-0.03em] text-[#f8fafc]"
            >
              {h.hero.titleLead}{" "}
              <span
                className="bg-gradient-to-r from-blue-400 via-sky-300 to-white bg-clip-text text-transparent"
              >
                {h.hero.titleAccent}
              </span>
            </h1>

            <p className="max-w-[480px] text-[1.02rem] leading-relaxed text-slate-400">
              {h.hero.subtitle}
            </p>

            <div className="flex flex-wrap items-stretch gap-3 sm:items-center">
              <Button asChild size="lg" className="min-h-12 min-w-[11rem]">
                <Link to={ROUTES.ILANLAR}>
                  {h.hero.ctaExplore}
                  <ArrowRight className="rtl:rotate-180 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="min-h-12 min-w-[11rem]">
                <Link to={ROUTES.NASIL_CALISIR}>
                  <Play className="h-4 w-4 fill-current" />
                  {h.hero.ctaHow}
                </Link>
              </Button>
            </div>

            <TrustSignalsRow items={h.trust} />

            <div className="xl:hidden">
              <LiveChartCard live={h.live} />
            </div>
          </div>

          <div className="home-hero-villa relative hidden min-h-[340px] overflow-hidden rounded-2xl border border-slate-600/25 shadow-2xl xl:block">
            <img
              src={HERO_VILLA}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(10,14,26,.5) 0%, rgba(10,14,26,.12) 50%, rgba(10,14,26,.4) 100%)",
              }}
            />
            <div className="absolute bottom-4 end-4 z-[2] w-[min(100%,320px)]">
              <LiveChartCard live={h.live} />
            </div>
          </div>

          <StatCardsColumn
            labels={h.stats}
            values={statValues}
            changes={statChanges}
          />
        </div>
      </section>

      <div className="relative z-[2] border-t border-slate-800/50 px-4 py-12 sm:px-6">
        <PlatformModulesShowcase />
      </div>

      <HowItWorksSection how={h.how} />
      <LiveAuctionsWithSidebar auctions={h.auctions} how={h.how} />
      <TrustedBySection trusted={h.trusted} />

      <style>{`
        @media (max-width: 1024px) {
          .home-target-hero-grid { grid-template-columns: 1fr !important; }
          .home-target-stat-cards {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .home-target-how-grid { grid-template-columns: 1fr !important; }
          .home-target-auctions-grid { grid-template-columns: 1fr !important; }
          .home-target-steps { grid-template-columns: repeat(2, 1fr) !important; }
          .home-target-step-line { display: none !important; }
        }
        @media (max-width: 768px) {
          .home-target-steps { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function LiveChartCard({ live }: { live: HomeMessages["live"] }) {
  return (
    <div
      className="w-full max-w-[400px] rounded-[16px] border border-slate-600/30 p-5 shadow-[0_16px_40px_rgba(0,0,0,.35)] backdrop-blur-[20px]"
      style={{ background: "rgba(15, 23, 41, 0.88)" }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[.9rem] font-semibold text-[#f8fafc]">{live.title}</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/12 px-2 py-0.5 text-[.68rem] font-semibold uppercase tracking-wide text-emerald-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          {live.live}
        </span>
      </div>
      <div className="mb-0.5 text-[3.5rem] font-extrabold leading-none tracking-tight text-[#f8fafc]">
        284
      </div>
      <div className="mb-3 text-[.88rem] font-semibold text-emerald-400">{live.growth}</div>
      <svg viewBox="0 0 400 80" className="mb-3 h-[64px] w-full" aria-hidden>
        <defs>
          <linearGradient id="liveGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity=".45" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,65 L40,60 L80,55 L120,48 L160,42 L200,38 L240,32 L280,25 L320,20 L360,12 L400,8 L400,80 L0,80 Z"
          fill="url(#liveGrad)"
        />
        <path
          d="M0,65 L40,60 L80,55 L120,48 L160,42 L200,38 L240,32 L280,25 L320,20 L360,12 L400,8"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
        />
      </svg>
      <Button asChild variant="link" className="h-auto p-0 text-sm font-semibold">
        <Link to={ROUTES.ILANLAR}>
          {live.view}
          <ChevronRight className="rtl:rotate-180 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

type HomeMessages = import("@/i18n/messages").HomeMessages;

function TrustSignalsRow({ items }: { items: HomeMessages["trust"] }) {
  return (
    <div className="mt-6 grid max-w-[720px] gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((x, i) => {
        const Icon = TRUST_ICONS[i] ?? Shield;
        return (
          <div key={x.title} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-500/25 bg-blue-500/10">
              <Icon className="h-4 w-4 text-blue-400" strokeWidth={2} />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-50">{x.title}</div>
              <div className="text-[.7rem] text-slate-500">{x.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatCardsColumn({
  labels,
  values,
  changes,
}: {
  labels: HomeMessages["stats"];
  values: string[];
  changes: string[];
}) {
  return (
    <div className="home-target-stat-cards relative z-[2] flex flex-col gap-3">
      {labels.map((x, i) => {
        const Icon = STAT_ICONS[i] ?? Home;
        return (
          <div
            key={x.label}
            className="rounded-xl border border-slate-600/20 p-3.5 backdrop-blur-xl"
            style={{ background: "rgba(15, 23, 41, 0.72)" }}
          >
            <div className="flex items-start gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/12">
                <Icon className="h-4 w-4 text-blue-400" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 text-[.65rem] uppercase tracking-wider text-slate-500">
                  {x.label}
                </div>
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                  <span className="text-xl font-bold tracking-tight text-slate-50">{values[i]}</span>
                  <span className="text-[.68rem] font-semibold text-emerald-400">{changes[i]}</span>
                </div>
                <div className="mt-0.5 text-[.62rem] text-slate-600">{x.vs}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HowItWorksSection({ how }: { how: HomeMessages["how"] }) {
  return (
    <section className="px-4 py-14 sm:px-6">
      <div
        className="home-target-how-grid mx-auto max-w-[1400px] rounded-[20px] border border-slate-600/20 p-6 lg:p-10"
        style={{ background: "rgba(15, 23, 41, 0.45)" }}
      >
        <div>
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-[clamp(1.6rem,3.5vw,2.35rem)] font-bold tracking-tight text-slate-50">
              {how.title}
            </h2>
            <p className="text-sm text-slate-500">{how.subtitle}</p>
          </div>
          <div className="home-target-steps relative grid grid-cols-4 gap-3">
            <div
              className="home-target-step-line absolute left-[10%] right-[10%] top-7 z-0 h-0.5"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgba(59,130,246,.45) 50%, transparent 50%)",
                backgroundSize: "10px 2px",
              }}
            />
            {how.steps.map((x, i) => {
              const Icon = STEP_ICONS[i] ?? Search;
              const num = String(i + 1).padStart(2, "0");
              return (
                <div key={x.title} className="relative z-[1] text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-blue-500/35 bg-gradient-to-br from-blue-500/20 to-indigo-900/50 shadow-lg shadow-blue-500/15">
                    <Icon className="h-6 w-6 text-blue-300" strokeWidth={1.75} />
                  </div>
                  <div className="mb-1 text-[10px] font-bold tracking-widest text-blue-400">
                    {num}
                  </div>
                  <h3 className="mb-1.5 text-sm font-semibold text-slate-50">{x.title}</h3>
                  <p className="m-0 text-[.75rem] leading-snug text-slate-500">{x.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}

function LiveAuctionsWithSidebar({
  auctions,
  how,
}: {
  auctions: HomeMessages["auctions"];
  how: HomeMessages["how"];
}) {
  return (
    <section className="px-4 pb-14 pt-10 sm:px-6">
      <div className="home-target-auctions-grid mx-auto grid max-w-[1400px] gap-8 lg:grid-cols-[1fr_300px]">
        <LiveAuctionsContent auctions={auctions} />
        <InvestorTrustSidebar how={how} />
      </div>
    </section>
  );
}

function LiveAuctionsContent({ auctions }: { auctions: HomeMessages["auctions"] }) {
  return (
    <>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <h2 className="m-0 text-[clamp(1.4rem,2.8vw,1.85rem)] font-bold text-slate-50">
          {auctions.title}
        </h2>
        <Link
          to={ROUTES.ILANLAR}
          className="inline-flex items-center gap-1 text-sm font-semibold text-blue-400 no-underline"
        >
          {auctions.viewAll}
          <ChevronRight className="rtl:rotate-180 h-4 w-4" />
        </Link>
      </div>
      <LiveAuctionsGrid auctions={auctions} />
    </>
  );
}

function LiveAuctionsGrid({ auctions }: { auctions: HomeMessages["auctions"] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {auctions.items.map((item, idx) => (
        <AuctionCard key={item.title} item={item} idx={idx} auctions={auctions} />
      ))}
    </div>
  );
}

function InvestorTrustSidebar({ how }: { how: HomeMessages["how"] }) {
  return (
    <aside
      className="rounded-2xl border border-slate-600/20 p-5 lg:sticky lg:top-24 lg:self-start"
      style={{ background: "rgba(10, 14, 26, 0.55)" }}
    >
      <h3 className="mb-4 text-[.95rem] font-semibold text-slate-50">{how.sidebarTitle}</h3>
      <div className="flex flex-col gap-3">
        {how.sidebar.map((x, i) => {
          const Icon = SIDEBAR_ICONS[i] ?? Shield;
          const c = SIDEBAR_COLORS[i] ?? "#3b82f6";
          return (
            <div key={x.title} className="flex items-start gap-2.5">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `${c}18`, border: `1px solid ${c}35` }}
              >
                <Icon className="h-4 w-4" style={{ color: c }} strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[.8rem] font-semibold text-slate-100">{x.title}</div>
                <div className="text-[.7rem] text-slate-500">{x.sub}</div>
              </div>
              <ChevronRight className="rtl:rotate-180 mt-1 h-4 w-4 shrink-0 text-slate-600" />
            </div>
          );
        })}
      </div>
      <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-700/40 pt-4">
        {how.certs.map((b) => (
          <div
            key={b.title}
            className="min-w-[88px] flex-1 rounded-lg border border-slate-600/20 px-2.5 py-2 text-center"
            style={{ background: "rgba(15, 23, 41, 0.5)" }}
          >
            <div className="text-[10px] font-bold text-slate-100">
              {b.flag ? `${b.flag} ` : ""}
              {b.title}
            </div>
            <div className="text-[.62rem] text-slate-500">{b.sub}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function AuctionCard({
  item,
  idx,
  auctions,
}: {
  item: HomeMessages["auctions"]["items"][number];
  idx: number;
  auctions: HomeMessages["auctions"];
}) {
  return (
    <article
      className="overflow-hidden rounded-[14px] border border-slate-600/20 transition hover:border-slate-500/35"
      style={{ background: "rgba(15, 23, 41, 0.55)" }}
    >
      <div
        className="relative h-[168px] bg-cover bg-center"
        style={{ backgroundImage: `url('${PROP_IMGS[idx]}')` }}
      >
        <span className="absolute start-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-red-500/95 px-2 py-0.5 text-[.65rem] font-bold uppercase tracking-wide text-white">
          <span className="h-1 w-1 animate-pulse rounded-full bg-white" />
          {auctions.live}
        </span>
        <button
          type="button"
          className="absolute end-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-slate-900/75 text-slate-200 backdrop-blur-sm"
          aria-label="Favorites"
        >
          <Heart className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
      <div className="p-3.5">
        <h3 className="mb-0.5 text-[.95rem] font-semibold text-slate-50">{item.title}</h3>
        <p className="mb-2.5 flex items-center gap-1 text-[.75rem] text-slate-500">
          <MapPin className="h-3 w-3 shrink-0" />
          {item.location}
        </p>
        <p className="mb-1 text-[.62rem] font-medium uppercase tracking-wider text-slate-500">
          {auctions.currentBid}
        </p>
        <div className="mb-2.5 flex items-baseline justify-between gap-2">
          <span className="text-lg font-bold text-slate-50">{item.price}</span>
          <span className="text-xs font-semibold text-emerald-400">{item.change}</span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-700/50 pt-2.5 text-[.7rem] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {item.time}
          </span>
          <span className="inline-flex items-center gap-0.5 font-medium text-blue-400">
            {item.bids}
            <ChevronRight className="rtl:rotate-180 h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
}

function TrustedBySection({ trusted }: { trusted: HomeMessages["trusted"] }) {
  const brands = ["JLL", "CBRE", "Colliers", "Knight Frank", "Cushman & Wakefield", "Savills", "EY"];
  return (
    <section className="border-t border-slate-700/40 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-[1400px] text-center">
        <p className="mb-5 text-[11px] uppercase tracking-[0.2em] text-slate-600">{trusted.title}</p>
        <div className="mb-6 flex flex-wrap items-center justify-center gap-6 opacity-45 md:gap-10">
          {brands.map((b) => (
            <span key={b} className="font-mono text-sm font-semibold tracking-wide text-slate-300">
              {b}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {trusted.certs.map((b) => (
            <div
              key={b.title}
              className="rounded-lg border border-slate-600/20 px-4 py-2.5"
              style={{ background: "rgba(15, 23, 41, 0.45)" }}
            >
              <div className="text-xs font-bold text-slate-100">{b.title}</div>
              <div className="text-[.65rem] text-slate-500">{b.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
