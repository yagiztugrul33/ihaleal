import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center px-4 py-16 text-center", className)}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[20px] border border-slate-700/50 bg-slate-900/50">
        <Icon className="h-7 w-7 text-slate-500" aria-hidden />
      </div>
      <h3 className="text-lg font-normal text-white">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
