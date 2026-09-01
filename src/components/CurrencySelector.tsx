import { useState, useRef, useEffect } from "react";
import { ChevronDown, Coins } from "lucide-react";
import { useCurrency, type CurrencyCode } from "@/contexts/CurrencyContext";
import { cn } from "@/lib/utils";

/**
 * Navbar mini kur seçici — TRY/USD/EUR/GBP.
 *
 * Doktrin: KENDİSI tahsilat yapmaz; sadece GÖSTERİM kuru değiştirir.
 * Tahsilat her zaman ₺ (iyzico) — kullanıcı bunu "≈ X$/€" notlarıyla görür.
 *
 * RTL-hazır: text-start, ms-N / me-N, rtl:rotate-180 — fiziksel CSS yok.
 */

const OPTIONS: { code: CurrencyCode; label: string; symbol: string }[] = [
  { code: "TRY", label: "₺ Türk Lirası", symbol: "₺" },
  { code: "USD", label: "$ US Dollar", symbol: "$" },
  { code: "EUR", label: "€ Euro", symbol: "€" },
  { code: "GBP", label: "£ British Pound", symbol: "£" },
];

interface Props {
  /** Compact mod — sadece sembol */
  compact?: boolean;
}

export function CurrencySelector({ compact = false }: Props) {
  const { currency, setCurrency, ratesSource, ratesUpdatedAtIso } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const current = OPTIONS.find((o) => o.code === currency) ?? OPTIONS[0];

  return (
    <div ref={ref} className="relative" data-testid="currency-selector">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-[3px] border border-slate-700/60 bg-slate-900/40 px-2 py-1 text-xs font-normal text-slate-200 transition-colors hover:border-[var(--cizgi)] hover:text-white",
          open && "border-[var(--cizgi)] text-white",
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Para birimi seç"
      >
        <Coins className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{compact ? current.symbol : current.code}</span>
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          className="absolute end-0 top-full z-[110] mt-1 min-w-[200px] rounded-[10px] border border-slate-700 bg-slate-900/95 py-1 shadow-xl backdrop-blur"
          role="listbox"
        >
          {OPTIONS.map((opt) => (
            <button
              key={opt.code}
              type="button"
              role="option"
              aria-selected={opt.code === currency}
              onClick={() => {
                setCurrency(opt.code);
                setOpen(false);
              }}
              className={cn(
                "block w-full px-3 py-1.5 text-start text-xs transition-colors hover:bg-[var(--zemin-yumusak)]",
                opt.code === currency ? "text-[var(--metin-ikincil)] font-normal" : "text-slate-200",
              )}
            >
              {opt.label}
            </button>
          ))}
          <div className="mt-1 border-t border-slate-700 px-3 py-1.5 text-[10px] text-slate-500">
            Kur: {ratesSource === "tcmb_api" ? "TCMB" : "Yedek"} · {new Date(ratesUpdatedAtIso).toLocaleString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
            <br />
            <span className="text-[var(--metin-ikincil)]">Tahsilat ₺</span> — diğer kurlar referans.
          </div>
        </div>
      )}
    </div>
  );
}
