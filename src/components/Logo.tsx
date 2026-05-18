import { cn } from "@/lib/utils";

const HOUSE = "\u2302";

const iconSizes = { sm: "text-[18px]", md: "text-[22px]", lg: "text-[28px]" } as const;
const textSizes = { sm: "text-lg", md: "text-xl", lg: "text-3xl" } as const;
const gaps = { sm: "gap-1.5", md: "gap-2", lg: "gap-2.5" } as const;

export function Logo({
  size = "md",
  variant = "full",
  textClassName,
  dotComClassName,
}: {
  size?: "sm" | "md" | "lg";
  variant?: "full" | "icon";
  /** Navbar karanlık zeminde beyaz metin için `text-white` */
  textClassName?: string;
  /** `.com` rengi — referans nav: `text-blue-400` */
  dotComClassName?: string;
}) {
  return (
    <div
      className={cn("inline-flex items-center", gaps[size])}
      aria-label="ihaleal.com"
    >
      <span
        className={cn(
          "leading-none font-semibold text-blue-400 shrink-0",
          iconSizes[size],
        )}
        aria-hidden="true"
      >
        {HOUSE}
      </span>
      {variant === "full" ? (
        <span
          className={cn(
            `font-bold tracking-tight ${textSizes[size]}`,
            textClassName ?? "text-[#0A1F44] dark:text-white",
          )}
        >
          ihaleal
          <span
            className={
              dotComClassName ??
              "text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400"
            }
          >
            .com
          </span>
        </span>
      ) : null}
    </div>
  );
}

