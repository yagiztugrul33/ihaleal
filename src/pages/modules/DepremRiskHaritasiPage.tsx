import { lazy, Suspense } from "react";
import { ArrowRight, Map as MapIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ModulePanel, ModuleShell } from "./ModuleShell";
import { EarthquakeRiskWorkbench } from "@/components/risk/EarthquakeRiskWorkbench";

const DepremRiskHaritasiMapInner = lazy(() => import("./DepremRiskHaritasiMapInner"));

export default function DepremRiskHaritasiPage() {
  return (
    <ModuleShell
      title="Deprem Risk Haritası"
      subtitle="Tam ekran Leaflet bağlamında fay, deprem, zemin özeti ve ilan dayanıklılık seçkisini güvenliği bozmadan paralel olarak inceleyin."
      badge="Leaflet GIS"
      icon={MapIcon}
      iconAccent="text-rose-300"
    >
      <div className="space-y-4">
        <ModulePanel title="Neden deprem risk katmanı">
          <div className="space-y-3 text-sm leading-relaxed text-slate-300">
            <p>
              Risk yalnızca fay hattına bakılarak ölçülmez. TBDY 2018 yaklaşımında tehlike (PGA), zemin, sıvılaşma ve bina
              davranışı birlikte değerlendirilir. Bu modül bu katmanları tek puanda birleştirir.
            </p>
            <p>
              Yüksek skor = düşük risk bandı olacak şekilde 0-100 güven skoru üretilir. Katman katkıları açıklanabilir şekilde
              bar/radar görsellerine dökülür.
            </p>
          </div>
        </ModulePanel>

        <EarthquakeRiskWorkbench title="TBDY 2018 katmanlı deprem risk analizi" compact />

        <ModulePanel title="Gerçek zamanlı harita yüzeyi ve katman seçiciler">
          <p className="mb-4 text-sm leading-relaxed text-slate-400">
            Harita katmanı, noktasal risk sorgusunu mekansal bağlama taşır. Fay yakınlığı, zemin sınıfı ve yapı yoğunluğu
            aynı ekranda birlikte okunur.
          </p>
          <Suspense
            fallback={
              <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-white/15 bg-slate-950/50 text-sm text-slate-400">
                Harita yükleniyor — katman seçicisi ve bağlantılar hazırlandığında yüzeye oturur…
              </div>
            }
          >
            <DepremRiskHaritasiMapInner />
          </Suspense>
        </ModulePanel>

        <ModulePanel title="Yöntem, terimler ve karar disiplini">
          <div className="grid gap-3 lg:grid-cols-2">
            <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-300">
              <h3 className="text-xs font-black uppercase tracking-[0.12em] text-rose-200">TBDY 2018 okuma notu</h3>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Fay + PGA tek başına yeterli değildir; zemin sınıfı ve yapı davranışı birlikte okunur.</li>
                <li>SPT N1,60&lt;30 bandı, sıvılaşma hassasiyetini belirgin artırır.</li>
                <li>Yumuşak kat ve kat adedi yükseldikçe yapısal katman puanı düşebilir.</li>
              </ul>
            </article>
            <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-300">
              <h3 className="text-xs font-black uppercase tracking-[0.12em] text-rose-200">Terimler</h3>
              <p className="mt-2"><strong className="text-slate-100">PGA:</strong> beklenen yer ivmesi; tehlike katmanının ana girdisidir.</p>
              <p className="mt-1"><strong className="text-slate-100">FS/F1:</strong> TBDY spektral katsayıları; zemin etkisini büyütebilir.</p>
              <p className="mt-1"><strong className="text-slate-100">SPT N1,60:</strong> zemin dayanım göstergesi; düşükse sıvılaşma riski artar.</p>
            </article>
          </div>
        </ModulePanel>

        <div className="grid gap-3 lg:grid-cols-3">
          <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-200">
            <h3 className="text-xs font-black uppercase tracking-[0.12em] text-rose-200">Örnek</h3>
            <p className="mt-2">Skor 72/100: orta-iyi band. Yine de zemin etüdü + taşıyıcı sistem doğrulaması olmadan karar verilmez.</p>
          </article>
          <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-200">
            <h3 className="text-xs font-black uppercase tracking-[0.12em] text-rose-200">Kime göre</h3>
            <p className="mt-2">Alıcı: hasar riski. Satıcı: güven artırıcı rapor. Yatırımcı: güçlendirme maliyet etkisi.</p>
          </article>
          <article className="rounded-lg border border-amber-500/35 bg-amber-500/10 p-3 text-sm text-amber-100">
            <h3 className="text-xs font-black uppercase tracking-[0.12em]">Dürüst sınır</h3>
            <p className="mt-2">Bu çıktı ön analizdir. Lisanslı jeoloji/inşaat mühendisliği zemin etüdü ve performans raporu şarttır.</p>
          </article>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3">
          <p className="text-sm text-rose-100">Bina risk sorgusuna geçip katman skorunu adım adım raporlayın.</p>
          <Button asChild className="bg-rose-300 text-slate-900 hover:bg-rose-200">
            <Link to="/modul/bina-risk-sorgu">
              Risk sorgusu başlat <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </ModuleShell>
  );
}
