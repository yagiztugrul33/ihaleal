// R14 PAKET 2 — Müteahhit kayıt sonrası onay bekleme sayfası
// Admin ruhsat doğrulaması beklenirken kullanıcı bilgilendirme

import { Link, useNavigate } from "react-router-dom";
import { Building2, Clock, FileText, LogOut, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export default function MuteahhitOnayBekleniyor() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <Card className="bg-slate-900/50 border-slate-200/80">
          <CardContent className="p-8 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center mx-auto mb-5">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Hesabınız Oluşturuldu</h1>
              <p className="text-slate-400 text-sm">Admin ruhsat doğrulaması bekleniyor</p>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-amber-300 mt-0.5 shrink-0" />
                <div className="space-y-2 text-sm text-amber-100/90">
                  <p className="font-semibold text-amber-200">Müteahhit hesabı doğrulama süreci</p>
                  <ul className="list-disc list-inside space-y-1 text-amber-100/80">
                    <li>Şirket bilgileriniz kaydedildi (vergi numarası + adres)</li>
                    <li>Ruhsat belgenizi yükleyebilir veya sonra ekleyebilirsiniz</li>
                    <li>Admin ekibimiz <strong>24-48 saat</strong> içinde doğrulama yapacak</li>
                    <li>Onay sonrası proje ve birim oluşturabilir, lansman ilanları yayınlayabilirsiniz</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <button
                type="button"
                className="rounded-xl border border-slate-200/80 bg-slate-900/40 p-4 text-start hover:bg-white/5 transition-colors group"
                onClick={() => alert("Ruhsat upload Phase 2'de gerçek Supabase Storage entegrasyonuyla aktif olacak. Şu an mock.")}
              >
                <FileText className="w-5 h-5 text-blue-400 mb-2" />
                <div className="text-sm font-medium text-white group-hover:text-blue-300">Ruhsat Belgesi Yükle</div>
                <div className="text-xs text-slate-500 mt-1">PDF veya resim (5 MB max) — mock</div>
              </button>

              <a
                href="mailto:destek@ihaleal.com?subject=Müteahhit hesap onayı"
                className="rounded-xl border border-slate-200/80 bg-slate-900/40 p-4 text-start hover:bg-white/5 transition-colors group block"
              >
                <Mail className="w-5 h-5 text-emerald-400 mb-2" />
                <div className="text-sm font-medium text-white group-hover:text-emerald-300">Destek ile İletişim</div>
                <div className="text-xs text-slate-500 mt-1">destek@ihaleal.com — 09:00-18:00</div>
              </a>
            </div>

            {user ? (
              <div className="rounded-xl border border-slate-200/80 bg-slate-900/30 px-4 py-3 text-xs text-slate-500">
                Hesap: <strong className="text-slate-300">{user.email}</strong>
              </div>
            ) : null}

            <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
              <Link to="/" className="text-sm text-slate-500 hover:text-slate-200">
                Ana sayfaya dön
              </Link>
              <Button type="button" variant="outline" size="sm" onClick={handleSignOut} className="gap-2">
                <LogOut className="w-4 h-4" /> Çıkış yap
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
