import { useState } from "react";
import { Hammer, PiggyBank } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ModuleDataTable, ModulePanel, ModulePdfCta, ModuleShell, ModuleStatGrid, ModuleTag } from "./ModuleShell";

type KalemlerRow = {
  id: string;
  kalem: string;
  maliyet: string;
  sure: string;
  degerArtisi: string;
  roi: string;
};

const MOCK_KALEM: KalemlerRow[] = [
  { id: "1", kalem: "Mutfak yenileme", maliyet: "420.000 TRY", sure: "6 hafta", degerArtisi: "+680.000 TRY", roi: "%62" },
  { id: "2", kalem: "Banyo modernizasyon", maliyet: "185.000 TRY", sure: "3 hafta", degerArtisi: "+290.000 TRY", roi: "%57" },
  { id: "3", kalem: "Zemin / parke", maliyet: "95.000 TRY", sure: "2 hafta", degerArtisi: "+140.000 TRY", roi: "%47" },
  { id: "4", kalem: "Elektrik tesisati", maliyet: "120.000 TRY", sure: "2 hafta", degerArtisi: "+110.000 TRY", roi: "%32" },
  { id: "5", kalem: "Cephe boya", maliyet: "78.000 TRY", sure: "10 gun", degerArtisi: "+95.000 TRY", roi: "%22" },
  { id: "6", kalem: "Isi yalitimi", maliyet: "210.000 TRY", sure: "4 hafta", degerArtisi: "+260.000 TRY", roi: "%24" },
  { id: "7", kalem: "Balkon cam", maliyet: "145.000 TRY", sure: "2 hafta", degerArtisi: "+175.000 TRY", roi: "%21" },
  { id: "8", kalem: "Akilli ev", maliyet: "65.000 TRY", sure: "1 hafta", degerArtisi: "+55.000 TRY", roi: "%-15" },
  { id: "9", kalem: "Bahce duzenleme", maliyet: "88.000 TRY", sure: "2 hafta", degerArtisi: "+72.000 TRY", roi: "%-18" },
];

const CHART = MOCK_KALEM.slice(0, 7).map((k) => ({
  name: k.kalem.slice(0, 10),
  roi: Number(k.roi.replace(/[^\d-]/g, "")),
}));

export default function RenovasyonRoiPage() {
  const [mulkDeger, setMulkDeger] = useState("8500000");
  const [butce, setButce] = useState("1200000");
  const [tip, setTip] = useState("konut");
  const [result, setResult] = useState(true);

  const stats = [
    { label: "Toplam Yatirim", value: "1,2M TRY", hint: "KDV dahil tahmin" },
    { label: "Deger Artisi", value: "+1,85M TRY", hint: "Ekspertiz bandi" },
    { label: "Net ROI", value: "%54", hint: "12 ay icinde" },
    { label: "Geri Odeme", value: "14 ay", hint: "Kira + satis senaryo" },
  ];

  return (
    <ModuleShell
      title="Renovasyon ROI"
      subtitle="Renovasyon kalemlerinin maliyet, sure ve mulk degerine etkisini kalem kalem hesaplayin."
      icon={Hammer}
      iconAccent="text-orange-300"
      badge="Yatirim Optimizasyonu"
    >
      <div className="mod-layout mod-layout--split">
        <ModulePanel title="Proje Butcesi">
          <form
            className="mod-form-grid"
            onSubmit={(e) => {
              e.preventDefault();
              setResult(true);
            }}
          >
            <div>
              <label htmlFor="rn-deger">Mevcut mulk degeri (TRY)</label>
              <input id="rn-deger" value={mulkDeger} onChange={(e) => setMulkDeger(e.target.value)} />
            </div>
            <div>
              <label htmlFor="rn-butce">Renovasyon butcesi (TRY)</label>
              <input id="rn-butce" value={butce} onChange={(e) => setButce(e.target.value)} />
            </div>
            <div>
              <label htmlFor="rn-tip">Mulk tipi</label>
              <select id="rn-tip" value={tip} onChange={(e) => setTip(e.target.value)}>
                <option value="konut">Konut</option>
                <option value="ticari">Ticari</option>
                <option value="villa">Villa</option>
              </select>
            </div>
            <div className="mod-form-actions">
              <button type="submit" className="mod-btn-primary">
                <PiggyBank className="h-4 w-4" /> ROI Hesapla
              </button>
            </div>
          </form>
        </ModulePanel>

        {result ? (
          <ModulePanel title="Renovasyon getiri analizi">
            <ModuleStatGrid stats={stats} />
            <ModuleDataTable
              caption="Renovasyon kalemleri"
              columns={[
                { key: "kalem", header: "Kalem", render: (r) => r.kalem },
                { key: "maliyet", header: "Maliyet", render: (r) => r.maliyet },
                { key: "sure", header: "Sure", render: (r) => r.sure },
                { key: "deger", header: "Deger Artisi", render: (r) => r.degerArtisi },
                {
                  key: "roi",
                  header: "ROI",
                  render: (r) => (
                    <ModuleTag tone={r.roi.startsWith("-") ? "risk" : Number(r.roi.replace(/\D/g, "")) >= 40 ? "ok" : "warn"}>
                      {r.roi}
                    </ModuleTag>
                  ),
                },
              ]}
              rows={MOCK_KALEM}
            />
            <div className="mod-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CHART}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
                  <Bar dataKey="roi" fill="#fb923c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ModulePdfCta label="Renovasyon ROI raporu PDF" />
          </ModulePanel>
        ) : (
          <div className="mod-empty">Bütçe ve kapsam bilgilerini girin; renovasyon maliyeti, geri dönüş süresi ve satış etkisini ölçülü biçimde hesaplayın.</div>
        )}
      </div>
    </ModuleShell>
  );
}
