import { useState } from "react";
import { Shield, ShieldCheck } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ModuleDataTable, ModulePanel, ModulePdfCta, ModuleShell, ModuleStatGrid, ModuleTag } from "./ModuleShell";

type TeklifRow = {
  id: string;
  sirket: string;
  urun: string;
  prim: string;
  teminat: string;
  skor: number;
  sure: string;
};

const MOCK_TEKLIF: TeklifRow[] = [
  { id: "1", sirket: "Anadolu Sigorta", urun: "Konut Paket", prim: "18.400 TRY/yil", teminat: "2,5M TRY", skor: 92, sure: "Aninda" },
  { id: "2", sirket: "Allianz", urun: "Premium Konut", prim: "21.200 TRY/yil", teminat: "3,0M TRY", skor: 89, sure: "2 saat" },
  { id: "3", sirket: "Axa", urun: "DASK + Konut", prim: "16.800 TRY/yil", teminat: "2,2M TRY", skor: 86, sure: "Aninda" },
  { id: "4", sirket: "Mapfre", urun: "Kapsamli", prim: "19.600 TRY/yil", teminat: "2,8M TRY", skor: 84, sure: "4 saat" },
  { id: "5", sirket: "HDI", urun: "Standart", prim: "14.900 TRY/yil", teminat: "1,8M TRY", skor: 78, sure: "Aninda" },
  { id: "6", sirket: "Sompo", urun: "Deprem+", prim: "22.500 TRY/yil", teminat: "3,2M TRY", skor: 87, sure: "1 gun" },
  { id: "7", sirket: "Turkiye Sigorta", urun: "DASK", prim: "8.200 TRY/yil", teminat: "1,5M TRY", skor: 81, sure: "Aninda" },
  { id: "8", sirket: "Zurich", urun: "Kurumsal", prim: "28.400 TRY/yil", teminat: "4,0M TRY", skor: 85, sure: "2 gun" },
  { id: "9", sirket: "Quick Sigorta", urun: "Ekonomik", prim: "12.100 TRY/yil", teminat: "1,2M TRY", skor: 72, sure: "Aninda" },
];

const CHART = MOCK_TEKLIF.slice(0, 6).map((t) => ({
  name: t.sirket.split(" ")[0],
  skor: t.skor,
}));

export default function SigortaPazaryeriPage() {
  const [deger, setDeger] = useState("9800000");
  const [tip, setTip] = useState("konut");
  const [dask, setDask] = useState("evet");
  const [result, setResult] = useState(true);

  const stats = [
    { label: "En Uygun Prim", value: "14.900 TRY/yil", hint: "HDI Standart" },
    { label: "Ortalama Teminat", value: "2,4M TRY", hint: "9 teklif ort." },
    { label: "Tasarruf", value: "%22", hint: "Piyasa ort. kiyas" },
    { label: "Eslesme Skoru", value: "92 / 100", hint: "Profil uyumu" },
  ];

  return (
    <ModuleShell
      title="Sigorta Pazaryeri"
      subtitle="Konut, DASK ve deprem teminatlari icin coklu sigorta sirketi tekliflerini karsilastirin."
      icon={Shield}
      iconAccent="text-teal-300"
      badge="Finans Marketplace"
    >
      <div className="mod-layout mod-layout--split">
        <ModulePanel title="Sigorta Profili">
          <form
            className="mod-form-grid"
            onSubmit={(e) => {
              e.preventDefault();
              setResult(true);
            }}
          >
            <div>
              <label htmlFor="sg-deger">Mulk degeri (TRY)</label>
              <input id="sg-deger" value={deger} onChange={(e) => setDeger(e.target.value)} />
            </div>
            <div>
              <label htmlFor="sg-tip">Mulk tipi</label>
              <select id="sg-tip" value={tip} onChange={(e) => setTip(e.target.value)}>
                <option value="konut">Konut</option>
                <option value="ticari">Ticari</option>
                <option value="villa">Villa</option>
              </select>
            </div>
            <div>
              <label htmlFor="sg-dask">DASK dahil mi?</label>
              <select id="sg-dask" value={dask} onChange={(e) => setDask(e.target.value)}>
                <option value="evet">Evet</option>
                <option value="hayir">Hayir</option>
              </select>
            </div>
            <div className="mod-form-actions">
              <button type="submit" className="mod-btn-primary">
                <ShieldCheck className="h-4 w-4" /> Teklifleri Getir
              </button>
            </div>
          </form>
        </ModulePanel>

        {result ? (
          <ModulePanel title="Sigorta teklif karsilastirmasi">
            <ModuleStatGrid stats={stats} />
            <ModuleDataTable
              caption="Sigorta sirketi teklifleri"
              columns={[
                { key: "sirket", header: "Sirket", render: (r) => r.sirket },
                { key: "urun", header: "Urun", render: (r) => r.urun },
                { key: "prim", header: "Yillik Prim", render: (r) => r.prim },
                { key: "teminat", header: "Teminat", render: (r) => r.teminat },
                {
                  key: "skor",
                  header: "Skor",
                  render: (r) => <ModuleTag tone={r.skor >= 85 ? "ok" : "warn"}>{r.skor}</ModuleTag>,
                },
                { key: "sure", header: "Sure", render: (r) => r.sure },
              ]}
              rows={MOCK_TEKLIF}
            />
            <div className="mod-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CHART}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} domain={[65, 100]} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
                  <Bar dataKey="skor" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ModulePdfCta label="Sigorta karsilastirma raporu PDF" />
          </ModulePanel>
        ) : (
          <div className="mod-empty">Profil bilgilerini girip teklif alin.</div>
        )}
      </div>
    </ModuleShell>
  );
}
