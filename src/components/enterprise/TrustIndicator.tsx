import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type TrustIndicatorProps = {
  icon: LucideIcon;
  label: string;
  value?: string;
  variant?: "default" | "success" | "info";
};

const variants = {
  default: "border-white/10 bg-white/[0.04] text-slate-300",
  success: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  info: "border-blue-500/25 bg-blue-500/10 text-blue-300",
};

export function TrustIndicator({ icon: Icon, label, value, variant = "default" }: TrustIndicatorProps) {
  return (
    <div className={cn("inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium", variants[variant])}>
      <Icon className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
      <span>{label}</span>
      {value ? <span className="font-bold text-white">{value}</span> : null}
    </div>
  );
}