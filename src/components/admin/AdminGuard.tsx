import { type ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, authIsAdmin } from "@/contexts/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabaseEnv";
import { PageLoader } from "@/components/ui/PageLoader";

export function AdminGuard({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { user, loading, profile, profileLoading } = useAuth();

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      navigate("/", { replace: true });
      return;
    }
    if (loading || profileLoading) return;
    if (!user) {
      navigate("/giris", { replace: true });
      return;
    }
    if (!authIsAdmin(profile)) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, profile, profileLoading, navigate]);

  if (!isSupabaseConfigured()) {
    return <PageLoader label="Yapılandırma gerekli..." />;
  }

  if (loading || profileLoading) {
    return <PageLoader label="Yetki kontrolü..." />;
  }
  if (!user || !authIsAdmin(profile)) {
    return <PageLoader label="Yönlendiriliyor..." />;
  }

  return <>{children}</>;
}
