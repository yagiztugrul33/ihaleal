import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageBreadcrumbs } from "@/components/seo/PageBreadcrumbs";
import { findGuideBySlug, REAL_ESTATE_GUIDES } from "@/data/realEstateGuides";

export default function RehberArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const guide = slug ? findGuideBySlug(slug) : undefined;

  if (!guide) {
    return <Navigate to="/rehber" replace />;
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="mb-4 gap-2 text-slate-500">
          <ArrowLeft className="rtl:rotate-180 h-4 w-4" /> Geri
        </Button>

        <PageBreadcrumbs
          className="mb-4"
          items={[
            { label: "Ana sayfa", href: "/" },
            { label: "Rehber", href: "/rehber" },
            { label: guide.title },
          ]}
        />

        <h1 className="flex items-center gap-3 text-2xl font-normal text-white md:text-3xl">
          <BookOpen className="h-8 w-8 text-blue-400" />
          {guide.title}
        </h1>
        <p className="mt-2 text-sm text-slate-400">{guide.summary}</p>

        <div className="mt-8 space-y-8">
          {guide.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-lg font-normal text-white">{section.heading}</h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-300">
                {section.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <Card className="mt-10 border-blue-500/20 bg-blue-500/5">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-normal text-white">İlgili araç</p>
              <p className="text-xs text-slate-400">{guide.relatedTool.label}</p>
            </div>
            <Button asChild className="[background:var(--gradient-cta)] text-white">
              <Link to={guide.relatedTool.path}>{guide.relatedTool.label}</Link>
            </Button>
          </CardContent>
        </Card>

        <aside className="mt-10 border-t border-white/10 pt-8">
          <h3 className="text-sm font-normal text-slate-400">Diğer rehberler</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {REAL_ESTATE_GUIDES.filter((g) => g.slug !== guide.slug).map((g) => (
              <li key={g.slug}>
                <Link
                  to={`/rehber/${g.slug}`}
                  className="rounded-[10px] border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:border-blue-500/40 hover:text-white"
                >
                  {g.title}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
