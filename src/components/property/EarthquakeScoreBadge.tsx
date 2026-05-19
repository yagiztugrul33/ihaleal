import { useMemo } from "react";
import type { PropertyRecord } from "@/types/property";
import { getEarthquakeScore, scoreBandLabelTr, topSubScores } from "@/lib/scoring/getEarthquakeScore";

const bandClass: Record<string, string> = {
  A: "eq-badge--excellent",
  B: "eq-badge--good",
  C: "eq-badge--moderate",
  D: "eq-badge--low",
  E: "eq-badge--critical",
};

export interface EarthquakeScoreBadgeProps {
  property: PropertyRecord;
  className?: string;
}

export function EarthquakeScoreBadge({ property, className }: EarthquakeScoreBadgeProps) {
  const data = useMemo(() => getEarthquakeScore(property), [property]);
  const top = useMemo(() => topSubScores(data, 4), [data]);
  const bc = bandClass[data.band] ?? "eq-badge--moderate";
  const composite = Math.round(data.totalScore);

  return (
    <div className={`eq-badge-wrap ${className ?? ""}`.trim()}>
      <div
        className={`eq-badge ${bc}`}
        role="img"
        aria-label={`Deprem puani ${composite} uzerinden 100`}
      >
        <span className="eq-badge__ring" aria-hidden>
          <svg viewBox="0 0 56 56" width="56" height="56">
            <circle cx="28" cy="28" r="24" fill="none" className="eq-badge__track" strokeWidth="6" />
            <circle
              cx="28"
              cy="28"
              r="24"
              fill="none"
              className="eq-badge__prog"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${(composite / 100) * 150.8} 150.8`}
              transform="rotate(-90 28 28)"
            />
          </svg>
          <span className="eq-badge__val">{composite}</span>
        </span>
      </div>
      <div className="eq-badge__panel" role="status">
        <p className="eq-badge__title">Deprem ozeti</p>
        <p className="eq-badge__band">{scoreBandLabelTr(data.band)}</p>
        <ul className="eq-badge__subs">
          {top.map((s) => (
            <li key={s.key}>
              <span>{s.labelTr}</span>
              <strong>{Math.round(s.score)}</strong>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
