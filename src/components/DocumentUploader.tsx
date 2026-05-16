import { useCallback, useState } from "react";
import { Upload, FileText, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DocumentRequirement } from "@/lib/userFlows";

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = ".pdf,.jpeg,.jpg,image/jpeg,application/pdf";

type Props = {
  label?: string;
  /** Seçilen akışlardan gelen evrak listesi — yalnız bilgi paneli (yüklenen dosya eşlemesi yok). */
  requirements?: DocumentRequirement[];
};

/** Mock yükleme — sunucuya gitmez (§D-K3). */
export function DocumentUploader({ label = "Evrak yükleme (demo)", requirements }: Props) {
  const [files, setFiles] = useState<{ name: string; size: number; done: boolean }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onFiles = useCallback((list: FileList | null) => {
    setError(null);
    if (!list?.length) return;
    const next: { name: string; size: number; done: boolean }[] = [...files];
    Array.from(list).forEach((f) => {
      if (f.size > MAX_BYTES) {
        setError(`${f.name}: maksimum 10 MB`);
        return;
      }
      if (!/pdf|jpe?g/i.test(f.name)) {
        setError(`${f.name}: yalnız PDF veya JPEG`);
        return;
      }
      next.push({ name: f.name, size: f.size, done: true });
    });
    setFiles(next);
  }, [files]);

  return (
    <div className="rounded-xl border border-dashed border-white/15 bg-slate-950/40 p-4 space-y-3" data-demo="true">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-white">{label}</p>
        <span className="text-[10px] text-amber-300/90 uppercase tracking-wide">Demo</span>
      </div>
      {requirements && requirements.length > 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white/[0.03] p-3 text-xs text-slate-300">
          <p className="font-medium text-slate-200 mb-2">Akış evrakları (referans)</p>
          <ul className="space-y-1">
            {requirements.map((d) => (
              <li key={d.id} className="flex gap-2">
                <span className={d.required ? "text-amber-400" : "text-slate-600"}>{d.required ? "*" : "○"}</span>
                <span>
                  {d.label}
                  {d.hint ? <span className="block text-[10px] text-slate-500">{d.hint}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <label className="flex flex-col items-center justify-center gap-2 py-8 cursor-pointer rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-slate-200/80">
        <Upload className="w-8 h-8 text-teal-400" />
        <span className="text-xs text-slate-400">Sürükle-bırak veya tıkla — PDF / JPEG, max 10 MB</span>
        <input type="file" className="hidden" accept={ACCEPT} multiple onChange={(e) => onFiles(e.target.files)} />
      </label>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      <ul className="space-y-2">
        {files.map((f, i) => (
          <li key={`${f.name}-${i}`} className="flex items-center justify-between text-xs text-slate-300 bg-white/[0.04] rounded-lg px-3 py-2">
            <span className="flex items-center gap-2 truncate">
              <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{f.name}</span>
              <span className="text-slate-600 shrink-0">({(f.size / 1024).toFixed(0)} KB)</span>
            </span>
            <span className="flex items-center gap-1 shrink-0">
              {f.done ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" title="Mock: kaydedildi" /> : null}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-slate-500 hover:text-white"
                onClick={() => setFiles(files.filter((_, j) => j !== i))}
                aria-label="Kaldır"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </span>
          </li>
        ))}
      </ul>
      <p className="text-[10px] text-slate-600">Backend yükleme yok; dosyalar bellekte tutulur (sayfa yenilenince gider).</p>
    </div>
  );
}
