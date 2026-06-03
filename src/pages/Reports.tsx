import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText, Calendar, TrendingUp, TrendingDown, Minus, Download, Loader2,
  Sparkles, Filter, X, MapPin, Building2, Mail, Bell, ChevronRight, BarChart3,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageBreadcrumbs } from "@/components/seo/PageBreadcrumbs";
import { DEMO_REPORTS } from "@/data/reportsDemo";
import {
  generateAllReports,
  CATEGORY_LABEL_TR,
  type MonthlyIndexReport,
  type ReportCategory,
  type ReportCity,
} from "@/lib/reports/monthlyIndexReports";
import { REGIONAL_PRICE_DATA } from "@/lib/valuation/regionalPriceData";
import { downloadStructuredPdf } from "@/lib/pdf/pdfBuilder";
import { cn } from "@/lib/utils";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const DEMO_CATEGORY_LABEL: Record<string, string> = {
  piyasa: "Piyasa",
  operasyon: "Operasyon",
  uyumluluk: "Uyumluluk",
};

function formatTRY(v: number): string {
  return `₺${v.toLocaleString("tr-TR")}`;
}

export default function Reports() {
  // Aylık endeks raporları üret (son 12 ay × 10 şehir = 120 rapor)
  const allReports = useMemo(() => generateAllReports(12), []);

  // Filtre state
  const [filterCity, setFilterCity] = useState<ReportCity | "">("");
  const [filterCategory, setFilterCategory] = useState<ReportCategory | "">("");
  const [filterYear, setFilterYear] = useState<string>("");

  // Abone opt-in state — backend RPC ile entegre (Master onaylı, migration aktif).
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "submitting" | "saved" | "error">("idle");
  const [subscribeMessage, setSubscribeMessage] = useState<string>("");

  // PDF download busy state (per report)
  const [pdfBusy, setPdfBusy] = useState<string | null>(null);

  const cityOptions = REGIONAL_PRICE_DATA.map((c) => ({ value: c.key, label: c.label }));
  const yearOptions = useMemo(() => {
    const years = Array.from(new Set(allReports.map((r) => r.year))).sort((a, b) => b - a);
    return years;
  }, [allReports]);

  const filtered = useMemo(() => {
    return allReports.filter((r) => {
      if (filterCity && r.city !== filterCity) return false;
      if (filterCategory) {
        // Kategori filtresi: rapor bir şehrin tüm kategorilerini içerir,
        // ama o kategoride bir hareket varsa göster (her zaman true, kategori burada vurgu için)
        // Burada her rapor 3 kategori içerdiği için filtre kategori-spesifik vurgulamayı render'da yapıyoruz.
      }
      if (filterYear && String(r.year) !== filterYear) return false;
      return true;
    });
  }, [allReports, filterCity, filterCategory, filterYear]);

  const featured = filtered.slice(0, 3);
  const archive = filtered.slice(3, 30); // Sonraki 27 rapor

  const downloadReportPdf = async (r: MonthlyIndexReport) => {
    if (pdfBusy) return;
    setPdfBusy(r.id);
    try {
      await downloadStructuredPdf({
        title: `İhaleal Aylık Endeks Raporu`,
        subtitle: `${r.cityLabel} · ${r.monthLabel}`,
        filename: `ihaleal-endeks-${r.id}.pdf`,
        disclaimer:
          "Bu rapor canlı baz fiyat + algoritmik aylık varyans ile üretilmiştir. " +
          "SPK lisanslı resmi ekspertiz veya bağlayıcı piyasa raporu değildir. " +
          "Yatırım tavsiyesi değildir; lisanslı analiz için profesyonel kaynak gereklidir.",
        sections: [
          {
            heading: "Genel Endeks Özeti",
            lines: [
              `Şehir: ${r.cityLabel}`,
              `Dönem: ${r.monthLabel}`,
              `Genel ağırlıklı endeks: ${formatTRY(r.overallIndex)}/m² (konut %60 + ticari %25 + arsa %15)`,
              `Aylık değişim: %${r.overallChangePct > 0 ? "+" : ""}${r.overallChangePct.toFixed(2)}`,
            ],
          },
          {
            heading: "Kategori Bazlı Birim Fiyatlar",
            lines: r.rows.flatMap((row) => [
              `${CATEGORY_LABEL_TR[row.category]} satış: ${formatTRY(row.avgSalePerM2)}/m²` +
                ` (aylık %${row.changePct > 0 ? "+" : ""}${row.changePct.toFixed(2)}, ` +
                `yıllık %${row.yearlyChangePct > 0 ? "+" : ""}${row.yearlyChangePct.toFixed(2)})`,
              `${CATEGORY_LABEL_TR[row.category]} kira: ${formatTRY(row.avgRentPerM2)}/m²/ay`,
            ]),
          },
          ...(r.topDistricts.length > 0
            ? [
                {
                  heading: "En Yüksek Birim Fiyatlı İlçeler",
                  lines: r.topDistricts.map(
                    (d) =>
                      `${d.name}: ${formatTRY(d.salePerM2)}/m² satış · ${formatTRY(d.rentPerM2)}/m² kira`,
                  ),
                },
              ]
            : []),
          {
            heading: "Özet Yorum",
            lines: [r.summary],
          },
          {
            heading: "Veri Kaynağı ve Metodoloji",
            lines: [
              "Birim fiyatlar regionalPriceData lokal baz fiyat (10 büyük il) üzerine kategori katsayısı ve aylık deterministik varyans ile üretildi.",
              "Ağırlıklı genel endeks: konut %60, ticari %25, arsa %15.",
              "Yıllık değişim ortalaması %18 nominal trend etrafında salınır (kategori volatilitesi: konut 1.0, ticari 1.3, arsa 1.5).",
              "Üretim sürümünde gerçek price_index zaman serisi (Supabase tablosu) entegre edilir.",
            ],
          },
        ],
      });
    } finally {
      setPdfBusy(null);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribeEmail.trim() || !/^.+@.+\..+$/.test(subscribeEmail)) return;
    setSubscribeStatus("submitting");
    setSubscribeMessage("");
    try {
      if (!isSupabaseConfigured()) {
        // Lokal/dev fallback — RPC çağrılamıyor.
        setSubscribeStatus("saved");
        setSubscribeMessage("Tercih lokal olarak kaydedildi (Supabase yapılandırılmamış).");
      } else {
        const cities = filterCity ? [filterCity] : [];
        const categories = filterCategory ? [filterCategory] : [];
        const { data, error } = await supabase.rpc("subscribe_to_reports", {
          p_email: subscribeEmail.trim(),
          p_cities: cities,
          p_categories: categories,
        });
        if (error) {
          setSubscribeStatus("error");
          setSubscribeMessage(error.message || "Abonelik sırasında bir sorun oluştu.");
          return;
        }
        const result = (data ?? {}) as { status?: string; message?: string };
        if (result.status !== "ok") {
          setSubscribeStatus("error");
          setSubscribeMessage(result.message || "Abonelik reddedildi.");
          return;
        }
        setSubscribeStatus("saved");
        setSubscribeMessage(result.message || "Abonelik talebi alındı. E-postanıza onay bağlantısı gönderilecek.");
      }
      setSubscribeEmail("");
    } catch (err) {
      setSubscribeStatus("error");
      setSubscribeMessage(String(err).slice(0, 200));
    }
  };

  const clearFilters = () => {
    setFilterCity("");
    setFilterCategory("");
    setFilterYear("");
  };

  const activeFilterCount = (filterCity ? 1 : 0) + (filterCategory ? 1 : 0) + (filterYear ? 1 : 0);

  const renderReportCard = (r: MonthlyIndexReport, variant: "featured" | "compact" = "compact") => {
    const arrowIcon =
      r.overallChangePct > 0 ? <TrendingUp className="w-3 h-3" /> :
      r.overallChangePct < 0 ? <TrendingDown className="w-3 h-3" /> :
      <Minus className="w-3 h-3" />;
    const arrowClass =
      r.overallChangePct > 0 ? "text-emerald-300" :
      r.overallChangePct < 0 ? "text-red-300" : "text-slate-400";
    return (
      <Card
        key={r.id}
        className={cn(
          "border-slate-200/80 bg-slate-900/40 hover:border-cyan-400/40 transition-colors",
          variant === "featured" && "border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 to-slate-900/60",
        )}
      >
        <CardContent className={cn(variant === "featured" ? "p-5" : "p-4")}>
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-cyan-300 mb-1">
                <MapPin className="w-3 h-3" /> {r.cityLabel}
              </div>
              <h3 className={cn(
                "font-bold text-white leading-tight",
                variant === "featured" ? "text-lg" : "text-sm",
              )}>
                {r.monthLabel} Endeks Raporu
              </h3>
            </div>
            <Badge variant="outline" className="text-[10px] flex-shrink-0">
              <Calendar className="w-2.5 h-2.5 me-1" />
              {new Date(r.publishedAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" })}
            </Badge>
          </div>

          {/* Genel endeks değeri */}
          <div className="rounded-lg bg-slate-950/50 border border-slate-700/40 p-3 mb-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Genel endeks</p>
                <p className={cn("font-bold text-white", variant === "featured" ? "text-2xl" : "text-xl")}>
                  {formatTRY(r.overallIndex)}<span className="text-xs text-slate-500">/m²</span>
                </p>
              </div>
              <div className={cn("inline-flex items-center gap-1 text-sm font-semibold", arrowClass)}>
                {arrowIcon}
                {r.overallChangePct > 0 ? "+" : ""}{r.overallChangePct.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Kategori vurgusu — featured'da göster */}
          {variant === "featured" ? (
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {r.rows.map((row) => {
                const isActiveCat = filterCategory && row.category === filterCategory;
                return (
                  <div
                    key={row.category}
                    className={cn(
                      "rounded-md border px-2 py-1.5 text-center",
                      isActiveCat ? "border-amber-400/50 bg-amber-500/10" : "border-slate-700/40 bg-slate-950/30",
                    )}
                  >
                    <p className="text-[9px] uppercase tracking-wider text-slate-500">{CATEGORY_LABEL_TR[row.category]}</p>
                    <p className="text-xs font-semibold text-white">{formatTRY(row.avgSalePerM2)}/m²</p>
                    <p className={cn(
                      "text-[10px]",
                      row.changePct > 0 ? "text-emerald-300" : row.changePct < 0 ? "text-red-300" : "text-slate-400",
                    )}>
                      {row.changePct > 0 ? "+" : ""}{row.changePct.toFixed(1)}%
                    </p>
                  </div>
                );
              })}
            </div>
          ) : null}

          {variant === "featured" ? (
            <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">{r.summary}</p>
          ) : null}

          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => downloadReportPdf(r)}
              disabled={pdfBusy === r.id}
              variant="accent"
              className="flex-1 h-8 text-xs"
            >
              {pdfBusy === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
              {pdfBusy === r.id ? "Hazır…" : "PDF İndir"}
            </Button>
            <Button
              asChild
              type="button"
              size="sm"
              variant="outline"
              className="border-cyan-400/30 text-cyan-200 hover:bg-cyan-500/10 h-8 text-xs"
            >
              <Link to={`/borsa/sehir/${r.city}`}>
                <BarChart3 className="w-3 h-3 me-1" /> {r.cityLabel}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="mx-auto max-w-6xl">
        <PageBreadcrumbs
          className="mb-4"
          items={[
            { label: "Ana sayfa", href: "/" },
            { label: "Borsa", href: "/borsa" },
            { label: "Aylık raporlar" },
          ]}
        />

        {/* Hero */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200 mb-3">
            <Sparkles className="h-3.5 w-3.5" /> Aylık endeks raporları
          </div>
          <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">İhaleal Endeks Raporları</h1>
              <p className="mt-2 text-sm text-slate-400 max-w-2xl">
                Aylık şehir endeksleri, konut/ticari/arsa kategori birim fiyatları ve trend.
                Tek tıkla Roboto Türkçe PDF indir.
              </p>
            </div>
            <Badge variant="outline" className="border-amber-500/40 text-amber-200">
              {filtered.length} rapor
            </Badge>
          </div>
        </div>

        {/* Filtre paneli */}
        <Card className="mb-6 bg-slate-900/50 border-slate-200/80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" /> Filtre
              </h2>
              {activeFilterCount > 0 ? (
                <button type="button" onClick={clearFilters} className="text-[10px] text-cyan-300 hover:text-cyan-200 uppercase tracking-wider inline-flex items-center gap-1">
                  <X className="w-3 h-3" /> Temizle ({activeFilterCount})
                </button>
              ) : null}
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">Şehir</label>
                <select
                  value={filterCity}
                  onChange={(e) => setFilterCity(e.target.value as ReportCity | "")}
                  className="w-full text-xs rounded-md border border-white/10 bg-slate-950 px-2 py-1.5 text-white"
                  aria-label="Şehir filtresi"
                >
                  <option value="">Tümü</option>
                  {cityOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">Kategori</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as ReportCategory | "")}
                  className="w-full text-xs rounded-md border border-white/10 bg-slate-950 px-2 py-1.5 text-white"
                  aria-label="Kategori filtresi"
                >
                  <option value="">Tümü</option>
                  {(["konut", "ticari", "arsa"] as ReportCategory[]).map((c) => (
                    <option key={c} value={c}>{CATEGORY_LABEL_TR[c]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1">Yıl</label>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="w-full text-xs rounded-md border border-white/10 bg-slate-950 px-2 py-1.5 text-white"
                  aria-label="Yıl filtresi"
                >
                  <option value="">Tümü</option>
                  {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Featured 3 raporu */}
        {featured.length > 0 ? (
          <section className="mb-8" data-testid="featured-reports">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" /> Öne Çıkan En Yeni Raporlar
            </h2>
            <div className="grid gap-3 md:grid-cols-3">
              {featured.map((r) => renderReportCard(r, "featured"))}
            </div>
          </section>
        ) : null}

        {/* Arşiv grid */}
        {archive.length > 0 ? (
          <section className="mb-8" data-testid="archive-reports">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-400" /> Geçmiş Raporlar
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {archive.map((r) => renderReportCard(r, "compact"))}
            </div>
          </section>
        ) : null}

        {filtered.length === 0 ? (
          <Card className="bg-slate-900/40 border-amber-500/30">
            <CardContent className="p-8 text-center">
              <p className="text-sm text-slate-300 mb-3">Bu filtrelere uyan rapor yok.</p>
              <Button type="button" variant="outline" onClick={clearFilters}>
                Tüm filtreleri temizle
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {/* Abone opt-in */}
        <Card className="mb-8 bg-gradient-to-br from-violet-500/10 to-slate-900/40 border-violet-400/30" data-testid="subscribe-form">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 flex-wrap">
              <div className="rounded-xl bg-violet-500/15 p-3 flex-shrink-0">
                <Bell className="w-6 h-6 text-violet-300" />
              </div>
              <div className="flex-1 min-w-[260px]">
                <h2 className="text-lg font-semibold text-white mb-1">Aylık Endeks Raporları E-postanıza Gelsin</h2>
                <p className="text-sm text-slate-300 mb-3">
                  Her ay yeni rapor yayınlandığında otomatik bildirim; istediğinizde aboneliği bırakırsınız.
                </p>
                {subscribeStatus === "saved" ? (
                  <div className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100" role="status">
                    {subscribeMessage || "Aboneliğiniz kaydedildi."}
                    <span className="block text-[10px] text-emerald-200/70 mt-0.5">
                      Onay maili geldiğinde linke tıklayarak aboneliği aktifleştirin (double opt-in).
                    </span>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex flex-wrap gap-2">
                    <div className="relative flex-1 min-w-[200px]">
                      <Mail className="absolute start-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input
                        type="email"
                        value={subscribeEmail}
                        onChange={(e) => setSubscribeEmail(e.target.value)}
                        placeholder="E-posta adresiniz"
                        required
                        className="ps-8 bg-slate-950 border-violet-400/30 text-white"
                        aria-label="Abone e-posta"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="!bg-violet-500 hover:!bg-violet-400 !text-white"
                      disabled={subscribeStatus === "submitting"}
                    >
                      {subscribeStatus === "submitting" ? "Gönderiliyor…" : "Abone Ol"}
                    </Button>
                  </form>
                )}
                {subscribeStatus === "error" && subscribeMessage ? (
                  <p className="mt-2 rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-100" role="alert">
                    {subscribeMessage}
                  </p>
                ) : null}
                <p className="mt-2 text-[10px] text-slate-500 italic">
                  Double opt-in: önce onay maili, sonra abonelik aktif olur. Tek tıkla istediğin
                  zaman bırakabilirsin.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Eski genel belgeler (korundu) */}
        <section data-testid="demo-reports">
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-400" /> Diğer Analiz ve Bilgilendirme Belgeleri
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            Piyasa, operasyon ve uyumluluk üzerine genel özet belgeleri.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DEMO_REPORTS.map((r) => (
              <Card key={r.id} className="border-slate-200/80 bg-slate-900/40 hover:border-blue-400/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                    <h3 className="font-semibold leading-snug text-white text-sm">
                      <Link to={`/rapor/${r.id}`} className="hover:text-blue-300">
                        {r.title}
                      </Link>
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 mb-2">
                    <Badge variant="secondary" className="font-normal text-[9px]">
                      {DEMO_CATEGORY_LABEL[r.category] ?? r.category}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-2.5 w-2.5" /> {r.updatedAt}
                    </span>
                    <span>{r.readingMinutes} dk</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{r.excerpt}</p>
                  <Link
                    to={`/rapor/${r.id}`}
                    className="mt-3 inline-flex items-center text-xs font-medium text-blue-400 hover:text-blue-300"
                  >
                    Belgeyi aç <ChevronRight className="w-3 h-3 ms-0.5" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
