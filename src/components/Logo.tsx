import { cn } from "@/lib/utils";

const logoSizes = {
  sm: { full: "h-8", icon: "h-8 w-8" },
  md: { full: "h-10", icon: "h-10 w-10" },
  lg: { full: "h-12", icon: "h-12 w-12" },
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
      className={cn("w-auto select-none", sizeClass)}
      data-testid="logo-image"
      loading="eager"
      decoding="async"
    />
  );
}
