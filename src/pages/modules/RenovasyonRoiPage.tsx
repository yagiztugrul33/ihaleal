import { useMemo, useState } from "react";
import { Hammer } from "lucide-react";
import { ModulePanel, ModulePdfCta, ModuleShell, ModuleStatGrid } from "./ModuleShell";
import { calculateRenovationRoi } from "@/lib/calculators/renovationRoiEngine";

export default function RenovasyonRoiPage() {
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
      badge="Renovasyon Getiri Motoru"
    >
      <section className="mod-hero-panel">
        <h2>Formül</h2>
        <p>
          ROI = (değer artışı - renovasyon maliyeti) / renovasyon maliyeti. Pozitif ROI değer yaratır, negatif ROI yatırımın
          maliyeti karşılamadığını gösterir.
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
    </ModuleShell>
  );
}
