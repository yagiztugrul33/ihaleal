import { useState } from "react";
import { Briefcase, PieChart } from "lucide-react";
import { Cell, Pie, PieChart as RePieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ModuleDataTable, ModulePanel, ModulePdfCta, ModuleShell, ModuleStatGrid, ModuleTag } from "./ModuleShell";
import { isSupabaseConfigured } from "@/lib/supabase";

type PortfoyRow = {
  id: string;
  varlik: string;
  tip: string;
  deger: string;
  getiri: string;
  durum: string;
  guncelleme: string;
};

const MOCK_PORTFOY: PortfoyRow[] = [
  { id: "1", varlik: "Kadikoy Daire 12", tip: "Konut", deger: "9,8M TRY", getiri: "%5,2", durum: "Kirada", guncelleme: "18 Mar 2026" },
  { id: "2", varlik: "Antalya Arsa 4521/14", tip: "Arsa", deger: "12,4M TRY", getiri: "—", durum: "Beklemede", guncelleme: "15 Mar 2026" },
  { id: "3", varlik: "Izmir Ofis 3", tip: "Ticari", deger: "18,2M TRY", getiri: "%8,1", durum: "Kirada", guncelleme: "17 Mar 2026" },
  { id: "4", varlik: "Bodrum Villa", tip: "Yazlik", deger: "24,5M TRY", getiri: "%6,4", durum: "Sezonluk", guncelleme: "10 Mar 2026" },
  { id: "5", varlik: "Konya GES Arazi", tip: "GES", deger: "32,0M TRY", getiri: "%13,8", durum: "Uretimde", guncelleme: "16 Mar 2026" },
  { id: "6", varlik: "Ankara Rezidans", tip: "Konut", deger: "7,1M TRY", getiri: "%4,9", durum: "Bos", guncelleme: "12 Mar 2026" },
  { id: "7", varlik: "Mersin Depo", tip: "Lojistik", deger: "21,8M TRY", getiri: "%9,6", durum: "Kirada", guncelleme: "14 Mar 2026" },
  { id: "8", varlik: "Trabzon Arsa", tip: "Arsa", deger: "4,2M TRY", getiri: "—", durum: "Satışta", guncelleme: "08 Mar 2026" },
  { id: "9", varlik: "Alanya 2+1", tip: "Konut", deger: "6,5M TRY", getiri: "%11,2", durum: "Airbnb", guncelleme: "18 Mar 2026" },
];

const PIE = [
  { name: "Konut", value: 38, color: "#38bdf8" },
  { name: "Arsa", value: 22, color: "#34d399" },
  { name: "Ticari", value: 18, color: "#a78bfa" },
  { name: "GES", value: 14, color: "#fbbf24" },
  { name: "Diger", value: 8, color: "#fb7185" },
];

export default function PortfoyYonetimiModulPage() {
  const envReady = isSupabaseConfigured();
  const [owner, setOwner] = useState("Kurumsal Portföy A.Ş.");
  const [view, setView] = useState("tumu");
  const [loaded, setLoaded] = useState(true);

  const stats = [
    { label: "Toplam Deger", value: "136,5M TRY", hint: "9 aktif varlik" },
    { label: "Yıllık Getiri", value: "%7,8", hint: "Brüt ortalama" },
    { label: "Nakit Akisi", value: "892K TRY/ay", hint: "Kira + GES" },
    { label: "Risk Dagilimi", value: "Dengeli", hint: "Segment cesitliligi" },
  ];

  return (
    <ModuleShell
      title="Portföy Yönetimi"
      subtitle="Tüm gayrimenkul varlıklarınızı tek panelde izleyin; değer, getiri ve durum güncellemelerini anlık takip edin."
      icon={Briefcase}
      iconAccent="text-indigo-300"
      badge="Kurumsal Panel"
    >
      {!envReady ? (
        <div className="mod-note-box">
          <p>Canlı portföy servisi olmadığında demo varlık seti gösterilir; kullanıcıya boş tablo yerine karar odaklı özet sunulur.</p>
        </div>
      ) : null}
      <div className="mod-layout mod-layout--split">
        <ModulePanel title="Portföy Filtreleri">
          <form
            className="mod-form-grid"
            onSubmit={(e) => {
              e.preventDefault();
              setLoaded(true);
            }}
          >
            <div>
              <label htmlFor="py-owner">Portföy sahibi</label>
              <input id="py-owner" value={owner} onChange={(e) => setOwner(e.target.value)} />
            </div>
            <div>
              <label htmlFor="py-view">Görünüm</label>
              <select id="py-view" value={view} onChange={(e) => setView(e.target.value)}>
                <option value="tumu">Tüm varlıklar</option>
                <option value="konut">Konut</option>
                <option value="ticari">Ticari</option>
                <option value="arsa">Arsa</option>
              </select>
            </div>
            <div className="mod-form-actions">
              <button type="submit" className="mod-btn-primary">
                <PieChart className="h-4 w-4" /> Portföyü Yükle
              </button>
            </div>
          </form>
        </ModulePanel>

        {loaded ? (
          <ModulePanel title={`${owner} — portföy özeti`}>
            <ModuleStatGrid stats={stats} />
            <ModuleDataTable
              caption="Portföy varlık listesi"
              columns={[
                { key: "varlik", header: "Varlik", render: (r) => r.varlik },
                { key: "tip", header: "Tip", render: (r) => r.tip },
                { key: "deger", header: "Değer", render: (r) => r.deger },
                { key: "getiri", header: "Getiri", render: (r) => r.getiri },
                {
                  key: "durum",
                  header: "Durum",
                  render: (r) => (
                    <ModuleTag tone={r.durum === "Kirada" || r.durum === "Uretimde" ? "ok" : "warn"}>{r.durum}</ModuleTag>
                  ),
                },
                { key: "guncelleme", header: "Güncelleme", render: (r) => r.guncelleme },
              ]}
              rows={MOCK_PORTFOY}
            />
            <div className="mod-chart">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={PIE} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2}>
                    {PIE.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <ModulePdfCta label="Portföy performans raporu PDF" />
          </ModulePanel>
        ) : (
          <div className="mod-empty">Portföy kalemlerinizi yükleyin; getiri, risk dağılımı ve likidite önceliklerini kurumsal görünümde takip edin.</div>
        )}
      </div>
      <ModulePanel title="Portföy karar çerçevesi">
        <div className="grid gap-3 md:grid-cols-3 text-sm text-slate-300">
          <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
            <p className="font-semibold text-slate-100">Likidite önceliği</p>
            <p className="mt-1">Satış süresi uzayan varlıklar düzenli nakit akışını baskılar; öncelik sırası yeniden kurulmalıdır.</p>
          </article>
          <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
            <p className="font-semibold text-slate-100">Risk dengesi</p>
            <p className="mt-1">Deprem, finansman ve segment riski aynı sepet içinde dengelenerek tek tip yoğunlaşma azaltılır.</p>
          </article>
          <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
            <p className="font-semibold text-slate-100">Aksiyon</p>
            <p className="mt-1">Zayıf getiri üreten varlıklar için yenileme, satış veya kullanım tipi dönüşümü senaryosu çalıştırın.</p>
          </article>
        </div>
      </ModulePanel>
    </ModuleShell>
  );
}
