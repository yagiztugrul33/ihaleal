import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DirectionProvider } from "@radix-ui/react-direction";
import {
  LOCALE_DIRECTION,
  LOCALE_STORAGE_KEY,
  getMessagesFor,
  type Locale,
  type Messages,
} from "@/i18n/messages";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Messages;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function detectBrowserLocale(): Locale {
  // navigator.language örn. "tr-TR", "tr", "ar-SA" — prefix'e göre 4 dil eşle.
  try {
    const nav = (typeof navigator !== "undefined" ? navigator.language : "") || "";
    const lower = nav.toLowerCase();
    if (lower.startsWith("tr")) return "tr";
    if (lower.startsWith("ru")) return "ru";
    if (lower.startsWith("ar")) return "ar";
  } catch {
    /* sessiz */
  }
  return "en";
}

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return "tr"; // SSR/Türk pazar default TR
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === "tr" || stored === "en" || stored === "ru" || stored === "ar") return stored;
    // Saklı tercih yoksa: navigator.language'ten türet (TR/RU/AR ise o, aksi EN)
    return detectBrowserLocale();
  } catch {
    return detectBrowserLocale();
  }
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readStoredLocale());

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    // <html lang="..."> + dir (AR = rtl, diğerleri = ltr)
    document.documentElement.lang = locale;
    document.documentElement.dir = LOCALE_DIRECTION[locale];
  }, [locale]);

  useEffect(() => {
    // Arapça web fontu TALEP UZERINE yuklenir. Onceden index.html <head>'inde
    // sabit <link rel="stylesheet"> idi ve her ziyaretcide render'i blokluyordu
    // (Lighthouse render-blocking-insight: 171 ms), oysa TR/EN/RU'da hic
    // kullanilmiyor. src/index.css'teki [lang="ar"] kurali "Noto Sans Arabic"
    // ister; bu link yalnizca o durumda eklenir. Bir kez eklenir, kaldirilmaz —
    // dil ileri geri degistirilirse font yeniden indirilmesin.
    if (locale !== "ar") return;
    const ID = "noto-sans-arabic-font";
    if (document.getElementById(ID)) return;
    const link = document.createElement("link");
    link.id = ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: getMessagesFor(locale),
    }),
    [locale, setLocale],
  );

  // Radix floating primitive'leri (Dropdown/Popover/Select/Tooltip/ContextMenu/
  // Menubar/NavigationMenu/HoverCard) yön bilgisini DirectionProvider'dan okur.
  // dir="ltr" radix'in varsayılanıdır → LTR davranışı birebir aynı kalır;
  // dir="rtl" (AR) ise side/align hesabını otomatik aynalar. Yalnızca sunum.
  return (
    <LocaleContext.Provider value={value}>
      <DirectionProvider dir={LOCALE_DIRECTION[locale]}>{children}</DirectionProvider>
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}
