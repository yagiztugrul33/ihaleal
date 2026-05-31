import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { calculateEarthquakeRisk, type CodeEra, type SoilClass, type StructuralSystem } from "@/lib/risk/earthquakeRiskEngine";

type FormState = {
  city: string;
  district: string;
  faultDistanceKm: number;
  pgaG: number;
  soilClass: SoilClass;
  fsCoefficient: number;
  f1Coefficient: number;
  sptN160: number;
  groundwaterDepthM: number;
  alluviumPercent: number;
  buildingAge: number;
  structuralSystem: StructuralSystem;
  codeEra: CodeEra;
  storyCount: number;
  softStory: boolean;
};

const INITIAL: FormState = {
  city: "Istanbul",
  district: "Kadikoy",
  faultDistanceKm: 11,
  pgaG: 0.36,
  soilClass: "ZC",
  fsCoefficient: 1.24,
  f1Coefficient: 1.34,
  sptN160: 34,
  groundwaterDepthM: 3.8,
  alluviumPercent: 45,
  buildingAge: 12,
  structuralSystem: "reinforced_concrete",
  codeEra: "post_2018",
  storyCount: 8,
  softStory: false,
};

export function EarthquakeRiskWorkbench({ compact = false, title = "Deprem risk analizi" }: { compact?: boolean; title?: string }) {
  const [form, setForm] = useState(INITIAL);
  const [result, setResult] = useState<ReturnType<typeof calculateEarthquakeRisk> | null>(null);
  const [error, setError] = useState("");

  const barData = useMemo(
    () => (result ? result.contributions.map((c) => ({ katman: c.label, skor: c.score, katki: c.contributionPts })) : []),
    [result],
  );
  const radarData = useMemo(() => barData.map((x) => ({ subject: x.katman, value: x.skor })), [barData]);

  const run = () => {
    setError("");
    if (form.pgaG <= 0 || form.pgaG > 1.2) {
      setError("PGA 0-1.2 aralığında olmalı.");
      return;
    }
    const next = calculateEarthquakeRisk({
      ...form,
      neighborhood: "",
    });
    setResult(next);
  };

  return (
    <section className="space-y-4 rounded-2xl border border-slate-700 bg-slate-950/70 p-4 md:p-6">
      <header>
        <h2 className="text-xl font-black text-white md:text-2xl">{title}</h2>
        <p className="mt-1 text-sm text-slate-300">
          Demo veri / ön analiz: TBDY 2018 katman mantığıyla fay, zemin, sıvılaşma ve yapısal risk birlikte puanlanır.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1 text-xs text-slate-300">İl
          <Input value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
        </label>
        <label className="space-y-1 text-xs text-slate-300">İlçe
          <Input value={form.district} onChange={(e) => setForm((p) => ({ ...p, district: e.target.value }))} />
        </label>
        <label className="space-y-1 text-xs text-slate-300">Fay mesafesi (km)
          <Input type="number" value={form.faultDistanceKm} onChange={(e) => setForm((p) => ({ ...p, faultDistanceKm: Number(e.target.value || 0) }))} />
        </label>
        <label className="space-y-1 text-xs text-slate-300">PGA (g)
          <Input type="number" step="0.01" value={form.pgaG} onChange={(e) => setForm((p) => ({ ...p, pgaG: Number(e.target.value || 0) }))} />
        </label>
        <label className="space-y-1 text-xs text-slate-300">Zemin sınıfı
          <select className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white" value={form.soilClass} onChange={(e) => setForm((p) => ({ ...p, soilClass: e.target.value as SoilClass }))}>
            <option value="ZA">ZA</option><option value="ZB">ZB</option><option value="ZC">ZC</option><option value="ZD">ZD</option><option value="ZE">ZE</option>
          </select>
        </label>
        <label className="space-y-1 text-xs text-slate-300">FS katsayısı
          <Input type="number" step="0.01" value={form.fsCoefficient} onChange={(e) => setForm((p) => ({ ...p, fsCoefficient: Number(e.target.value || 0) }))} />
        </label>
        <label className="space-y-1 text-xs text-slate-300">F1 katsayısı
          <Input type="number" step="0.01" value={form.f1Coefficient} onChange={(e) => setForm((p) => ({ ...p, f1Coefficient: Number(e.target.value || 0) }))} />
        </label>
        <label className="space-y-1 text-xs text-slate-300">SPT N1,60
          <Input type="number" value={form.sptN160} onChange={(e) => setForm((p) => ({ ...p, sptN160: Number(e.target.value || 0) }))} />
        </label>
        <label className="space-y-1 text-xs text-slate-300">Yeraltı suyu (m)
          <Input type="number" value={form.groundwaterDepthM} onChange={(e) => setForm((p) => ({ ...p, groundwaterDepthM: Number(e.target.value || 0) }))} />
        </label>
        <label className="space-y-1 text-xs text-slate-300">Alüvyon (%)
          <Input type="number" value={form.alluviumPercent} onChange={(e) => setForm((p) => ({ ...p, alluviumPercent: Number(e.target.value || 0) }))} />
        </label>
        <label className="space-y-1 text-xs text-slate-300">Bina yaşı
          <Input type="number" value={form.buildingAge} onChange={(e) => setForm((p) => ({ ...p, buildingAge: Number(e.target.value || 0) }))} />
        </label>
        <label className="space-y-1 text-xs text-slate-300">Kat adedi
          <Input type="number" value={form.storyCount} onChange={(e) => setForm((p) => ({ ...p, storyCount: Number(e.target.value || 0) }))} />
        </label>
        <label className="space-y-1 text-xs text-slate-300">Taşıyıcı sistem
          <select className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white" value={form.structuralSystem} onChange={(e) => setForm((p) => ({ ...p, structuralSystem: e.target.value as StructuralSystem }))}>
            <option value="reinforced_concrete">Betonarme</option><option value="steel">Çelik</option><option value="mixed">Karma</option><option value="masonry">Yığma</option>
          </select>
        </label>
        <label className="space-y-1 text-xs text-slate-300">Kod dönemi
          <select className="h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-white" value={form.codeEra} onChange={(e) => setForm((p) => ({ ...p, codeEra: e.target.value as CodeEra }))}>
            <option value="pre_2018">2018 öncesi</option><option value="post_2018">2018 sonrası</option>
          </select>
        </label>
        <label className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-300">
          <input type="checkbox" checked={form.softStory} onChange={(e) => setForm((p) => ({ ...p, softStory: e.target.checked }))} />
          Yumuşak kat şüphesi var
        </label>
      </div>

      <div className="flex items-center gap-2">
        <button type="button" onClick={run} className="inline-flex items-center gap-2 rounded-lg !bg-rose-400 px-4 py-2 text-sm font-bold !text-slate-950 shadow transition-colors hover:!bg-rose-300">Risk skorunu hesapla</button>
        {error ? <span className="text-xs text-rose-300">{error}</span> : null}
      </div>

      {result ? (
        <div className="space-y-4">
          <article className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
            <p className="text-xs text-rose-100">Birleşik deprem güven skoru (yüksek = düşük risk)</p>
            <p className="text-3xl font-black text-white">{result.totalScore}/100</p>
            <p className="mt-1 text-sm text-rose-100">{result.interpretation}</p>
          </article>
          <article className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
            <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="katman" tick={{ fill: "#cbd5e1", fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="skor" fill="#fb7185" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
              <h3 className="text-sm font-black uppercase tracking-[0.12em] text-rose-200">Katkı dökümü</h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-200">
                {result.contributions.map((c) => (
                  <li key={c.key}>
                    <p className="font-semibold">{c.label}</p>
                    <p className="text-xs text-slate-300">Skor {c.score}/100 · Ağırlık %{c.weightPct} · Katkı {c.contributionPts}</p>
                  </li>
                ))}
              </ul>
            </div>
          </article>
          <article className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#cbd5e1", fontSize: 10 }} />
                  <Tooltip />
                  <Radar dataKey="value" stroke="#fb7185" fill="#fb7185" fillOpacity={0.32} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </article>
          {!compact ? (
            <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 p-4 text-sm text-amber-100">{result.disclaimer}</div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
