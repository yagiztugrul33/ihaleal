import { useMemo, useState } from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { Radar, RadarChart, PolarAngleAxis, PolarGrid, ResponsiveContainer, Tooltip } from "recharts";
import { ModuleDataTable, ModulePanel, ModulePdfCta, ModuleShell, ModuleStatGrid, ModuleTag } from "./ModuleShell";
import { calculateEarthquakeRisk, type SoilClass } from "@/lib/risk/earthquakeRiskEngine";
import { analyzeDisasterRisk } from "@/lib/engineering";

type RiskRow = {
  id: string;
  tehdit: string;
  seviye: string;
  mesafe: string;
  olasilik: string;
  onlem: string;
};

const MOCK_RISK: RiskRow[] = [
  { id: "1", tehdit: "Deprem (PGA)", seviye: "Yuksek", mesafe: "—", olasilik: "%68", onlem: "Zemin etudu" },
  { id: "2", tehdit: "Heyelan", seviye: "Orta", mesafe: "1,2 km", olasilik: "%22", onlem: "Drainaj" },
  { id: "3", tehdit: "Sel / su baskini", seviye: "Dusuk", mesafe: "850 m", olasilik: "%12", onlem: "Kot kontrol" },
  { id: "4", tehdit: "Yangin riski", seviye: "Orta", mesafe: "—", olasilik: "%18", onlem: "Sigorta+" },
  { id: "5", tehdit: "Tsunami", seviye: "Dusuk", mesafe: "4,8 km", olasilik: "%4", onlem: "Evakuasyon" },
  { id: "6", tehdit: "Fay hatti", seviye: "Yuksek", mesafe: "2,4 km", olasilik: "—", onlem: "Yapisal guclendirme" },
  { id: "7", tehdit: "Erozyon", seviye: "Orta", mesafe: "600 m", olasilik: "%15", onlem: "Peyzaj" },
  { id: "8", tehdit: "Kimyasal tesis", seviye: "Dusuk", mesafe: "8,2 km", olasilik: "%3", onlem: "Bilgilendirme" },
  { id: "9", tehdit: "Orman yangini", seviye: "Orta", mesafe: "3,1 km", olasilik: "%11", onlem: "Temizlik alani" },
];

const RADAR = [
  { risk: "Deprem", skor: 82 },
  { risk: "Sel", skor: 28 },
  { risk: "Heyelan", skor: 45 },
  { risk: "Yangin", skor: 38 },
  { risk: "Tsunami", skor: 12 },
  { risk: "Erozyon", skor: 34 },
];

function levelTone(level: string): "ok" | "warn" | "risk" {
  if (level === "Dusuk") return "ok";
  if (level === "Orta") return "warn";
  return "risk";
}

