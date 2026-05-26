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
  { icon: <Database className="w-5 h-5" />, title: "Veri lisansı", desc: "İhaleal Endeksi, bölge fiyatı ve harici ilan analizi — kaynak ve KVKK.", owner: "Hukuk + veri satıcısı" },
  { icon: <Clock className="w-5 h-5" />, title: "Cron / ETL", desc: "Saatlik veya dakikalık güncelleme; maliyet ve SLA.", owner: "Backend" },
  { icon: <Link2 className="w-5 h-5" />, title: "e-Devlet & Findeks", desc: "Resmi entegrasyon sözleşmeleri ve test ortamları.", owner: "Kurum + hukuk" },
  { icon: <Smartphone className="w-5 h-5" />, title: "SMS / OTP", desc: "İleti yönetimi, izinli gönderim, log saklama.", owner: "Telekom anlaşması" },
  { icon: <Radio className="w-5 h-5" />, title: "Push & canlı yayın", desc: "FCM, WebRTC veya HLS; medya sunucusu.", owner: "Ayrı faz" },
  { icon: <Video className="w-5 h-5" />, title: "Tanıtım videoları", desc: "Profesyonel çekim veya AI ses/görüntü — marka onayı.", owner: "Ajans" },
  { icon: <Search className="w-5 h-5" />, title: "SEO", desc: "Core Web Vitals, içerik, yapılandırılmış veri, Search Console.", owner: "Pazarlama + dev" },
  { icon: <Scale className="w-5 h-5" />, title: "Sözleşme seti", desc: "Alıcı, satıcı, platform, KVKK, çerez, ihale şartnamesi.", owner: "Avukat" },
];

const TRUST_LAUNCH_GATES = [
  "Escrow / blokaj akisinda mutabakat senaryolari test edildi mi?",
  "KYC/AML supheli islem akislarinda manuel inceleme adimlari tanimli mi?",
  "Ekspertiz ve evrak sureclerinde zorunlu alanlar tum rollerde ayni mi?",
  "Sozlesme setleri (alici/satici/emlakci) hukuk tarafindan son surum onayi aldi mi?",
  "Incident response: ihlal durumunda 24 saat icinde aksiyon sahipligi net mi?",
];

