import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Calculator, Radar, Sun, ShieldCheck, Map, Activity, HeartHandshake } from "lucide-react";
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
    title: "Araştırma Zekâsı",
    desc: "Karar odası, parsel istihbaratı, anlık alım senaryoları ve kurumsal yatırım terminali tek çatıda.",
    href: INTELLIGENCE_HUB_PATH,
    cta: "Araştırma modülü",
    icon: Radar,
    tone: "violet",
    tags: ["Karar Odası", "Parsel", "Anlık Alım"],
  },
] as const;

const DEPREM_MODULES = [
  {
    n: "D1",
    title: "Bina Risk Sorgusu",
    desc: "Beş adımlı sihirbaz ile 12 eksen üzerinden özet skor; paylaşım metni ve yazdırılabilir rapor.",
    href: "/modul/bina-risk-sorgu",
    cta: "Sorguyu aç",
    icon: ShieldCheck,
    tone: "rose",
    tags: ["Skor", "PDF", "Paylaşım"],
  },
  {
    n: "D2",
    title: "Deprem Risk Haritası",
    desc: "Lazy Leaflet katmanları: fay, deprem, zemin özeti, ilan seçkisi, toplanma ve hastane mock noktaları.",
    href: "/modul/deprem-risk-haritasi",
    cta: "Haritayı aç",
    icon: Map,
    tone: "sky",
    tags: ["GIS", "Katman", "İlan linki"],
  },
  {
    n: "D3",
    title: "Canlı Deprem Takibi",
    desc: "Mock Kandilli akışı; 24s / 7g / 30g pencereleri, büyüklük kaydırıcısı ve 1939–2023 kronolojisi.",
    href: "/modul/canli-deprem-takip",
    cta: "Akışa git",
    icon: Activity,
    tone: "orange",
    tags: ["Ticker", "Filtre", "Tarih"],
  },
  {
    n: "D4",
    title: "Aile Acil Planı",
    desc: "Altı adımda toplanma, evrak ve tesisat sırası; WhatsApp paylaşımı ve yazdırılabilir özet.",
    href: "/modul/aile-acil-plan",
    cta: "Planı oluştur",
    icon: HeartHandshake,
    tone: "cyan",
    tags: ["Checklist", "WA", "Yazdır"],
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
  rose: {
    card: "from-rose-500/10 to-slate-900/60 border-rose-500/25",
    icon: "bg-gradient-to-br from-rose-500 to-rose-800 shadow-rose-500/30",
    badge: "text-rose-400",
    tag: "bg-rose-500/10 border-rose-500/25 text-rose-100",
    cta: "text-rose-400",
  },
  sky: {
    card: "from-sky-500/10 to-slate-900/60 border-sky-500/25",
    icon: "bg-gradient-to-br from-sky-500 to-sky-800 shadow-sky-500/30",
    badge: "text-sky-400",
    tag: "bg-sky-500/10 border-sky-500/25 text-sky-100",
    cta: "text-sky-400",
  },
  orange: {
    card: "from-orange-500/10 to-slate-900/60 border-orange-500/25",
    icon: "bg-gradient-to-br from-orange-500 to-orange-800 shadow-orange-500/30",
    badge: "text-orange-400",
    tag: "bg-orange-500/10 border-orange-500/25 text-orange-100",
    cta: "text-orange-400",
  },
  cyan: {
    card: "from-cyan-500/10 to-slate-900/60 border-cyan-500/25",
    icon: "bg-gradient-to-br from-cyan-500 to-cyan-800 shadow-cyan-500/30",
    badge: "text-cyan-400",
    tag: "bg-cyan-500/10 border-cyan-500/25 text-cyan-100",
    cta: "text-cyan-400",
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
          "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
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
            <h2 className="mt-3 break-words text-2xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
              Tek platform,{" "}
              <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                zekâ ve deprem araçları
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-400">
              GES arazi, AI değerleme ve kurumsal araştırma paketi yanında; bina riski, harita, canlı takip ve aile acil
              planı ile deprem şeffaflığını artırıyoruz.
            </p>
          </motion.div>
        ) : null}

        {embedded ? (
          <motion.div
            className="mb-8 text-center"
            variants={staggerItem}
            initial="hidden"
            animate={isVisible ? "show" : "hidden"}
          >
            <p className="ref-modules-eyebrow">Platform modülleri</p>
            <h2 className="mt-2 break-words text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
              Zekâ Paketi ve Canlıya Hazırlık
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400">
              Aynı ekranda GES, değerleme ve araştırma modülleri; alt bantta deprem araçları.
            </p>
          </motion.div>
        ) : null}

        <motion.div
          className={cn("mb-8 grid gap-5 md:grid-cols-3", embedded && "mb-6")}
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

        <motion.div
          className={cn(
            "mb-6 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5 md:p-6",
            embedded ? "mx-0" : "",
          )}
          variants={staggerItem}
          initial="hidden"
          animate={isVisible ? "show" : "hidden"}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-700 text-white shadow-lg shadow-amber-500/25">
              <ShieldCheck className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-300">Neden biz — deprem şeffaflığı</p>
              <h3 className="mt-2 text-xl font-bold text-white">Alıcı ve satıcıyı aynı risk dilinde buluşturuyoruz</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Tapu veya resmi zemin belgesi yerine geçmeyiz; fakat satın alma öncesi hızlı tarama, harita bağlamı ve
                hane planı ile karar kalitesini yükseltiriz. Deprem skoru yüksek ilanlar için doğrudan liste bağlantısı
                sunarız; güçlendirme rehberi ve maliyet bandı hesaplayıcısı ile sonraki adımı görünür kılarız.
              </p>
              <Link
                to="/modul/guclendirme-rehberi"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-amber-300 hover:text-amber-200"
              >
                Güçlendirme rehberine geç
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="mb-3"
          variants={staggerItem}
          initial="hidden"
          animate={isVisible ? "show" : "hidden"}
        >
          <p className="ref-modules-eyebrow">Deprem hazırlığı modülleri</p>
          <h3 className="mt-2 text-2xl font-bold text-white">Dört pratik araç</h3>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Risk haritasından canlı akışa; bina özetinden aile planına — hepsi ModuleShell deneyimi ve Türkçe içerikle.
          </p>
        </motion.div>

        <motion.div
          className={cn("grid gap-5 md:grid-cols-2 lg:grid-cols-4", embedded && "gap-3")}
          variants={staggerContainer}
          initial="hidden"
          animate={isVisible ? "show" : "hidden"}
        >
          {DEPREM_MODULES.map((m) => {
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
                    <p className={`text-xs font-bold uppercase tracking-widest ${t.badge}`}>{m.n}</p>
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
