import { useMemo, useState } from "react";
import { MapPin, Search, Sparkles } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  ModuleDataTable,
  ModulePanel,
  ModulePdfCta,
  ModuleShell,
  ModuleStatGrid,
  ModuleTag,
} from "./ModuleShell";

type ParselRow = {
  id: string;
  ada: string;
  parsel: string;
  alan: string;
  imar: string;
  emsal: string;
  skor: number;
};

const MOCK_PARCELS: ParselRow[] = [
  { id: "1", ada: "1247", parsel: "8", alan: "1.240 m2", imar: "Konut", emsal: "1,80", skor: 88 },
  { id: "2", ada: "1247", parsel: "9", alan: "980 m2", imar: "Konut", emsal: "1,60", skor: 82 },
  { id: "3", ada: "1250", parsel: "3", alan: "2.450 m2", imar: "Ticari", emsal: "2,10", skor: 91 },
  { id: "4", ada: "1250", parsel: "4", alan: "760 m2", imar: "Konut", emsal: "1,40", skor: 74 },
  { id: "5", ada: "1251", parsel: "12", alan: "3.100 m2", imar: "Karma", emsal: "2,40", skor: 86 },
  { id: "6", ada: "1251", parsel: "13", alan: "540 m2", imar: "Konut", emsal: "1,20", skor: 69 },
  { id: "7", ada: "1252", parsel: "1", alan: "4.800 m2", imar: "Sanayi", emsal: "0,80", skor: 77 },
  { id: "8", ada: "1252", parsel: "2", alan: "1.680 m2", imar: "Konut", emsal: "1,90", skor: 93 },
  { id: "9", ada: "1253", parsel: "6", alan: "890 m2", imar: "Konut", emsal: "1,55", skor: 80 },
];

export default function ParselZekasiPage() {
  const [il, setIl] = useState("Antalya");
  const [ilce, setIlce] = useState("Muratpasa");
  const [mahalle, setMahalle] = useState("Fener Mahallesi");
  const [ada, setAda] = useState("1247");
  const [parsel, setParsel] = useState("8");
  const [analyzed, setAnalyzed] = useState(true);

  const chartData = useMemo(
    () => MOCK_PARCELS.slice(0, 6).map((p) => ({ name: `${p.ada}/${p.parsel}`, skor: p.skor })),
    [],
  );

  const stats = [
    { label: "Yatirim Skoru", value: "88 / 100", hint: "EMSAL + konum agirlikli" },
    { label: "TAKS / KAKS", value: "0,35 / 1,80", hint: "Belediye plan notu" },
    { label: "Kat Adedi", value: "5 + 1", hint: "On onayli proje" },
    { label: "Tahmini Arsa Degeri", value: "12,4M TRY", hint: "Emsal karsilastirmali" },
  ];

  return (
    <ModuleShell
      title="Parsel Zekasi"
      subtitle="Ada-parsel, imar ve emsal verilerini birlestirerek yatirim potansiyelini saniyeler icinde skorlayin."
      icon={MapPin}
      iconAccent="text-cyan-300"
      badge="GIS + AI"
    >
      <div className="mod-layout mod-layout--split">
        <ModulePanel title="Sorgu Formu">
          <form
            className="mod-form-grid"
            onSubmit={(e) => {
              e.preventDefault();
              setAnalyzed(true);
            }}
          >
            <div>
              <label htmlFor="pz-il">Il</label>
              <input id="pz-il" value={il} onChange={(e) => setIl(e.target.value)} />
            </div>
            <div>
              <label htmlFor="pz-ilce">Ilce</label>
              <input id="pz-ilce" value={ilce} onChange={(e) => setIlce(e.target.value)} />
            </div>
            <div>
              <label htmlFor="pz-mahalle">Mahalle</label>
              <input id="pz-mahalle" value={mahalle} onChange={(e) => setMahalle(e.target.value)} />
            </div>
            <div>
              <label htmlFor="pz-ada">Ada</label>
              <input id="pz-ada" value={ada} onChange={(e) => setAda(e.target.value)} />
            </div>
            <div>
              <label htmlFor="pz-parsel">Parsel</label>
              <input id="pz-parsel" value={parsel} onChange={(e) => setParsel(e.target.value)} />
            </div>
            <div className="mod-form-actions">
              <button type="submit" className="mod-btn-primary">
                <Search className="h-4 w-4" /> Analiz Et
              </button>
              <button type="button" className="mod-btn-secondary" onClick={() => setAnalyzed(false)}>
                Temizle
              </button>
            </div>
          </form>
        </ModulePanel>

        <div>
          {analyzed ? (
            <>
              <ModulePanel
                title={`Sonuc: ${il} / ${ilce} — Ada ${ada} Parsel ${parsel}`}
                action={
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-300">
                    <Sparkles className="h-3.5 w-3.5" /> AI skorlandi
                  </span>
                }
              >
                <ModuleStatGrid stats={stats} />
                <ModuleDataTable
                  caption="Komsu parsel karsilastirmasi"
                  columns={[
                    { key: "ada", header: "Ada/Parsel", render: (r) => `${r.ada}/${r.parsel}` },
                    { key: "alan", header: "Alan", render: (r) => r.alan },
                    { key: "imar", header: "Imar", render: (r) => r.imar },
                    { key: "emsal", header: "EMSAL", render: (r) => r.emsal },
                    {
                      key: "skor",
                      header: "Skor",
                      render: (r) => (
                        <ModuleTag tone={r.skor >= 85 ? "ok" : r.skor >= 75 ? "warn" : "risk"}>{r.skor}</ModuleTag>
                      ),
                    },
                  ]}
                  rows={MOCK_PARCELS}
                />
                <div className="mod-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} domain={[60, 100]} />
                      <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
                      <Bar dataKey="skor" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <ModulePdfCta label="Parsel zekasi PDF raporu" />
              </ModulePanel>
            </>
          ) : (
            <div className="mod-empty">Parsel bilgilerini girip analiz baslatin.</div>
          )}
        </div>
      </div>
    </ModuleShell>
  );
}
