import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  trend?: { value: string; positive?: boolean };
  className?: string;
};

export function MetricCard({ label, value, hint, icon: Icon, trend, className }: MetricCardProps) {
  return (
    <div className={cn("card-luxury p-5 transition-all duration-300 hover:border-[var(--cizgi)] group", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-normal uppercase tracking-wider text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-normal tracking-tight text-white sm:text-3xl">{value}</p>
          {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
          {trend ? (
            <p className={cn("mt-2 text-xs font-normal", trend.positive !== false ? "text-[var(--metin-ikincil)]" : "text-slate-400")}>
              {trend.value}
            </p>
          ) : null}
        </div>
        {Icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[20px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] text-[var(--metin-ikincil)]">
            <Icon className="h-5 w-5" aria-hidden />
          </div>
        ) : null}
      </div>
    </div>
  );
}