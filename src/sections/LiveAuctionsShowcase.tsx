import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import {
  Clock,
  MapPin,
  ArrowRight,
  Shield,
  Sparkles,
  Eye,
  Globe2,
  Headphones,
  ChevronRight,
  Heart,
} from "lucide-react";
import { motion } from "framer-motion";
import { useLocale } from "@/contexts/LocaleContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const CARD_IMAGES = [
  "/images/auction-1.jpg",
  "/images/auction-2.jpg",
  "/images/auction-3.jpg",
  "/images/auction-4.jpg",
] as const;

const SIDEBAR_ICONS = [Shield, Sparkles, Eye, Globe2, Headphones] as const;
const SIDEBAR_COLORS = [
  { color: "text-blue-400", bg: "bg-blue-500/15" },
  { color: "text-sky-400", bg: "bg-sky-500/15" },
  { color: "text-emerald-400", bg: "bg-emerald-500/15" },
  { color: "text-cyan-400", bg: "bg-cyan-500/15" },
  { color: "text-violet-400", bg: "bg-violet-500/15" },
] as const;

export function LiveAuctionsShowcase() {
  const { t } = useLocale();
  const auctions = t.home.auctions;
  const how = t.home.how;
  const { ref, isVisible } = useScrollAnimation(0.08);

  return (
    <section id="auctions" className="ref-section section-shell py-20 lg:py-28">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`grid gap-10 transition-all duration-700 xl:grid-cols-[1fr_320px] xl:gap-8 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <h2 className="ref-section-title">{auctions.title}</h2>
              <Link to={ROUTES.AUCTIONS} className="ref-link-arrow">
                {auctions.viewAll}
                <ArrowRight className="rtl:rotate-180 h-4 w-4" aria-hidden />
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {auctions.items.map((item, idx) => (
                <motion.article
                  key={item.title}
                  className="ref-property-card auction-card-premium group"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.25 }}
                  style={{ transitionDelay: `${idx * 80}ms` }}
                >
                  <div className="ref-property-image-wrap">
                    <img
                      src={CARD_IMAGES[idx] ?? CARD_IMAGES[0]}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                      width={640}
                      height={360}
                    />
                    <div className="ref-property-image-overlay" />
                    <span className="ref-live-pill">{auctions.live}</span>
                    <button
                      type="button"
                      className="absolute end-3 top-3 rounded-full border border-white/20 bg-black/40 p-2 text-white/90 backdrop-blur-sm transition hover:bg-black/60"
                      aria-label="Favorite"
                    >
                      <Heart className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-1 text-base font-normal text-white">{item.title}</h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-slate-400">
                      <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      {item.location}
                    </p>
                    <motion.div className="mt-3 flex items-end justify-between gap-2">
                      <div>
                        <p className="text-xs font-normal uppercase tracking-wide text-slate-500">
                          {auctions.currentBid}
                        </p>
                        <p className="text-xl font-normal text-white">{item.price}</p>
                      </div>
                      <span className="ref-pct-badge">{item.change}</span>
                    </motion.div>
                    <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" aria-hidden />
                        {item.time}
                      </span>
                      <span>{item.bids}</span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>

          <aside className="ref-trust-sidebar glass-panel">
            <h3 className="ref-sidebar-title">{how.sidebarTitle}</h3>
            <ul className="mt-6 space-y-1">
              {how.sidebar.map((row, i) => {
                const Icon = SIDEBAR_ICONS[i] ?? Shield;
                const palette = SIDEBAR_COLORS[i] ?? SIDEBAR_COLORS[0];
                return (
                  <li key={row.title}>
                    <Link
                      to={ROUTES.NASIL_CALISIR}
                      className="ref-trust-feature group flex items-center gap-3 rounded-[10px] px-2 py-3 no-underline transition hover:bg-white/5"
                    >
                      <div className={`ref-trust-feature-icon ${palette.bg}`}>
                        <Icon className={`h-5 w-5 ${palette.color}`} aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-normal text-white">{row.title}</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-slate-400">{row.sub}</p>
                      </div>
                      <ChevronRight
                        className="h-4 w-4 shrink-0 text-slate-500 transition group-hover:text-blue-400"
                        aria-hidden
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="ref-compliance-row mt-8 flex flex-wrap gap-3">
              {how.certs.map((cert) => (
                <div key={cert.title} className="trust-badge">
                  {cert.flag ? (
                    <span className="mb-1 text-[10px] font-normal text-blue-400">{cert.flag}</span>
                  ) : null}
                  <span className="text-xs font-normal text-white">{cert.title}</span>
                  <span className="mt-0.5 text-[10px] text-slate-400">{cert.sub}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
