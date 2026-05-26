import { useMemo, useState } from "react";
import { Hammer } from "lucide-react";
import { ModulePanel, ModulePdfCta, ModuleShell, ModuleStatGrid } from "./ModuleShell";
import { calculateRenovationRoi } from "@/lib/calculators/renovationRoiEngine";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function RenovasyonRoiPage() {
  const envReady = isSupabaseConfigured();
  const [renovationCostTry, setRenovationCostTry] = useState("1200000");
  const [valueIncreaseTry, setValueIncreaseTry] = useState("1850000");

  const result = useMemo(
    () =>
      calculateRenovationRoi({
        renovationCostTry: Math.max(1, Number(renovationCostTry) || 1),
        valueIncreaseTry: Number(valueIncreaseTry) || 0,
      }),
    [renovationCostTry, valueIncreaseTry],
  );

  const stats = [
    { label: "Renovasyon maliyeti", value: `${Math.round(Number(renovationCostTry) || 0).toLocaleString("tr-TR")} TL`, hint: "Toplam harcama" },
    { label: "Değer artışı", value: `${Math.round(Number(valueIncreaseTry) || 0).toLocaleString("tr-TR")} TL`, hint: "Ekspertiz sonrası artış" },
    { label: "Net kâr", value: `${Math.round(result.netProfitTry).toLocaleString("tr-TR")} TL`, hint: "Değer artışı - maliyet" },
    { label: "ROI", value: `%${result.roiPct.toFixed(2)}`, hint: "(Değer artışı - maliyet) / maliyet" },
  ];

  return (
    <ModuleShell
      title="Renovasyon ROI"
      subtitle="ROI=(değer artışı - maliyet) / maliyet formülüyle gerçek renovasyon getirisini hesaplar."
      icon={Hammer}
      iconAccent="text-orange-300"
      badge="Renovasyon Getiri Motoru"
    >
      {!envReady ? (
        <section className="mod-note-box">
          <p>
            Supabase ortamı olmadan bu ekran demo hesaplama modunda çalışır. Boş ekran yerine formül, senaryo ve karar notları aktif kalır.
          </p>
        </section>
      ) : null}
      <section className="mod-hero-panel">
        <h2>Formül</h2>
        <p>
          ROI = (değer artışı - renovasyon maliyeti) / renovasyon maliyeti. Pozitif ROI değer yaratır, negatif ROI yatırımın
          maliyeti karşılamadığını gösterir.
        </p>
        <p className="mt-2 text-xs text-slate-300">
          Not: Nominal ROI tek başına yeterli değildir; KFE 2026 gibi enflasyon etkisiyle reel ROI ayrıca yorumlanmalıdır.
        </p>
      </section>

      <div className="mod-layout mod-layout--split">
        <ModulePanel title="Girdi">
          <form className="mod-form-grid">
            <div>
              <label htmlFor="rn-cost">Renovasyon maliyeti (TL)</label>
              <input id="rn-cost" value={renovationCostTry} onChange={(e) => setRenovationCostTry(e.target.value)} />
            </div>
            <div>
              <label htmlFor="rn-inc">Beklenen değer artışı (TL)</label>
              <input id="rn-inc" value={valueIncreaseTry} onChange={(e) => setValueIncreaseTry(e.target.value)} />
            </div>
          </form>
        </ModulePanel>

        <ModulePanel title="Sonuç">
          <ModuleStatGrid stats={stats} />
          <div className="mod-note-box">
            <p>
              Örnek senaryo: 1.2M TL maliyet ve 1.85M TL değer artışı için ROI = %<strong data-testid="renovation-roi">{result.roiPct.toFixed(2)}</strong>.
            </p>
          </div>
          <ModulePdfCta label="Renovasyon ROI raporu PDF" />
        </ModulePanel>
      </div>

      <section className="mod-note-box">
        <p>
          Dürüst sınır: Nihai satış fiyatı, bölgesel talep, işçilik kalitesi ve ekspertiz raporuna göre değişebilir. Kesin karar
          öncesi uzman görüşü alın.
        </p>
        <p className="mt-1">CTA: Yatırım önerisi ve vergi simülatörü ile toplam yatırım döngüsünü birlikte hesaplayın.</p>
      </section>
      <section className="mod-hero-panel">
        <h2>Karar metni (hesaplama sonrası)</h2>
        <div className="grid gap-3 md:grid-cols-3 text-sm text-slate-300">
          <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
            <p className="font-semibold text-slate-100">ROI pozitif ama düşükse</p>
            <p className="mt-1">İşçilik kalemi ve satış süresi riskini yeniden modelleyin; acele yatırım kararı vermeyin.</p>
          </article>
          <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
            <p className="font-semibold text-slate-100">ROI yüksekse</p>
            <p className="mt-1">Deprem riski, hukuki uygunluk ve finansman maliyetini birlikte doğrulayarak teklif aşamasına geçin.</p>
          </article>
          <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
            <p className="font-semibold text-slate-100">ROI negatifse</p>
            <p className="mt-1">Proje kapsamını küçültün veya alternatif kullanım senaryosu (kiralama/segment değişimi) değerlendirin.</p>
          </article>
        </div>
      </section>
      <section className="mod-note-box">
        <p className="font-semibold text-slate-100">Kime göre</p>
        <p className="mt-1">
          Satıcı için renovasyon bütçe sınırı, yatırımcı için geri dönüş eşiği, danışman için fiyatlama anlatısı üretir.
        </p>
      </section>
      <section className="mod-note-box">
        <p className="font-semibold text-slate-100">SSS</p>
        <p className="mt-1">ROI neden yüksek görünür? -&gt; Gider kalemleri eksik girildiğinde sonuç yapay olarak şişebilir.</p>
        <p className="mt-1">Reel getiri nasıl okunur? -&gt; Enflasyon etkisi düşülerek ikinci tur değerlendirme yapılmalıdır.</p>
        <p className="mt-1">Sonraki adım? -&gt; Kredi ve vergi simülatörüyle toplam yatırım döngüsünü birleştirin.</p>
      </section>
      <section className="mod-hero-panel">
        <h2>Kime göre</h2>
        <div className="grid gap-3 md:grid-cols-3 text-sm text-slate-300">
          <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
            <p className="font-semibold text-slate-100">Satıcı</p>
            <p className="mt-1">Hangi yenileme kaleminin fiyat algısına daha fazla katkı verdiğini görür.</p>
          </article>
          <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
            <p className="font-semibold text-slate-100">Yatırımcı</p>
            <p className="mt-1">Capex kararını geri dönüş süresi ve alternatif kullanım getirisi ile karşılaştırır.</p>
          </article>
          <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
            <p className="font-semibold text-slate-100">Danışman</p>
            <p className="mt-1">Müşteriye veri temelli fiyatlandırma ve pazarlık bandı önerisi sunar.</p>
          </article>
        </div>
        <p className="mt-3 text-sm text-slate-300">
          Çıktıyı satış öncesi checkliste bağlamak, renovasyon yatırımlarında sürpriz maliyet riskini düşürür.
        </p>
        <p className="mt-2 text-sm text-slate-300">Aynı zamanda teklif görüşmelerinde ortak bir fiyat dili oluşturur.</p>
        <p className="mt-2 text-sm text-slate-300">Karar döngüsü tamamlandığında yatırım planı daha öngörülebilir hale gelir.</p>
      </section>
    </ModuleShell>
  );
}
