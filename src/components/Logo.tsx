import { cn } from "@/lib/utils";

const logoSizes = {
  sm: { full: "h-8", icon: "h-8 w-8" },
  md: { full: "h-10", icon: "h-10 w-10" },
  lg: { full: "h-11", icon: "h-11 w-11" },
} as const;

export function Logo({
  size = "md",
  variant = "full",
}: {
  size?: "sm" | "md" | "lg";
  variant?: "full" | "icon";
}) {
  const sizeClass = variant === "icon" ? logoSizes[size].icon : logoSizes[size].full;
  return (
    <img
      src="/ihaleal_com_logo.png"
      alt="ihaleal.com"
      className={cn("w-auto select-none drop-shadow-[0_2px_10px_rgba(2,6,23,0.55)]", sizeClass)}
      data-testid="logo-image"
      loading="eager"
      decoding="async"
    />
  );
}
