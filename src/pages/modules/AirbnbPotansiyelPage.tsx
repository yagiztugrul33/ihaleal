import { useMemo, useState } from "react";
import { BedDouble } from "lucide-react";
import { ModulePanel, ModulePdfCta, ModuleShell, ModuleStatGrid } from "./ModuleShell";
import { calculateAirbnbPotential } from "@/lib/calculators/airbnbEngine";

export default function AirbnbPotansiyelPage() {
  const [nightlyRate, setNightlyRate] = useState("3200");
  const [occupancyRate, setOccupancyRate] = useState("68");
  const [cleaningPerStay, setCleaningPerStay] = useState("1200");
  const [staysPerYear, setStaysPerYear] = useState("85");
  const [platformCommissionPct, setPlatformCommissionPct] = useState("18");
  const [annualOperatingCost, setAnnualOperatingCost] = useState("210000");
  const [vacancyReservePct, setVacancyReservePct] = useState("8");
  const [longTermMonthlyRent, setLongTermMonthlyRent] = useState("42000");

  const result = useMemo(
    () =>
      calculateAirbnbPotential({
        nightlyRateTry: Number(nightlyRate) || 0,
        occupancyRatePct: Number(occupancyRate) || 0,
        cleaningCostPerStayTry: Number(cleaningPerStay) || 0,
        expectedStaysPerYear: Number(staysPerYear) || 0,
        platformCommissionRatePct: Number(platformCommissionPct) || 0,
        annualOperatingCostTry: Number(annualOperatingCost) || 0,
        vacancyReserveRatePct: Number(vacancyReservePct) || 0,
        longTermMonthlyRentTry: Number(longTermMonthlyRent) || 0,
      }),
    [nightlyRate, occupancyRate, cleaningPerStay, staysPerYear, platformCommissionPct, annualOperatingCost, vacancyReservePct, longTermMonthlyRent],
  );

  const stats = [
    { label: "Yıllık brüt gelir", value: `${Math.round(result.annualGrossRevenueTry).toLocaleString("tr-TR")} TL`, hint: "Gecelik × doluluk × 365" },
    { label: "Yıllık net gelir", value: `${Math.round(result.annualNetRevenueTry).toLocaleString("tr-TR")} TL`, hint: "Temizlik+komisyon+işletme+boşluk düşülü" },
    { label: "Uzun dönem kira", value: `${Math.round(result.longTermAnnualRentTry).toLocaleString("tr-TR")} TL`, hint: "Aylık × 12" },
    { label: "Fark", value: `${Math.round(result.differenceVsLongTermTry).toLocaleString("tr-TR")} TL`, hint: "Kısa dönem - uzun dönem" },
  ];

  return (
    <ModuleShell
      title="Airbnb Potansiyeli"
      subtitle="Kısa dönem kira gelirini gerçek formülle hesaplar ve uzun dönem kira ile kıyaslar."
      icon={BedDouble}
      badge="Kısa Dönem Gelir Motoru"
    >
      <section className="mod-hero-panel">
        <h2>Formül seti</h2>
        <p>
          Yıllık gelir = gecelik × doluluk × 365. Net gelir = brüt - (temizlik + platform komisyonu + işletme + boşluk rezervi).
          Sonuç, uzun dönem kira ile aynı ekranda kıyaslanır.
        </p>
      </section>

      <div className="mod-layout mod-layout--split">
        <ModulePanel title="Girdi">
          <form className="mod-form-grid">
            <div>
              <label htmlFor="ab-night">Gecelik fiyat (TL)</label>
              <input id="ab-night" value={nightlyRate} onChange={(e) => setNightlyRate(e.target.value)} />
            </div>
            <div>
              <label htmlFor="ab-occ">Doluluk (%)</label>
              <input id="ab-occ" value={occupancyRate} onChange={(e) => setOccupancyRate(e.target.value)} />
            </div>
            <div>
              <label htmlFor="ab-clean">Temizlik / konaklama (TL)</label>
              <input id="ab-clean" value={cleaningPerStay} onChange={(e) => setCleaningPerStay(e.target.value)} />
            </div>
            <div>
              <label htmlFor="ab-stays">Yıllık konaklama adedi</label>
              <input id="ab-stays" value={staysPerYear} onChange={(e) => setStaysPerYear(e.target.value)} />
            </div>
            <div>
              <label htmlFor="ab-com">Platform komisyonu (%)</label>
              <input id="ab-com" value={platformCommissionPct} onChange={(e) => setPlatformCommissionPct(e.target.value)} />
            </div>
            <div>
              <label htmlFor="ab-op">Yıllık işletme gideri (TL)</label>
              <input id="ab-op" value={annualOperatingCost} onChange={(e) => setAnnualOperatingCost(e.target.value)} />
            </div>
            <div>
              <label htmlFor="ab-vac">Boşluk rezervi (%)</label>
              <input id="ab-vac" value={vacancyReservePct} onChange={(e) => setVacancyReservePct(e.target.value)} />
            </div>
            <div>
              <label htmlFor="ab-ltr">Uzun dönem aylık kira (TL)</label>
              <input id="ab-ltr" value={longTermMonthlyRent} onChange={(e) => setLongTermMonthlyRent(e.target.value)} />
            </div>
          </form>
        </ModulePanel>

        <ModulePanel title="Sonuç">
          <ModuleStatGrid stats={stats} />
          <div className="mod-note-box">
            <p>
              Temizlik gideri: <strong>{Math.round(result.annualCleaningCostTry).toLocaleString("tr-TR")} TL</strong> ·
              Komisyon: <strong> {Math.round(result.annualCommissionTry).toLocaleString("tr-TR")} TL</strong> ·
              Boşluk rezervi: <strong> {Math.round(result.annualVacancyReserveTry).toLocaleString("tr-TR")} TL</strong>
            </p>
            <p className="mt-1">
              Net gelir testi: <strong data-testid="airbnb-net">{Math.round(result.annualNetRevenueTry).toLocaleString("tr-TR")} TL</strong>
            </p>
          </div>
          <div className="mod-note-box mt-3">
            <p>Örnek: 3.200 TL gecelik ve %68 dolulukta model farklı girdilerde otomatik farklı sonuç üretir.</p>
          </div>
          <ModulePdfCta label="Airbnb potansiyel raporu PDF" />
        </ModulePanel>
      </div>

      <section className="mod-note-box">
        <p>
          Dürüst sınır: Bu çıktı ön analizdir; belediye kısıtları, ruhsat ve vergi yükümlülükleri ayrıca teyit edilmelidir.
        </p>
        <p className="mt-1">CTA: Vergi simülatörü ve yatırım önerisi modülleriyle birleşik karar tablosu oluşturun.</p>
      </section>
    </ModuleShell>
  );
}
