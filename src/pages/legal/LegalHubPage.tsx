import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Scale, Shield, FileText, Cookie, Gavel, ScrollText, RefreshCw, Mail,
  Search, BookOpen, AlertTriangle, ExternalLink, Layers, Building2, Lock,
} from "lucide-react";
import { LegalDisclaimer, LegalDraftBanner } from "@/components/legal/LegalDisclaimer";

type Category = "tum" | "uyum" | "uyelik" | "ihale" | "veri" | "rehber";

interface LegalDoc {
  path: string;
  title: string;
  short: string;
  icon: React.ComponentType<{ className?: string }>;
  category: Exclude<Category, "tum">;
  tone: "blue" | "emerald" | "violet" | "amber" | "rose" | "cyan";
  required?: boolean;
  badge?: string;
  /** Hangi yasal düzenlemeye dayanır (etiket) */
  kanun?: string;
}

const DOCS: LegalDoc[] = [
  // UYUM (KVKK + KKVK + Çerez)
  {
    path: "/kvkk",
    title: "KVKK Aydınlatma Metni",
    short: "6698 sayılı kanun kapsamında kişisel veri işleme bilgilendirmesi (8 madde).",
    icon: Shield,
    category: "uyum",
    tone: "blue",
    required: true,
    kanun: "6698 KVKK",
  },
  {
    path: "/aydinlatma-metni",
    title: "Aydınlatma Metni (Kısa)",
    short: "KVKK 10. madde — veri sorumlusu + işleme amacı özet.",
    icon: FileText,
    category: "uyum",
    tone: "blue",
    kanun: "6698 KVKK m. 10",
  },
  {
    path: "/gizlilik",
    title: "Gizlilik Politikası",
    short: "Hangi verileri topluyoruz, nasıl saklıyoruz, nereye iletiyoruz.",
    icon: Lock,
    category: "uyum",
    tone: "blue",
    required: true,
  },
  {
    path: "/cerez-politikasi",
    title: "Çerez (Cookie) Politikası",
    short: "Zorunlu/Analitik/Tercih çerezleri + tarayıcı yönetimi.",
    icon: Cookie,
    category: "uyum",
    tone: "amber",
  },

  // ÜYELIK (TKHK + BK + sözleşme)
  {
    path: "/kullanim-kosullari",
    title: "Kullanım Koşulları",
    short: "Platform kullanım hak ve yükümlülükleri (9 madde).",
    icon: ScrollText,
    category: "uyelik",
    tone: "emerald",
    required: true,
  },
  {
    path: "/mesafeli-satis-sozlesmesi",
    title: "Mesafeli Satış / Üyelik Sözleşmesi",
    short: "TKHK 48. madde — abonelik, cayma, fesih, ödeme koşulları.",
    icon: FileText,
    category: "uyelik",
    tone: "emerald",
    required: true,
    kanun: "TKHK 6502 m. 48",
  },
  {
    path: "/iade-iptal",
    title: "İade ve İptal Koşulları",
    short: "14 gün cayma + abonelik iptali + iade yöntemleri.",
    icon: RefreshCw,
    category: "uyelik",
    tone: "emerald",
    kanun: "TKHK 6502",
  },

  // İHALE
  {
    path: "/ihale-kosullari",
    title: "İhale Katılım Kuralları",
    short: "Teminat, anti-snipe, blokaj, kazanan yükümlülükleri.",
    icon: Gavel,
    category: "ihale",
    tone: "violet",
    required: true,
    badge: "İhale öncesi okuyun",
  },
  {
    path: "/evraklar",
    title: "Katılım Evrakları",
    short: "İhaleye katılmak için gereken kimlik/tapu/banka belgeleri.",
    icon: FileText,
    category: "ihale",
    tone: "violet",
  },

  // REHBER
  {
    path: "/yasal/sablonlar",
    title: "Sözleşme + Belge Şablonları",
    short: "İhale katılım, satış vaadi, muvafakat, vekalet — örnek şablon kütüphanesi.",
    icon: Layers,
    category: "rehber",
    tone: "cyan",
    badge: "Yeni",
  },
  {
    path: "/arastirma/hukuki-cozucu",
    title: "Hukuki Senaryo Çözücü",
    short: "Para baba veriyor tapu oğula? 10 senaryo + risk + vergi + güvenli yol.",
    icon: BookOpen,
    category: "rehber",
    tone: "cyan",
    badge: "Yeni",
  },
  {
    path: "/yasal-cerceve",
    title: "Yasal Çerçeve (Genel)",
    short: "Platform doktrini, sorumluluk sınırları, mevzuat haritası.",
    icon: Building2,
    category: "rehber",
    tone: "slate" as any,
  },
];

