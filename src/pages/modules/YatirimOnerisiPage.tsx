import { useState } from "react";
import { Lightbulb, Target } from "lucide-react";
import { Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis, ResponsiveContainer } from "recharts";
import { ModuleDataTable, ModulePanel, ModulePdfCta, ModuleShell, ModuleStatGrid, ModuleTag } from "./ModuleShell";

type OneriRow = {
  id: string;
  bolge: string;
  tip: string;
  getiri: string;
  risk: string;
  butce: string;
  skor: number;
};

const MOCK_ONERI: OneriRow[] = [
  { id: "1", bolge: "Konyaalti", tip: "Konut", getiri: "%8,4", risk: "Dusuk", butce: "6-9M", skor: 91 },
  { id: "2", bolge: "Muratpasa", tip: "Ticari", getiri: "%11,2", risk: "Orta", butce: "12-18M", skor: 86 },
  { id: "3", bolge: "Kepez", tip: "Arsa", getiri: "%14,6", risk: "Orta", butce: "3-5M", skor: 84 },
  { id: "4", bolge: "Alanya", tip: "Yazlik", getiri: "%9,8", risk: "Dusuk", butce: "8-12M", skor: 88 },
  { id: "5", bolge: "Lara", tip: "Rezidans", getiri: "%7,2", risk: "Dusuk", butce: "15-25M", skor: 82 },
  { id: "6", bolge: "Manavgat", tip: "GES arazi", getiri: "%13,1", risk: "Orta", butce: "20M+", skor: 79 },
  { id: "7", bolge: "Serik", tip: "Villa", getiri: "%10,5", risk: "Orta", butce: "18-30M", skor: 77 },
  { id: "8", bolge: "Dosemealti", tip: "Sanayi", getiri: "%12,4", risk: "Yuksek", butce: "10-14M", skor: 74 },
  { id: "9", bolge: "Kundu", tip: "Otel", getiri: "%15,8", risk: "Yuksek", butce: "40M+", skor: 71 },
];

const SCATTER = MOCK_ONERI.map((o) => ({
  name: o.bolge,
  getiri: Number(o.getiri.replace(/[^\d,]/g, "").replace(",", ".")),
  risk: o.risk === "Dusuk" ? 25 : o.risk === "Orta" ? 55 : 80,
  z: o.skor,
}));

export default function YatirimOnerisiPage() {
  const [butce, setButce] = useState("10000000");
  const [horizon, setHorizon] = useState("5");
  const [risk, setRisk] = useState("orta");
  const [result, setResult] = useState(true);

  const stats = [
    { label: "Onerilen Portfoy", value: "3 segment", hint: "Diversifikasyon" },
    { label: "Beklenen Getiri", value: "%10,6", hint: "Agirlikli ortalama" },
    { label: "Risk Profili", value: "Dengeli", hint: "Orta volatilite" },
    { label: "Eslesme Skoru", value: "89 / 100", hint: "Profil uyumu" },
  ];

  return (
    <ModuleShell
      title="Yatirim Onerisi"
      subtitle="Butce, risk iştahi ve vade tercihlerinize gore bolge ve segment bazli yatirim onerileri."
      icon={Lightbulb}
      iconAccent="text-yellow-300"
      badge="Portfoy AI"
    >
      <div className="mod-layout mod-layout--split">
        <ModulePanel title="Yatirim Profili">
          <form
            className="mod-form-grid"
            onSubmit={(e) => {
              e.preventDefault();
              setResult(true);
            }}
          >
            <div>
              <label htmlFor="yo-butce">Butce (TRY)</label>
              <input id="yo-butce" value={butce} onChange={(e) => setButce(e.target.value)} />
            </div>
            <div>
              <label htmlFor="yo-horizon">Vade (yil)</label>
              <select id="yo-horizon" value={horizon} onChange={(e) => setHorizon(e.target.value)}>
                <option value="3">3</option>
                <option value="5">5</option>
                <option value="10">10</option>
              </select>
            </div>
            <div>
              <label htmlFor="yo-risk">Risk iştahi</label>
              <select id="yo-risk" value={risk} onChange={(e) => setRisk(e.target.value)}>
                <option value="dusuk">Dusuk</option>
                <option value="orta">Orta</option>
                <option value="yuksek">Yuksek</option>
              </select>
            </div>
            <div className="mod-form-actions">
              <button type="submit" className="mod-btn-primary">
                <Target className="h-4 w-4" /> Oneri Al
              </button>
            </div>
          </form>
        </ModulePanel>

        {result ? (
          <ModulePanel title="Kisisellestirilmis yatirim onerileri">
            <ModuleStatGrid stats={stats} />
            <ModuleDataTable
              caption="Bolge ve segment onerileri"
              columns={[
                { key: "bolge", header: "Bolge", render: (r) => r.bolge },
                { key: "tip", header: "Segment", render: (r) => r.tip },
                { key: "getiri", header: "Getiri", render: (r) => r.getiri },
                {
                  key: "risk",
                  header: "Risk",
                  render: (r) => (
                    <ModuleTag tone={r.risk === "Dusuk" ? "ok" : r.risk === "Orta" ? "warn" : "risk"}>{r.risk}</ModuleTag>
                  ),
                },
                { key: "butce", header: "Butce Bandi", render: (r) => r.butce },
                {
                  key: "skor",
                  header: "Skor",
                  render: (r) => <ModuleTag tone={r.skor >= 85 ? "ok" : "warn"}>{r.skor}</ModuleTag>,
                },
              ]}
              rows={MOCK_ONERI}
            />
            <div className="mod-chart">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                  <XAxis type="number" dataKey="getiri" name="Getiri" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis type="number" dataKey="risk" name="Risk" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <ZAxis type="number" dataKey="z" range={[60, 400]} />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
                  <Scatter data={SCATTER} fill="#facc15" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <ModulePdfCta label="Yatirim stratejisi PDF" />
          </ModulePanel>
        ) : (
          <div className="mod-empty">Profil bilgilerini girip oneri alin.</div>
        )}
      </div>
    </ModuleShell>
  );
}
