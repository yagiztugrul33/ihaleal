import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle, ArrowLeft, Download, Layers, Loader2, MapPin, Radar, RefreshCw,
  BookOpen, Info, Scale, ScrollText, CheckCircle2,
} from "lucide-react";
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
        ges: (environmental.pvgis
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
          : undefined) as never,
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
    <div className="min-h-screen pt-20 pb-12 intelligence-page bg-[#030712]">
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-blue-950/70 to-transparent pointer-events-none" />
      <div className="relative max-w-[1680px] mx-auto px-4 sm:px-6">
        <Button variant="ghost" size="sm" asChild className="mb-4 text-slate-400">
          <Link to={INTELLIGENCE_HUB_PATH}><ArrowLeft className="rtl:rotate-180 w-4 h-4 me-1" /> Araştırma</Link>
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div className="flex gap-3">
            <Radar className="w-10 h-10 text-blue-400 shrink-0" />
            <div>
              <h1 className="text-3xl font-bold text-white">Stratejik War Room</h1>
              <p className="text-sm text-slate-400 mt-1">Yatırım risk analizi — deprem, zemin, çevresel risk profili</p>
            </div>
          </div>
          {env ? <DataQualityBadge quality={env.dataQuality} limitations={env.limitations} /> : null}
        </div>

        {/* KATMAN 1 — Eğitici giriş (form ÖNCESI, jargon yok, açık dil) */}
        <section className="mb-6 space-y-3">
          <Card className="card-luxury border-blue-500/20">
            <CardContent className="p-5">
              <div className="flex items-start gap-3 mb-3">
                <BookOpen className="h-5 w-5 text-blue-300 flex-shrink-0 mt-0.5" />
                <h2 className="text-base font-semibold text-white">War Room nedir, kime, neden?</h2>
              </div>
              <p className="text-sm text-slate-300 mb-3 leading-relaxed">
                <strong className="text-white">Bir arsanın deprem, zemin ve çevresel risk profilini çıkarır.</strong>
                Yatırım kararından önce: "Burası güvenli mi? Yapı maliyeti normal mi? Kira getirisi
                bu risk için yeterli mi?" sorularına ışık tutar.
              </p>
              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div className="rounded-lg border border-blue-400/15 bg-slate-900/30 p-3">
                  <p className="font-semibold text-blue-300 mb-1">👤 Yatırımcı için</p>
                  <p className="text-slate-300">
                    300-500M arsa kararı vermeden — bölge riski, fay mesafesi, zemin durumu net görsün.
                  </p>
                </div>
                <div className="rounded-lg border border-blue-400/15 bg-slate-900/30 p-3">
                  <p className="font-semibold text-blue-300 mb-1">🏗️ Müteahhit için</p>
                  <p className="text-slate-300">
                    Yapı maliyetini tahmin etsin — zemin iyileştirme, TBDY-2018 dayanıklılık şartları.
                  </p>
                </div>
                <div className="rounded-lg border border-blue-400/15 bg-slate-900/30 p-3">
                  <p className="font-semibold text-blue-300 mb-1">🏢 Kurumsal için</p>
                  <p className="text-slate-300">
                    Fabrika/depo/şube açma kararında — afet süreç hazırlığı, sigorta primi öngörüsü.
                  </p>
                </div>
              </div>

              {/* Somut örnek senaryo (Endeksa stili gerçek mülk + sayı) */}
              <div className="mt-4 rounded-lg border border-emerald-400/20 bg-gradient-to-br from-emerald-500/5 to-slate-900/40 p-4">
                <p className="text-xs font-semibold text-emerald-300 mb-2 flex items-center gap-1.5">
                  📌 Somut Örnek Senaryo (Pendik, 1.000 m² arsa)
                </p>
                <div className="grid sm:grid-cols-2 gap-3 text-xs text-slate-300">
                  <p>
                    <strong className="text-emerald-200">Konum:</strong> Pendik / Kurtköy, 1.000 m² arsa, KAKS 2.0,
                    Marmara fay zonu 18 km uzakta. <strong className="text-emerald-200">PGA: 0.32g</strong>.
                  </p>
                  <p>
                    <strong className="text-emerald-200">Zemin:</strong> ZC orta-sağlam alüvyon — temel kazığı önerilir
                    (+ %8 inşaat maliyeti). Sıvılaşma riski: düşük.
                  </p>
                  <p>
                    <strong className="text-emerald-200">War Room skoru:</strong> 72/100 (orta-yüksek yatırım uygun).
                    Sigorta primi: yıllık ~₺28K (DASK + ek).
                  </p>
                  <p>
                    <strong className="text-emerald-200">Karar:</strong> 8 daire müteahhit projesi → 4 daire arsa sahibi
                    (KKA %50). Tahmini ROI: 5 yıl içinde %32-40.
                  </p>
                </div>
              </div>

              {/* 3 deprem bölgesi karşılaştırma — Endeksa stili tablo */}
              <div className="mt-4 rounded-lg border border-cyan-400/20 bg-slate-900/40 p-4">
                <p className="text-xs font-semibold text-cyan-300 mb-3 flex items-center gap-1.5">
                  🌍 3 Bölge Karşılaştırma — Aynı 1.000 m² yatırımı, farklı şehir
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs min-w-[480px]">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-700">
                        <th className="text-start py-1.5 pe-2 font-medium">Bölge</th>
                        <th className="text-end py-1.5 px-2 font-medium">Fay Uzak.</th>
                        <th className="text-end py-1.5 px-2 font-medium">PGA</th>
                        <th className="text-end py-1.5 px-2 font-medium">Zemin</th>
                        <th className="text-end py-1.5 px-2 font-medium">Skor</th>
                        <th className="text-end py-1.5 ps-2 font-medium">Sigorta/yıl</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      <tr className="border-b border-slate-800/50">
                        <td className="py-2 pe-2">
                          <p className="text-white font-medium">İstanbul / Kadıköy</p>
                          <p className="text-[10px] text-slate-500">Marmara fay yakın</p>
                        </td>
                        <td className="py-2 px-2 text-end text-amber-300">8 km</td>
                        <td className="py-2 px-2 text-end text-rose-300">0.41g</td>
                        <td className="py-2 px-2 text-end text-amber-200">ZD</td>
                        <td className="py-2 px-2 text-end font-bold text-amber-300">61/100</td>
                        <td className="py-2 ps-2 text-end text-rose-200">₺52K</td>
                      </tr>
                      <tr className="border-b border-slate-800/50">
                        <td className="py-2 pe-2">
                          <p className="text-white font-medium">İzmir / Karşıyaka</p>
                          <p className="text-[10px] text-slate-500">Gediz çöküntüsü</p>
                        </td>
                        <td className="py-2 px-2 text-end text-amber-300">12 km</td>
                        <td className="py-2 px-2 text-end text-amber-300">0.37g</td>
                        <td className="py-2 px-2 text-end text-rose-200">ZE</td>
                        <td className="py-2 px-2 text-end font-bold text-amber-300">58/100</td>
                        <td className="py-2 ps-2 text-end text-rose-200">₺48K</td>
                      </tr>
                      <tr>
                        <td className="py-2 pe-2">
                          <p className="text-white font-medium">Konya / Selçuklu</p>
                          <p className="text-[10px] text-slate-500">Anadolu kratonu</p>
                        </td>
                        <td className="py-2 px-2 text-end text-emerald-300">85 km</td>
                        <td className="py-2 px-2 text-end text-emerald-300">0.18g</td>
                        <td className="py-2 px-2 text-end text-emerald-200">ZA</td>
                        <td className="py-2 px-2 text-end font-bold text-emerald-300">87/100</td>
                        <td className="py-2 ps-2 text-end text-emerald-200">₺18K</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 italic">
                  Kaynak: AFAD risk haritası + TBDY-2018 + DASK tarife. Aynı m², farklı bölge — risk profili,
                  inşaat maliyeti, sigorta primi tamamen değişir.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-luxury border-amber-500/20">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-amber-300 mb-2 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5" /> Form alanları ne demek?
              </p>
              <div className="grid sm:grid-cols-3 gap-3 text-xs text-slate-300">
                <p>
                  <strong className="text-amber-200">Zemin (ZA-ZE)</strong>: ZA = sağlam kaya (en güvenli),
                  ZE = zayıf zemin/dolgu. Yapı güvenliği + temel maliyeti doğrudan etkiler.
                </p>
                <p>
                  <strong className="text-amber-200">PGA (g)</strong>: Deprem yer ivmesi katsayısı.
                  0.10 = düşük, 0.20 = orta, 0.35+ = yüksek risk. AFAD risk haritasından okunur.
                </p>
                <p>
                  <strong className="text-amber-200">Risk katmanı</strong>: Haritada fay hatları,
                  heyelan/sel risk bölgeleri renkli gösterilir. Açık/Kapalı seçilebilir.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
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

        {/* KATMAN 4 — Güven: metodoloji + kaynak + hukuki süreç + disclaimer */}
        <section className="mt-12 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="h-5 w-5 text-violet-300" />
            <h2 className="text-xl font-bold text-white">Güven, Metodoloji ve Hukuki Süreç</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-blue-400/20 bg-slate-900/40 p-4">
              <p className="text-sm font-semibold text-blue-200 mb-2">Veri Kaynakları</p>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li>• <strong>AFAD Türkiye Deprem Tehlike Haritası</strong> — PGA + ivme spektrumu</li>
                <li>• <strong>MTA Aktif Fay Veritabanı</strong> — fay hattı koordinatları</li>
                <li>• <strong>TBDY-2018</strong> Türkiye Bina Deprem Yönetmeliği</li>
                <li>• <strong>e-Devlet Bina Risk Sorgu</strong> — bina/yapı kayıt</li>
                <li>• Platform mühendislik istihbarat motoru (siteIntelligence)</li>
              </ul>
            </div>

            <div className="rounded-xl border border-violet-400/20 bg-slate-900/40 p-4">
              <p className="text-sm font-semibold text-violet-200 mb-2">Hesap Yöntemi</p>
              <ul className="text-xs text-slate-300 space-y-1.5">
                <li>• <strong>Deprem skoru</strong>: PGA × zemin amplifikasyon × bina yaşı/yönetmelik</li>
                <li>• <strong>Afet skoru</strong>: fay mesafesi + heyelan + sel + yangın yoğunluğu</li>
                <li>• <strong>Zemin skoru</strong>: ZA-ZE sınıfı × eğim × drenaj kapasitesi</li>
                <li>• <strong>Stratejik skor</strong>: 4 alt skor + ekonomik + sosyal endeks ağırlıklı</li>
              </ul>
            </div>

            <div className="rounded-xl border border-emerald-400/20 bg-slate-900/40 p-4">
              <p className="text-sm font-semibold text-emerald-200 mb-2 flex items-center gap-1.5">
                <ScrollText className="h-4 w-4" /> Resmi Süreç (Yatırım Öncesi)
              </p>
              <ol className="text-xs text-slate-300 space-y-1.5">
                <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-300 mt-0.5 flex-shrink-0" /> Tapu+Kadastro (TKGM) — mülkiyet+irtifak doğrulama</li>
                <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-300 mt-0.5 flex-shrink-0" /> İmar Durum Yazısı (Belediye) — kullanım+emsal</li>
                <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-300 mt-0.5 flex-shrink-0" /> Zemin etüdü (Jeoloji Mühendisi) — TBDY-2018 zorunlu</li>
                <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-300 mt-0.5 flex-shrink-0" /> AFAD Bina Risk Sorgu — 6306 sayılı kanun kapsamı</li>
                <li className="flex gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-300 mt-0.5 flex-shrink-0" /> SPK uyumlu ekspertiz raporu (bankable yatırım için)</li>
              </ol>
            </div>

            <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 p-4">
              <p className="text-sm font-semibold text-amber-200 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> Disclaimer (Kritik)
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Bu sayfa <strong className="text-amber-200">ön risk analizidir</strong> — bankable yatırım
                kararı oluşturmaz. Gerçek kararı vermeden: <strong>lisanslı jeoloji mühendisi
                zemin etüdü + inşaat mühendisi performans değerlendirmesi + SPK uyumlu ekspertiz</strong>
                şart. AFAD verisi 2-3 yılda güncellenir; en güncel risk için doğrudan AFAD haritasına bakın.
                Yatırım tavsiyesi değildir.
              </p>
            </div>
          </div>
        </section>
        </div>
      </div>
    );
  }