import { X } from "lucide-react";

type Chip = { key: string; label: string; onRemove: () => void };

type Props = {
  chips: Chip[];
  onClearAll?: () => void;
  className?: string;
};

export function SearchFilterChips({ chips, onClearAll, className }: Props) {
  if (chips.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ""}`}>
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.onRemove}
          className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-xs text-slate-200 hover:border-[var(--cizgi)] hover:text-[var(--metin-ikincil)]"
        >
          {chip.label}
          <X className="h-3 w-3" aria-hidden />
        </button>
      ))}
      {onClearAll ? (
        <button type="button" onClick={onClearAll} className="text-xs text-slate-500 hover:text-[var(--metin-ikincil)] underline-offset-2 hover:underline">
          Filtreleri temizle
        </button>
      ) : null}
    </div>
  );
}
