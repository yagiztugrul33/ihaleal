import { useCallback, useState } from "react";
import { Upload, FileText, X, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DocumentRequirement } from "@/lib/userFlows";
import { useAuth } from "@/contexts/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabase";
import { uploadFile, UploadUnavailableError, type UploadResult } from "@/lib/uploadFile";

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = ".pdf,.jpeg,.jpg,image/jpeg,application/pdf";

type UploadedFileRow = {
  name: string;
  size: number;
  done: boolean;
  uploading?: boolean;
  path?: string;
  error?: string;
};

type Props = {
  label?: string;
  /** Seçilen akışlardan gelen evrak listesi — yalnız bilgi paneli. */
  requirements?: DocumentRequirement[];
  /** project-docs path segment — proje yoksa owner onboarding klasörü kullanılır. */
  orgId?: string;
  projectId?: string;
  docKind?: string;
  onUploaded?: (results: UploadResult[]) => void;
};

export function DocumentUploader({
  label = "Evrak yükleme",
  requirements,
  orgId,
  projectId,
  docKind = "evrak",
  onUploaded,
}: Props) {
  const { user } = useAuth();
  const [files, setFiles] = useState<UploadedFileRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const uploadOne = useCallback(
    async (file: File, index: number) => {
      if (!user?.id) {
        setError("Yüklemek için giriş yapın.");
        return;
      }
      if (!isSupabaseConfigured()) {
        setFiles((prev) =>
          prev.map((row, i) => (i === index ? { ...row, done: true, uploading: false, path: file.name } : row)),
        );
        return;
      }

      const ownerKey = orgId ?? user.id;
      const entityKey = projectId ?? "onboarding";

      setFiles((prev) => prev.map((row, i) => (i === index ? { ...row, uploading: true, error: undefined } : row)));

      try {
        const result = await uploadFile(file, {
          bucket: "project-docs",
          orgId: ownerKey,
          entityId: entityKey,
          docKind,
        });
        setFiles((prev) =>
          prev.map((row, i) =>
            i === index ? { ...row, done: true, uploading: false, path: result.path } : row,
          ),
        );
        onUploaded?.([result]);
      } catch (e) {
        const msg =
          e instanceof UploadUnavailableError
            ? e.message
            : e instanceof Error
              ? e.message
              : "Yükleme başarısız";
        setFiles((prev) =>
          prev.map((row, i) => (i === index ? { ...row, uploading: false, done: false, error: msg } : row)),
        );
        setError(msg);
      }
    },
    [docKind, onUploaded, orgId, projectId, user],
  );

  const onFiles = useCallback(
    (list: FileList | null) => {
      setError(null);
      if (!list?.length) return;

      const incoming = Array.from(list);
      const valid: File[] = [];

      for (const f of incoming) {
        if (f.size > MAX_BYTES) {
          setError(`${f.name}: maksimum 10 MB`);
          continue;
        }
        if (!/pdf|jpe?g/i.test(f.name)) {
          setError(`${f.name}: yalnız PDF veya JPEG`);
          continue;
        }
        valid.push(f);
      }

      if (!valid.length) return;

      const startIndex = files.length;
      setFiles((prev) => [
        ...prev,
        ...valid.map((f) => ({ name: f.name, size: f.size, done: false, uploading: true })),
      ]);

      valid.forEach((file, offset) => {
        void uploadOne(file, startIndex + offset);
      });
    },
    [files.length, uploadOne],
  );

  return (
    <div className="rounded-[20px] border border-dashed border-white/15 bg-slate-950/40 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-normal text-white">{label}</p>
        {isSupabaseConfigured() ? (
          <span className="text-[10px] text-[var(--metin-ikincil)] uppercase tracking-wide">Storage</span>
        ) : (
          <span className="text-[10px] text-[var(--metin-ikincil)] uppercase tracking-wide">Yerel</span>
        )}
      </div>
      {requirements && requirements.length > 0 ? (
        <div className="rounded-[10px] border border-slate-200 bg-white/[0.03] p-3 text-xs text-slate-300">
          <p className="font-normal text-slate-200 mb-2">Akış evrakları (referans)</p>
          <ul className="space-y-1">
            {requirements.map((d) => (
              <li key={d.id} className="flex gap-2">
                <span className={d.required ? "text-[var(--metin-ikincil)]" : "text-slate-600"}>{d.required ? "*" : "○"}</span>
                <span>
                  {d.label}
                  {d.hint ? <span className="block text-[10px] text-slate-500">{d.hint}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <label className="flex flex-col items-center justify-center gap-2 py-8 cursor-pointer rounded-[10px] bg-white/[0.03] hover:bg-white/[0.06] border border-slate-200/80">
        <Upload className="w-8 h-8 text-[var(--metin-ikincil)]" />
        <span className="text-xs text-slate-400">Sürükle-bırak veya tıkla — PDF / JPEG, max 10 MB</span>
        <input type="file" className="hidden" accept={ACCEPT} multiple onChange={(e) => onFiles(e.target.files)} />
      </label>
      {error ? <p className="text-xs text-[var(--metin-ikincil)]">{error}</p> : null}
      <ul className="space-y-2">
        {files.map((f, i) => (
          <li key={`${f.name}-${i}`} className="flex items-center justify-between text-xs text-slate-300 bg-white/[0.04] rounded-[10px] px-3 py-2">
            <span className="flex items-center gap-2 truncate">
              <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{f.name}</span>
              <span className="text-slate-600 shrink-0">({(f.size / 1024).toFixed(0)} KB)</span>
              {f.path ? <span className="text-slate-600 truncate max-w-[120px]" title={f.path}>✓</span> : null}
            </span>
            <span className="flex items-center gap-1 shrink-0">
              {f.uploading ? <Loader2 className="w-3.5 h-3.5 text-[var(--metin-ikincil)] animate-spin" aria-label="Yükleniyor" /> : null}
              {f.done && !f.uploading ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--metin-ikincil)]" aria-label="Kaydedildi" />
              ) : null}
              {f.error ? <span className="text-[var(--metin-ikincil)] text-[10px]">{f.error}</span> : null}
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
      <p className="text-[10px] text-slate-600">
        {isSupabaseConfigured()
          ? "Dosyalar project-docs bucket'a yüklenir (private, signed URL ile erişim)."
          : "Supabase yapılandırması yok — dosya adı yerel listede tutulur."}
      </p>
    </div>
  );
}
