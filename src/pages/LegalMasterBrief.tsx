import { useNavigate } from "react-router-dom";
import { ArrowLeft, Scale, AlertTriangle, BookMarked, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LEGAL_MASTER_PAGE_DISCLAIMER, LEGAL_MASTER_SECTIONS } from "@/data/legalMasterBrief";
import { PLATFORM_FRAMEWORK_PATH } from "@/constants/platformFramework";

export default function LegalMasterBrief() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="mx-auto max-w-4xl px-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="mb-6 gap-2 text-slate-500 hover:text-slate-900">
          <ArrowLeft className="rtl:rotate-180 h-4 w-4" /> Ana sayfa
        </Button>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-[20px] bg-violet-500/15 p-3 text-violet-400">
              <BookMarked className="h-8 w-8" />
            </div>
            <div>
              <p className="text-xs font-normal uppercase tracking-wide text-violet-400/90">Tapubid · ihaleal.com</p>
              <h1 className="text-2xl font-normal text-white">Hukuki ve operasyonel master plan özeti</h1>
              <p className="mt-1 text-sm text-slate-500">
                Avukatlık hizmeti değildir — tam çalışma metni geliştirici deposunda.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0 justify-end">
            <Button
              variant="outline"
              size="sm"
              className="border-white/15 text-slate-300 hover:bg-white/5"
              onClick={() => navigate("/yasal-cerceve")}
            >
              <Scale className="me-2 h-4 w-4" />
              Yasal çerçeve
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-teal-500/30 text-teal-100 hover:bg-teal-500/10"
              onClick={() => navigate(PLATFORM_FRAMEWORK_PATH)}
            >
              <FileText className="me-2 h-4 w-4" />
              Platform çerçeve özeti
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-rose-500/30 text-rose-100 hover:bg-rose-500/10"
              onClick={() => navigate("/yasal/dolandiricilik-savunmasi")}
            >
              <AlertTriangle className="me-2 h-4 w-4" />
              Dolandiricilik savunmasi
            </Button>
          </div>
        </div>

        <Card className="mb-8 border-amber-500/25 bg-amber-500/10">
          <CardContent className="flex gap-3 p-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
            <p className="text-xs leading-relaxed text-slate-300">{LEGAL_MASTER_PAGE_DISCLAIMER}</p>
          </CardContent>
        </Card>

        <Card className="mb-10 border-slate-200 bg-slate-900/40">
          <CardContent className="space-y-2 p-5 text-sm text-slate-400">
            <p className="font-normal text-slate-200">Tam dokümantasyon (Markdown)</p>
            <ul className="list-inside list-disc space-y-1 text-slate-400">
              <li>
                Ana plan:{" "}
                <code className="rounded-[3px] bg-slate-800 px-1.5 py-0.5 text-xs text-teal-300">docs/hukuk/TAPUBID_IHALLEGAL_MASTER_PLAN.md</code>
              </li>
              <li>
                Sözleşme iskeletleri:{" "}
                <code className="rounded-[3px] bg-slate-800 px-1.5 py-0.5 text-xs text-teal-300">docs/hukuk/EK_SOZLESME_TASLAK_PAKETI.md</code>
              </li>
              <li>
                Yetki/aracılık çerçevesi:{" "}
                <code className="rounded-[3px] bg-slate-800 px-1.5 py-0.5 text-xs text-teal-300">docs/hukuk/YETKI_VE_ARACILIK_TASLAK_CERCEVE.md</code>
              </li>
            </ul>
            <p className="pt-2 text-xs text-slate-600">
              Repo kökünden dosyaları açıp hukuk ekibinize iletin; site üzerindeki özet bilgilendirme amaçlıdır.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {LEGAL_MASTER_SECTIONS.map((s) => (
            <Card key={s.id} className="border-slate-200/80 bg-slate-900/50">
              <CardContent className="space-y-3 p-5">
                <h2 className="text-lg font-normal text-white">{s.title}</h2>
                <div className="space-y-2 text-sm leading-relaxed text-slate-400">
                  {s.body.map((p, i) => (
                    <p key={`${s.id}-p-${i}`}>{p}</p>
                  ))}
                </div>
                {s.bullets?.length ? (
                  <ul className="list-inside list-disc space-y-1.5 text-sm text-slate-500">
                    {s.bullets.map((b, i) => (
                      <li key={`${s.id}-b-${i}`}>{b}</li>
                    ))}
                  </ul>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-10 border-teal-500/20 bg-teal-500/5">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-400">
              <p className="font-normal text-teal-300/90">İlgili ürün sayfaları</p>
              <p className="mt-1 text-xs text-slate-600">Komisyon ve şartlar için kullanıcıya yönelik taslaklar.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" className="bg-white/10 text-white hover:bg-white/15" onClick={() => navigate("/komisyon-modeli")}>
                Komisyon modeli
              </Button>
              <Button size="sm" variant="secondary" className="bg-white/10 text-white hover:bg-white/15" onClick={() => navigate("/ihale-kosullari")}>
                İhale koşulları
              </Button>
              <Button size="sm" variant="secondary" className="bg-white/10 text-white hover:bg-white/15" onClick={() => navigate("/canliya-hazirlik")}>
                Canlıya hazırlık
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="mt-8 flex items-center gap-2 text-center text-xs text-slate-600 sm:text-start">
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          Üretim adresi: ihaleal.com — hukuki metinler yayına alınmadan önce mutlaka yerel avukat onayından geçmelidir.
        </p>
      </div>
    </div>
  );
}