export default function AfetRiskHaritasiPage() {
  const [lat, setLat] = useState("36.8969");
  const [lon, setLon] = useState("30.7133");
  const [faultDistanceKm, setFaultDistanceKm] = useState("11");
  const [pgaG, setPgaG] = useState("0.42");
  const [soilClass, setSoilClass] = useState<SoilClass>("ZC");
  const [sptN160, setSptN160] = useState("28");
  const [groundwaterDepthM, setGroundwaterDepthM] = useState("2.1");
  const [alluviumPercent, setAlluviumPercent] = useState("58");
  const [buildingAge, setBuildingAge] = useState("22");
  const [result, setResult] = useState(false);

  const risk = useMemo(() => {
    if (!result) return null;
    return calculateEarthquakeRisk({
      city: "Antalya",
      district: "Muratpasa",
      neighborhood: "",
      faultDistanceKm: Number(faultDistanceKm),
      pgaG: Number(pgaG),
      soilClass,
      fsCoefficient: soilClass === "ZA" ? 1.0 : soilClass === "ZB" ? 1.1 : soilClass === "ZC" ? 1.24 : soilClass === "ZD" ? 1.45 : 1.65,
      f1Coefficient: soilClass === "ZA" ? 1.0 : soilClass === "ZB" ? 1.1 : soilClass === "ZC" ? 1.34 : soilClass === "ZD" ? 1.55 : 1.75,
      sptN160: Number(sptN160),
      groundwaterDepthM: Number(groundwaterDepthM),
      alluviumPercent: Number(alluviumPercent),
      buildingAge: Number(buildingAge),
      structuralSystem: "reinforced_concrete",
      codeEra: Number(buildingAge) > 8 ? "pre_2018" : "post_2018",
      storyCount: 8,
      softStory: Number(buildingAge) > 15,
    });
  }, [result, faultDistanceKm, pgaG, soilClass, sptN160, groundwaterDepthM, alluviumPercent, buildingAge]);

  const disaster = useMemo(() => {
    if (!risk) return null;
    return analyzeDisasterRisk({
      seismicRiskScore: Math.round(100 - risk.totalScore),
      floodRiskScore: Math.round(Math.max(8, Number(alluviumPercent) * 0.75)),
      landslideRiskScore: Number(soilClass === "ZD" || soilClass === "ZE" ? 44 : 24),
      fireUrbanScore: 21,
      tsunamiRiskScore: 8,
      emergencyAccessScore: 67,
      slopeDeg: 4,
    }).value;
  }, [risk, alluviumPercent, soilClass]);

  const stats = risk && disaster
    ? [
        { label: "Deprem Güven Skoru", value: `${risk.totalScore} / 100`, hint: "TBDY 2018 katmanlı" },
        { label: "PGA (475 yıl)", value: `${Number(pgaG).toFixed(2)} g`, hint: "AFAD sınıfı göstergesi" },
        { label: "Bileşik Afet Riski", value: `${disaster.compositeHazardScore} / 100`, hint: "Deprem+sel+heyelan" },
        { label: "Tahliye Hazırlığı", value: `${disaster.evacuationReadinessScore} / 100`, hint: "Operasyonel erişim" },
      ]
    : [];

  const radarData = risk
    ? [
        { risk: "Fay/PGA", skor: risk.hazard.score },
        { risk: "Zemin", skor: risk.soil.score },
        { risk: "Sıvılaşma", skor: risk.liquefaction.score },
        { risk: "Yapısal", skor: risk.structural.score },
      ]
    : RADAR;

  return (
    <ModuleShell
      title="Afet Risk Haritasi"
      subtitle="Deprem, sel, heyelan ve yangin katmanlarini birlestirerek lokasyon bazli afet risk profili cikarir."
      icon={ShieldAlert}
      iconAccent="text-red-300"
      badge="GIS Risk Katmani"
    >
      <div className="mod-layout mod-layout--split">
        <ModulePanel title="Konum + TBDY 2018 girdi sorgusu">
          <form
            className="mod-form-grid"
            onSubmit={(e) => {
              e.preventDefault();
              setResult(true);
            }}
          >
            <div>
              <label htmlFor="af-lat">Enlem</label>
              <input id="af-lat" value={lat} onChange={(e) => setLat(e.target.value)} />
            </div>
            <div>
              <label htmlFor="af-lon">Boylam</label>
              <input id="af-lon" value={lon} onChange={(e) => setLon(e.target.value)} />
            </div>
            <div>
              <label htmlFor="af-fault">Fay mesafesi (km)</label>
              <input id="af-fault" value={faultDistanceKm} onChange={(e) => setFaultDistanceKm(e.target.value)} />
            </div>
            <div>
              <label htmlFor="af-pga">PGA (g)</label>
              <input id="af-pga" value={pgaG} onChange={(e) => setPgaG(e.target.value)} />
            </div>
            <div>
              <label htmlFor="af-soil">Zemin sınıfı</label>
              <select id="af-soil" value={soilClass} onChange={(e) => setSoilClass(e.target.value as SoilClass)}>
                <option value="ZA">ZA</option>
                <option value="ZB">ZB</option>
                <option value="ZC">ZC</option>
                <option value="ZD">ZD</option>
                <option value="ZE">ZE</option>
              </select>
            </div>
            <div>
              <label htmlFor="af-spt">SPT N1,60</label>
              <input id="af-spt" value={sptN160} onChange={(e) => setSptN160(e.target.value)} />
            </div>
            <div>
              <label htmlFor="af-gw">Yeraltı suyu (m)</label>
              <input id="af-gw" value={groundwaterDepthM} onChange={(e) => setGroundwaterDepthM(e.target.value)} />
            </div>
            <div>
              <label htmlFor="af-alluvium">Alüvyon (%)</label>
              <input id="af-alluvium" value={alluviumPercent} onChange={(e) => setAlluviumPercent(e.target.value)} />
            </div>
            <div>
              <label htmlFor="af-age">Yapı yaşı</label>
              <input id="af-age" value={buildingAge} onChange={(e) => setBuildingAge(e.target.value)} />
            </div>
            <div>
              <label htmlFor="af-adres">Adres notu</label>
              <textarea id="af-adres" placeholder="Mahalle, cadde veya parsel referansi" />
            </div>
            <div className="mod-form-actions">
              <button type="submit" className="mod-btn-primary">
                <AlertTriangle className="h-4 w-4" /> Risk Analizi
              </button>
            </div>
          </form>
        </ModulePanel>

        {result ? (
          <ModulePanel title={`Risk profili — ${lat}, ${lon}`}>
            <ModuleStatGrid stats={stats} />
            {risk ? (
              <p className="mb-3 rounded-lg border border-cyan-500/35 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-100">
                Yorum: {risk.interpretation}
              </p>
            ) : null}
            <ModuleDataTable
              caption="Afet tehdit tablosu"
              columns={[
                { key: "tehdit", header: "Tehdit", render: (r) => r.tehdit },
                {
                  key: "seviye",
                  header: "Seviye",
                  render: (r) => <ModuleTag tone={levelTone(r.seviye)}>{r.seviye}</ModuleTag>,
                },
                { key: "mesafe", header: "Mesafe", render: (r) => r.mesafe },
                { key: "olasilik", header: "Olasilik", render: (r) => r.olasilik },
                { key: "onlem", header: "Onerilen Onlem", render: (r) => r.onlem },
              ]}
              rows={MOCK_RISK}
            />
            <div className="mod-chart">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                  <PolarGrid stroke="rgba(255,255,255,0.12)" />
                  <PolarAngleAxis dataKey="risk" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
                  <Radar dataKey="skor" stroke="#f87171" fill="rgba(248,113,113,0.35)" />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            {disaster ? (
              <div className="mt-3 rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-300">
                <p className="font-semibold text-slate-100">Baskın tehditler: {disaster.dominantHazards.join(", ") || "Düşük profil"}</p>
                <p className="mt-1">Azaltım önerisi: {disaster.mitigations[0] ?? "Saha etüdü + tahliye planı güncelle."}</p>
              </div>
            ) : null}
            <div className="mt-3 rounded-lg border border-amber-500/35 bg-amber-500/10 p-3 text-xs text-amber-100">
              Dürüst sınır: Bu ekran ön analizdir. Resmi afet/risk kararı için lisanslı jeoloji ve inşaat müh. raporu zorunludur.
            </div>
            <ModulePdfCta label="Afet risk haritasi PDF" />
          </ModulePanel>
        ) : (
          <div className="mod-empty">Konum bilgisini girin; fay yakınlığı, zemin bandı ve operasyonel risk katmanlarını tek harita çıktısında görün.</div>
        )}
      </div>
    </ModuleShell>
  );
}
