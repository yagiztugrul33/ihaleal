/**
 * Route-level auth gate. Sayfa-bazlı `if (!user)` UI gizlemenin
 * yetersizliğine karşı hızlı redirect (UX iyileştirme + intent guard).
 *
 * RLS hâlâ data-layer son savunma — bu wrapper sadece anonim
 * kullanıcının auth-bound sayfayı yüklemeye gerek olmadığı UX iyileştirmesidir.
 */
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: Props): React.ReactNode {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin me-2" /> Oturum kontrol ediliyor…
      </div>
    );
  }

  if (!user) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/giris?next=${encodeURIComponent(next)}`} replace />;
  }

  return children;
}
