import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { SearchModal } from "@/components/SearchModal";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type NavItem =
  | { type: "link"; to: string; label: string; end?: boolean }
  | {
      type: "dropdown";
      label: string;
      items: { to: string; label: string }[];
    };

const NAV_ITEMS: NavItem[] = [
  { type: "link", to: ROUTES.ILANLAR, label: "Auctions" },
  { type: "link", to: ROUTES.NASIL_CALISIR, label: "How It Works" },
  {
    type: "dropdown",
    label: "Services",
    items: [
      { to: ROUTES.ARASTIRMA_GES, label: "GES Land" },
      { to: "/degerleme", label: "Valuation" },
      { to: ROUTES.ARASTIRMA, label: "Research Hub" },
    ],
  },
  { type: "link", to: ROUTES.ARASTIRMA, label: "Resources" },
  {
    type: "dropdown",
    label: "Company",
    items: [
      { to: ROUTES.KURUMSAL, label: "Corporate" },
      { to: "/sss", label: "FAQ" },
    ],
  },
];

function NavDropdown({
  label,
  items,
  onNavigate,
}: {
  label: string;
  items: { to: string; label: string }[];
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

  const testId =
    label === "Services" ? "nav-services" : label === "Company" ? "nav-company" : undefined;

  return (
    <div ref={ref} className="relative" data-testid={testId}>
      <button
        type="button"
        data-testid={label === "Services" ? "nav-services-trigger" : undefined}
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
              data-testid={
                item.to === ROUTES.ARASTIRMA_GES ? "nav-services-ges" : undefined
              }
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
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

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

  return (
    <>
      <nav
        className="sticky top-0 z-[100] border-b border-slate-700/40 transition-[background] duration-300"
        style={{
          background: scrolled ? "rgba(10, 14, 26, 0.95)" : "rgba(10, 14, 26, 0.88)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="relative mx-auto flex h-[68px] max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex shrink-0 items-center gap-2.5 no-underline">
            <div
              className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] text-xl shadow-lg shadow-blue-500/40"
              style={{ background: "linear-gradient(135deg, #3b82f6, #1e40af)" }}
              aria-hidden
            >
              🔨
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-50">
              ihaleal<span className="text-blue-400">.com</span>
            </span>
          </Link>

          <div className="nav-desktop-links hidden flex-1 items-center justify-center gap-8 lg:flex">
            {NAV_ITEMS.map((item) =>
              item.type === "link" ? (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "border-b-2 pb-0.5 text-sm font-medium no-underline transition-colors",
                      isActive
                        ? "border-blue-500 text-blue-400"
                        : "border-transparent text-slate-200 hover:text-white",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ) : (
                <NavDropdown key={item.label} label={item.label} items={item.items} />
              ),
            )}
          </div>

          <div className="nav-desktop-actions hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex min-w-[200px] items-center gap-2 rounded-[10px] border border-slate-600/30 bg-slate-900/60 px-3 py-2 text-left text-sm text-slate-400 transition hover:border-slate-500/50 lg:min-w-[260px]"
            >
              <Search className="h-4 w-4 shrink-0" aria-hidden />
              <span className="flex-1 truncate">Search auctions, properties…</span>
              <kbd className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] text-slate-500">⌘K</kbd>
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangOpen((o) => !o)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-600/30 px-3 py-2 text-sm text-slate-200"
                aria-label="Language"
                aria-expanded={langOpen}
              >
                🌐 EN <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {langOpen ? (
                <div
                  className="absolute right-0 top-full z-[110] mt-2 min-w-[120px] rounded-lg border border-slate-600/30 py-1 shadow-xl"
                  style={{ background: "rgba(15, 23, 41, 0.98)" }}
                >
                  <button
                    type="button"
                    className="block w-full px-4 py-2 text-left text-sm font-semibold text-blue-400"
                    disabled
                  >
                    English
                  </button>
                  <button
                    type="button"
                    className="block w-full px-4 py-2 text-left text-sm text-slate-400"
                    disabled
                    title="Coming soon"
                  >
                    Türkçe
                  </button>
                </div>
              ) : null}
            </div>
            <Link
              to="/giris"
              className="rounded-lg border border-slate-600/30 px-4 py-2 text-sm font-medium text-slate-200 no-underline hover:bg-slate-800/50"
            >
              Log In
            </Link>
            <Link
              to="/kayit"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white no-underline shadow-lg shadow-blue-500/30"
              style={{ background: "linear-gradient(135deg, #3b82f6, #1e40af)" }}
            >
              Sign Up
            </Link>
          </div>

          <button
            type="button"
            className="nav-mobile-toggle hidden rounded-lg border border-slate-600/30 p-2 text-slate-200 lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen ? (
          <div className="border-t border-slate-700/40 px-4 py-4 lg:hidden">
            <button
              type="button"
              onClick={() => {
                setSearchOpen(true);
                setMobileOpen(false);
              }}
              className="mb-3 flex w-full items-center gap-2 rounded-lg border border-slate-600/30 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-400"
            >
              <Search className="h-4 w-4" /> Search auctions, properties…
            </button>
            {NAV_ITEMS.map((item) =>
              item.type === "link" ? (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "block rounded-lg px-3 py-2.5 text-sm font-medium no-underline",
                      isActive ? "bg-slate-800/60 text-blue-400" : "text-slate-200 hover:bg-slate-800/50",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ) : (
                <div key={item.label} className="mt-2">
                  <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {item.label}
                  </p>
                  {item.items.map((sub) => (
                    <NavLink
                      key={sub.to}
                      to={sub.to}
                      data-testid={
                        sub.to === ROUTES.ARASTIRMA_GES ? "nav-services-ges-mobile" : undefined
                      }
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "block rounded-lg px-3 py-2.5 text-sm no-underline",
                          isActive ? "bg-slate-800/60 text-blue-400" : "text-slate-200 hover:bg-slate-800/50",
                        )
                      }
                    >
                      {sub.label}
                    </NavLink>
                  ))}
                </div>
              ),
            )}
            <div className="mt-3 flex gap-2 border-t border-slate-700/40 pt-3">
              <Link
                to="/giris"
                className="flex-1 rounded-lg border border-slate-600/30 py-2.5 text-center text-sm text-slate-200 no-underline"
              >
                Log In
              </Link>
              <Link
                to="/kayit"
                className="flex-1 rounded-lg py-2.5 text-center text-sm font-semibold text-white no-underline"
                style={{ background: "linear-gradient(135deg, #3b82f6, #1e40af)" }}
              >
                Sign Up
              </Link>
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
