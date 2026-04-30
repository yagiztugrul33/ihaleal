import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBlogPostBySlug } from "@/data/mega/blogPosts";
import { estimateReadingMinutes } from "@/lib/blogReading";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPostBySlug(slug) : undefined;

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
        </header>
        <div className="space-y-5 text-sm leading-relaxed text-slate-300">
          {post.paragraphs.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>
    </article>
  );
}
