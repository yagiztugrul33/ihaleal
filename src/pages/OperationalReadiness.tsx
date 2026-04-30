import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Server, Shield, Database, Clock, Smartphone, Radio, Link2,
  Video, Search, Scale,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const CHECKS: { icon: ReactNode; title: string; desc: string; owner: string }[] = [
  { icon: <Server className="w-5 h-5" />, title: "Backend & API", desc: "Kullanıcı, ilan, ihale, ödeme, bildirim; oran sınırlama ve denetim logları.", owner: "Yazılım ekibi" },
  { icon: <Shield className="w-5 h-5" />, title: "WAF + DDoS + SIEM", desc: "sahibinden seviyesi için kurumsal CDN/WAF ve 7/24 izleme.", owner: "DevOps / güvenlik" },
  { icon: <Database className="w-5 h-5" />, title: "Veri lisansı", desc: "Bölge fiyatı, endeks, harici ilan analizi — kaynak ve KVKK.", owner: "Hukuk + veri satıcısı" },
  { icon: <Clock className="w-5 h-5" />, title: "Cron / ETL", desc: "Saatlik veya dakikalık güncelleme; maliyet ve SLA.", owner: "Backend" },
  { icon: <Link2 className="w-5 h-5" />, title: "e-Devlet & Findeks", desc: "Resmi entegrasyon sözleşmeleri ve test ortamları.", owner: "Kurum + hukuk" },
  { icon: <Smartphone className="w-5 h-5" />, title: "SMS / OTP", desc: "İleti yönetimi, izinli gönderim, log saklama.", owner: "Telekom anlaşması" },
  { icon: <Radio className="w-5 h-5" />, title: "Push & canlı yayın", desc: "FCM, WebRTC veya HLS; medya sunucusu.", owner: "Ayrı faz" },
  { icon: <Video className="w-5 h-5" />, title: "Tanıtım videoları", desc: "Profesyonel çekim veya AI ses/görüntü — marka onayı.", owner: "Ajans" },
  { icon: <Search className="w-5 h-5" />, title: "SEO", desc: "Core Web Vitals, içerik, yapılandırılmış veri, Search Console.", owner: "Pazarlama + dev" },
  { icon: <Scale className="w-5 h-5" />, title: "Sözleşme seti", desc: "Alıcı, satıcı, platform, KVKK, çerez, ihale şartnamesi.", owner: "Avukat" },
];

export default function OperationalReadiness() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-400 hover:text-white gap-2 mb-6">
          <ArrowLeft className="w-4 h-4" /> Ana sayfa
        </Button>

        <h1 className="text-2xl font-bold text-white mb-2">Canlıya hazırlık — yapılacaklar listesi</h1>
        <p className="text-sm text-slate-400 mb-8">
          Harici yardımcı araçlar veya tek bir önyüz projesi bunları <strong className="text-slate-200">otomatik tamamlamaz</strong>.
          Aşağıdaki satırlar ekip ve bütçe ile yürütülecek gerçek iş kalemleridir. Bu sayfa “yarım kalan” değil, <strong className="text-teal-300">bilinçli sınır</strong> listesidir.
        </p>

        <div className="space-y-3 mb-10">
          {CHECKS.map((c) => (
            <Card key={c.title} className="bg-slate-900/50 border-white/5">
              <CardContent className="p-4 flex gap-4">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">{c.icon}</div>
                <div>
                  <h2 className="text-white font-semibold">{c.title}</h2>
                  <p className="text-sm text-slate-400 mt-1">{c.desc}</p>
                  <p className="text-[11px] text-slate-600 mt-2">Sorumlu: {c.owner}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-5 text-sm text-slate-400">
            <strong className="text-emerald-300">Özet:</strong> “Yapay zeka ajanları her şeyi sürekli kontrol etsin, üçüncü taraf raporu satır satır taklit edelim, banka AI arasın” gibi maddeler
            <strong className="text-white"> ürün kararı + altyapı + hukuk</strong> gerektirir. İstekleri reddetmiyoruz; teknik olarak burada yapılabilecek kısım bu kontrol listesi ve yasal taslak sayfalarıdır.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
