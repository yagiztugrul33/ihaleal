import { BarChart3, Scale, ShieldCheck } from "lucide-react";
import { ModulePanel, ModuleShell } from "./ModuleShell";
import { ValuationWorkbench } from "@/components/valuation/ValuationWorkbench";

export default function DegerlemeModulPage() {
  return (
    <ModuleShell
      title="Değerleme Modülü (AR-GE)"
      subtitle="Hedonik model, emsal eşleştirme, mekansal düzeltme ve güven aralığı ile ön değerleme laboratuvarı."
      icon={Scale}
      iconAccent="text-violet-300"
      badge="Ekspertiz AI"
    >
      <div className="space-y-4">
        <ModulePanel title="Metodoloji Özeti">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-sm text-slate-200">
            <div className="rounded-[10px] border border-slate-700 bg-slate-900/70 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-violet-200">Emsal yaklaşımı</p>
              <p className="mt-1">Benzer satılmış mülkler farklılık düzeltmesiyle normalize edilir.</p>
            </div>
            <div className="rounded-[10px] border border-slate-700 bg-slate-900/70 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-violet-200">Maliyet yaklaşımı</p>
              <p className="mt-1">Yeniden inşa maliyeti - yıpranma + arsa etkisi birlikte hesaplanır.</p>
            </div>
            <div className="rounded-[10px] border border-slate-700 bg-slate-900/70 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-violet-200">Gelir yaklaşımı</p>
              <p className="mt-1">Kira akışı kapitalizasyon oranı ile bugünkü değere çevrilir.</p>
            </div>
            <div className="rounded-[10px] border border-slate-700 bg-slate-900/70 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-violet-200">AI katmanı</p>
              <p className="mt-1">Hedonik + mekansal model, SHAP benzeri katkı dökümü ile açıklanır.</p>
            </div>
          </div>
        </ModulePanel>

        <ValuationWorkbench title="Modül içi değerleme simülatörü" compact />

        <ModulePanel title="Örnek Çalışma ve Kullanım">
          <div className="grid gap-3 lg:grid-cols-3">
            <article className="rounded-[10px] border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-200">
              <h3 className="inline-flex items-center gap-1.5 text-xs font-normal uppercase tracking-[0.12em] text-violet-200">
                <BarChart3 className="h-3.5 w-3.5" />
                Örnek
              </h3>
              <p className="mt-2">
                Kadıköy 3+1 120m² 8 yaş → 14 emsal → tahmini değer ve ± band üretilir. Katkı dökümü:
                konum +%12, yaş -%8, m² +%20 gibi görünür.
              </p>
            </article>
            <article className="rounded-[10px] border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-200">
              <h3 className="text-xs font-normal uppercase tracking-[0.12em] text-violet-200">Kime göre</h3>
              <p className="mt-2">Satıcı rezerv fiyat belirler, alıcı fazla ödeme riskini görür, yatırımcı fırsat filtresi yapar.</p>
            </article>
            <article className="rounded-[10px] border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-100">
              <h3 className="inline-flex items-center gap-1.5 text-xs font-normal uppercase tracking-[0.12em]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Dürüst sınır
              </h3>
              <p className="mt-2">
                Bu ekran ön değerlemedir. Resmi rapor ve hukuki bağlayıcılık için SPK lisanslı değerleme uzmanı (TDUB)
                gereklidir.
              </p>
            </article>
          </div>
        </ModulePanel>
      </div>
    </ModuleShell>
  );
}
