// R14 PAKET 5 — Müteahhit proje public görünüm (/proje/:id)

import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Building2, MapPin, Eye, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDeveloperProject } from "@/hooks/useDeveloperProjects";
import { injectJsonLd, removeJsonLd, buildProjectJsonLd } from "@/lib/seoStructuredData";
import { PageBreadcrumbs } from "@/components/seo/PageBreadcrumbs";

const STAGE_LABELS: Record<string, string> = {
  planning: "Planlama",
  foundation: "Temel",
  construction: "İnşaat",
  finishing: "İnce İmalat",
  ready: "Hazır",
  delivered: "Teslim Edildi",
};

export default function MuteahhitProjeKamuPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { project, units, loading } = useDeveloperProject(projectId);

  // FAZ 2c — JSON-LD Residence (Googlebot rich result)
  useEffect(() => {
    if (!project || !projectId || project.ruhsat_status !== "verified") return;
    const available = units.filter((u) => u.status === "available").length;
    injectJsonLd(
      `project-${projectId}`,
      buildProjectJsonLd({
        id: projectId,
        projectName: project.project_name,
        description: project.description ?? `${project.project_name} lansman projesi`,
        city: project.province ?? "TR",
        district: project.district ?? "",
        unitCount: units.length,
        available,
      }),
    );
    return () => removeJsonLd(`project-${projectId}`);
  }, [projectId, project, units]);

  if (loading) {
    return <div className="min-h-screen pt-24 px-4 text-center text-slate-400">Yükleniyor...</div>;
  }

  if (!project || project.ruhsat_status !== "verified") {
    return (
      <div className="min-h-screen pt-24 px-4 text-center text-slate-400">
        Proje bulunamadı veya henüz yayında değil.
      </div>
    );
  }

  const visibleUnits = units.filter((u) => u.status === "available" || u.status === "reserved");

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <PageBreadcrumbs
          className="mb-4"
          jsonLdId={`project-bc-${projectId}`}
          items={[
            { label: "Ana sayfa", href: "/" },
            { label: "Müteahhit", href: "/muteahhit" },
            { label: project.project_name },
          ]}
        />

        <div className="rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-6 mb-6">
          <Badge className="bg-cyan-500 mb-3">🏗️ LANSMAN PROJESİ</Badge>
          <h1 className="text-4xl font-black text-white mb-3 flex items-center gap-3">
            <Building2 className="w-9 h-9 text-cyan-400" /> {project.project_name}
          </h1>
          <div className="flex items-center gap-2 text-slate-300 mb-4">
            <MapPin className="w-4 h-4" />
            <span>{project.province} / {project.district} {project.neighborhood ? `/ ${project.neighborhood}` : ""}</span>
          </div>
          <p className="text-sm text-slate-400 mb-4">{project.description ?? "Proje açıklaması yakında eklenecek."}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{STAGE_LABELS[project.stage] ?? project.stage}</Badge>
            <Badge variant="outline">Ruhsat: {project.ruhsat_no}</Badge>
            <Badge variant="outline">Ada/Parsel: {project.ada_parsel}</Badge>
          </div>
        </div>

        <Card className="bg-slate-900/50 border-slate-200/80 mb-6">
          <CardContent className="p-5 grid grid-cols-4 gap-3">
            <div><div className="text-xs text-slate-500">Toplam</div><div className="text-xl font-bold text-white">{units.length}</div></div>
            <div><div className="text-xs text-slate-500">Mevcut</div><div className="text-xl font-bold text-emerald-300">{units.filter((u) => u.status === "available").length}</div></div>
            <div><div className="text-xs text-slate-500">Rezerve</div><div className="text-xl font-bold text-amber-300">{units.filter((u) => u.status === "reserved").length}</div></div>
            <div><div className="text-xs text-slate-500">Satıldı</div><div className="text-xl font-bold text-blue-300">{units.filter((u) => u.status === "sold").length}</div></div>
          </CardContent>
        </Card>

        <h2 className="text-xl font-bold text-white mb-4">Birimler ({visibleUnits.length})</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleUnits.length === 0 && (
            <p className="col-span-full text-center text-slate-500 py-8">Henüz yayında birim yok.</p>
          )}
          {visibleUnits.map((u) => (
            <Card key={u.id} className="bg-slate-900/50 border-slate-200/80 hover:border-cyan-400/30 transition-colors">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white">{u.unit_no}</span>
                  {u.status === "reserved" && <Badge className="bg-amber-500/20 text-amber-300 text-[10px]">Rezerve</Badge>}
                </div>
                <div className="text-xs text-slate-400">
                  {u.unit_type} · Blok {u.block ?? "—"} · Kat {u.floor ?? "—"}
                </div>
                <div className="text-xs text-slate-500">{u.m2_brut ?? "—"} m² brüt · {u.m2_net ?? "—"} m² net</div>
                <div className="text-lg font-bold text-cyan-300">
                  {u.price_try ? `₺${u.price_try.toLocaleString("tr-TR")}` : "Fiyat sorulur"}
                </div>
                {u.listing_id && (
                  <Link to={`/ilan/${u.listing_id}`}>
                    <Button size="sm" className="w-full gap-2 bg-blue-600 hover:bg-blue-500 mt-2">
                      <Eye className="w-4 h-4" /> İlana Git
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