const CATEGORY_LABELS: Record<Category, string> = {
  tum: "Tümü",
  uyum: "Veri & KVKK",
  uyelik: "Üyelik & Sözleşme",
  ihale: "İhale Katılımı",
  veri: "Veri",
  rehber: "Eğitici Rehber",
};

function toneClasses(tone: LegalDoc["tone"] | "slate") {
  const map: Record<string, { border: string; bg: string; icon: string; pill: string }> = {
    blue: { border: "border-blue-500/30", bg: "from-blue-500/5", icon: "text-blue-300", pill: "bg-blue-500/20 text-blue-200 border-blue-500/40" },
    emerald: { border: "border-emerald-500/30", bg: "from-emerald-500/5", icon: "text-emerald-300", pill: "bg-emerald-500/20 text-emerald-200 border-emerald-500/40" },
    violet: { border: "border-violet-500/30", bg: "from-violet-500/5", icon: "text-violet-300", pill: "bg-violet-500/20 text-violet-200 border-violet-500/40" },
    amber: { border: "border-amber-500/30", bg: "from-amber-500/5", icon: "text-amber-300", pill: "bg-amber-500/20 text-amber-200 border-amber-500/40" },
    rose: { border: "border-rose-500/30", bg: "from-rose-500/5", icon: "text-rose-300", pill: "bg-rose-500/20 text-rose-200 border-rose-500/40" },
    cyan: { border: "border-cyan-500/30", bg: "from-cyan-500/5", icon: "text-cyan-300", pill: "bg-cyan-500/20 text-cyan-200 border-cyan-500/40" },
    slate: { border: "border-slate-700", bg: "from-slate-800/5", icon: "text-slate-300", pill: "bg-slate-700/40 text-slate-200 border-slate-700" },
  };
  return map[tone] ?? map.slate;
}

