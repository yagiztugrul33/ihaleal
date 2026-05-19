import { useState } from "react";
import { Building2, Scale } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ModuleDataTable, ModulePanel, ModulePdfCta, ModuleShell, ModuleStatGrid, ModuleTag } from "./ModuleShell";

type EmsalRow = {
  id: string;
  kaynak: string;
  mesafe: string;
  m2: string;
  fiyat: string;
  tarih: string;
  uyum: number;
};

const MOCK_EMSAL: EmsalRow[] = [
  { id: "1", kaynak: "Sahibinden", mesafe: "320 m", m2: "118", fiyat: "9,8M TRY", tarih: "Mar 2026", uyum: 94 },
  { id: "2", kaynak: "Emlakjet", mesafe: "480 m", m2: "125", fiyat: "10,4M TRY", tarih: "Sub 2026", uyum: 91 },
  { id: "3", kaynak: "Tapu islem", mesafe: "210 m", m2: "112", fiyat: "9,2M TRY", tarih: "Oca 2026", uyum: 96 },
  { id: "4", kaynak: "Kurumsal portfoy", mesafe: "650 m", m2: "130", fiyat: "10,9M TRY", tarih: "Mar 2026", uyum: 88 },
  { id: "5", kaynak: "Remax Borsa", mesafe: "540 m", m2: "120", fiyat: "9,95M TRY", tarih: "Mar 2026", uyum: 92 },
  { id: "6", kaynak: "Hepsiemlak", mesafe: "890 m", m2: "115", fiyat: "9,5M TRY", tarih: "Kas 2025", uyum: 85 },
  { id: "7", kaynak: "Banka ekspertiz", mesafe: "150 m", m2: "122", fiyat: "10,1M TRY", tarih: "Ara 2025", uyum: 97 },
  { id: "8", kaynak: "Capraz ilce", mesafe: "2,1 km", m2: "128", fiyat: "10,6M TRY", tarih: "Sub 2026", uyum: 79 },
  { id: "9", kaynak: "Ihaleal kapali", mesafe: "410 m", m2: "119", fiyat: "9,7M TRY", tarih: "Mar 2026", uyum: 93 },
];

const CHART = MOCK_EMSAL.slice(0, 6).map((e) => ({
  name: e.kaynak.slice(0, 8),
  uyum: e.uyum,
}));

export default function DegerlemeModulPage() {
  const [il, setIl] = useState("Istanbul");
  const [ilce, setIlce] = useState("Kadikoy");
  const [m2, setM2] = useState("120");
  const [yas, setYas] = useState("12");
  const [done, setDone] = useState(true);

  const stats = [
    { label: "Tahmini Deger", value: "9,95M TRY", hint: "Guven araligi %92" },
    { label: "m2 Birim", value: "82.900 TRY", hint: "Emsal agirlikli" },
    { label: "Kira Getirisi", value: "%4,8", hint: "Brut yillik" },
    { label: "Likidite Skoru", value: "78 / 100", hint: "Ilce talep endeksi" },
  ];

  return (
    <ModuleShell
      title="Degerleme Modulu"
      subtitle="Konut ve ticari gayrimenkul icin emsal tabanli otomatik degerleme, guven araligi ve likidite analizi."
      icon={Scale}
      iconAccent="text-violet-300"
      badge="Ekspertiz AI"
    >
      <div className="mod-layout mod-layout--split">
        <ModulePanel title="Mulk Bilgileri">
          <form
            className="mod-form-grid"
            onSubmit={(e) => {
              e.preventDefault();
              setDone(true);
            }}
          >
            <div>
              <label htmlFor="dg-il">Il</label>
              <select id="dg-il" value={il} onChange={(e) => setIl(e.target.value)}>
                <option>Istanbul</option>
                <option>Ankara</option>
                <option>Izmir</option>
                <option>Antalya</option>
              </select>
            </div>
            <div>
              <label htmlFor="dg-ilce">Ilce</label>
              <input id="dg-ilce" value={ilce} onChange={(e) => setIlce(e.target.value)} />
            </div>
            <div>
              <label htmlFor="dg-m2">Brut m2</label>
              <input id="dg-m2" value={m2} onChange={(e) => setM2(e.target.value)} />
            </div>
            <div>
              <label htmlFor="dg-yas">Bina yasi</label>
              <input id="dg-yas" value={yas} onChange={(e) => setYas(e.target.value)} />
            </div>
            <div className="mod-form-actions">
              <button type="submit" className="mod-btn-primary">
                <Building2 className="h-4 w-4" /> Degerle
              </button>
            </div>
          </form>
        </ModulePanel>

        {done ? (
          <ModulePanel title={`${il} / ${ilce} — ${m2} m2 degerleme`}>
            <ModuleStatGrid stats={stats} />
            <ModuleDataTable
              caption="Emsal karsilastirma tablosu"
              columns={[
                { key: "kaynak", header: "Kaynak", render: (r) => r.kaynak },
                { key: "mesafe", header: "Mesafe", render: (r) => r.mesafe },
                { key: "m2", header: "m2", render: (r) => r.m2 },
                { key: "fiyat", header: "Fiyat", render: (r) => r.fiyat },
                { key: "tarih", header: "Tarih", render: (r) => r.tarih },
                {
                  key: "uyum",
                  header: "Uyum",
                  render: (r) => (
                    <ModuleTag tone={r.uyum >= 90 ? "ok" : r.uyum >= 80 ? "warn" : "risk"}>%{r.uyum}</ModuleTag>
                  ),
                },
              ]}
              rows={MOCK_EMSAL}
            />
            <div className="mod-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CHART}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} domain={[70, 100]} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
                  <Bar dataKey="uyum" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ModulePdfCta label="Resmi format degerleme PDF" />
          </ModulePanel>
        ) : (
          <div className="mod-empty">Mulk bilgilerini girip degerleme baslatin.</div>
        )}
      </div>
    </ModuleShell>
  );
}
