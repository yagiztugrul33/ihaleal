import { Bot, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const box = { sm: "h-9 w-9", md: "h-11 w-11", lg: "h-14 w-14" };
const botIcon = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" };

/** Sohbet FAB / başlık için yapay zeka görseli (K harfi yerine). */
export function AiAssistantAvatar({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-400",
        "shadow-lg shadow-cyan-500/35 ring-2 ring-white/25",
        "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-tr before:from-white/25 before:to-transparent before:opacity-40",
        "ai-avatar-glow motion-reduce:before:opacity-20",
        box[size],
        className
      )}
      aria-hidden
    >
      <Bot className={cn("relative z-[1] text-white drop-shadow-md", botIcon[size])} />
      <span className="absolute -end-0.5 -top-0.5 z-[2] flex h-[42%] min-h-[14px] w-[42%] min-w-[14px] items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 shadow-md ring-2 ring-[#0a1428]">
        <Sparkles className="h-[55%] w-[55%] text-amber-950" strokeWidth={2.5} />
      </span>
    </div>
  );
}
