import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Menu, X, BarChart3, GitCompare, UserPlus, LogIn, LogOut, PlusCircle, Heart, Calculator, Search, Sun, Moon, LayoutDashboard, Navigation, Store, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";
import { useTheme } from "@/hooks/useTheme";
import { SearchModal } from "./SearchModal";
import { mergedFlowPermissions, readUserFlowsFromStorage, type UserFlow } from "@/lib/userFlows";
import { sessionUserFromSupabaseUser } from "@/lib/supabaseAuthBridge";
import type { SessionUser } from "@/lib/auth";
import { useAuth, authIsAdmin } from "@/contexts/AuthContext";

function readSessionUser(): SessionUser | null {
  try {
    return JSON.parse(localStorage.getItem("ihaleal_user") || "null") as SessionUser | null;
  } catch {
    return null;
  }
}

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: supaUser, signOut, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [localSession, setLocalSession] = useState<SessionUser | null>(readSessionUser);
  const [userFlows, setUserFlows] = useState<UserFlow[]>(() => readUserFlowsFromStorage());
  const flowPerms = useMemo(() => mergedFlowPermissions(userFlows), [userFlows]);
  const { count } = useFavorites();
  const { theme, toggle } = useTheme();

  const currentUser = useMemo<SessionUser | null>(() => {
    if (supaUser) return sessionUserFromSupabaseUser(supaUser);
    return localSession;
  }, [supaUser, localSession]);

  const navDisplayLabel = supaUser?.email ?? currentUser?.email ?? currentUser?.name ?? "";
  const showAdmin = authIsAdmin(profile);

  useEffect(() => {
    const sync = () => {
      setLocalSession(readSessionUser());
      setUserFlows(readUserFlowsFromStorage());
    };
    window.addEventListener("ihaleal-auth", sync);
    window.addEventListener("ihaleal-user-flows", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ihaleal-auth", sync);
      window.removeEventListener("ihaleal-user-flows", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    navigate("/");
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 300);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#0a0f1e]/90 backdrop-blur-xl border-b border-white/5 shadow-lg" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <button type="button" onClick={() => navigate("/")} className="flex items-center gap-2.5 group">
              <Logo size="md" variant="full" textClassName="text-white tracking-tight text-xl" />
            </button>

            <div className="hidden lg:flex items-center gap-1">
              <button onClick={() => scrollTo("hero")} className="px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">Ana Sayfa</button>
              <button onClick={() => scrollTo("auctions")} className="px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">Ihaleler</button>
              <button onClick={() => scrollTo("howItWorks")} className="px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">Nasil Calisir</button>
              <button onClick={() => scrollTo("contact")} className="px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">Iletisim</button>
            </div>

            <div className="hidden lg:flex items-center gap-2">
              <button onClick={() => setSearchOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all text-sm">
                <Search className="w-4 h-4" /> <span className="text-slate-500">Ara...</span>
              </button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/analiz")} className="text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 gap-1.5"><BarChart3 className="w-4 h-4" /> AI Analiz</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 gap-1.5"><LayoutDashboard className="w-4 h-4" /> Dashboard</Button>
              {showAdmin ? (
                <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 gap-1.5"><Shield className="w-4 h-4" /> Admin</Button>
              ) : null}
              <Button variant="ghost" size="sm" onClick={() => navigate("/harita")} className="text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 gap-1.5"><Navigation className="w-4 h-4" /> Harita</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/karsilastir")} className="text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 gap-1.5"><GitCompare className="w-4 h-4" /> Karsilastir</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/favoriler")} className="text-slate-400 hover:text-pink-400 hover:bg-pink-500/10 gap-1.5 relative">
                <Heart className="w-4 h-4" /> Favoriler
                {count > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center">{count}</span>}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/mortgage")} className="text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 gap-1.5"><Calculator className="w-4 h-4" /> Mortgage</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/sat-basla")} className="text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 gap-1.5"><Store className="w-4 h-4" /> Satıcı modu</Button>
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 max-w-[180px] truncate hidden xl:inline" title={supaUser?.email ?? currentUser.email}>
                    {navDisplayLabel}
                  </span>
                  {userFlows.length === 0 ? (
                    <Button size="sm" variant="outline" onClick={() => navigate("/onboarding/akis")} className="border-teal-500/40 text-teal-200">
                      Akış seç
                    </Button>
                  ) : null}
                  {flowPerms.canOpenAuction ? (
                    <Button size="sm" onClick={() => navigate("/ihale-ac")} className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-400 hover:to-teal-300 text-white font-semibold gap-1.5">
                      <PlusCircle className="w-4 h-4" /> Ihale Ac
                    </Button>
                  ) : null}
                  <Button variant="ghost" size="sm" onClick={() => navigate("/profil")} className="text-slate-400 hover:text-white" title="Profil">
                    <UserPlus className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => void handleSignOut()} className="text-slate-400 hover:text-rose-300 gap-1.5">
                    <LogOut className="w-4 h-4" /> Çıkış
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate("/giris")} className="text-slate-400 hover:text-white gap-1.5"><LogIn className="w-4 h-4" /> Giriş Yap</Button>
                  <Button size="sm" onClick={() => navigate("/kayit")} className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-400 hover:to-teal-300 text-white font-semibold">Üye Ol</Button>
                </div>
              )}
              <Button variant="ghost" size="sm" onClick={toggle} className="text-slate-400 hover:text-white p-2" title={theme === "dark" ? "Aydinlik Tema" : "Karanlik Tema"}>
                {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-400" />}
              </Button>
            </div>

            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"><Menu className="w-6 h-6" /></button>
          </div>
        </div>

        {isOpen && (
          <div className="lg:hidden bg-[#0a0f1e]/95 backdrop-blur-xl border-b border-white/5 px-4 pb-4 animate-fade-in">
            <div className="flex flex-col gap-1 mt-2">
              <button onClick={() => { setSearchOpen(true); setIsOpen(false); }} className="px-3 py-2.5 rounded-lg text-sm font-medium text-white bg-white/10 text-left flex items-center gap-2"><Search className="w-4 h-4" /> Ilan Ara</button>
              <button onClick={() => scrollTo("hero")} className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 text-left">Ana Sayfa</button>
              <button onClick={() => scrollTo("auctions")} className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 text-left">Ihaleler</button>
              <button onClick={() => scrollTo("howItWorks")} className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 text-left">Nasil Calisir</button>
              <button onClick={() => scrollTo("contact")} className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 text-left">Iletisim</button>
              <div className="border-t border-white/5 my-2" />
              <button onClick={() => { navigate("/analiz"); setIsOpen(false); }} className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-blue-400 hover:bg-blue-500/10 text-left flex items-center gap-2"><BarChart3 className="w-4 h-4" /> AI Analiz</button>
              <button onClick={() => { navigate("/dashboard"); setIsOpen(false); }} className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-violet-400 hover:bg-violet-500/10 text-left flex items-center gap-2"><LayoutDashboard className="w-4 h-4" /> Dashboard</button>
              {showAdmin ? (
                <button onClick={() => { navigate("/admin"); setIsOpen(false); }} className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-amber-400 hover:bg-amber-500/10 text-left flex items-center gap-2"><Shield className="w-4 h-4" /> Admin</button>
              ) : null}
              <button onClick={() => { navigate("/harita"); setIsOpen(false); }} className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/10 text-left flex items-center gap-2"><Navigation className="w-4 h-4" /> Harita</button>
              <button onClick={() => { navigate("/karsilastir"); setIsOpen(false); }} className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-teal-400 hover:bg-teal-500/10 text-left flex items-center gap-2"><GitCompare className="w-4 h-4" /> Karsilastir</button>
              <button onClick={() => { navigate("/mortgage"); setIsOpen(false); }} className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-amber-400 hover:bg-amber-500/10 text-left flex items-center gap-2"><Calculator className="w-4 h-4" /> Mortgage</button>
              <button onClick={() => { navigate("/sat-basla"); setIsOpen(false); }} className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/10 text-left flex items-center gap-2"><Store className="w-4 h-4" /> Satıcı modu</button>
              {currentUser ? (
                <>
                  {userFlows.length === 0 ? (
                    <button
                      onClick={() => {
                        navigate("/onboarding/akis");
                        setIsOpen(false);
                      }}
                      className="px-3 py-2.5 rounded-lg text-sm font-medium text-teal-200 border border-teal-500/30 text-left"
                    >
                      Akış seç
                    </button>
                  ) : null}
                  {flowPerms.canOpenAuction ? (
                    <button
                      onClick={() => {
                        navigate("/ihale-ac");
                        setIsOpen(false);
                      }}
                      className="px-3 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-teal-400 text-left flex items-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4" /> Ihale Ac
                    </button>
                  ) : null}
                  <button onClick={() => { navigate("/profil"); setIsOpen(false); }} className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white text-left flex items-center gap-2"><UserPlus className="w-4 h-4" /> Profilim</button>
                  <button
                    onClick={() => {
                      void handleSignOut();
                    }}
                    className="px-3 py-2.5 rounded-lg text-sm font-medium text-rose-300 hover:bg-rose-500/10 text-left flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Çıkış Yap
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => { navigate("/giris"); setIsOpen(false); }} className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white text-left flex items-center gap-2"><LogIn className="w-4 h-4" /> Giriş Yap</button>
                  <button onClick={() => { navigate("/kayit"); setIsOpen(false); }} className="px-3 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-teal-400 text-left">Üye Ol</button>
                </>
              )}
              <button onClick={() => { toggle(); setIsOpen(false); }} className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 text-left flex items-center gap-2">
                {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-400" />}
                {theme === "dark" ? "Aydinlik Tema" : "Karanlik Tema"}
              </button>
            </div>
          </div>
        )}
      </nav>
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
