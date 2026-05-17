import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Building2, Play, Shield, Sparkles, TrendingUp } from "lucide-react";
import { cinematicEase, staggerContainer, staggerItem } from "@/lib/motion/presets";

const TRUST_ITEMS = [
  { icon: TrendingUp, label: "Yatırımcılar tarafından güvenilir" },
  { icon: Shield, label: "Banka düzeyi altyapı" },
  { icon: Sparkles, label: "AI destekli değerleme motoru" },
  { icon: Building2, label: "Güvenli dijital ihale platformu" },
] as const;

const SIDE_METRICS = [
  { label: "Canlı ihale", value: "284", delta: "+12.5%" },
  { label: "Başarılı satış", value: "3.420", delta: "+8.2%" },
  { label: "Aktif yatırımcı", value: "12.8K", delta: "+18%" },
  { label: "Memnuniyet", value: "4.9/5", delta: "Kurumsal" },
] as const;

export function Hero() {
  return (
    <section id="hero" className="hero-cinematic relative flex min-h-[min(94vh,960px)] items-center overflow-hidden pt-24 pb-20 sm:pt-28">
      <motion.div className="hero-architecture-bg" aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 0.45 }} transition={{ duration: 1.2 }} />
      <motion.div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]" variants={staggerContainer} initial="hidden" animate="show">
          <motion.div variants={staggerItem}>
            <p className="hero-slogan mb-6">Kurumsal gayrimenkul teknolojisi</p>
            <h1 className="hero-headline text-balance max-w-3xl">
              Yüksek değerli
              <span className="block hero-headline-accent">gayrimenkul işlemleri</span>
              için akıllı platform
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-slate-300 sm:text-lg">
              İhaleal; şeffaf ihale, AI fiyatlama ve kurumsal güven katmanını tek deneyimde birleştirir.
              Ciddi yatırımcılar ve kurumlar için tasarlandı.
            </p>
            <motion.div className="mt-10 flex flex-wrap items-center gap-4">
              <Link to="/ilanlar" className="btn-primary min-h-[52px] min-w-[200px] text-base">
                İlanları Keşfet
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link to="/nasil-calisir" className="btn-secondary min-h-[52px] gap-2">
                <Play className="h-4 w-4 fill-current opacity-80" aria-hidden />
                Nasıl Çalışır
              </Link>
            </motion.div>
            <motion.div className="mt-12 flex flex-wrap gap-3">
              {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                <span key={label} className="trust-pill">
                  <Icon className="h-3.5 w-3.5 text-blue-400 shrink-0" aria-hidden />
                  {label}
                </span>
              ))}
            </motion.div>
          </motion.div>

          <motion.div className="relative hidden lg:block" variants={staggerItem}>
            <motion.div className="glass-panel relative overflow-hidden rounded-2xl p-6 shadow-lux-lg">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-300">Canlı piyasa</p>
                  <p className="mt-1 text-2xl font-bold text-white">AI analitik önizleme</p>
                </div>
                <span className="live-badge">Live</span>
              </div>
              <motion.div className="mt-6 flex h-28 items-end gap-1.5" initial="hidden" animate="show">
                {[38, 62, 48, 78, 55, 88, 72, 65].map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-sm bg-gradient-to-t from-blue-600 to-blue-400"
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.4 + i * 0.05, ...cinematicEase }}
                  />
                ))}
              </motion.div>
              <p className="mt-4 text-xs text-slate-400">Portföy değerleme · güven aralığı · bölge karşılaştırma</p>
            </motion.div>
            <motion.div className="hero-side-stack absolute -right-2 top-8 w-52 xl:-right-6" variants={staggerContainer} initial="hidden" animate="show">
              {SIDE_METRICS.map((m) => (
                <motion.div key={m.label} className="hero-floating-metric" variants={staggerItem}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{m.label}</p>
                  <p className="mt-1 text-lg font-bold text-white">{m.value}</p>
                  <p className="text-xs font-medium text-emerald-400">{m.delta}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-16 grid gap-4 border-t border-white/10 pt-10 sm:grid-cols-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, ...cinematicEase }}
        >
          {[
            { value: "2.4B+", label: "İşlem hacmi hedefi" },
            { value: "12K+", label: "Doğrulanmış analiz" },
            { value: "99.9%", label: "Platform erişilebilirliği" },
          ].map((m) => (
            <div key={m.label} className="metric-float text-center sm:text-left">
              <p className="text-2xl font-bold text-white">{m.value}</p>
              <p className="mt-1 text-sm text-slate-400">{m.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}