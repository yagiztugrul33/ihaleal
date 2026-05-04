import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Menu, X, BarChart3, GitCompare, UserPlus, LogIn, LogOut, PlusCircle, Heart, Calculator, Search, Sun, Moon, LayoutDashboard, Navigation, Shield, Building2, Factory } from "lucide-react";
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
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-[#061428]/80 backdrop-blur-xl border-b border-white/10 ${scrolled ? "shadow-lg shadow-black/30" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20 gap-2">
            <button type="button" onClick={() => navigate("/")} className="flex items-center gap-2.5 group shrink-0">
              <Logo size="md" variant="full" textClassName="text-white tracking-tight text-xl" />
            </button>

            <div className="hidden lg:flex items-center gap-1 min-w-0 flex-1 overflow-x-auto max-w-[min(52vw,720px)] xl:max-w-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <button type="button" onClick={() => navigate("/")} className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all whitespace-nowrap">Ana Sayfa</button>
              <button type="button" onClick={() => navigate("/ihaleler")} className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all whitespace-nowrap">İhaleler</button>
              <button type="button" onClick={() => scrollTo("howItWorks")} className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all whitespace-nowrap">Nasıl Çalışır</button>
              <button type="button" onClick={() => scrollTo("contact")} className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all whitespace-nowrap">İletişim</button>
              {!currentUser ? (
                <>
                  <span className="text-white/20 px-0.5 select-none" aria-hidden>|</span>
                  <button
                    type="button"
                    onClick={() => navigate("/giris?profil=emlakci")}
                    className="px-3 py-2 rounded-lg text-sm font-semibold text-teal-200 hover:text-white hover:bg-teal-500/20 border border-teal-500/35 whitespace-nowrap"
                  >
                    Emlakçı Girişi
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/giris?profil=muteahhit")}
                    className="px-3 py-2 rounded-lg text-sm font-semibold text-amber-200 hover:text-white hover:bg-amber-500/20 border border-amber-500/35 whitespace-nowrap"
                  >
                    Müteahhit Girişi
                  </button>
                </>
              ) : null}
            </div>

            <div className="hidden lg:flex items-center gap-2 shrink-0 flex-nowrap">
              <button type="button" onClick={() => setSearchOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-slate-400 hover:bg-white/15 hover:text-white transition-all text-sm max-w-[140px] xl:max-w-[180px]">
                <Search className="w-4 h-4 shrink-0" /> <span className="truncate text-slate-500">Ara…</span>
              </button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/analiz")} className="text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/10 gap-1.5 whitespace-nowrap"><BarChart3 className="w-4 h-4" /> AI Analiz</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="text-slate-300 hover:text-violet-300 hover:bg-violet-500/10 gap-1.5 whitespace-nowrap"><LayoutDashboard className="w-4 h-4" /> Dashboard</Button>
              {showAdmin ? (
                <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 gap-1.5"><Shield className="w-4 h-4" /> Admin</Button>
              ) : null}
              <Button variant="ghost" size="sm" onClick={() => navigate("/harita")} className="text-slate-300 hover:text-emerald-300 hover:bg-emerald-500/10 gap-1.5 whitespace-nowrap"><Navigation className="w-4 h-4" /> Harita</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/karsilastir")} className="text-slate-300 hover:text-teal-300 hover:bg-teal-500/10 gap-1.5 whitespace-nowrap"><GitCompare className="w-4 h-4" /> Karşılaştır</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/favoriler")} className="text-slate-300 hover:text-pink-300 hover:bg-pink-500/10 gap-1.5 relative whitespace-nowrap">
                <Heart className="w-4 h-4" /> Favoriler
                {count > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center">{count}</span>}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/mortgage")} className="text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 gap-1.5 whitespace-nowrap"><Calculator className="w-4 h-4" /> Mortgage</Button>
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
                      <PlusCircle className="w-4 h-4" /> İhale Aç
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
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
                  <Button variant="ghost" size="sm" onClick={() => navigate("/giris?profil=emlakci")} className="text-slate-300 hover:text-teal-200 hover:bg-teal-500/10 gap-1.5 whitespace-nowrap" title="Kurumsal / ortak emlakçı oturumu">
                    <Building2 className="w-4 h-4" /> Emlakçı
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/giris?profil=muteahhit")} className="text-slate-300 hover:text-amber-200 hover:bg-amber-500/10 gap-1.5 whitespace-nowrap" title="Müteahhit / proje stoğu">
                    <Factory className="w-4 h-4" /> Müteahhit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/giris")} className="text-slate-300 hover:text-white gap-1.5 whitespace-nowrap"><LogIn className="w-4 h-4" /> Giriş</Button>
                  <Button size="sm" onClick={() => navigate("/kayit")} className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-400 hover:to-cyan-300 text-white font-semibold whitespace-nowrap shadow-lg shadow-cyan-500/20">Kayıt Ol</Button>
                </div>
              )}
              <Button variant="ghost" size="sm" onClick={toggle} className="text-slate-400 hover:text-white p-2" title={theme === "dark" ? "Aydinlik Tema" : "Karanlik Tema"}>
                {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-400" />}
              </Button>
            </div>

            {!currentUser ? (
              <div className="lg:hidden flex items-center gap-1.5 shrink-0 mr-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/giris?profil=emlakci")}
                  className="h-9 px-2.5 text-[11px] sm:text-xs border-teal-500/40 text-teal-100 bg-teal-500/10 hover:bg-teal-500/20"
                >
                  <Building2 className="w-3.5 h-3.5 sm:mr-1" />
                  <span className="hidden sm:inline">Emlakçı</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/giris?profil=muteahhit")}
                  className="h-9 px-2.5 text-[11px] sm:text-xs border-amber-500/40 text-amber-100 bg-amber-500/10 hover:bg-amber-500/20"
                >
                  <Factory className="w-3.5 h-3.5 sm:mr-1" />
                  <span className="hidden sm:inline">Müteahhit</span>
                </Button>
              </div>
            ) : null}
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 shrink-0" aria-label="Menüyü aç">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="lg:hidden bg-[#0a0f1e]/95 backdrop-blur-xl border-b border-white/5 px-4 pb-4 animate-fade-in">
            <div className="flex flex-col gap-1 mt-2">
              <button onClick={() => { setSearchOpen(true); setIsOpen(false); }} className="px-3 py-2.5 rounded-lg text-sm font-medium text-white bg-white/10 text-left flex items-center gap-2"><Search className="w-4 h-4" /> İlan Ara</button>
              <button type="button" onClick={() => scrollTo("hero")} className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 text-left">Ana Sayfa</button>
              <button type="button" onClick={() => { navigate("/ihaleler"); setIsOpen(false); }} className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 text-left">İhaleler</button>
              <button type="button" onClick={() => scrollTo("howItWorks")} className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 text-left">Nasıl Çalışır</button>
              <button type="button" onClick={() => scrollTo("contact")} className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 text-left">İletişim</button>
              <div className="border-t border-white/5 my-2" />
              <button onClick={() => { navigate("/analiz"); setIsOpen(false); }} className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-blue-400 hover:bg-blue-500/10 text-left flex items-center gap-2"><BarChart3 className="w-4 h-4" /> AI Analiz</button>
              <button onClick={() => { navigate("/dashboard"); setIsOpen(false); }} className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-violet-400 hover:bg-violet-500/10 text-left flex items-center gap-2"><LayoutDashboard className="w-4 h-4" /> Dashboard</button>
              {showAdmin ? (
                <button onClick={() => { navigate("/admin"); setIsOpen(false); }} className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-amber-400 hover:bg-amber-500/10 text-left flex items-center gap-2"><Shield className="w-4 h-4" /> Admin</button>
              ) : null}
              <button onClick={() => { navigate("/harita"); setIsOpen(false); }} className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/10 text-left flex items-center gap-2"><Navigation className="w-4 h-4" /> Harita</button>
              <button type="button" onClick={() => { navigate("/karsilastir"); setIsOpen(false); }} className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-teal-400 hover:bg-teal-500/10 text-left flex items-center gap-2"><GitCompare className="w-4 h-4" /> Karşılaştır</button>
              <button type="button" onClick={() => { navigate("/mortgage"); setIsOpen(false); }} className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-amber-400 hover:bg-amber-500/10 text-left flex items-center gap-2"><Calculator className="w-4 h-4" /> Mortgage</button>
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
                      <PlusCircle className="w-4 h-4" /> İhale Aç
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
                  <button type="button" onClick={() => { navigate("/giris?profil=emlakci"); setIsOpen(false); }} className="px-3 py-2.5 rounded-lg text-sm font-medium text-teal-200 border border-teal-500/25 hover:bg-teal-500/10 text-left flex items-center gap-2"><Building2 className="w-4 h-4" /> Emlakçı girişi</button>
                  <button type="button" onClick={() => { navigate("/giris?profil=muteahhit"); setIsOpen(false); }} className="px-3 py-2.5 rounded-lg text-sm font-medium text-amber-200 border border-amber-500/25 hover:bg-amber-500/10 text-left flex items-center gap-2"><Factory className="w-4 h-4" /> Müteahhit girişi</button>
                  <button type="button" onClick={() => { navigate("/giris"); setIsOpen(false); }} className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white text-left flex items-center gap-2"><LogIn className="w-4 h-4" /> Giriş</button>
                  <button type="button" onClick={() => { navigate("/kayit"); setIsOpen(false); }} className="px-3 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-cyan-400 text-left">Kayıt Ol</button>
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
