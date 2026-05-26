import { ArrowLeft, ArrowRight, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { INTELLIGENCE_HUB_PATH } from "@/lib/intelligenceHub";
import { GesIntelligenceWorkbench } from "@/components/energy/GesIntelligenceWorkbench";

export default function GesAnalysisPage() {
  return (
    <motion.main className="min-h-screen pb-16 pt-24 text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Button variant="ghost" size="sm" asChild className="mb-4 text-slate-400">
          <Link to={INTELLIGENCE_HUB_PATH}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Arastirma
          </Link>
        </Button>

        <header className="rounded-2xl border border-amber-500/35 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 p-6 md:p-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200">
            <Sun className="h-3.5 w-3.5" /> GES AR-GE analiz laboratuvarı
          </p>
          <h1 className="mt-3 text-3xl font-black leading-tight md:text-5xl">GES arazi kararını katmanlı finans + saha zekasıyla verin</h1>
          <p className="mt-3 max-w-4xl text-sm text-slate-300 md:text-base">
            Solar fizibilite, siting koşulları, NPV/IRR/LCOE finans modeli ve TR mevzuat katmanı tek motor içinde birleşir.
            Çıktı demo veri / ön analiz niteliğindedir.
          </p>
        </header>

        <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-amber-200">Solar fizibilite</p>
            <p className="mt-2 text-sm text-slate-200">GHI, üretim tahmini ve 10 dönüm ≈ 1 MWp ölçek uyumu.</p>
          </article>
          <article className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-cyan-200">Siting</p>
            <p className="mt-2 text-sm text-slate-200">Eğim, trafo/şebeke mesafesi ve imar uygunluğu.</p>
          </article>
          <article className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-200">Finansal</p>
            <p className="mt-2 text-sm text-slate-200">NPV (DCF), IRR, LCOE, payback ve CAPEX dinamikleri.</p>
          </article>
          <article className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-violet-200">TR mevzuat</p>
            <p className="mt-2 text-sm text-slate-200">5 MW lisanssız, 5.1.h, saatlik mahsuplaşma 2026, %1 KDV referansı.</p>
          </article>
        </section>

        <GesIntelligenceWorkbench title="GES fizibilite motorunu çalıştır" />

        <section className="mt-5 grid gap-3 lg:grid-cols-3">
          <article className="rounded-lg border border-slate-700 bg-slate-900/60 p-3 text-sm text-slate-200">
            <h3 className="text-xs font-black uppercase tracking-[0.12em] text-amber-200">NPV / IRR / LCOE</h3>
            <p className="mt-2">NPV &gt; 0 proje değeri üretir, IRR iskonto oranını aşmalı, LCOE satış fiyatının altında kalmalıdır.</p>
          </article>
          <article className="rounded-lg border border-slate-700 bg-slate-900/60 p-3 text-sm text-slate-200">
            <h3 className="text-xs font-black uppercase tracking-[0.12em] text-amber-200">Örnek</h3>
            <p className="mt-2">10 dönüm ≈ 1 MWp senaryosunda doğru GHI ve şebeke erişimi ile geri ödeme bandı ~5 yıl civarına yaklaşabilir.</p>
          </article>
          <article className="rounded-lg border border-amber-500/35 bg-amber-500/10 p-3 text-sm text-amber-100">
            <h3 className="text-xs font-black uppercase tracking-[0.12em]">Dürüst sınır</h3>
            <p className="mt-2">Bankable fizibilite değildir; lisanslı mühendislik, şebeke görüşü ve resmi süreçler zorunludur.</p>
          </article>
        </section>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
          <p className="text-sm text-amber-100">Katman skorunu modül görünümünde yönetici paneli formatında paylaşın.</p>
          <Button asChild className="bg-amber-300 text-slate-900 hover:bg-amber-200">
            <Link to="/modul/ges-analizi">
              Modül görünümünü aç <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.main>
  );
}
