import { fmtScore, riskBandFromScore, RISK_BAND_STYLES } from "@/lib/engineering/formatDisplay";

type Props = {
  label: string;
  score: number;
  invert?: boolean;
};

export function ScoreBadge({ label, score, invert }: Props) {
  const band = invert
    ? riskBandFromScore(100 - Math.min(100, Math.max(0, score)))
    : riskBandFromScore(score);
  return (
    <div className={`rounded-[20px] border p-3 text-center ${RISK_BAND_STYLES[band]}`}>
      <p className="text-[10px] uppercase tracking-wider opacity-80">{label}</p>
      <p className="text-xl font-normal mt-1">{fmtScore(score)}</p>
    </div>
  );
}
