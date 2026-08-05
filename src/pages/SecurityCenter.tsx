import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Shield, ShieldCheck, ShieldAlert, Lock, Eye, EyeOff,
  Server, Activity, Zap, Globe, Bell, CheckCircle2,
  XCircle, AlertTriangle, FileText, BarChart3, Cpu, Wifi, ChevronRight,
  RefreshCw, Clock, Award, Bug, Search, MapPin, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoadmapBanner } from "@/components/RoadmapBanner";
import { PLATFORM_FRAMEWORK_PATH } from "@/constants/platformFramework";
import { isProdBuild } from "@/lib/runtimeFlags";

export default function SecurityCenter() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [threats] = useState([
    { id: 1, type: "DDoS", level: "low", status: "blocked", time: "2 dk önce", desc: "Ankara'dan gelen anormal istek trafiği otomatik filtrelendi" },
    { id: 2, type: "SQL Injection", level: "medium", status: "blocked", time: "15 dk önce", desc: "/ilan/:id endpoint'ine denenen enjeksiyon saldırısı WAF tarafından durduruldu" },
    { id: 3, type: "Bot / Scraper", level: "low", status: "mitigated", time: "1 saat önce", desc: "Veri kazıma girişimi rate-limiter ile sınırlandırıldı" },
    { id: 4, type: "Kimlik Avı", level: "high", status: "blocked", time: "3 saat önce", desc: "Sahte giriş sayfası tespiti - kullanıcılar uyarıldı" },
    { id: 5, type: "Brute Force", level: "medium", status: "blocked", time: "5 saat önce", desc: "/giris endpoint'ine çoklu deneme - IP 24 saat banlandı" },
  ]);

  const startScan = () => {
    setScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress((p) => {
        if (p >= 100) { clearInterval(interval); setScanning(false); return 100; }
        return p + 5;
      });
    }, 150);
  };

  useEffect(() => { startScan(); }, []);

  const metrics = [
    { label: "Güvenlik Skoru", value: "98/100", color: "emerald", icon: <ShieldCheck className="w-5 h-5" />, change: "+1.2" },
    { label: "Engellenen Saldırı", value: "12.847", color: "blue", icon: <ShieldAlert className="w-5 h-5" />, change: "Bugün" },
    { label: "Şifreli Bağlantı", value: "%100", color: "violet", icon: <Lock className="w-5 h-5" />, change: "TLS 1.3" },
    { label: "Yanıt Süresi", value: "42ms", color: "amber", icon: <Zap className="w-5 h-5" />, change: "Global CDN" },
  ];

  const layers = [
    { name: "WAF (Web Application Firewall)", status: "active", desc: "Cloudflare + Özel Kural Seti - SQL Injection, XSS, CSRF koruması" },
    { name: "DDoS Koruması", status: "active", desc: "Layer 3/4/7 koruma - 100 Gbps kapasite, otomik mitigasyon" },
    { name: "Rate Limiting", status: "active", desc: "Endpoint bazlı sınırlama - brute force ve scraping önlemi" },
    { name: "Bot Yönetimi", status: "active", desc: "Hedef: davranış + CAPTCHA ile bot sınırlama (yol haritası; canlıda ürün/altyapı onayı gerekir)" },
    { name: "Kimlik Doğrulama", status: "active", desc: "OAuth 2.0 + JWT + 2FA tasarımı — canlı e-Devlet OAuth üretimde ayrı entegrasyon" },
    { name: "Veri Şifreleme", status: "active", desc: "AES-256-GCM + RSA-4096 - Uçtan uca şifreleme" },
    { name: "Güvenlik Duvarı", status: "active", desc: "IP whitelist/blacklist, coğrafi kısıtlama, ASN filtreleme" },
    { name: "Log & Monitoring", status: "active", desc: "SIEM entegrasyonu - gerçek zamanlı analiz ve uyarı" },
  ];

  const regions = [
    { city: "İstanbul", status: "secure", latency: "12ms", threats: 0 },
    { city: "Ankara", status: "secure", latency: "18ms", threats: 1 },
    { city: "İzmir", status: "secure", latency: "22ms", threats: 0 },
    { city: "Frankfurt", status: "secure", latency: "38ms", threats: 0 },
    { city: "Amsterdam", status: "secure", latency: "42ms", threats: 0 },
    { city: "Londra", status: "secure", latency: "45ms", threats: 0 },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="bg-emerald-500/5 border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-500 hover:text-slate-900 gap-2 mb-6"><ArrowLeft className="rtl:rotate-180 w-4 h-4" /> Geri</Button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center"><Shield className="w-6 h-6 text-white" /></div>
            <div>
              <h1 className="text-3xl font-bold text-white">AI Güvenlik & Analiz Merkezi</h1>
              <p className="text-slate-400">Gerçek zamanlı tehdit istihbaratı, sistem koruması ve performans analizi</p>
            </div>
          </div>
          <RoadmapBanner />
          <div className="flex flex-wrap gap-2 mt-6">
            {/* Platform ve Nihai anayasa iç doküman — prod kullanıcı görmez. */}
            {!isProdBuild ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-white/15 text-slate-200 hover:bg-white/5"
                  onClick={() => navigate(PLATFORM_FRAMEWORK_PATH)}
                >
                  <FileText className="w-4 h-4 me-2" />
                  Platform ve KİK özeti
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-white/15 text-slate-200 hover:bg-white/5"
                  onClick={() => navigate("/nihai-anayasa")}
                >
                  <FileText className="w-4 h-4 me-2" />
                  Nihai anayasa
                </Button>
              </>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-rose-500/30 text-rose-100 hover:bg-rose-500/10"
              onClick={() => navigate("/yasal/dolandiricilik-savunmasi")}
            >
              <Shield className="w-4 h-4 me-2" />
              Dolandiricilik / dava savunmasi
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-cyan-500/30 text-cyan-100 hover:bg-cyan-500/10"
              onClick={() => navigate("/yasal/supabase-uyum")}
            >
              <Server className="w-4 h-4 me-2" />
              Supabase RLS / audit / RPC kontrol listesi
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-6">
        {/* Scan Progress */}
        {scanning && (
          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
            <div className="flex items-center gap-3 mb-2"><RefreshCw className="w-4 h-4 text-blue-400 animate-spin" /><span className="text-sm text-blue-400 font-medium">Güvenlik taraması devam ediyor...</span></div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full [background:var(--gradient-cta)] transition-all" style={{ width: `${scanProgress}%` }} /></div>
            <p className="text-xs text-slate-500 mt-1">Honeypot, rate limit ve TLS/sertifika kontrolleri (demo taslak; WAF/2FA yol haritasında)</p>
          </div>
        )}

        <div className="p-4 rounded-xl bg-slate-800/80 border border-amber-500/20">
          <p className="text-xs text-slate-400 leading-relaxed">
            <span className="text-amber-400 font-semibold">Demo uyarısı:</span> Bu sayfadaki tehdit logları, saldırı istatistikleri ve bölge gecikmeleri <strong className="text-slate-200">örnek / simülasyon</strong> amaçlıdır.
            Gerçek sahibinden.com seviyesinde koruma için üretim ortamında WAF, DDoS koruması, SIEM, sızma testi ve 7/24 SOC hizmeti zorunludur.
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {metrics.map((m) => (
            <Card key={m.label} className="bg-slate-900/50 border-slate-200/80">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-lg bg-${m.color}-500/10 ${m.color === 'emerald' ? 'text-emerald-400' : m.color === 'blue' ? 'text-blue-400' : m.color === 'violet' ? 'text-violet-400' : 'text-amber-400'}`}>{m.icon}</div>
                  <Badge variant="outline" className={`border-${m.color}-500/20 ${m.color === 'emerald' ? 'text-emerald-400' : m.color === 'blue' ? 'text-blue-400' : m.color === 'violet' ? 'text-violet-400' : 'text-amber-400'} text-[10px]`}>{m.change}</Badge>
                </div>
                <div className="text-xl font-bold text-white">{m.value}</div>
                <div className="text-xs text-slate-500">{m.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Security Layers */}
        <Card className="bg-slate-900/50 border-slate-200/80">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-400" /> Planlanan güvenlik katmanları (taslak)</h3>
              <Button size="sm" variant="outline" onClick={startScan} disabled={scanning} className="border-slate-200 text-slate-300 hover:text-white gap-2 text-xs"><RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} /> Yenile</Button>
            </div>
            <div className="space-y-2">
              {layers.map((layer, i) => (
                <div key={layer.name} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-slate-200/80 hover:border-emerald-500/20 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2"><span className="text-sm font-medium text-white">{layer.name}</span><Badge className="bg-sky-500/10 text-sky-300 text-[10px] border-0">Hedef</Badge></div>
                    <p className="text-xs text-slate-500 truncate">{layer.desc}</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Threat Log */}
          <Card className="bg-slate-900/50 border-slate-200/80">
            <CardContent className="p-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4"><ShieldAlert className="w-5 h-5 text-red-400" /> Son Tehdit Aktiviteleri</h3>
              <div className="space-y-2">
                {threats.map((t) => (
                  <div key={t.id} className="p-3 rounded-xl bg-white/[0.03] border border-slate-200/80">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{t.type}</span>
                        <Badge className={`text-[10px] border-0 ${t.level === 'high' ? 'bg-red-500/10 text-red-400' : t.level === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{t.level === 'high' ? 'Yüksek' : t.level === 'medium' ? 'Orta' : 'Düşük'}</Badge>
                      </div>
                      <span className="text-xs text-slate-600">{t.time}</span>
                    </div>
                    <p className="text-xs text-slate-400">{t.desc}</p>
                    <div className="flex items-center gap-1 mt-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-400" /><span className="text-[10px] text-emerald-400">{t.status === 'blocked' ? 'Engellendi' : 'Yatıştırıldı'}</span></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Global Node Map */}
          <Card className="bg-slate-900/50 border-slate-200/80">
            <CardContent className="p-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4"><Globe className="w-5 h-5 text-sky-400" /> Global CDN & Sunucu Durumu</h3>
              <div className="space-y-2">
                {regions.map((r) => (
                  <div key={r.city} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-slate-200/80">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-white">{r.city}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-emerald-500/10 text-emerald-400 text-[10px] border-0">Güvenli</Badge>
                      <span className="text-xs text-slate-500">{r.latency}</span>
                      <Activity className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                <div className="flex items-center gap-2 text-xs text-blue-400 mb-1"><Wifi className="w-3.5 h-3.5" /><span>Örnek panel: uptime hedefi (taslak)</span></div>
                <p className="text-xs text-slate-500">Gösterge ve metinler simülasyondur; üretim SLA&apos;sı ayrı sözleşme ile tanımlanır.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ŞU AN AKTİF — Üretimde çalışan korumalar (gerçek, dürüst) */}
        <Card className="bg-emerald-500/[0.04] border-emerald-500/30">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> Şu An Aktif — Üretimde Çalışan Korumalar
              </h3>
              <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-[10px]">
                <CheckCircle2 className="w-3 h-3 me-1" /> AKTİF
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Aşağıdaki korumalar üretim ortamında <strong className="text-emerald-200">canlı çalışıyor</strong> — kod tabanı +
              migration + canlı header doğrulamalı. Yol haritasındaki AI/ML özellikleri ayrı bölümde.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {[
                { title: "Anti-sniping", desc: "Bitmesine 120sn kalan ihalede teklif → süre +120sn uzar. Son saniye baskın engeli.", icon: <Clock className="w-4 h-4 text-emerald-400" /> },
                { title: "Race koruması (FOR UPDATE)", desc: "PostgreSQL row-lock + atomik RPC. İki eşzamanlı teklif sıraya alınır, çakışma yok.", icon: <Lock className="w-4 h-4 text-emerald-400" /> },
                { title: "Idempotency anahtarı", desc: "Aynı teklif iki kez gönderilemez — UNIQUE constraint. Ağ tekrarı güvenli.", icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" /> },
                { title: "Teminat blokajı %5", desc: "Teklif öncesi kredi kartı PROVİZYON (banka blokaj). Sahte teklif maliyeti yüksek.", icon: <Shield className="w-4 h-4 text-emerald-400" /> },
                { title: "Sealed teklif gizliliği", desc: "listing_offers_safe view ile teklif sahibi maskelenmiştir; sealed mode korunur.", icon: <EyeOff className="w-4 h-4 text-emerald-400" /> },
                { title: "7 güvenlik header", desc: "CSP + HSTS + X-Frame-DENY + COOP + Referrer + Permissions + nosniff (canlıda).", icon: <Server className="w-4 h-4 text-emerald-400" /> },
                { title: "JWT zorunlu oturum", desc: "Cookie session yok → CSRF saldırı yüzeyi kapalı. Bearer token + RLS.", icon: <Lock className="w-4 h-4 text-emerald-400" /> },
                { title: "Owner-only RLS", desc: "Her yazma tablosunda user_id = auth.uid() politikası. IDOR engeli.", icon: <ShieldCheck className="w-4 h-4 text-emerald-400" /> },
                { title: "PII sanitize (AI cevap)", desc: "T.C./IBAN/telefon/e-posta otomatik redact. 11/11 test PASS (sanitize katmanı).", icon: <Bug className="w-4 h-4 text-emerald-400" /> },
              ].map((item) => (
                <div key={item.title} className="p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15">
                  <div className="flex items-center gap-2 mb-1.5">
                    {item.icon}
                    <div className="text-sm font-semibold text-white">{item.title}</div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis — YOL HARİTASI (geliştiriliyor; var olmayan özelliği "aktif" gösterme yasak) */}
        <Card className="bg-slate-900/50 border-amber-500/25">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-amber-300" /> AI Tehdit Analizi & Anomali Tespiti
              </h3>
              <Badge className="bg-amber-500/15 text-amber-200 border-amber-500/30 text-[10px]">
                <Clock className="w-3 h-3 me-1" /> YOL HARİTASI · GELİŞTİRİLİYOR
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Aşağıdaki AI/ML katmanları <strong className="text-amber-200">henüz canlıda DEĞİL</strong> — geliştirme yol
              haritasında. Şu an aynı amaca hizmet eden <strong className="text-emerald-200">kural-tabanlı</strong>{" "}
              korumalar üstteki "Aktif" kartında. Var olmayan koruma "aktif" gösterilmez (6502 m.61 dürüstlük).
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                {
                  title: "Davranışsal Analiz (ML)",
                  desc: "Hedef: kullanıcı hareketlerini ML modeli ile analiz eden anormal teklif tespit altyapısı. Şu an aktif: kural-tabanlı race koruması + idempotency.",
                  icon: <Eye className="w-5 h-5 text-amber-300" />,
                },
                {
                  title: "Otomatik Yanıt",
                  desc: "Hedef: tespit edilen tehditlere otomatik CAPTCHA + süreli IP kısıtlama + session sonlandırma. Şu an aktif: Supabase default rate limit (60 req/dk) + JWT iptal.",
                  icon: <Zap className="w-5 h-5 text-amber-300" />,
                },
                {
                  title: "Fiyat Manipülasyon (Shill)",
                  desc: "Hedef: shill bidding + IP/cihaz/MERNIS korelasyonu + graf analizi. Şu an aktif: anti-sniping + %5 teminat blokajı manipülasyon maliyetini yükseltiyor.",
                  icon: <TrendingUp className="w-5 h-5 text-amber-300" />,
                },
              ].map((item) => (
                <div key={item.title} className="p-3 rounded-xl bg-amber-500/[0.04] border border-amber-500/20 relative">
                  <Badge className="absolute top-2 end-2 bg-amber-500/15 text-amber-200 border-amber-500/30 text-[9px]">
                    Yol Haritası
                  </Badge>
                  <div className="mb-2">{item.icon}</div>
                  <div className="text-sm font-semibold text-white mb-1 pe-16">{item.title}</div>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Compliance */}
        <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/10">
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white font-medium mb-1">Hedeflenen uyumluluklar (resmî süreç sonrası)</p>
              <p className="text-xs text-slate-500 mb-2">Aşağıdaki rozetler yol haritası etiketidir; denetim veya lisans teyidi bu demo sitede yer almaz.</p>
              <div className="flex flex-wrap gap-2">
                {["ISO 27001 (hedef)", "PCI-DSS (hedef)", "SOC 2 (hedef)", "KVKK süreçleri (taslak)", "GDPR (hedef)", "BDDK bildirimi (hedef)", "SPK ekspertiz çizgisi (hedef)"].map((cert) => (
                  <Badge key={cert} variant="outline" className="border-violet-500/20 text-violet-400 text-[10px]">{cert}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
