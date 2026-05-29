import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CurrencyCode = "TRY" | "USD" | "EUR" | "GBP";
type RateSource = "tcmb_api" | "mock_fallback";

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (next: CurrencyCode) => void;
  convertFromTry: (amountTry: number) => number;
  formatFromTry: (amountTry: number) => string;
  usdRate: number;
  eurRate: number;
  gbpRate: number;
  goldGramTry: number;
  eurUsdParity: number;
  ratesUpdatedAtIso: string;
  ratesSource: RateSource;
  refreshRates: () => Promise<void>;
};

const CURRENCY_STORAGE_KEY = "ihaleal_currency";
const RATE_STORAGE_KEY = "ihaleal_rate_snapshot_v1";
const SYMBOLS: Record<CurrencyCode, string> = {
  TRY: "₺",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

const BASE_TRY_PER_UNIT: Record<CurrencyCode, number> = {
  TRY: 1,
  USD: 38.2,
  EUR: 41.4,
  GBP: 48.5,
};

type RateSnapshot = {
  tryPerUnit: Record<CurrencyCode, number>;
  goldGramTry: number;
  eurUsdParity: number;
  updatedAtIso: string;
  source: RateSource;
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

function buildMockSnapshot(previous?: RateSnapshot): RateSnapshot {
  const now = new Date();
  const minuteOfDay = now.getHours() * 60 + now.getMinutes();
  const wave = Math.sin((minuteOfDay / 1440) * Math.PI * 2);
  const base = previous?.tryPerUnit ?? BASE_TRY_PER_UNIT;
  const usd = Number((base.USD * (1 + wave * 0.0022)).toFixed(4));
  const eur = Number((base.EUR * (1 + wave * 0.0018)).toFixed(4));
  const gbp = Number((base.GBP * (1 + wave * 0.0021)).toFixed(4));
  const eurUsdParity = Number((eur / Math.max(usd, 0.0001)).toFixed(4));
  const goldGramTry = Number((usd * 1.9 + 1550).toFixed(2));
  return {
    tryPerUnit: {
      TRY: 1,
      USD: usd,
      EUR: eur,
      GBP: gbp,
    },
    goldGramTry,
    eurUsdParity,
    updatedAtIso: now.toISOString(),
    source: "mock_fallback",
  };
}

function readStoredSnapshot(): RateSnapshot | null {
  try {
    const raw = localStorage.getItem(RATE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<RateSnapshot>;
    if (!parsed.tryPerUnit || !parsed.updatedAtIso) return null;
    const hasAll =
      Number.isFinite(parsed.tryPerUnit.TRY) &&
      Number.isFinite(parsed.tryPerUnit.USD) &&
      Number.isFinite(parsed.tryPerUnit.EUR) &&
      Number.isFinite(parsed.tryPerUnit.GBP);
    if (!hasAll) return null;
    return {
      tryPerUnit: {
        TRY: parsed.tryPerUnit.TRY,
        USD: parsed.tryPerUnit.USD,
        EUR: parsed.tryPerUnit.EUR,
        GBP: parsed.tryPerUnit.GBP,
      },
      goldGramTry: Number.isFinite(parsed.goldGramTry) ? (parsed.goldGramTry as number) : 0,
      eurUsdParity:
        Number.isFinite(parsed.eurUsdParity) && (parsed.eurUsdParity ?? 0) > 0
          ? (parsed.eurUsdParity as number)
          : Number((parsed.tryPerUnit.EUR / Math.max(parsed.tryPerUnit.USD, 0.0001)).toFixed(4)),
      updatedAtIso: parsed.updatedAtIso,
      source: parsed.source === "tcmb_api" ? "tcmb_api" : "mock_fallback",
    };
  } catch {
    return null;
  }
}

async function fetchTcmbSnapshot(): Promise<RateSnapshot | null> {
  const proxyUrl = (import.meta.env.VITE_TCMB_PROXY_URL as string | undefined)?.trim();
  if (!proxyUrl) {
    return null;
  }
  try {
    const res = await fetch(proxyUrl, { cache: "no-store" });
    if (!res.ok) return null;
    const text = await res.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "text/xml");
    const readForexSelling = (code: "USD" | "EUR" | "GBP"): number | null => {
      const node = xml.querySelector(`Currency[CurrencyCode="${code}"] > ForexSelling`);
      const value = Number((node?.textContent ?? "").replace(",", "."));
      return Number.isFinite(value) && value > 0 ? value : null;
    };
    const usd = readForexSelling("USD");
    const eur = readForexSelling("EUR");
    const gbp = readForexSelling("GBP");
    if (!usd || !eur || !gbp) return null;
    const eurUsdParity = Number((eur / Math.max(usd, 0.0001)).toFixed(4));
    const goldGramTry = Number((usd * 1.9 + 1550).toFixed(2));
    return {
      tryPerUnit: {
        TRY: 1,
        USD: usd,
        EUR: eur,
        GBP: gbp,
      },
      goldGramTry,
      eurUsdParity,
      updatedAtIso: new Date().toISOString(),
      source: "tcmb_api",
    };
  } catch {
    return null;
  }
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => readInitialCurrency());
  const [snapshot, setSnapshot] = useState<RateSnapshot>(() => readStoredSnapshot() ?? buildMockSnapshot());

  const setCurrency = (next: CurrencyCode) => {
    setCurrencyState(next);
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, next);
    } catch {
      // ignore storage errors
    }
  };

  const refreshRates = useCallback(async () => {
    const tcmb = await fetchTcmbSnapshot();
    setSnapshot((prev) => {
      const next = tcmb ?? buildMockSnapshot(prev);
      try {
        localStorage.setItem(RATE_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  useEffect(() => {
    void refreshRates();
    const id = window.setInterval(() => {
      void refreshRates();
    }, 60 * 60 * 1000);
    return () => window.clearInterval(id);
  }, [refreshRates]);

  const value = useMemo<CurrencyContextValue>(() => {
    const convertFromTry = (amountTry: number): number => {
      if (!Number.isFinite(amountTry)) return 0;
      const divisor = snapshot.tryPerUnit[currency];
      return divisor <= 0 ? amountTry : amountTry / divisor;
    };
    const formatFromTry = (amountTry: number): string => {
      const converted = convertFromTry(amountTry);
      const digits = currency === "TRY" ? 0 : 2;
      return `${SYMBOLS[currency]}${converted.toLocaleString("tr-TR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: digits,
      })}`;
    };
    return {
      currency,
      setCurrency,
      convertFromTry,
      formatFromTry,
      usdRate: snapshot.tryPerUnit.USD,
      eurRate: snapshot.tryPerUnit.EUR,
      gbpRate: snapshot.tryPerUnit.GBP,
      goldGramTry: snapshot.goldGramTry,
      eurUsdParity: snapshot.eurUsdParity,
      ratesUpdatedAtIso: snapshot.updatedAtIso,
      ratesSource: snapshot.source,
      refreshRates,
    };
  }, [currency, refreshRates, snapshot]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return ctx;
}
