import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ChartPanelProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  tall?: boolean;
};

export function ChartPanel({ title, subtitle, action, children, className, tall }: ChartPanelProps) {
  return (
    <div className={cn("card-luxury flex flex-col p-5 sm:p-6", className)}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white sm:text-lg">{title}</h3>
          {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      <div className={cn("w-full", tall ? "h-72" : "h-64")}>{children}</div>
    </div>
  );
}