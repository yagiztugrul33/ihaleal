import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Map,
  Sun,
  Shield,
  Radar,
  Zap,
  RefreshCw,
  Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  GES_ANALYSIS_PATH,
  PARCEL_INTELLIGENCE_PATH,
  WAR_ROOM_PATH,
} from "@/lib/intelligenceHub";
import { KKA_STUDIO_PATH } from "@/lib/kkaHub";
import { IBUYER_PATH } from "@/lib/ibuyerHub";
import { ROUTES } from "@/constants/routes";

const TICKER_EVENTS = [
  "Remax Boss → Peşinat takaslı işlem doğrulandı",
  "Remax Borsa Global → Çapraz ofis referans %25 komisyon",
  "GES ön fizibilite → Konya Karapınar 12,4 MWp onay bekliyor",
  "Parsel Desk → EMSAL 1,8 / TAKS 0,35 kat karşılığı hesaplandı",
  "iBuyer → Anlık nakit teklif 4.100.000 TRY (48s)",
  "Hukuk heyeti → Miras/intikal dosyası manuel incelemede",
];

const MODULES = [
  {
    title: "Anında Teklif (iBuyer)",
    desc: "400 puanlık anayasa kontrolü, risk primi ve kurumsal nakit teklif motoru.",
    icon: Banknote,
    href: IBUYER_PATH,
    badge: "Remax",
    accent: "from-red-500/20 to-rose-900/10 border-red-500/30",
  },
  {
    title: "Takas (Trade-In)",
    desc: "Mevcut mulkunuzu hedef portfoye takaslayin; capraz ofis komisyon izleme.",
    icon: RefreshCw,
    href: `${IBUYER_PATH}?flow=trade-in`,
    badge: "Takas",
    accent: "from-violet-500/20 to-purple-900/10 border-violet-500/30",
  },
  {
    title: "GES Master Analiz",
    desc: "550Wp panel matrisi, 10 yıllık CAPEX/OPEX/LCOE/IRR — ön fizibilite.",
    icon: Sun,
    href: GES_ANALYSIS_PATH,
    badge: "Mühendislik",
    accent: "from-amber-500/20 to-orange-900/10 border-amber-500/30",
  },
  {
    title: "Ada Parsel İstihbarat",
    desc: "EMSAL/TAKS, kat adedi, muteahhit vs arsa sahibi paylasimi, skor /100.",
    icon: Map,
    href: PARCEL_INTELLIGENCE_PATH,
    badge: "GIS",
    accent: "from-cyan-500/20 to-blue-900/10 border-cyan-500/30",
  },
  {
    title: "Stratejik War Room",
    desc: "Canlı GIS, PVGIS, jeoteknik ve afet katmanı — kurumsal site istihbaratı.",
    icon: Radar,
    href: WAR_ROOM_PATH,
    badge: "Palantir",
    accent: "from-blue-500/20 to-indigo-900/10 border-blue-500/30",
  },
  {
    title: "Kat Karsiligi Studio",
    desc: "EMSAL/TAKS, hak edis ve sozlesme taslagı.",
    icon: Building2,
    href: KKA_STUDIO_PATH,
    badge: "Mevcut",
    accent: "from-emerald-500/20 to-teal-900/10 border-emerald-500/30",
  },
];

function LiveTicker() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % TICKER_EVENTS.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, []);
  return (
    <motion.div
      className="mb-8 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.div className="flex items-center gap-3 px-4 py-3 text-xs sm:text-sm">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/10 px-2.5 py-0.5 font-semibold uppercase tracking-wider text-red-200">
          <Zap className="h-3.5 w-3.5" /> Canlı
        </span>
        <motion.p key={index} className="text-slate-300 truncate font-mono" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {TICKER_EVENTS[index]}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

export default function IntelligenceHub() {
  return (
    <motion.div className="min-h-screen bg-[#030712] text-white pt-24 pb-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-gradient-to-b from-red-950/25 via-blue-950/20 to-transparent" aria-hidden />
      <motion.div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="mb-10 max-w-3xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-red-400/90 mb-3">Remax Borsa Global</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Araştırma ve İstihbarat Terminali</h1>
          <p className="text-slate-200 mt-4 text-lg leading-relaxed">
            iBuyer, takas, GES ve parsel masaları tek çatı altında. Sonuçlar ön fizibilite niteliğindedir; resmi rapor ve lisanslı onay gerektirir.
          </p>
          <motion.div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">400 puan hukuk skoru</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">Çapraz ofis komisyon</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">Formül izlenebilirliği</span>
          </motion.div>
        </motion.div>

        <LiveTicker />

        <motion.div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {MODULES.map((m, i) => (
            <motion.div
              key={m.href}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`group flex flex-col rounded-2xl border bg-gradient-to-br p-6 backdrop-blur-xl ${m.accent}`}
            >
              <motion.div className="flex items-start justify-between gap-4">
                <motion.div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-black/30">
                  <m.icon className="w-6 h-6 text-white/90" />
                </motion.div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-200 border border-white/10 rounded-full px-2 py-0.5">{m.badge}</span>
              </motion.div>
              <h2 className="text-xl font-bold mt-4">{m.title}</h2>
              <p className="text-sm text-slate-200 mt-2 flex-1 leading-relaxed">{m.desc}</p>
              <Button asChild className="mt-6 w-full sm:w-auto gap-2 bg-white/10 hover:bg-white/15 border border-white/10">
                <Link to={m.href}>
                  Modülü aç <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </motion.div>
          ))}
        </motion.div>

        <motion.div className="mt-12 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5 flex gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          <Shield className="w-5 h-5 text-amber-300 shrink-0" />
          <p className="text-xs text-slate-200 leading-relaxed">
            Kesinlikle yatırım tavsiyesi değildir. Girdilere dayalı ön fizibilitedir. PVGIS doğrulanmış ışınım, resmi imar durumu ve TEİAŞ/EDAŞ başvurusu olmadan yatırım kararı alınmamalıdır.
          </p>
        </motion.div>

        <p className="mt-6 text-center text-[10px] text-slate-300">
          <Link to={ROUTES.SERVICES} className="hover:text-white underline-offset-2 hover:underline">Kurumsal hizmetler</Link>
        </p>
      </motion.div>
    </motion.div>
  );
}