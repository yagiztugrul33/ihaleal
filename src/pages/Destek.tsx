/**
 * /destek — Kullanıcı destek/yardım hub. Hızlı yönlendirmeler + iletişim kanalları.
 */
import { Link } from "react-router-dom";
import { LifeBuoy, Mail, MessageSquare, HelpCircle, FileQuestion, Phone, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Destek() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <LifeBuoy className="w-7 h-7 text-cyan-400" />
          <h1 className="text-3xl md:text-4xl font-normal text-white">Destek</h1>
        </div>
        <p className="text-slate-400 mb-8 max-w-2xl">
          Size nasıl yardımcı olabiliriz? Önce sık sorulan sorulara bakın, çözüm bulamazsanız
          e-posta veya iletişim formundan ulaşın.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <Link
            to="/sss"
            className="rounded-[20px] border border-cyan-400/20 bg-slate-900/40 p-5 hover:border-cyan-400/40 transition-colors block"
          >
            <FileQuestion className="w-8 h-8 text-cyan-300 mb-3" />
            <h2 className="text-lg font-normal text-white mb-1">Sık Sorulan Sorular</h2>
            <p className="text-sm text-slate-400">İhale akışı, komisyon, KYC ve güvenlik için hazır cevaplar.</p>
          </Link>
          <Link
            to="/rehber"
            className="rounded-[20px] border border-slate-700/50 bg-slate-900/40 p-5 hover:border-cyan-400/30 transition-colors block"
          >
            <HelpCircle className="w-8 h-8 text-cyan-300 mb-3" />
            <h2 className="text-lg font-normal text-white mb-1">Rehber</h2>
            <p className="text-sm text-slate-400">Adım adım kullanım kılavuzu, ekran görüntüleriyle.</p>
          </Link>
          <Link
            to="/iletisim"
            className="rounded-[20px] border border-slate-700/50 bg-slate-900/40 p-5 hover:border-cyan-400/30 transition-colors block"
          >
            <MessageSquare className="w-8 h-8 text-cyan-300 mb-3" />
            <h2 className="text-lg font-normal text-white mb-1">İletişim Formu</h2>
            <p className="text-sm text-slate-400">Mesaj bırakın; iş günü 24 saat içinde dönüş.</p>
          </Link>
          <Link
            to="/guvenlik"
            className="rounded-[20px] border border-slate-700/50 bg-slate-900/40 p-5 hover:border-cyan-400/30 transition-colors block"
          >
            <ShieldCheck className="w-8 h-8 text-cyan-300 mb-3" />
            <h2 className="text-lg font-normal text-white mb-1">Güvenlik Merkezi</h2>
            <p className="text-sm text-slate-400">Hesap güvenliği, KYC ve şifre yönetimi rehberi.</p>
          </Link>
        </div>

        <div className="rounded-[20px] border border-cyan-400/20 bg-cyan-500/5 p-5 mb-6">
          <h3 className="text-base font-normal text-cyan-100 mb-2 flex items-center gap-2">
            <Mail className="w-5 h-5" /> E-posta
          </h3>
          <p className="text-slate-200 text-sm">
            Doğrudan e-posta: <a href="mailto:info@ihaleal.com" className="text-cyan-300 underline">info@ihaleal.com</a>
          </p>
          <p className="text-slate-400 text-xs mt-1">
            İş günü içinde dönüş hedefimiz: 24 saat.
          </p>
        </div>

        <div className="rounded-[20px] border border-amber-500/20 bg-amber-500/5 p-5">
          <h3 className="text-base font-normal text-amber-100 mb-2 flex items-center gap-2">
            <Phone className="w-5 h-5" /> Acil durum
          </h3>
          <p className="text-slate-200 text-sm leading-relaxed">
            Para transferi, kimlik dolandırıcılığı veya yetkisiz hesap erişimi şüphesi varsa
            <strong className="text-white"> derhal </strong>
            <a href="mailto:guvenlik@ihaleal.com" className="text-amber-300 underline">guvenlik@ihaleal.com</a>
            {" "}adresine konu satırına <span className="font-mono">ACIL</span> yazarak ulaşın.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to="/kunye">Künye</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/kvkk">KVKK</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/gizlilik">Gizlilik</Link>
          </Button>
          <Button asChild>
            <Link to="/">Ana sayfaya dön</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
