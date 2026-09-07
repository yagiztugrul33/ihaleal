import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown, Globe, Menu, Search, X } from "lucide-react";
import { BrandLockup } from "@/components/Logo";
import { SearchModal } from "@/components/SearchModal";
import { ROUTES } from "@/constants/routes";
import { useLocale } from "@/contexts/LocaleContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/messages";
import { OnlinePresenceBadge } from "@/components/presence/OnlinePresenceBadge";
import { CurrencySelector } from "@/components/CurrencySelector";

function NavDropdown({
  label,
  items,
  onNavigate,
  testId,
  triggerTestId,
  gesTestId,
}: {
  label: string;
  items: { to: string; label: string; testId?: string }[];
  onNavigate?: () => void;
  testId?: string;
  triggerTestId?: string;
  gesTestId?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} className="relative" data-testid={testId}>
      <button
        type="button"
        data-testid={triggerTestId}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex items-center gap-1 border-b-2 border-transparent pb-0.5 text-sm font-normal text-slate-200 transition-colors hover:text-white",
          open && "text-white",
        )}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {label}
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <div
          className="absolute start-0 top-full z-[110] mt-2 min-w-[200px] rounded-[20px] border border-slate-600/30 py-1"
          style={{ background: "var(--zemin-yumusak)", backdropFilter: "blur(20px)" }}
        >
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              data-testid={item.testId ?? (item.to === ROUTES.ARASTIRMA_GES ? gesTestId : undefined)}
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
              className="block px-4 py-2.5 text-sm text-slate-200 no-underline hover:bg-slate-800/60 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function Navbar() {
  const { locale, setLocale, t } = useLocale();
  const n = t.nav;
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  // İhale odağı (emlak + arsa): nav'da sadece çekirdek özellikler görünür.
  // GES/kat karşılığı/emlakçı-müteahhit B2B/ödüller/uluslararası vb. koddan
  // silinmedi — sadece nav'dan çıkarıldı, müşteri talebinde geri eklenir.
  const mm = t.megaMenu;
  const coreServiceItems = [
    { to: "/degerleme", label: mm.aiValuation },
    { to: "/dashboard/yatirimci", label: mm.investorPanel },
  ];

  const companyItems = [
    { to: ROUTES.KURUMSAL, label: n.corporate },
    { to: "/sss", label: n.faq },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setLangOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const pickLocale = (next: Locale) => {
    setLocale(next);
    setLangOpen(false);
  };

  return (
    <>
      <nav
        className={cn(
          "nav-glass sticky top-0 z-[100] border-b border-white/10 transition-[background,box-shadow] duration-300",
          scrolled && "nav-glass-scrolled",
        )}
      >
        <div className="relative mx-auto flex h-[72px] max-w-[1200px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-6">
          <Link to="/" className="shrink-0 no-underline" aria-label="ihaleal.com — Türkiye'nin Gayrimenkul Borsası">
            <BrandLockup logoSize="sm" layout="inline" showSlogan sloganClassName="hidden 2xl:inline" />
          </Link>

          <div className="nav-desktop-links hidden flex-1 items-center justify-center gap-5 2xl:flex 2xl:gap-6">
            <NavLink
              to="/ihaleler"
              className={({ isActive }) =>
                cn(
                  "border-b-2 pb-0.5 text-sm font-normal no-underline transition-colors",
                  isActive
                    ? "border-[var(--cizgi)] text-[var(--metin-ikincil)]"
                    : "border-transparent text-slate-200 hover:text-white",
                )
              }
            >
              {n.auctions}
            </NavLink>
            <NavLink
              to={ROUTES.NASIL_CALISIR}
              className={({ isActive }) =>
                cn(
                  "border-b-2 pb-0.5 text-sm font-normal no-underline transition-colors",
                  isActive
                    ? "border-[var(--cizgi)] text-[var(--metin-ikincil)]"
                    : "border-transparent text-slate-200 hover:text-white",
                )
              }
            >
              {n.howItWorks}
            </NavLink>
            <NavDropdown
              label={n.services}
              items={coreServiceItems}
              testId="nav-services"
              triggerTestId="nav-services-trigger"
            />
            <NavDropdown label={n.company} items={companyItems} testId="nav-company" />
            {/* Priority-0 nav overflow fix: Borsa aksiyon butonundan buraya taşındı (Ghost Text Link) */}
            <NavLink
              to="/borsa"
              className={({ isActive }) =>
                cn(
                  "border-b-2 pb-0.5 text-sm font-normal no-underline transition-colors",
                  isActive
                    ? "border-[var(--cizgi)] text-[var(--metin-ikincil)]"
                    : "border-transparent text-slate-200 hover:text-white",
                )
              }
            >
              {n.borsaCta}
            </NavLink>
          </div>

          <div className="nav-desktop-actions hidden items-center gap-2 2xl:flex">
            <OnlinePresenceBadge compact className="hidden 2xl:inline-flex" />
            {/* Priority-0 nav overflow fix: ikon-tetikli arama, tam kutu yalnız çok geniş ekranda */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label={n.search}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-slate-600/30 bg-slate-900/60 text-slate-400 transition hover:border-slate-500/50 min-[1700px]:hidden"
            >
              <Search className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden h-10 min-w-[200px] items-center gap-2 rounded-[10px] border border-slate-600/30 bg-slate-900/60 px-3 text-start text-sm text-slate-400 transition hover:border-slate-500/50 min-[1700px]:flex"
            >
              <Search className="h-4 w-4 shrink-0" aria-hidden />
              <span className="flex-1 truncate">{n.search}</span>
              <kbd className="rounded-[3px] bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-500">⌘K</kbd>
            </button>
            {/* Para birimi seçici — TRY/USD/EUR/GBP (tahsilat ₺); compact = yalnız sembol, dar aralıkta yer kazandırır */}
            <CurrencySelector compact />
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangOpen((o) => !o)}
                className="inline-flex h-10 items-center gap-1.5 rounded-[10px] border border-slate-600/30 px-3 text-sm text-slate-200"
                aria-label="Language"
                aria-expanded={langOpen}
                data-testid="nav-lang-trigger"
              >
                <Globe className="hidden h-4 w-4 text-slate-400 min-[1700px]:block" />
                {locale.toUpperCase()}
                <ChevronDown className={cn("h-3.5 w-3.5", langOpen && "rotate-180")} />
              </button>
              {langOpen ? (
                <div
                  className="absolute end-0 top-full z-[110] mt-2 min-w-[140px] rounded-[10px] border border-slate-600/30 py-1"
                  style={{ background: "var(--zemin-yumusak)" }}
                >
                  <button
                    type="button"
                    onClick={() => pickLocale("en")}
                    className={cn(
                      "block w-full px-4 py-2 text-start text-sm",
                      locale === "en" ? "font-normal text-[var(--metin-ikincil)]" : "text-slate-300 hover:bg-slate-800/50",
                    )}
                  >
                    {n.langEn}
                  </button>
                  <button
                    type="button"
                    onClick={() => pickLocale("tr")}
                    className={cn(
                      "block w-full px-4 py-2 text-start text-sm",
                      locale === "tr" ? "font-normal text-[var(--metin-ikincil)]" : "text-slate-300 hover:bg-slate-800/50",
                    )}
                  >
                    {n.langTr}
                  </button>
                  <button
                    type="button"
                    onClick={() => pickLocale("ru")}
                    className={cn(
                      "block w-full px-4 py-2 text-start text-sm",
                      locale === "ru" ? "font-normal text-[var(--metin-ikincil)]" : "text-slate-300 hover:bg-slate-800/50",
                    )}
                  >
                    {n.langRu}
                  </button>
                  <button
                    type="button"
                    onClick={() => pickLocale("ar")}
                    dir="rtl"
                    className={cn(
                      "block w-full px-4 py-2 text-start text-sm",
                      locale === "ar" ? "font-normal text-[var(--metin-ikincil)]" : "text-slate-300 hover:bg-slate-800/50",
                    )}
                  >
                    {n.langAr}
                  </button>
                </div>
              ) : null}
            </div>
            {/* R12.1 — Borsa CTA artık nav-desktop-links'te Ghost Text Link olarak yer alıyor (bkz. yukarı) */}
            <Button asChild variant="outline" size="default" className="h-10 px-3 xl:px-4">
              <Link to="/giris">{n.logIn}</Link>
            </Button>
            <Button asChild size="default" className="h-10 px-3 xl:px-4">
              <Link to="/kayit">{n.signUp}</Link>
            </Button>
          </div>

          <button
            type="button"
            className="nav-mobile-toggle inline-flex min-h-11 min-w-11 items-center justify-center rounded-[10px] border border-slate-600/30 p-2.5 text-slate-200 2xl:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? n.closeMenu : n.openMenu}
            data-testid="nav-mobile-toggle"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen ? (
          <div className="max-h-[calc(100vh-72px)] overflow-y-auto border-t border-slate-700/40 px-4 py-4 2xl:hidden">
            <button
              type="button"
              onClick={() => {
                setSearchOpen(true);
                setMobileOpen(false);
              }}
              className="mb-3 flex min-h-11 w-full items-center gap-2 rounded-[10px] border border-slate-600/30 bg-slate-900/60 px-3 py-3 text-sm text-slate-400"
            >
              <Search className="h-4 w-4" /> {n.search}
            </button>
            {/* R12.1 — Borsa CTA mobile (prominent) */}
            <Button
              asChild
              className="mb-3 flex h-auto w-full items-center justify-center gap-2 px-3 py-3 text-sm font-normal text-white no-underline"
              data-testid="nav-mobile-borsa-cta"
            >
              <Link to="/borsa" onClick={() => setMobileOpen(false)}>
                {n.borsaCta}
              </Link>
            </Button>
            <NavLink
              to="/ihaleler"
              onClick={() => setMobileOpen(false)}
              className="block min-h-11 rounded-[10px] px-3 py-3 text-sm font-normal text-slate-200 no-underline hover:bg-slate-800/50"
            >
              {n.auctions}
            </NavLink>
            <NavLink
              to={ROUTES.NASIL_CALISIR}
              onClick={() => setMobileOpen(false)}
              className="block min-h-11 rounded-[10px] px-3 py-3 text-sm font-normal text-slate-200 no-underline hover:bg-slate-800/50"
            >
              {n.howItWorks}
            </NavLink>
            {/* İhale odağı: nav'da sadece çekirdek hizmetler görünür */}
            <p className="mt-2 px-3 py-1 text-xs font-normal uppercase tracking-wider text-slate-500">
              {n.services}
            </p>
            {coreServiceItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="block min-h-11 rounded-[10px] px-3 py-3 text-sm text-slate-200 no-underline hover:bg-slate-800/50"
              >
                {item.label}
              </NavLink>
            ))}
            {/* R12.3 — Deprem modülleri mobile */}
            <p className="mt-2 px-3 py-1 text-xs font-normal uppercase tracking-wider text-slate-500">
              Afet & Deprem
            </p>
            <NavLink
              to="/modul/deprem-risk-haritasi"
              onClick={() => setMobileOpen(false)}
              className="block min-h-11 rounded-[10px] px-3 py-3 text-sm text-slate-200 no-underline hover:bg-slate-800/50"
            >
              Deprem risk haritası
            </NavLink>
            <NavLink
              to="/modul/bina-risk-sorgu"
              onClick={() => setMobileOpen(false)}
              className="block min-h-11 rounded-[10px] px-3 py-3 text-sm text-slate-200 no-underline hover:bg-slate-800/50"
            >
              Bina risk sorgu
            </NavLink>
            <p className="mt-2 px-3 py-1 text-xs font-normal uppercase tracking-wider text-slate-500">
              {n.company}
            </p>
            {companyItems.map((sub) => (
              <NavLink
                key={sub.to}
                to={sub.to}
                onClick={() => setMobileOpen(false)}
                className="block min-h-11 rounded-[10px] px-3 py-3 text-sm text-slate-200 no-underline hover:bg-slate-800/50"
              >
                {sub.label}
              </NavLink>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-700/40 pt-3 sm:grid-cols-4">
              <button
                type="button"
                onClick={() => pickLocale("en")}
                className={cn(
                  "min-h-11 rounded-[10px] border py-3 text-center text-sm",
                  locale === "en"
                    ? "border-[var(--cizgi)] bg-[var(--zemin-yumusak)] text-[var(--metin-ikincil)]"
                    : "border-slate-600/30 text-slate-400",
                )}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => pickLocale("tr")}
                className={cn(
                  "min-h-11 rounded-[10px] border py-3 text-center text-sm",
                  locale === "tr"
                    ? "border-[var(--cizgi)] bg-[var(--zemin-yumusak)] text-[var(--metin-ikincil)]"
                    : "border-slate-600/30 text-slate-400",
                )}
              >
                TR
              </button>
              <button
                type="button"
                onClick={() => pickLocale("ru")}
                className={cn(
                  "min-h-11 rounded-[10px] border py-3 text-center text-sm",
                  locale === "ru"
                    ? "border-[var(--cizgi)] bg-[var(--zemin-yumusak)] text-[var(--metin-ikincil)]"
                    : "border-slate-600/30 text-slate-400",
                )}
              >
                RU
              </button>
              <button
                type="button"
                onClick={() => pickLocale("ar")}
                className={cn(
                  "min-h-11 rounded-[10px] border py-3 text-center text-sm",
                  locale === "ar"
                    ? "border-[var(--cizgi)] bg-[var(--zemin-yumusak)] text-[var(--metin-ikincil)]"
                    : "border-slate-600/30 text-slate-400",
                )}
              >
                AR
              </button>
            </div>
            <div className="mt-2 flex gap-2">
              <Link
                to="/giris"
                className="flex min-h-11 flex-1 items-center justify-center rounded-[10px] border border-slate-600/30 py-3 text-center text-sm text-slate-200 no-underline"
              >
                {n.logIn}
              </Link>
              <Button
                asChild
                className="h-auto min-h-11 flex-1 py-3 text-center text-sm font-normal text-white no-underline"
              >
                <Link to="/kayit">{n.signUp}</Link>
              </Button>
            </div>
          </div>
        ) : null}
      </nav>
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

export default Navbar;