export default function LegalHubPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Category>("tum");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return DOCS.filter((d) => {
      if (filter !== "tum" && d.category !== filter) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          d.title.toLowerCase().includes(q) ||
          d.short.toLowerCase().includes(q) ||
          d.kanun?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [filter, query]);

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 text-white">
      <section className="max-w-6xl mx-auto space-y-6">
        {/* HEADER */}
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-200 mb-3">
            <Scale className="h-3.5 w-3.5" /> Yasal & Hukuki Altyapı
          </p>
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <Scale className="h-8 w-8 text-violet-400" />
            Yasal Metinler & Rehberler
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            Platform doktrini, KVKK uyum metinleri, üyelik+ödeme sözleşmeleri, ihale katılım kuralları
            ve eğitici hukuki rehberler — hepsi tek sayfada.
          </p>
        </div>

        {/* DRAFT BANNER */}
        <LegalDraftBanner />

        {/* SEARCH + FILTER */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ara — KVKK, cayma, teminat..."
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-700 bg-slate-900/60 text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500"
              aria-label="Yasal metin ara"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CATEGORY_LABELS).filter((c) => c !== "veri") as Category[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(c)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border ${filter === c ? "bg-violet-600 border-violet-500 text-white" : "border-slate-700 text-slate-300 hover:bg-slate-800"}`}
                aria-pressed={filter === c}
              >
                {CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
        </div>

        {/* GRID */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <Search className="mx-auto mb-2 h-8 w-8 opacity-40" />
            <p>Aradığınız metin bulunamadı.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((doc) => {
              const Icon = doc.icon;
              const cls = toneClasses(doc.tone);
              return (
                <button
                  key={doc.path}
                  type="button"
                  onClick={() => navigate(doc.path)}
                  className={`text-left rounded-2xl border ${cls.border} bg-gradient-to-br ${cls.bg} to-slate-900/60 p-5 hover:bg-slate-900/80 transition-colors flex flex-col h-full`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`rounded-lg bg-slate-800/60 p-2 ${cls.icon}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      {doc.required ? (
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cls.pill}`}>
                          Zorunlu
                        </span>
                      ) : null}
                      {doc.badge ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-100">
                          {doc.badge}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-white mb-1.5">{doc.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">{doc.short}</p>

                  {doc.kanun ? (
                    <div className="mt-auto pt-2 border-t border-slate-700/60">
                      <span className="inline-flex items-center gap-1 text-[10px] text-violet-300">
                        <Scale className="h-2.5 w-2.5" /> {doc.kanun}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-auto pt-2 border-t border-slate-700/60">
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                        Görüntüle <ExternalLink className="h-2.5 w-2.5" />
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* MEVZUAT ŞERIDI */}
        <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
          <h2 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <Scale className="h-4 w-4 text-violet-400" /> Mevzuat Haritası — Referans Kanunlar
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="rounded-lg border border-slate-700 bg-slate-900/30 p-3">
              <p className="font-semibold text-blue-300 mb-1">Veri & Mahremiyet</p>
              <ul className="text-slate-300 space-y-0.5">
                <li>• 6698 KVKK — Kişisel Verilerin Korunması</li>
                <li>• 5651 — İnternet Ortamı (log)</li>
                <li>• KVKK Kurulu yönetmelikleri</li>
              </ul>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/30 p-3">
              <p className="font-semibold text-emerald-300 mb-1">Tüketici & Sözleşme</p>
              <ul className="text-slate-300 space-y-0.5">
                <li>• 6502 TKHK — Tüketicinin Korunması</li>
                <li>• 6098 TBK — Türk Borçlar Kanunu</li>
                <li>• 4077 (mülga) yerine 6502</li>
              </ul>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/30 p-3">
              <p className="font-semibold text-violet-300 mb-1">Mülkiyet & Tapu</p>
              <ul className="text-slate-300 space-y-0.5">
                <li>• 4721 TMK — Türk Medeni Kanunu</li>
                <li>• 3402 — Kadastro Kanunu</li>
                <li>• 2644 — Tapu Kanunu</li>
              </ul>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/30 p-3">
              <p className="font-semibold text-amber-300 mb-1">İmar & Yapı</p>
              <ul className="text-slate-300 space-y-0.5">
                <li>• 3194 — İmar Kanunu</li>
                <li>• 6306 — Kentsel Dönüşüm</li>
                <li>• TBDY-2018 (deprem yönetmeliği)</li>
              </ul>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/30 p-3">
              <p className="font-semibold text-cyan-300 mb-1">Ödeme & Mali</p>
              <ul className="text-slate-300 space-y-0.5">
                <li>• 6493 — Ödeme Hizmetleri</li>
                <li>• 5549 — MASAK</li>
                <li>• 213 VUK — Vergi Usul Kanunu</li>
                <li>• 7338 — Veraset ve İntikal Vergisi</li>
              </ul>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900/30 p-3">
              <p className="font-semibold text-rose-300 mb-1">Yargı & İhale</p>
              <ul className="text-slate-300 space-y-0.5">
                <li>• 6100 HMK — Hukuk Muhakemeleri</li>
                <li>• 1136 — Avukatlık Kanunu</li>
                <li>• 2004 — İcra İflas Kanunu</li>
              </ul>
            </div>
          </div>
        </div>

        {/* DISCLAIMER */}
        <LegalDisclaimer
          context="Bu sayfa platform yasal envanteridir. İlgili kanun maddeleri bağlamsız listelenmiştir — somut olayda bilirkişi/avukat yorumu zorunlu."
        />

        {/* İLETİŞİM */}
        <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4 flex items-start gap-3">
          <Mail className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-slate-200 mb-1">Yasal İletişim</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              KVKK başvuruları:{" "}
              <a href="mailto:kvkk@ihaleal.com" className="text-cyan-300 underline">kvkk@ihaleal.com</a>
              {" · "}Hukuki iletişim:{" "}
              <a href="mailto:hukuk@ihaleal.com" className="text-cyan-300 underline">hukuk@ihaleal.com</a>
              {" · "}Güvenlik olay:{" "}
              <a href="mailto:guvenlik@ihaleal.com" className="text-cyan-300 underline">guvenlik@ihaleal.com</a>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
