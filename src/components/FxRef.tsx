import { useCurrency } from "@/contexts/CurrencyContext";
import { cn } from "@/lib/utils";

/**
 * `<FxRef amountTry={n} />` — Çoklu kur REFERANS göstergesi.
 *
 * ₺ tutarın yanına "(≈ $X)" göstergesini ekler — kullanıcı TRY harici kur
 * seçtiğinde görünür, TRY'de hiç render olmaz (null).
 *
 * KURAL — ÖNEMLİ AYRIM:
 *   • ₺ TUTAR (fiyat, değer, tutar) → `<FxRef>` KULLAN
 *   • ENDEKS PUANI (kur-bağımsız sayı/skor) → KULLANMA
 *
 * Sayı her zaman LTR (BiDi-uyumlu). Logical CSS (ms-1) — RTL-hazır.
 * Borsa terminali DARK zemininde okunur: amber soluk ton.
 *
 * Tahsilat/değerleme ₺ — bu referans sadece bilgi amaçlı. Doktrin:
 *   "≈" işareti sahip → gösterim yaklaşık olduğunu bildirir.
 */

export interface FxRefProps {
  /** ₺ tutar (negatif olabilir — kâr/zarar gibi). 0 ise hiç render olmaz. */
  amountTry: number;
  /** "compact": parantezsiz "≈ $X" gösterim (dar yerler için) */
  variant?: "default" | "compact" | "block";
  /** Ek class — text rengi/boyut override */
  className?: string;
  /** Tooltip için ek bilgi (örn "tahsilat ₺", "değerleme ₺") */
  note?: string;
}

export function FxRef({ amountTry, variant = "default", className, note }: FxRefProps) {
  const { currency, formatFromTry } = useCurrency();
  if (currency === "TRY") return null;
  if (!Number.isFinite(amountTry) || amountTry === 0) return null;

  const isNeg = amountTry < 0;
  const abs = Math.abs(amountTry);
  const fmt = formatFromTry(abs);
  const sign = isNeg ? "-" : "";

  if (variant === "compact") {
    return (
      <span
        className={cn("text-[10px] text-amber-300/70 ms-1 whitespace-nowrap", className)}
        title={note ? `≈ ${sign}${fmt} ${currency} · ${note}` : `≈ ${sign}${fmt} ${currency}`}
        dir="ltr"
      >
        ≈ {sign}{fmt}
      </span>
    );
  }

  if (variant === "block") {
    return (
      <p
        className={cn("text-[10px] text-amber-300/80 mt-0.5", className)}
        dir="ltr"
      >
        ≈ {sign}{fmt}
        {note && <span className="text-slate-500 ms-1">({note})</span>}
      </p>
    );
  }

  return (
    <span
      className={cn("text-[10px] text-amber-300/80 ms-1.5 whitespace-nowrap", className)}
      dir="ltr"
    >
      (≈ {sign}{fmt})
    </span>
  );
}
