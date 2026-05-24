import { cn } from "@/lib/utils";

const logoSizes = {
  sm: { full: "h-[44px]", icon: "h-[44px] w-[44px]" },
  md: { full: "h-[44px] sm:h-[54px]", icon: "h-[44px] w-[44px] sm:h-[54px] sm:w-[54px]" },
  lg: { full: "h-[52px] sm:h-[60px]", icon: "h-[52px] w-[52px] sm:h-[60px] sm:w-[60px]" },
} as const;

export function Logo({
  size = "md",
  variant = "full",
  className,
}: {
  size?: "sm" | "md" | "lg";
  variant?: "full" | "icon";
  className?: string;
}) {
  const sizeClass = variant === "icon" ? logoSizes[size].icon : logoSizes[size].full;
  return (
    <img
      src="/ihaleal-logo.png"
      alt="ihaleal"
      className={cn(
        "w-auto max-w-none select-none object-contain drop-shadow-[0_2px_12px_rgba(2,6,23,0.65)]",
        sizeClass,
        className,
      )}
      data-testid="logo-image"
      loading="eager"
      decoding="async"
      draggable={false}
    />
  );
}

export function BrandLockup({
  logoSize = "lg",
  className,
  showSlogan = false,
  sloganClassName,
  hideSloganOnMobile = false,
}: {
  logoSize?: "sm" | "md" | "lg";
  className?: string;
  showSlogan?: boolean;
  sloganClassName?: string;
  hideSloganOnMobile?: boolean;
}) {
  return (
    <span className={cn("inline-flex flex-col items-center gap-1 align-middle", className)}>
      <Logo size={logoSize} />
      {showSlogan ? (
        <span
          className={cn(
            "max-w-[16rem] text-center text-[10px] font-medium uppercase tracking-[0.08em] text-amber-200/90",
            hideSloganOnMobile && "hidden sm:inline",
            sloganClassName,
          )}
        >
          TÜRKİYE'NİN GAYRİMENKUL BORSASI
        </span>
      ) : null}
    </span>
  );
}
