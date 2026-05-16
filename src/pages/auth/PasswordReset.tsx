import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PasswordReset() {
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
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-slate-900/60 p-8 shadow-xl">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-blue-500/15 p-3">
            <Mail className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        <h1 className="text-center text-xl font-semibold text-white">Şifre sıfırlama</h1>
        <p className="mt-2 text-center text-sm text-slate-400">
          Hesabınıza bağlı e-postayı girin; demo ortamında yalnızca bildirim simülasyonu gösterilir.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
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
      </div>
    </div>
  );
}
