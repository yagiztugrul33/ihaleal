import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type StorageBucket = "listing-photos" | "project-docs" | "expertise-reports";

export type UploadContext =
  | { bucket: "listing-photos"; ownerId: string; entityId: string }
  | { bucket: "project-docs"; orgId: string; entityId: string; docKind: string }
  | { bucket: "expertise-reports"; entityId: string };

const PUBLIC_BUCKETS: ReadonlySet<StorageBucket> = new Set(["listing-photos"]);

const SIGNED_URL_TTL_SEC = 900;

const LIMITS: Record<StorageBucket, { maxBytes: number; mime: ReadonlySet<string> }> = {
  "listing-photos": {
    maxBytes: 10 * 1024 * 1024,
    mime: new Set(["image/jpeg", "image/png", "image/webp"]),
  },
  "project-docs": {
    maxBytes: 10 * 1024 * 1024,
    mime: new Set(["application/pdf", "image/jpeg", "image/png"]),
  },
  "expertise-reports": {
    maxBytes: 15 * 1024 * 1024,
    mime: new Set(["application/pdf"]),
  },
};

/** Strip path traversal and unsafe chars from storage path segments. */
export function sanitizeStorageSegment(raw: string): string {
  if (/[/\\]|\.\./.test(raw)) {
    throw new Error("Geçersiz depolama yolu segmenti");
  }
  const cleaned = raw.trim().replace(/[^a-zA-Z0-9_-]/g, "");
  if (!cleaned || cleaned.length > 128) {
    throw new Error("Geçersiz depolama yolu segmenti");
  }
  return cleaned;
}

function extFromMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "application/pdf") return "pdf";
  throw new Error("unsupported_mime");
}

function resolveMime(file: File): string {
  if (file.type && LIMITS["listing-photos"].mime.has(file.type)) return file.type;
  if (file.type && LIMITS["project-docs"].mime.has(file.type)) return file.type;
  if (file.type && LIMITS["expertise-reports"].mime.has(file.type)) return file.type;
  const lower = file.name.toLowerCase();
  if (/\.jpe?g$/.test(lower)) return "image/jpeg";
  if (/\.png$/.test(lower)) return "image/png";
  if (/\.webp$/.test(lower)) return "image/webp";
  if (/\.pdf$/.test(lower)) return "application/pdf";
  return file.type;
}

export function buildStoragePath(ctx: UploadContext, uuid: string, ext: string): string {
  const safeUuid = sanitizeStorageSegment(uuid);
  const safeExt = sanitizeStorageSegment(ext);
  switch (ctx.bucket) {
    case "listing-photos":
      return `${sanitizeStorageSegment(ctx.ownerId)}/${sanitizeStorageSegment(ctx.entityId)}/${safeUuid}.${safeExt}`;
    case "project-docs":
      return `${sanitizeStorageSegment(ctx.orgId)}/${sanitizeStorageSegment(ctx.entityId)}/${sanitizeStorageSegment(ctx.docKind)}/${safeUuid}.${safeExt}`;
    case "expertise-reports":
      return `${sanitizeStorageSegment(ctx.entityId)}/${safeUuid}.${safeExt}`;
  }
}

export function validateUploadFile(file: File, bucket: StorageBucket): string | null {
  const rule = LIMITS[bucket];
  const mime = resolveMime(file);
  if (file.size > rule.maxBytes) {
    return `Dosya çok büyük (maksimum ${rule.maxBytes / 1024 / 1024} MB)`;
  }
  if (!rule.mime.has(mime)) {
    return "Desteklenmeyen dosya türü";
  }
  const lower = file.name.toLowerCase();
  if (bucket === "expertise-reports" && !lower.endsWith(".pdf")) {
    return "Yalnız PDF yüklenebilir";
  }
  if (bucket === "listing-photos" && !/\.(jpe?g|png|webp)$/i.test(lower) && !rule.mime.has(mime)) {
    return "Yalnız JPEG, PNG veya WebP";
  }
  return null;
}

export type UploadResult = {
  path: string;
  publicUrl?: string;
  signedUrl?: string;
};

export class UploadUnavailableError extends Error {
  constructor(message = "Depolama şu an kullanılamıyor") {
    super(message);
    this.name = "UploadUnavailableError";
  }
}

export async function uploadFile(file: File, ctx: UploadContext): Promise<UploadResult> {
  if (!isSupabaseConfigured()) {
    throw new UploadUnavailableError("Supabase yapılandırması yok");
  }

  const validationError = validateUploadFile(file, ctx.bucket);
  if (validationError) {
    throw new Error(validationError);
  }

  const mime = resolveMime(file);
  const ext = extFromMime(mime);
  const uuid = crypto.randomUUID();
  const path = buildStoragePath(ctx, uuid, ext);

  const { error: uploadError } = await supabase.storage.from(ctx.bucket).upload(path, file, {
    contentType: mime,
    upsert: false,
  });

  if (uploadError) {
    throw new Error(uploadError.message || "Yükleme başarısız");
  }

  if (PUBLIC_BUCKETS.has(ctx.bucket)) {
    const { data } = supabase.storage.from(ctx.bucket).getPublicUrl(path);
    return { path, publicUrl: data.publicUrl };
  }

  const { data: signed, error: signError } = await supabase.storage
    .from(ctx.bucket)
    .createSignedUrl(path, SIGNED_URL_TTL_SEC);

  if (signError) {
    return { path };
  }

  return { path, signedUrl: signed.signedUrl };
}

export async function uploadListingPhotos(
  files: File[],
  ownerId: string,
  listingId: string,
): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const result = await uploadFile(file, {
      bucket: "listing-photos",
      ownerId,
      entityId: listingId,
    });
    urls.push(result.publicUrl ?? result.path);
  }
  return urls;
}

export async function uploadProjectDoc(
  file: File,
  orgId: string,
  projectId: string,
  docKind: string,
): Promise<UploadResult> {
  return uploadFile(file, {
    bucket: "project-docs",
    orgId,
    entityId: projectId,
    docKind,
  });
}
