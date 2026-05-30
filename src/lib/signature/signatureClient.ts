import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function sha256Hex(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function saveSignatureRecord(input: {
  userId: string;
  documentId: string;
  documentType: string;
  signatureDataUrl: string;
  contentHash: string;
  storagePath?: string;
}): Promise<{ ok: boolean }> {
  if (!isSupabaseConfigured()) return { ok: false };
  const { error } = await supabase.from("signatures").insert({
    document_id: input.documentId,
    document_type: input.documentType,
    signer_id: input.userId,
    signature_data: input.signatureDataUrl,
    content_hash: input.contentHash,
    storage_path: input.storagePath ?? null,
  });
  return { ok: !error };
}
