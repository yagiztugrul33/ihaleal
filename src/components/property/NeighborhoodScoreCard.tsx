// R13.4 Pantsir — Reusable score card (0-100 + renk)

interface Props {
  label: string;
  score: number;
  detail?: string;
}

function scoreColor(score: number): { ring: string; text: string; bg: string } {
  if (score >= 75) return { ring: "border-emerald-400/45", text: "text-emerald-300", bg: "bg-emerald-500/10" };
  if (score >= 50) return { ring: "border-amber-400/45", text: "text-amber-300", bg: "bg-amber-500/10" };
  return { ring: "border-red-400/45", text: "text-red-300", bg: "bg-red-500/10" };
}

export function NeighborhoodScoreCard({ label, score, detail }: Props) {
  const c = scoreColor(score);
  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-xl border ${c.ring} ${c.bg} p-4 transition hover:scale-[1.02]`}
      title={detail ?? label}
    >
      <div className={`text-3xl font-black ${c.text}`}>{score}</div>
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">{label}</div>
      {detail ? <div className="text-[10px] text-slate-500 text-center line-clamp-2">{detail}</div> : null}
    </div>
  );
}
