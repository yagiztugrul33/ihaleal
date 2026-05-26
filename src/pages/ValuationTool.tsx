import { ArrowRight, BarChart3, Calculator, Layers3, Scale, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ValuationWorkbench } from "@/components/valuation/ValuationWorkbench";

export default function ValuationTool() {
  return (
    <main className="min-h-screen pb-16 pt-24 text-white">
      <section className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6">
        <header className="rounded-2xl border border-cyan-500/35 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 p-6 md:p-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200">
            <Calculator className="h-3.5 w-3.5" />
            AR-GE değerleme laboratuvarı
          </p>
          <h1 className="mt-4 text-3xl font-black leading-tight text-white md:text-5xl">
            Gayrimenkulünüzün gerçek değerini yapay zeka ile öğrenin
          </h1>
          <p className="mt-3 max-w-4xl text-sm text-slate-300 md:text-base">
            Emsal + hedonik + mekansal düzeltme katmanları aynı modelde birleşir. Tek sayı yerine güven aralıklı tahmin,
            faktör katkı dökümü ve SPK yaklaşımı karşılaştırması üretilir.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-4">
            <h2 className="text-sm font-black uppercase tracking-[0.12em] text-violet-200">SPK - Emsal yaklaşımı</h2>
            <p className="mt-2 text-sm text-slate-200">
              Benzer satılmış mülkler m², oda, yaş ve mesafe farklarına göre normalize edilir; ağırlıklı ortalama ile değer
              üretilir.
            </p>
          </article>
          <article className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <h2 className="text-sm font-black uppercase tracking-[0.12em] text-amber-200">SPK - Maliyet yaklaşımı</h2>
            <p className="mt-2 text-sm text-slate-200">
              Yeniden inşa maliyeti, yıpranma etkisi ve arsa payı birlikte hesaplanır; özellikle düşük emsal yoğunluklu
              bölgelerde kontrol katmanı sağlar.
            </p>
          </article>
          <article className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <h2 className="text-sm font-black uppercase tracking-[0.12em] text-emerald-200">SPK - Gelir yaklaşımı</h2>
            <p className="mt-2 text-sm text-slate-200">
              Beklenen kira nakit akışı kapitalizasyon oranı ile bugüne çekilir; yatırımcı için getiri odaklı ikinci görüş
              sunar.
            </p>
          </article>
        </section>

        <section className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 md:p-5">
          <h2 className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-cyan-200">
            <Layers3 className="h-4 w-4" /> AI katmanı
          </h2>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <p className="rounded-lg border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-200">
              Hedonik regresyon ile mülkün her özelliğinin örtük fiyat katkısı (implicit price) ayrı modellenir.
            </p>
            <p className="rounded-lg border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-200">
              Emsal katmanında benzer satışlar benzerlik skoru ile ağırlıklandırılır; ham ortalama yerine düzeltilmiş birim
              fiyat kullanılır.
            </p>
            <p className="rounded-lg border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-200">
              Mekansal düzeltme komşu bölge etkisini hesaba katar; fiyat seviyesi yakın çevre trendi ile kalibre edilir.
            </p>
          </div>
        </section>

        <ValuationWorkbench title="Değerleme başlat" />

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-lg border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-200">
            <h3 className="text-xs font-black uppercase tracking-[0.12em] text-cyan-200">Satıcı için</h3>
            <p className="mt-2">Rezerv fiyatı belirlerken aşırı yüksek veya düşük açılış riskini azaltır.</p>
          </article>
          <article className="rounded-lg border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-200">
            <h3 className="text-xs font-black uppercase tracking-[0.12em] text-cyan-200">Alıcı için</h3>
            <p className="mt-2">Fazla ödeme ihtimalini güven aralığı ile görünür kılar; pazarlık bandı sağlar.</p>
          </article>
          <article className="rounded-lg border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-200">
            <h3 className="text-xs font-black uppercase tracking-[0.12em] text-cyan-200">Yatırımcı için</h3>
            <p className="mt-2">Emsal, maliyet ve gelir yaklaşımı farklarını kıyaslayıp fırsat/disiplin kararına destek olur.</p>
          </article>
        </section>

        <section className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">
          <h3 className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-cyan-100">
            <BarChart3 className="h-4 w-4" />
            Örnek senaryo
          </h3>
          <p className="mt-2 text-sm text-cyan-50">
            Kadıköy 3+1 120m² 8 yaş → 14 emsal → tahmini değer merkez bandı üretilir (örn. ±%8). Katkı dökümü:
            konum +%12, yaş -%8, m² +%20 gibi satırlarla açıklanır.
          </p>
        </section>

        <section className="rounded-xl border border-amber-500/35 bg-amber-500/10 p-4 text-amber-100">
          <p className="inline-flex items-center gap-2 text-sm font-semibold">
            <ShieldAlert className="h-4 w-4" />
            Dürüst sınır
          </p>
          <p className="mt-2 text-sm">
            Bu çıktı ön değerlemedir. Resmi rapor ve hukuki bağlayıcılık için SPK lisanslı değerleme uzmanı (TDUB)
            onayı gerekir.
          </p>
          <div className="mt-3">
            <Button type="button" className="bg-amber-300 font-semibold text-slate-900 hover:bg-amber-200">
              Değerleme başlat <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </section>
      </section>
    </main>
  );
}
