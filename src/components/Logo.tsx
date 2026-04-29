import { Gavel } from "lucide-react";
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
  const sizes = { sm: 24, md: 32, lg: 48 };
  const textSizes = { sm: "text-lg", md: "text-xl", lg: "text-3xl" };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center bg-gradient-to-br from-[#0A1F44] to-amber-600 rounded-lg p-1.5 shadow-md">
        <Gavel size={sizes[size]} className="text-white" />
      </div>
      {variant === "full" ? (
        <span className={cn(`font-bold ${textSizes[size]}`, textClassName ?? "text-[#0A1F44] dark:text-white")}>
          ihaleal<span className="text-amber-500">.com</span>
        </span>
      ) : null}
    </div>
  );
}
