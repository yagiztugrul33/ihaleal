import { useMemo, useState } from "react";
import { HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MEGA_FAQ_CATEGORIES, MEGA_FAQ_ITEMS, getFaqByCategory } from "@/data/mega/faq";
import type { FaqCategoryId } from "@/types/megaContent";

export default function FrequentQuestions() {
  const [cat, setCat] = useState<FaqCategoryId | "all">("all");
  const [q, setQ] = useState("");

  const visible = useMemo(() => {
    const base =
      cat === "all" ? [...MEGA_FAQ_ITEMS].sort((a, b) => a.order - b.order) : getFaqByCategory(cat);
    const ql = q.trim().toLowerCase();
    if (!ql) return base;
    return base.filter((item) => {
      const hay = `${item.question} ${item.answer}`.toLowerCase();
      return hay.includes(ql);
    });
  }, [cat, q]);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 flex items-start gap-3">
          <div className="rounded-xl bg-blue-500/15 p-3 text-blue-400">
            <HelpCircle className="h-8 w-8" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold text-white">Sıkça sorulan sorular</h1>
            <p className="mt-2 text-sm text-slate-400">
              40 soru, 5 kategori (Hesap/KYC, Üyelik, İhale, Komisyon, Emlakçı). İş modeli: yıllık satıcı/alıcı üyeliği, işlem komisyonu mahsupu ve hizmet bedelleri — liste/abonelik “paketi” satışı yoktur (bilgilendirme).
            </p>
          </div>
        </div>

        <div className="mb-6">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Soru veya cevapta ara..."
            className="border-slate-200 bg-slate-900/60 text-white placeholder:text-slate-600"
            aria-label="SSS arama"
          />
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          <Button type="button" size="sm" variant={cat === "all" ? "default" : "outline"} onClick={() => setCat("all")}>
            Tümü
          </Button>
          {MEGA_FAQ_CATEGORIES.map((c) => (
            <Button key={c.id} type="button" size="sm" variant={cat === c.id ? "default" : "outline"} onClick={() => setCat(c.id)}>
              {c.title}
            </Button>
          ))}
        </div>

        <div className="space-y-3">
          {visible.map((item) => (
            <Card key={item.id} className="border-slate-200 bg-slate-900/40">
              <CardContent className="p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">#{item.order}</p>
                <h2 className="mt-1 text-lg font-semibold text-white">{item.question}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{item.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {visible.length === 0 ? <p className="py-12 text-center text-sm text-slate-500">Eşleşen soru yok.</p> : null}
        <section className="mt-8 grid gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
            <h3 className="font-semibold text-slate-100">Nedir?</h3>
            <p className="mt-2">
              Bu merkez, platform modüllerinde tekrar eden karar sorularını tek sözlükte toplar ve ekip içi dil birliğini korur.
            </p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
            <h3 className="font-semibold text-slate-100">Neden?</h3>
            <p className="mt-2">
              Farklı rol ekranlarında aynı soruya farklı cevap verilmesi kullanıcı güvenini düşürür; SSS tek kaynaktan yanıt sunar.
            </p>
          </article>
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
            <h3 className="font-semibold text-slate-100">Örnek</h3>
            <p className="mt-2">
              "Teminat nasıl çalışır?" sorusu hem ihale hem ödeme akışında aynı kapsamla cevaplanır.
            </p>
          </article>
        </section>
        <section className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
          <h3 className="font-semibold text-slate-100">İçerik (açıklamalı)</h3>
          <p className="mt-2">
            Sorular kategoriye göre filtrelenir; arama kutusu başlık ve cevap içinde eşleşme yapar. Amaç kullanıcıyı destek kanalına taşımadan
            önce temel operasyon sorularını sahada çözdürmektir.
          </p>
          <p className="mt-2">
            Kurumsal ekipler için yanıt dili kısa ama ölçülebilir tutulur: kapsam, sınır, sonraki adım. Böylece soru-cevap ekranı bir karar
            hazırlık modülüne dönüşür.
          </p>
        </section>
        <section className="mt-4 grid gap-3 md:grid-cols-2">
          <article className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
            <h3 className="font-semibold text-slate-100">Kime göre</h3>
            <p className="mt-2">
              Yeni kullanıcı için onboarding, deneyimli kullanıcı için hızlı referans, kurumsal ekip için standart operasyon dili sağlar.
            </p>
          </article>
          <article className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-slate-200">
            <h3 className="font-semibold text-amber-100">Dürüst sınır + CTA</h3>
            <p className="mt-2">
              Bu alan bilgilendirme merkezidir; bağlayıcı hukuk/finans kararı yerine geçmez. Kararsız kaldığınız başlıkta destek kaydı açın.
            </p>
          </article>
        </section>
        <section className="mt-4 rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-4 text-xs text-slate-200">
          <h3 className="font-semibold text-cyan-100">CTA</h3>
          <p className="mt-2">
            Sık sorulanlarda yanıtı bulduktan sonra ilgili modüle geçin; karar notunu dashboard görev kartına taşıyarak işlemi tamamlayın.
          </p>
        </section>
        <section className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
          <h3 className="font-semibold text-slate-100">Onboarding örneği</h3>
          <p className="mt-2">
            Yeni kullanıcı önce hesap ve teklif sorularını çözer, ardından sözleşme ve komisyon başlıklarına geçerek adım adım ilerler.
          </p>
        </section>
        <section className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
          <h3 className="font-semibold text-slate-100">Dürüst sınır</h3>
          <p className="mt-2">
            SSS içerikleri bilgilendirme amaçlıdır; resmi bağlayıcılık gerektiren konularda sözleşme hükümleri ve hukuk danışmanlığı esas alınır.
          </p>
        </section>
      </div>
    </div>
  );
}
