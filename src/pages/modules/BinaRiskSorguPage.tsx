import { ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ModulePanel, ModuleShell } from "./ModuleShell";
import { EarthquakeRiskWorkbench } from "@/components/risk/EarthquakeRiskWorkbench";

export default function BinaRiskSorguPage() {
  return (
    <ModuleShell
      title="Bina Risk Sorgu"
      subtitle="TBDY 2018 katmanlarıyla fay, zemin, sıvılaşma ve yapı davranışını tek risk skorunda birleştiren sorgu sihirbazı."
      icon={ShieldCheck}
      iconAccent="text-rose-300"
      badge="Deprem Risk Motoru"
    >
      <div className="space-y-4">
        <ModulePanel title="Neden bu sorgu gerekli">
          <div className="space-y-3 text-sm leading-relaxed text-slate-300">
            <p>
              Bina riski tek bir değişkenle ölçülemez. Fay mesafesi ve PGA tehlikesi, zemin sınıfı, sıvılaşma olasılığı ve
              yapısal durum birlikte okunmadığında sahte güven oluşur.
            </p>
            <p>
              Bu ekran, her katmanı 0-100 skorlayıp ağırlıklı birleşik puan verir. Katkı dökümü sayesinde riskin hangi
              faktörde yoğunlaştığı şeffaf biçimde görünür.
            </p>
          </div>
        </ModulePanel>

        <EarthquakeRiskWorkbench title="Bina risk sorgu sihirbazı" />

        <div className="grid gap-3 lg:grid-cols-3">
          <article className="rounded-[10px] border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-200">
            <h3 className="text-xs font-normal uppercase tracking-[0.12em] text-rose-200">Örnek</h3>
            <p className="mt-2">
              Örnek bir yapıda skor 72/100 çıktığında risk “orta-iyi” bandındadır; yine de saha zemin etüdü ve
              performans raporu olmadan nihai karar verilmez.
            </p>
          </article>
          <article className="rounded-[10px] border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-200">
            <h3 className="text-xs font-normal uppercase tracking-[0.12em] text-rose-200">Kime göre</h3>
            <p className="mt-2">Alıcı: gizli riskleri görür. Satıcı: güçlendirme etkisini ölçer. Yatırımcı: maliyet/risk dengesini hesaplar.</p>
          </article>
          <article className="rounded-[10px] border border-amber-500/35 bg-amber-500/10 p-3 text-sm text-amber-100">
            <h3 className="text-xs font-normal uppercase tracking-[0.12em]">Dürüst sınır</h3>
            <p className="mt-2">
              Ön analizdir. Resmi işlem için lisanslı jeoloji mühendisliği zemin etüdü ve inşaat mühendisliği performans
              değerlendirmesi zorunludur.
            </p>
          </article>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-rose-500/30 bg-rose-500/10 p-3">
          <p className="text-sm text-rose-100">Risk skorunu harita katmanında doğrulayarak mahalle ölçeğinde karşılaştırın.</p>
          <Link
            to="/modul/deprem-risk-haritasi"
            data-slot="button"
            style={{ color: "#0f172a", backgroundColor: "#fecdd3" }}
            className="inline-flex items-center gap-1.5 rounded-[10px] px-4 py-2 text-sm font-normal shadow transition-colors hover:opacity-90"
          >
            Haritayı aç <ArrowRight className="rtl:rotate-180 ms-1.5 h-4 w-4" />
          </Link>
        </div>
      </div>
    </ModuleShell>
  );
}
