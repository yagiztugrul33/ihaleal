import { useEffect, useMemo, useState, type CSSProperties } from "react";
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

const HERO_VILLA =
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1400&q=85&auto=format";

function parseStatNumber(raw: string): number {
  const digits = raw.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

export default function PremiumCinematicHome() {
  const { t } = useLocale();
  const home = t.home;
  const reduced = useReducedMotion();

  const statTargets = useMemo(
    () => home.stats.map((s) => ({ ...s, target: parseStatNumber(s.value) })),
    [home.stats],
  );

  const [animatedStats, setAnimatedStats] = useState<number[]>(() =>
    statTargets.map(() => 0),
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

  const heroStyle = {
    "--villa-image": `url('${HERO_VILLA}')`,
    position: "relative",
  } as CSSProperties;

  const statViewProps = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-40px" },
        transition: cinematicEase,
      };

  return (
    <div className="premium-home" data-testid="premium-cinematic-home">
      <div className="premium-home__noise" aria-hidden="true" />
      <div className="premium-home__grid" aria-hidden="true" />

      <section className="premium-hero" aria-labelledby="premium-hero-title">
        <motion.div
          className="premium-hero__copy"
          variants={reduced ? undefined : staggerContainer}
          initial={reduced ? false : "hidden"}
          animate={reduced ? undefined : "show"}
        >
          <motion.h1 id="premium-hero-title" variants={reduced ? undefined : staggerItem}>
            {home.hero.titleLead}{" "}
            <span className="premium-hero__accent">{home.hero.titleAccent}</span>
          </motion.h1>
          <motion.p className="premium-hero__lead" variants={reduced ? undefined : staggerItem}>
            {home.hero.subtitle}
          </motion.p>
          <motion.div className="premium-hero__ctas" variants={reduced ? undefined : staggerItem}>
            <Link className="premium-btn premium-btn--primary" to={ROUTES.ILANLAR}>
              {home.hero.ctaExplore} <span aria-hidden="true">{"\u2192"}</span>
            </Link>
            <Link className="premium-btn premium-btn--glass" to={ROUTES.NASIL_CALISIR}>
              {home.hero.ctaHow}
            </Link>
          </motion.div>
          <div className="premium-hero__live-mobile">
            <HeroLiveAuctionCard
              className="premium-live-card--inline"
              title={home.live.title}
              liveLabel={home.live.live}
              growthLabel={home.live.growth}
              viewLabel={home.live.view}
            />
          </div>
        </motion.div>

        <div
          className="premium-hero__visual premium-hero__visual--cinematic"
          style={heroStyle}
          aria-label={home.aria.heroVisual}
        >
          <HeroLiveAuctionCard
            className="premium-live-card--overlay"
            title={home.live.title}
            liveLabel={home.live.live}
            growthLabel={home.live.growth}
            viewLabel={home.live.view}
          />
        </div>

        <aside className="premium-stat-rail" aria-label={home.aria.statRail}>
          {stats.map((stat) => (
            <motion.article key={stat.label} className="premium-stat-card" {...statViewProps}>
              <span className="premium-stat-card__icon" aria-hidden="true">
                <stat.Icon className="h-5 w-5" />
              </span>
              <div>
                <p>{stat.label}</p>
                <strong>{stat.display}</strong>
                <small>{stat.vs}</small>
              </div>
              <b>{stat.delta}</b>
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

      <section className="premium-process premium-process--standalone" id="how-it-works" aria-labelledby="premium-process-title">
        <h2 id="premium-process-title">{home.how.title}</h2>
        <p>{home.how.subtitle}</p>
        <div className="premium-steps premium-steps--connected">
          <div className="premium-steps__line" aria-hidden="true" />
          {steps.map((step) => (
            <Link key={step.no} to={step.href} className="premium-step premium-step--link">
              <div className="premium-step__icon" aria-hidden="true">
                <step.Icon className="h-6 w-6" />
              </div>
              <div>
                <span>{step.no}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="premium-process__cta">
          <Link to={ROUTES.HOW_IT_WORKS} className="premium-btn premium-btn--glass">
            Tüm rehber ve tanıtım videosu
          </Link>
        </div>
      </section>

      <section className="premium-auctions premium-auctions--standalone" aria-labelledby="premium-auctions-title">
        <div className="premium-section-head">
          <h2 id="premium-auctions-title">{home.featured.heading}</h2>
          <Link to={ROUTES.ILANLAR}>{home.featured.viewAll}</Link>
        </div>
        <div className="premium-auction-grid">
          {liveAuctions.map((p) => (
            <Link key={p.id} to={`/ilanlar/${p.id}`} className="premium-auction-card premium-auction-card--v2">
              <div
                className="premium-auction-card__image"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.15), rgba(0,0,0,.55)), url(${getPropertyHero(p) ?? "/images/auction-1.jpg"})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <span className="premium-auction-card__live">
                  <i aria-hidden /> LIVE
                </span>
                <button
                  type="button"
                  className="premium-auction-card__fav"
                  aria-label="Favori"
                  onClick={(e) => e.preventDefault()}
                >
                  <Heart className="h-4 w-4" />
                </button>
              </div>
              <div className="premium-auction-card__body">
                <h3>{getPropertyTitle(p)}</h3>
                <p>
                  <MapPin className="h-3.5 w-3.5" aria-hidden /> {getPropertyLocation(p)}
                </p>
                <div className="premium-auction-card__bid">
                  <div>
                    <small>Cari Teklif</small>
                    <strong>{p.currentBidTry != null ? formatTry(p.currentBidTry) : "—"}</strong>
                  </div>
                  <b>+4%</b>
                </div>
                <div className="premium-auction-card__meta">
                  <span>Canlı ihale</span>
                  <span>{p.bidCount ?? 0} teklif</span>
                </div>
              </div>
            </Link>
          ))}
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
