import { useMemo, useState } from "react";
import { Lightbulb } from "lucide-react";
import { ModulePanel, ModulePdfCta, ModuleShell, ModuleStatGrid } from "./ModuleShell";
import { calculateInvestmentReturns } from "@/lib/calculators/investmentReturnsEngine";

export default function YatirimOnerisiPage() {
  const [priceTry, setPriceTry] = useState("6200000");
  const [monthlyRentTry, setMonthlyRentTry] = useState("38000");
  const [annualExpenseTry, setAnnualExpenseTry] = useState("110000");
  const [annualAppreciationPct, setAnnualAppreciationPct] = useState("12");
  const [holdingYears, setHoldingYears] = useState("5");
  const [city, setCity] = useState<"istanbul" | "tr">("istanbul");

  const result = useMemo(
    () =>
      calculateInvestmentReturns({
        propertyPriceTry: Math.max(1, Number(priceTry) || 1),
        monthlyRentTry: Math.max(0, Number(monthlyRentTry) || 0),
        annualExpensesTry: Math.max(0, Number(annualExpenseTry) || 0),
        annualAppreciationPct: Number(annualAppreciationPct) || 0,
        holdingYears: Math.max(1, Number(holdingYears) || 1),
        city,
      }),
    [priceTry, monthlyRentTry, annualExpenseTry, annualAppreciationPct, holdingYears, city],
  );

  const stats = [
    { label: "Brüt kira getirisi", value: `%${result.grossYieldPct.toFixed(2)}`, hint: "Yıllık kira / fiyat" },
    { label: "Net kira getirisi", value: `%${result.netYieldPct.toFixed(2)}`, hint: "Giderler düşülü" },
    { label: "Kira çarpanı", value: `${result.rentMultiplierMonths.toFixed(1)} ay`, hint: `${result.referenceMultiplierMonths} ay referans` },
    { label: "Toplam ROI", value: `%${result.roiPct.toFixed(2)}`, hint: "Kira + değer artışı" },
  ];

  return (
    <ModuleShell
      title="Yatırım Önerisi"
      subtitle="Kira getirisi, kira çarpanı, geri dönüş süresi ve ROI'yi gerçek formülle hesaplayan yatırım motoru."
      icon={Lightbulb}
      badge="Yatırım Karar Motoru"
    >
      <section className="mod-hero-panel">
        <h2>Formül seti</h2>
        <p>
          Brüt getiri = yıllık kira / fiyat · Net getiri = (yıllık kira - gider) / fiyat ·
          ROI = (kira geliri + değer artışı) / fiyat. Kira çarpanı referansı: TR 214 ay, İstanbul 212 ay.
        </p>
      </section>

      <div className="mod-layout mod-layout--split">
        <ModulePanel title="Girdi">
          <form className="mod-form-grid">
            <div>
              <label htmlFor="yo-price">Fiyat (TL)</label>
              <input id="yo-price" value={priceTry} onChange={(e) => setPriceTry(e.target.value)} />
            </div>
            <div>
              <label htmlFor="yo-rent">Aylık kira (TL)</label>
              <input id="yo-rent" value={monthlyRentTry} onChange={(e) => setMonthlyRentTry(e.target.value)} />
            </div>
            <div>
              <label htmlFor="yo-exp">Yıllık gider (TL)</label>
              <input id="yo-exp" value={annualExpenseTry} onChange={(e) => setAnnualExpenseTry(e.target.value)} />
            </div>
            <div>
              <label htmlFor="yo-app">Yıllık değer artışı (%)</label>
              <input id="yo-app" value={annualAppreciationPct} onChange={(e) => setAnnualAppreciationPct(e.target.value)} />
            </div>
            <div>
              <label htmlFor="yo-years">Vade (yıl)</label>
              <input id="yo-years" value={holdingYears} onChange={(e) => setHoldingYears(e.target.value)} />
            </div>
            <div>
              <label htmlFor="yo-city">Karşılaştırma seti</label>
              <select id="yo-city" value={city} onChange={(e) => setCity(e.target.value as "istanbul" | "tr")}>
                <option value="istanbul">İstanbul (212 ay)</option>
                <option value="tr">Türkiye (214 ay)</option>
              </select>
            </div>
          </form>
        </ModulePanel>

        <ModulePanel title="Sonuç">
          <ModuleStatGrid stats={stats} />
          <div className="mod-note-box">
            <p>
              Geri dönüş süresi: <strong data-testid="investment-payback">{Number.isFinite(result.paybackYears) ? `${result.paybackYears.toFixed(2)} yıl` : "hesaplanamıyor"}</strong>
            </p>
            <p className="mt-1">
              Kira çarpanı farkı: <strong data-testid="investment-multiplier-delta">{result.multiplierDeltaMonths >= 0 ? "+" : ""}{result.multiplierDeltaMonths.toFixed(1)} ay</strong> (referansa göre)
            </p>
          </div>
          <div className="mod-note-box mt-3">
            <p>Örnek: Fiyat 6.2M, kira 38K, gider 110K, artış %12, vade 5 yıl ile sonuçlar yukarıda otomatik güncellenir.</p>
          </div>
          <ModulePdfCta label="Yatırım metrikleri PDF" />
        </ModulePanel>
      </div>

      <section className="mod-note-box">
        <p>
          Dürüst sınır: Bu ekran yatırım tavsiyesi değildir; nihai karar için mali müşavir, değerleme uzmanı ve hukuki inceleme şarttır.
        </p>
        <p className="mt-1">CTA: Sonraki adım olarak Mortgage, Airbnb ve Vergi modülleriyle çapraz kontrol yapın.</p>
      </section>
    </ModuleShell>
  );
}
