import { useState } from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { Radar, RadarChart, PolarAngleAxis, PolarGrid, ResponsiveContainer, Tooltip } from "recharts";
import { ModuleDataTable, ModulePanel, ModulePdfCta, ModuleShell, ModuleStatGrid, ModuleTag } from "./ModuleShell";

type RiskRow = {
  id: string;
  tehdit: string;
  seviye: string;
  mesafe: string;
  olasilik: string;
  onlem: string;
};

const MOCK_RISK: RiskRow[] = [
  { id: "1", tehdit: "Deprem (PGA)", seviye: "Yuksek", mesafe: "—", olasilik: "%68", onlem: "Zemin etudu" },
  { id: "2", tehdit: "Heyelan", seviye: "Orta", mesafe: "1,2 km", olasilik: "%22", onlem: "Drainaj" },
  { id: "3", tehdit: "Sel / su baskini", seviye: "Dusuk", mesafe: "850 m", olasilik: "%12", onlem: "Kot kontrol" },
  { id: "4", tehdit: "Yangin riski", seviye: "Orta", mesafe: "—", olasilik: "%18", onlem: "Sigorta+" },
  { id: "5", tehdit: "Tsunami", seviye: "Dusuk", mesafe: "4,8 km", olasilik: "%4", onlem: "Evakuasyon" },
  { id: "6", tehdit: "Fay hatti", seviye: "Yuksek", mesafe: "2,4 km", olasilik: "—", onlem: "Yapisal guclendirme" },
  { id: "7", tehdit: "Erozyon", seviye: "Orta", mesafe: "600 m", olasilik: "%15", onlem: "Peyzaj" },
  { id: "8", tehdit: "Kimyasal tesis", seviye: "Dusuk", mesafe: "8,2 km", olasilik: "%3", onlem: "Bilgilendirme" },
  { id: "9", tehdit: "Orman yangini", seviye: "Orta", mesafe: "3,1 km", olasilik: "%11", onlem: "Temizlik alani" },
];

const RADAR = [
  { risk: "Deprem", skor: 82 },
  { risk: "Sel", skor: 28 },
  { risk: "Heyelan", skor: 45 },
  { risk: "Yangin", skor: 38 },
  { risk: "Tsunami", skor: 12 },
  { risk: "Erozyon", skor: 34 },
];

function levelTone(level: string): "ok" | "warn" | "risk" {
  if (level === "Dusuk") return "ok";
  if (level === "Orta") return "warn";
  return "risk";
}

export default function AfetRiskHaritasiPage() {
  const [lat, setLat] = useState("36,8969");
  const [lon, setLon] = useState("30,7133");
  const [result, setResult] = useState(true);

  const stats = [
    { label: "Genel Risk Skoru", value: "58 / 100", hint: "Agirlikli endeks" },
    { label: "PGA (475 yil)", value: "0,42 g", hint: "AFAD sinifi III" },
    { label: "Sigorta Prim Etkisi", value: "+%18", hint: "DASK + konut" },
    { label: "Guvenli Bolge", value: "2,1 km", hint: "Toplanma alani" },
  ];

  return (
    <ModuleShell
      title="Afet Risk Haritasi"
      subtitle="Deprem, sel, heyelan ve yangin katmanlarini birlestirerek lokasyon bazli afet risk profili cikarir."
      icon={ShieldAlert}
      iconAccent="text-red-300"
      badge="GIS Risk Katmani"
    >
      <div className="mod-layout mod-layout--split">
        <ModulePanel title="Konum Sorgusu">
          <form
            className="mod-form-grid"
            onSubmit={(e) => {
              e.preventDefault();
              setResult(true);
            }}
          >
            <div>
              <label htmlFor="af-lat">Enlem</label>
              <input id="af-lat" value={lat} onChange={(e) => setLat(e.target.value)} />
            </div>
            <div>
              <label htmlFor="af-lon">Boylam</label>
              <input id="af-lon" value={lon} onChange={(e) => setLon(e.target.value)} />
            </div>
            <div>
              <label htmlFor="af-adres">Adres notu</label>
              <textarea id="af-adres" placeholder="Mahalle, cadde veya parsel referansi" />
            </div>
            <div className="mod-form-actions">
              <button type="submit" className="mod-btn-primary">
                <AlertTriangle className="h-4 w-4" /> Risk Analizi
              </button>
            </div>
          </form>
        </ModulePanel>

        {result ? (
          <ModulePanel title={`Risk profili — ${lat}, ${lon}`}>
            <ModuleStatGrid stats={stats} />
            <ModuleDataTable
              caption="Afet tehdit tablosu"
              columns={[
                { key: "tehdit", header: "Tehdit", render: (r) => r.tehdit },
                {
                  key: "seviye",
                  header: "Seviye",
                  render: (r) => <ModuleTag tone={levelTone(r.seviye)}>{r.seviye}</ModuleTag>,
                },
                { key: "mesafe", header: "Mesafe", render: (r) => r.mesafe },
                { key: "olasilik", header: "Olasilik", render: (r) => r.olasilik },
                { key: "onlem", header: "Onerilen Onlem", render: (r) => r.onlem },
              ]}
              rows={MOCK_RISK}
            />
            <div className="mod-chart">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={RADAR} cx="50%" cy="50%" outerRadius="75%">
                  <PolarGrid stroke="rgba(255,255,255,0.12)" />
                  <PolarAngleAxis dataKey="risk" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
                  <Radar dataKey="skor" stroke="#f87171" fill="rgba(248,113,113,0.35)" />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <ModulePdfCta label="Afet risk haritasi PDF" />
          </ModulePanel>
        ) : (
          <div className="mod-empty">Konum bilgisi girip analiz baslatin.</div>
        )}
      </div>
    </ModuleShell>
  );
}
