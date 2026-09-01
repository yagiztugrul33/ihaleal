import { useOnlinePresence } from "@/hooks/useOnlinePresence";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  compact?: boolean;
};

export function OnlinePresenceBadge({ className, compact }: Props) {
  const { onlineCount, connected } = useOnlinePresence();

  if (onlineCount == null || onlineCount < 1) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] text-[var(--metin-ikincil)]",
        compact ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        className,
      )}
      title={connected ? "Canlı ziyaretçi sayısı (Supabase Presence)" : "Bağlantı kuruluyor…"}
      data-testid="online-presence-badge"
    >
      <span className="relative flex h-2 w-2" aria-hidden>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: "var(--metrik-yesil)" }} />
        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "var(--metrik-yesil)" }} />
      </span>
      {compact ? (
        <span>{onlineCount} çevrimiçi</span>
      ) : (
        <span>
          <span className="font-normal">{onlineCount}</span> kişi çevrimiçi
        </span>
      )}
    </span>
  );
}
