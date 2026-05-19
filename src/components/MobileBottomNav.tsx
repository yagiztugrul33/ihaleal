import { NavLink } from "react-router-dom";
import { Home, Search, Heart, LayoutDashboard, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const ITEMS = [
  { to: "/", label: "Ana", icon: Home },
  { to: "/ilanlar", label: "İlanlar", icon: Search },
  { to: "/favoriler", label: "Favori", icon: Heart },
  { to: "/panel", label: "Panel", icon: LayoutDashboard },
  { to: "/profil", label: "Profil", icon: User },
] as const;

export function MobileBottomNav() {
  const { user, loading } = useAuth();

  if (loading || !user) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[90] border-t border-white/10 bg-[#0f1629]/95 backdrop-blur-md md:hidden pb-[env(safe-area-inset-bottom)]"
      aria-label="Mobil alt menü"
    >
      <ul className="grid grid-cols-5 h-14">
        {ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-0.5 h-full text-[10px] font-medium transition-colors",
                  isActive ? "text-blue-400" : "text-slate-500",
                )
              }
            >
              <Icon className="h-5 w-5" aria-hidden />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
