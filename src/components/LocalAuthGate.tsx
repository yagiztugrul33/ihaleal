import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { localAuthEnabled } from "@/lib/runtimeFlags";
import { PageLoader } from "@/components/ui/PageLoader";

/** Üretimde yerel demo giriş rotalarini /giris'e yönlendirir. */
export function LocalAuthGate({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localAuthEnabled) {
      navigate("/giris", { replace: true, state: { from: "local-auth-disabled" } });
    }
  }, [navigate]);

  if (!localAuthEnabled) {
    return <PageLoader label="Yönlendiriliyor..." />;
  }

  return <>{children}</>;
}