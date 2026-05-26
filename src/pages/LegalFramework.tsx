import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Scale, AlertTriangle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LEGAL_SECTIONS, LEGAL_DISCLAIMER } from "@/data/legalFramework";
import { PLATFORM_CONSISTENCY_RULES } from "@/data/platformConsistencyRules";
import { PLATFORM_FRAMEWORK_PATH } from "@/constants/platformFramework";

export default function LegalFramework() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(LEGAL_SECTIONS[0].id);

  const section = LEGAL_SECTIONS.find((s) => s.id === tab) ?? LEGAL_SECTIONS[0];

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-500 hover:text-slate-900 gap-2 mb-6">
          <ArrowLeft className="w-4 h-4" /> Ana sayfa
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400">
            <Scale className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Yasal çerçeve çalışma taslağı</h1>
            <p className="text-sm text-slate-500">Otobid benzeri ihale şartnamesi başlıkları + TBK / İİK / KVKK hatırlatıcıları</p>
          </div>
        </div>

        <Card className="bg-amber-500/10 border-amber-500/25 mb-8">
          <CardContent className="p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-xs text-slate-300 leading-relaxed">{LEGAL_DISCLAIMER}</p>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="border-white/15 bg-white/[0.06] text-white hover:bg-white/10"
            onClick={() => navigate(PLATFORM_FRAMEWORK_PATH)}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Platform + KİK hatırlatıcıları (birleşik liste)
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-slate-200 text-slate-300"
            onClick={() => navigate("/nihai-anayasa")}
          >
            Nihai sistem anayasası
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {LEGAL_SECTIONS.map((s) => (
            <Button
              key={s.id}
              size="sm"
              variant={tab === s.id ? "default" : "outline"}
              className={tab === s.id ? "bg-violet-600 text-white" : "border-slate-200 text-slate-300"}
              onClick={() => setTab(s.id)}
            >
              {s.title}
            </Button>
          ))}
        </div>

        <Card className="bg-slate-900/50 border-slate-200/80">
          <CardContent className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-blue-400" />
                İlgili mevzuat başlıkları
              </h2>
              <div className="space-y-2">
                {section.laws.map((l) => (
                  <div key={l.code} className="p-3 rounded-lg bg-white/[0.03] border border-slate-200/80 text-sm">
                    <div className="font-medium text-white">{l.code}</div>
                    <div className="text-slate-400">{l.topic}</div>
                    <div className="text-xs text-slate-600 mt-1">{l.note}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Kontrol listesi (taslak)</h3>
              <ul className="space-y-2 text-sm text-slate-400 list-disc list-inside">
                {section.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 bg-slate-900/50 border-slate-200/80">
          <CardContent className="p-6 space-y-3">
            <h3 className="text-sm font-semibold text-slate-300">Sistem tutarlılık kuralları (10/10)</h3>
            <ul className="space-y-2 text-sm text-slate-400 list-disc list-inside">
              {PLATFORM_CONSISTENCY_RULES.map((rule) => (
                <li key={rule.id}>
                  <span className="font-medium text-slate-300">{rule.title}:</span> {rule.detail}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <article className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-4">
            <h3 className="text-sm font-semibold text-cyan-100">Kime göre</h3>
            <p className="mt-2 text-xs text-slate-200">
              Ürün ekibi için karar sınırı, hukuk ekibi için mevzuat izleme çerçevesi, operasyon ekibi için günlük uygulama rehberidir.
            </p>
          </article>
          <article className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <h3 className="text-sm font-semibold text-amber-100">Dürüst sınır</h3>
            <p className="mt-2 text-xs text-slate-200">
              Bu içerik bağlayıcı mütalaa değildir; somut uyuşmazlıkta dosya bazlı hukuki görüş alınmadan nihai karar verilmemelidir.
            </p>
          </article>
        </div>

        <Card className="mt-6 bg-emerald-500/10 border-emerald-500/25">
          <CardContent className="p-5">
            <h3 className="text-base font-semibold text-emerald-100 mb-2">CTA - sözleşme setine geçiş</h3>
            <p className="text-sm text-slate-200">
              Yasal çerçeveyi doğruladıktan sonra sözleşme şablonları ekranına geçin ve her işlem türü için
              sözleşme + evrak + güvenlik kontrol listesini birlikte kapatın.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
