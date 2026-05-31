import { cn } from "@/lib/utils";

/**
 * Marka kimliği — tek kaynak (single source of truth).
 *
 * Lockup PNG (emblem + italic gold "ihaleal" wordmark birleşik, navy bg):
 *   /public/ihaleal-logo-lockup.png  — Master onaylı kaliteli versiyon.
 *
 * Emblem-only PNG (gold shield+house+gavel, transparent):
 *   /public/ihaleal_com_logo.png  — favicon / icon-only kullanımlar için
 *   tutuluyor; ana lockup yerlerinde DEĞİL.
 *
 * BrandLockup tüm yerleştirme noktalarında tek bir <img> render eder
 * (Navbar, Footer, BorsaLayout, AuthBrandHeader, PreLaunch, NotFound,
 * ErrorPage). Tasarım değişikliği buradan tek noktadan uygulanır.
 */
export const BRAND_LOGO_SRC = "/ihaleal_com_logo.png";
export const BRAND_LOGO_LOCKUP_SRC = "/ihaleal-logo-lockup.png";
export const BRAND_WORDMARK = "ihaleal";
export const BRAND_SLOGAN = "Türkiye'nin Gayrimenkul Borsası";

// Lockup PNG doğal oranı ~2.6:1 (378×146). Yükseklik sabit, genişlik
// w-auto + object-contain ile orantılı kayar.
// sm: mobilde h-14 (56px ~146px wide) — Master "büyük+net" geri bildirimi
//     karşılansın; sm: breakpoint sonrasi h-12 (48px) navbar kompakt kalır.
const lockupSizes = {
  sm: "h-14 w-auto sm:h-12",
  md: "h-14 w-auto sm:h-16",
  lg: "h-20 w-auto sm:h-24",
} as const;

// Emblem-only fallback (favicon / icon-only legacy yerler için).
const logoSizes = {
  sm: "h-12 w-12 min-h-12 min-w-12",
  md: "h-14 w-14 min-h-14 min-w-14",
  lg: "h-16 w-16 min-h-16 min-w-16 sm:h-[4.5rem] sm:w-[4.5rem] sm:min-h-[4.5rem] sm:min-w-[4.5rem]",
} as const;

// Slogan tipografisi (lockup altında küçük caps).
const sloganSizes = {
  sm: "text-[10px] tracking-[0.14em] sm:text-[11px] sm:tracking-[0.16em]",
  md: "text-[11px] tracking-[0.14em] sm:text-[12px] sm:tracking-[0.16em]",
  lg: "text-[12px] tracking-[0.16em] sm:text-[13px] sm:tracking-[0.18em]",
} as const;

/**
 * Geriye dönük emblem-only Logo (favicon, küçük icon kullanımları).
 * Yeni marka yerleştirmeleri BrandLockup üzerinden lockup PNG'sini
 * kullanmalı.
 */
export function Logo({
  size = "md",
  variant: _variant = "full",
  className,
  textClassName: _textClassName,
  dotComClassName: _dotComClassName,
}: {
  size?: "sm" | "md" | "lg";
  /** @deprecated tek tip emblem; geriye dönük props kabul ediyor. */
  variant?: "full" | "icon";
  className?: string;
  /** @deprecated wordmark artık lockup PNG'sinde. */
  textClassName?: string;
  dotComClassName?: string;
}) {
  const sizeClass = logoSizes[size];
  const dim = size === "lg" ? 72 : size === "md" ? 56 : 48;
  return (
    <img
      src={BRAND_LOGO_SRC}
      alt="ihaleal.com amblemi"
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
      width={dim}
      height={dim}
    />
  );
}

export function BrandLockup({
  logoSize = "md",
  layout = "inline",
  className,
  showSlogan = true,
  showWordmark: _showWordmark = true,
  sloganClassName,
  hideSloganOnMobile = false,
  tone = "default",
}: {
  logoSize?: "sm" | "md" | "lg";
  layout?: "inline" | "stack";
  className?: string;
  showSlogan?: boolean;
  /** @deprecated wordmark artık lockup PNG'sinde — prop yutuluyor. */
  showWordmark?: boolean;
  sloganClassName?: string;
  hideSloganOnMobile?: boolean;
  /** Auth kartları için biraz daha geniş slogan tipografisi. */
  tone?: "default" | "auth";
}) {
  const slogan = showSlogan ? (
    <span
      className={cn(
        "font-semibold uppercase leading-snug text-amber-200/85",
        sloganSizes[logoSize],
        tone === "auth" && "text-amber-100/90",
        hideSloganOnMobile && "hidden sm:inline",
        sloganClassName,
      )}
    >
      {BRAND_SLOGAN.toLocaleUpperCase("tr-TR")}
    </span>
  ) : null;

  // Lockup PNG — birleşik emblem + wordmark (navy bg). drop-shadow ile
  // çerçeve çevreleyen koyu temaya yumuşak entegrasyon.
  const lockupImg = (
    <img
      src={BRAND_LOGO_LOCKUP_SRC}
      alt="ihaleal.com — Türkiye'nin Gayrimenkul Borsası"
      className={cn(
        "shrink-0 select-none object-contain",
        "drop-shadow-[0_4px_18px_rgba(251,191,36,0.18)]",
        lockupSizes[logoSize],
      )}
      data-testid="logo-image"
      data-brand-lockup-img
      loading="eager"
      decoding="async"
      draggable={false}
    />
  );

  // Inline: lockup yanında slogan (küçük caps). Stack: lockup üst, slogan alt.
  const containerSpacing =
    layout === "inline"
      ? "items-center gap-3 sm:gap-3.5"
      : "flex-col items-center gap-2 sm:gap-2.5";

  return (
    <span
      className={cn("inline-flex", containerSpacing, className)}
      data-brand-lockup={layout}
    >
      {lockupImg}
      {slogan}
      <span className="sr-only">ihaleal.com — {BRAND_SLOGAN}</span>
    </span>
  );
}
