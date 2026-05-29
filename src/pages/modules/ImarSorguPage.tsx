import { useMemo, useState } from "react";
import { FileSearch, Landmark } from "lucide-react";
import { ModuleDataTable, ModulePanel, ModulePdfCta, ModuleShell, ModuleStatGrid, ModuleTag } from "./ModuleShell";
import { computeKkaBuildingSummary } from "@/lib/finance/kkaParselImarEngine";
import { runParcelIntelligence } from "@/lib/engineering";

type ImarRow = {
  id: string;
  plan: string;
  fonksiyon: string;
  emsal: string;
  taks: string;
  kat: string;
  durum: string;
};

export default function ImarSorguPage() {
  const [belediye, setBelediye] = useState("Antalya Buyuksehir");
  const [ada, setAda] = useState("4521");
  const [parsel, setParsel] = useState("14");
  const [il, setIl] = useState("Antalya");
  const [ilce, setIlce] = useState("Muratpasa");
  const [landM2, setLandM2] = useState("1240");
  const [ownerShare, setOwnerShare] = useState("30");
  const [planConsistency, setPlanConsistency] = useState("72");
  const [distanceInfra, setDistanceInfra] = useState("2.4");
  const [priceMomentum, setPriceMomentum] = useState("11");
  const [error, setError] = useState("");
  const [result, setResult] = useState(true);

  const summary = useMemo(() => {
    if (!result) return null;
    const land = Number(landM2);
    if (!Number.isFinite(land) || land <= 0) return null;
    try {
      return computeKkaBuildingSummary({
        il,
        ilce,
        koy: "",
        mahalle: "",
        ada,
        parsel,
        landAreaM2: land,
        ownerShareOfSellable: Math.max(0.1, Math.min(0.55, Number(ownerShare) / 100)),
        assumedNetUnitM2: 110,
      });
    } catch {
      return null;
    }
  }, [result, landM2, il, ilce, ada, parsel, ownerShare]);

  const parcelIntelligence = useMemo(() => {
    if (!summary) return null;
    try {
      return runParcelIntelligence({
        parcel: {
          il,
          ilce,
          koy: "",
          mahalle: "",
          ada,
          parsel,
          landAreaM2: Number(landM2),
          ownerShareOfSellable: Math.max(0.1, Math.min(0.55, Number(ownerShare) / 100)),
          assumedNetUnitM2: 110,
        },
        zoningFactors: {
          urbanProximityScore: Math.max(0, Math.min(100, Number(planConsistency))),
          transportProjectScore: Math.max(0, Math.min(100, 100 - Number(distanceInfra) * 15)),
          industrialExpansionScore: Math.max(0, Math.min(100, Number(priceMomentum) * 3 + 50)),
          demographicGrowthScore: Math.max(0, Math.min(100, Number(priceMomentum) * 2 + 45)),
          existingZoningDensityScore: Math.max(0, Math.min(100, Number(planConsistency) - 6)),
          currentLandUse: "tarla",
          horizonYears: 7,
        },
      });
    } catch {
      return null;
    }
  }, [summary, il, ilce, ada, parsel, landM2, ownerShare, planConsistency, distanceInfra, priceMomentum]);

  const stats = summary
    ? [
        { label: "Guncel Fonksiyon", value: summary.profile.zoningLabel, hint: `Plan anahtarı ${summary.profile.matchedKey}` },
        { label: "Max EMSAL", value: summary.effectiveEmsal.toFixed(2), hint: "kkaParselImarEngine" },
        { label: "Insaat Hakki", value: `${Math.round(summary.grossConstructionRightM2).toLocaleString("tr-TR")} m2`, hint: "Parsel alani x EMSAL" },
        { label: "Plan Uyum Skoru", value: parcelIntelligence ? `${parcelIntelligence.compositeScore} / 100` : "—", hint: "parcelEngine birleşik skor" },
      ]
    : [];

  const tableRows: ImarRow[] = summary
    ? [
        {
          id: "1",
          plan: "Temel imar profili",
          fonksiyon: summary.profile.zoningLabel,
          emsal: summary.effectiveEmsal.toFixed(2),
          taks: summary.effectiveTaks.toFixed(2),
          kat: String(summary.cappedFloorsBuildable),
          durum: summary.profile.resolutionSource === "default" ? "Kontrol gerekli" : "Yururlukte",
        },
        {
          id: "2",
          plan: "Taban oturumu",
          fonksiyon: "TAKS etkisi",
          emsal: "—",
          taks: summary.effectiveTaks.toFixed(2),
          kat: `${Math.round(summary.maxFootprintM2)} m2`,
          durum: "Hesaplandi",
        },
        {
          id: "3",
          plan: "Arsa pay dagilimi",
          fonksiyon: "Sahip/Muteahhit",
          emsal: "—",
          taks: "—",
          kat: `${Math.round(summary.ownerApproxSellableM2)} / ${Math.round(summary.contractorApproxSellableM2)} m2`,
          durum: "On analiz",
        },
        {
          id: "4",
          plan: "Imar gecis olasiligi",
          fonksiyon: "parcelEngine",
          emsal: "—",
          taks: "—",
          kat: parcelIntelligence ? `%${parcelIntelligence.zoning.value.transitionProbabilityPct.toFixed(1)}` : "—",
          durum: parcelIntelligence ? "Skorlandi" : "Bekliyor",
        },
      ]
    : [];

  return (
    <ModuleShell
      title="Imar Sorgu"
      subtitle="Hero + yöntem + örnek + dürüst sınır: belediye plan notları ve parsel fizibilite motorunu tek ekranda birleştirir."
      icon={Landmark}
      iconAccent="text-emerald-300"
      badge="Planlama Modulu"
    >
      <div className="mod-hero-panel">
        <h2>İmar istihbaratı: parsel kararını tek bakışta netleştir.</h2>
        <p>
          Bu modül `kkaParselImarEngine` + `parcelEngine` kullanır. Çıktılar demo/ön analizdir; resmi imar belgesi,
          tapu kayıtları ve uzman görüşü olmadan bağlayıcı kabul edilmez.
        </p>
      </div>
      <div className="mod-layout mod-layout--split">
        <ModulePanel title="Imar Sorgu Formu">
          <form
            className="mod-form-grid"
            onSubmit={(e) => {
              e.preventDefault();
              const land = Number(landM2);
              if (!Number.isFinite(land) || land <= 0) {
                setError("Geçerli arsa m² girin.");
                setResult(false);
                return;
              }
              setError("");
              setResult(true);
            }}
          >
            <div>
              <label htmlFor="im-il">Il</label>
              <input id="im-il" value={il} onChange={(e) => setIl(e.target.value)} />
            </div>
            <div>
              <label htmlFor="im-ilce">Ilce</label>
              <input id="im-ilce" value={ilce} onChange={(e) => setIlce(e.target.value)} />
            </div>
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
            <div>
              <label htmlFor="im-land">Arsa m2</label>
              <input id="im-land" value={landM2} onChange={(e) => setLandM2(e.target.value)} />
            </div>
            <div>
              <label htmlFor="im-owner">Arsa sahibi payi (%)</label>
              <input id="im-owner" value={ownerShare} onChange={(e) => setOwnerShare(e.target.value)} />
            </div>
            <div>
              <label htmlFor="im-plan">Plan uyumu (0-100)</label>
              <input id="im-plan" value={planConsistency} onChange={(e) => setPlanConsistency(e.target.value)} />
            </div>
            <div>
              <label htmlFor="im-infra">Altyapi mesafesi (km)</label>
              <input id="im-infra" value={distanceInfra} onChange={(e) => setDistanceInfra(e.target.value)} />
            </div>
            <div>
              <label htmlFor="im-momentum">Piyasa momentumu</label>
              <input id="im-momentum" value={priceMomentum} onChange={(e) => setPriceMomentum(e.target.value)} />
            </div>
            <div className="mod-form-actions">
              <button type="submit" className="mod-btn-primary">
                <FileSearch className="h-4 w-4" /> Sorgula
              </button>
            </div>
            {error ? <p className="mod-form-error">{error}</p> : null}
          </form>
        </ModulePanel>

        {result && summary ? (
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
              rows={tableRows}
            />
            <div className="mod-note-box">
              <p>
                Örnek senaryo: {il}/{ilce} bölgesinde {landM2} m² parsel için birleşik skor{" "}
                <strong>{parcelIntelligence ? `${parcelIntelligence.compositeScore}/100` : "hesaplanamadı"}</strong>.
              </p>
              <p className="mt-1">
                CTA: Sonraki adım olarak KKA Studio ve War Room ekranlarında teknik/finansal derin analize geçin.
              </p>
            </div>
            <ModulePdfCta label="Imar durum ozeti PDF" />
          </ModulePanel>
        ) : (
          <div className="mod-empty">Parsel bilgilerini girin; imar durumu, yapılaşma sınırları ve sözleşme öncesi kontrol başlıkları birlikte listelensin.</div>
        )}
      </div>
    </ModuleShell>
  );
}
