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
} from "lucide-react";
import { cinematicEase, staggerContainer, staggerItem } from "@/lib/motion/presets";

const TRUST = [
  { icon: Shield, label: "Banka düzeyi güvenlik" },
  { icon: Users, label: "10.000+ aktif yatırımcı" },
  { icon: Star, label: "4,9/5 müşteri puanı" },
  { icon: Headphones, label: "7/24 destek" },
] as const;

const SIDE_STATS = [
  { icon: Gavel, label: "Toplam ihale", value: "12.847", delta: "+12.5%" },
  { icon: TrendingUp, label: "Başarılı satış", value: "3.420", delta: "+8.2%" },
  { icon: Users, label: "Aktif yatırımcı", value: "10.284", delta: "+18%" },
  { icon: Star, label: "Memnuniyet oranı", value: "98%", delta: "+2.1%" },
] as const;

export function Hero() {
  return (
    <section id="hero" className="ref-hero relative min-h-[100vh] overflow-hidden">
      <motion.div
        className="ref-hero-bg"
        aria-hidden
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div className="ref-hero-overlay" aria-hidden />

      <motion.div className="relative z-10 mx-auto flex min-h-[100vh] max-w-7xl flex-col justify-center px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <motion.div
          className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={staggerItem}>
            <p className="ref-hero-eyebrow mb-4 inline-flex items-center gap-2">
              <span className="ref-hero-eyebrow-dot" aria-hidden />
              Şeffaf. Güvenli. Akıllı.
            </p>
            <h1 className="ref-hero-title max-w-2xl">
              Gayrimenkulün
              <span className="ref-hero-title-gradient"> geleceği </span>
              İhaleal&apos;de.
            </h1>
            <p className="ref-hero-subtitle mt-6 max-w-xl">
              Türkiye&apos;nin AI destekli gayrimenkul pazaryeri. Şeffaf ilan, kapalı teklif ve açık ihale — tek
              platformda, güvenli ve denetlenebilir.
            </p>

            <motion.div className="mt-10 flex flex-wrap items-center gap-4">
              <Link to={ROUTES.AUCTIONS} className="ref-btn-primary">
                İhaleleri Keşfet
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link to={ROUTES.HOW_IT_WORKS} className="ref-btn-secondary">
                <Play className="h-4 w-4 fill-current opacity-90" aria-hidden />
                Nasıl Çalışır
              </Link>
            </motion.div>

            <motion.ul className="ref-trust-row mt-12">
              {TRUST.map(({ icon: Icon, label }) => (
                <li key={label} className="ref-trust-item">
                  <Icon className="h-4 w-4 shrink-0 text-blue-400" aria-hidden />
                  <span>{label}</span>
                </li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div className="relative hidden lg:block" variants={staggerItem}>
            <motion.div
              className="ref-live-chart-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, ...cinematicEase }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-400">Canlı ihaleler</p>
                  <p className="mt-1 text-3xl font-bold text-white">284</p>
                  <p className="text-xs font-semibold text-emerald-400">+18% geçen aydan</p>
                </div>
                <span className="ref-live-dot-pill">CANLI</span>
              </div>
              <div className="ref-mini-chart mt-4 flex h-16 items-end gap-1">
                {[35, 55, 42, 70, 48, 82, 60, 75].map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-sm bg-gradient-to-t from-blue-600 to-sky-400"
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.5 + i * 0.05, ...cinematicEase }}
                  />
                ))}
              </div>
            </motion.div>

            <motion.div
              className="ref-side-stats absolute -right-4 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-3 xl:-right-8"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {SIDE_STATS.map((s) => (
                <motion.div key={s.label} className="ref-side-stat-card" variants={staggerItem}>
                  <s.icon className="h-4 w-4 text-blue-400" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                      {s.label}
                    </p>
                    <p className="text-lg font-bold text-white">{s.value}</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400">{s.delta}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
