import { Sun } from "lucide-react";
import { GesEvaluationForm } from "@/components/ges/GesEvaluationForm";
import { GesIntelligenceWorkbench } from "@/components/energy/GesIntelligenceWorkbench";
import { gesLandSubtitle } from "@/lib/gesLandHub";
import { calculateGesIntelligence } from "@/lib/energy/gesIntelligenceEngine";

export default function GesLandEvaluationPage() {
  const scenarioA = calculateGesIntelligence({
    landAreaM2: 100_000,
    dcCapacityKwp: 1_000,
    annualGhiKwhM2: 1750,
    slopePercent: 3.5,
    transformerDistanceKm: 2,
    zoningPermitted: true,
    electricityPriceTryPerKwh: 2.95,
    capexTryPerKwp: 15_000,
    annualOpexTry: 1_200_000,
    discountRatePct: 10,
  });
  const scenarioB = calculateGesIntelligence({
    landAreaM2: 100_000,
    dcCapacityKwp: 1_000,
    annualGhiKwhM2: 1320,
    slopePercent: 12,
    transformerDistanceKm: 9,
    zoningPermitted: false,
    electricityPriceTryPerKwh: 2.3,
    capexTryPerKwp: 20_500,
    annualOpexTry: 1_650_000,
    discountRatePct: 14,
  });

  return (
    <main className="min-h-screen pt-24 pb-16 text-white">
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-200">
            <Sun className="h-3.5 w-3.5" /> GES Arazi
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold">GES Arazi Degerlendirme</h1>
          <p className="mt-2 text-slate-400 max-w-2xl">{gesLandSubtitle}</p>
          <p className="mt-3 text-sm text-slate-300">
            Bu ekran, atıl araziyi elektrik üretiminden gelir üreten varlığa çevirme kararını teknik + finansal katmanla değerlendirir.
          </p>
        </div>
        <section className="mb-6 grid gap-3 sm:grid-cols-3">
          <article className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-xs text-amber-100">
            <p className="font-semibold">5 MW lisanssız sınır</p>
            <p className="mt-1">TR lisanssız üretim uygulamalarında proje kapasite sınırı ve bağlantı görüşü birlikte değerlendirilir.</p>
          </article>
          <article className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-3 text-xs text-cyan-100">
            <p className="font-semibold">5.1.h + saatlik mahsuplaşma</p>
            <p className="mt-1">Saatlik mahsuplaşma etkisi, gelir modeli ve geri ödeme hesabına doğrudan yansır.</p>
          </article>
          <article className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-xs text-emerald-100">
            <p className="font-semibold">NPV / IRR / LCOE</p>
            <p className="mt-1">Karar seti en az üç finansal göstergenin birlikte okunmasıyla kurulmalıdır.</p>
          </article>
        </section>
        <section className="mb-6 grid gap-3 md:grid-cols-2">
          <article className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-200">
            <h2 className="text-xs font-black uppercase tracking-[0.12em] text-amber-200">Analiz katmanları</h2>
            <ul className="mt-2 space-y-1 text-slate-300">
              <li>- Solar: GHI (min ~1300), üretim yoğunluğu, 10 dönüm ≈ 1 MWp ölçeği.</li>
              <li>- Siting: eğim, trafo/şebeke mesafesi (#2 faktör), imar uygunluğu.</li>
              <li>- Finans: NPV&gt;0, IRR, LCOE (TRY/kWh), payback ve CAPEX bandı.</li>
            </ul>
          </article>
          <article className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-200">
            <h2 className="text-xs font-black uppercase tracking-[0.12em] text-amber-200">Örnek ve hedef kitle</h2>
            <p className="mt-2">
              10 dönüm → ~1 MWp → CAPEX ~15M TL → ~1.6M kWh/yıl üretim senaryosu, güçlü koşullarda ~5 yıl geri ödeme üretebilir.
            </p>
            <p className="mt-2 text-xs text-slate-300">Kime göre: arazi sahibi, yatırımcı, sanayici. Karar: bankable değil, lisanslı mühendis/EPC şart.</p>
          </article>
        </section>
        <section className="mb-6 rounded-xl border border-slate-700 bg-slate-900/60 p-4">
          <h2 className="text-sm font-semibold text-slate-100">Atıl araziyi gelir varlığına çevirme akışı</h2>
          <ol className="mt-2 space-y-1 text-xs text-slate-300 list-decimal pl-4">
            <li>Saha taraması: GHI bandı, eğim ve gölgeleme ön kontrolü.</li>
            <li>Şebeke yaklaşımı: trafo/bağlantı uzaklığı ve kapasite teyidi.</li>
            <li>İdari filtre: imar uygunluğu, lisanssız sınır ve teknik evraklar.</li>
            <li>Finans modeli: CAPEX/OPEX, NPV/IRR/LCOE ve geri ödeme hesabı.</li>
            <li>Karar: EPC keşfi + lisanslı mühendis etüdü + resmi kurum görüşü ile nihai onay.</li>
          </ol>
        </section>
        <section className="mb-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="text-sm font-semibold text-slate-100">TR mevzuat + finans okuma disiplini</h2>
          <ul className="mt-2 space-y-1 text-xs text-slate-300">
            <li>- 5 MW lisanssız sınırı: proje ölçeği ve bağlantı görüşü birlikte ele alınır.</li>
            <li>- 5.1.h / saatlik mahsuplaşma: gelir dalgalanması ve geri ödeme süresi üzerinde doğrudan etkilidir.</li>
            <li>- NPV/IRR/LCOE üçlüsü aynı anda pozitif okumadan yatırım kararı önerilmez.</li>
          </ul>
        </section>
        <section className="mb-6 grid gap-3 md:grid-cols-2">
          <article className="rounded-xl border border-emerald-500/35 bg-emerald-500/10 p-3 text-sm text-emerald-100">
            <p className="text-xs uppercase tracking-[0.12em]">Senaryo A (uygun saha)</p>
            <p className="mt-1">Skor {scenarioA.overallScore}/100 · NPV {scenarioA.feasibility.npvTry.toLocaleString("tr-TR")} TRY</p>
          </article>
          <article className="rounded-xl border border-rose-500/35 bg-rose-500/10 p-3 text-sm text-rose-100">
            <p className="text-xs uppercase tracking-[0.12em]">Senaryo B (stresli saha)</p>
            <p className="mt-1">Skor {scenarioB.overallScore}/100 · NPV {scenarioB.feasibility.npvTry.toLocaleString("tr-TR")} TRY</p>
          </article>
        </section>
        <section className="mb-6 grid gap-3 md:grid-cols-3 text-sm text-slate-200">
          <article className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-amber-200">Arazi sahibi için</p>
            <p className="mt-2">Arsanın enerji gelir potansiyelini görüp sat/işlet kararını rasyonel hale getirir.</p>
          </article>
          <article className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-amber-200">Yatırımcı için</p>
            <p className="mt-2">CAPEX-LCOE marjını ve nakit akış dayanıklılığını tek pencerede kıyaslar.</p>
          </article>
          <article className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-amber-200">Sanayici için</p>
            <p className="mt-2">Enerji maliyetini aşağı çekme ve saatlik mahsuplaşma etkisini önceden simüle eder.</p>
          </article>
        </section>
        <section className="mb-6 rounded-xl border border-slate-700 bg-slate-900/60 p-4">
          <h2 className="text-sm font-semibold text-slate-100">Kısa SSS</h2>
          <div className="mt-2 grid gap-2 md:grid-cols-2 text-xs text-slate-300">
            <article className="rounded-lg border border-white/10 bg-black/20 p-3">
              <p className="font-semibold text-slate-100">5 MW altında olmak tek başına yeterli mi?</p>
              <p className="mt-1">Hayır. Bağlantı görüşü, imar uygunluğu ve teknik kabuller birlikte gerekir.</p>
            </article>
            <article className="rounded-lg border border-white/10 bg-black/20 p-3">
              <p className="font-semibold text-slate-100">LCOE düşük ama NPV negatif olabilir mi?</p>
              <p className="mt-1">Evet. Satış fiyatı, finansman ve iskonto oranı dengesine göre NPV negatife dönebilir.</p>
            </article>
          </div>
        </section>
        <GesEvaluationForm />
        <div className="mt-6">
          <GesIntelligenceWorkbench compact title="GES finans + mevzuat ön izleme" />
        </div>
        <p className="mt-4 text-xs text-slate-400">
          Dürüst sınır: Bu ekran bankable fizibilite üretmez; EPC keşfi, lisanslı elektrik mühendisi hesabı ve resmi kurum görüşü zorunludur.
        </p>
      </section>
    </main>
  );
}
