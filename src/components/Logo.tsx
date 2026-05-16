import { Gavel, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  size = "md",
  variant = "full",
  textClassName,
}: {
  size?: "sm" | "md" | "lg";
  variant?: "full" | "icon";
  /** Navbar karanlık zeminde beyaz metin için `text-white` */
  textClassName?: string;
}) {
  const sizes = { sm: 22, md: 28, lg: 42 };
  const textSizes = { sm: "text-lg", md: "text-xl", lg: "text-3xl" };
  const aiBadge = { sm: "h-5 w-5", md: "h-6 w-6", lg: "h-8 w-8" };
  const aiIcon = { sm: "h-3 w-3", md: "h-3.5 w-3.5", lg: "h-4 w-4" };

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative">
        <div
          className={cn(
            "flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-indigo-600 p-2 shadow-xl shadow-blue-900/50 ring-2 ring-white/20",
            "logo-mark-shimmer motion-reduce:animate-none"
          )}
        >
          <Gavel size={sizes[size]} className="relative z-[1] text-white drop-shadow-md" />
        </div>
        <div
          className={cn(
            "absolute -bottom-1 -right-1 flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg ring-2 ring-white",
            aiBadge[size]
          )}
          aria-hidden
        >
          <BrainCircuit className={cn("text-white drop-shadow-sm", aiIcon[size])} strokeWidth={2.2} />
        </div>
      </div>
      {variant === "full" ? (
        <span
          className={cn(
            `font-bold tracking-tight ${textSizes[size]}`,
            textClassName ?? "text-[#0A1F44] dark:text-white"
          )}
        >
          ihaleal<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">.com</span>
        </span>
      ) : null}
    </div>
  );
}
