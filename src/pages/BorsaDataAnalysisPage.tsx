import { useMemo, useState } from "react";
import { Download, Grid3X3, LineChart as LineChartIcon, Scale } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useLiveMarket } from "@/borsa/useLiveMarket";
import { createMarketSnapshot } from "@/lib/borsa/marketData";
import { cn } from "@/lib/utils";
import { FxRef } from "@/components/FxRef";
import { useLocale } from "@/contexts/LocaleContext";

type RegionKey = "istanbul" | "ege" | "akdeniz" | "ankara" | "bodrum";
type SegmentKey = "konut" | "arsa" | "ticari" | "turizm";

function formatTry(value: number): string {
  return `₺${Math.round(value).toLocaleString("tr-TR")}`;
}

function regionLabel(region: RegionKey): string {
  if (region === "istanbul") return "İstanbul";
  if (region === "ege") return "Ege";
  if (region === "akdeniz") return "Akdeniz";
  if (region === "ankara") return "Ankara";
  return "Bodrum";
}

function inferSegment(property: string): SegmentKey {
  const v = property.toLocaleLowerCase("tr-TR");
  if (v.includes("arsa")) return "arsa";
  if (v.includes("ofis")) return "ticari";
  if (v.includes("villa")) return "turizm";
  return "konut";
}

