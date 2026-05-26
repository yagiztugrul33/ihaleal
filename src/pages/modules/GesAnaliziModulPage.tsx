import { useMemo } from "react";
import { ArrowRight, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModulePanel, ModuleShell } from "./ModuleShell";
import { GesIntelligenceWorkbench } from "@/components/energy/GesIntelligenceWorkbench";
import { calculateGesIntelligence } from "@/lib/energy/gesIntelligenceEngine";

export default function GesAnaliziModulPage() {
  const scenarioCompare = useMemo(() => {
    const base = calculateGesIntelligence({
      landAreaM2: 100_000,
      dcCapacityKwp: 1_000,
      annualGhiKwhM2: 1700,
      slopePercent: 4,
      transformerDistanceKm: 2.2,
      zoningPermitted: true,
      electricityPriceTryPerKwh: 2.9,
      capexTryPerKwp: 15_000,
      annualOpexTry: 1_200_000,
      discountRatePct: 10,
    });
    const stressed = calculateGesIntelligence({
      landAreaM2: 100_000,
      dcCapacityKwp: 1_000,
      annualGhiKwhM2: 1380,
      slopePercent: 11,
      transformerDistanceKm: 8.5,
      zoningPermitted: false,
      electricityPriceTryPerKwh: 2.35,
      capexTryPerKwp: 20_000,
      annualOpexTry: 1_650_000,
      discountRatePct: 14,
    });
    return { base, stressed };
  }, []);

  return (
    <ModuleShell
      title="GES Analizi Modülü"
      subtitle="Solar + siting + finans + mevzuat katmanlarını tek skor ve açıklanabilir katkı dökümünde birleştirin."
      icon={Sun}
      iconAccent="text-amber-300"
      badge="Enerji Intelligence"
    >
      <div className="space-y-4">
        <ModulePanel title="Katman metodolojisi">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-sm text-slate-200">
            <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-amber-200">Solar</p>
              <p className="mt-1">GHI, üretim yoğunluğu ve ölçek uyumu ile saha enerji potansiyeli.</p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-amber-200">Siting</p>
              <p className="mt-1">Eğim, trafo mesafesi ve imar uygunluğu üzerinden bağlantı fizibilitesi.</p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-amber-200">Finans</p>
              <p className="mt-1">NPV, IRR, LCOE ve payback ile yatırım dayanıklılığı.</p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-amber-200">Mevzuat</p>
              <p className="mt-1">5 MW lisanssız, 5.1.h, saatlik mahsuplaşma ve %1 KDV referansı.</p>
            </div>
          </div>
        </ModulePanel>

        <ModulePanel title="GES nedir / neden">
          <p className="text-sm leading-relaxed text-slate-200">
            GES yatırımı, atıl araziyi elektrik üreten bir gelir varlığına çevirir. Modülün amacı; teknik uygunluk, finansal
            dayanıklılık ve mevzuat riskini tek karar panosunda bir araya getirmektir.
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-2 text-sm text-slate-200">
            <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
              <h3 className="text-xs font-black uppercase tracking-[0.12em] text-amber-200">TR mevzuat referansı</h3>
              <p className="mt-2">5 MW lisanssız, 5.1.h, saatlik mahsuplaşma 2026 ve %1 KDV varsayımlarıyla ön çerçeve kurulur.</p>
            </article>
            <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
              <h3 className="text-xs font-black uppercase tracking-[0.12em] text-amber-200">Örnek oranlar</h3>
              <p className="mt-2">10 dönüm ≈ 1 MWp, CAPEX bandı 12M-22M TL, güçlü senaryoda payback 4-6 yıl aralığı.</p>
            </article>
          </div>
        </ModulePanel>

        <GesIntelligenceWorkbench title="GES modül simülatörü" compact />

        <ModulePanel title="Motor kanıtı: farklı girdi farklı sonuç">
          <div className="grid gap-3 lg:grid-cols-2 text-sm">
            <article className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 p-3 text-emerald-100">
              <h3 className="text-xs font-black uppercase tracking-[0.12em]">Senaryo A (uygun saha)</h3>
              <p className="mt-2">Skor {scenarioCompare.base.overallScore}/100 · NPV {scenarioCompare.base.feasibility.npvTry.toLocaleString("tr-TR")} TRY</p>
              <p className="text-xs mt-1">LCOE {scenarioCompare.base.feasibility.lcoeTryPerKwh.toFixed(2)} TRY/kWh · IRR {scenarioCompare.base.feasibility.irrPct?.toFixed(1) ?? "-"}%</p>
            </article>
            <article className="rounded-lg border border-rose-500/35 bg-rose-500/10 p-3 text-rose-100">
              <h3 className="text-xs font-black uppercase tracking-[0.12em]">Senaryo B (stresli saha)</h3>
              <p className="mt-2">Skor {scenarioCompare.stressed.overallScore}/100 · NPV {scenarioCompare.stressed.feasibility.npvTry.toLocaleString("tr-TR")} TRY</p>
              <p className="text-xs mt-1">LCOE {scenarioCompare.stressed.feasibility.lcoeTryPerKwh.toFixed(2)} TRY/kWh · IRR {scenarioCompare.stressed.feasibility.irrPct?.toFixed(1) ?? "-"}%</p>
            </article>
          </div>
        </ModulePanel>

        <ModulePanel title="Tanım sözlüğü (yatırım komitesi dili)">
          <div className="grid gap-3 md:grid-cols-2 text-sm text-slate-200">
            <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
              <h3 className="text-xs font-black uppercase tracking-[0.12em] text-amber-200">NPV</h3>
              <p className="mt-2">
                İndirgenmiş nakit akışlarının bugünkü değer toplamıdır. NPV &gt; 0 olması, seçilen iskonto oranında projenin değer
                ürettiğini gösterir.
              </p>
            </article>
            <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
              <h3 className="text-xs font-black uppercase tracking-[0.12em] text-amber-200">IRR</h3>
              <p className="mt-2">
                NPV'yi sıfıra getiren iç verim oranıdır. Sermaye maliyeti ve alternatif getirilerle birlikte okunmalıdır.
              </p>
            </article>
            <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
              <h3 className="text-xs font-black uppercase tracking-[0.12em] text-amber-200">LCOE</h3>
              <p className="mt-2">
                Toplam yaşam döngüsü maliyetinin toplam üretime bölünmesidir (TRY/kWh). Satış fiyatı ve teşviklerle birlikte
                marj kontrolünün temel metriklerinden biridir.
              </p>
            </article>
            <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
              <h3 className="text-xs font-black uppercase tracking-[0.12em] text-amber-200">Payback</h3>
              <p className="mt-2">
                Başlangıç yatırımının geri kazanım süresidir. Tek başına yeterli değildir; NPV ve IRR ile birlikte değerlendirilir.
              </p>
            </article>
          </div>
        </ModulePanel>

        <ModulePanel title="Örnek ve dürüst sınır">
          <div className="grid gap-3 lg:grid-cols-3">
            <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-200">
              <h3 className="text-xs font-black uppercase tracking-[0.12em] text-amber-200">Örnek</h3>
              <p className="mt-2">10 dönüm ~1 MWp, uygun GHI ve kısa trafo mesafesiyle yaklaşık 4-6 yıl payback bandına yaklaşabilir.</p>
            </article>
            <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-200">
              <h3 className="text-xs font-black uppercase tracking-[0.12em] text-amber-200">Kime göre</h3>
              <p className="mt-2">Arazi sahibi, yatırımcı ve sanayici için aynı motoru farklı hedef fonksiyonlarla okumayı sağlar.</p>
            </article>
            <article className="rounded-lg border border-amber-500/35 bg-amber-500/10 p-3 text-sm text-amber-100">
              <h3 className="text-xs font-black uppercase tracking-[0.12em]">Dürüst sınır</h3>
              <p className="mt-2">Bankable etüt değildir; lisanslı mühendislik hesapları ve resmi kurum görüşleri gereklidir.</p>
            </article>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
            <p className="text-sm text-amber-100">Katman skorunu yatırım komitesi raporuna taşıyın.</p>
            <Button type="button" className="bg-amber-300 text-slate-900 hover:bg-amber-200">
              Analizi başlat <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </ModulePanel>
      </div>
    </ModuleShell>
  );
}
