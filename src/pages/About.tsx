import { Link } from "react-router-dom";
import { Building2, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  return (
    <div className="min-h-screen px-4 pt-24 pb-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-white">Hakkımızda</h1>
        <p className="mt-4 text-slate-400 leading-relaxed">
          ihaleal.com, gayrimenkul ihale ve teklif süreçlerini şeffaf bir çizgide bir araya getirmeyi hedefleyen bir platform
          taslağıdır (demo). Gerçek işlem ve ödeme bu ön yüzde yapılmaz; kurallar ve ücretler bilgilendirme amaçlıdır.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Card className="border-slate-200 bg-slate-900/40">
            <CardContent className="pt-6">
              <Building2 className="mb-3 h-8 w-8 text-blue-400" />
              <h2 className="font-semibold text-white">Odak</h2>
              <p className="mt-2 text-sm text-slate-400">İlan, ihale veya kapalı teklif modlarıyla tek çatı altında süreç çizgisi.</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-slate-900/40">
            <CardContent className="pt-6">
              <Shield className="mb-3 h-8 w-8 text-teal-400" />
              <h2 className="font-semibold text-white">Uyumluluk hedefi</h2>
              <p className="mt-2 text-sm text-slate-400">KYC, evrak ve saklama politikaları üretimde hukuk ve regülasyonla tamamlanır.</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-slate-900/40">
            <CardContent className="pt-6">
              <Users className="mb-3 h-8 w-8 text-violet-400" />
              <h2 className="font-semibold text-white">Ortaklık</h2>
              <p className="mt-2 text-sm text-slate-400">B2B emlakçı ortaklığı—liste paketi satışı hedeflenmez.</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/ihaleler">İhaleleri incele</Link>
          </Button>
          <Button asChild variant="outline" className="border-white/15">
            <Link to="/iletisim">İletişim</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