export default function BorsaDataAnalysisPage() {
  const { t } = useLocale();
  const da = t.dataAnalysis;
  const { data } = useLiveMarket();
  const [selectedAssetId, setSelectedAssetId] = useState<string>(data[0]?.id ?? "");
  const [selectedRegion, setSelectedRegion] = useState<RegionKey>("istanbul");
  const [selectedSegment, setSelectedSegment] = useState<SegmentKey>("konut");

  const snapshot = createMarketSnapshot(
    data.map((row) => ({
      id: row.id,
      code: row.code,
      property: row.property,
      price: row.price,
      changePct: row.changePct,
      volume: row.volume,
    })),
  );

  const segmentRows = data.map((row) => ({ ...row, segment: inferSegment(row.property) }));
  const selectedAsset = data.find((row) => row.id === selectedAssetId) ?? data[0] ?? null;

  const periods = ["P1", "P2", "P3", "P4", "P5", "P6", "P7"];
  const indexHistory = periods.map((period, idx) => {
    const multiplier = 0.92 + idx * 0.02;
    const regionRows = data.filter((row) => row.region === selectedRegion);
    const segmentOnly = segmentRows.filter((row) => row.segment === selectedSegment);
    const regionAvg = regionRows.reduce((acc, item) => acc + item.price, 0) / Math.max(1, regionRows.length);
    const segmentAvg = segmentOnly.reduce((acc, item) => acc + item.price, 0) / Math.max(1, segmentOnly.length);
    const platformIndex = snapshot.range.close;
    return {
      period,
      bolgeEndeksi: Math.round(regionAvg * multiplier),
      segmentEndeksi: Math.round(segmentAvg * multiplier),
      platformEndeksi: Math.round(platformIndex * multiplier),
    };
  });

  const comparisonHistory = periods.map((period, idx) => {
    const multiplier = 0.9 + idx * 0.018;
    const platform = snapshot.range.close * multiplier;
    const assetPrice = (selectedAsset?.price ?? 0) * multiplier;
    return {
      period,
      varlik: Math.round(assetPrice),
      endeks: Math.round(platform),
    };
  });

  const segmentTrends = (["konut", "arsa", "ticari", "turizm"] as SegmentKey[]).map((segment) => {
    const rows = segmentRows.filter((row) => row.segment === segment);
    const avgChange = rows.reduce((acc, row) => acc + row.changePct, 0) / Math.max(1, rows.length);
    const totalVolume = rows.reduce((acc, row) => acc + row.volume, 0);
    const depth = rows.reduce((acc, row) => acc + Math.round(row.price / 120_000), 0);
    return {
      segment,
      avgChange,
      totalVolume,
      depth,
      weightPct: Number(((rows.length / Math.max(1, segmentRows.length)) * 100).toFixed(1)),
    };
  });

  const regionHeatmap = (["istanbul", "ege", "akdeniz", "ankara", "bodrum"] as RegionKey[]).map((region) => {
    const rows = data.filter((row) => row.region === region);
    const volume = rows.reduce((acc, row) => acc + row.volume, 0);
    const avgChange = rows.reduce((acc, row) => acc + row.changePct, 0) / Math.max(1, rows.length);
    const idx = rows.reduce((acc, row) => acc + row.price, 0) / Math.max(1, rows.length);
    const tone =
      avgChange > 0.5
        ? "border-emerald-400/45 bg-emerald-500/20"
        : avgChange < -0.5
          ? "border-rose-400/45 bg-rose-500/20"
          : "border-slate-600 bg-slate-800/70";
    return { region, volume, avgChange, idx, tone };
  });

  const downloadReport = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      note: "Demo veri raporu. Canlıda bağımsız denetim gerektirir.",
      snapshot,
      segmentTrends,
      regionHeatmap,
      comparison: {
        selectedAsset: selectedAsset?.code ?? null,
        points: comparisonHistory,
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ihaleal-veri-analiz-demo-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="w-full space-y-4 px-4 py-4 text-slate-100 lg:px-8 2xl:px-12">
      <section className="rounded-xl border border-cyan-500/35 bg-gradient-to-br from-slate-900 to-slate-950 p-4">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-200">{da.eyebrow}</p>
        <h1 className="mt-1 text-2xl font-black text-white">{da.title}</h1>
        <p className="mt-2 text-sm text-slate-300">
          {da.subtitle}
        </p>
      </section>

      <section className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-100">
        {da.bannerWarning}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <article className="rounded-xl border border-border bg-card p-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-slate-200">
              <LineChartIcon className="h-4 w-4 text-cyan-300" />
              {da.avgPriceHistory}
            </h2>
            <div className="flex gap-2 text-xs">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value as RegionKey)}
                className="rounded-md border border-slate-600 bg-slate-900/70 px-2 py-1 text-slate-100"
              >
                <option value="istanbul">İstanbul</option>
                <option value="ege">Ege</option>
                <option value="akdeniz">Akdeniz</option>
                <option value="ankara">Ankara</option>
                <option value="bodrum">Bodrum</option>
              </select>
              <select
                value={selectedSegment}
                onChange={(e) => setSelectedSegment(e.target.value as SegmentKey)}
                className="rounded-md border border-slate-600 bg-slate-900/70 px-2 py-1 text-slate-100"
              >
                <option value="konut">Konut</option>
                <option value="arsa">Arsa</option>
                <option value="ticari">Ticari</option>
                <option value="turizm">Turizm</option>
              </select>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={indexHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="period" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(v) => `₺${Math.round(v / 1_000_000)}M`} />
                <Tooltip formatter={(v: number) => formatTry(v)} />
                <Line dataKey="bolgeEndeksi" name={da.regionAvg} stroke="#22d3ee" strokeWidth={2.3} dot={false} />
                <Line dataKey="segmentEndeksi" name={da.segmentAvg} stroke="#a78bfa" strokeWidth={2} dot={false} />
                <Line dataKey="platformEndeksi" name={da.platformAvg} stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-slate-300">
            {da.captionSelected}: <strong className="text-white">{regionLabel(selectedRegion)}</strong> ·{" "}
            <strong className="text-white">{selectedSegment.toLocaleUpperCase("tr-TR")}</strong>
          </p>
        </article>

        <article className="rounded-xl border border-border bg-card p-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-slate-200">
              <Scale className="h-4 w-4 text-cyan-300" />
              {da.assetVsPlatform}
            </h2>
            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="rounded-md border border-slate-600 bg-slate-900/70 px-2 py-1 text-xs text-slate-100"
            >
              {data.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.code}
                </option>
              ))}
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={comparisonHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="period" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(v) => `₺${Math.round(v / 1_000_000)}M`} />
                <Tooltip formatter={(v: number) => formatTry(v)} />
                <Area dataKey="endeks" name={da.platformAvg} stroke="#06b6d4" fill="#0891b233" strokeWidth={2} />
                <Area dataKey="varlik" name={`${selectedAsset?.code ?? "—"} ${da.assetPriceSuffix}`} stroke="#34d399" fill="#10b98133" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-slate-300">
            {da.comparisonSelection}: <strong className="text-white">{selectedAsset?.code ?? "—"}</strong>
          </p>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_1.85fr]">
        <article className="rounded-xl border border-border bg-card p-3">
          <h3 className="mb-3 text-sm font-black uppercase tracking-[0.12em] text-slate-200">{da.segmentTrendAnalysis}</h3>
          <div className="space-y-2">
            {segmentTrends.map((item) => (
              <div key={item.segment} className="rounded-lg border border-slate-700/80 bg-slate-900/70 px-3 py-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-100">{item.segment.toLocaleUpperCase("tr-TR")}</span>
                  <span className={cn("font-bold", item.avgChange >= 0 ? "text-emerald-300" : "text-rose-300")}>
                    {item.avgChange >= 0 ? "+" : ""}
                    {item.avgChange.toFixed(2)}%
                  </span>
                </div>
                <p className="mt-1 text-slate-300">{da.volumeLabel}: <span dir="ltr">{item.totalVolume.toLocaleString("tr-TR")}</span> {da.volumeUnit}</p>
                <p className="mt-1 text-slate-300">{da.depthScore}: <span dir="ltr">{item.depth.toLocaleString("tr-TR")}</span></p>
                <p className="mt-1 text-slate-300">{da.marketShare}: <span dir="ltr">{item.weightPct.toLocaleString("tr-TR")}%</span></p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-border bg-card p-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-slate-200">
              <Grid3X3 className="h-4 w-4 text-cyan-300" />
              {da.regionHeatmap}
            </h3>
            <button
              type="button"
              onClick={downloadReport}
              className="inline-flex items-center gap-1 rounded-md border border-cyan-400/55 bg-cyan-500/15 px-2.5 py-1.5 text-xs font-semibold text-cyan-100"
            >
              <Download className="h-3.5 w-3.5" /> {da.downloadReport}
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {regionHeatmap.map((cell) => (
              <div key={cell.region} className={cn("rounded-xl border px-3 py-2.5", cell.tone)}>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-100">{regionLabel(cell.region)}</p>
                <p className="text-[10px] uppercase tracking-wide text-slate-300">{da.avgPriceShort}</p>
                <p className="mt-0.5 text-lg font-black text-white" dir="ltr">{formatTry(cell.idx)}</p>
                <FxRef amountTry={cell.idx} variant="block" className="text-[11px] text-amber-300/80" />
                <p className={cn("text-xs font-bold", cell.avgChange >= 0 ? "text-emerald-200" : "text-rose-200")}>
                  {cell.avgChange >= 0 ? "+" : ""}
                  {cell.avgChange.toFixed(2)}%
                </p>
                <p className="mt-1 text-[11px] text-slate-200">{da.volumeLabel}: <span dir="ltr">{cell.volume.toLocaleString("tr-TR")}</span> {da.volumeUnit}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 rounded-lg border border-amber-500/35 bg-amber-500/10 px-2.5 py-2 text-[11px] text-amber-100">
            {da.demoReportFootnote}
          </p>
        </article>
      </section>
    </main>
  );
}
