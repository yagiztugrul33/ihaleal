import { Gavel } from "lucide-react";
import { cn } from "@/lib/utils";

const badgeSizes = { sm: "h-9 w-9", md: "h-10 w-10", lg: "h-12 w-12" } as const;
const iconSizes = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" } as const;
const textSizes = { sm: "text-lg", md: "text-xl", lg: "text-3xl" } as const;
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
    >
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30",
          badgeSizes[size],
        )}
        aria-hidden="true"
      >
        <Gavel className={cn("text-white", iconSizes[size])} strokeWidth={2.2} />
      </span>
      {variant === "full" ? (
        <span
          className={cn(
            `font-bold tracking-tight ${textSizes[size]}`,
            textClassName ?? "text-[#0A1F44] dark:text-white",
          )}
        >
          ihaleal
          <span className={dotComClassName ?? "text-blue-400"}>.com</span>
        </span>
      ) : null}
    </div>
  );
}
