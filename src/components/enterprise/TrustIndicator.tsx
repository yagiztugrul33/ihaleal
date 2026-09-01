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
  success: "border-[var(--cizgi)] bg-[var(--zemin-yumusak)] text-[var(--metin-ikincil)]",
  info: "border-[var(--cizgi)] bg-[var(--zemin-yumusak)] text-[var(--metin-ikincil)]",
};

export function TrustIndicator({ icon: Icon, label, value, variant = "default" }: TrustIndicatorProps) {
  return (
    <div className={cn("inline-flex items-center gap-2 rounded-[10px] border px-3 py-2 text-xs font-normal", variants[variant])}>
      <Icon className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden />
      <span>{label}</span>
      {value ? <span className="font-normal text-white">{value}</span> : null}
    </div>
  );
}