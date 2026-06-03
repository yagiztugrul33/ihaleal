import { ArrowRight, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModulePanel, ModuleShell } from "./ModuleShell";
import { GesIntelligenceWorkbench } from "@/components/energy/GesIntelligenceWorkbench";

export default function GesAnaliziModulPage() {
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

        <GesIntelligenceWorkbench title="GES modül simülatörü" compact />

        <ModulePanel title="Örnek ve dürüst sınır">
          <div className="grid gap-3 lg:grid-cols-3">
            <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-200">
              <h3 className="text-xs font-black uppercase tracking-[0.12em] text-amber-200">Örnek</h3>
              <p className="mt-2">10 dönüm ~1 MWp, uygun GHI ve kısa trafo mesafesiyle yaklaşık 4-6 yıl payback bandına yaklaşabilir.</p>
            </article>
            <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-200">
              <h3 className="text-xs font-black uppercase tracking-[0.12em] text-amber-200">Kime göre</h3>
              <p className="mt-2">Geliştirici, yatırımcı ve EPC ekiplerinin aynı veriyle karar hizalaması için ortak panel sunar.</p>
            </article>
            <article className="rounded-lg border border-amber-500/35 bg-amber-500/10 p-3 text-sm text-amber-100">
              <h3 className="text-xs font-black uppercase tracking-[0.12em]">Dürüst sınır</h3>
              <p className="mt-2">Bankable etüt değildir; lisanslı mühendislik hesapları ve resmi kurum görüşleri gereklidir.</p>
            </article>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
            <p className="text-sm text-amber-100">Katman skorunu yatırım komitesi raporuna taşıyın.</p>
            <Button type="button" className="bg-amber-300 text-slate-900 hover:bg-amber-200">
              Analizi başlat <ArrowRight className="rtl:rotate-180 ms-1.5 h-4 w-4" />
            </Button>
          </div>
        </ModulePanel>
      </div>
    </ModuleShell>
  );
}
