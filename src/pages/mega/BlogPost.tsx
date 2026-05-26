import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBlogPostBySlug, MEGA_BLOG_POSTS } from "@/data/mega/blogPosts";
import { estimateReadingMinutes } from "@/lib/blogReading";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPostBySlug(slug) : undefined;
  const related = MEGA_BLOG_POSTS.filter((p) => p.slug !== post?.slug).slice(0, 3);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-24">
        <p className="mb-4 text-slate-400">Yazı bulunamadı.</p>
        <Button asChild variant="outline">
          <Link to="/blog">Bloga dön</Link>
        </Button>
      </div>
    );
  }

  return (
    <article className="min-h-screen pt-24 pb-16 px-4">
      <div className="mx-auto max-w-2xl">
        <Button variant="ghost" size="sm" className="mb-8 gap-2 text-slate-400" asChild>
          <Link to="/blog">
            <ArrowLeft className="h-4 w-4" /> Blog
          </Link>
        </Button>
        <header className="mb-10">
          <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(post.publishedAt).toLocaleDateString("tr-TR")}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Yaklaşık {estimateReadingMinutes(post)} dk okuma
            </span>
            {post.is_demo_content ? (
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] uppercase text-slate-400">demo içerik</span>
            ) : null}
          </div>
          <h1 className="text-3xl font-bold leading-tight text-white">{post.title}</h1>
          <p className="mt-3 text-sm text-slate-500">
            {post.author.name}
            {post.author.role ? ` · ${post.author.role}` : ""}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-white/15 bg-white/[0.03] px-2 py-0.5 text-xs text-slate-300">
                #{tag}
              </span>
            ))}
          </div>
        </header>
        <div className="space-y-5 text-sm leading-relaxed text-slate-300">
          {post.paragraphs.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        <section className="mt-8 grid gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 p-3">
            <h2 className="text-xs font-semibold text-cyan-100">Nedir?</h2>
            <p className="mt-1 text-xs text-slate-200">Bu yazı, ilgili konunun pratik karar etkisini sade dilde özetler.</p>
          </article>
          <article className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3">
            <h2 className="text-xs font-semibold text-emerald-100">Yöntem</h2>
            <p className="mt-1 text-xs text-slate-200">Kontrol listesi yaklaşımıyla risk, fırsat ve aksiyon adımları birlikte okunur.</p>
          </article>
          <article className="rounded-xl border border-violet-500/25 bg-violet-500/10 p-3">
            <h2 className="text-xs font-semibold text-violet-100">Kime göre</h2>
            <p className="mt-1 text-xs text-slate-200">Alıcı, satıcı ve yatırımcı rollerinin karar anı farklılıkları görünür kılınır.</p>
          </article>
        </section>

        <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-sm font-semibold text-white">Örnek uygulama akışı</h3>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs text-slate-300">
            <li>Yazıdaki kontrol listesini kendi dosyanızla eşleştirin.</li>
            <li>Eksik belge/risk kalemlerini not alın.</li>
            <li>Panel, favori veya rapor ekranına dönerek aksiyon kartlarını güncelleyin.</li>
          </ol>
        </section>

        <section className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
          <h3 className="text-sm font-semibold text-amber-100">Dürüst sınır</h3>
          <p className="mt-2 text-xs text-slate-200">
            Bu içerik bilgilendirme amaçlıdır; hukuki, teknik veya yatırım danışmanlığı yerine geçmez.
          </p>
        </section>

        <section className="mt-6 rounded-xl border border-blue-500/25 bg-blue-500/10 p-4">
          <h3 className="text-sm font-semibold text-blue-100">CTA</h3>
          <p className="mt-2 text-xs text-slate-200">İlgili rehber yazıları da okuyup kullanıcı panelinizde bir sonraki adımı planlayın.</p>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            {related.map((item) => (
              <Link key={item.slug} to={`/blog/${item.slug}`} className="rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-xs text-slate-200 hover:border-blue-300/40">
                {item.title}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-sm font-semibold text-slate-100">Hızlı soru-cevap</h3>
          <div className="mt-2 space-y-2 text-xs text-slate-300">
            <p><strong className="text-slate-100">Bu yazı nihai tavsiye mi?</strong> Hayır, bilgilendirme rehberidir.</p>
            <p><strong className="text-slate-100">Neyi önce kontrol etmeliyim?</strong> Belge tamlığı, risk sinyali ve sözleşme maddeleri.</p>
            <p><strong className="text-slate-100">Sonraki adım?</strong> Panel/favori/rapor ekranında aksiyon maddelerini kapatın.</p>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-sm font-semibold text-slate-100">Derin kontrol listesi</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-300">
            <li>Belge tutarlılığı: ilan metni, ekspertiz notu ve sözleşme maddeleri çelişiyor mu?</li>
            <li>Risk sinyali: deprem, likidite ve gelir oynaklığı birlikte okunuyor mu?</li>
            <li>İşlem disiplini: platform dışı ödeme veya kayıt dışı iletişim talebi var mı?</li>
            <li>Yasal sınır: kullanıcıya dürüst sınır ve uzman onayı gereği açıklandı mı?</li>
            <li>Aksiyon: panelde bir sonraki adım kartı güncellendi mi?</li>
          </ul>
        </section>

        <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-sm font-semibold text-slate-100">Okuma sonrası aksiyon planı</h3>
          <div className="mt-2 space-y-2 text-xs text-slate-300">
            <p>1) Bu yazıdaki kritik maddeleri dosyanıza göre işaretleyin.</p>
            <p>2) Eksik kalan belge veya risk sinyallerini raporlar ekranına not edin.</p>
            <p>3) İlgili ilanı favorilere alıp mesaj merkezi üzerinden ekip içi paylaşın.</p>
            <p>4) Paneldeki görev kartlarını güncelleyerek geri dönüş planı oluşturun.</p>
          </div>
        </section>
      </div>
    </article>
  );
}
