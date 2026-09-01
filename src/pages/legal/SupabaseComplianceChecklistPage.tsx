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
          <ArrowLeft className="rtl:rotate-180 h-4 w-4" /> Geri
        </Button>

        <div className="relative overflow-hidden rounded-[20px] border border-[var(--cizgi)] bg-gradient-to-br from-white/90 via-slate-950/95 to-slate-900/90 p-6 sm:p-8 shadow-2xl shadow-teal-950/30">
          <div className="pointer-events-none absolute -end-16 -top-16 h-48 w-48 rounded-full bg-[var(--zemin-yumusak)] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -start-10 h-56 w-56 rounded-full bg-[var(--zemin-yumusak)] blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-normal uppercase tracking-[0.2em] text-[var(--metin-ikincil)]">
                Teknik uyum ve denetim izi
              </p>
              <h1 className="text-2xl font-normal tracking-tight text-white sm:text-3xl">{title}</h1>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-400">
                Bu sayfa, repodaki Supabase migration dosyalarındaki RLS politika adları, audit tablosu ve RPC
                isimleriyle eşleşen kontrol listesini okunur biçimde sunar. Bağlayıcı hukuki görüş değildir;
                üretim öncesi avukat ve güvenlik gözden geçirmesi gereklidir.
              </p>
            </div>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br from-[var(--zemin-yumusak)] to-[var(--zemin-yumusak)] shadow-lg shadow-teal-500/25">
              <Database className="h-7 w-7 text-white" />
            </div>
          </div>
          <div className="relative mt-6 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-white/15 text-slate-200 hover:bg-white/5"
              onClick={() => navigate("/güvenlik")}
            >
              <Shield className="me-1 h-4 w-4" /> Güvenlik merkezi
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-white/15 text-slate-200 hover:bg-white/5"
              onClick={() => navigate("/yasal/dolandiricilik-savunmasi")}
            >
              <Scale className="me-1 h-4 w-4" /> Dolandırıcılık mimarisi
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-white/15 text-slate-200 hover:bg-white/5"
              onClick={() => navigate("/kvkk")}
            >
              <FileText className="me-1 h-4 w-4" /> KVKK
            </Button>
          </div>
        </div>

        <Card className="border-[var(--cizgi)] bg-[var(--zemin-yumusak)]">
          <CardContent className="p-4 text-xs leading-relaxed text-slate-300">
            <strong className="text-[var(--metin-ikincil)]">Bilgilendirme:</strong> Liste, kod tabanındaki isimlerle senkron
            tutulmalıdır. Migration değiştiğinde bu Markdown dosyası ve uygulama davranışı birlikte gözden
            geçirilmelidir. Şüpheli işlem RPC adları taslaktır; veritabanında karşılığı yoksa uygulanmış sayılmaz.
          </CardContent>
        </Card>

        <LegalMarkdownRenderer markdown={checklistMd} className="animate-fade-in pb-8" />
      </div>
    </div>
  );
}
