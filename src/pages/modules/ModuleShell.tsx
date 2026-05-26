import type { LucideIcon } from "lucide-react";
import { AlertTriangle } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, FileDown } from "lucide-react";
import { INTELLIGENCE_HUB_PATH } from "@/lib/intelligenceHub";
import { calculateEarthquakeRisk, type SoilClass } from "@/lib/risk/earthquakeRiskEngine";
import "@/styles/modules.css";

export interface ModuleShellProps {
  title: string;
  subtitle: string;
  badge?: string;
  icon: LucideIcon;
  iconAccent?: string;
  children: ReactNode;
}

const RISK_BLOCK_PATHS = new Set([
  "/modul/deprem-risk-haritasi",
  "/modul/bina-risk-sorgu",
  "/modul/canli-deprem-takip",
  "/modul/kentsel-donusum",
  "/modul/guclendirme-rehberi",
  "/modul/afet-toplanma-alanlari",
  "/modul/afet-risk-haritasi",
  "/modul/komsuluk-risk-analizi",
  "/modul/yapay-zeka-hasar-tahmini",
  "/modul/yikilan-binalar-arsivi",
  "/modul/deprem-cantasi",
  "/modul/deprem-sigortasi",
  "/modul/aile-acil-plan",
  "/modul/tatbikat-rehberi",
  "/modul/uzman-randevu",
  "/modul/deprem-egitimi",
]);

export function ModuleShell({
  title,
  subtitle,
  badge = "AI Intelligence Hub",
  icon: Icon,
  iconAccent = "text-sky-300",
  children,
}: ModuleShellProps) {
  const location = useLocation();
  const [faultDistanceKm, setFaultDistanceKm] = useState(11);
  const [pgaG, setPgaG] = useState(0.36);
  const [soilClass, setSoilClass] = useState<SoilClass>("ZC");
  const [sptN160, setSptN160] = useState(34);
  const [buildingAge, setBuildingAge] = useState(14);
  const [softStory, setSoftStory] = useState(false);
  const showRiskCard = RISK_BLOCK_PATHS.has(location.pathname);
  const quickRisk = useMemo(
    () =>
      calculateEarthquakeRisk({
        city: "Istanbul",
        district: "Kadikoy",
        neighborhood: "",
        faultDistanceKm,
        pgaG,
        soilClass,
        fsCoefficient: soilClass === "ZA" ? 1.0 : soilClass === "ZB" ? 1.1 : soilClass === "ZC" ? 1.24 : soilClass === "ZD" ? 1.45 : 1.65,
        f1Coefficient: soilClass === "ZA" ? 1.0 : soilClass === "ZB" ? 1.1 : soilClass === "ZC" ? 1.34 : soilClass === "ZD" ? 1.55 : 1.75,
        sptN160,
        groundwaterDepthM: sptN160 < 30 ? 2.4 : 4.8,
        alluviumPercent: sptN160 < 30 ? 58 : 36,
        buildingAge,
        structuralSystem: "reinforced_concrete",
        codeEra: buildingAge > 8 ? "pre_2018" : "post_2018",
        storyCount: 7,
        softStory,
      }),
    [faultDistanceKm, pgaG, soilClass, sptN160, buildingAge, softStory],
  );

  return (
    <div className="mod-page">
      <div className="mod-page__bg" aria-hidden />
      <div className="mod-page__inner">
        <nav className="mod-breadcrumb" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm">
            <li>
              <Link to="/">Ana Sayfa</Link>
            </li>
            <li aria-hidden className="text-slate-600">
              <ChevronRight className="inline h-3.5 w-3.5" />
            </li>
            <li>
              <Link to={INTELLIGENCE_HUB_PATH}>Araştırma</Link>
            </li>
            <li aria-hidden className="text-slate-600">
              <ChevronRight className="inline h-3.5 w-3.5" />
            </li>
            <li className="text-slate-200">{title}</li>
          </ol>
        </nav>

        <header className="mod-hero">
          <span className="mod-hero__badge">{badge}</span>
          <div className="mod-hero__title-row">
            <div className="mod-hero__icon">
              <Icon className={`h-5 w-5 ${iconAccent}`} aria-hidden />
            </div>
            <div>
              <h1 className="mod-hero__title">{title}</h1>
              <p className="mod-hero__subtitle">{subtitle}</p>
            </div>
          </div>
          <div className="mod-hero__narrative" aria-label="Modül kapsam özeti">
            <p>
              {title}, yatırım kararı öncesinde ihtiyaç duyulan saha, finans ve operasyon verisini tek akışta birleştiren
              analiz katmanıdır. Çıktılar yalnızca skor göstermekle kalmaz; belirsizlik noktalarını, teyit edilmesi gereken
              adımları ve belge ihtiyacını da açıkça işaretler.
            </p>
            <p>
              Modül içinde üretilen senaryolar tr-TR sayı ve para formatlarıyla standartlaştırılır; böylece ekipler aynı
              raporu hukuk, ekspertiz ve satış tarafında ortak bir dil ile okuyabilir. Bu yaklaşım, yatırım komitesi
              toplantılarında karar süresini kısaltırken hatalı varsayım riskini görünür hale getirir.
            </p>
            <p>
              Her rapor çıktısı bir başlangıç noktası olarak tasarlanır: resmi tapu, imar, sigorta ve teknik onay adımları
              ile birlikte değerlendirildiğinde en yüksek verimi sağlar. Bu nedenle modül ekranlarında “ne yapılmalı”
              önerileri de sunularak uygulama planı netleştirilir.
            </p>
          </div>
        </header>

        {showRiskCard ? (
          <section className="rounded-xl border border-rose-500/35 bg-rose-500/10 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-200">TBDY 2018 hızlı risk kartı</p>
                <p className="mt-1 text-sm text-slate-200">Fay + PGA + zemin + SPT N1,60 + yapısal yaş etkisiyle ön risk skoru.</p>
              </div>
              <p className="text-2xl font-black text-white">{quickRisk.totalScore}/100</p>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-3 xl:grid-cols-6">
              <label className="text-xs text-slate-200">
                Fay km
                <input className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm" type="number" value={faultDistanceKm} onChange={(e) => setFaultDistanceKm(Number(e.target.value || 0))} />
              </label>
              <label className="text-xs text-slate-200">
                PGA g
                <input className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm" type="number" step="0.01" value={pgaG} onChange={(e) => setPgaG(Number(e.target.value || 0))} />
              </label>
              <label className="text-xs text-slate-200">
                Zemin
                <select className="mt-1 h-8 w-full rounded-md border border-slate-700 bg-slate-900 px-2 text-sm" value={soilClass} onChange={(e) => setSoilClass(e.target.value as SoilClass)}>
                  <option value="ZA">ZA</option>
                  <option value="ZB">ZB</option>
                  <option value="ZC">ZC</option>
                  <option value="ZD">ZD</option>
                  <option value="ZE">ZE</option>
                </select>
              </label>
              <label className="text-xs text-slate-200">
                SPT N1,60
                <input className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm" type="number" value={sptN160} onChange={(e) => setSptN160(Number(e.target.value || 0))} />
              </label>
              <label className="text-xs text-slate-200">
                Yapı yaşı
                <input className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm" type="number" value={buildingAge} onChange={(e) => setBuildingAge(Number(e.target.value || 0))} />
              </label>
              <label className="inline-flex items-center gap-2 self-end rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-200">
                <input type="checkbox" checked={softStory} onChange={(e) => setSoftStory(e.target.checked)} />
                Yumuşak kat
              </label>
            </div>
            <div className="mt-2 grid gap-2 md:grid-cols-2 text-xs">
              <p className="rounded-md border border-slate-700 bg-slate-900/60 px-2 py-1.5 text-slate-300">
                Katmanlar: Fay/PGA {quickRisk.hazard.score}, Zemin {quickRisk.soil.score}, Sıvılaşma {quickRisk.liquefaction.score}, Yapısal {quickRisk.structural.score}
              </p>
              <p className="rounded-md border border-amber-500/35 bg-amber-500/10 px-2 py-1.5 text-amber-100 inline-flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Ön analizdir; lisanslı jeoloji/inşaat müh. raporu olmadan bağlayıcı değildir.
              </p>
            </div>
          </section>
        ) : null}

        {children}

        <p className="mod-disclaimer">
          Bu modül yapay zeka destekli ön analiz sunar. Resmi tapu, imar, ekspertiz ve sigorta belgeleri için lisanslı
          kurum onayı gereklidir; sonuçlar yatırım tavsiyesi değildir.
        </p>
      </div>
    </div>
  );
}

