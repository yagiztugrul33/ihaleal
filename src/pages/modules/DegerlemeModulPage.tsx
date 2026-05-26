import { BarChart3, Scale, ShieldCheck } from "lucide-react";
import { ModulePanel, ModuleShell } from "./ModuleShell";
import { ValuationWorkbench } from "@/components/valuation/ValuationWorkbench";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function DegerlemeModulPage() {
  const envReady = isSupabaseConfigured();
  return (
    <ModuleShell
      title="Değerleme Modülü (AR-GE)"
      subtitle="Hedonik model, emsal eşleştirme, mekansal düzeltme ve güven aralığı ile ön değerleme laboratuvarı."
      icon={Scale}
      iconAccent="text-violet-300"
      badge="Ekspertiz AI"
    >
      <div className="space-y-4">
        {!envReady ? (
          <ModulePanel title="Ortam fallback bildirimi">
            <p className="text-sm text-amber-100">
              Supabase ortamı olmadığı için canlı veri kaydı yerine demo hesaplama katmanı çalışır. Boş ekran yerine tüm yöntem adımları
              ve örnek çıktı görünür.
            </p>
          </ModulePanel>
        ) : null}
        <ModulePanel title="Metodoloji Özeti">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-sm text-slate-200">
            <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-violet-200">Emsal yaklaşımı</p>
              <p className="mt-1">Benzer satılmış mülkler farklılık düzeltmesiyle normalize edilir.</p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-violet-200">Maliyet yaklaşımı</p>
              <p className="mt-1">Yeniden inşa maliyeti - yıpranma + arsa etkisi birlikte hesaplanır.</p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-violet-200">Gelir yaklaşımı</p>
              <p className="mt-1">Kira akışı kapitalizasyon oranı ile bugünkü değere çevrilir.</p>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-violet-200">AI katmanı</p>
              <p className="mt-1">Hedonik + mekansal model, SHAP benzeri katkı dökümü ile açıklanır.</p>
            </div>
          </div>
        </ModulePanel>

        <ValuationWorkbench title="Modül içi değerleme simülatörü" compact />
        <ModulePanel title="Karar çerçevesi (değerleme sonrası)">
          <div className="grid gap-3 md:grid-cols-2 text-sm text-slate-200">
            <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
              <h3 className="text-xs font-black uppercase tracking-[0.12em] text-violet-200">Karar adımı 1</h3>
              <p className="mt-2">Tahmini değer ile ilan fiyatı farkı okunur; aşırı sapma durumunda teklif limiti düşürülür.</p>
            </article>
            <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
              <h3 className="text-xs font-black uppercase tracking-[0.12em] text-violet-200">Karar adımı 2</h3>
              <p className="mt-2">AI güven aralığı dar değilse emsal sayısı artırılır ve ikinci tur kıyas yapılır.</p>
            </article>
            <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
              <h3 className="text-xs font-black uppercase tracking-[0.12em] text-violet-200">Karar adımı 3</h3>
              <p className="mt-2">Deprem ve hukuki katman skorları değerleme notuna eklenerek nihai teklif aralığı belirlenir.</p>
            </article>
            <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
              <h3 className="text-xs font-black uppercase tracking-[0.12em] text-violet-200">Karar adımı 4</h3>
              <p className="mt-2">Satıcı için rezerv fiyat, alıcı için maksimum teklif eşiği aynı panelde döküm halinde kaydedilir.</p>
            </article>
          </div>
        </ModulePanel>

        <ModulePanel title="Örnek Çalışma ve Kullanım">
          <div className="grid gap-3 lg:grid-cols-3">
            <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-200">
              <h3 className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.12em] text-violet-200">
                <BarChart3 className="h-3.5 w-3.5" />
                Örnek
              </h3>
              <p className="mt-2">
                Kadıköy 3+1 120m² 8 yaş → 14 emsal → tahmini değer ve ± band üretilir. Katkı dökümü:
                konum +%12, yaş -%8, m² +%20 gibi görünür.
              </p>
            </article>
            <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-200">
              <h3 className="text-xs font-black uppercase tracking-[0.12em] text-violet-200">Kime göre</h3>
              <p className="mt-2">Satıcı rezerv fiyat belirler, alıcı fazla ödeme riskini görür, yatırımcı fırsat filtresi yapar.</p>
            </article>
            <article className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-100">
              <h3 className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.12em]">
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
        <ModulePanel title="SSS">
          <div className="grid gap-3 md:grid-cols-3 text-sm text-slate-300">
            <article>
              <p className="font-semibold text-slate-100">AI çıktı tek başına yeterli mi?</p>
              <p className="mt-1">Hayır. Emsal ve uzman görüşü ile birlikte değerlendirilir.</p>
            </article>
            <article>
              <p className="font-semibold text-slate-100">Kime göre en kritik metrik?</p>
              <p className="mt-1">Yatırımcı için güven aralığı, satıcı için rezerv fiyat uyumu.</p>
            </article>
            <article>
              <p className="font-semibold text-slate-100">Sonraki adım ne?</p>
              <p className="mt-1">Teklif öncesi deprem risk ve hukuki kontrol sekmelerine geçilir.</p>
            </article>
          </div>
        </ModulePanel>
        <ModulePanel title="CTA ve operasyon bağı">
          <p className="text-sm text-slate-300">
            Değerleme çıktısını tek başına bırakmayın; deprem risk, hukuki uygunluk ve teklif modülüyle aynı işlem kaydında birleştirin.
          </p>
          <p className="mt-2 text-sm text-slate-300">
            Böylece fiyat kararı yalnızca tahmin değil, açıklanabilir ve denetlenebilir bir operasyon adımı haline gelir.
          </p>
          <div className="mt-3 grid gap-2 md:grid-cols-2 text-sm text-slate-300">
            <p className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
              Karar kaydı: rezerv fiyat, teklif tavanı ve risk notu tek kartta saklanır.
            </p>
            <p className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
              Ekip senkronu: satış, finans ve hukuk ekipleri aynı değerleme bağlamı üzerinden ilerler.
            </p>
          </div>
          <p className="mt-2 text-sm text-slate-300">
            Karar kalitesi hedefi: "tahmin doğruluğu" kadar "izlenebilir karar izi" üretmek.
          </p>
          <p className="mt-2 text-sm text-slate-300">
            Bu yaklaşım, model çıktısının denetlenebilir operasyon belgesine dönüşmesini sağlar.
          </p>
          <p className="mt-2 text-sm text-slate-300">Sonuçlar rol bazlı panel akışlarında aynı karar diliyle kullanılabilir.</p>
          <p className="mt-2 text-sm text-slate-300">Böylece model çıktısı, teklif kararında ekipler arası ortak referans olur.</p>
        </ModulePanel>
      </div>
    </ModuleShell>
  );
}