export default function OperationalReadiness() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-500 hover:text-slate-900 gap-2 mb-6">
          <ArrowLeft className="w-4 h-4" /> Ana sayfa
        </Button>

        <h1 className="text-2xl font-bold text-white mb-2">Canlıya hazırlık — yapılacaklar listesi</h1>
        <p className="text-sm text-slate-400 mb-8">
          Harici yardımcı araçlar veya tek bir önyüz projesi bunları <strong className="text-slate-200">otomatik tamamlamaz</strong>.
          Aşağıdaki satırlar ekip ve bütçe ile yürütülecek gerçek iş kalemleridir. Bu sayfa “yarım kalan” değil, <strong className="text-teal-300">bilinçli sınır</strong> listesidir.
        </p>

        <div className="space-y-3 mb-10">
          {CHECKS.map((c) => (
            <Card key={c.title} className="bg-slate-900/50 border-slate-200/80">
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

        <Card className="bg-slate-900/50 border-slate-200/80 mb-8">
          <CardContent className="p-5">
            <h2 className="text-lg font-semibold text-white mb-3">Guvenlik ve hukuk canliya gecis kapilari</h2>
            <ul className="space-y-2 text-sm text-slate-400 list-disc list-inside">
              {TRUST_LAUNCH_GATES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-5 text-sm text-slate-400">
            <strong className="text-emerald-300">Özet:</strong> “Yapay zeka ajanları her şeyi sürekli kontrol etsin, üçüncü taraf raporu satır satır taklit edelim, banka AI arasın” gibi maddeler
            <strong className="text-white"> ürün kararı + altyapı + hukuk</strong> gerektirir. İstekleri reddetmiyoruz; teknik olarak burada yapılabilecek kısım bu kontrol listesi ve yasal taslak sayfalarıdır.
          </CardContent>
        </Card>

        <Card className="mt-6 bg-slate-900/50 border-slate-200/80">
          <CardContent className="p-5">
            <h2 className="text-lg font-semibold text-white mb-3">Yöntem (açıklamalı) - canlıya geçiş sırası</h2>
            <ol className="space-y-2 text-sm text-slate-400 list-decimal list-inside">
              <li><strong className="text-slate-200">Kritik çekirdek doğrulama:</strong> ödeme, escrow, KYC ve erişim politikaları için regresyon testi.</li>
              <li><strong className="text-slate-200">Hukuk metin kilidi:</strong> KVKK, gizlilik, mesafeli satış ve sözleşme setlerinde avukat onaylı sürüm numarası.</li>
              <li><strong className="text-slate-200">Operasyon runbook:</strong> incident, fraud alarmı, belge eksikliği ve işlem uyuşmazlığı için görev sahibi ataması.</li>
              <li><strong className="text-slate-200">SLA + izleme:</strong> log, alarm ve cevap sürelerinin ölçümü; haftalık güvenlik raporlaması.</li>
            </ol>
          </CardContent>
        </Card>

        <Card className="mt-6 bg-slate-900/50 border-slate-200/80">
          <CardContent className="p-5">
            <h2 className="text-lg font-semibold text-white mb-3">Örnek canlı senaryo</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Kapanışa 6 saat kala şüpheli teklif dalgası tespit edildiğinde sistem otomatik alarm üretir; operasyon ekibi hesabı kısıtlar,
              hukuk ekibi sözleşme ihlal maddesini işletir, güvenlik ekibi log delillerini saklar ve kullanıcıya şeffaf durum bildirimi gönderir.
              Bu akışın tüm adımları tek bir olay kaydında timestamp ile izlenmelidir.
            </p>
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <article className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-4">
            <h3 className="text-sm font-semibold text-cyan-100">Kime göre</h3>
            <p className="mt-2 text-xs text-slate-200">
              Ürün ve yazılım ekipleri için teknik kapanış listesi; hukuk ve uyum ekipleri için sözleşme/KVKK kapanış listesi;
              operasyon ekipleri için olay yönetimi playbook’u.
            </p>
          </article>
          <article className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <h3 className="text-sm font-semibold text-amber-100">Dürüst sınır</h3>
            <p className="mt-2 text-xs text-slate-200">
              Bu sayfa bir canlıya çıkış planıdır; resmi hukuk görüşü veya bağımsız güvenlik sertifikası yerine geçmez.
              Nihai onay, kurum avukatı ve güvenlik sorumlusu imzasıyla tamamlanır.
            </p>
          </article>
        </div>

        <Card className="mt-6 bg-blue-500/10 border-blue-500/25">
          <CardContent className="p-5">
            <h3 className="text-base font-semibold text-blue-100 mb-2">CTA - yayına çıkmadan son adım</h3>
            <p className="text-sm text-slate-200">
              Kontrol listesini ekip bazında işaretleyin, açık maddeleri sahipli olarak kapatın ve yalnızca
              avukat + güvenlik + operasyon ortak onayı sonrası üretim geçişini başlatın.
            </p>
          </CardContent>
        </Card>

        <Card className="mt-6 bg-slate-900/50 border-slate-200/80">
          <CardContent className="p-5">
            <h3 className="text-base font-semibold text-white mb-2">Ek kontrol başlıkları</h3>
            <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
              <li>Üretim alarm eşikleri ve kritik olay bildirim kanalları test edildi.</li>
              <li>Yedekleme, geri yükleme ve felaket kurtarma tatbikatı tamamlandı.</li>
              <li>Hukuk metin sürümleri ve uygulama linkleri birebir eşitlendi.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
