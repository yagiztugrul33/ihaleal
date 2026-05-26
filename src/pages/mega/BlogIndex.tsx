import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, Search, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MEGA_BLOG_POSTS } from "@/data/mega/blogPosts";
import { estimateReadingMinutes, MEGA_BLOG_CATEGORY_LABELS } from "@/lib/blogReading";
import type { MegaBlogCategory } from "@/types/megaContent";

const CATEGORY_IDS = Object.keys(MEGA_BLOG_CATEGORY_LABELS) as MegaBlogCategory[];

export default function BlogIndex() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<MegaBlogCategory | "all">("all");

  const rows = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return MEGA_BLOG_POSTS.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (!ql) return true;
      const hay = `${p.title} ${p.excerpt} ${p.tags.join(" ")}`.toLowerCase();
      return hay.includes(ql);
    });
  }, [q, cat]);
  const featured = rows[0];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-3xl font-bold text-white">Blog</h1>
        <p className="mb-8 text-sm text-slate-400">
          {MEGA_BLOG_POSTS.length} yazı; kategori ve arama ile süzün. Okuma süreleri tahminidir.
        </p>

        {featured ? (
          <section className="mb-8 rounded-2xl border border-cyan-500/25 bg-cyan-500/10 p-5">
            <p className="text-xs uppercase tracking-[0.12em] text-cyan-200">Öne çıkan yazı</p>
            <Link to={`/blog/${featured.slug}`} className="mt-1 block text-xl font-semibold text-white hover:text-cyan-100">
              {featured.title}
            </Link>
            <p className="mt-2 text-sm text-slate-300">{featured.excerpt}</p>
          </section>
        ) : null}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Başlık, özet veya etiket ara..."
              className="border-slate-200 bg-slate-900/60 pl-10 text-white placeholder:text-slate-600"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant={cat === "all" ? "default" : "outline"} onClick={() => setCat("all")}>
              Tümü
            </Button>
            {CATEGORY_IDS.map((id) => (
              <Button key={id} type="button" size="sm" variant={cat === id ? "default" : "outline"} onClick={() => setCat(id)}>
                {MEGA_BLOG_CATEGORY_LABELS[id]}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {rows.map((p) => {
            const mins = estimateReadingMinutes(p);
            return (
              <Card key={p.slug} className="border-slate-200 bg-slate-900/40 transition-colors hover:border-teal-500/30">
                <CardContent className="p-6">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(p.publishedAt).toLocaleDateString("tr-TR")}
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-slate-400">{MEGA_BLOG_CATEGORY_LABELS[p.category]}</span>
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      <Clock className="h-3 w-3" />
                      {mins} dk
                    </span>
                    {p.is_demo_content ? (
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] uppercase text-slate-400">demo içerik</span>
                    ) : null}
                  </div>
                  <Link to={`/blog/${p.slug}`} className="text-xl font-semibold text-white hover:text-teal-400">
                    {p.title}
                  </Link>
                  <p className="mt-2 text-sm text-slate-400">{p.excerpt}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.tags.map((t) => (
                      <span key={t} className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-slate-400">
                        <Tag className="h-3 w-3" /> {t}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <section className="mt-8 grid gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-4">
            <h3 className="text-sm font-semibold text-cyan-100">Nedir?</h3>
            <p className="mt-2 text-xs text-slate-200">Blog; gayrimenkul, deprem riski ve yatırım kararlarında kullanıcıya rehberlik eden içerik merkezidir.</p>
          </article>
          <article className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4">
            <h3 className="text-sm font-semibold text-emerald-100">Yöntem</h3>
            <p className="mt-2 text-xs text-slate-200">Her yazı aynı formatta ilerler: bağlam, kontrol listesi, kime göre, dürüst sınır ve aksiyon.</p>
          </article>
          <article className="rounded-xl border border-violet-500/25 bg-violet-500/10 p-4">
            <h3 className="text-sm font-semibold text-violet-100">Kime göre</h3>
            <p className="mt-2 text-xs text-slate-200">Yeni kullanıcı için onboarding içeriği, geri dönen kullanıcı için derin analiz ve karar notu sunar.</p>
          </article>
        </section>

        <section className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
          <h3 className="text-sm font-semibold text-amber-100">Dürüst sınır + CTA</h3>
          <p className="mt-2 text-xs text-slate-200">
            Yazılar bilgilendirme amaçlıdır; resmi yatırım, hukuk veya mühendislik raporu yerine geçmez. Yazı detayına girip kontrol listesini
            kendi dosyanızla karşılaştırın, ardından panelde aksiyona dönün.
          </p>
        </section>

        <section className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-sm font-semibold text-slate-100">Gerçek makale seti</h3>
          <p className="mt-2 text-xs text-slate-300">
            Blogda gayrimenkul, deprem riski ve yatırım odaklı uzun formlu rehber yazılar bulunur; her yazı uygulama adımı içeren kontrol
            listesiyle tamamlanır.
          </p>
          <p className="mt-2 text-xs text-slate-300">İçerikler yeni kullanıcı ve geri dönen kullanıcı için farklı karar derinliği sunar.</p>
        </section>

        {rows.length === 0 ? <p className="py-16 text-center text-sm text-slate-500">Sonuç yok; filtreyi veya aramayı değiştirin.</p> : null}
      </div>
    </div>
  );
}
