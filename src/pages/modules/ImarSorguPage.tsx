import { useState } from "react";
import { FileSearch, Landmark } from "lucide-react";
import { ModuleDataTable, ModulePanel, ModulePdfCta, ModuleShell, ModuleStatGrid, ModuleTag } from "./ModuleShell";

type ImarRow = {
  id: string;
  plan: string;
  fonksiyon: string;
  emsal: string;
  taks: string;
  kat: string;
  durum: string;
};

const MOCK_IMAR: ImarRow[] = [
  { id: "1", plan: "Uygulama 2019", fonksiyon: "Konut", emsal: "1,80", taks: "0,35", kat: "5", durum: "Yururlukte" },
  { id: "2", plan: "Revizyon 2024", fonksiyon: "Konut+", emsal: "2,00", taks: "0,40", kat: "6", durum: "Onay bekliyor" },
  { id: "3", plan: "Koruma alani", fonksiyon: "SIT", emsal: "0,40", taks: "0,20", kat: "2", durum: "Kisitli" },
  { id: "4", plan: "Cephe hatti", fonksiyon: "Ticari alt", emsal: "—", taks: "—", kat: "1", durum: "Zorunlu" },
  { id: "5", plan: "Yol genisletme", fonksiyon: "Kamulastirma", emsal: "—", taks: "—", kat: "—", durum: "Proje" },
  { id: "6", plan: "Yesil alan", fonksiyon: "Park", emsal: "—", taks: "—", kat: "—", durum: "Koruma" },
  { id: "7", plan: "Enerji hattı", fonksiyon: "TEİAŞ koridor", emsal: "—", taks: "—", kat: "—", durum: "Irtifak" },
  { id: "8", plan: "Deprem bolgesi", fonksiyon: "Guclendirme", emsal: "1,60", taks: "0,30", kat: "4", durum: "Kosullu" },
  { id: "9", plan: "Otopark zorunlulugu", fonksiyon: "Altyapi", emsal: "—", taks: "—", kat: "—", durum: "Zorunlu" },
];

export default function ImarSorguPage() {
  const [belediye, setBelediye] = useState("Antalya Buyuksehir");
  const [ada, setAda] = useState("4521");
  const [parsel, setParsel] = useState("14");
  const [result, setResult] = useState(true);

  const stats = [
    { label: "Guncel Fonksiyon", value: "Konut", hint: "Plan notu A-12" },
    { label: "Max EMSAL", value: "1,80", hint: "Uygulama 2019" },
    { label: "Insaat Hakki", value: "2.232 m2", hint: "Parsel alani x EMSAL" },
    { label: "Plan Uyum Skoru", value: "92 / 100", hint: "Cakisma yok" },
  ];

  return (
    <ModuleShell
      title="Imar Sorgu"
      subtitle="Belediye plan notlari, fonksiyon degisikligi ve insaat hakki hesaplarini tek ekranda goruntuleyin."
      icon={Landmark}
      iconAccent="text-emerald-300"
      badge="Planlama Modulu"
    >
      <div className="mod-layout mod-layout--split">
        <ModulePanel title="Imar Sorgu Formu">
          <form
            className="mod-form-grid"
            onSubmit={(e) => {
              e.preventDefault();
              setResult(true);
            }}
          >
            <div>
              <label htmlFor="im-belediye">Belediye</label>
              <input id="im-belediye" value={belediye} onChange={(e) => setBelediye(e.target.value)} />
            </div>
            <div>
              <label htmlFor="im-ada">Ada</label>
              <input id="im-ada" value={ada} onChange={(e) => setAda(e.target.value)} />
            </div>
            <div>
              <label htmlFor="im-parsel">Parsel</label>
              <input id="im-parsel" value={parsel} onChange={(e) => setParsel(e.target.value)} />
            </div>
            <div className="mod-form-actions">
              <button type="submit" className="mod-btn-primary">
                <FileSearch className="h-4 w-4" /> Sorgula
              </button>
            </div>
          </form>
        </ModulePanel>

        {result ? (
          <ModulePanel title={`${belediye} — Ada ${ada} / Parsel ${parsel}`}>
            <ModuleStatGrid stats={stats} />
            <ModuleDataTable
              caption="Plan katmanlari ve notlar"
              columns={[
                { key: "plan", header: "Plan", render: (r) => r.plan },
                { key: "fonksiyon", header: "Fonksiyon", render: (r) => r.fonksiyon },
                { key: "emsal", header: "EMSAL", render: (r) => r.emsal },
                { key: "taks", header: "TAKS", render: (r) => r.taks },
                { key: "kat", header: "Kat", render: (r) => r.kat },
                {
                  key: "durum",
                  header: "Durum",
                  render: (r) => (
                    <ModuleTag
                      tone={
                        r.durum === "Yururlukte"
                          ? "ok"
                          : r.durum.includes("bekliyor") || r.durum === "Proje"
                            ? "warn"
                            : "risk"
                      }
                    >
                      {r.durum}
                    </ModuleTag>
                  ),
                },
              ]}
              rows={MOCK_IMAR}
            />
            <ModulePdfCta label="Imar durum ozeti PDF" />
          </ModulePanel>
        ) : (
          <div className="mod-empty">Parsel bilgilerini girin; imar durumu, yapılaşma sınırları ve sözleşme öncesi kontrol başlıkları birlikte listelensin.</div>
        )}
      </div>
    </ModuleShell>
  );
}
