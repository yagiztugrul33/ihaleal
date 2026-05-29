import { cn } from "@/lib/utils";

/** Onaylı altın amblem — ev + kalkan + tokmak (tek kaynak). */
export const BRAND_LOGO_SRC = "/ihaleal_com_logo.png";

export const BRAND_SLOGAN = "Türkiye'nin Gayrimenkul Borsası";

const logoSizes = {
  sm: "h-10 w-10 min-h-10 min-w-10",
  md: "h-11 w-11 min-h-11 min-w-11",
  lg: "h-14 w-14 min-h-14 min-w-14 sm:h-16 sm:w-16 sm:min-h-16 sm:min-w-16",
} as const;

export function Logo({
  size = "md",
  variant = "full",
  className,
  textClassName: _textClassName,
  dotComClassName: _dotComClassName,
}: {
  size?: "sm" | "md" | "lg";
  variant?: "full" | "icon";
  className?: string;
  /** @deprecated Altın PNG tek parça; geriye dönük Navbar props */
  textClassName?: string;
  dotComClassName?: string;
}) {
  const sizeClass = logoSizes[size];
  return (
    <img
      src={BRAND_LOGO_SRC}
      alt="ihaleal.com"
      className={cn(
        "shrink-0 select-none object-contain object-center",
        "drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]",
        sizeClass,
        className,
      )}
      data-testid="logo-image"
      loading="eager"
      decoding="async"
      draggable={false}
      width={size === "lg" ? 64 : size === "md" ? 44 : 40}
      height={size === "lg" ? 64 : size === "md" ? 44 : 40}
    />
  );
}

export function BrandLockup({
  logoSize = "md",
  layout = "inline",
  className,
  showSlogan = true,
  sloganClassName,
  hideSloganOnMobile = false,
  tone = "default",
}: {
  logoSize?: "sm" | "md" | "lg";
  layout?: "inline" | "stack";
  className?: string;
  showSlogan?: boolean;
  sloganClassName?: string;
  hideSloganOnMobile?: boolean;
  /** Auth kartları için biraz daha geniş slogan tipografisi */
  tone?: "default" | "auth";
}) {
  const slogan = showSlogan ? (
    <span
      className={cn(
        "font-semibold uppercase leading-snug text-amber-200/95",
        layout === "inline"
          ? "max-w-[8.75rem] text-[9px] tracking-[0.05em] sm:max-w-[12rem] sm:text-[10px] sm:tracking-[0.07em]"
          : tone === "auth"
            ? "max-w-[20rem] text-center text-[10px] tracking-[0.08em] sm:max-w-[22rem] sm:text-[11px] sm:tracking-[0.1em]"
            : "max-w-[18rem] text-center text-[10px] tracking-[0.1em] sm:text-[11px]",
        hideSloganOnMobile && "hidden sm:inline",
        sloganClassName,
      )}
    >
      {BRAND_SLOGAN.toLocaleUpperCase("tr-TR")}
    </span>
  ) : null;

  return (
    <span
      className={cn(
        layout === "inline"
          ? "inline-flex items-center gap-2 sm:gap-2.5"
          : "inline-flex flex-col items-center gap-1.5 sm:gap-2",
        className,
      )}
    >
      <Logo size={logoSize} />
      {slogan}
    </span>
  );
}
