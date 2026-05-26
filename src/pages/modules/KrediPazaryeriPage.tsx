import { useState } from "react";
import { Banknote, CreditCard } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ModuleDataTable, ModulePanel, ModulePdfCta, ModuleShell, ModuleStatGrid, ModuleTag } from "./ModuleShell";
import { isSupabaseConfigured } from "@/lib/supabase";

type KrediRow = {
  id: string;
  banka: string;
  urun: string;
  faiz: string;
  taksit: string;
  vade: string;
  skor: number;
};

const MOCK_KREDI: KrediRow[] = [
  { id: "1", banka: "Ziraat Bankasi", urun: "Konut Kredisi", faiz: "%2,89", taksit: "42.800 TRY", vade: "120 ay", skor: 94 },
  { id: "2", banka: "Halkbank", urun: "Genç Konut", faiz: "%2,79", taksit: "41.200 TRY", vade: "120 ay", skor: 92 },
  { id: "3", banka: "Vakifbank", urun: "Konut", faiz: "%3,05", taksit: "44.100 TRY", vade: "120 ay", skor: 88 },
  { id: "4", banka: "Is Bankasi", urun: "Esnek Konut", faiz: "%3,19", taksit: "45.600 TRY", vade: "120 ay", skor: 86 },
  { id: "5", banka: "Garanti BBVA", urun: "Mortgage", faiz: "%3,29", taksit: "46.900 TRY", vade: "120 ay", skor: 84 },
  { id: "6", banka: "Akbank", urun: "Konut+", faiz: "%3,15", taksit: "44.800 TRY", vade: "120 ay", skor: 83 },
  { id: "7", banka: "Yapı Kredi", urun: "Konut", faiz: "%3,22", taksit: "45.200 TRY", vade: "120 ay", skor: 81 },
  { id: "8", banka: "QNB Finansbank", urun: "Hizli Konut", faiz: "%3,45", taksit: "47.500 TRY", vade: "120 ay", skor: 78 },
  { id: "9", banka: "Denizbank", urun: "Konut", faiz: "%3,38", taksit: "46.700 TRY", vade: "120 ay", skor: 76 },
];

const CHART = MOCK_KREDI.slice(0, 8).map((k) => ({
  banka: k.banka.split(" ")[0],
  faiz: Number(k.faiz.replace(/[^\d,]/g, "").replace(",", ".")),
}));

export default function KrediPazaryeriPage() {
  const envReady = isSupabaseConfigured();
  const [tutar, setTutar] = useState("6500000");
  const [pesinat, setPesinat] = useState("1300000");
  const [gelir, setGelir] = useState("95000");
  const [result, setResult] = useState(true);

  const stats = [
    { label: "Kredi Tutari", value: "5,2M TRY", hint: "Pesinat dusulmus" },
    { label: "En Dusuk Faiz", value: "%2,79", hint: "Halkbank Genç" },
    { label: "Aylık Taksit", value: "41.200 TRY", hint: "120 ay vade" },
    { label: "Onay Olasiligi", value: "%88", hint: "Gelir/deger orani" },
  ];

  return (
    <ModuleShell
      title="Kredi Pazaryeri"
      subtitle="Banka konut kredisi tekliflerini faiz, taksit ve onay olasiligina gore yan yana karsilastirin."
      icon={CreditCard}
      iconAccent="text-blue-300"
      badge="Finans Marketplace"
    >
      {!envReady ? (
        <div className="mod-note-box">
          <p>Canlı banka bağlantısı yok: bu sayfa demo teklif tablosu ve karar çerçevesiyle çalışır, boş ekran göstermez.</p>
        </div>
      ) : null}
      <div className="mod-layout mod-layout--split">
        <ModulePanel title="Kredi Basvuru Formu">
          <form
            className="mod-form-grid"
            onSubmit={(e) => {
              e.preventDefault();
              setResult(true);
            }}
          >
            <div>
              <label htmlFor="kr-tutar">Konut bedeli (TRY)</label>
              <input id="kr-tutar" value={tutar} onChange={(e) => setTutar(e.target.value)} />
            </div>
            <div>
              <label htmlFor="kr-pesinat">Pesinat (TRY)</label>
              <input id="kr-pesinat" value={pesinat} onChange={(e) => setPesinat(e.target.value)} />
            </div>
            <div>
              <label htmlFor="kr-gelir">Aylık net gelir (TRY)</label>
              <input id="kr-gelir" value={gelir} onChange={(e) => setGelir(e.target.value)} />
            </div>
            <div className="mod-form-actions">
              <button type="submit" className="mod-btn-primary">
                <Banknote className="h-4 w-4" /> Teklifleri Karşılaştır
              </button>
            </div>
          </form>
        </ModulePanel>

        {result ? (
          <ModulePanel title="Banka kredi teklifleri">
            <ModuleStatGrid stats={stats} />
            <ModuleDataTable
              caption="Konut kredisi teklif tablosu"
              columns={[
                { key: "banka", header: "Banka", render: (r) => r.banka },
                { key: "urun", header: "Urun", render: (r) => r.urun },
                { key: "faiz", header: "Faiz", render: (r) => r.faiz },
                { key: "taksit", header: "Taksit", render: (r) => r.taksit },
                { key: "vade", header: "Vade", render: (r) => r.vade },
                {
                  key: "skor",
                  header: "Skor",
                  render: (r) => <ModuleTag tone={r.skor >= 85 ? "ok" : "warn"}>{r.skor}</ModuleTag>,
                },
              ]}
              rows={MOCK_KREDI}
            />
            <div className="mod-chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={CHART}>
                  <XAxis dataKey="banka" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} domain={[2.5, 3.6]} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
                  <Line type="monotone" dataKey="faiz" stroke="#60a5fa" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <ModulePdfCta label="Kredi karsilastirma raporu PDF" />
          </ModulePanel>
        ) : (
          <div className="mod-empty">Başvuru bilgilerini girin; faiz, vade ve toplam maliyet kırılımını karşılaştırmalı kredi teklifleriyle inceleyin.</div>
        )}
      </div>
      <ModulePanel title="Karar metni">
        <div className="grid gap-3 md:grid-cols-3 text-sm text-slate-300">
          <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
            <p className="font-semibold text-slate-100">Taksit / gelir oranı</p>
            <p className="mt-1">Aylık taksit net gelirin güvenli oranını aşıyorsa teklif puanı düşürülmelidir.</p>
          </article>
          <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
            <p className="font-semibold text-slate-100">Faiz hassasiyeti</p>
            <p className="mt-1">Küçük faiz farkı toplam geri ödemede büyük etki yaratır; vadeyle birlikte okuyun.</p>
          </article>
          <article className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
            <p className="font-semibold text-slate-100">Sonraki adım</p>
            <p className="mt-1">Kredi çıktısını ilan teklif senaryosu ve vergi simülasyonuyla birleştirin.</p>
          </article>
        </div>
      </ModulePanel>
    </ModuleShell>
  );
}
