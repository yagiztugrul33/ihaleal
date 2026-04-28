import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Database, Cloud, Server, Shield, Clock,
  Globe, AlertTriangle, FileText, HardDrive,
  Lock, Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoadmapBanner } from "@/components/RoadmapBanner";

export default function DisasterRecovery() {
  const navigate = useNavigate();

  const backupStrategy = [
    {
      rule: "3-2-1 Yedekleme Kuralı",
      desc: "3 kopya, 2 farklı ortam, 1 off-site yedek. Tüm veriler otomatik olarak bu kurala göre çoğaltılır.",
      icon: <Copy className="w-5 h-5" />,
    },
    {
      rule: "Coğrafi Çoğaltma (Geo-Replication)",
      desc: "İstanbul (Anadolu + Avrupa yakası), Frankfurt, Amsterdam ve Londra veri merkezlerinde anlık senkronizasyon.",
      icon: <Globe className="w-5 h-5" />,
    },
    {
      rule: "RPO / RTO Hedefleri",
      desc: "RPO (Recovery Point Objective): Maksimum 5 dakika veri kaybı. RTO (Recovery Time Objective): Maksimum 15 dakika kesinti.",
      icon: <Clock className="w-5 h-5" />,
    },
    {
      rule: "Anlık Snapshot (Point-in-Time)",
      desc: "Her saat başı otomatik disk snapshot'ı. İstenilen an geri dönüş imkanı. 30 gün saklama süresi.",
      icon: <HardDrive className="w-5 h-5" />,
    },
    {
      rule: "Veritabanı Yedekleme",
      desc: "Ana veritabanı: saatte 1 full backup, 5 dakikada 1 incremental. Transaction log'lar anlık stream edilir.",
      icon: <Database className="w-5 h-5" />,
    },
    {
      rule: "CDN & Edge Yedekleme",
      desc: "Cloudflare + AWS CloudFront çift CDN. Edge node'lar birbiriyle senkronize. Dosyalar 6 kıtada cache'lenir.",
      icon: <Cloud className="w-5 h-5" />,
    },
  ];

  const disasterScenarios = [
    {
      scenario: "Sunucu Çökmesi / Donanım Arızası",
      probability: "Düşük",
      impact: "Yüksek",
      plan: "Otomatik failover aktif sunucuya geçiş. Load balancer healty check ile arızalı node'u izole eder. RTO: 2 dk.",
      status: "hazır",
    },
    {
      scenario: "DDoS Saldırısı (>100 Gbps)",
      probability: "Orta",
      impact: "Yüksek",
      plan: "Cloudflare Magic Transit + AWS Shield Advanced. Traffic scrubbing merkezlerine yönlendirme. RTO: Anlık.",
      status: "hazır",
    },
    {
      scenario: "Veritabanı Bozulması / Ransomware",
      probability: "Düşük",
      impact: "Çok Yüksek",
      plan: "Air-gapped yedekler (internete kapalı). Son saatlik snapshot'tan geri dönüş. RPO: 5 dk, RTO: 10 dk.",
      status: "hazır",
    },
    {
      scenario: "Doğal Afet (Deprem / Yangın)",
      probability: "Düşük",
      impact: "Çok Yüksek",
      plan: "Multi-region failover. Frankfurt ve Amsterdam datacenter'larına anlık geçiş. RTO: 15 dk.",
      status: "hazır",
    },
    {
      scenario: "Kaynak Kod Kaybı / Depo Bozulması",
      probability: "Çok Düşük",
      impact: "Çok Yüksek",
      plan: "GitHub Enterprise + GitLab + AWS CodeCommit üçlü mirroring. Her push 3 farklı sağlayıcıya eşlenir.",
      status: "hazır",
    },
    {
      scenario: "İnsan Hatası (Yanlış Deploy / Silme)",
      probability: "Orta",
      impact: "Orta",
      plan: "Blue/Green deploy stratejisi. Her deploy öncesi otomatik snapshot. Tek tıkla rollback. RTO: 3 dk.",
      status: "hazır",
    },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="bg-gradient-to-b from-emerald-500/5 to-transparent border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-400 hover:text-white gap-2 mb-6"><ArrowLeft className="w-4 h-4" /> Geri</Button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center"><Shield className="w-6 h-6 text-white" /></div>
            <div>
              <h1 className="text-3xl font-bold text-white">Felaket Kurtarma Planı</h1>
              <p className="text-slate-400">Süreklilik planı, yedekleme stratejisi ve olası senaryo analizleri</p>
            </div>
          </div>
          <RoadmapBanner />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8 space-y-6">
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25" data-demo="true">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white font-medium">Demo / yol haritası</p>
              <p className="text-sm text-slate-400">
                Aşağıdaki RPO, RTO, 3-2-1 ve çoklu lokasyon metinleri <strong>ürün vizyonu</strong> düzeyindedir; canlı altyapı iddiası değildir. Aktif koruma hedefi (K7):{" "}
                <strong>honeypot + backend rate limit</strong>; planlanan: WAF, DDoS koruması, 2FA.
              </p>
            </div>
          </div>
        </div>

        {/* Yedekleme Stratejisi */}
        <Card className="bg-slate-900/50 border-white/5">
          <CardContent className="p-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4"><Database className="w-5 h-5 text-blue-400" /> Yedekleme Stratejisi</h3>
            <div className="space-y-3">
              {backupStrategy.map((b) => (
                <div key={b.rule} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">{b.icon}</div>
                  <div>
                    <div className="text-sm font-semibold text-white mb-0.5">{b.rule}</div>
                    <p className="text-xs text-slate-400">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Senaryo Analizi */}
        <Card className="bg-slate-900/50 border-white/5">
          <CardContent className="p-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4"><AlertTriangle className="w-5 h-5 text-amber-400" /> Olası Senaryolar ve Kurtarma Planları</h3>
            <div className="space-y-3">
              {disasterScenarios.map((s) => (
                <div key={s.scenario} className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{s.scenario}</span>
                    <Badge className="bg-emerald-500/10 text-emerald-400 text-[10px] border-0">{s.status === "hazır" ? "Kurtarma Hazır" : s.status}</Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="border-blue-500/20 text-blue-400 text-[10px]">Olasılık: {s.probability}</Badge>
                    <Badge variant="outline" className="border-red-500/20 text-red-400 text-[10px]">Etki: {s.impact}</Badge>
                  </div>
                  <p className="text-xs text-slate-400"><span className="text-emerald-400">Plan:</span> {s.plan}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Yedekleme Lokasyonları */}
        <Card className="bg-slate-900/50 border-white/5">
          <CardContent className="p-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4"><Globe className="w-5 h-5 text-sky-400" /> Coğrafi Yedekleme Lokasyonları</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { city: "İstanbul (TR-IST)", role: "Ana Sunucu", status: "Aktif" },
                { city: "Ankara (TR-ANK)", role: "Yedek Sunucu", status: "Standby" },
                { city: "Frankfurt (DE-FRA)", role: "EU Yedek", status: "Standby" },
                { city: "Amsterdam (NL-AMS)", role: "EU Yedek", status: "Standby" },
              ].map((loc) => (
                <div key={loc.city} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                  <Server className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
                  <div className="text-xs font-medium text-white">{loc.city}</div>
                  <div className="text-[10px] text-slate-500">{loc.role}</div>
                  <Badge className={`mt-1.5 text-[10px] border-0 ${loc.status === 'Aktif' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{loc.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Kopya / bot — K7 minimal */}
        <Card className="bg-slate-900/50 border-white/5">
          <CardContent className="p-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4"><Lock className="w-5 h-5 text-violet-400" /> Koruma (K7 — minimal + yol haritası)</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { title: "Honeypot", desc: "Form ve kayıt akışlarında botları ayıklamak için gizli tuzak alanları (backend ile doğrulama)." },
                { title: "API rate limit", desc: "IP ve kullanıcı başına istek sınırları; aşımda yumuşak blok / CAPTCHA (Supabase Edge + WAF planı)." },
                { title: "Medya: sağ tık (sınırlı)", desc: "Yalnızca .protected-media içindeki görüntü/video için isteğe bağlı sağ tık engeli; sayfa geneli engellenmez." },
                { title: "CAPTCHA (plan)", desc: "Yüksek riskli uç noktalarda Turnstile / hCaptcha entegrasyonu (§D onayı sonrası)." },
                { title: "WAF / DDoS (plan)", desc: "Kenar ağda Cloudflare veya eşdeğeri; trafik temizleme ve bot skorları." },
                { title: "2FA (plan)", desc: "Kritik hesap işlemlerinde TOTP veya WebAuthn (K10 SMS ile birlikte değerlendirilecek)." },
              ].map((item) => (
                <div key={item.title} className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="text-sm font-medium text-white mb-1">{item.title}</div>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-center pt-4">
          <Button onClick={() => navigate("/guvenlik")} className="bg-gradient-to-r from-blue-500 to-teal-400 text-white gap-2"><Shield className="w-4 h-4" /> Güvenlik Merkezi</Button>
          <Button onClick={() => navigate("/evraklar")} variant="outline" className="border-white/10 text-slate-300 hover:text-white gap-2"><FileText className="w-4 h-4" /> Evraklar</Button>
        </div>
      </div>
    </div>
  );
}
