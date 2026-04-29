import { type ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, authIsAdmin } from "@/contexts/AuthContext";
import { PageLoader } from "@/components/ui/PageLoader";

export function AdminGuard({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { user, loading, profile, profileLoading } = useAuth();

  useEffect(() => {
    if (loading || profileLoading) return;
    if (!user) {
      navigate("/giris", { replace: true });
      return;
    }
    if (!authIsAdmin(profile)) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, profile, profileLoading, navigate]);

  if (loading || profileLoading) {
    return <PageLoader label="Yetki kontrolü..." />;
  }
  if (!user || !authIsAdmin(profile)) {
    return <PageLoader label="Yönlendiriliyor..." />;
  }

  return <>{children}</>;
}
