import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, FileDown } from "lucide-react";
import { INTELLIGENCE_HUB_PATH } from "@/lib/intelligenceHub";
import "@/styles/modules.css";

export interface ModuleShellProps {
  title: string;
  subtitle: string;
  badge?: string;
  icon: LucideIcon;
  iconAccent?: string;
  children: ReactNode;
}

export function ModuleShell({
  title,
  subtitle,
  badge = "AI Intelligence Hub",
  icon: Icon,
  iconAccent = "text-sky-300",
  children,
}: ModuleShellProps) {
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
        </header>

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

export function ModulePdfCta({ label = "Detayli PDF raporu indir" }: { label?: string }) {
  return (
    <div className="mod-pdf-cta">
      <p>Kurumsal formatli PDF rapor, harita ekleri ve yonetici ozeti ile hazirlanir.</p>
      <button type="button" className="mod-btn-secondary" onClick={() => window.alert("PDF raporu yakinda aktif olacak.")}>
        <FileDown className="h-4 w-4" aria-hidden />
        {label}
      </button>
    </div>
  );
}

export function ModuleTag({ tone, children }: { tone: "ok" | "warn" | "risk"; children: ReactNode }) {
  return <span className={`mod-tag mod-tag--${tone}`}>{children}</span>;
}
