import { lazy, Suspense } from "react";
import { Map as MapIcon } from "lucide-react";
import { ModulePanel, ModuleShell } from "./ModuleShell";

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
      <ModulePanel title="Gerçek zamanlı harita yüzeyi ve katman seçiciler">
        <p className="mb-4 text-sm leading-relaxed text-slate-400">
          Harita chunk’ı gerektiğinde yüklenir; çevrim içi bağlamda daha hızlı açılması için daha önce ziyaret
          ettiğiniz sayfayı önbellekten okuyarak OSM karolarını tutarınız düşmez. Mobil cihazlarda tek parmak iki
          parmak yakınlaştırmasını kullanınız — masaüstünde ise tekerlek ile hassas yakınlık yakalayabilirsiniz.
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
    </ModuleShell>
  );
}
