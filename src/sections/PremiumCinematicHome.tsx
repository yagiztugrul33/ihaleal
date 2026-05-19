import { useMemo, useRef, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  BarChart3,
  Building2,
  Factory,
  Gavel,
  Headphones,
  Heart,
  Home as HomeIcon,
  Hotel,
  Landmark,
  MapPin,
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
import { LiveEarthquakeTicker } from "@/components/home/LiveEarthquakeTicker";
import { PlatformModulesShowcase } from "@/sections/PlatformModulesShowcase";
import { getAllProperties, getFeaturedAuctions } from "@/lib/demo-data";
import { formatTry } from "@/lib/valuation/valuationEngine";
import { getPropertyHero, getPropertyLocation, getPropertyTitle } from "@/types/property";
import type { CategoryKey } from "@/types/property";

const STAT_ICONS = [BarChart3, Shield, Users, Star] as const;
const TRUST_ICONS = [Shield, Users, Star, Headphones] as const;
const STEP_ICONS = [Search, Shield, Gavel, Star] as const;
const STEP_NOS = ["01", "02", "03", "04"] as const;

const H8_CATEGORIES: {
  key: CategoryKey;
  icon: typeof HomeIcon;
  gradient: string;
}[] = [
  { key: "konut", icon: HomeIcon, gradient: "linear-gradient(135deg,#1d4ed8,#3b82f6)" },
  { key: "ticari", icon: Building2, gradient: "linear-gradient(135deg,#0f766e,#14b8a6)" },
  { key: "endustri", icon: Factory, gradient: "linear-gradient(135deg,#b45309,#f59e0b)" },
  { key: "konaklama", icon: Hotel, gradient: "linear-gradient(135deg,#7c3aed,#a78bfa)" },
  { key: "arsa", icon: MapPin, gradient: "linear-gradient(135deg,#15803d,#22c55e)" },
  { key: "komple", icon: Landmark, gradient: "linear-gradient(135deg,#be123c,#f43f5e)" },
  { key: "altyapi", icon: Zap, gradient: "linear-gradient(135deg,#0369a1,#38bdf8)" },
  { key: "devren", icon: Warehouse, gradient: "linear-gradient(135deg,#4b5563,#9ca3af)" },
];

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
      "12 sekmeli ilan detayı ve ekspertiz indirme akışı, saha ziyaretinden önce ön analizi hızlandırıyor. Özellikle endüstri ve otel tipleri zengin.",
    initials: "MY",
    hue: 200,
  },
  {
    name: "Zeynep Arslan",
    role: "Yatırımcı",
    company: "Ege Portföy",
    date: "Ocak 2026",
    quote:
      "Canlı ihale kartları ve kalan süre göstergesi portföy takibini tek ekranda topluyor. Bodrum ve İzmir segmentlerinde likidite iyi.",
    initials: "ZA",
    hue: 260,
  },
  {
    name: "Can Demir",
    role: "Müteahhit",
    company: "Kentsel Yapı",
    date: "Aralık 2025",
    quote:
      "Kat karşılığı arsa modülü ile parsel ve imar verisini aynı yerden okuyoruz. GES analizi sayfası enerji projelerinde ayrı değer.",
    initials: "CD",
    hue: 180,
  },
  {
    name: "Elif Sarı",
    role: "Emlak Ofisi Sahibi",
    company: "Merkez Emlak",
    date: "Kasım 2025",
    quote:
      "Toplu ilan yükleme ve AI fiyat tahmini demo ortamında bile ekip içi eğitimi hızlandırdı. Müşteri paneli sade ve anlaşılır.",
    initials: "ES",
    hue: 300,
  },
  {
    name: "Burak Yılmaz",
    role: "Kurumsal Satın Alma",
    company: "Lojistik A.Ş.",
    date: "Ekim 2025",
    quote:
      "Depo ve OSB filtreleri gerçekten sektöre özel. Elektrik kW ve rampa sayısı gibi alanlar klasik ilan sitelerinde yok.",
    initials: "BY",
    hue: 30,
  },
] as const;

const CHART_HEIGHTS = ["32%", "45%", "38%", "54%", "47%", "61%", "86%"] as const;
const HERO_POSTER = "/images/hero-cinematic.jpg";
const HERO_VIDEO = "/videos/ihaleal-tanitim.mp4";

