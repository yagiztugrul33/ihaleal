import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { PageShell } from "@/components/marketing/PageShell";
import { YORUM_REVIEWS, type YorumRole } from "@/data/yorumReviews";

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${n} yildiz`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className="h-4 w-4"
          fill={i < n ? "#fbbf24" : "none"}
          stroke={i < n ? "#fbbf24" : "#64748b"}
        />
      ))}
    </span>
  );
}

function roleLabel(r: YorumRole): string {
  if (r === "yatirimci") return "Yatirimci";
  if (r === "emlakci") return "Emlakci";
  return "Muteahhit";
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
  return (
    <div
      className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-sm font-bold text-white"
      style={{
        background: `linear-gradient(135deg, hsl(${(name.charCodeAt(0) * 3) % 360} 70% 45%), hsl(${(name.charCodeAt(1) * 5) % 360} 80% 55%))`,
      }}
      aria-hidden
    >
      {initials}
    </div>
  );
}

export default function YorumlarPage() {
  const [role, setRole] = useState<"all" | YorumRole>("all");
  const [starFilter, setStarFilter] = useState<"all" | number>("all");
  const filtered = useMemo(() => {
    let rows = role === "all" ? YORUM_REVIEWS : YORUM_REVIEWS.filter((r) => r.role === role);
    if (starFilter !== "all") rows = rows.filter((r) => r.stars === starFilter);
    return rows;
  }, [role, starFilter]);
  const avg = YORUM_REVIEWS.reduce((s, r) => s + r.stars, 0) / YORUM_REVIEWS.length;
  const dist = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: YORUM_REVIEWS.filter((r) => r.stars === stars).length,
  }));

  return (
    <PageShell badge="Topluluk" title="Kullanici yorumlari" subtitle="Yatirimci, emlakci ve muteahhit deneyimleri">
      <div className="mx-auto max-w-5xl px-4 flex flex-col md:flex-row gap-8 mb-10">
        <div className="text-center md:text-left">
          <p className="text-5xl font-bold">{avg.toFixed(1)}</p>
          <Stars n={5} />
          <p className="text-sm text-slate-400 mt-1">{YORUM_REVIEWS.length} degerlendirme</p>
        </div>
        <div className="flex-1 space-y-2 max-w-md">
          {dist.map((d) => (
            <div key={d.stars} className="flex items-center gap-3 text-sm">
              <span className="w-14 shrink-0">{d.stars} yildiz</span>
              <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-amber-400"
                  style={{ width: `${(d.count / YORUM_REVIEWS.length) * 100}%` }}
                />
              </div>
              <span className="w-6 text-right">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      <RoleTabs role={role} setRole={setRole} />
      <StarTabs starFilter={starFilter} setStarFilter={setStarFilter} />

      <div className="mx-auto max-w-5xl px-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3 pb-12">
        {filtered.map((r) => (
          <article
            key={`${r.name}-${r.date}`}
            className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-5"
          >
            <header className="flex justify-between gap-2 mb-3">
              <div className="flex gap-3 min-w-0">
                <Avatar name={r.name} />
                <div className="min-w-0">
                  <strong className="block text-sm truncate">{r.name}</strong>
                  <span className="text-xs text-slate-400">
                    {roleLabel(r.role)} · {r.company}
                  </span>
                  <time className="text-xs text-slate-500 block">
                    {r.city} · {r.date}
                  </time>
                </div>
              </div>
              <Stars n={r.stars} />
            </header>
            <p className="text-sm text-slate-300 leading-relaxed">{r.text}</p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

function RoleTabs({
  role,
  setRole,
}: {
  role: "all" | YorumRole;
  setRole: (v: "all" | YorumRole) => void;
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 flex flex-wrap gap-2 mb-4">
      {(
        [
          ["all", "Tumu"],
          ["yatirimci", "Yatirimci"],
          ["emlakci", "Emlakci"],
          ["muteahhit", "Muteahhit"],
        ] as const
      ).map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => setRole(key)}
          className={
            role === key
              ? "px-4 py-2 min-h-[44px] rounded-full bg-blue-600 text-white text-sm"
              : "px-4 py-2 min-h-[44px] rounded-full border border-slate-600 text-slate-300 text-sm"
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function StarTabs({
  starFilter,
  setStarFilter,
}: {
  starFilter: "all" | number;
  setStarFilter: (v: "all" | number) => void;
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 flex flex-wrap gap-2 mb-8">
      <button
        type="button"
        onClick={() => setStarFilter("all")}
        className={
          starFilter === "all"
            ? "px-3 py-2 min-h-[44px] rounded-lg bg-slate-700 text-white text-xs"
            : "px-3 py-2 min-h-[44px] rounded-lg border border-slate-600 text-slate-400 text-xs"
        }
      >
        Tum yildizlar
      </button>
      {[5, 4, 3, 2, 1].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => setStarFilter(s)}
          className={
            starFilter === s
              ? "px-3 py-2 min-h-[44px] rounded-lg bg-amber-600/80 text-white text-xs"
              : "px-3 py-2 min-h-[44px] rounded-lg border border-slate-600 text-slate-400 text-xs"
          }
        >
          {s} yildiz
        </button>
      ))}
    </div>
  );
}
