import { useMemo, useState } from "react";
import { ArrowRight, BarChart3, MapPinned, ShieldAlert } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DEMO_DISTRICT_PROFILES,
  buildLocationInputFromProfile,
  calculateCompositeLocationScore,
  type DemoLocationKey,
} from "@/lib/location/locationIntelligenceEngine";

type FormState = {
  profile: DemoLocationKey;
  neighborhood: string;
  parcelRef: string;
  metroDistanceM: number;
  schoolDistanceM: number;
  hospitalDistanceM: number;
  marketDistanceM: number;
  parkDistanceM: number;
  transitLineCount: number;
  poiDensityPerKm2: number;
  schoolCountNearby: number;
  schoolQualityIndex: number;
  responseTimeMinutes: number;
  incidentRiskProxy: number;
};

const INITIAL_STATE: FormState = {
  profile: "istanbul-kadikoy",
  neighborhood: "Feneryolu",
  parcelRef: "123/45",
  metroDistanceM: 360,
  schoolDistanceM: 420,
  hospitalDistanceM: 1150,
  marketDistanceM: 260,
  parkDistanceM: 520,
  transitLineCount: 8,
  poiDensityPerKm2: 68,
  schoolCountNearby: 17,
  schoolQualityIndex: 79,
  responseTimeMinutes: 9,
  incidentRiskProxy: 33,
};

function profileLabel(key: DemoLocationKey): string {
  const item = DEMO_DISTRICT_PROFILES.find((row) => row.key === key);
  return item ? `${item.city} / ${item.district}` : key;
}