export interface ModulePanelProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}

export function ModulePanel({ title, action, children }: ModulePanelProps) {
  return (
    <section className="mod-panel">
      <div className="mod-panel__head">
        <h2 className="mod-panel__title">{title}</h2>
        {action}
      </div>
      <div className="mod-panel__body">{children}</div>
    </section>
  );
}

export interface StatItem {
  label: string;
  value: string;
  hint?: string;
}

export function ModuleStatGrid({ stats }: { stats: StatItem[] }) {
  return (
    <div className="mod-stats">
      {stats.map((s) => (
        <div key={s.label} className="mod-stat">
          <div className="mod-stat__label">{s.label}</div>
          <div className="mod-stat__value">{s.value}</div>
          {s.hint ? <div className="mod-stat__hint">{s.hint}</div> : null}
        </div>
      ))}
    </div>
  );
}

export interface ModuleTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
}

export function ModuleDataTable<T extends { id: string }>({
  columns,
  rows,
  caption,
}: {
  columns: ModuleTableColumn<T>[];
  rows: T[];
  caption?: string;
}) {
  return (
    <div className="mod-table-wrap">
      <table className="mod-table">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((c) => (
                <td key={c.key}>{c.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ModulePdfCta({ label = "Yazdır / PDF olarak kaydet" }: { label?: string }) {
  return (
    <div className="mod-pdf-cta">
      <p>Kurumsal formatli PDF rapor, harita ekleri ve yonetici ozeti ile hazirlanir.</p>
      <button type="button" className="mod-btn-secondary" onClick={() => window.print()}>
        <FileDown className="h-4 w-4" aria-hidden />
        {label}
      </button>
    </div>
  );
}

export function ModuleTag({ tone, children }: { tone: "ok" | "warn" | "risk"; children: ReactNode }) {
  return <span className={`mod-tag mod-tag--${tone}`}>{children}</span>;
}
