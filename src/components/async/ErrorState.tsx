import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
  action?: ReactNode;
  className?: string;
};

export function ErrorState({
  title = "Veri alınamadı",
  message,
  onRetry,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-12 text-center",
        className,
      )}
      role="alert"
    >
      <AlertCircle className="mb-3 h-9 w-9 text-red-400" aria-hidden />
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">{message}</p>
      {onRetry ? (
        <Button type="button" variant="outline" size="sm" className="mt-6 border-white/15" onClick={onRetry}>
          Tekrar dene
        </Button>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
