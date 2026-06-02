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
          "inline-flex items-center gap-1 border-b-2 border-transparent pb-0.5 text-sm font-medium text-slate-200 transition-colors hover:text-white",
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
          className="absolute start-0 top-full z-[110] mt-2 min-w-[200px] rounded-xl border border-slate-600/30 py-1 shadow-xl"
          style={{ background: "rgba(15, 23, 41, 0.98)", backdropFilter: "blur(20px)" }}
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

// R12.2 — NavMegaMenu (3-sütun mega dropdown, backup/blok1-borsa cherry-pick)
function NavMegaMenu({
  label,
  columns,
  testId,
  triggerTestId,
  onNavigate,
}: {
  label: string;
  columns: { title: string; items: { to: string; label: string; testId?: string }[] }[];
  testId?: string;
  triggerTestId?: string;
  onNavigate?: () => void;
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
          "inline-flex items-center gap-1 border-b-2 border-transparent pb-0.5 text-sm font-medium text-slate-200 transition-colors hover:text-white",
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
          className="nav-mega-panel absolute left-1/2 top-full z-[110] mt-2 w-[min(720px,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-slate-600/30 p-4 shadow-xl"
          style={{ background: "rgba(15, 23, 41, 0.98)", backdropFilter: "blur(20px)" }}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {col.title}
                </p>
                {col.items.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    data-testid={item.testId}
                    onClick={() => {
                      setOpen(false);
                      onNavigate?.();
                    }}
                    className="block rounded-lg px-2 py-2 text-sm text-slate-200 no-underline hover:bg-slate-800/60 hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
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
  const [mobileServiceOpen, setMobileServiceOpen] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const serviceItems = [
    { to: ROUTES.ARASTIRMA_GES, label: n.gesLand, testId: "nav-services-ges" },
    { to: "/degerleme", label: n.valuation },
    { to: ROUTES.ARASTIRMA, label: n.researchHub },
  ];

  // R12.2 — Hizmetler mega dropdown 3 sütun (Yatırımcı / Emlakçı / Müteahhit) — i18n
  const mm = t.megaMenu;
  const megaColumns = [
    {
      title: mm.segmentInvestor,
      items: [
        { to: ROUTES.AUCTIONS, label: mm.liveAuctions },
        { to: "/degerleme", label: mm.aiValuation },
        { to: ROUTES.ARASTIRMA_GES, label: n.gesLand, testId: "nav-services-ges" },
        { to: "/dashboard/yatirimci", label: mm.investorPanel },
        { to: "/oduller", label: mm.rewards },
        { to: "/kampanyalar", label: mm.campaigns },
        { to: "/uluslararasi", label: mm.intlInvestor },
      ],
    },
    {
      title: mm.segmentRealtor,
      items: [
        { to: "/emlakci", label: mm.realtorShowcase },
        { to: "/emlakci/panel", label: mm.officePanel },
        { to: "/emlakci-giris", label: mm.realtorLogin },
        { to: "/emlakci-ortaklik", label: mm.b2bPartnership },
      ],
    },
    {
      title: mm.segmentContractor,
      items: [
        { to: "/muteahhit", label: mm.contractorLaunch },
        { to: "/muteahhit/panel", label: mm.projectPanel },
        { to: "/ihale-ac", label: mm.openAuction },
        { to: ROUTES.KKA_HUB, label: mm.floorBarter },
      ],
    },
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
    setMobileServiceOpen(null);
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
          scrolled && "nav-glass-scrolled shadow-lg",
        )}
      >
        <div className="relative mx-auto flex h-[72px] max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="shrink-0 no-underline" aria-label="ihaleal.com — Türkiye'nin Gayrimenkul Borsası">
            <BrandLockup logoSize="sm" layout="inline" showSlogan hideSloganOnMobile />
          </Link>

          <div className="nav-desktop-links hidden flex-1 items-center justify-center gap-7 lg:flex">
            <NavLink
              to={ROUTES.ILANLAR}
              className={({ isActive }) =>
                cn(
                  "border-b-2 pb-0.5 text-sm font-medium no-underline transition-colors",
                  isActive
                    ? "border-blue-500 text-blue-400"
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
                  "border-b-2 pb-0.5 text-sm font-medium no-underline transition-colors",
                  isActive
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-slate-200 hover:text-white",
                )
              }
            >
              {n.howItWorks}
            </NavLink>
            <NavMegaMenu
              label={n.services}
              columns={megaColumns}
              testId="nav-services"
              triggerTestId="nav-services-trigger"
            />
            <NavLink
              to={ROUTES.ARASTIRMA}
              className={({ isActive }) =>
                cn(
                  "border-b-2 pb-0.5 text-sm font-medium no-underline transition-colors",
                  isActive
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-slate-200 hover:text-white",
                )
              }
            >
              {n.resources}
            </NavLink>
            <NavDropdown label={n.company} items={companyItems} testId="nav-company" />
          </div>

          <div className="nav-desktop-actions hidden items-center gap-2 lg:flex">
            <OnlinePresenceBadge compact className="hidden xl:inline-flex" />
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-10 min-w-[200px] items-center gap-2 rounded-lg border border-slate-600/30 bg-slate-900/60 px-3 text-start text-sm text-slate-400 transition hover:border-slate-500/50 lg:min-w-[240px]"
            >
              <Search className="h-4 w-4 shrink-0" aria-hidden />
              <span className="flex-1 truncate">{n.search}</span>
              <kbd className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-500">⌘K</kbd>
            </button>
            {/* Para birimi seçici — TRY/USD/EUR/GBP (tahsilat ₺) */}
            <CurrencySelector />
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangOpen((o) => !o)}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-600/30 px-3 text-sm text-slate-200"
                aria-label="Language"
                aria-expanded={langOpen}
                data-testid="nav-lang-trigger"
              >
                <Globe className="h-4 w-4 text-slate-400" />
                {locale.toUpperCase()}
                <ChevronDown className={cn("h-3.5 w-3.5", langOpen && "rotate-180")} />
              </button>
              {langOpen ? (
                <div
                  className="absolute end-0 top-full z-[110] mt-2 min-w-[140px] rounded-lg border border-slate-600/30 py-1 shadow-xl"
                  style={{ background: "rgba(15, 23, 41, 0.98)" }}
                >
                  <button
                    type="button"
                    onClick={() => pickLocale("en")}
                    className={cn(
                      "block w-full px-4 py-2 text-start text-sm",
                      locale === "en" ? "font-semibold text-blue-400" : "text-slate-300 hover:bg-slate-800/50",
                    )}
                  >
                    {n.langEn}
                  </button>
                  <button
                    type="button"
                    onClick={() => pickLocale("tr")}
                    className={cn(
                      "block w-full px-4 py-2 text-start text-sm",
                      locale === "tr" ? "font-semibold text-blue-400" : "text-slate-300 hover:bg-slate-800/50",
                    )}
                  >
                    {n.langTr}
                  </button>
                  <button
                    type="button"
                    onClick={() => pickLocale("ru")}
                    className={cn(
                      "block w-full px-4 py-2 text-start text-sm",
                      locale === "ru" ? "font-semibold text-blue-400" : "text-slate-300 hover:bg-slate-800/50",
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
                      locale === "ar" ? "font-semibold text-blue-400" : "text-slate-300 hover:bg-slate-800/50",
                    )}
                  >
                    {n.langAr}
                  </button>
                </div>
              ) : null}
            </div>
            {/* R12.1 — Borsa CTA (backup/blok1-borsa pattern) */}
            <Button asChild className="h-10 px-4 text-sm font-semibold">
              <Link to="/borsa" className="no-underline">
                {n.borsaCta}
              </Link>
            </Button>
            <Button asChild variant="outline" size="default" className="h-10 px-4">
              <Link to="/giris">{n.logIn}</Link>
            </Button>
            <Button asChild size="default" className="h-10 px-4">
              <Link to="/kayit">{n.signUp}</Link>
            </Button>
          </div>

          <button
            type="button"
            className="nav-mobile-toggle inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-slate-600/30 p-2.5 text-slate-200 lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? n.closeMenu : n.openMenu}
            data-testid="nav-mobile-toggle"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen ? (
          <div className="max-h-[calc(100vh-72px)] overflow-y-auto border-t border-slate-700/40 px-4 py-4 lg:hidden">
            <button
              type="button"
              onClick={() => {
                setSearchOpen(true);
                setMobileOpen(false);
              }}
              className="mb-3 flex min-h-11 w-full items-center gap-2 rounded-lg border border-slate-600/30 bg-slate-900/60 px-3 py-3 text-sm text-slate-400"
            >
              <Search className="h-4 w-4" /> {n.search}
            </button>
            {/* R12.1 — Borsa CTA mobile (prominent) */}
            <Button
              asChild
              className="mb-3 flex h-auto w-full items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold text-white no-underline"
              style={{ background: "linear-gradient(135deg, #3b82f6, #1e40af)" }}
              data-testid="nav-mobile-borsa-cta"
            >
              <Link to="/borsa" onClick={() => setMobileOpen(false)}>
                {n.borsaCta}
              </Link>
            </Button>
            <NavLink
              to={ROUTES.ILANLAR}
              onClick={() => setMobileOpen(false)}
              className="block min-h-11 rounded-lg px-3 py-3 text-sm font-medium text-slate-200 no-underline hover:bg-slate-800/50"
            >
              {n.auctions}
            </NavLink>
            <NavLink
              to={ROUTES.NASIL_CALISIR}
              onClick={() => setMobileOpen(false)}
              className="block min-h-11 rounded-lg px-3 py-3 text-sm font-medium text-slate-200 no-underline hover:bg-slate-800/50"
            >
              {n.howItWorks}
            </NavLink>
            {/* R12.2 — Hizmetler mega menu mobile accordion */}
            <p className="mt-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {n.services}
            </p>
            {megaColumns.map((col) => {
              const expanded = mobileServiceOpen === col.title;
              return (
                <div key={col.title} className="rounded-lg">
                  <button
                    type="button"
                    onClick={() => setMobileServiceOpen(expanded ? null : col.title)}
                    aria-expanded={expanded}
                    className="flex w-full min-h-11 items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-slate-200 hover:bg-slate-800/50"
                    data-testid={`nav-mobile-services-${col.title.toLowerCase()}`}
                  >
                    <span>{col.title}</span>
                    <ChevronDown
                      className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")}
                    />
                  </button>
                  {expanded && (
                    <div className="ms-2 border-s border-slate-700/40 ps-2">
                      {col.items.map((item) => (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          data-testid={
                            item.testId === "nav-services-ges" ? "nav-services-ges-mobile" : item.testId
                          }
                          onClick={() => {
                            setMobileServiceOpen(null);
                            setMobileOpen(false);
                          }}
                          className="block min-h-11 rounded-lg px-3 py-3 text-sm text-slate-200 no-underline hover:bg-slate-800/50"
                        >
                          {item.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <NavLink
              to={ROUTES.ARASTIRMA}
              onClick={() => setMobileOpen(false)}
              className="mt-1 block min-h-11 rounded-lg px-3 py-3 text-sm text-slate-200 no-underline hover:bg-slate-800/50"
            >
              {n.resources}
            </NavLink>
            {/* R12.3 — Deprem modülleri mobile */}
            <p className="mt-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Afet & Deprem
            </p>
            <NavLink
              to="/modul/deprem-risk-haritasi"
              onClick={() => setMobileOpen(false)}
              className="block min-h-11 rounded-lg px-3 py-3 text-sm text-slate-200 no-underline hover:bg-slate-800/50"
            >
              Deprem risk haritası
            </NavLink>
            <NavLink
              to="/modul/bina-risk-sorgu"
              onClick={() => setMobileOpen(false)}
              className="block min-h-11 rounded-lg px-3 py-3 text-sm text-slate-200 no-underline hover:bg-slate-800/50"
            >
              Bina risk sorgu
            </NavLink>
            <p className="mt-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {n.company}
            </p>
            {companyItems.map((sub) => (
              <NavLink
                key={sub.to}
                to={sub.to}
                onClick={() => setMobileOpen(false)}
                className="block min-h-11 rounded-lg px-3 py-3 text-sm text-slate-200 no-underline hover:bg-slate-800/50"
              >
                {sub.label}
              </NavLink>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-700/40 pt-3 sm:grid-cols-4">
              <button
                type="button"
                onClick={() => pickLocale("en")}
                className={cn(
                  "min-h-11 rounded-lg border py-3 text-center text-sm",
                  locale === "en"
                    ? "border-blue-500/50 bg-blue-500/10 text-blue-300"
                    : "border-slate-600/30 text-slate-400",
                )}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => pickLocale("tr")}
                className={cn(
                  "min-h-11 rounded-lg border py-3 text-center text-sm",
                  locale === "tr"
                    ? "border-blue-500/50 bg-blue-500/10 text-blue-300"
                    : "border-slate-600/30 text-slate-400",
                )}
              >
                TR
              </button>
              <button
                type="button"
                onClick={() => pickLocale("ru")}
                className={cn(
                  "min-h-11 rounded-lg border py-3 text-center text-sm",
                  locale === "ru"
                    ? "border-blue-500/50 bg-blue-500/10 text-blue-300"
                    : "border-slate-600/30 text-slate-400",
                )}
              >
                RU
              </button>
              <button
                type="button"
                onClick={() => pickLocale("ar")}
                className={cn(
                  "min-h-11 rounded-lg border py-3 text-center text-sm",
                  locale === "ar"
                    ? "border-blue-500/50 bg-blue-500/10 text-blue-300"
                    : "border-slate-600/30 text-slate-400",
                )}
              >
                AR
              </button>
            </div>
            <div className="mt-2 flex gap-2">
              <Link
                to="/giris"
                className="flex min-h-11 flex-1 items-center justify-center rounded-lg border border-slate-600/30 py-3 text-center text-sm text-slate-200 no-underline"
              >
                {n.logIn}
              </Link>
              <Button
                asChild
                className="h-auto min-h-11 flex-1 rounded-lg py-3 text-center text-sm font-semibold text-white no-underline"
                style={{ background: "linear-gradient(135deg, #3b82f6, #1e40af)" }}
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
