import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, FileText, BookOpen, Layers, Search, Download, Eye,
  Mail, Scale, Calendar, CheckCircle2, Info, ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LegalDisclaimer, LegalDraftBanner,
} from "@/components/legal/LegalDisclaimer";
import {
  listTemplates, getTemplate, CATEGORY_LABELS, type TemplateCategory,
} from "@/lib/legal/templates";

/** Markdown'ı düz metin olarak indir (örnek için yeterli) */
function downloadTemplate(id: string) {
  const t = getTemplate(id);
  if (!t) return;
  const text = `${t.baslik}\n${"=".repeat(t.baslik.length)}\n\n${t.govde}\n\n---\nKaynak: ihaleal.com/yasal/sablonlar\nUyarı: Bu metin örnek niteliğindedir; avukat onayı şarttır.`;
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${t.id}-ihaleal-sablon.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function LegalTemplatesPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<TemplateCategory | "tum">("tum");
  const [query, setQuery] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);

  const templates = useMemo(() => listTemplates(), []);
  const filtered = useMemo(() => {
    return templates.filter((t) => {
      if (filter !== "tum" && t.kategori !== filter) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          t.baslik.toLowerCase().includes(q) ||
          t.ozet.toLowerCase().includes(q) ||
          t.neZaman.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [templates, filter, query]);

  const previewing = previewId ? getTemplate(previewId) : null;

  if (previewing) {
    return (
      <main className="min-h-screen pt-24 pb-16 px-4 text-white">
        <div className="max-w-4xl mx-auto space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPreviewId(null)}
            className="text-slate-500 hover:text-white gap-2"
          >
            <ChevronLeft className="rtl:rotate-180 w-4 h-4" /> Şablon listesine dön
          </Button>

          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] px-3 py-1 text-xs text-[var(--metin-ikincil)] mb-3">
              <FileText className="h-3.5 w-3.5" /> Şablon Önizleme
            </p>
            <h1 className="text-2xl font-normal flex items-center gap-2">
              <FileText className="h-6 w-6 text-[var(--metin-ikincil)]" />
              {previewing.baslik}
            </h1>
            <p className="mt-1 text-sm text-slate-400">{previewing.ozet}</p>
          </div>

          {/* Meta */}
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-[10px] border border-slate-700 bg-slate-900/40 p-3">
              <p className="text-slate-500 mb-0.5">Kategori</p>
              <p className="text-white font-normal">{CATEGORY_LABELS[previewing.kategori]}</p>
            </div>
            <div className="rounded-[10px] border border-slate-700 bg-slate-900/40 p-3">
              <p className="text-slate-500 mb-0.5">Tahmini süre</p>
              <p className="text-white font-normal">{previewing.sure}</p>
            </div>
            <div className="rounded-[10px] border border-slate-700 bg-slate-900/40 p-3 sm:col-span-2">
              <p className="text-slate-500 mb-0.5">Mevzuat</p>
              <p className="text-[var(--metin-ikincil)] font-mono text-xs">{previewing.mevzuat}</p>
            </div>
          </div>

          {/* Gerekli ekler */}
          {previewing.ekler.length > 0 ? (
            <div className="rounded-[20px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-4">
              <p className="text-xs font-normal text-[var(--metin-ikincil)] mb-2 flex items-center gap-1.5">
                <Info className="h-3 w-3" /> Gerekli Ek Belgeler
              </p>
              <ul className="space-y-1 text-xs text-slate-300">
                {previewing.ekler.map((e, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-[var(--metin-ikincil)] flex-shrink-0" /> {e}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Şablon gövdesi (monospace) */}
          <div className="rounded-[20px] border border-slate-700 bg-slate-950/80 p-5">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <FileText className="h-3 w-3" /> Şablon Gövdesi (örnek)
            </p>
            <pre className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-mono overflow-x-auto">
{previewing.govde}
            </pre>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => downloadTemplate(previewing.id)}
              className="bg-[var(--zemin-yumusak)] hover:bg-[var(--zemin-yumusak)] text-white"
            >
              <Download className="h-4 w-4 me-1.5" />
              .txt olarak indir
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/iletisim")}
              className="border-[var(--cizgi)] text-[var(--metin-ikincil)] hover:bg-[var(--zemin-yumusak)]"
            >
              <Mail className="h-4 w-4 me-1.5" /> Avukat eşleştir (iletişim)
            </Button>
          </div>

          <LegalDisclaimer
            context={`Bu şablon "${previewing.baslik}" için örnek metindir. Tarafların adı, mülk bilgisi, bedel ve süreler somut olaya göre değiştirilmeli; baroya kayıtlı avukat tarafından gözden geçirilmelidir.`}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-slate-500 hover:text-white gap-2"
        >
          <ArrowLeft className="rtl:rotate-180 w-4 h-4" /> Geri
        </Button>

        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] px-3 py-1 text-xs text-[var(--metin-ikincil)] mb-3">
            <Layers className="h-3.5 w-3.5" /> Şablon Kütüphanesi
          </p>
          <h1 className="text-3xl md:text-4xl font-normal flex items-center gap-3">
            <Layers className="h-7 w-7 text-[var(--metin-ikincil)]" />
            Sözleşme + Belge Şablonları
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            İhale katılım, satış vaadi, kaparo, muvafakatname, vekalet, bağış,
            sağlık raporu — gayrimenkul işlemlerinde ihtiyaç duyulan{" "}
            <strong className="text-white">{templates.length} adet</strong>{" "}
            örnek şablon. Avukat onayı şarttır.
          </p>
        </div>

        <LegalDraftBanner />

        {/* KATMAN 1 — Eğitici */}
        <div className="rounded-[20px] border border-[var(--cizgi)] bg-slate-900/40 p-5">
          <div className="flex items-start gap-3 mb-3">
            <BookOpen className="h-5 w-5 text-[var(--metin-ikincil)] flex-shrink-0 mt-0.5" />
            <h2 className="text-base font-normal text-white">Şablon kütüphanesi nedir?</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Türkiye'de gayrimenkul işlemleri için en sık kullanılan sözleşme + belge
            örnek şablonları. Şablonlar <strong className="text-white">avukatla ortak hazırlanmış İSKELET</strong>;
            tarafların adı, mülk bilgisi ve özel koşullar somut olaya göre eklenmeli.
            Yayın öncesi <strong className="text-[var(--metin-ikincil)]">baroya kayıtlı avukat onayı şart</strong>.
          </p>
        </div>

        {/* Arama + filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ara — vekalet, miras, ihale..."
              className="w-full ps-10 pe-3 py-2 rounded-[10px] border border-slate-700 bg-slate-900/60 text-sm placeholder-slate-500 focus:outline-none focus:border-[var(--cizgi)]"
              aria-label="Şablon ara"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CATEGORY_LABELS) as Array<keyof typeof CATEGORY_LABELS>).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(c)}
                className={`px-3 py-2 rounded-[10px] text-xs font-normal border ${filter === c ? "bg-[var(--zemin-yumusak)] border-[var(--cizgi)] text-white" : "border-slate-700 text-slate-300 hover:bg-slate-800"}`}
                aria-pressed={filter === c}
              >
                {CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <Search className="mx-auto mb-2 h-8 w-8 opacity-40" />
            <p>Aradığınız şablon bulunamadı.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((t) => (
              <div
                key={t.id}
                className="rounded-[20px] border border-slate-700 bg-slate-900/40 p-5 flex flex-col"
                data-testid={`template-${t.id}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] px-2 py-0.5 text-[10px] font-normal text-[var(--metin-ikincil)]">
                    {CATEGORY_LABELS[t.kategori]}
                  </span>
                  {t.badge ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] px-2 py-0.5 text-[10px] font-normal text-[var(--metin-ikincil)]">
                      {t.badge}
                    </span>
                  ) : null}
                </div>

                <h3 className="text-base font-normal text-white mb-1">{t.baslik}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">{t.ozet}</p>

                <div className="text-[11px] text-slate-500 space-y-1 mb-3 mt-auto pt-3 border-t border-slate-700">
                  <p className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {t.sure}
                  </p>
                  <p className="flex items-start gap-1 italic">
                    <Info className="h-3 w-3 flex-shrink-0 mt-0.5" />
                    {t.neZaman}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => setPreviewId(t.id)}
                    className="flex-1 bg-[var(--zemin-yumusak)] hover:bg-[var(--zemin-yumusak)] text-white"
                  >
                    <Eye className="h-3.5 w-3.5 me-1" /> Önizle
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadTemplate(t.id)}
                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Avukat eşleştirme CTA */}
        <div className="mt-6 rounded-[20px] border border-[var(--cizgi)] bg-[var(--zemin-yumusak)] p-5 text-center">
          <Scale className="h-6 w-6 text-[var(--metin-ikincil)] mx-auto mb-2" />
          <h3 className="text-base font-normal text-white mb-1">Avukat onayı + özel hazırlık</h3>
          <p className="text-xs text-slate-300 mb-4 max-w-2xl mx-auto">
            Şablonlar başlangıç noktasıdır. Sözleşme imzasından önce baroya kayıtlı bir
            avukatın somut olaya göre uyarlaması zorunludur. Avukat eşleştirme + danışmanlık
            için iletişime geçin.
          </p>
          <Button
            onClick={() => navigate("/iletisim")}
            className="bg-[var(--zemin-yumusak)] hover:bg-[var(--zemin-yumusak)] text-white"
          >
            <Mail className="h-4 w-4 me-1.5" /> İletişime Geç
          </Button>
        </div>

        <LegalDisclaimer
          context="Şablon kütüphanesindeki tüm metinler eğitici örnek niteliğindedir. Yasal yayın öncesi avukat onayı + noter düzenlemesi gerektiğinde resmi şekil zorunludur."
        />
      </div>
    </main>
  );
}
