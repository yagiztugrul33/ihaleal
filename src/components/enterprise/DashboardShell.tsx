import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  back?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  maxWidth?: "md" | "lg" | "xl" | "full";
};

const maxW = { md: "max-w-4xl", lg: "max-w-6xl", xl: "max-w-7xl", full: "max-w-[1600px]" };

export function DashboardShell({ title, subtitle, badge, back, actions, children, className, maxWidth = "xl" }: DashboardShellProps) {
  return (
    <div className={cn("min-h-screen pt-24 pb-16 px-4 sm:px-6", className)} data-demo="true">
      <div className={cn("mx-auto space-y-8", maxW[maxWidth])}>
        <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            {back}
            {badge ? <p className="badge-corp w-fit">{badge}</p> : null}
            <h1 className="section-heading text-2xl sm:text-3xl">{title}</h1>
            {subtitle ? <p className="section-subtitle">{subtitle}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </header>
        {children}
      </div>
    </div>
  );
}