import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calculator, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchPvgisSolar } from "@/lib/data/pvgisClient";
import { runGesAnalysis, type GesAnalysisResult } from "@/lib/engineering";
import { fmtNum, fmtPct } from "@/lib/engineering/formatDisplay";
import { buildGesFeasibilityMarkdown } from "@/lib/engineering/reports/gesFeasibilityReport";
import { INTELLIGENCE_HUB_PATH } from "@/lib/intelligenceHub";

function num(s: string, fallback: number): number {
  const n = Number(String(s).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

export default function GesAnalysisPage() {
  const [dcKwp, setDcKwp] = useState("5000");
  const [ghi, setGhi] = useState("1780");
  const [landM2, setLandM2] = useState("100000");
  const [price, setPrice] = useState("2.8");
  const [capexPerKwp, setCapexPerKwp] = useState("12000");
  const [discount, setDiscount] = useState("10");
  const [lat, setLat] = useState("37.87");
  const [lon, setLon] = useState("32.49");
  const [pvgisNote, setPvgisNote] = useState<string | null>(null);
  const [fetchingPvgis, setFetchingPvgis] = useState(false);
  const [result, setResult] = useState<GesAnalysisResult | null>(null);

  const loadPvgis = async () => {
    setFetchingPvgis(true);
    setPvgisNote(null);
    try {
      const data = await fetchPvgisSolar({ lat: num(lat, 37.87), lon: num(lon, 32.49), tiltDeg: 25 });
      if (data) {
        setGhi(String(Math.round(data.annualIrradiationKwhM2)));
        setPvgisNote(`PVGIS: ${data.source}`);
      } else {
        setPvgisNote("PVGIS ulasilamadi - manuel GHI kullanilir.");
      }
    } finally {
      setFetchingPvgis(false);
    }
  };

  const run = () => {
    setResult(
      runGesAnalysis({
        site: { landAreaM2: num(landM2, 100000), annualGhiKwhM2: num(ghi, 1780), tiltDeg: 25, lat: num(lat, 37.87), lon: num(lon, 32.49) },
        pv: { dcCapacityKwp: num(dcKwp, 5000), shadingLossPct: 2, soilingLossPct: 2 },
        financial: {
          electricityPriceTryPerKwh: num(price, 2.5),
          capexTryPerKwp: num(capexPerKwp, 12000),
          annualOpexTry: num(dcKwp, 5000) * 120,
          discountRatePct: num(discount, 10),
          projectYears: 25,
        },
        infrastructure: { transformerDistanceKm: 4, gridAvailabilityScore: 75 },
        environmental: { floodRiskScore: 25, seismicRiskScore: 20 },
      }),
    );
  };

  const scores = useMemo(() => result?.scorecard, [result]);

  const downloadReport = () => {
    if (!result) return;
    const md = buildGesFeasibilityMarkdown(result);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ges-fizibilite-ozeti.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div className="min-h-screen pt-24 pb-16">
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-blue-950/50 to-transparent pointer-events-none" aria-hidden />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <Button variant="ghost" size="sm" asChild className="mb-4 text-slate-400">
          <Link to={INTELLIGENCE_HUB_PATH}><ArrowLeft className="w-4 h-4 mr-1" /> Arastirma</Link>
        </Button>
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10">
            <Sun className="w-5 h-5 text-amber-300" />
          </div>
          <motion.div><h1 className="text-2xl font-bold text-white">GES muhendislik analizi</h1>
            <p className="text-sm text-slate-400">PR, DCF, NPV, IRR, LCOE - IEC/IEA</p>
          </motion.div>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="card-luxury border-white/10">
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Enlem / Boylam</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Input value={lat} onChange={(e) => setLat(e.target.value)} />
                    <Input value={lon} onChange={(e) => setLon(e.target.value)} />
                  </div>
                  <Button type="button" variant="outline" size="sm" className="mt-2 w-full" onClick={loadPvgis} disabled={fetchingPvgis}>
                    {fetchingPvgis ? "PVGIS..." : "PVGIS ile GHI doldur"}
                  </Button>
                  {pvgisNote ? <p className="text-[10px] text-slate-500 mt-1">{pvgisNote}</p> : null}
                </div>
                <div><Label>DC kWp</Label><Input value={dcKwp} onChange={(e) => setDcKwp(e.target.value)} className="mt-1" /></div>
                <div><Label>GHI</Label><Input value={ghi} onChange={(e) => setGhi(e.target.value)} className="mt-1" /></div>
                <div><Label>Arazi m2</Label><Input value={landM2} onChange={(e) => setLandM2(e.target.value)} className="mt-1" /></div>
                <div><Label>Fiyat TRY/kWh</Label><Input value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1" /></div>
                <div><Label>CAPEX/kWp</Label><Input value={capexPerKwp} onChange={(e) => setCapexPerKwp(e.target.value)} className="mt-1" /></div>
                <div><Label>Iskonto %</Label><Input value={discount} onChange={(e) => setDiscount(e.target.value)} className="mt-1" /></div>
              </div>
              <Button className="btn-primary w-full gap-2" onClick={run}><Calculator className="w-4 h-4" /> Analiz</Button>
            </CardContent>
          </Card>
          {result && scores ? (
            <motion.div className="space-y-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <div className="grid grid-cols-2 gap-3">
                {([["GES", scores.gesSuitability],["Altyapi", scores.infrastructure],["Karlilik", scores.profitability],["Bilesik", scores.overall]] as const).map(([l,v]) => (
                  <div key={l} className="card-luxury p-4 text-center"><p className="text-[10px] text-slate-500">{l}</p><p className="text-2xl font-bold text-cyan-300">{v}</p></div>
                ))}
              </div>
              <Card className="card-luxury"><CardContent className="p-5 text-sm text-slate-300 space-y-2">
                <p>Y1: <strong>{fmtNum(result.production.value.annualEnergyKwhYear1)} kWh</strong></p>
                <p>NPV: <strong>{fmtNum(result.financial.value.npvTry, { suffix: " TRY" })}</strong></p>
                <p>IRR: <strong>{fmtPct(result.financial.value.irrPct)}</strong></p>
                <p>LCOE: <strong>{fmtNum(result.financial.value.lcoeTryPerKwh, { digits: 2, suffix: " TRY/kWh" })}</strong></p>
              </CardContent></Card>
              <Button variant="outline" className="w-full" onClick={downloadReport}>Rapor indir</Button>
              <p className="text-[10px] text-slate-500">{result.disclaimer.legal}</p>
            </motion.div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}