import { GitCompare, Heart, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  listingId: string;
  title: string;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  compareActive?: boolean;
  onToggleCompare?: (id: string) => void;
  className?: string;
};

function listingShareUrl(listingId: string): string {
  const path = `/ilan/${listingId}`;
  if (typeof window === "undefined") return path;
  return `${window.location.origin}/#${path}`;
}

export function ListingQuickActions({
  listingId,
  title,
  isFavorite,
  onToggleFavorite,
  compareActive,
  onToggleCompare,
  className,
}: Props) {
  const shareUrl = listingShareUrl(listingId);
  const wa = `https://wa.me/?text=${encodeURIComponent(`${title} — ${shareUrl}`)}`;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <button
        type="button"
        aria-label={isFavorite ? "Favoriden çıkar" : "Favoriye ekle"}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(listingId);
        }}
        className={cn(
          "rounded-[10px] p-2 backdrop-blur-md transition-colors",
          isFavorite ? "bg-[var(--zemin-yumusak)] text-white" : "bg-black/50 text-white hover:bg-black/70",
        )}
      >
        <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
      </button>
      {onToggleCompare ? (
        <button
          type="button"
          aria-label="Karşılaştırmaya ekle"
          onClick={(e) => {
            e.stopPropagation();
            onToggleCompare(listingId);
          }}
          className={cn(
            "rounded-[10px] p-2 backdrop-blur-md transition-colors",
            compareActive ? "bg-[var(--zemin-yumusak)] text-white" : "bg-black/50 text-white hover:bg-black/70",
          )}
        >
          <GitCompare className="w-4 h-4" />
        </button>
      ) : null}
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp ile paylaş"
        onClick={(e) => e.stopPropagation()}
        className="rounded-[10px] p-2 backdrop-blur-md bg-black/50 text-white hover:bg-black/70 transition-colors"
      >
        <span className="text-[10px] font-normal">WA</span>
      </a>
      <button
        type="button"
        aria-label="Linki kopyala"
        onClick={(e) => {
          e.stopPropagation();
          void navigator.clipboard?.writeText(shareUrl);
        }}
        className="rounded-[10px] p-2 backdrop-blur-md bg-black/50 text-white hover:bg-black/70 transition-colors"
      >
        <Link2 className="w-4 h-4" />
      </button>
    </div>
  );
}
