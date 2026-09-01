import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Play,
  Shield,
  Users,
  Star,
  Headphones,
  TrendingUp,
  Gavel,
  BarChart3,
} from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { cinematicEase, staggerContainer, staggerItem } from "@/lib/motion/presets";

const STAT_VALUES = [
  { value: "12,458", delta: "+12.5%", icon: Gavel },
  { value: "3,127", delta: "+8.3%", icon: TrendingUp },
  { value: "10,843", delta: "+15.2%", icon: Users },
  { value: "98%", delta: "+2.1%", icon: Star },
] as const;

const TRUST_ICONS = [Shield, Users, Star, Headphones] as const;

export function Hero() {
  const { t } = useLocale();
  const h = t.home;

  return (
    <section id="hero" className="ref-hero hero-cinematic page-background-premium relative min-h-[min(100vh,920px)] overflow-hidden">
      <div className="intelligence-grid-overlay" aria-hidden />
      <motion.div
        className="ref-hero-bg"
        aria-hidden
        initial={{ scale: 1.04 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div className="ref-hero-overlay" aria-hidden />

      <motion.div
        className="relative z-10 mx-auto max-w-[1500px] px-4 pb-16 pt-28 sm:px-6 lg:px-8"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div
          className="ref-hero-grid grid items-center gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(340px,1.15fr)_240px] xl:gap-8"
          variants={staggerContainer}
        >
          <motion.div className="min-w-0" variants={staggerItem}>
            <p className="ref-hero-eyebrow mb-4 inline-flex items-center gap-2">
              <span className="ref-hero-eyebrow-dot" aria-hidden />
              {h.hero.badge}
            </p>
            <h1 className="ref-hero-title max-w-2xl">
              {h.hero.titleLead}
              <span className="ref-hero-title-gradient blue-gradient-text"> {h.hero.titleAccent}</span>
            </h1>
            <p className="ref-hero-subtitle mt-6 max-w-xl">{h.hero.subtitle}</p>

            <motion.div className="mt-10 flex flex-wrap items-center gap-4">
              <Link to="/ihaleler" className="ref-btn-primary premium-primary-button">
                {h.hero.ctaExplore}
                <ArrowRight className="rtl:rotate-180 h-4 w-4" aria-hidden />
              </Link>
              <Link to={ROUTES.NASIL_CALISIR} className="ref-btn-secondary premium-secondary-button">
                <Play className="h-4 w-4 fill-current opacity-90" aria-hidden />
                {h.hero.ctaHow}
              </Link>
            </motion.div>

            <motion.ul className="ref-trust-row mt-12">
              {h.trust.map((item, i) => {
                const Icon = TRUST_ICONS[i] ?? Shield;
                return (
                  <li key={item.title} className="ref-trust-item">
                    <Icon className="h-4 w-4 shrink-0 text-[var(--metin-ikincil)]" aria-hidden />
                    <span>
                      <strong className="font-normal text-slate-200">{item.title}</strong>
                      {item.sub ? <span className="text-slate-400"> — {item.sub}</span> : null}
                    </span>
                  </li>
                );
              })}
            </motion.ul>

            <motion.div
              className="ref-live-chart-card glass-panel mt-10 xl:hidden"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, ...cinematicEase }}
            >
              <LiveChartCard live={h.live} />
            </motion.div>
          </motion.div>

          <motion.div className="relative hidden min-h-[380px] xl:block" variants={staggerItem}>
            <motion.div
              className="ref-hero-villa-wrap"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, ...cinematicEase }}
            >
              <img
                src="/images/hero-cinematic.jpg"
                alt=""
                className="ref-hero-villa-img"
                width={720}
                height={540}
                loading="eager"
                decoding="async"
              />
              <motion.div className="ref-hero-villa-shade" aria-hidden />
              <motion.div
                className="ref-live-chart-float glass-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, ...cinematicEase }}
              >
                <LiveChartCard live={h.live} />
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div className="hidden flex-col gap-3 xl:flex" variants={staggerContainer}>
            {h.stats.map((stat, i) => {
              const meta = STAT_VALUES[i];
              const Icon = meta?.icon ?? BarChart3;
              return (
                <motion.div key={stat.label} className="ref-side-stat-card stat-card" variants={staggerItem}>
                  <Icon className="h-4 w-4 shrink-0 text-[var(--metin-ikincil)]" aria-hidden />
                  <motion.div className="min-w-0 flex-1">
                    <p className="text-[10px] font-normal uppercase tracking-wider text-slate-500">{stat.label}</p>
                    <p className="text-lg font-normal text-white">{meta?.value ?? "—"}</p>
                  </motion.div>
                  <span className="text-xs font-normal text-[var(--metin-ikincil)]">{meta?.delta ?? ""}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:hidden"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {h.stats.map((stat, i) => {
            const meta = STAT_VALUES[i];
            const Icon = meta?.icon ?? BarChart3;
            return (
              <motion.div key={stat.label} className="ref-side-stat-card stat-card" variants={staggerItem}>
                <Icon className="h-4 w-4 text-[var(--metin-ikincil)]" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-normal uppercase tracking-wider text-slate-500">{stat.label}</p>
                  <p className="text-base font-normal text-white">{meta?.value ?? "—"}</p>
                </div>
                <span className="text-xs font-normal text-[var(--metin-ikincil)]">{meta?.delta ?? ""}</span>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}

function LiveChartCard({ live }: { live: { title: string; live: string; growth: string } }) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-normal text-slate-400">{live.title}</p>
          <p className="mt-1 text-3xl font-normal text-white">284</p>
          <p className="text-xs font-normal text-[var(--metin-ikincil)]">{live.growth}</p>
        </div>
        <span className="ref-live-dot-pill">{live.live}</span>
      </div>
      <div className="ref-mini-chart mt-4 flex h-16 items-end gap-1">
        {[35, 55, 42, 70, 48, 82, 60, 75].map((height, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-[3px] bg-gradient-to-t from-[var(--zemin-yumusak)] to-[var(--zemin-yumusak)]"
            initial={{ height: 0 }}
            animate={{ height: `${height}%` }}
            transition={{ delay: 0.5 + i * 0.05, ...cinematicEase }}
          />
        ))}
      </div>
    </>
  );
}
