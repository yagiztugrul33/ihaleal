import { useMemo, useState } from "react";
import { TR_PROVINCES } from "@/lib/seo/programmaticSeo";

export type AutocompleteSuggestion = {
  label: string;
  value: string;
  kind: "province" | "district";
};

function buildIndex(): AutocompleteSuggestion[] {
  const items: AutocompleteSuggestion[] = [];
  for (const p of TR_PROVINCES) {
    items.push({ label: p.name, value: p.name, kind: "province" });
    for (const d of p.districts) {
      items.push({ label: `${d.name}, ${p.name}`, value: `${d.name} ${p.name}`, kind: "district" });
    }
  }
  return items;
}

const INDEX = buildIndex();

export function searchLocationSuggestions(query: string, limit = 8): AutocompleteSuggestion[] {
  const q = query.trim().toLocaleLowerCase("tr-TR");
  if (q.length < 2) return [];
  return INDEX.filter((s) => s.label.toLocaleLowerCase("tr-TR").includes(q)).slice(0, limit);
}

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSelect: (v: string) => void;
  placeholder?: string;
  className?: string;
};

export function SearchAutocomplete({ value, onChange, onSelect, placeholder, className }: Props) {
  const [open, setOpen] = useState(false);
  const suggestions = useMemo(() => searchLocationSuggestions(value), [value]);

  return (
    <div className={`relative ${className ?? ""}`}>
      <input
        type="search"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        className="w-full rounded-[10px] border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[var(--cizgi)] focus:outline-none"
        aria-label="Konum arama"
        autoComplete="off"
      />
      {open && suggestions.length > 0 ? (
        <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-[10px] border border-white/10 bg-slate-900">
          {suggestions.map((s) => (
            <li key={`${s.kind}-${s.label}`}>
              <button
                type="button"
                className="w-full px-3 py-2 text-start text-sm text-slate-200 hover:bg-white/5"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelect(s.value);
                  setOpen(false);
                }}
              >
                {s.label}
                <span className="ms-2 text-[10px] uppercase text-slate-500">{s.kind === "province" ? "İl" : "İlçe"}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
