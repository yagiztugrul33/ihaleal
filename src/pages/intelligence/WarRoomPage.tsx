import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Download, Layers, Loader2, MapPin, Radar, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataQualityBadge } from "@/components/intelligence/DataQualityBadge";
import { ScoreBadge } from "@/components/intelligence/ScoreBadge";
import type { IntelligenceMapLayer } from "@/components/intelligence/IntelligenceMap";
import { fetchSiteEnvironmentalData, type SiteEnvironmentalBundle } from "@/lib/data/siteEnvironmentalData";
import { fmtScore } from "@/lib/engineering/formatDisplay";
import { runSiteIntelligence, type SiteIntelligenceResult } from "@/lib/engineering/urban/siteIntelligence";
import { buildInstitutionalSiteReport } from "@/lib/engineering/reports/institutionalReport";
import { saveAnalysisRun, listAnalysisRuns, type AnalysisRunRow } from "@/lib/engineering/persistence/analysisRuns";
import { INTELLIGENCE_HUB_PATH } from "@/lib/intelligenceHub";

const MapLazy = lazy(() => import("@/components/intelligence/IntelligenceMap"));
const DEFAULT_CENTER: [number, number] = [37.87, 32.49];
const ZEMIN_OPTIONS = ["ZA", "ZB", "ZC", "ZD", "ZE"] as const;

function parseCoord(s: string): number | null {
  const n = Number(String(s).replace(",", ".").trim());
  return Number.isFinite(n) ? n : null;
}

function MapFallback() {
  return (
    <div className="h-full min-h-[320px] flex items-center justify-center bg-slate-900/80 border border-white/10 rounded-xl">
      <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
    </div>
  );
}

