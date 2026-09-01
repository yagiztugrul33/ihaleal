import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, FolderOpen, Upload, FileCheck, AlertCircle, Clock, FileText } from "lucide-react";
import { EmptyState } from "@/components/async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DEMO_VAULT_DOCUMENTS,
  DOC_CATEGORY_LABEL,
  type DocStatus,
  type VaultDocument,
} from "@/data/documentsVaultDemo";

const STATUS_STYLE: Record<DocStatus, { label: string; className: string }> = {
  bekliyor: { label: "Bekliyor", className: "bg-slate-600/30 text-slate-300 border-slate-200" },
  yuklendi: { label: "Yüklendi", className: "bg-sky-500/15 text-sky-300 border-sky-500/25" },
  inceleniyor: { label: "İnceleniyor", className: "bg-amber-500/15 text-amber-200 border-amber-500/25" },
  onaylandi: { label: "Onaylandı", className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" },
  reddedildi: { label: "Reddedildi", className: "bg-red-500/15 text-red-300 border-red-500/25" },
};

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<VaultDocument[]>(() => [...DEMO_VAULT_DOCUMENTS]);

  const summary = useMemo(() => {
    const ok = docs.filter((d) => d.status === "onaylandi").length;
    const pending = docs.filter((d) => d.status !== "onaylandi" && d.status !== "reddedildi").length;
    return { ok, pending };
  }, [docs]);

  const simulateUpload = (id: string) => {
    const fileName = `yukleme-${Date.now()}-demo.pdf`;
    setDocs((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: "yuklendi" as DocStatus,
              fileName,
              updatedAt: new Date().toISOString(),
              note: "Dosya alındı; inceleme kuyruğuna alındı (demo).",
            }
          : d
      )
    );
    window.dispatchEvent(
      new CustomEvent("ihaleal:add-toast", {
        detail: { message: "Dosya yükleme simülasyonu tamamlandı.", type: "success" },
      })
    );
  };

  const simulateReview = (id: string) => {
    setDocs((prev) =>
      prev.map((d) =>
        d.id === id && (d.status === "yuklendi" || d.status === "inceleniyor")
          ? { ...d, status: "inceleniyor" as DocStatus, note: "Uzman incelemesi (demo)." }
          : d
      )
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-slate-50 px-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-900 gap-2 mb-6">
          <ArrowLeft className="rtl:rotate-180 w-4 h-4" /> Geri
        </Button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div className="flex gap-4">
            <div className="rounded-[20px] bg-amber-500/15 p-3 text-amber-400">
              <FolderOpen className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-normal text-white">Belgelerim</h1>
              <p className="text-slate-400 text-sm mt-1">
                Tapu, KYC ve ekspertiz dosyalarınızın durumu (demo). Gerçek süreç hukuki ve operasyon ekibi ile tamamlanır.
              </p>
            </div>
          </div>
          <div className="flex gap-3 text-sm">
            <span className="rounded-[20px] border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-emerald-300">
              Onaylı: {summary.ok}
            </span>
            <span className="rounded-[20px] border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-amber-200">
              Bekleyen / süreçte: {summary.pending}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {docs.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Henüz belge yok"
              description="İhale sürecinde gereken belgeleriniz burada listelenecek. Zorunlu evrak listesini inceleyerek başlayabilirsiniz."
              action={
                <Button asChild variant="outline">
                  <Link to="/evraklar">Gerekli evrakları gör</Link>
                </Button>
              }
            />
          ) : null}
          {docs.map((d) => {
            const st = STATUS_STYLE[d.status];
            return (
              <Card key={d.id} className="border-slate-200 bg-slate-900/45">
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge variant="outline" className="border-white/15 text-slate-300">
                        {DOC_CATEGORY_LABEL[d.category]}
                      </Badge>
                      <Badge variant="outline" className={st.className}>
                        {st.label}
                      </Badge>
                    </div>
                    <h2 className="font-normal text-white">{d.label}</h2>
                    {d.fileName && (
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <FileCheck className="w-3.5 h-3.5" /> {d.fileName}
                      </p>
                    )}
                    {d.updatedAt && (
                      <p className="text-[11px] text-slate-600 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(d.updatedAt).toLocaleString("tr-TR")}
                      </p>
                    )}
                    {d.note && (
                      <p className="text-xs text-slate-500 mt-2 flex items-start gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {d.note}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    {d.status === "bekliyor" && (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png,.zip"
                          onChange={() => simulateUpload(d.id)}
                        />
                        <span className="inline-flex items-center gap-2 rounded-[20px] [background:var(--gradient-cta)] px-4 py-2 text-sm font-normal text-white">
                          <Upload className="w-4 h-4" /> Yükle (demo)
                        </span>
                      </label>
                    )}
                    {(d.status === "yuklendi" || d.status === "inceleniyor") && (
                      <Button type="button" variant="outline" size="sm" className="border-white/15" onClick={() => simulateReview(d.id)}>
                        İncelemeyi başlat (demo)
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button variant="outline" asChild className="border-white/15">
            <Link to="/evraklar">Evrak rehberi</Link>
          </Button>
          <Button variant="outline" asChild className="border-white/15">
            <Link to="/ekspertiz">Ekspertiz bilgisi</Link>
          </Button>
          <Button asChild className="[background:var(--gradient-cta)] text-white">
            <Link to="/panel">Panele dön</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
