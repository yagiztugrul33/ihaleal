// R14 PAKET 3+5 — Müteahhit proje detay (birim listesi + Yayınla → listing)

import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Building2, Eye, Megaphone, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useDeveloperProject, publishUnitAsListing, type ProjectUnit } from "@/hooks/useDeveloperProjects";
import { PdfExportButton } from "@/components/pdf/PdfExportButton";
import { downloadProjectReportPdf } from "@/lib/pdf/pdfBuilder";
import { LoadingSkeletonDetail } from "@/components/async";

const STAGE_LABELS: Record<string, string> = {
  planning: "Planlama",
  foundation: "Temel",
  construction: "İnşaat",
  finishing: "İnce İmalat",
  ready: "Hazır",
  delivered: "Teslim Edildi",
};

const STATUS_COLORS: Record<ProjectUnit["status"], string> = {
  available: "bg-[var(--zemin-yumusak)] text-[var(--metin-ikincil)] border-[var(--cizgi)]",
  reserved: "bg-[var(--zemin-yumusak)] text-[var(--metin-ikincil)] border-[var(--cizgi)]",
  sold: "bg-[var(--zemin-yumusak)] text-[var(--metin-ikincil)] border-[var(--cizgi)]",
  cancelled: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

const STATUS_LABELS: Record<ProjectUnit["status"], string> = {
  available: "Mevcut",
  reserved: "Rezerve",
  sold: "Satıldı",
  cancelled: "İptal",
};

export default function MuteahhitProjeDetayPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { project, units, loading, refresh } = useDeveloperProject(projectId);
  const [publishing, setPublishing] = useState<string | null>(null);

  if (loading) {
    return <div className="min-h-screen pt-24"><LoadingSkeletonDetail /></div>;
  }

  if (!project) {
    return (
      <div className="min-h-screen pt-24 px-4 text-center text-slate-400">
        Proje bulunamadı. <Link to="/muteahhit/panel" className="text-[var(--metin-ikincil)] underline">Panele dön</Link>
      </div>
    );
  }

  const isOwner = user && user.id === project.owner_user_id;
  const isVerified = project.ruhsat_status === "verified";

  const publish = async (unit: ProjectUnit) => {
    if (!isVerified) {
      alert("Proje admin tarafından onaylanmadan birimler ilan olarak yayınlanamaz.");
      return;
    }
    setPublishing(unit.id);
    const title = `${project.project_name} - ${unit.unit_no} (${unit.unit_type ?? "Tip yok"}, ${unit.m2_brut ?? 0}m²)`;
    const { listingId, error } = await publishUnitAsListing(unit.id, project.id, {
      title,
      price_try: unit.price_try ?? 0,
      description: `${project.project_name} lansman birimi. Ada/Parsel: ${project.ada_parsel ?? "-"}, Blok: ${unit.block ?? "-"}, Kat: ${unit.floor ?? "-"}.`,
      marketing_mode: "hemen_al_lansman",
    });
    setPublishing(null);
    if (error || !listingId) {
      alert(`Yayınlama hatası: ${error ?? "Bilinmeyen"}`);
      return;
    }
    await refresh();
    if (confirm("Birim ilanı oluşturuldu. İlana git?")) {
      navigate(`/ilan/${listingId}`);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" size="sm" onClick={() => navigate("/muteahhit/panel")} className="mb-4 gap-2 text-slate-400">
          <ArrowLeft className="rtl:rotate-180 w-4 h-4" /> Panele dön
        </Button>

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-normal text-white flex items-center gap-3 mb-2">
              <Building2 className="w-8 h-8 text-[var(--metin-ikincil)]" /> {project.project_name}
            </h1>
            <p className="text-slate-400 text-sm">
              Ruhsat: {project.ruhsat_no ?? "—"} · Ada/Parsel: {project.ada_parsel ?? "—"}
            </p>
            <p className="text-slate-400 text-sm">
              {project.province} / {project.district} {project.neighborhood ? `/ ${project.neighborhood}` : ""}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-[var(--zemin-yumusak)]" style={{ color: isVerified ? "var(--metrik-yesil)" : "var(--metin-ikincil)" }}>
                {isVerified ? "✓ Onaylı" : "⏳ Admin onayı bekliyor"}
              </Badge>
              <Badge variant="outline">{STAGE_LABELS[project.stage] ?? project.stage}</Badge>
            </div>
          </div>
          {isVerified ? (
            <Link to={`/proje/${project.id}`}>
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="w-4 h-4" /> Kamu Görünüm
              </Button>
            </Link>
          ) : null}
          <PdfExportButton
            label="Proje PDF"
            onExport={() =>
              downloadProjectReportPdf({
                projectName: project.project_name,
                location: `${project.province} / ${project.district}`,
                metrics: [
                  `Ruhsat: ${project.ruhsat_no ?? "—"}`,
                  `Ada/Parsel: ${project.ada_parsel ?? "—"}`,
                  `Aşama: ${STAGE_LABELS[project.stage] ?? project.stage}`,
                  `Birim sayısı: ${units.length}`,
                ],
              })
            }
          />
        </div>

        <Card className="bg-slate-900/50 border-slate-200/80 mb-6">
          <CardContent className="p-5 grid sm:grid-cols-4 gap-3">
            <div><div className="text-xs text-slate-500">Toplam</div><div className="text-xl font-normal text-white">{units.length}</div></div>
            <div><div className="text-xs text-slate-500">Mevcut</div><div className="text-xl font-normal text-[var(--metin-ikincil)]">{units.filter((u) => u.status === "available").length}</div></div>
            <div><div className="text-xs text-slate-500">Rezerve</div><div className="text-xl font-normal text-[var(--metin-ikincil)]">{units.filter((u) => u.status === "reserved").length}</div></div>
            <div><div className="text-xs text-slate-500">Satıldı</div><div className="text-xl font-normal text-[var(--metin-ikincil)]">{units.filter((u) => u.status === "sold").length}</div></div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-normal text-white">Birim Envanteri ({units.length})</h2>
          {isOwner ? (
            <Button size="sm" variant="outline" className="gap-2">
              <Plus className="w-4 h-4" /> Birim Ekle
            </Button>
          ) : null}
        </div>

        <Card className="bg-slate-900/50 border-slate-200/80">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200/80 text-xs text-slate-500 uppercase">
                    <th className="text-start p-3">Unit</th>
                    <th className="text-start p-3">Blok/Kat</th>
                    <th className="text-start p-3">Tip</th>
                    <th className="text-end p-3">m² (B/N)</th>
                    <th className="text-end p-3">Fiyat</th>
                    <th className="text-start p-3">Durum</th>
                    <th className="text-end p-3">Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {units.length === 0 && (
                    <tr><td colSpan={7} className="text-center p-8 text-slate-500">Henüz birim eklenmemiş</td></tr>
                  )}
                  {units.map((u) => (
                    <tr key={u.id} className="border-b border-slate-200/40 hover:bg-white/5">
                      <td className="p-3 font-normal text-white">{u.unit_no}</td>
                      <td className="p-3 text-slate-400">{u.block ?? "—"} / {u.floor ?? "—"}</td>
                      <td className="p-3 text-slate-300">{u.unit_type ?? "—"}</td>
                      <td className="p-3 text-end text-slate-300">{u.m2_brut ?? "—"} / {u.m2_net ?? "—"}</td>
                      <td className="p-3 text-end font-normal text-[var(--metin-ikincil)]">{u.price_try ? `₺${u.price_try.toLocaleString("tr-TR")}` : "—"}</td>
                      <td className="p-3">
                        <span className={`inline-flex px-2 py-1 rounded-[3px] text-[10px] font-normal border ${STATUS_COLORS[u.status]}`}>
                          {STATUS_LABELS[u.status]}
                        </span>
                      </td>
                      <td className="p-3 text-end">
                        {u.status === "available" && isOwner && isVerified && (
                          <Button size="sm" variant="outline" onClick={() => void publish(u)} disabled={publishing === u.id} className="gap-1.5">
                            <Megaphone className="w-3.5 h-3.5" /> {publishing === u.id ? "..." : "Yayınla"}
                          </Button>
                        )}
                        {u.listing_id && (
                          <Link to={`/ilan/${u.listing_id}`}>
                            <Button size="sm" variant="ghost" className="gap-1.5 text-[var(--metin-ikincil)]">
                              <Eye className="w-3.5 h-3.5" /> İlan
                            </Button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
