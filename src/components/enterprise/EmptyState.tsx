import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("card-luxury flex flex-col items-center px-6 py-16 text-center", className)}>
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[20px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)]">
        <Icon className="h-7 w-7 text-[var(--metin-ikincil)]" aria-hidden />
      </div>
      <h3 className="text-xl font-normal text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">{description}</p>
      {action ? <div className="mt-8">{action}</div> : null}
    </div>
  );
}