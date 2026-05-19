import type { ReactNode } from "react";
import {
  Accessibility,
  AlertCircle,
  Dog,
  FileText,
  Home,
  MapPin,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatTry } from "@/lib/valuation/valuationEngine";

export type DataRow = { label: string; value: ReactNode };

export function ScoreRing({
  score,
  label,
  size = 120,
}: {
  score: number;
  label?: string;
  size?: number;
}) {
  const clamped = Math.min(100, Math.max(0, score));
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;
  const tone =
    clamped >= 70 ? "idr-score--good" : clamped >= 40 ? "idr-score--mid" : "idr-score--low";

  return (
    <div className={`idr-score ${tone}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          opacity={0.12}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="idr-score__inner">
        <span className="idr-score__value">{Math.round(clamped)}</span>
        <span className="idr-score__unit">/100</span>
      </div>
      {label ? <span className="idr-score__label">{label}</span> : null}
    </div>
  );
}

export function StatCard({
  title,
  value,
  hint,
  icon,
  tone = "default",
}: {
  title: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "primary" | "warn";
}) {
  return (
    <div className={`idr-stat idr-stat--${tone}`}>
      {icon ? <div className="idr-stat__icon">{icon}</div> : null}
      <div className="idr-stat__body">
        <span className="idr-stat__title">{title}</span>
        <span className="idr-stat__value">{value}</span>
        {hint ? <span className="idr-stat__hint">{hint}</span> : null}
      </div>
    </div>
  );
}

export function DataTable({ rows, caption }: { rows: DataRow[]; caption?: string }) {
  if (!rows.length) return null;
  return (
    <section className="idr-table-wrap">
      {caption ? <p className="idr-table-caption">{caption}</p> : null}
      <table className="idr-table idr-table--desktop">
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="idr-table-cards idr-table--mobile">
        {rows.map((row) => (
          <li key={row.label} className="idr-table-card">
            <span className="idr-table-card__label">{row.label}</span>
            <span className="idr-table-card__value">{row.value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function BadgeRow({ items, variant = "neutral" }: { items: string[]; variant?: "neutral" | "good" | "warn" }) {
  if (!items.length) return null;
  return (
    <p className={`idr-badges idr-badges--${variant}`}>
      {items.map((item) => (
        <span key={item} className="idr-badge">
          {item}
        </span>
      ))}
    </p>
  );
}

export function SectionTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <header className="idr-section-title">
      <section>
        <h3>{title}</h3>
        {subtitle ? <p>{subtitle}</p> : null}
      </section>
      {action ? <aside className="idr-section-title__action">{action}</aside> : null}
    </header>
  );
}

export function EmptyExpertise({ onRequest }: { onRequest?: () => void }) {
  return (
    <section className="idr-empty-expertise">
      <FileText size={32} strokeWidth={1.5} aria-hidden />
      <h4>Ekspertiz raporu henüz yok</h4>
      <p>SPK lisanslı ekspertiz talep ederek tapu ve piyasa değerini resmileştirebilirsiniz.</p>
      {onRequest ? (
        <button type="button" className="idr-btn idr-btn--primary" onClick={onRequest}>
          Ekspertiz talep et
        </button>
      ) : (
        <Link to="/destek" className="idr-btn idr-btn--primary">
          Destek ile iletişime geç
        </Link>
      )}
    </section>
  );
}

export function MiniMap({
  label,
  district,
  onGoTab,
}: {
  label?: string;
  district?: string;
  onGoTab: (tab: string) => void;
}) {
  return (
    <button
      type="button"
      className="idr-minimap"
      onClick={() => onGoTab("CEVRE")}
      aria-label="Çevre sekmesine git"
    >
      <span className="idr-minimap__grid" aria-hidden />
      <MapPin size={20} className="idr-minimap__pin" aria-hidden />
      <span className="idr-minimap__label">{label ?? "Haritada göster"}</span>
      {district ? <span className="idr-minimap__sub">{district}</span> : null}
    </button>
  );
}

const PERSONA_ICONS: Record<string, typeof Home> = {
  home: Home,
  trending: TrendingUp,
  users: Users,
  paw: Dog,
  accessibility: Accessibility,
};

export function PersonaIcon({ icon }: { icon: string }) {
  const Icon = PERSONA_ICONS[icon] ?? Users;
  return <Icon size={14} aria-hidden />;
}

export function HighlightList({
  items,
  variant,
}: {
  items: string[];
  variant: "good" | "warn";
}) {
  return (
    <ul className={`idr-list idr-list--${variant}`}>
      {items.map((item) => (
        <li key={item}>
          {variant === "warn" ? (
            <AlertCircle size={14} aria-hidden />
          ) : (
            <TrendingUp size={14} aria-hidden />
          )}
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export { formatTry };
