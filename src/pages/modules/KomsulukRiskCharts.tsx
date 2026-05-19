import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { calculateEarthquakeScore } from "@/lib/scoring/earthquakeEngine";
import type { PropertyRecord } from "@/types/property";

const COLORS = ["#38bdf8", "#2dd4bf", "#a78bfa", "#fbbf24", "#f87171", "#94a3b8"];

export default function KomsulukRiskCharts({
  property,
  neighbors,
}: {
  property: PropertyRecord;
  neighbors: PropertyRecord[];
}) {
  const barData = useMemo(() => {
    const rows = [property, ...neighbors].slice(0, 8).map((p, i) => {
      const s = p.earthquakeScore ?? calculateEarthquakeScore(p);
      return {
        name: i === 0 ? "Siz" : p.id.replace("prop-", "#"),
        skor: Math.round(s.totalScore),
      };
    });
    return rows;
  }, [property, neighbors]);

  const pieData = useMemo(() => {
    const bands: Record<string, number> = {};
    for (const p of [property, ...neighbors]) {
      const b = (p.earthquakeScore ?? calculateEarthquakeScore(p)).band;
      bands[b] = (bands[b] ?? 0) + 1;
    }
    return Object.entries(bands).map(([name, value]) => ({ name, value }));
  }, [property, neighbors]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="mod-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} />
            <YAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
            <Bar dataKey="skor" fill="#38bdf8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mod-chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="70%" label>
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
