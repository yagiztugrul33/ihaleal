import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Calculator, Radar, Sun } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { INTELLIGENCE_HUB_PATH } from "@/lib/intelligenceHub";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { staggerContainer, staggerItem } from "@/lib/motion/presets";
import { cn } from "@/lib/utils";

const MODULES = [
  {
    n: "01",
    title: "GES & Arazi Analizi",
    desc: "PVGIS solar fizibilite, NPV/IRR/LCOE ve parsel intelligence ile arazi yatırım kararı.",
    href: ROUTES.ARASTIRMA_GES,
    cta: "GES analiz",
    icon: Sun,
    tone: "emerald",
    tags: ["Solar Fizibilite", "NPV/IRR", "Parsel"],
  },
  {
    n: "02",
    title: "AI Değerleme",
    desc: "Piyasa karşılaştırması, güven aralıklı fiyat tahmini ve mahalle bazlı trend analizi.",
    href: "/degerleme",
    cta: "Değerleme yap",
    icon: Calculator,
    tone: "amber",
    tags: ["Piyasa Comp", "Güven Aralığı", "Trend"],
  },
  {
    n: "03",
    title: "Araştırma Intelligence",
    desc: "War Room, parsel istihbaratı, iBuyer ve kurumsal yatırım terminali tek çatıda.",
    href: INTELLIGENCE_HUB_PATH,
    cta: "Araştırma modülü",
    icon: Radar,
    tone: "violet",
    tags: ["War Room", "Parsel", "iBuyer"],
  },
] as const;

const TONE: Record<string, { card: string; icon: string; badge: string; tag: string; cta: string }> = {
  emerald: {
    card: "from-emerald-500/10 to-slate-900/60 border-emerald-500/25",
    icon: "bg-gradient-to-br from-emerald-500 to-emerald-800 shadow-emerald-500/30",
    badge: "text-emerald-400",
    tag: "bg-emerald-500/10 border-emerald-500/25 text-emerald-200",
    cta: "text-emerald-400",
  },
  amber: {
    card: "from-amber-500/10 to-slate-900/60 border-amber-500/25",
    icon: "bg-gradient-to-br from-amber-500 to-amber-800 shadow-amber-500/30",
    badge: "text-amber-400",
    tag: "bg-amber-500/10 border-amber-500/25 text-amber-200",
    cta: "text-amber-400",
  },
  violet: {
    card: "from-violet-500/10 to-slate-900/60 border-violet-500/25",
    icon: "bg-gradient-to-br from-violet-500 to-violet-800 shadow-violet-500/30",
    badge: "text-violet-400",
    tag: "bg-violet-500/10 border-violet-500/25 text-violet-200",
    cta: "text-violet-400",
  },
};

export function PlatformModulesShowcase({ embedded = false }: { embedded?: boolean }) {
  const { ref, isVisible } = useScrollAnimation(0.08);

  return (
    <section
      id="platform-modules"
      className={cn("ref-section", embedded ? "py-0" : "py-14 lg:py-20")}
    >
      <motion.div
        ref={ref}
        className={cn(
          "transition-all duration-700",
          embedded ? "max-w-none px-0" : "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        )}
      >
        {!embedded ? (
          <motion.div
            className="mb-10 text-center"
            variants={staggerItem}
            initial="hidden"
            animate={isVisible ? "show" : "hidden"}
          >
            <p className="ref-modules-eyebrow">Platform Modülleri</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Tek platform,{" "}
              <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                3 intelligence modülü
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-400">
              İhale tek başına değil: GES arazi, AI değerleme ve kurumsal araştırma suite — emlak, GYO ve
              yatırımcı için.
            </p>
          </motion.div>
        ) : null}

        <motion.div
          className={cn("grid gap-5 md:grid-cols-3", embedded && "gap-3")}
          variants={staggerContainer}
          initial="hidden"
          animate={isVisible ? "show" : "hidden"}
        >
          {MODULES.map((m) => {
            const Icon = m.icon;
            const t = TONE[m.tone];
            return (
              <motion.div key={m.n} variants={staggerItem}>
                <Link to={m.href} className="ref-module-card group block h-full">
                  <motion.article
                    className={cn(
                      "flex h-full flex-col rounded-2xl border bg-gradient-to-br",
                      embedded ? "p-4" : "p-6",
                      t.card,
                    )}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      className={cn(
                        "flex items-center justify-center rounded-2xl text-white shadow-lg",
                        embedded ? "mb-3 h-11 w-11" : "mb-5 h-14 w-14",
                        t.icon,
                      )}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Icon className="h-7 w-7" aria-hidden />
                    </motion.div>
                    <p className={`text-xs font-bold uppercase tracking-widest ${t.badge}`}>Modül {m.n}</p>
                    <h3 className="mt-2 text-xl font-bold text-white">{m.title}</h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-400">{m.desc}</p>
                    <motion.div className="mt-4 flex flex-wrap gap-2" layout>
                      {m.tags.map((tag) => (
                        <span key={tag} className={`rounded-md border px-2 py-0.5 text-[0.7rem] font-medium ${t.tag}`}>
                          {tag}
                        </span>
                      ))}
                    </motion.div>
                    <p className={`mt-5 inline-flex items-center gap-1 text-sm font-semibold ${t.cta}`}>
                      {m.cta}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </p>
                  </motion.article>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}
