import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type CurrencyCode = "TRY" | "USD" | "EUR" | "GBP";

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (next: CurrencyCode) => void;
  convertFromTry: (amountTry: number) => number;
  formatFromTry: (amountTry: number) => string;
  usdRate: number;
};

const CURRENCY_STORAGE_KEY = "ihaleal_currency";
const SYMBOLS: Record<CurrencyCode, string> = {
  TRY: "₺",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

const TRY_PER_UNIT: Record<CurrencyCode, number> = {
  TRY: 1,
  USD: 38.2,
  EUR: 41.4,
  GBP: 48.5,
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function readInitialCurrency(): CurrencyCode {
  try {
    const raw = localStorage.getItem(CURRENCY_STORAGE_KEY);
    return raw === "USD" || raw === "EUR" || raw === "GBP" ? raw : "TRY";
  } catch {
    return "TRY";
  }
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => readInitialCurrency());

  const setCurrency = (next: CurrencyCode) => {
    setCurrencyState(next);
    localStorage.setItem(CURRENCY_STORAGE_KEY, next);
  };

  const value = useMemo<CurrencyContextValue>(() => {
    const convertFromTry = (amountTry: number): number => {
      if (!Number.isFinite(amountTry)) return 0;
      const divisor = TRY_PER_UNIT[currency];
      return divisor <= 0 ? amountTry : amountTry / divisor;
    };
    const formatFromTry = (amountTry: number): string => {
      const value = convertFromTry(amountTry);
      const digits = currency === "TRY" ? 0 : 2;
      return `${SYMBOLS[currency]}${value.toLocaleString("tr-TR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: digits,
      })}`;
    };
    return {
      currency,
      setCurrency,
      convertFromTry,
      formatFromTry,
      usdRate: TRY_PER_UNIT.USD,
    };
  }, [currency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return ctx;
}
