import { Link } from "react-router-dom";
import { LogIn, UserPlus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

type RequireAuthGateProps = {
  redirectTo: string;
  title?: string;
  description?: string;
};

export function RequireAuthGate({
  redirectTo,
  title = "Anlık teklif almak için giriş yapın",
  description = "Kurumsal güvenlik gereği KYC doğrulaması yapılmış kullanıcılar teklif alabilir.",
}: RequireAuthGateProps) {
  const loginHref = `/giris?next=${encodeURIComponent(redirectTo)}`;
  const registerHref = `/kayit?next=${encodeURIComponent(redirectTo)}`;

  return (
    <div
      data-testid="ibuyer-auth-gate"
      className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-md text-center"
    >
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10">
        <Shield className="h-7 w-7 text-blue-300" />
      </div>
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <p className="mt-3 text-sm text-slate-400 max-w-md mx-auto leading-relaxed">{description}</p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild className="gap-2">
          <Link to={loginHref}>
            <LogIn className="h-4 w-4" />
            Giriş Yap
          </Link>
        </Button>
        <Button asChild variant="outline" className="gap-2 border-white/20">
          <Link to={registerHref}>
            <UserPlus className="h-4 w-4" />
            Hesap Oluştur
          </Link>
        </Button>
      </div>
    </div>
  );
}
