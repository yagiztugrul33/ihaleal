import { cn } from "@/lib/utils";

/**
 * Marka kimliği — tek kaynak (single source of truth).
 *
 * Emblem: shield + house + gavel (gold) — /public/ihaleal_com_logo.png (transparent).
 * Wordmark: "ihaleal" italic gold gradient (CSS — retina-keskin, scalable, ek asset yok).
 * Lockup: emblem + wordmark + (opsiyonel) slogan.
 *
 * Tüm marka görünümleri BrandLockup üzerinden geçer; tasarım değişikliği
 * buradan tek noktadan uygulanır.
 */
export const BRAND_LOGO_SRC = "/ihaleal_com_logo.png";
export const BRAND_WORDMARK = "ihaleal";
export const BRAND_SLOGAN = "Türkiye'nin Gayrimenkul Borsası";

// Emblem boyutları (sadece resim — wordmark hariç).
// N43.0'da %20-27 büyütüldü; Master onaylı.
const logoSizes = {
  sm: "h-12 w-12 min-h-12 min-w-12",
  md: "h-14 w-14 min-h-14 min-w-14",
  lg: "h-16 w-16 min-h-16 min-w-16 sm:h-[4.5rem] sm:w-[4.5rem] sm:min-h-[4.5rem] sm:min-w-[4.5rem]",
} as const;

// Wordmark tipografisi — emblem boyutuyla optik denge.
const wordmarkSizes = {
  sm: "text-[1.6rem] leading-[1] sm:text-[1.8rem]",
  md: "text-[1.9rem] leading-[1] sm:text-[2.15rem]",
  lg: "text-[2.4rem] leading-[1] sm:text-[2.8rem]",
} as const;

// Slogan tipografisi (wordmark altında küçük caps).
const sloganSizes = {
  sm: "text-[9px] tracking-[0.14em] sm:text-[10px] sm:tracking-[0.16em]",
  md: "text-[10px] tracking-[0.14em] sm:text-[11px] sm:tracking-[0.16em]",
  lg: "text-[11px] tracking-[0.16em] sm:text-[12px] sm:tracking-[0.18em]",
} as const;

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
  /** @deprecated wordmark artık Lockup içinde tipografik (CSS). */
  textClassName?: string;
  dotComClassName?: string;
}) {
  const sizeClass = logoSizes[size];
  const dim = size === "lg" ? 72 : size === "md" ? 56 : 48;
  return (
    <img
      src={BRAND_LOGO_SRC}
      alt="ihaleal.com — Türkiye'nin Gayrimenkul Borsası amblemi"
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

/**
 * Gold wordmark — italic + bold + amber-200→400→600 gradient.
 * SVG yerine CSS bg-clip-text kullanıldı: yazı varyantı/aksanı tipografide
 * kontrol edilebilir, retina'da keskin, scaling problemsiz.
 */
function Wordmark({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "select-none font-extrabold italic tracking-tight",
        "bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600",
        "bg-clip-text text-transparent",
        "drop-shadow-[0_2px_8px_rgba(217,119,6,0.18)]",
        // Inter italic yerine sistem sans-serif italic — emblem ile estetik
        // uyum için modern sans (Inter italic).
        "font-[Inter,system-ui,sans-serif]",
        wordmarkSizes[size],
        className,
      )}
    >
      {BRAND_WORDMARK}
    </span>
  );
}

export function BrandLockup({
  logoSize = "md",
  layout = "inline",
  className,
  showSlogan = true,
  showWordmark = true,
  sloganClassName,
  hideSloganOnMobile = false,
  tone = "default",
}: {
  logoSize?: "sm" | "md" | "lg";
  layout?: "inline" | "stack";
  className?: string;
  showSlogan?: boolean;
  /** Yalnızca emblem isteyen yerler (ör. favicon yedek görseli) için kapatılabilir. */
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

  // Wordmark + slogan dikey blok — emblem'in sağında (inline) ya da
  // altında (stack).
  const textBlock = showWordmark ? (
    <span
      className={cn(
        "inline-flex flex-col leading-none",
        layout === "stack" ? "items-center text-center gap-1" : "items-start gap-0.5",
      )}
    >
      <Wordmark size={logoSize} />
      {slogan ? <span className="-mt-0.5">{slogan}</span> : null}
    </span>
  ) : (
    slogan
  );

  // Wordmark yoksa eski tekli slogan davranışı korunsun.
  const containerSpacing =
    layout === "inline" ? "items-center gap-3 sm:gap-3.5" : "flex-col items-center gap-2 sm:gap-2.5";

  return (
    <span
      className={cn("inline-flex", containerSpacing, className)}
      data-brand-lockup={layout}
    >
      <Logo size={logoSize} />
      {textBlock}
      <span className="sr-only">ihaleal.com — {BRAND_SLOGAN}</span>
    </span>
  );
}
