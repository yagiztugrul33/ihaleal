import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPinned, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { runParcelIntelligence, type ParcelIntelligenceResult } from "@/lib/engineering";
import { INTELLIGENCE_HUB_PATH } from "@/lib/intelligenceHub";

function n(s: string, fb: number) {
  const v = Number(String(s).replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(v) ? v : fb;
}

export default function ParcelIntelligencePage() {
  const [il, setIl] = useState("Konya");
  const [ilce, setIlce] = useState("Karapinar");
  const [ada, setAda] = useState("123");
  const [parsel, setParsel] = useState("45");
  const [landM2, setLandM2] = useState("25000");
  const [urban, setUrban] = useState([65]);
  const [transport, setTransport] = useState([55]);
  const [includeGes, setIncludeGes] = useState(true);
  const [result, setResult] = useState<ParcelIntelligenceResult | null>(null);

  const analyze = () => {
    const land = n(landM2, 25000);
    setResult(
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
        ges: includeGes
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
          : undefined,
      }),
    );
  };

  return (
    <motion.div className="min-h-screen pt-24 pb-16">
      <motion.div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <Button variant="ghost" size="sm" asChild className="mb-4 text-slate-400">
          <Link to={INTELLIGENCE_HUB_PATH}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Arastirma
          </Link>
        </Button>
        <motion.div className="flex items-center gap-3 mb-8">
          <MapPinned className="w-8 h-8 text-cyan-400" />
          <motion.div>
            <h1 className="text-2xl font-bold text-white">Ada parsel istihbarat</h1>
            <p className="text-sm text-slate-400">Imar, bolge gelisim, opsiyonel GES — olasilik indeksleri</p>
          </motion.div>
        </motion.div>

        <motion.div className="grid lg:grid-cols-2 gap-8">
          <Card className="card-luxury">
            <CardContent className="p-6 space-y-4">
              <motion.div className="grid grid-cols-2 gap-3">
                <motion.div>
                  <Label>Il</Label>
                  <Input value={il} onChange={(e) => setIl(e.target.value)} className="mt-1" />
                </motion.div>
                <motion.div>
                  <Label>Ilce</Label>
                  <Input value={ilce} onChange={(e) => setIlce(e.target.value)} className="mt-1" />
                </motion.div>
                <motion.div>
                  <Label>Ada</Label>
                  <Input value={ada} onChange={(e) => setAda(e.target.value)} className="mt-1" />
                </motion.div>
                <motion.div>
                  <Label>Parsel</Label>
                  <Input value={parsel} onChange={(e) => setParsel(e.target.value)} className="mt-1" />
                </motion.div>
              </motion.div>
              <motion.div>
                <Label>Alan (m2)</Label>
                <Input value={landM2} onChange={(e) => setLandM2(e.target.value)} className="mt-1" />
              </motion.div>
              <motion.div>
                <Label>Kentsel yakinlik: {urban[0]}</Label>
                <Slider value={urban} onValueChange={setUrban} max={100} step={1} className="mt-2" />
              </motion.div>
              <motion.div>
                <Label>Ulasim projesi etkisi: {transport[0]}</Label>
                <Slider value={transport} onValueChange={setTransport} max={100} step={1} className="mt-2" />
              </motion.div>
              <label className="flex items-center gap-2 text-sm text-slate-400">
                <input type="checkbox" checked={includeGes} onChange={(e) => setIncludeGes(e.target.checked)} />
                GES analizi dahil et
              </label>
              <Button className="btn-primary w-full gap-2" onClick={analyze}>
                <Search className="w-4 h-4" /> Analiz et
              </Button>
            </CardContent>
          </Card>

          {result ? (
            <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <motion.div className="card-luxury p-6">
                <p className="text-3xl font-bold text-cyan-300">{result.compositeScore}/100</p>
                <p className="text-xs text-slate-500 mt-1">Bilesik yatirim indeksi (indikatif)</p>
              </motion.div>
              <Card className="card-luxury">
                <CardContent className="p-5 text-sm text-slate-300 space-y-2">
                  {result.executiveSummary.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </CardContent>
              </Card>
              <p className="text-[10px] text-slate-500">{result.disclaimer.legal}</p>
            </motion.div>
          ) : null}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
