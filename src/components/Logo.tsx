import { cn } from "@/lib/utils";

const LOGO_SRC = "/ihaleal-logo.png";

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
  const heights = { sm: 32, md: 40, lg: 52 };
  const textSizes = { sm: "text-lg", md: "text-xl", lg: "text-3xl" };

  return (
    <div className="flex items-center gap-2.5">
      <img
        src={LOGO_SRC}
        alt="ihaleal.com"
        width={Math.round(heights[size] * (651 / 583))}
        height={heights[size]}
        className="w-auto object-contain object-left shrink-0"
        style={{ height: heights[size], width: "auto" }}
        decoding="async"
        fetchPriority="high"
      />
      {variant === "full" ? (
        <span
          className={cn(
            `font-bold tracking-tight ${textSizes[size]}`,
            textClassName ?? "text-[#0A1F44] dark:text-white"
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
