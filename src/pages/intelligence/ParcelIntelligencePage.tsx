import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPinned, Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  buildParcelMarkdownReport,
  safeCalculateParcelFeasibility,
  reportId,
  runParcelIntelligence,
  type ParcelEngineFeasibilityResult as ParcelFeasibilityResult,
  type ParcelInputs,
  type ParcelIntelligenceResult,
} from "@/lib/engineering";
import { fmtNum, fmtScore } from "@/lib/engineering/formatDisplay";
import { PreFeasibilityBanner } from "@/components/compliance/PreFeasibilityBanner";
import { INTELLIGENCE_HUB_PATH } from "@/lib/intelligenceHub";
import { auditSubmissionData } from "@/lib/security/fraudEngine";

function n(s: string, fb: number) {
  const v = Number(String(s).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(v) ? v : fb;
}

type Step = 1 | 2 | 3;

export default function ParcelIntelligencePage() {
  const [step, setStep] = useState<Step>(1);
  const [il, setIl] = useState("Konya");
  const [ilce, setIlce] = useState("Karapinar");
  const [ada, setAda] = useState("123");
  const [parsel, setParsel] = useState("45");
  const [landM2, setLandM2] = useState("25000");
  const [emsal, setEmsal] = useState("1.2");
  const [taks, setTaks] = useState("0.35");
  const [salesPerM2, setSalesPerM2] = useState("45000");
  const [costPerM2, setCostPerM2] = useState("28000");
  const [contractorPct, setContractorPct] = useState("50");
  const [urban, setUrban] = useState([65]);
  const [transport, setTransport] = useState([55]);
  const [includeGes, setIncludeGes] = useState(true);
  const [error, setError] = useState("");
  const [engineInputs, setEngineInputs] = useState<ParcelInputs | null>(null);
  const [feasResult, setFeasResult] = useState<ParcelFeasibilityResult | null>(null);
  const [intelResult, setIntelResult] = useState<ParcelIntelligenceResult | null>(null);

  const runEngine = () => {
    setError("");
    try {
    const land = n(landM2, 25000);
    const fraud = auditSubmissionData({ landAreaM2: land, emsal: n(emsal, 1.2), taks: n(taks, 0.35) });
    if (fraud.blocked) {
      setError("Girdi dogrulamasi basarisiz. EMSAL/TAKS veya alan degerlerini kontrol edin.");
      return;
    }
    const inputs: ParcelInputs = {
      landAreaM2: land,
      emsal: n(emsal, 1.2),
      taks: n(taks, 0.35),
      contractorSharePercent: n(contractorPct, 50),
      estimatedSalesPricePerM2: n(salesPerM2, 45000),
      estimatedCostPricePerM2: n(costPerM2, 28000),
    };
    setEngineInputs(inputs);
    setFeasResult(safeCalculateParcelFeasibility(inputs));
    setIntelResult(
      runParcelIntelligence({
        parcel: {
          il,
          ilce,
          koy: "",
          mahalle: "",
          ada,
          parsel,
          landAreaM2: land,
          ownerShareOfSellable: 0.35,
          assumedNetUnitM2: 95,
        },
        zoningFactors: {
          urbanProximityScore: urban[0],
          transportProjectScore: transport[0],
          industrialExpansionScore: 50,
          demographicGrowthScore: 60,
          existingZoningDensityScore: 40,
          currentLandUse: "tarla",
        },
        ges: (includeGes
          ? {
              site: { landAreaM2: land, annualGhiKwhM2: 1900, regionKey: "konya" },
              pv: { dcCapacityKwp: Math.max(100, land / 20) },
              financial: {
                electricityPriceTryPerKwh: 2.6,
                capexTryPerKwp: 11500,
                annualOpexTry: 500_000,
                discountRatePct: 10,
                projectYears: 25,
              },
            }
          : undefined) as never,
      }),
    );
    setStep(3);
    } catch {
      setError("Parsel hesaplamasi tamamlanamadi.");
      setFeasResult(null);
      setIntelResult(null);
    }
  };

  const downloadReport = () => {
    if (!feasResult || !engineInputs) return;
    const id = reportId("PARSEL-PRE");
    const md = buildParcelMarkdownReport(id, engineInputs, feasResult);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Parsel_On_Fizibilite_${id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div className="min-h-screen bg-[#030712] text-white pt-24 pb-16">
      <motion.div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <Button variant="ghost" size="sm" asChild className="mb-4 text-slate-400">
          <Link to={INTELLIGENCE_HUB_PATH}>
            <ArrowLeft className="rtl:rotate-180 w-4 h-4 me-1" /> Arastirma
          </Link>
        </Button>
        <motion.div className="flex items-center gap-3 mb-4">
          <MapPinned className="w-8 h-8 text-cyan-400" />
          <motion.div>
            <h1 className="text-2xl font-normal">Ada Parsel İstihbarat (Ön Fizibilite)</h1>
            <p className="text-sm text-slate-400">EMSAL/TAKS, kat adedi, muteahhit paylasimi</p>
          </motion.div>
        </motion.div>

        <div className="mb-6 flex gap-2 text-xs text-slate-500">
          {[1, 2, 3].map((s) => (
            <span key={s} className={`rounded-full px-3 py-1 border ${step === s ? "border-cyan-400/50 text-cyan-100" : "border-white/10"}`}>
              Adim {s}
            </span>
          ))}
        </div>

        <PreFeasibilityBanner />

        {error && <p className="mb-4 text-sm text-red-300">{error}</p>}

        <motion.div className="grid lg:grid-cols-2 gap-8">
          <Card className="border border-white/10 bg-white/[0.04] backdrop-blur-md">
            <CardContent className="p-6 space-y-4">
              {step === 1 && (
                <>
                  <motion.div className="grid grid-cols-2 gap-3">
                    <div><Label>Il</Label><Input value={il} onChange={(e) => setIl(e.target.value)} className="mt-1 bg-[#0f172a] border-slate-800" /></div>
                    <motion.div><Label>Ilce</Label><Input value={ilce} onChange={(e) => setIlce(e.target.value)} className="mt-1 bg-[#0f172a] border-slate-800" /></motion.div>
                    <motion.div><Label>Ada</Label><Input value={ada} onChange={(e) => setAda(e.target.value)} className="mt-1 bg-[#0f172a] border-slate-800" /></motion.div>
                    <motion.div><Label>Parsel</Label><Input value={parsel} onChange={(e) => setParsel(e.target.value)} className="mt-1 bg-[#0f172a] border-slate-800" /></motion.div>
                  </motion.div>
                  <div><Label>Alan (m2)</Label><Input value={landM2} onChange={(e) => setLandM2(e.target.value)} className="mt-1 bg-[#0f172a] border-slate-800" /></div>
                  <Button className="w-full" onClick={() => setStep(2)}>Devam</Button>
                </>
              )}
              {step === 2 && (
                <>
                  <motion.div className="grid grid-cols-2 gap-3">
                    <motion.div><Label>EMSAL</Label><Input value={emsal} onChange={(e) => setEmsal(e.target.value)} className="mt-1 bg-[#0f172a] border-slate-800" /></motion.div>
                    <motion.div><Label>TAKS</Label><Input value={taks} onChange={(e) => setTaks(e.target.value)} className="mt-1 bg-[#0f172a] border-slate-800" /></motion.div>
                    <motion.div><Label>Satis TRY/m2</Label><Input value={salesPerM2} onChange={(e) => setSalesPerM2(e.target.value)} className="mt-1 bg-[#0f172a] border-slate-800" /></motion.div>
                    <motion.div><Label>Maliyet TRY/m2</Label><Input value={costPerM2} onChange={(e) => setCostPerM2(e.target.value)} className="mt-1 bg-[#0f172a] border-slate-800" /></motion.div>
                    <motion.div className="col-span-2"><Label>Muteahhit payi %</Label><Input value={contractorPct} onChange={(e) => setContractorPct(e.target.value)} className="mt-1 bg-[#0f172a] border-slate-800" /></motion.div>
                  </motion.div>
                  <div><Label>Kentsel yakinlik: {urban[0]}</Label><Slider value={urban} onValueChange={setUrban} max={100} step={1} className="mt-2" /></div>
                  <div><Label>Ulasim: {transport[0]}</Label><Slider value={transport} onValueChange={setTransport} max={100} step={1} className="mt-2" /></div>
                  <label className="flex items-center gap-2 text-sm text-slate-400">
                    <input type="checkbox" checked={includeGes} onChange={(e) => setIncludeGes(e.target.checked)} />
                    GES katmani dahil
                  </label>
                  <motion.div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep(1)}>Geri</Button>
                    <Button className="flex-1 gap-2" onClick={runEngine}><Search className="w-4 h-4" /> Hesapla</Button>
                  </motion.div>
                </>
              )}
              {step === 3 && feasResult && (
                <Button variant="outline" onClick={() => setStep(2)}>Parametreleri duzenle</Button>
              )}
            </CardContent>
          </Card>

          {step === 3 && feasResult ? (
            <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="rounded-[20px] border border-cyan-500/30 bg-cyan-500/10 p-6">
                <p className="text-4xl font-normal text-cyan-300">{fmtScore(feasResult.feasibilityScore)}/100</p>
                <p className="text-xs text-slate-400 mt-1">Uygunluk skoru (ön fizibilite)</p>
              </div>
              <Card className="border border-white/10 bg-white/[0.04]">
                <CardContent className="p-5 text-sm text-slate-300 space-y-2">
                  <p>Maks. insaat: <strong>{fmtNum(feasResult.maxConstructionArea)} m2</strong></p>
                  <p>Taban (TAKS): <strong>{fmtNum(feasResult.footprint)} m2</strong></p>
                  <p>Kat: <strong>{feasResult.requiredFloors}</strong> · Birim: <strong>{feasResult.estimatedUnitCount}</strong></p>
                  <p>Muteahhit / Arsa sahibi: <strong>{fmtNum(feasResult.contractorShareM2)}</strong> / <strong>{fmtNum(feasResult.landownerShareM2)} m2</strong></p>
                  <p>Kar marji: <strong>{fmtNum(feasResult.profitMarginPercent, { digits: 1 })}%</strong></p>
                  {feasResult.warnings.map((w) => (
                    <p key={w} className="text-[10px] text-amber-400/90">{w}</p>
                  ))}
                </CardContent>
              </Card>
              {intelResult && (
                <Card className="border border-white/10 bg-white/[0.04]">
                  <CardContent className="p-5 text-sm text-slate-300">
                    <p className="text-lg font-normal text-cyan-300">Bolge indeksi: {intelResult.compositeScore}/100</p>
                  </CardContent>
                </Card>
              )}
              <Button className="w-full gap-2" onClick={downloadReport}>
                <Download className="w-4 h-4" /> Markdown rapor indir
              </Button>
            </motion.div>
          ) : null}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}