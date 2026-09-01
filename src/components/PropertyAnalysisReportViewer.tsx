import { useMemo, useRef, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { Download, Loader2 } from "lucide-react";
import type { PropertyAnalysisReportRecord } from "@/lib/aiAnalysis";
import { AI_REPORT_DISCLAIMER_TR } from "@/lib/aiAnalysis";
import { clientLogError } from "@/lib/clientLog";
import { AIRaporSorumluluk } from "@/components/legal/AIRaporSorumluluk";
import { Button } from "@/components/ui/button";

type TabKey = "legal" | "socio" | "location" | "economic" | "overall";

function scoreTone(score: number | null | undefined, invertRisk?: boolean): string {
  if (score == null || Number.isNaN(score)) return "text-slate-400 border-slate-200 bg-white/5";
  const v = invertRisk ? 11 - score : score;
  if (v >= 8) return "text-emerald-300 border-emerald-400/30 bg-emerald-500/10";
  if (v >= 5) return "text-amber-200 border-amber-400/30 bg-amber-500/10";
  return "text-red-300 border-red-400/35 bg-red-500/10";
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
  const tone =
    pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`relative w-28 h-28 rounded-full flex items-center justify-center ${tone} p-[3px] shadow-lg`}
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

export type PropertyAnalysisReportViewerProps = {
  report: PropertyAnalysisReportRecord;
  mockBanner?: boolean;
  showApproveButton?: boolean;
  onApprove?: () => void;
  approveDisabled?: boolean;
};

export function PropertyAnalysisReportViewer({
  report,
  mockBanner,
  showApproveButton,
  onApprove,
  approveDisabled,
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
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
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

  return (
    <div
      ref={reportRef}
      className="rounded-[20px] border border-cyan-400/20 bg-white/80 backdrop-blur-xl shadow-xl shadow-cyan-900/20 overflow-hidden"
    >
      {mockBanner ? (
        <div className="px-4 py-2 bg-amber-500/15 border-b border-amber-400/25 text-amber-100 text-xs font-normal text-center">
          MOCK VERİ — gerçek API bağlantısı yok; bilgilendirme amaçlıdır.
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
              className="w-fit [background:var(--gradient-cta)] text-white font-normal shadow-lg shadow-cyan-900/30"
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
                ? "bg-blue-500/20 text-white border border-blue-500/35"
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
          <div className="space-y-3 animate-fade-in">
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-[20px] border border-slate-200 bg-white/[0.03] p-3">
                <div className="text-xs text-slate-500">Piyasa değeri (mock)</div>
                <div className="text-lg font-normal text-cyan-300">
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
                  <Line type="monotone" dataKey="pct" stroke="#22d3ee" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-slate-400">{report.economic_municipal_plan_alignment}</p>
          </div>
        )}

        {tab === "overall" && (
          <div className="space-y-3 animate-fade-in">
            <p className="text-sm text-slate-300 leading-relaxed">{report.overall_recommendation_buyer}</p>
            <p className="text-sm text-slate-300 leading-relaxed">{report.overall_recommendation_seller}</p>
            {(report.overall_red_flags?.length ?? 0) > 0 ? (
              <div className="rounded-[20px] border border-red-400/25 bg-red-500/10 p-3">
                <div className="text-xs font-normal text-red-200 mb-2">Kırmızı bayraklar (mock)</div>
                <ul className="text-xs text-red-100/90 list-disc list-inside space-y-1">
                  {report.overall_red_flags!.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-amber-400/20 bg-amber-500/5">
        <p className="text-[11px] text-amber-100/90 leading-relaxed flex gap-2">
          <span aria-hidden className="inline-flex items-center justify-center w-5 h-5 rounded-[3px] border border-amber-500/40 text-amber-400 text-xs font-normal">!</span>
          {disclaimer}
        </p>
      </div>
    </div>
  );
}

function StatMini({ label, value, invert }: { label: string; value: string; invert?: boolean }) {
  return (
    <div className={`rounded-[20px] border p-3 ${invert ? "border-orange-400/20 bg-orange-500/5" : "border-slate-200 bg-white/[0.03]"}`}>
      <div className="text-[11px] text-slate-500 mb-1">{label}</div>
      <div className="text-sm font-normal text-white">{value}</div>
    </div>
  );
}