export default function PremiumCinematicHome() {
  const { t } = useLocale();
  const home = t.home;
  const reduced = useReducedMotion();
  const heroVisualRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroVisualRef,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -80]);

  const stats = useMemo(
    () =>
      home.stats.map((stat, i) => ({
        ...stat,
        Icon: STAT_ICONS[i] ?? BarChart3,
      })),
    [home.stats],
  );

  const steps = useMemo(
    () =>
      home.how.steps.map((step, i) => ({
        no: STEP_NOS[i] ?? String(i + 1).padStart(2, "0"),
        title: step.title,
        text: step.desc,
        Icon: STEP_ICONS[i] ?? Search,
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

  const investorItems = useMemo(
    () =>
      home.investor.items.map((item, i) => ({
        ...item,
        Icon: [Shield, BarChart3, Gavel, MapPin][i] ?? Shield,
      })),
    [home.investor.items],
  );

  const heroStyle = {
    "--villa-image": `url('${HERO_POSTER}')`,
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

      <section className="premium-search-strip" aria-label={home.search.aria}>
        <label className="premium-search premium-search--strip">
          <Search className="premium-search__icon" aria-hidden />
          <input type="search" placeholder={home.search.placeholder} />
        </label>
      </section>

      <LiveEarthquakeTicker />

      <section className="premium-hero" aria-labelledby="premium-hero-title">
        <motion.div
          className="premium-hero__copy"
          variants={reduced ? undefined : staggerContainer}
          initial={reduced ? false : "hidden"}
          animate={reduced ? undefined : "show"}
        >
          <motion.div className="premium-kicker" variants={reduced ? undefined : staggerItem}>
            <span aria-hidden="true">{"\u2726"}</span>
            {home.hero.badge}
            <i aria-hidden="true" />
          </motion.div>
          <motion.h1 id="premium-hero-title" variants={reduced ? undefined : staggerItem}>
            <span>{home.hero.titleLead}</span> {home.hero.titleAccent}
          </motion.h1>
          <motion.p className="premium-hero__lead" variants={reduced ? undefined : staggerItem}>
            {home.hero.subtitle}
          </motion.p>
          <motion.div className="premium-hero__ctas" variants={reduced ? undefined : staggerItem}>
            <a className="premium-btn premium-btn--primary" href="/ilanlar">
              {home.hero.ctaExplore} <span aria-hidden="true">{"\u2192"}</span>
            </a>
            <a className="premium-btn premium-btn--glass" href="#how-it-works">
              <span className="premium-play" aria-hidden="true">
                {"\u25B6"}
              </span>
              {home.hero.ctaHow}
            </a>
          </motion.div>
        </motion.div>

        <div
          ref={heroVisualRef}
          className="premium-hero__visual premium-hero__visual--cinematic"
          style={heroStyle}
          aria-label={home.aria.heroVisual}
        >
          <div className="premium-data-rain" aria-hidden="true" />
          <motion.div
            className="premium-hero__media"
            style={reduced ? undefined : { y: parallaxY }}
          >
            <video
              className="premium-hero__video"
              src={HERO_VIDEO}
              poster={HERO_POSTER}
              autoPlay
              muted
              loop
              playsInline
            />
          </motion.div>
          <article className="premium-live-card" aria-label={home.live.title}>
            <div className="premium-live-card__top">
              <span>{home.live.title}</span>
              <b>â— {home.live.live}</b>
            </div>
            <strong>284</strong>
            <p>
              <span>+18%</span> {home.live.growth}
            </p>
            <div className="premium-chart" aria-hidden="true">
              {CHART_HEIGHTS.map((height) => (
                <i key={height} style={{ height }} />
              ))}
            </div>
            <a href="/ilanlar">{home.live.view} →</a>
          </article>
        </div>

        <aside className="premium-stat-rail" aria-label={home.aria.statRail}>
          {stats.map((stat) => (
            <motion.article
              key={stat.label}
              className="premium-stat-card"
              {...statViewProps}
            >
              <span className="premium-stat-card__icon" aria-hidden="true">
                <stat.Icon className="h-5 w-5" />
              </span>
              <div>
                <p>{stat.label}</p>
                <strong>{stat.value}</strong>
              </div>
              <b>{stat.delta}</b>
            </motion.article>
          ))}
        </aside>
      </section>

      <section className="premium-categories" aria-labelledby="premium-categories-title">
        <h2 id="premium-categories-title">{home.categories.heading}</h2>
        <div className="premium-categories__track premium-categories__track--h8">
          {categoryCards.map((cat) => {
            const Icon = cat.icon;
            const labels: Record<string, string> = {
              konut: "Konut",
              ticari: "Ticari",
              endustri: "Endüstri",
              konaklama: "Konaklama",
              arsa: "Arsa",
              komple: "Komple",
              altyapi: "Altyapı",
              devren: "Devren",
            };
            return (
              <Link
                key={cat.key}
                to={`/ilanlar/${cat.key}`}
                className="premium-category-card premium-category-card--rich"
                style={{ backgroundImage: cat.gradient }}
              >
                <span className="premium-category-card__icon" aria-hidden>
                  <Icon className="h-6 w-6" />
                </span>
                <strong>{labels[cat.key] ?? cat.key}</strong>
                <span className="premium-category-card__count">{cat.count} ilan</span>
              </Link>
            );
          })}
        </div>
      </section>

      <DepremTransparencyBand />

      <PlatformModulesShowcase embedded />

      <section className="premium-lower" aria-label={home.aria.lower}>
        <div className="premium-main-column">
          <section
            className="premium-process"
            id="how-it-works"
            aria-labelledby="premium-process-title"
          >
            <h2 id="premium-process-title">{home.how.title}</h2>
            <p>{home.how.subtitle}</p>
            <div className="premium-steps">
              {steps.map((step) => (
                <article key={step.no} className="premium-step">
                  <div className="premium-step__icon" aria-hidden="true">
                    <step.Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <span>{step.no}</span>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="premium-auctions" aria-labelledby="premium-auctions-title">
            <div className="premium-section-head">
              <h2 id="premium-auctions-title">{home.featured.heading}</h2>
              <a href="/ilanlar">{home.featured.viewAll}</a>
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
                    <span className="premium-auction-card__live"><i /> LIVE</span>
                    <button type="button" className="premium-auction-card__fav" aria-label="Favori" onClick={(e) => e.preventDefault()}>
                      <Heart className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="premium-auction-card__body">
                    <h3>{getPropertyTitle(p)}</h3>
                    <p><MapPin className="h-3.5 w-3.5" aria-hidden /> {getPropertyLocation(p)}</p>
                    <div className="premium-auction-card__bid">
                      <div>
                        <small>Cari Teklif</small>
                        <strong>{p.currentBidTry != null ? formatTry(p.currentBidTry) : "—"}</strong>
                      </div>
                      <b>+4%</b>
                    </div>
                    <div className="premium-auction-card__meta">
                      <span>Canlı ihale</span>
                      <span>{p.bidCount ?? 0} bid</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <aside className="premium-investor-panel" aria-labelledby="premium-trust-title">
          <h2 id="premium-trust-title">{home.investor.heading}</h2>
          <div className="premium-investor-panel__list">
            {investorItems.map((item) => (
              <article key={item.title}>
                <span aria-hidden="true"><item.Icon className="h-5 w-5" /></span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="premium-compliance">
            {home.how.certs.map((cert) => (
              <div key={cert.title}>
                <strong>{cert.title}</strong>
                <span>{cert.sub}</span>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="premium-testimonials" aria-labelledby="premium-testimonials-title">
        <h2 id="premium-testimonials-title">{home.testimonials.heading}</h2>
        <div className="premium-testimonials__grid">
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

      <section className="premium-cta-band" aria-labelledby="premium-cta-title">
        <h2 id="premium-cta-title">{home.cta.title}</h2>
        <p>{home.cta.subtitle}</p>
        <div className="premium-cta-band__actions">
          <a className="premium-btn premium-btn--primary" href="/kayit">
            {home.cta.primary}
          </a>
          <a className="premium-btn premium-btn--glass" href="/iletisim">
            {home.cta.secondary}
          </a>
        </div>
      </section>
    </div>
  );
}
