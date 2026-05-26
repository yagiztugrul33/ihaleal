import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Banknote, Building2, Map, Radar, RefreshCw, Shield, Sun, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GES_ANALYSIS_PATH, PARCEL_INTELLIGENCE_PATH, WAR_ROOM_PATH } from "@/lib/intelligenceHub";
import { KKA_STUDIO_PATH } from "@/lib/kkaHub";
import { IBUYER_PATH } from "@/lib/ibuyerHub";
import { ROUTES } from "@/constants/routes";
import { LocationIntelligenceWorkbench } from "@/components/location/LocationIntelligenceWorkbench";

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
    desc: "Mevcut mülkünüzü hedef portföye takaslayın; çapraz ofis komisyonunu adım adım izleyin.",
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
    desc: "EMSAL/TAKS, kat adedi, müteahhit vs arsa sahibi paylaşımı ve skor /100 analizi.",
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
    title: "Kat Karşılığı Stüdyo",
    desc: "EMSAL/TAKS, hakediş ve sözleşme taslağıyla proje ön çerçevesi.",
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
        <motion.div className="mb-8 max-w-4xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-red-400/90 mb-3">Remax Borsa Global</p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">Bir mülkün gerçek değeri dört duvarından çok çevresidir</h1>
          <p className="text-slate-200 mt-4 text-base leading-relaxed sm:text-lg">
            Konum zekası katmanlarıyla mahalleyi satır satır çözümleriz: SES, erişilebilirlik, eğitim ve güvenlik sinyalleri ağırlıklı
            birleşik skora dönüşür. Sonuçlar demo veri / ön analiz niteliğindedir.
          </p>
          <motion.div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">SEGE + TÜİK mantığı</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">Walk Score yaklaşımı</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">Açıklanabilir katman katkısı</span>
          </motion.div>
        </motion.div>

        <LiveTicker />

        <section className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-black uppercase tracking-[0.16em] text-cyan-200">Neden konum zekası</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-200">
            Hedonik teoriye göre fiyatın önemli kısmı çevresel kalite, erişim ve komşuluk yapısından gelir. Bu yüzden yalnızca metrekare
            değil, çevre katmanlarının birlikte okunması gerekir. Bu terminal, Palantir tarzı katman birleştirme yaklaşımıyla ön karar
            üretmek için tasarlandı.
          </p>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-200">SES (SEGE + TÜİK proxy)</p>
            <p className="mt-1 text-xs text-slate-300">Gelir, eğitim, meslek yapısı ve gelişmişlik sinyaliyle mahalle sosyoekonomik skoru.</p>
          </article>
          <article className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-200">POI / erişilebilirlik</p>
            <p className="mt-1 text-xs text-slate-300">Market, okul, hastane, metro, park mesafesi ve yoğunluğu. Toplu taşıma en güçlü faktör.</p>
          </article>
          <article className="rounded-xl border border-violet-500/25 bg-violet-500/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-violet-200">Eğitim + güvenlik</p>
            <p className="mt-1 text-xs text-slate-300">Okul erişimi ve bölgesel eğitim seviyesi ile proxy güvenlik göstergeleri birleşik okunur.</p>
          </article>
        </section>

        <LocationIntelligenceWorkbench title="Konum/parsel gir, katman skorlarını üret" compact />

        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          <article className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
            <h3 className="text-xs font-black uppercase tracking-[0.14em] text-cyan-200">Örnek analiz (demo)</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">
              Kadıköy 3+1, metro mesafesi 350m, okul yoğunluğu 17 ve risk proxy 33 olduğunda birleşik skor güçlü bandda oluşur.
              Aynı girdide metro mesafesi 1.8km ve risk proxy 58'e çıktığında skor aşağı gelir. Bu fark, fiyat pazarlığında
              konumsal primin ne kadar korunacağını görünür kılar.
            </p>
          </article>
          <article className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <h3 className="text-xs font-black uppercase tracking-[0.14em] text-amber-100">Veri kaynağı + dürüst sınır</h3>
            <p className="mt-2 text-sm leading-relaxed text-amber-50">
              Demo veri / ön analiz katmanı, kamuya açık göstergelerden türetilen proxy yaklaşımı kullanır. Canlıda kesin karar
              için TÜİK, SEGE ve resmi kurum entegrasyonları ile yerel saha doğrulaması zorunludur.
            </p>
            <Button asChild className="mt-3 bg-amber-300 text-slate-900 hover:bg-amber-200">
              <Link to={PARCEL_INTELLIGENCE_PATH}>
                Konum zekası başlat <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </article>
        </section>

        <section className="my-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-200">
            <h3 className="text-xs font-black uppercase tracking-[0.12em] text-cyan-200">Alıcı için</h3>
            <p className="mt-2">Yaşam kalitesi ile fiyat dengesini karşılaştırır; aşırı fiyatlanmış bölgeleri erken işaretler.</p>
          </article>
          <article className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-200">
            <h3 className="text-xs font-black uppercase tracking-[0.12em] text-cyan-200">Satıcı için</h3>
            <p className="mt-2">Çevresel güçlü yönleri netleştirir; rezerv fiyat ve pazarlama argümanı için veri sağlar.</p>
          </article>
          <article className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-200">
            <h3 className="text-xs font-black uppercase tracking-[0.12em] text-cyan-200">Yatırımcı için</h3>
            <p className="mt-2">Yaşanabilirlik ve yatırım puanını ayrıştırır; kısa/orta vadeli fırsat filtresi üretir.</p>
          </article>
        </section>

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
            Veri kaynağı ve dürüst sınır: Bu ekran demo + kamuya açık veri mantığıyla ön analiz üretir. Canlı sürümde TÜİK/SEGE ve resmi
            kurum entegrasyonları tamamlanmadan kesin karar verilmemelidir. Türkiye'de mahalle suç verisi sınırlı olduğu için güvenlik
            katmanı proxy+beyan içerir; kesin değildir.
          </p>
        </motion.div>

        <p className="mt-6 text-center text-[10px] text-slate-300">
          <Link to={ROUTES.SERVICES} className="hover:text-white underline-offset-2 hover:underline">Kurumsal hizmetler</Link>
        </p>
      </motion.div>
    </motion.div>
  );
}