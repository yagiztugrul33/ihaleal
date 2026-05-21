import { useState } from "react";
import { Calculator, Sun, Zap } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ModuleDataTable, ModulePanel, ModulePdfCta, ModuleShell, ModuleStatGrid, ModuleTag } from "./ModuleShell";

type YearRow = { id: string; yil: string; uretim: string; gelir: string; opex: string; net: string };

const MOCK_YEARS: YearRow[] = [
  { id: "1", yil: "2026", uretim: "8.420 MWh", gelir: "23,6M TRY", opex: "1,8M TRY", net: "21,8M TRY" },
  { id: "2", yil: "2027", uretim: "8.510 MWh", gelir: "24,1M TRY", opex: "1,9M TRY", net: "22,2M TRY" },
  { id: "3", yil: "2028", uretim: "8.390 MWh", gelir: "23,9M TRY", opex: "2,0M TRY", net: "21,9M TRY" },
  { id: "4", yil: "2029", uretim: "8.480 MWh", gelir: "24,4M TRY", opex: "2,0M TRY", net: "22,4M TRY" },
  { id: "5", yil: "2030", uretim: "8.360 MWh", gelir: "24,0M TRY", opex: "2,1M TRY", net: "21,9M TRY" },
  { id: "6", yil: "2031", uretim: "8.450 MWh", gelir: "24,5M TRY", opex: "2,1M TRY", net: "22,4M TRY" },
  { id: "7", yil: "2032", uretim: "8.330 MWh", gelir: "24,1M TRY", opex: "2,2M TRY", net: "21,9M TRY" },
  { id: "8", yil: "2033", uretim: "8.420 MWh", gelir: "24,6M TRY", opex: "2,2M TRY", net: "22,4M TRY" },
  { id: "9", yil: "2034", uretim: "8.300 MWh", gelir: "24,2M TRY", opex: "2,3M TRY", net: "21,9M TRY" },
];

const CHART = MOCK_YEARS.map((r) => ({ yil: r.yil, net: Number(r.net.replace(/[^\d,]/g, "").replace(",", ".")) / 10 }));

export default function GesAnaliziModulPage() {
  const [kwp, setKwp] = useState("5000");
  const [arazi, setArazi] = useState("85000");
  const [ghi, setGhi] = useState("1780");
  const [fiyat, setFiyat] = useState("2,85");
  const [result, setResult] = useState(true);

  const stats = [
    { label: "IRR (10 yil)", value: "%14,2", hint: "Iskonto %10" },
    { label: "NPV", value: "48,6M TRY", hint: "Vergi oncesi" },
    { label: "LCOE", value: "1,42 TRY/kWh", hint: "550Wp modul" },
    { label: "Geri Odeme", value: "6,8 yil", hint: "Basabas + %15" },
  ];

  return (
    <ModuleShell
      title="GES Analizi"
      subtitle="Arazi buyuklugu, DC kapasite ve GHI verileriyle on fizibilite, nakit akisi ve yatirim skorunu hesaplayin."
      icon={Sun}
      iconAccent="text-amber-300"
      badge="Muhendislik Modulu"
    >
      <div className="mod-layout mod-layout--split">
        <ModulePanel title="Proje Parametreleri">
          <form
            className="mod-form-grid"
            onSubmit={(e) => {
              e.preventDefault();
              setResult(true);
            }}
          >
            <div>
              <label htmlFor="ges-kwp">DC Kapasite (kWp)</label>
              <input id="ges-kwp" value={kwp} onChange={(e) => setKwp(e.target.value)} />
            </div>
            <div>
              <label htmlFor="ges-arazi">Arazi (m2)</label>
              <input id="ges-arazi" value={arazi} onChange={(e) => setArazi(e.target.value)} />
            </div>
            <div>
              <label htmlFor="ges-ghi">Yillik GHI (kWh/m2)</label>
              <input id="ges-ghi" value={ghi} onChange={(e) => setGhi(e.target.value)} />
            </div>
            <div>
              <label htmlFor="ges-fiyat">Elektrik Satis (TRY/kWh)</label>
              <input id="ges-fiyat" value={fiyat} onChange={(e) => setFiyat(e.target.value)} />
            </div>
            <div className="mod-form-actions">
              <button type="submit" className="mod-btn-primary">
                <Calculator className="h-4 w-4" /> Hesapla
              </button>
            </div>
          </form>
        </ModulePanel>

        {result ? (
          <ModulePanel
            title="On Fizibilite Sonuclari"
            action={
              <span className="inline-flex items-center gap-1 text-xs text-amber-200">
                <Zap className="h-3.5 w-3.5" /> {kwp} kWp senaryo
              </span>
            }
          >
            <ModuleStatGrid stats={stats} />
            <ModuleDataTable
              caption="10 yillik nakit akisi"
              columns={[
                { key: "yil", header: "Yil", render: (r) => r.yil },
                { key: "uretim", header: "Uretim", render: (r) => r.uretim },
                { key: "gelir", header: "Gelir", render: (r) => r.gelir },
                { key: "opex", header: "OPEX", render: (r) => r.opex },
                {
                  key: "net",
                  header: "Net",
                  render: (r) => <ModuleTag tone="ok">{r.net}</ModuleTag>,
                },
              ]}
              rows={MOCK_YEARS}
            />
            <div className="mod-chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={CHART}>
                  <XAxis dataKey="yil" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
                  <Line type="monotone" dataKey="net" stroke="#fbbf24" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <ModulePdfCta label="GES muhendislik raporu PDF" />
          </ModulePanel>
        ) : (
          <div className="mod-empty">Saha parametrelerini girin; üretim potansiyeli, geri ödeme süresi ve gelir bandı hesaplamasını aynı akışta başlatın.</div>
        )}
      </div>
    </ModuleShell>
  );
}
