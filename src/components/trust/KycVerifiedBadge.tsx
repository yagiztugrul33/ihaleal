import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  verified?: boolean;
  className?: string;
  compact?: boolean;
};

export function KycVerifiedBadge({ verified, className, compact }: Props) {
  if (!verified) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-[var(--cizgi)]",
        compact ? "px-2 py-0.5 text-[10px] font-normal" : "px-2.5 py-1 text-xs font-normal",
        className,
      )}
      style={{ color: "var(--metrik-yesil)" }}
      title="Kimlik doğrulaması tamamlandı"
    >
      <BadgeCheck className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
      Doğrulanmış satıcı
    </span>
  );
}
