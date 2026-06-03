import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AuthBrandHeader } from "@/components/auth/AuthBrandHeader";

export default function PasswordReset() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    window.dispatchEvent(
      new CustomEvent("ihaleal:add-toast", {
        detail: {
          message:
            "Şifre sıfırlama bağlantısı gerçekte gönderilmez; üretimde e-posta sağlayıcısı eklenir.",
          type: "info",
        },
      }),
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-16" data-demo="true">
      <div className="w-full max-w-md">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-6 gap-2 text-slate-500 hover:text-slate-900">
          <ArrowLeft className="rtl:rotate-180 h-4 w-4" /> Geri
        </Button>
        <Card className="border-slate-200/80 bg-slate-900/50 shadow-xl">
          <CardContent className="p-8">
            <AuthBrandHeader
              title="Şifre sıfırlama"
              subtitle="Hesabınıza bağlı e-postayı girin; demo ortamında yalnızca bildirim simülasyonu gösterilir."
            />

            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label htmlFor="reset-email" className="text-slate-300">
                  E-posta
                </Label>
                <Input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@alan.com"
                  className="mt-1.5 border-slate-200 bg-slate-950/50 text-white"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {sent ? "Tekrar gönder" : "Bağlantı gönder (demo)"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm">
              <Link to="/giris" className="text-blue-400 hover:text-blue-300">
                Girişe dön
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
