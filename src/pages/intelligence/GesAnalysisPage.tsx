import { ArrowLeft, ArrowRight, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { INTELLIGENCE_HUB_PATH } from "@/lib/intelligenceHub";
import { GesIntelligenceWorkbench } from "@/components/energy/GesIntelligenceWorkbench";
import { calculateGesIntelligence } from "@/lib/energy/gesIntelligenceEngine";

export default function GesAnalysisPage() {
  const reference = calculateGesIntelligence({
    landAreaM2: 100_000,
    dcCapacityKwp: 1_000,
    annualGhiKwhM2: 1720,
    slopePercent: 4,
    transformerDistanceKm: 2.4,
    zoningPermitted: true,
    electricityPriceTryPerKwh: 2.9,
    capexTryPerKwp: 15_000,
    annualOpexTry: 1_200_000,
    discountRatePct: 10,
  });
  const downside = calculateGesIntelligence({
    landAreaM2: 100_000,
    dcCapacityKwp: 1_000,
    annualGhiKwhM2: 1340,
    slopePercent: 12,
    transformerDistanceKm: 9.2,
    zoningPermitted: false,
    electricityPriceTryPerKwh: 2.25,
    capexTryPerKwp: 20_000,
    annualOpexTry: 1_700_000,
    discountRatePct: 14,
  });

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
          <p className="mt-3 max-w-4xl text-sm text-slate-300">
            GES; atıl araziyi enerji üreten ve nakit akışı olan bir gelir varlığına çevirme modelidir. Bu sayfada hedef, arsanın
            teknik ve finansal uygunluğunu tek panelde görünür kılmaktır.
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

        <section className="mt-5 grid gap-3 lg:grid-cols-2">
          <article className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-200">
            <h2 className="text-xs font-black uppercase tracking-[0.12em] text-amber-200">Solar fizibilite (Katman 1)</h2>
            <ul className="mt-2 space-y-1 text-slate-300">
              <li>- GHI tabanı: en az ~1300 kWh/m²/yıl bandı altında proje marjı hızla düşer.</li>
              <li>- Ölçek kuralı: yaklaşık 10 dönüm ≈ 1 MWp (arazi tipine göre değişir).</li>
              <li>- Üretim: panel verimi, kayıplar ve iklim bandı ile yıllık kWh çıktısı hesaplanır.</li>
            </ul>
          </article>
          <article className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-200">
            <h2 className="text-xs font-black uppercase tracking-[0.12em] text-cyan-200">Siting (Katman 2)</h2>
            <ul className="mt-2 space-y-1 text-slate-300">
              <li>- Eğim maliyeti: zemin hazırlık ve kurulum karmaşıklığını belirler.</li>
              <li>- Şebeke/trafo mesafesi: CAPEX/OPEX sonrası en kritik ikinci faktördür.</li>
              <li>- İmar uygunluğu: bağlantı ve yatırım sürecinin idari geçilebilirliğini etkiler.</li>
            </ul>
          </article>
          <article className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-200">
            <h2 className="text-xs font-black uppercase tracking-[0.12em] text-emerald-200">Finansal (Katman 3)</h2>
            <ul className="mt-2 space-y-1 text-slate-300">
              <li>- NPV: indirgenmiş nakit akışı toplamı; NPV &gt; 0 karlılık eşiğini geçer.</li>
              <li>- IRR: NPV'yi sıfırlayan iç verim oranı; sermaye maliyetinin üzerinde olmalı.</li>
              <li>- LCOE: toplam yatırım/üretim maliyeti (TRY/kWh).</li>
              <li>- Payback: iyi senaryoda 4-6 yıl bandı görülebilir.</li>
              <li>- CAPEX referansı: 1 MW için ~12M-22M TL bant analizi kullanılır.</li>
            </ul>
          </article>
          <article className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-200">
            <h2 className="text-xs font-black uppercase tracking-[0.12em] text-violet-200">TR mevzuat (Katman 4)</h2>
            <ul className="mt-2 space-y-1 text-slate-300">
              <li>- 5 MW lisanssız üretim eşiği.</li>
              <li>- 5.1.h mekanizması ve saatlik mahsuplaşma (2026).</li>
              <li>- %1 KDV referansı (senaryo bazlı doğrulama şart).</li>
            </ul>
          </article>
        </section>

        <GesIntelligenceWorkbench title="GES fizibilite motorunu çalıştır" />

        <section className="mt-5 grid gap-3 md:grid-cols-2">
          <article className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 p-3 text-sm text-emerald-100">
            <h3 className="text-xs font-black uppercase tracking-[0.12em]">Motor kanıtı A</h3>
            <p className="mt-2">Skor {reference.overallScore}/100 · NPV {reference.feasibility.npvTry.toLocaleString("tr-TR")} TRY · LCOE {reference.feasibility.lcoeTryPerKwh.toFixed(2)}</p>
          </article>
          <article className="rounded-lg border border-rose-500/35 bg-rose-500/10 p-3 text-sm text-rose-100">
            <h3 className="text-xs font-black uppercase tracking-[0.12em]">Motor kanıtı B</h3>
            <p className="mt-2">Skor {downside.overallScore}/100 · NPV {downside.feasibility.npvTry.toLocaleString("tr-TR")} TRY · LCOE {downside.feasibility.lcoeTryPerKwh.toFixed(2)}</p>
          </article>
        </section>

        <section className="mt-5 grid gap-3 lg:grid-cols-3">
          <article className="rounded-lg border border-slate-700 bg-slate-900/60 p-3 text-sm text-slate-200">
            <h3 className="text-xs font-black uppercase tracking-[0.12em] text-amber-200">NPV / IRR / LCOE</h3>
            <p className="mt-2">NPV &gt; 0 proje değeri üretir, IRR iskonto oranını aşmalı, LCOE satış fiyatının altında kalmalıdır.</p>
          </article>
          <article className="rounded-lg border border-slate-700 bg-slate-900/60 p-3 text-sm text-slate-200">
            <h3 className="text-xs font-black uppercase tracking-[0.12em] text-amber-200">Örnek</h3>
            <p className="mt-2">
              10 dönüm → ~1 MWp → CAPEX ~15M TL → ~1.6M kWh/yıl üretim varsayımında, satış fiyatı ve OPEX dengesine göre ~5 yıl
              geri ödeme bandı yakalanabilir.
            </p>
          </article>
          <article className="rounded-lg border border-slate-700 bg-slate-900/60 p-3 text-sm text-slate-200">
            <h3 className="text-xs font-black uppercase tracking-[0.12em] text-amber-200">Kime göre</h3>
            <p className="mt-2">Arazi sahibi, yatırımcı ve sanayici için aynı veriyi farklı risk iştahlarına göre kıyaslama imkanı verir.</p>
          </article>
          <article className="rounded-lg border border-amber-500/35 bg-amber-500/10 p-3 text-sm text-amber-100">
            <h3 className="text-xs font-black uppercase tracking-[0.12em]">Dürüst sınır</h3>
            <p className="mt-2">Bankable fizibilite değildir; lisanslı mühendis, EPC ve resmi kurum görüşü olmadan yatırım kararı verilmez.</p>
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
