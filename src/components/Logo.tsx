import { Gavel } from "lucide-react";
import { cn } from "@/lib/utils";

const badgeSizes = { sm: "h-7 w-7", md: "h-9 w-9", lg: "h-11 w-11" } as const;
const iconSizes = { sm: "h-3.5 w-3.5", md: "h-5 w-5", lg: "h-6 w-6" } as const;
const wordSizes = { sm: "text-lg", md: "text-[22px]", lg: "text-3xl" } as const;
const gaps = { sm: "gap-2", md: "gap-2.5", lg: "gap-3" } as const;

export function Logo({
  size = "md",
  variant = "full",
  textClassName,
  dotComClassName,
}: {
  size?: "sm" | "md" | "lg";
  variant?: "full" | "icon";
  textClassName?: string;
  dotComClassName?: string;
}) {
  return (
    <div
      className={cn("inline-flex items-center", gaps[size])}
      aria-label="ihaleal.com"
      data-testid="logo-root"
    >
      <span
        className={cn("inline-flex shrink-0 items-center justify-center rounded-[10px] shadow-lg shadow-blue-500/25", badgeSizes[size])}
        style={{ background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)" }}
        aria-hidden="true"
        data-testid="logo-badge"
      >
        <Gavel className={cn("text-white", iconSizes[size])} strokeWidth={2.2} />
      </span>
      {variant === "full" ? (
        <span className={cn("inline-flex items-baseline font-extrabold tracking-tight", wordSizes[size])}>
          <span className={textClassName ?? "text-[#0A1F44] dark:text-white"} data-testid="logo-wordmark">
            ihaleal
          </span>
          <span className={dotComClassName ?? "font-bold text-[#60a5fa]"} data-testid="logo-dot-com">
            .com
          </span>
        </span>
      ) : null}
    </div>
  );
}
