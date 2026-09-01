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
      badge="Enerji Intelligence"
    >
      <div className="space-y-4">
        <ModulePanel title="Katman metodolojisi">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-sm text-slate-200">
            <div className="rounded-[10px] border border-slate-700 bg-slate-900/70 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--metin-ikincil)]">Solar</p>
              <p className="mt-1">GHI, üretim yoğunluğu ve ölçek uyumu ile saha enerji potansiyeli.</p>
            </div>
            <div className="rounded-[10px] border border-slate-700 bg-slate-900/70 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--metin-ikincil)]">Siting</p>
              <p className="mt-1">Eğim, trafo mesafesi ve imar uygunluğu üzerinden bağlantı fizibilitesi.</p>
            </div>
            <div className="rounded-[10px] border border-slate-700 bg-slate-900/70 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--metin-ikincil)]">Finans</p>
              <p className="mt-1">NPV, IRR, LCOE ve payback ile yatırım dayanıklılığı.</p>
            </div>
            <div className="rounded-[10px] border border-slate-700 bg-slate-900/70 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--metin-ikincil)]">Mevzuat</p>
              <p className="mt-1">5 MW lisanssız, 5.1.h, saatlik mahsuplaşma ve %1 KDV referansı.</p>
            </div>
          </div>
        </ModulePanel>

        <GesIntelligenceWorkbench title="GES modül simülatörü" compact />

        <ModulePanel title="Örnek ve dürüst sınır">
          <div className="grid gap-3 lg:grid-cols-3">
            <article className="rounded-[10px] border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-200">
              <h3 className="text-xs font-normal uppercase tracking-[0.12em] text-[var(--metin-ikincil)]">Örnek</h3>
              <p className="mt-2">10 dönüm ~1 MWp, uygun GHI ve kısa trafo mesafesiyle yaklaşık 4-6 yıl payback bandına yaklaşabilir.</p>
            </article>
            <article className="rounded-[10px] border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-200">
              <h3 className="text-xs font-normal uppercase tracking-[0.12em] text-[var(--metin-ikincil)]">Kime göre</h3>
              <p className="mt-2">Geliştirici, yatırımcı ve EPC ekiplerinin aynı veriyle karar hizalaması için ortak panel sunar.</p>
            </article>
            <article className="rounded-[10px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-3 text-sm text-[var(--metin-ikincil)]">
              <h3 className="text-xs font-normal uppercase tracking-[0.12em]">Dürüst sınır</h3>
              <p className="mt-2">Bankable etüt değildir; lisanslı mühendislik hesapları ve resmi kurum görüşleri gereklidir.</p>
            </article>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-3">
            <p className="text-sm text-[var(--metin-ikincil)]">Katman skorunu yatırım komitesi raporuna taşıyın.</p>
            <Button type="button" className="bg-[var(--zemin-yumusak)] text-slate-900 hover:bg-[var(--zemin-yumusak)]">
              Analizi başlat <ArrowRight className="rtl:rotate-180 ms-1.5 h-4 w-4" />
            </Button>
          </div>
        </ModulePanel>
      </div>
    </ModuleShell>
  );
}
