import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useBorsaAnalytics } from "@/hooks/useBorsaAnalytics";
import { BORSA_REGIONS, regionLabel, type BorsaRegionCode } from "@/lib/borsa/regions";
import { cn } from "@/lib/utils";

function formatTry(v: number): string {
  if (v >= 1_000_000) return `₺${(v / 1_000_000).toFixed(1)}M`;
  return `₺${Math.round(v).toLocaleString("tr-TR")}`;
}

export function BorsaAnalyticsDashboard() {
  const { indexSeries, volumeSeries, rankings, isLive, loading } = useBorsaAnalytics();
  const [compareA, setCompareA] = useState<BorsaRegionCode>("istanbul");
  const [compareB, setCompareB] = useState<BorsaRegionCode>("ege");
  const [volumeRegion, setVolumeRegion] = useState<BorsaRegionCode>("istanbul");

  const trendChart = useMemo(() => {
    const dates = [...new Set(indexSeries.map((p) => p.date))].sort();
    return dates.map((date) => {
      const row: Record<string, string | number> = { date: date.slice(5) };
      for (const code of [compareA, compareB]) {
        const pt = indexSeries.find((p) => p.date === date && p.regionCode === code);
        row[code] = pt?.indexValue ?? 0;
      }
      return row;
    });
  }, [indexSeries, compareA, compareB]);

  const volumeChart = useMemo(
    () =>
      volumeSeries
        .filter((p) => p.regionCode === volumeRegion)
        .map((p) => ({
          date: p.date.slice(5),
          hacim: Math.round(p.volumeTry / 1_000_000),
          islem: p.tradeCount,
        })),
    [volumeSeries, volumeRegion],
  );

  const topRisers = useMemo(() => [...rankings].sort((a, b) => b.changePct - a.changePct).slice(0, 3), [rankings]);
  const opportunities = useMemo(
    () => [...rankings].filter((r) => r.changePct < 0 && r.volumeTry > 0).sort((a, b) => a.changePct - b.changePct).slice(0, 3),
    [rankings],
  );

  if (loading) {
    return <p className="text-xs text-slate-400">Endeks ve hacim verisi yükleniyor…</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-[11px] text-slate-400">
        {isLive
          ? "Kaynak: price_index + transaction_stats (canlı)."
          : "Tablolar boş — borsa_etl edge CC-deploy sonrası dolacak; şimdilik demo grafikler."}
      </p>

      <article className="borsa-card rounded-xl p-3">
        <h3 className="mb-3 text-sm font-black uppercase tracking-[0.13em] text-slate-200">
          Bölge Endeks Trendi (12 ay)
        </h3>
        <div className="mb-3 flex flex-wrap gap-2 text-xs">
          <select
            value={compareA}
            onChange={(e) => setCompareA(e.target.value as BorsaRegionCode)}
            className="rounded border border-border bg-secondary px-2 py-1"
          >
            {BORSA_REGIONS.map((r) => (
              <option key={r.code} value={r.code}>
                {r.label}
              </option>
            ))}
          </select>
          <span className="text-slate-500">vs</span>
          <select
            value={compareB}
            onChange={(e) => setCompareB(e.target.value as BorsaRegionCode)}
            className="rounded border border-border bg-secondary px-2 py-1"
          >
            {BORSA_REGIONS.map((r) => (
              <option key={r.code} value={r.code}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendChart.length ? trendChart : [{ date: "—", [compareA]: 0, [compareB]: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 10 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
              <Legend />
              <Line type="monotone" dataKey={compareA} name={regionLabel(compareA)} stroke="#38bdf8" dot={false} />
              <Line type="monotone" dataKey={compareB} name={regionLabel(compareB)} stroke="#a78bfa" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="borsa-card rounded-xl p-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-[0.13em] text-slate-200">İşlem Hacmi</h3>
            <select
              value={volumeRegion}
              onChange={(e) => setVolumeRegion(e.target.value as BorsaRegionCode)}
              className="rounded border border-border bg-secondary px-2 py-1 text-xs"
            >
              {BORSA_REGIONS.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeChart.length ? volumeChart : [{ date: "—", hacim: 0, islem: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
                <Bar dataKey="hacim" name="Hacim (M₺)" fill="#22d3ee" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="borsa-card rounded-xl p-3">
          <h3 className="mb-3 text-sm font-black uppercase tracking-[0.13em] text-slate-200">Bölge Sıralaması</h3>
          <div className="space-y-2">
            {rankings.map((r) => (
              <div
                key={r.regionCode}
                className="flex items-center justify-between rounded-lg border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-xs"
              >
                <span className="font-semibold text-slate-100">{regionLabel(r.regionCode)}</span>
                <span className={cn("font-mono", r.changePct >= 0 ? "text-emerald-300" : "text-rose-300")}>
                  {r.changePct >= 0 ? "+" : ""}
                  {r.changePct.toFixed(2)}%
                </span>
                <span className="text-slate-400">{formatTry(r.volumeTry)}</span>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <article className="borsa-card rounded-xl p-3">
          <h3 className="mb-2 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.13em] text-emerald-200">
            <TrendingUp className="h-4 w-4" /> En çok değerlenen
          </h3>
          <ul className="space-y-1 text-xs text-slate-300">
            {topRisers.map((r) => (
              <li key={r.regionCode}>
                {regionLabel(r.regionCode)} — +{r.changePct.toFixed(2)}%
              </li>
            ))}
            {!topRisers.length && <li className="text-slate-500">Veri bekleniyor</li>}
          </ul>
        </article>
        <article className="borsa-card rounded-xl p-3">
          <h3 className="mb-2 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.13em] text-amber-200">
            <TrendingDown className="h-4 w-4" /> Fırsat bölgeleri
          </h3>
          <ul className="space-y-1 text-xs text-slate-300">
            {opportunities.map((r) => (
              <li key={r.regionCode}>
                {regionLabel(r.regionCode)} — {r.changePct.toFixed(2)}% · {formatTry(r.volumeTry)}
              </li>
            ))}
            {!opportunities.length && <li className="text-slate-500">Düşüş + hacim eşleşmesi yok</li>}
          </ul>
        </article>
      </div>
    </div>
  );
}