export default function WarRoomPage() {
  const [lat, setLat] = useState("37.87");
  const [lon, setLon] = useState("32.49");
  const [label, setLabel] = useState("Konya / Karapinar");
  const [zemin, setZemin] = useState("ZC");
  const [pga, setPga] = useState("0.35");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [env, setEnv] = useState<SiteEnvironmentalBundle | null>(null);
  const [result, setResult] = useState<SiteIntelligenceResult | null>(null);
  const [history, setHistory] = useState<AnalysisRunRow[]>([]);
  const [showRiskLayer, setShowRiskLayer] = useState(true);

  useEffect(() => {
    void listAnalysisRuns(8).then(setHistory);
  }, []);

  const runAnalysis = useCallback(async () => {
    const la = parseCoord(lat);
    const lo = parseCoord(lon);
    if (la == null || lo == null || la < -90 || la > 90 || lo < -180 || lo > 180) {
      setError("Gecerli enlem/boylam girin.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const environmental = await fetchSiteEnvironmentalData({ lat: la, lon: lo, tiltDeg: 25 });
      setEnv(environmental);
      const pgaG = parseCoord(pga) ?? 0.35;
      const site = runSiteIntelligence({
        lat: la,
        lon: lo,
        label,
        environmental,
        geotech: { zeminSinifi: zemin, groundwaterDepthM: 6 },
        seismic: { pgaG, faultDistanceKm: 12 },
        ges: environmental.pvgis
          ? {
              site: {
                landAreaM2: 100_000,
                annualGhiKwhM2: environmental.pvgis.annualIrradiationKwhM2,
                lat: la,
                lon: lo,
                tiltDeg: 25,
              },
              pv: { dcCapacityKwp: 5000 },
              financial: {
                electricityPriceTryPerKwh: 2.6,
                annualOpexTry: 450_000,
                discountRatePct: 10,
                projectYears: 25,
                capexTryPerKwp: 11_500,
              },
            }
          : undefined,
        buildingHeightM: 32,
      });
      setResult(site);
      await saveAnalysisRun({
        analysisType: "war_room",
        label,
        confidence: environmental.dataQuality,
        inputJson: { lat: la, lon: lo, label },
        resultJson: { strategicScore: site.strategicScore, summary: site.executiveSummary },
      });
      setHistory(await listAnalysisRuns(8));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analiz hatasi");
    } finally {
      setLoading(false);
    }
  }, [lat, lon, label, zemin, pga]);

  const center = useMemo((): [number, number] => {
    const la = parseCoord(lat);
    const lo = parseCoord(lon);
    return la != null && lo != null ? [la, lo] : DEFAULT_CENTER;
  }, [lat, lon]);

  const mapLayers = useMemo((): IntelligenceMapLayer[] => {
    if (!result) return [];
    const la = parseCoord(lat);
    const lo = parseCoord(lon);
    if (la == null || lo == null) return [];
    const layers: IntelligenceMapLayer[] = [
      { id: "site", lat: la, lon: lo, label, score: result.strategicScore, kind: "opportunity" },
    ];
    if (showRiskLayer) {
      layers.push({
        id: "risk",
        lat: la + 0.008,
        lon: lo + 0.008,
        label: "Afet",
        score: result.disaster.value.compositeHazardScore,
        kind: "risk",
      });
    }
    return layers;
  }, [result, lat, lon, label, showRiskLayer]);

  const downloadReport = () => {
    if (!result) return;
    const md = buildInstitutionalSiteReport(result, env);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kurumsal-site-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-[#030712]">
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-blue-950/70 to-transparent pointer-events-none" />
      <div className="relative max-w-[1680px] mx-auto px-4 sm:px-6">
        <Button variant="ghost" size="sm" asChild className="mb-4 text-slate-400">
          <Link to={INTELLIGENCE_HUB_PATH}><ArrowLeft className="w-4 h-4 mr-1" /> Arastirma</Link>
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div className="flex gap-3">
            <Radar className="w-10 h-10 text-blue-400 shrink-0" />
            <div>
              <h1 className="text-3xl font-bold text-white">Stratejik War Room</h1>
              <p className="text-sm text-slate-400 mt-1">GIS + muhendislik istihbarati</p>
            </div>
          </div>
          {env ? <DataQualityBadge quality={env.dataQuality} limitations={env.limitations} /> : null}
        </div>
        {error ? (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 flex gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />{error}
          </div>
        ) : null}
        <div className="grid xl:grid-cols-12 gap-4">
          <Card className="xl:col-span-3 card-luxury"><CardContent className="p-5 space-y-3">
            <Label>Etiket</Label><Input value={label} onChange={(e) => setLabel(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Lat</Label><Input value={lat} onChange={(e) => setLat(e.target.value)} /></div>
              <div><Label>Lon</Label><Input value={lon} onChange={(e) => setLon(e.target.value)} /></div>
            </div>
            <Label>Zemin</Label>
            <select value={zemin} onChange={(e) => setZemin(e.target.value)} className="w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm">
              {ZEMIN_OPTIONS.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
            <Label>PGA (g)</Label><Input value={pga} onChange={(e) => setPga(e.target.value)} />
            <label className="flex gap-2 text-xs text-slate-400"><input type="checkbox" checked={showRiskLayer} onChange={(e) => setShowRiskLayer(e.target.checked)} /><Layers className="w-4 h-4" />Risk katmani</label>
            <Button className="btn-primary w-full gap-2" onClick={runAnalysis} disabled={loading}>{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}Analiz</Button>
            {result ? <Button variant="outline" className="w-full gap-2" onClick={downloadReport}><Download className="w-4 h-4" />Rapor</Button> : null}
          </CardContent></Card>
          <div className="xl:col-span-6 h-[min(70vh,600px)] relative">
            {loading ? <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/80 rounded-xl"><Loader2 className="w-10 h-10 animate-spin text-cyan-400" /></div> : null}
            <Suspense fallback={<MapFallback />}><MapLazy center={center} zoom={10} layers={mapLayers} activeLayerId="site" className="h-full" /></Suspense>
          </div>
          <div className="xl:col-span-3 space-y-3">
            {result ? (<>
              <Card className="card-luxury"><CardContent className="p-5"><p className="text-xs text-slate-500">Skor</p><p className="text-5xl font-bold text-cyan-300">{fmtScore(result.strategicScore)}</p></CardContent></Card>
              <div className="grid grid-cols-2 gap-2">
                <ScoreBadge label="Deprem" score={result.seismic.value.seismicRiskScore} />
                <ScoreBadge label="Afet" score={result.disaster.value.compositeHazardScore} />
                <ScoreBadge label="Zemin" score={result.soil.value.slopeStabilityScore} invert />
                <ScoreBadge label="Yangin" score={result.fire.value.complianceScore} invert />
              </div>
              <Card className="card-luxury"><CardContent className="p-4 text-xs text-slate-300 max-h-40 overflow-y-auto">{result.executiveSummary.map((l) => <p key={l}>{l}</p>)}</CardContent></Card>
            </>) : (
              <Card className="card-luxury"><CardContent className="p-6 text-sm text-slate-400"><RefreshCw className="w-8 h-8 mb-2" />Sonuclar burada.</CardContent></Card>
            )}
            {history.length > 0 ? <Card className="card-luxury"><CardContent className="p-4 text-xs text-slate-500">{history.map((h) => <p key={h.id}>{h.analysis_type}</p>)}</CardContent></Card> : null}
          </div>
        </div>
        {result ? <Card className="mt-4 card-luxury"><CardContent className="p-4 text-xs text-slate-500"><ul className="list-disc list-inside">{result.aiReasoning.map((r) => <li key={r}>{r}</li>)}</ul><p className="mt-2">{result.disclaimer.legal}</p></CardContent></Card> : null}
        </div>
      </div>
    );
  }