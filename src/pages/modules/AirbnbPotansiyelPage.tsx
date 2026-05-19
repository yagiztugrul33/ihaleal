import { useState } from "react";
import { BedDouble, TrendingUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ModuleDataTable, ModulePanel, ModulePdfCta, ModuleShell, ModuleStatGrid, ModuleTag } from "./ModuleShell";

type SezonRow = {
  id: string;
  ay: string;
  doluluk: string;
  gecelik: string;
  gelir: string;
  rekabet: string;
};

const MOCK_SEASON: SezonRow[] = [
  { id: "1", ay: "Ocak", doluluk: "%42", gecelik: "2.450 TRY", gelir: "31.900 TRY", rekabet: "Orta" },
  { id: "2", ay: "Subat", doluluk: "%48", gecelik: "2.680 TRY", gelir: "35.900 TRY", rekabet: "Orta" },
  { id: "3", ay: "Mart", doluluk: "%58", gecelik: "3.100 TRY", gelir: "55.800 TRY", rekabet: "Yuksek" },
  { id: "4", ay: "Nisan", doluluk: "%72", gecelik: "3.850 TRY", gelir: "83.200 TRY", rekabet: "Yuksek" },
  { id: "5", ay: "Mayis", doluluk: "%78", gecelik: "4.200 TRY", gelir: "101.600 TRY", rekabet: "Yuksek" },
  { id: "6", ay: "Haziran", doluluk: "%88", gecelik: "5.100 TRY", gelir: "135.400 TRY", rekabet: "Cok yuksek" },
  { id: "7", ay: "Temmuz", doluluk: "%94", gecelik: "5.800 TRY", gelir: "168.900 TRY", rekabet: "Cok yuksek" },
  { id: "8", ay: "Agustos", doluluk: "%92", gecelik: "5.650 TRY", gelir: "156.400 TRY", rekabet: "Cok yuksek" },
  { id: "9", ay: "Eylul", doluluk: "%76", gecelik: "4.050 TRY", gelir: "92.300 TRY", rekabet: "Yuksek" },
];

const CHART = MOCK_SEASON.map((s) => ({
  ay: s.ay.slice(0, 3),
  gelir: Number(s.gelir.replace(/[^\d]/g, "")) / 1000,
}));

export default function AirbnbPotansiyelPage() {
  const [sehir, setSehir] = useState("Antalya");
  const [oda, setOda] = useState("2+1");
  const [kapasite, setKapasite] = useState("4");
  const [result, setResult] = useState(true);

  const stats = [
    { label: "Yillik Brut Gelir", value: "1,42M TRY", hint: "Temizlik haric" },
    { label: "Ort. Doluluk", value: "%71", hint: "12 ay agirlikli" },
    { label: "Net Getiri", value: "%11,8", hint: "Maliyet sonrasi" },
    { label: "Rekabet Skoru", value: "68 / 100", hint: "Bolge supply" },
  ];

  return (
    <ModuleShell
      title="Airbnb Potansiyeli"
      subtitle="Kisa donem kiralama talebi, sezonluk doluluk ve rekabet yogunluguna gore gelir projeksiyonu."
      icon={BedDouble}
      iconAccent="text-rose-300"
      badge="Gelir Optimizasyonu"
    >
      <div className="mod-layout mod-layout--split">
        <ModulePanel title="Konut Profili">
          <form
            className="mod-form-grid"
            onSubmit={(e) => {
              e.preventDefault();
              setResult(true);
            }}
          >
            <div>
              <label htmlFor="ab-sehir">Sehir / Bolge</label>
              <input id="ab-sehir" value={sehir} onChange={(e) => setSehir(e.target.value)} />
            </div>
            <div>
              <label htmlFor="ab-oda">Oda tipi</label>
              <select id="ab-oda" value={oda} onChange={(e) => setOda(e.target.value)}>
                <option>1+1</option>
                <option>2+1</option>
                <option>3+1</option>
                <option>Villa</option>
              </select>
            </div>
            <div>
              <label htmlFor="ab-kap">Misafir kapasitesi</label>
              <input id="ab-kap" value={kapasite} onChange={(e) => setKapasite(e.target.value)} />
            </div>
            <div className="mod-form-actions">
              <button type="submit" className="mod-btn-primary">
                <TrendingUp className="h-4 w-4" /> Projeksiyon Al
              </button>
            </div>
          </form>
        </ModulePanel>

        {result ? (
          <ModulePanel title={`${sehir} — ${oda} kisa donem analizi`}>
            <ModuleStatGrid stats={stats} />
            <ModuleDataTable
              caption="Aylik sezon tablosu"
              columns={[
                { key: "ay", header: "Ay", render: (r) => r.ay },
                { key: "doluluk", header: "Doluluk", render: (r) => r.doluluk },
                { key: "gecelik", header: "Gecelik", render: (r) => r.gecelik },
                { key: "gelir", header: "Aylik Gelir", render: (r) => r.gelir },
                {
                  key: "rekabet",
                  header: "Rekabet",
                  render: (r) => (
                    <ModuleTag tone={r.rekabet.includes("Cok") ? "risk" : r.rekabet === "Yuksek" ? "warn" : "ok"}>
                      {r.rekabet}
                    </ModuleTag>
                  ),
                },
              ]}
              rows={MOCK_SEASON}
            />
            <div className="mod-chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CHART}>
                  <XAxis dataKey="ay" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
                  <Area type="monotone" dataKey="gelir" stroke="#fb7185" fill="rgba(251,113,133,0.25)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <ModulePdfCta label="Airbnb potansiyel raporu PDF" />
          </ModulePanel>
        ) : (
          <div className="mod-empty">Konut profilini girip analiz baslatin.</div>
        )}
      </div>
    </ModuleShell>
  );
}