export function LocationIntelligenceWorkbench({
  title = "Konum zekası analizi",
  compact = false,
}: {
  title?: string;
  compact?: boolean;
}) {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ReturnType<typeof calculateCompositeLocationScore> | null>(null);

  const chartData = useMemo(
    () =>
      (result?.contributions ?? []).map((item) => ({
        katman: item.label,
        skor: item.score,
        katki: item.contributionPts,
      })),
    [result],
  );

  const radarData = useMemo(
    () =>
      chartData.map((row) => ({
        subject: row.katman,
        score: row.skor,
      })),
    [chartData],
  );

  const runAnalysis = () => {
    setError("");
    if (form.transitLineCount < 0) {
      setError("Toplu taşıma hat sayısı negatif olamaz.");
      return;
    }
    const input = buildLocationInputFromProfile(form.profile, {
      neighborhood: form.neighborhood,
      parcelRef: form.parcelRef,
      metroDistanceM: form.metroDistanceM,
      schoolDistanceM: form.schoolDistanceM,
      hospitalDistanceM: form.hospitalDistanceM,
      marketDistanceM: form.marketDistanceM,
      parkDistanceM: form.parkDistanceM,
      transitLineCount: form.transitLineCount,
      poiDensityPerKm2: form.poiDensityPerKm2,
      schoolCountNearby: form.schoolCountNearby,
      schoolQualityIndex: form.schoolQualityIndex,
      responseTimeMinutes: form.responseTimeMinutes,
      incidentRiskProxy: form.incidentRiskProxy,
    });
    setResult(calculateCompositeLocationScore(input));
  };

  return (
    <section className="space-y-4 rounded-2xl border border-slate-700 bg-slate-950/70 p-4 md:p-6">
      <header>
        <h2 className="text-xl font-black text-white md:text-2xl">{title}</h2>
        <p className="mt-1 text-sm text-slate-300">Demo veri / ön analiz: SES + POI + eğitim + güvenlik katmanları ağırlıklı birleşik skor üretir.</p>
      </header>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1 text-xs text-slate-300">
          İl / İlçe profili
          <select
            value={form.profile}
            onChange={(event) => setForm((prev) => ({ ...prev, profile: event.target.value as DemoLocationKey }))}
            className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white"
          >
            {DEMO_DISTRICT_PROFILES.map((item) => (
              <option key={item.key} value={item.key}>
                {profileLabel(item.key)}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs text-slate-300">
          Mahalle
          <Input value={form.neighborhood} onChange={(event) => setForm((prev) => ({ ...prev, neighborhood: event.target.value }))} />
        </label>
        <label className="space-y-1 text-xs text-slate-300">
          Parsel referansı
          <Input value={form.parcelRef} onChange={(event) => setForm((prev) => ({ ...prev, parcelRef: event.target.value }))} />
        </label>
        <label className="space-y-1 text-xs text-slate-300">
          Metro mesafesi (m)
          <Input type="number" value={form.metroDistanceM} onChange={(event) => setForm((prev) => ({ ...prev, metroDistanceM: Number(event.target.value || 0) }))} />
        </label>
        <label className="space-y-1 text-xs text-slate-300">
          Okul mesafesi (m)
          <Input type="number" value={form.schoolDistanceM} onChange={(event) => setForm((prev) => ({ ...prev, schoolDistanceM: Number(event.target.value || 0) }))} />
        </label>
        <label className="space-y-1 text-xs text-slate-300">
          Hastane mesafesi (m)
          <Input type="number" value={form.hospitalDistanceM} onChange={(event) => setForm((prev) => ({ ...prev, hospitalDistanceM: Number(event.target.value || 0) }))} />
        </label>
        <label className="space-y-1 text-xs text-slate-300">
          Market mesafesi (m)
          <Input type="number" value={form.marketDistanceM} onChange={(event) => setForm((prev) => ({ ...prev, marketDistanceM: Number(event.target.value || 0) }))} />
        </label>
        <label className="space-y-1 text-xs text-slate-300">
          Park mesafesi (m)
          <Input type="number" value={form.parkDistanceM} onChange={(event) => setForm((prev) => ({ ...prev, parkDistanceM: Number(event.target.value || 0) }))} />
        </label>
        <label className="space-y-1 text-xs text-slate-300">
          Toplu taşıma hat sayısı
          <Input type="number" value={form.transitLineCount} onChange={(event) => setForm((prev) => ({ ...prev, transitLineCount: Number(event.target.value || 0) }))} />
        </label>
        <label className="space-y-1 text-xs text-slate-300">
          POI yoğunluğu (km²)
          <Input type="number" value={form.poiDensityPerKm2} onChange={(event) => setForm((prev) => ({ ...prev, poiDensityPerKm2: Number(event.target.value || 0) }))} />
        </label>
        <label className="space-y-1 text-xs text-slate-300">
          Yakın okul adedi
          <Input type="number" value={form.schoolCountNearby} onChange={(event) => setForm((prev) => ({ ...prev, schoolCountNearby: Number(event.target.value || 0) }))} />
        </label>
        <label className="space-y-1 text-xs text-slate-300">
          Okul kalite indeksi
          <Input type="number" value={form.schoolQualityIndex} onChange={(event) => setForm((prev) => ({ ...prev, schoolQualityIndex: Number(event.target.value || 0) }))} />
        </label>
        <label className="space-y-1 text-xs text-slate-300">
          Müdahale süresi (dk)
          <Input type="number" value={form.responseTimeMinutes} onChange={(event) => setForm((prev) => ({ ...prev, responseTimeMinutes: Number(event.target.value || 0) }))} />
        </label>
        <label className="space-y-1 text-xs text-slate-300">
          Risk proxy (0-100)
          <Input type="number" value={form.incidentRiskProxy} onChange={(event) => setForm((prev) => ({ ...prev, incidentRiskProxy: Number(event.target.value || 0) }))} />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="accent" onClick={runAnalysis}>
          <MapPinned className="me-1.5 h-4 w-4" /> Konum analizi başlat
        </Button>
        {error ? <span className="text-xs text-rose-300">{error}</span> : null}
      </div>

      {result ? (
        <div className="space-y-4">
          <article className="grid gap-3 rounded-xl border border-cyan-500/35 bg-cyan-500/10 p-4 md:grid-cols-3">
            <div>
              <p className="text-xs text-cyan-100">Birleşik konum skoru</p>
              <p className="text-2xl font-black text-white">{result.locationScore}/100</p>
            </div>
            <div>
              <p className="text-xs text-cyan-100">Yaşanabilirlik</p>
              <p className="text-xl font-black text-white">{result.livabilityScore}/100</p>
            </div>
            <div>
              <p className="text-xs text-cyan-100">Yatırım potansiyeli</p>
              <p className="text-xl font-black text-white">{result.investmentScore}/100</p>
            </div>
          </article>

          <article className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
            <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
              <h3 className="mb-2 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-cyan-200">
                <BarChart3 className="h-4 w-4" />
                Katman skorları
              </h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="katman" tick={{ fill: "#cbd5e1", fontSize: 10 }} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="skor" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
              <h3 className="text-sm font-black uppercase tracking-[0.12em] text-cyan-200">Katkı dökümü</h3>
              <p className="mt-1 text-xs text-slate-400">
                FAHP ağırlık modeli: SES %{result.weightModel.ses}, POI %{result.weightModel.poi}, Eğitim %{result.weightModel.education}, Güvenlik %{result.weightModel.safety}
              </p>
              <ul className="mt-2 space-y-2 text-sm text-slate-200">
                {result.contributions.map((item) => (
                  <li key={item.key}>
                    <p className="font-semibold">{item.label}</p>
                    <p className="text-xs text-slate-300">
                      Skor {item.score}/100 · Ağırlık %{item.weightPct} · Katkı {item.contributionPts} puan
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
            <h3 className="text-sm font-black uppercase tracking-[0.12em] text-cyan-200">Katman radar görünümü</h3>
            <div className="h-[270px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#cbd5e1", fontSize: 10 }} />
                  <Tooltip />
                  <Radar name="Skor" dataKey="score" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="grid gap-3 md:grid-cols-3">
            {result.tags.map((tag) => (
              <p key={tag} className="rounded-lg border border-slate-700 bg-slate-900/60 p-3 text-sm text-slate-200">
                {tag}
              </p>
            ))}
          </article>

          <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 p-4 text-sm text-amber-100">
            <p className="inline-flex items-center gap-1.5 font-semibold">
              <ShieldAlert className="h-4 w-4" /> Veri kaynağı ve dürüst sınır
            </p>
            <p className="mt-2">{result.disclaimer}</p>
            <p className="mt-1 text-xs text-amber-200">{result.dataQualityNote}</p>
          </div>

          {!compact ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">
              <p className="text-sm text-cyan-100">Konum zekası tamamlandı. Sonraki adım: yatırım varsayımlarını fizibilite motoru ile birleştirme.</p>
              <Button type="button" className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">
                Değerleme başlat <ArrowRight className="ms-1.5 h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
