import { useMemo, useRef, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  ScatterChart,
  Scatter,
} from "recharts";
import { Download, Loader2 } from "lucide-react";
import type { PropertyAnalysisReportRecord } from "@/lib/aiAnalysis";
import { AI_REPORT_DISCLAIMER_TR } from "@/lib/aiAnalysis";
import type { EconomicRealAnalysis, RankedEmsalRow } from "@/lib/reports/realEconomicAnalysis";
import type { Auction } from "@/types/auction";
import { clientLogError } from "@/lib/clientLog";
import { AIRaporSorumluluk } from "@/components/legal/AIRaporSorumluluk";
import { Button } from "@/components/ui/button";

type TabKey = "legal" | "socio" | "location" | "economic" | "overall";

function scoreTone(score: number | null | undefined, invertRisk?: boolean): string {
  if (score == null || Number.isNaN(score)) return "text-slate-400 border-slate-200 bg-white/5";
  const v = invertRisk ? 11 - score : score;
  if (v >= 8) return "text-[var(--metin-ikincil)] border-[var(--cizgi)] bg-[var(--zemin-yumusak)]";
  if (v >= 5) return "text-[var(--metin-ikincil)] border-[var(--cizgi)] bg-[var(--zemin-yumusak)]";
  return "text-[var(--metin-ikincil)] border-[var(--cizgi)] bg-[var(--zemin-yumusak)]";
}

function BigRing({
  label,
  score,
  invertRisk,
}: {
  label: string;
  score: number | null | undefined;
  invertRisk?: boolean;
}) {
  const pct = score == null ? 0 : Math.min(100, Math.max(0, (invertRisk ? 11 - score : score) * 10));
  const ringColor = pct >= 80 ? "var(--metrik-yesil)" : pct >= 50 ? "var(--metin-ikincil)" : "var(--sinyal-turuncu)";
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative w-28 h-28 rounded-full flex items-center justify-center p-[3px]"
        style={{ background: ringColor }}
        aria-hidden
      >
        <div className="w-full h-full rounded-full bg-white/95 flex flex-col items-center justify-center border border-slate-200">
          <span className="text-2xl font-normal text-white">{score ?? "—"}</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-wide">/10</span>
        </div>
      </div>
      <span className="text-xs text-slate-400 text-center max-w-[10rem]">{label}</span>
    </div>
  );
}

function PricePositionBar({
  min,
  mean,
  max,
  target,
}: {
  min: number;
  mean: number;
  max: number;
  target: number;
}) {
  const span = max - min;
  const pct = span > 0 ? Math.min(100, Math.max(0, ((target - min) / span) * 100)) : 50;
  return (
    <div className="space-y-1.5">
      <div
        className="relative h-2 rounded-full"
        style={{ background: "linear-gradient(90deg, var(--metrik-yesil), var(--sinyal-turuncu))" }}
      >
        <div
          className="absolute -top-1.5 w-4 h-4 rounded-full bg-white border-2"
          style={{ left: `calc(${pct}% - 8px)`, borderColor: "var(--zemin-koyu, #0a0e1a)" }}
          aria-hidden
        />
      </div>
      <div className="flex justify-between text-[11px] text-slate-500">
        <span>Min ₺{Math.round(min).toLocaleString("tr-TR")}</span>
        <span>Ort. ₺{Math.round(mean).toLocaleString("tr-TR")}</span>
        <span>Max ₺{Math.round(max).toLocaleString("tr-TR")}</span>
      </div>
    </div>
  );
}

