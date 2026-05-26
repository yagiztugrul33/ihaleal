import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Database, FileText, Scale, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LegalMarkdownRenderer } from "@/components/legal/LegalMarkdownRenderer";
import checklistMd from "../../../docs/hukuk/SUPABASE_RLS_AUDIT_RPC_UYUM_KONTROL_LISTESI.md?raw";

function extractTitle(md: string): string {
  const line = md.split(/\r?\n/).find((l) => l.startsWith("# "));
  return line ? line.replace(/^#\s+/, "").trim() : "Supabase uyum kontrol listesi";
}

export default function SupabaseComplianceChecklistPage() {
  const navigate = useNavigate();
  const title = useMemo(() => extractTitle(checklistMd), []);

  return (
    <div className="min-h-screen pt-20 pb-20 px-4">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(45,212,191,0.12),transparent_55%)]" />
      <div className="mx-auto max-w-4xl space-y-8">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-slate-500 hover:text-slate-900 gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Geri
        </Button>

        <div className="relative overflow-hidden rounded-3xl border border-teal-500/20 bg-gradient-to-br from-white/90 via-slate-950/95 to-slate-900/90 p-6 sm:p-8 shadow-2xl shadow-teal-950/30">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-teal-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-teal-400/90">
                Teknik uyum ve denetim izi
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-400">
                Bu sayfa, repodaki Supabase migration dosyalarındaki RLS politika adları, audit tablosu ve RPC
                isimleriyle eşleşen kontrol listesini okunur biçimde sunar. Bağlayıcı hukuki görüş değildir;
                üretim öncesi avukat ve güvenlik gözden geçirmesi gereklidir.
              </p>
            </div>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/25">
              <Database className="h-7 w-7 text-white" />
            </div>
          </div>
          <div className="relative mt-6 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-white/15 text-slate-200 hover:bg-white/5"
              onClick={() => navigate("/guvenlik")}
            >
              <Shield className="mr-1 h-4 w-4" /> Güvenlik merkezi
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-white/15 text-slate-200 hover:bg-white/5"
              onClick={() => navigate("/yasal/dolandiricilik-savunmasi")}
            >
              <Scale className="mr-1 h-4 w-4" /> Dolandırıcılık mimarisi
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-white/15 text-slate-200 hover:bg-white/5"
              onClick={() => navigate("/kvkk")}
            >
              <FileText className="mr-1 h-4 w-4" /> KVKK
            </Button>
          </div>
        </div>

        <Card className="border-amber-500/25 bg-amber-500/5">
          <CardContent className="p-4 text-xs leading-relaxed text-slate-300">
            <strong className="text-amber-200">Bilgilendirme:</strong> Liste, kod tabanındaki isimlerle senkron
            tutulmalıdır. Migration değiştiğinde bu Markdown dosyası ve uygulama davranışı birlikte gözden
            geçirilmelidir. Şüpheli işlem RPC adları taslaktır; veritabanında karşılığı yoksa uygulanmış sayılmaz.
          </CardContent>
        </Card>

        <div className="grid gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
            <p className="font-semibold text-slate-100">Nedir?</p>
            <p className="mt-1">RLS, RPC ve audit zincirinin tek listede denetlenmesini sağlayan uyum panelidir.</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
            <p className="font-semibold text-slate-100">Neden?</p>
            <p className="mt-1">Kodda görünen güvenlik iddialarını ölçülebilir checklist adımlarına çevirir.</p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
            <p className="font-semibold text-slate-100">Kime göre</p>
            <p className="mt-1">Backend, güvenlik, hukuk ve denetim ekiplerinin aynı sözlükte çalışmasını sağlar.</p>
          </article>
        </div>

        <Card className="border-slate-200/80 bg-slate-900/50">
          <CardContent className="p-5 text-sm text-slate-300 space-y-2">
            <h3 className="text-base font-semibold text-white">Dürüst sınır</h3>
            <p>
              Bu checklist teknik kanıt görünürlüğü sağlar; bağımsız sızma testi, sertifikasyon veya bağlayıcı hukuk görüşü yerine geçmez.
              Canlıya geçişte avukat ve güvenlik sorumlusu birlikte imza süreci yürütmelidir.
            </p>
            <p>
              CTA: Migration değişikliği yapıldığında aynı gün checklist güncellemesi ve test çıktısı zorunlu tutulmalıdır.
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-slate-900/50">
          <CardContent className="p-5 text-sm text-slate-300">
            <h3 className="text-base font-semibold text-white mb-2">Ek operasyon adımı</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Her güvenlik migration’ı sonrası politika kontrat testleri yeniden çalıştırılır.</li>
              <li>RLS kapsam dışı tablo kalırsa risk kaydı açılır ve sorumlu atanır.</li>
              <li>Audit log rotasyonu ve saklama süresi hukuk/güvenlik ortak kararıyla güncellenir.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/25 bg-emerald-500/10">
          <CardContent className="p-5 text-sm text-slate-200">
            <h3 className="text-base font-semibold text-emerald-100 mb-2">CTA</h3>
            <p>
              Her release öncesi bu checklisti test çıktılarıyla birlikte güncelleyin ve hukuk/güvenlik onayını release notuna ekleyin.
            </p>
          </CardContent>
        </Card>

        <LegalMarkdownRenderer markdown={checklistMd} className="animate-fade-in pb-8" />
      </div>
    </div>
  );
}
