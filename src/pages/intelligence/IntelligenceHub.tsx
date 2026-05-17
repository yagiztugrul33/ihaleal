import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Map,
  Sun,
  Shield,
  Radar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  GES_ANALYSIS_PATH,
  PARCEL_INTELLIGENCE_PATH,
  WAR_ROOM_PATH,
} from "@/lib/intelligenceHub";
import { KKA_STUDIO_PATH } from "@/lib/kkaHub";

const MODULES = [
  {
    title: "Stratejik War Room",
    desc: "Canli GIS, PVGIS, jeoteknik, deprem, afet ve GES — kurumsal site istihbarati.",
    icon: Radar,
    href: WAR_ROOM_PATH,
    badge: "Palantir",
  },
  {
    title: "GES Master Analiz",
    desc: "IEC/IEA uyumlu isinim, PR, uretim, NPV, IRR, LCOE — muhendislik varsayimlari ile.",
    icon: Sun,
    href: GES_ANALYSIS_PATH,
    badge: "Muhendislik",
  },
  {
    title: "Ada Parsel Istihbarat",
    desc: "Imar, GES uygunluk, bolge gelisim ve bilesik yatirim skoru.",
    icon: Map,
    href: PARCEL_INTELLIGENCE_PATH,
    badge: "GIS + AI",
  },
  {
    title: "Kat Karşılığı Studio",
    desc: "EMSAL/TAKS, hak edis ve sozlesme taslagi.",
    icon: Building2,
    href: KKA_STUDIO_PATH,
    badge: "Mevcut",
  },
  {
    title: "Yatirim Terminali",
    desc: "Bolge karsilastirma ve portfoy skorlari (yakinda).",
    icon: FileBarChart,
    href: LAND_INVESTMENT_PATH,
    badge: "Beta",
  },
];

export default function IntelligenceHub() {
  return (
    <motion.div
      className="min-h-screen pt-24 pb-20 intelligence-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-blue-950/40 via-transparent to-transparent"
        aria-hidden
      />
      <motion.div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="mb-12 max-w-3xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-cyan-400/90 mb-3">
            Arastirma terminali
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Arazi, GES ve yatırım zekası
          </h1>
          <p className="text-slate-400 mt-4 text-lg leading-relaxed">
            Muhendislik formulleri, olasilik tabanli imar indeksleri ve izlenebilir hesap
            adimlari. Sonuclar bilgilendirme amaclidir; resmi rapor ve lisansli onay gerektirir.
          </p>
          <motion.div className="mt-6 flex flex-wrap gap-2">
            <span className="trust-pill text-xs">IEC / IEA metodoloji</span>
            <span className="trust-pill text-xs">Guven araligi</span>
            <span className="trust-pill text-xs">Varsayim seffafligi</span>
          </motion.div>
        </motion.div>

        <motion.div className="grid md:grid-cols-2 gap-6">
          {MODULES.map((m, i) => (
            <motion.div
              key={m.href}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card-luxury group p-6 flex flex-col"
            >
              <motion.div className="flex items-start justify-between gap-4">
                <motion.div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10">
                  <m.icon className="w-6 h-6 text-cyan-300" />
                </motion.div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 border border-white/10 rounded-full px-2 py-0.5">
                  {m.badge}
                </span>
              </motion.div>
              <h2 className="text-xl font-bold text-white mt-4">{m.title}</h2>
              <p className="text-sm text-slate-400 mt-2 flex-1 leading-relaxed">{m.desc}</p>
              <Button asChild className="btn-primary mt-6 w-full sm:w-auto gap-2">
                <Link to={m.href}>
                  Modulu ac <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-12 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5 flex gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <Shield className="w-5 h-5 text-amber-300 shrink-0" />
          <p className="text-xs text-slate-400 leading-relaxed">
            Olasılık skorları ve üretim tahminleri garanti değildir. PVGIS doğrulanmış ışınım,
            resmi imar durumu ve TEİAŞ/EDAŞ başvurusu olmadan yatırım kararı alınmamalıdır.
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}