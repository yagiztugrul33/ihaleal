import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown, Globe, Menu, Search, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { SearchModal } from "@/components/SearchModal";
import { ROUTES } from "@/constants/routes";
import { useLocale } from "@/contexts/LocaleContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/messages";

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
          className="absolute left-0 top-full z-[110] mt-2 min-w-[200px] rounded-xl border border-slate-600/30 py-1 shadow-xl"
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
          className="nav-mega-panel absolute left-1/2 top-full z-[110] mt-2 w-[min(720px,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border border-slate-600/30 p-4 shadow-xl"
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

function NavPortalDropdown({
  label,
  items,
  variant,
  onNavigate,
}: {
  label: string;
  items: { to: string; label: string; sub?: string }[];
  variant: "outline" | "default";
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
    <div ref={ref} className="relative" data-testid={variant === "outline" ? "nav-login-portal" : "nav-signup-portal"}>
      <Button
        type="button"
        variant={variant === "outline" ? "outline" : "default"}
        size="default"
        className="h-10 gap-1 px-4"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {label}
        <ChevronDown className={cn("h-3.5 w-3.5", open && "rotate-180")} />
      </Button>
      {open ? (
        <div
          className="absolute right-0 top-full z-[110] mt-2 min-w-[220px] rounded-xl border border-slate-600/30 py-1 shadow-xl"
          style={{ background: "rgba(15, 23, 41, 0.98)" }}
        >
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
              className="block px-4 py-2.5 text-sm text-slate-200 no-underline hover:bg-slate-800/60"
            >
              <span className="font-medium">{item.label}</span>
              {item.sub ? <span className="mt-0.5 block text-xs text-slate-500">{item.sub}</span> : null}
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

  const megaColumns = [
    {
      title: "Yatırımcı",
      items: [
        { to: ROUTES.ILANLAR, label: "Canlı ihaleler" },
        { to: "/degerleme", label: "AI değerleme" },
        { to: ROUTES.ARASTIRMA_GES, label: n.gesLand, testId: "nav-services-ges" },
        { to: "/dashboard/yatirimci", label: "Yatırımcı paneli" },
      ],
    },
    {
      title: "Emlakçı",
      items: [
        { to: "/emlakci", label: "Emlakçı vitrini" },
        { to: "/emlakci/panel", label: "Ofis paneli" },
        { to: "/emlakci-giris", label: "Emlakçı girişi" },
        { to: "/emlakci-ortaklik", label: "B2B ortaklık" },
      ],
    },
    {
      title: "Müteahhit",
      items: [
        { to: "/muteahhit", label: "Müteahhit lansman" },
        { to: "/muteahhit/panel", label: "Proje paneli" },
        { to: "/ihale-ac", label: "İhale aç" },
        { to: ROUTES.KKA_HUB, label: "Kat karşılığı" },
      ],
    },
  ];

  const loginPortals = [
    { to: "/giris", label: "Bireysel giriş", sub: "Alıcı / satıcı hesabı" },
    { to: "/giris?next=/dashboard/yatirimci", label: "Yatırımcı portalı", sub: "Portföy dashboard" },
    { to: "/giris?profil=emlakci", label: "Emlakçı portalı", sub: "Ofis ve ilan yönetimi" },
    { to: "/giris?profil=muteahhit", label: "Müteahhit portalı", sub: "Proje ve ihale akışı" },
  ];

  const signupPortals = [
    { to: "/kayit", label: "Bireysel kayıt", sub: "Ücretsiz hesap" },
    { to: "/kayit?next=/dashboard/yatirimci", label: "Yatırımcı kaydı", sub: "Portföy takibi" },
    { to: "/kayit?profil=emlakci", label: "Emlakçı kaydı", sub: "Ofis hesabı" },
    { to: "/kayit?profil=muteahhit", label: "Müteahhit kaydı", sub: "Proje hesabı" },
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
          scrolled && "nav-glass-scrolled shadow-lg",
        )}
      >
        <div className="relative mx-auto flex h-[72px] max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="shrink-0 no-underline rounded-lg bg-slate-950/35 px-1.5 py-1 ring-1 ring-white/10" aria-label="ihaleal.com">
            <span className="flex items-center gap-2">
              <Logo size="lg" />
              <span className="hidden text-sm font-semibold tracking-wide text-slate-100 sm:inline">ihaleal</span>
            </span>
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
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-10 min-w-[200px] items-center gap-2 rounded-lg border border-slate-600/30 bg-slate-900/60 px-3 text-left text-sm text-slate-400 transition hover:border-slate-500/50 lg:min-w-[240px]"
            >
              <Search className="h-4 w-4 shrink-0" aria-hidden />
              <span className="flex-1 truncate">{n.search}</span>
              <kbd className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-500">⌘K</kbd>
            </button>
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
                  className="absolute right-0 top-full z-[110] mt-2 min-w-[140px] rounded-lg border border-slate-600/30 py-1 shadow-xl"
                  style={{ background: "rgba(15, 23, 41, 0.98)" }}
                >
                  <button
                    type="button"
                    onClick={() => pickLocale("en")}
                    className={cn(
                      "block w-full px-4 py-2 text-left text-sm",
                      locale === "en" ? "font-semibold text-blue-400" : "text-slate-300 hover:bg-slate-800/50",
                    )}
                  >
                    {n.langEn}
                  </button>
                  <button
                    type="button"
                    onClick={() => pickLocale("tr")}
                    className={cn(
                      "block w-full px-4 py-2 text-left text-sm",
                      locale === "tr" ? "font-semibold text-blue-400" : "text-slate-300 hover:bg-slate-800/50",
                    )}
                  >
                    {n.langTr}
                  </button>
                </div>
              ) : null}
            </div>
            <NavPortalDropdown label={n.logIn} items={loginPortals} variant="outline" />
            <NavPortalDropdown label={n.signUp} items={signupPortals} variant="default" />
          </div>

          <button
            type="button"
            className="nav-mobile-toggle hidden rounded-lg border border-slate-600/30 p-2 text-slate-200 lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? n.closeMenu : n.openMenu}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen ? (
          <div
            data-testid="nav-mobile-menu"
            className="nav-mobile-panel fixed inset-x-0 top-[72px] z-[210] max-h-[calc(100dvh-72px)] overflow-y-auto overscroll-contain border-t border-slate-700/40 bg-[#0a0f1c] px-4 py-4 pb-28 shadow-2xl lg:hidden"
          >
            <button
              type="button"
              onClick={() => {
                setSearchOpen(true);
                setMobileOpen(false);
              }}
              className="mb-3 flex w-full items-center gap-2 rounded-lg border border-slate-600/30 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-400"
            >
              <Search className="h-4 w-4" /> {n.search}
            </button>
            <NavLink
              to={ROUTES.ILANLAR}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 no-underline hover:bg-slate-800/50"
            >
              {n.auctions}
            </NavLink>
            <NavLink
              to={ROUTES.NASIL_CALISIR}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 no-underline hover:bg-slate-800/50"
            >
              {n.howItWorks}
            </NavLink>
            <p className="mt-3 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {n.logIn}
            </p>
            {loginPortals.map((portal) => (
              <Link
                key={portal.to}
                to={portal.to}
                data-testid={`nav-login-mobile-${portal.to}`}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2.5 no-underline hover:bg-slate-800/50"
              >
                <span className="block text-sm font-medium text-slate-200">{portal.label}</span>
                <span className="block text-xs text-slate-500">{portal.sub}</span>
              </Link>
            ))}
            <p className="mt-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {n.signUp}
            </p>
            {signupPortals.map((portal) => (
              <Link
                key={portal.to}
                to={portal.to}
                data-testid={`nav-signup-mobile-${portal.to}`}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2.5 no-underline hover:bg-slate-800/50"
              >
                <span className="block text-sm font-medium text-slate-200">{portal.label}</span>
                <span className="block text-xs text-slate-500">{portal.sub}</span>
              </Link>
            ))}
            <p className="mt-3 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {n.services}
            </p>
            {megaColumns.map((col) => (
              <div key={col.title} className="mb-2">
                <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  {col.title}
                </p>
                {col.items.map((sub) => (
                  <NavLink
                    key={sub.to}
                    to={sub.to}
                    data-testid={
                      sub.to === ROUTES.ARASTIRMA_GES
                        ? "nav-services-ges-mobile"
                        : sub.testId
                    }
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm text-slate-200 no-underline hover:bg-slate-800/50"
                  >
                    {sub.label}
                  </NavLink>
                ))}
              </div>
            ))}
            <NavLink
              to={ROUTES.ARASTIRMA}
              onClick={() => setMobileOpen(false)}
              className="mt-1 block rounded-lg px-3 py-2.5 text-sm text-slate-200 no-underline hover:bg-slate-800/50"
            >
              {n.resources}
            </NavLink>
            <p className="mt-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {n.company}
            </p>
            {companyItems.map((sub) => (
              <NavLink
                key={sub.to}
                to={sub.to}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm text-slate-200 no-underline hover:bg-slate-800/50"
              >
                {sub.label}
              </NavLink>
            ))}
            <div className="mt-3 flex gap-2 border-t border-slate-700/40 pt-3">
              <button
                type="button"
                onClick={() => pickLocale("en")}
                className={cn(
                  "flex-1 rounded-lg border py-2 text-center text-sm",
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
                  "flex-1 rounded-lg border py-2 text-center text-sm",
                  locale === "tr"
                    ? "border-blue-500/50 bg-blue-500/10 text-blue-300"
                    : "border-slate-600/30 text-slate-400",
                )}
              >
                TR
              </button>
            </div>
          </div>
        ) : null}
      </nav>
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
      <style>{`
        @media (max-width: 1024px) {
          .nav-desktop-links { display: none !important; }
          .nav-desktop-actions { display: none !important; }
          .nav-mobile-toggle { display: flex !important; }
        }
      `}</style>
    </>
  );
}

export default Navbar;
