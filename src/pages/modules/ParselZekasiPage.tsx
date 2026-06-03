import { ArrowRight, MapPin } from "lucide-react";
import { ModulePanel, ModuleShell } from "./ModuleShell";
import { LocationIntelligenceWorkbench } from "@/components/location/LocationIntelligenceWorkbench";
import { Button } from "@/components/ui/button";

export default function ParselZekasiPage() {
  return (
    <ModuleShell
      title="Parsel Zekası"
      subtitle="Konum zekası katmanlarıyla bir parselin çevresel değerini SES, erişim, eğitim ve güvenlik kırılımında analiz edin."
      icon={MapPin}
      iconAccent="text-cyan-300"
      badge="GIS + AI"
    >
      <div className="space-y-4">
        <ModulePanel title="Neden Konum Zekası">
          <div className="space-y-3 text-sm leading-relaxed text-slate-300">
            <p>
              Hedonik teoriye göre mülk fiyatının belirleyici kısmı komşuluk ve erişim kalitesinden gelir. Bu nedenle ada/parsel kararında
              sadece EMSAL değil, çevresel sinyaller de zorunlu olarak birlikte okunmalıdır.
            </p>
            <p>
              Bu modül, katmanlı veri zekası yaklaşımıyla ön analiz üretir: SES, POI erişimi, eğitim ve güvenlik skorları
              ağırlıklı birleşik bir konum puanına dönüşür.
            </p>
          </div>
        </ModulePanel>

        <ModulePanel title="Katmanlar">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-sm text-slate-200">
            <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-cyan-200">SES</p>
              <p className="mt-1">SEGE + TÜİK mantığıyla gelir, eğitim ve meslek kompozisyonu.</p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-cyan-200">POI / erişim</p>
              <p className="mt-1">Market, okul, hastane, metro ve park erişimi; toplu taşıma en güçlü pozitif etki.</p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-cyan-200">Eğitim</p>
              <p className="mt-1">Okul yoğunluğu, mesafe ve bölgesel eğitim seviyesi birlikte değerlendirilir.</p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-cyan-200">Güvenlik</p>
              <p className="mt-1">Proxy güvenlik sinyalleri (aydınlatma, müdahale süresi, risk göstergeleri).</p>
            </div>
          </div>
        </ModulePanel>

        <LocationIntelligenceWorkbench title="Konum/parsel gir, katman skorlarını üret" compact />

        <ModulePanel title="Örnek ve Dürüst Sınır">
          <div className="grid gap-3 lg:grid-cols-3">
            <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-200">
              <h3 className="text-xs font-black uppercase tracking-[0.12em] text-cyan-200">Örnek analiz</h3>
              <p className="mt-2">
                Kadıköy örneğinde metroya yakınlık ve okul yoğunluğu artarken birleşik skor yükselir; güvenlik proxy zayıfsa nihai skor
                baskılanır.
              </p>
            </article>
            <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-200">
              <h3 className="text-xs font-black uppercase tracking-[0.12em] text-cyan-200">Kime göre</h3>
              <p className="mt-2">Alıcı aşırı ödeme riskini, satıcı konumsal primini, yatırımcı fırsat ve risk dengesini görür.</p>
            </article>
            <article className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-100">
              <h3 className="text-xs font-black uppercase tracking-[0.12em]">Veri kaynağı + sınır</h3>
              <p className="mt-2">
                Demo + kamuya açık veri ile ön analizdir. Canlıda TÜİK/SEGE resmi entegrasyon ve yerel doğrulama olmadan kesin karar
                verilmemelidir.
              </p>
            </article>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-3">
            <p className="text-sm text-cyan-100">Katman skorlarını imar ve fizibilite raporuna taşıyarak tek panel karar akışı kurun.</p>
            <Button type="button" className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">
              Değerleme başlat <ArrowRight className="rtl:rotate-180 ms-1.5 h-4 w-4" />
            </Button>
          </div>
        </ModulePanel>
      </div>
    </ModuleShell>
  );
}
