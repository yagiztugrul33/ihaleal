import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, MapPin, ShieldAlert, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { runParcelIntelligence } from "@/lib/engineering";
import { INTELLIGENCE_HUB_PATH } from "@/lib/intelligenceHub";

export default function LandInvestmentPage() {
  const [il, setIl] = useState("Ankara");
  const [ilce, setIlce] = useState("Etimesgut");
  const [ada, setAda] = useState("102");
  const [parsel, setParsel] = useState("18");
  const [landArea, setLandArea] = useState("2400");
  const [ownerShare, setOwnerShare] = useState("32");
  const [priceTrend, setPriceTrend] = useState("14");
  const [permitRatio, setPermitRatio] = useState("68");
  const [distanceInfra, setDistanceInfra] = useState("2.8");
  const [result, setResult] = useState<ReturnType<typeof runParcelIntelligence> | null>(null);
  const [error, setError] = useState("");

  const scenarioText = useMemo(() => {
    if (!result) return "Örnek senaryo: 2.400 m² parselde geçiş olasılığı ve inşaat hakkı birlikte okunur.";
    return `Örnek çıktı: birleşik skor ${result.compositeScore}/100, imar geçiş olasılığı %${result.zoning.value.transitionProbabilityPct.toFixed(0)}.`;
  }, [result]);

  const run = () => {
    setError("");
    const land = Number(landArea);
    if (!Number.isFinite(land) || land <= 0) {
      setError("Geçerli arsa m² girin.");
      return;
    }
    try {
      const analysis = runParcelIntelligence({
        parcel: {
          il,
          ilce,
          koy: "",
          mahalle: "",
          ada,
          parsel,
          landAreaM2: land,
          ownerShareOfSellable: Math.max(0.1, Math.min(0.55, Number(ownerShare) / 100)),
          assumedNetUnitM2: 110,
        },
        zoningFactors: {
          urbanProximityScore: Math.max(0, Math.min(100, Number(permitRatio))),
          transportProjectScore: Math.max(0, Math.min(100, 100 - Number(distanceInfra) * 15)),
          industrialExpansionScore: Math.max(0, Math.min(100, Number(priceTrend) * 3 + 50)),
          demographicGrowthScore: Math.max(0, Math.min(100, Number(priceTrend) * 2 + 45)),
          existingZoningDensityScore: Math.max(0, Math.min(100, Number(permitRatio) - 8)),
          currentLandUse: "tarla",
          horizonYears: 7,
        },
      });
      setResult(analysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analiz sırasında hata oluştu.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-16 px-4 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-2xl border border-cyan-500/25 bg-cyan-500/10 p-6">
          <p className="text-xs uppercase tracking-[0.12em] text-cyan-200">Yatırım istihbaratı modülü</p>
          <h1 className="mt-2 text-3xl font-bold md:text-5xl">Arsa yatırım analizi</h1>
          <p className="mt-3 max-w-3xl text-sm text-slate-200 md:text-base">
            Nedir? Parselin imar potansiyeli + geçiş olasılığı + bölgesel momentumunu birlikte okuyan katmanlı ön analiz ekranı.
            Dürüst not: Bu çıktı demo/ön analizdir; resmi imar belgesi, mühendislik etüdü ve hukuk kontrolü şarttır.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to={INTELLIGENCE_HUB_PATH} className="btn-ghost">Araştırma hub</Link>
            <Link to="/kat-karsiligi" className="btn-ghost">Kat karşılığı merkezi</Link>
            <Link to="/modul/imar-sorgu" className="btn-ghost">İmar sorgu modülü</Link>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-700 bg-slate-900/60 p-5">
            <h2 className="text-xl font-bold">Yöntem</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>• `kkaParselImarEngine` ile brüt inşaat hakkı, kat ve pay hesapları çıkarılır.</li>
              <li>• Zoning olasılık modeli ile plan geçiş skoru hesaplanır.</li>
              <li>• Katmanlar tek birleşik yatırım skorunda (0-100) toplanır.</li>
            </ul>
            <p className="mt-4 text-sm text-slate-400">{scenarioText}</p>
          </article>
          <article className="rounded-2xl border border-slate-700 bg-slate-900/60 p-5">
            <h2 className="text-xl font-bold">Girdi paneli</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Input value={il} onChange={(e) => setIl(e.target.value)} placeholder="İl" />
              <Input value={ilce} onChange={(e) => setIlce(e.target.value)} placeholder="İlçe" />
              <Input value={ada} onChange={(e) => setAda(e.target.value)} placeholder="Ada" />
              <Input value={parsel} onChange={(e) => setParsel(e.target.value)} placeholder="Parsel" />
              <Input value={landArea} onChange={(e) => setLandArea(e.target.value)} placeholder="Arsa m²" />
              <Input value={ownerShare} onChange={(e) => setOwnerShare(e.target.value)} placeholder="Arsa payı (%)" />
              <Input value={priceTrend} onChange={(e) => setPriceTrend(e.target.value)} placeholder="Piyasa momentumu" />
              <Input value={permitRatio} onChange={(e) => setPermitRatio(e.target.value)} placeholder="Plan uyumu (0-100)" />
              <Input value={distanceInfra} onChange={(e) => setDistanceInfra(e.target.value)} placeholder="Altyapı mesafesi (km)" />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Button onClick={run} className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">Analizi çalıştır</Button>
              {error ? <span className="text-xs text-rose-300">{error}</span> : null}
            </div>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-700 bg-slate-900/60 p-5">
          <h2 className="text-xl font-bold">Sonuçlar</h2>
          {!result ? (
            <p className="mt-3 text-sm text-slate-400">Henüz analiz çalıştırılmadı.</p>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <article className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-4">
                <p className="text-xs text-cyan-200">Birleşik skor</p>
                <p className="text-3xl font-black">{result.compositeScore}/100</p>
              </article>
              <article className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4">
                <p className="text-xs text-emerald-200">Brüt inşaat hakkı</p>
                <p className="text-xl font-bold">{Math.round(result.imar.grossConstructionRightM2).toLocaleString("tr-TR")} m²</p>
              </article>
              <article className="rounded-xl border border-violet-500/25 bg-violet-500/10 p-4">
                <p className="text-xs text-violet-200">İmar geçiş olasılığı</p>
                <p className="text-xl font-bold">%{result.zoning.value.transitionProbabilityPct.toFixed(1)}</p>
              </article>
            </div>
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200"><BarChart3 className="h-4 w-4" /> Kime göre?</div>
            <p className="mt-2 text-sm text-slate-300">Yatırımcı, geliştirici ve arsa sahibi görüşmelerinde hızlı ön eleme için.</p>
          </article>
          <article className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-200"><MapPin className="h-4 w-4" /> Örnek kullanım</div>
            <p className="mt-2 text-sm text-slate-300">Aynı bölgede iki parsel gir, skor ve inşaat hakkı farkına göre öncelik belirle.</p>
          </article>
          <article className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-amber-200"><ShieldAlert className="h-4 w-4" /> Dürüst sınır</div>
            <p className="mt-2 text-sm text-slate-300">Resmi imar durumu, tapu kayıtları ve hukuk görüşü olmadan karar verilmez.</p>
          </article>
        </section>

        <section className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5 text-center">
          <p className="text-sm text-cyan-100">
            Sonraki adım: parseli War Room ve KKA Studio ile derinleştir, sonra teklif stratejisine geç.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link to="/arastirma/war-room" className="btn-primary inline-flex items-center gap-2"><Sparkles className="h-4 w-4" /> War Room</Link>
            <Link to="/kat-karsiligi/studio" className="btn-ghost">KKA Studio</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
