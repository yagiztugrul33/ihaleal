import { cn } from "@/lib/utils";

const logoSizes = {
  sm: { full: "h-9", icon: "h-9 w-9" },
  md: { full: "h-10", icon: "h-10 w-10" },
  lg: { full: "h-[44px]", icon: "h-[44px] w-[44px]" },
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
      src="/ihaleal_com_logo.png"
      alt="ihaleal.com"
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
  wordmarkClassName,
  hideWordmarkOnMobile = true,
}: {
  logoSize?: "sm" | "md" | "lg";
  wordmarkClassName?: string;
  hideWordmarkOnMobile?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2.5 align-middle">
      <Logo size={logoSize} />
      <span
        className={cn(
          "font-black tracking-[0.08em] text-[#E9C56A] drop-shadow-[0_1px_8px_rgba(233,197,106,0.25)]",
          hideWordmarkOnMobile && "hidden sm:inline",
          wordmarkClassName,
        )}
      >
        ihaleal
      </span>
    </span>
  );
}
