import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Clock, GitCommit, Zap, Shield, BarChart3, FileText,
  Bug, Sparkles, ChevronDown, ChevronUp, Tag, Calendar, User, CheckCircle2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { feeBadgeLabel } from "@/lib/fees";

export default function Changelog() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>("v1.6.0");

  const versions = [
    {
      version: "v1.6.0",
      date: "28 Nisan 2026",
      author: "ihaleal.com AI Agent",
      status: "Yayında",
      highlights: [
        "Tek ürün çizgisi: paralel kod deposu birleştirildi; dokümantasyon ve SQL sırası yalnızca ihaleal.com repo içinde",
        "README / ARCHITECTURE / STATE: manual_push v2→v5 sırası ve Supabase Replication notları senkron",
        "Supabase şema (manual_push_v5): memberships, service_fees, authorizations, commission_records, agent_performance + RLS SELECT",
      ],
      tags: ["infrastructure", "legal"],
    },
    {
      version: "v1.5.0",
      date: "28 Nisan 2026",
      author: "ihaleal.com AI Agent",
      status: "Yayında",
      highlights: [
        "Katılım Evrakları sayfası eklendi (5 kategori, 20+ zorunlu belge)",
        "Güvenlik yüzeyi: honeypot + rate limit yol haritası (K7 minimal); ağır istemci kısıtları kaldırıldı",
        "Hero video arka planı tanıtım videosu ile entegre",
        "SEO optimizasyonu: Open Graph, Twitter Card, Schema.org structured data",
        `Komisyon hesaplayıcı (İlan detay — ${feeBadgeLabel()}, fees.ts)`,
        "Güvenlik doğrulama kartı (Findeks, SMS, Banka API, AML/KYC)",
        "Ekspertiz formu (/ekspertiz) 4 bölümlü kapsamlı yapı",
        "Yasal sayfalar: KVKK, Gizlilik, İhale Koşulları, Çerez Politikası",
        "Vite chunk stratejisi ile 17 ayrı lazy-loaded modül",
      ],
      tags: ["feature", "security", "legal", "performance"],
    },
    {
      version: "v1.4.0",
      date: "27 Nisan 2026",
      author: "ihaleal.com AI Agent",
      status: "Arşiv",
      highlights: [
        "Marka ve ürün adı: yalnızca ihaleal.com olarak sabitlendi",
        "6 demo gayrimenkul ilanı eklendi (İstanbul, Ankara, İzmir, Bodrum)",
        "AI skorları, radar grafikleri, fiyat tahminleri entegre",
        "Yatırım skoru, kira getirisi, bölge endeksleri",
        "Kullanıcı auth sistemi (localStorage tabanlı)",
        "Favori sistemi, son görüntülenenler, paylaş butonu",
        "Mortgage hesaplayıcı, karşılaştırma sayfası",
        "Şehir rehberi, Dashboard, Chat widget",
      ],
      tags: ["feature", "ai", "ux"],
    },
    {
      version: "v1.3.0",
      date: "26 Nisan 2026",
      author: "ihaleal.com AI Agent",
      status: "Arşiv",
      highlights: [
        "Teklif sistemi: 10K / 50K / 100K / 250K / 500K artışlar",
        "Sanal tur entegrasyonu hazırlığı (Matterport desteği)",
        "Google Maps embed konum gösterimi",
        "Rakip analizi: endeksa.com, otobid.com.tr incelendi",
        "Tema switcher (koyu/açık mod)",
        "Arama modal'i, dil seçimi altyapısı",
      ],
      tags: ["feature", "integration"],
    },
    {
      version: "v1.2.0",
      date: "25 Nisan 2026",
      author: "ihaleal.com AI Agent",
      status: "Arşiv",
      highlights: [
        "HashRouter geçişi (static deploy uyumluluğu)",
        "Chunk boyutu sorunu çözüldü (580KB → 17 chunk)",
        "Recharts PieChart/LineChart isim çakışması çözüldü",
        "Circular chunk uyarısı giderildi",
        "Gereksiz dosyalar temizlendi, toast sistemi düzeltildi",
      ],
      tags: ["fix", "performance"],
    },
    {
      version: "v1.1.0",
      date: "24 Nisan 2026",
      author: "ihaleal.com AI Agent",
      status: "Arşiv",
      highlights: [
        "İlk deploy başarılı (siyah ekran sorunu çözüldü)",
        "React 19 + TypeScript + Vite + Tailwind + shadcn/ui stack",
        "40+ shadcn/ui bileşeni kurulumu",
        "Koyu lacivert tema sistemi kuruldu",
      ],
      tags: ["infrastructure", "ui"],
    },
    {
      version: "v1.0.0",
      date: "23 Nisan 2026",
      author: "ihaleal.com AI Agent",
      status: "Arşiv",
      highlights: [
        "Proje başlangıcı: ihaleal.com SPA ve gayrimenkul ihale ürün çizgisi",
        "Gayrimenkul ihale platformu konsepti oluşturuldu",
        "Hero, Auctions, Stats, Features, HowItWorks, Contact bölümleri",
      ],
      tags: ["init"],
    },
  ];

  const tagColors: Record<string, string> = {
    feature: "bg-blue-500/10 text-blue-400",
    security: "bg-emerald-500/10 text-emerald-400",
    legal: "bg-violet-500/10 text-violet-400",
    performance: "bg-amber-500/10 text-amber-400",
    ai: "bg-sky-500/10 text-sky-400",
    ux: "bg-pink-500/10 text-pink-400",
    fix: "bg-red-500/10 text-red-400",
    integration: "bg-teal-500/10 text-teal-400",
    infrastructure: "bg-slate-500/10 text-slate-400",
    ui: "bg-cyan-500/10 text-cyan-400",
    init: "bg-slate-500/10 text-slate-400",
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="bg-gradient-to-b from-blue-500/5 to-transparent border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-400 hover:text-white gap-2 mb-6"><ArrowLeft className="w-4 h-4" /> Geri</Button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center"><GitCommit className="w-6 h-6 text-white" /></div>
            <div>
              <h1 className="text-3xl font-bold text-white">Değişiklik Kayıtları</h1>
              <p className="text-slate-400">ihaleal.com platformunun geliştirme geçmişi ve versiyon takibi</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8 space-y-4">
        {versions.map((v) => (
          <Card key={v.version} className={`bg-slate-900/50 border-white/5 overflow-hidden ${v.status === 'Yayında' ? 'ring-1 ring-emerald-500/20' : ''}`}>
            <button
              onClick={() => setExpanded(expanded === v.version ? null : v.version)}
              className="w-full p-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${v.status === 'Yayında' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
                    {v.version.split('.')[0]}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base font-semibold text-white">{v.version}</span>
                    {v.status === 'Yayında' && <Badge className="bg-emerald-500/10 text-emerald-400 text-[10px] border-0">Yayında</Badge>}
                    <div className="flex gap-1">
                      {v.tags.map((t) => (
                        <Badge key={t} className={`text-[10px] border-0 ${tagColors[t] || tagColors.init}`}>{t}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{v.date}</span>
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{v.author}</span>
                  </div>
                </div>
              </div>
              {expanded === v.version ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
            </button>
            {expanded === v.version && (
              <CardContent className="px-5 pb-5 pt-0">
                <ul className="space-y-2">
                  {v.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      {h}
                    </li>
                  ))}
                </ul>
              </CardContent>
            )}
          </Card>
        ))}

        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-center">
          <p className="text-sm text-slate-400">Tüm değişiklikler otomatik olarak kaydedilir ve versiyonlanır.</p>
          <p className="text-xs text-slate-500 mt-1">Son güncelleme: {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>
    </div>
  );
}