function PriceRankScatter({ rows }: { rows: RankedEmsalRow[] }) {
  const data = rows.map((r, i) => ({ x: i + 1, y: r.pricePerM2, isTarget: r.isTarget }));
  return (
    <div className="h-52 rounded-[20px] border border-slate-200 bg-black/20 p-2">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis type="number" dataKey="x" stroke="#94a3b8" fontSize={11} tick={false} label={{ value: "İlan sırası (₺/m² artan)", position: "insideBottom", offset: -2, fill: "#94a3b8", fontSize: 11 }} />
          <YAxis type="number" dataKey="y" stroke="#94a3b8" fontSize={11} tickFormatter={(v: number) => `₺${Math.round(v / 1000)}K`} />
          <Tooltip
            formatter={(v: number) => [`₺${Math.round(v).toLocaleString("tr-TR")}/m²`, "Fiyat"]}
            contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
          />
          <Scatter
            data={data}
            shape={(props: unknown) => {
              const p = props as { cx: number; cy: number; payload: { isTarget: boolean } };
              return (
                <circle
                  cx={p.cx}
                  cy={p.cy}
                  r={p.payload.isTarget ? 6 : 3}
                  fill={p.payload.isTarget ? "var(--sinyal-turuncu)" : "#38bdf8"}
                />
              );
            }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

export type PropertyAnalysisReportViewerProps = {
  report: PropertyAnalysisReportRecord;
  mockBanner?: boolean;
  showApproveButton?: boolean;
  onApprove?: () => void;
  approveDisabled?: boolean;
  /** Varsa gerçek ilan kaydı — markalı kapak bandında başlık/konum/fiyat/görsel için kullanılır. */
  auction?: Auction;
};

export function PropertyAnalysisReportViewer({
  report,
  mockBanner,
  showApproveButton,
  onApprove,
  approveDisabled,
  auction,
}: PropertyAnalysisReportViewerProps) {
  const [tab, setTab] = useState<TabKey>("legal");
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // N2 — PDF export: jspdf + html2canvas lazy dynamic import.
  // Ana bundle'a yüklenmez; sadece kullanıcı butona basınca on-demand chunk.
  const handlePdfExport = async () => {
    if (!reportRef.current || exporting) return;
    setExporting(true);
    try {
      const [{ jsPDF }, html2canvas] = await Promise.all([
        import("jspdf"),
        import("html2canvas").then((m) => m.default),
      ]);
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: "#0a0e1a",
        useCORS: true,
        logging: false,
      });
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();
      // Rapor tek sayfaya sığmayacak kadar uzun olabilir (yeni bölümlerle daha da uzadı) —
      // canvas'ı sayfa yüksekliğine göre dilimleyip her dilimi ayrı sayfa olarak ekliyoruz,
      // aksi halde eski davranışta tek dev görsel oluşuyor ve ilk sayfadan sonrası kesiliyordu.
      const pxPerMm = canvas.width / pdfWidth;
      const pageHeightPx = Math.floor(pdfPageHeight * pxPerMm);
      let renderedPx = 0;
      let pageIndex = 0;
      while (renderedPx < canvas.height) {
        const sliceHeightPx = Math.min(pageHeightPx, canvas.height - renderedPx);
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceHeightPx;
        const ctx = sliceCanvas.getContext("2d");
        if (!ctx) break;
        ctx.drawImage(canvas, 0, renderedPx, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);
        const sliceData = sliceCanvas.toDataURL("image/png");
        if (pageIndex > 0) pdf.addPage();
        pdf.addImage(sliceData, "PNG", 0, 0, pdfWidth, sliceHeightPx / pxPerMm);
        renderedPx += sliceHeightPx;
        pageIndex += 1;
      }
      pdf.save(`ihaleal-rapor-${Date.now()}.pdf`);
    } catch (err) {
      // Sessiz fail — kullanıcıya bir sonraki tıklamada tekrar deneme şansı.
      clientLogError("pdf-export", err);
    } finally {
      setExporting(false);
    }
  };

  const rentTrend = useMemo(
    () => [
      { y: "3y", pct: report.economic_price_trend_3y_pct ?? 0 },
      { y: "5y", pct: report.economic_price_trend_5y_pct ?? 0 },
    ],
    [report.economic_price_trend_3y_pct, report.economic_price_trend_5y_pct],
  );

  const locationBars = useMemo(
    () => [
      { name: "Metro", km: Number(report.location_metro_distance_km ?? 0) },
      { name: "Okul", km: Number(report.location_school_distance_km ?? 0) },
      { name: "Hastane", km: Number(report.location_hospital_distance_km ?? 0) },
      { name: "AVM", km: Number(report.location_shopping_distance_km ?? 0) },
    ],
    [report],
  );

  const tabs: { key: TabKey; label: string }[] = [
    { key: "legal", label: "Hukuksal" },
    { key: "socio", label: "Sosyoekonomik" },
    { key: "location", label: "Konum" },
    { key: "economic", label: "Ekonomik" },
    { key: "overall", label: "Genel Skor" },
  ];

  const disclaimer = report.overall_disclaimer || AI_REPORT_DISCLAIMER_TR;
  const rawData = report.raw_data as Record<string, unknown> | undefined;
  const coverTitle = auction?.title ?? (rawData?.title_hint as string | undefined) ?? null;
  const coverCity = auction?.city ?? (rawData?.city_hint as string | undefined) ?? null;
  const coverDistrict = auction?.district ?? null;
  const coverPrice = auction?.currentBid || auction?.startingBid || null;
  const coverImage = auction?.images?.[0] ?? null;
  const coverDate = report.generated_at ? new Date(report.generated_at) : null;

  return (
    <div
      ref={reportRef}
      className="rounded-[20px] border border-[var(--cizgi)] bg-white/80 backdrop-blur-xl overflow-hidden"
    >
      {mockBanner ? (
        <div className="px-4 py-2 bg-[var(--zemin-yumusak)] border-b border-[var(--cizgi)] text-[var(--metin-ikincil)] text-xs font-normal text-center">
          MOCK VERİ — gerçek API bağlantısı yok; bilgilendirme amaçlıdır.
        </div>
      ) : null}

      {coverTitle ? (
        <div
          data-testid="report-cover-banner"
          className="relative overflow-hidden border-b border-[var(--cizgi)] px-4 py-5 md:px-6 md:py-6"
          style={{ background: "linear-gradient(135deg, var(--zemin-yumusak), transparent)" }}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {coverImage ? (
              <img
                src={coverImage}
                alt=""
                aria-hidden
                className="w-full md:w-32 h-32 rounded-[20px] object-cover border border-[var(--cizgi)] shrink-0"
              />
            ) : null}
            <div className="flex-1 min-w-0">
              <div className="text-[11px] uppercase tracking-wide text-[var(--metin-ikincil)] font-normal">
                İhaleal — Karşılaştırmalı Piyasa Analizi
              </div>
              <h2 className="text-lg md:text-xl font-normal text-slate-900 truncate">{coverTitle}</h2>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500">
                {coverDistrict || coverCity ? (
                  <span>
                    {[coverDistrict, coverCity].filter(Boolean).join(", ")}
                  </span>
                ) : null}
                {coverDate ? <span>{coverDate.toLocaleDateString("tr-TR")}</span> : null}
              </div>
            </div>
            {coverPrice ? (
              <div className="text-end shrink-0">
                <div className="text-[11px] text-slate-500">Fiyat</div>
                <div className="text-xl font-normal text-slate-900">₺{coverPrice.toLocaleString("tr-TR")}</div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="p-4 md:p-6 flex flex-col md:flex-row gap-6 border-b border-slate-200">
        <BigRing label="Genel risk skoru (düşük daha iyi)" score={report.overall_risk_score} invertRisk />
        <div className="flex-1 flex flex-col justify-center gap-3">
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <span
              className={`inline-flex px-3 py-1 rounded-full text-xs font-normal border ${scoreTone(report.economic_fair_price_score, false)}`}
            >
              Adil fiyat skoru: {report.economic_fair_price_score ?? "—"}/10
            </span>
            {/* N2 — PDF İndir buton (lazy jspdf+html2canvas dynamic import) */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={exporting}
              onClick={handlePdfExport}
              data-testid="report-pdf-download"
              className="gap-2"
            >
              {exporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" aria-hidden />
                  PDF İndir
                </>
              )}
            </Button>
          </div>
          <span className="text-xs text-slate-500">
            Tapu / şerh bilgisi için profesyonel kontrol zorunludur (taslak uyarı).
          </span>
          <AIRaporSorumluluk compact />
          {showApproveButton ? (
            <Button
              type="button"
              disabled={approveDisabled}
              onClick={onApprove}
              className="w-fit [background:var(--gradient-cta)] text-white font-normal"
            >
              Onayla ve Devam
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 p-3 border-b border-slate-200/80 bg-black/20">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-[10px] text-sm font-normal transition-colors ${
              tab === t.key
                ? "bg-[var(--zemin-yumusak)] text-white border border-[var(--cizgi)]"
                : "text-slate-500 hover:text-slate-900 border border-transparent"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-4 md:p-6 space-y-4 min-h-[220px]">
        {tab === "legal" && (
          <div className="space-y-3 animate-fade-in">
            <div className={`inline-flex px-3 py-1 rounded-full text-xs font-normal border ${scoreTone(report.legal_risk_score, true)}`}>
              Hukuksal risk: {report.legal_risk_score ?? "—"}/10
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Tapu durumu (mock): <strong className="text-white">{report.legal_title_deed_status}</strong>. İpotek ve haciz kalemleri tabloda özetlenmiştir — kesin kayıt tapu müdürlüğüdür.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-[20px] border border-slate-200 bg-white/[0.03] p-3">
                <div className="text-slate-500 mb-1">İmar / ruhsat</div>
                <div className="text-slate-200">{report.legal_zoning_status ?? "—"}</div>
                <div className="text-slate-400 mt-2">{report.legal_building_permit_status ?? ""}</div>
              </div>
              <div className="rounded-[20px] border border-slate-200 bg-white/[0.03] p-3">
                <div className="text-slate-500 mb-1">Uyarılar</div>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  {(report.legal_warnings ?? []).map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="h-40 rounded-[20px] border border-slate-200 bg-black/20 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ name: "İpotek (mock)", adet: Array.isArray(report.legal_mortgages) ? report.legal_mortgages.length : 0 }, { name: "Haciz (mock)", adet: Array.isArray(report.legal_liens) ? report.legal_liens.length : 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                  <Bar dataKey="adet" fill="#38bdf8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {tab === "socio" && (
          <div className="space-y-3 animate-fade-in">
            <div className={`inline-flex px-3 py-1 rounded-full text-xs font-normal border ${scoreTone(report.socio_education_score, false)}`}>
              Eğitim endeksi: {report.socio_education_score ?? "—"}/10
            </div>
            <p className="text-sm text-slate-300">
              Gelir düzeyi (mock): <strong>{report.socio_income_level}</strong>. İşsizlik ve demografi yapısı bilgilendirme amaçlıdır; resmi TÜİK verisi bağlanınca güncellenir.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 text-xs">
              <StatMini label="Suç endeksi (mock)" value={`${report.socio_crime_index ?? "—"}/10`} invert />
              <StatMini label="İstihdam %" value={`${report.socio_employment_rate ?? "—"}%`} />
              <StatMini label="Not" value={report.socio_political_lean ?? "—"} />
            </div>
          </div>
        )}

        {tab === "location" && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-2 py-1 rounded-[10px] bg-white/5 border border-slate-200 text-slate-300">
                Deprem riski: {report.location_earthquake_risk}
              </span>
              <span className="text-xs px-2 py-1 rounded-[10px] bg-white/5 border border-slate-200 text-slate-300">
                Yeşil alan %: {report.location_green_area_pct ?? "—"}
              </span>
            </div>
            <p className="text-sm text-slate-300">{report.location_commerce_potential}</p>
            <div className="h-44 rounded-[20px] border border-slate-200 bg-black/20 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationBars}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <Tooltip formatter={(v: number) => `${v} km`} contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                  <Bar dataKey="km" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {tab === "economic" && (
          <EconomicTab report={report} rentTrend={rentTrend} />
        )}

        {tab === "overall" && (
          <div className="space-y-3 animate-fade-in">
            <p className="text-sm text-slate-300 leading-relaxed">{report.overall_recommendation_buyer}</p>
            <p className="text-sm text-slate-300 leading-relaxed">{report.overall_recommendation_seller}</p>
            {(report.overall_red_flags?.length ?? 0) > 0 ? (
              <div className="rounded-[20px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-3">
                <div className="text-xs font-normal text-[var(--metin-ikincil)] mb-2">Kırmızı bayraklar (mock)</div>
                <ul className="text-xs text-[var(--metin-ikincil)] list-disc list-inside space-y-1">
                  {report.overall_red_flags!.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div data-testid="report-disclaimer-block" className="px-4 py-4 md:px-6 md:py-5 border-t border-[var(--cizgi)] bg-[var(--zemin-yumusak)]">
        <div className="text-sm font-normal text-[var(--metin-ikincil)] mb-2">Sorumluluk Feragatnamesi</div>
        <p className="text-[11px] text-[var(--metin-ikincil)] leading-relaxed flex gap-2">
          <span aria-hidden className="inline-flex items-center justify-center w-5 h-5 rounded-[3px] border border-[var(--cizgi)] text-[var(--metin-ikincil)] text-xs font-normal shrink-0">!</span>
          {disclaimer}
        </p>
      </div>
    </div>
  );
}

function EconomicTab({
  report,
  rentTrend,
}: {
  report: PropertyAnalysisReportRecord;
  rentTrend: { y: string; pct: number }[];
}) {
  const analysis = report.raw_data?.economic_real_analysis as EconomicRealAnalysis | undefined;

  if (analysis && !analysis.isReal) {
    return (
      <div className="space-y-3 animate-fade-in">
        <div className="rounded-[20px] border p-4" style={{ borderColor: "var(--durum-uyari)", backgroundColor: "var(--durum-uyari-zemin)" }}>
          <p className="text-sm font-normal" style={{ color: "var(--durum-uyari)" }}>
            Güvenilir bir fiyat tahmini için yeterli gerçek emsal verisi yok.
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--durum-uyari)" }}>
            {analysis.reason === "missing_gross_sqm"
              ? "İlanda m² bilgisi eksik olduğu için m² başı emsal karşılaştırması yapılamıyor."
              : `Bu bölgede/kategoride ${analysis.comparableCount} gerçek emsal bulundu, güvenilir bir bant için en az ${analysis.minComparableRequired} gerekiyor.`}
          </p>
        </div>
        <p className="text-xs text-slate-500">
          Platformda bu tür ilanların kapanmış/aktif sayısı arttıkça bu bölüm otomatik olarak gerçek verilerle dolacaktır.
        </p>
      </div>
    );
  }

  if (analysis && analysis.isReal) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-normal border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] text-[var(--metin-ikincil)]">
            Gerçek veri — {analysis.comparableCount} emsal ilan
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-normal border border-[var(--cizgi)] bg-white/[0.03] text-slate-300">
            Sıralama: {analysis.rank.position}/{analysis.rank.total} — emsallerin %{analysis.rank.percentile}&apos;inden yüksek fiyatlı
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <MiniStatCard label="Emsal sayısı" value={`${analysis.comparableCount}`} />
          <MiniStatCard label="Min. ₺/m²" value={`₺${Math.round(analysis.minPricePerM2).toLocaleString("tr-TR")}`} />
          <MiniStatCard label="Medyan ₺/m²" value={`₺${Math.round(analysis.medianPricePerM2).toLocaleString("tr-TR")}`} />
          <MiniStatCard label="Max. ₺/m²" value={`₺${Math.round(analysis.maxPricePerM2).toLocaleString("tr-TR")}`} />
        </div>

        <div className="rounded-[20px] border border-slate-200 bg-white/[0.03] p-3">
          <div className="text-xs text-slate-500 mb-2">Bu ilanın emsaller içindeki fiyat konumu (₺/m²)</div>
          <PricePositionBar
            min={analysis.minPricePerM2}
            mean={analysis.medianPricePerM2}
            max={analysis.maxPricePerM2}
            target={analysis.targetPricePerM2}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="rounded-[20px] border border-slate-200 bg-white/[0.03] p-3">
            <div className="text-xs text-slate-500">Emsal medyan fiyat (m² başı)</div>
            <div className="text-lg font-normal text-white">
              {report.economic_fair_market_value_try != null
                ? `₺${report.economic_fair_market_value_try.toLocaleString("tr-TR")}`
                : "—"}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Gerçek emsal bandı: ₺{report.economic_lower_bound_try?.toLocaleString("tr-TR") ?? "—"} — ₺
              {report.economic_upper_bound_try?.toLocaleString("tr-TR") ?? "—"}
            </div>
          </div>
          <div className="rounded-[20px] border border-slate-200 bg-white/[0.03] p-3">
            <div className="text-xs text-slate-500">Bölge kapanış primi</div>
            <div className="text-lg font-normal text-white">
              {analysis.closingPremiumPct != null ? `%${analysis.closingPremiumPct}` : "Kapanmış emsal yok"}
            </div>
            {analysis.closingPremiumPct != null && (
              <div className="text-[11px] text-slate-500 mt-1">{analysis.closingSampleSize} kapanmış ihaleden hesaplandı</div>
            )}
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500 mb-2">Emsal fiyat dağılımı — bu ilan turuncu ile işaretli</div>
          <PriceRankScatter rows={analysis.rankedComparables} />
        </div>

        {analysis.historyFromDb && analysis.ownHistoryChangePct != null ? (
          <div className="h-40 rounded-[20px] border border-slate-200 bg-black/20 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rentTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="y" stroke="#94a3b8" />
                <Tooltip formatter={(v: number) => `%${v}`} contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="pct" stroke="#8a8380" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-xs text-slate-500">Bu ilanın kendi geçmiş fiyat kaydı henüz yeterli değil — trend grafiği için zaman gerekiyor.</p>
        )}
        <p className="text-xs text-slate-500">
          Ortalama kira: kiralık emsal veri seti henüz bağlanmadı — bu değer gösterilmiyor (uydurma sayı yok).
        </p>
        {analysis.rankedComparables.length > 0 && (
          <div className="rounded-[20px] border border-slate-200 bg-white/[0.03] p-3 overflow-x-auto">
            <div className="text-xs text-slate-500 mb-2">
              Sıralı emsal listesi ({analysis.rankedComparables.length - 1}/{analysis.comparableCount} emsal + bu ilan, ₺/m² artan sıralı) — satıcı kimliği gösterilmez
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500 border-b border-[var(--cizgi)]">
                  <th className="py-1 pr-2 font-normal">Sıra</th>
                  <th className="py-1 pr-2 font-normal">İlan</th>
                  <th className="py-1 pr-2 font-normal">Konum</th>
                  <th className="py-1 pr-2 font-normal">m²</th>
                  <th className="py-1 pr-2 font-normal">₺/m²</th>
                  <th className="py-1 pr-2 font-normal">Toplam</th>
                  <th className="py-1 pr-2 font-normal">Durum</th>
                  <th className="py-1 font-normal">Benzerlik</th>
                </tr>
              </thead>
              <tbody>
                {analysis.rankedComparables.map((c, i) => (
                  <tr
                    key={c.id}
                    className={
                      c.isTarget
                        ? "border-b-2 border-dashed border-[var(--sinyal-turuncu)] bg-[var(--zemin-yumusak)]"
                        : "border-b border-[var(--cizgi)] last:border-0"
                    }
                  >
                    <td className="py-1 pr-2 text-slate-400">{i + 1}</td>
                    <td className="py-1 pr-2 text-white">
                      {c.isTarget ? "Bu ilan" : c.category || "—"}
                    </td>
                    <td className="py-1 pr-2 text-slate-400">
                      {c.district ? `${c.district}, ${c.city}` : c.city || "—"}
                    </td>
                    <td className="py-1 pr-2 text-slate-400">{c.grossM2 || "—"}</td>
                    <td className="py-1 pr-2 text-slate-400">
                      {c.pricePerM2 > 0 ? `₺${c.pricePerM2.toLocaleString("tr-TR")}` : "—"}
                    </td>
                    <td className="py-1 pr-2 text-slate-400">
                      {c.totalPrice > 0 ? `₺${c.totalPrice.toLocaleString("tr-TR")}` : "—"}
                    </td>
                    <td className="py-1 pr-2 text-slate-400">
                      {c.status === "ended" ? "Kapandı" : c.status === "live" ? "Aktif" : "Yakında"}
                    </td>
                    <td className="py-1 text-slate-400">{c.isTarget ? "—" : `%${c.similarity}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // Analiz meta verisi hiç yoksa (eski/legacy mock rapor) — eski mock görünüm.
  return (
    <div className="space-y-3 animate-fade-in">
      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <div className="rounded-[20px] border border-slate-200 bg-white/[0.03] p-3">
          <div className="text-xs text-slate-500">Piyasa değeri (mock)</div>
          <div className="text-lg font-normal text-[var(--metin-ikincil)]">
            {report.economic_fair_market_value_try != null
              ? `₺${report.economic_fair_market_value_try.toLocaleString("tr-TR")}`
              : "—"}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Band: ₺{report.economic_lower_bound_try?.toLocaleString("tr-TR") ?? "—"} — ₺
            {report.economic_upper_bound_try?.toLocaleString("tr-TR") ?? "—"}
          </div>
        </div>
        <div className="rounded-[20px] border border-slate-200 bg-white/[0.03] p-3">
          <div className="text-xs text-slate-500">Ortalama kira (mock)</div>
          <div className="text-lg font-normal text-white">
            {report.economic_avg_rent_try != null ? `₺${report.economic_avg_rent_try.toLocaleString("tr-TR")}` : "—"}
          </div>
        </div>
      </div>
      <div className="h-40 rounded-[20px] border border-slate-200 bg-black/20 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rentTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="y" stroke="#94a3b8" />
            <Tooltip formatter={(v: number) => `%${v}`} contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
            <Line type="monotone" dataKey="pct" stroke="#8a8380" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-slate-400">{report.economic_municipal_plan_alignment}</p>
    </div>
  );
}

function MiniStatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white/[0.03] p-3 text-center">
      <div className="text-sm font-normal text-white">{value}</div>
      <div className="text-[10px] text-slate-500 mt-1">{label}</div>
    </div>
  );
}

function StatMini({ label, value, invert }: { label: string; value: string; invert?: boolean }) {
  return (
    <div className={`rounded-[20px] border p-3 ${invert ? "border-[var(--cizgi)] bg-[var(--zemin-yumusak)]" : "border-slate-200 bg-white/[0.03]"}`}>
      <div className="text-[11px] text-slate-500 mb-1">{label}</div>
      <div className="text-sm font-normal text-white">{value}</div>
    </div>
  );
}
