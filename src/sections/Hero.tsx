import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Shield, Sparkles, TrendingUp } from "lucide-react";

const TRUST_ITEMS = [
  { icon: TrendingUp, label: "Yatırımcılar tarafından güvenilir" },
  { icon: Shield, label: "Banka düzeyi altyapı" },
  { icon: Sparkles, label: "AI destekli değerleme motoru" },
  { icon: Building2, label: "Güvenli dijital ihale platformu" },
] as const;

const METRICS = [
  { value: "2.4B+", label: "İşlem hacmi hedefi" },
  { value: "12K+", label: "Doğrulanmış analiz" },
  { value: "99.9%", label: "Platform erişilebilirliği" },
] as const;

export function Hero() {
  return (
    <section id="hero" className="hero-cinematic relative flex min-h-[min(92vh,920px)] items-center overflow-hidden pt-24 pb-20 sm:pt-28">
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <p className="hero-slogan mb-6">Kurumsal gayrimenkul teknolojisi</p>
            <h1 className="hero-headline text-balance">
              Yüksek değerli
              <span className="block bg-gradient-to-r from-white via-slate-100 to-blue-300 bg-clip-text text-transparent">gayrimenkul işlemleri</span>
              için akıllı platform
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-slate-300 sm:text-lg">
              İhaleal; şeffaf ihale, AI fiyatlama ve kurumsal güven katmanını tek deneyimde birleştirir.
            </p>
            <motion.div className="mt-10 flex flex-wrap items-center gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <Link to="/ilanlar" className="btn-primary min-h-[48px] min-w-[180px]">İlanları Keşfet</Link>
              <Link to="/kurumsal" className="btn-secondary min-h-[48px]">Kurumsal Çözümler</Link>
            </motion.div>
            <motion.div className="mt-12 flex flex-wrap gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
              {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                <span key={label} className="trust-pill"><Icon className="h-3.5 w-3.5 text-blue-400" aria-hidden />{label}</span>
              ))}
            </motion.div>
          </motion.div>
          <motion.div className="glass-panel relative hidden overflow-hidden rounded-2xl p-6 lg:block" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-300">AI analitik önizleme</p>
            <p className="mt-2 text-2xl font-bold text-white">Portföy değerleme</p>
            <motion.div className="mt-6 flex h-24 items-end gap-1" initial="hidden" animate="show">
              {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                <motion.div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-blue-600 to-blue-400" initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 0.5 + i * 0.06 }} />
              ))}
            </motion.div>
          </motion.div>
        </div>
        <motion.div className="mt-16 grid gap-4 border-t border-white/10 pt-10 sm:grid-cols-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
          {METRICS.map((m) => (
            <div key={m.label} className="metric-float text-center sm:text-left">
              <p className="text-2xl font-bold text-white">{m.value}</p>
              <p className="mt-1 text-sm text-slate-400">{m.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}