import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type KycDocumentPayload = {
  kind: string;
  storage_path: string;
};

export type KycSubmitResult =
  | { ok: true; kycId: string; status: string }
  | { ok: false; code: string; detail?: string };

export async function submitKycViaEdge(args: {
  subjectId: string;
  documents: KycDocumentPayload[];
  declaredData?: Record<string, unknown>;
}): Promise<KycSubmitResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, code: "supabase_not_configured" };
  }
  if (args.documents.length === 0) {
    return { ok: false, code: "no_documents" };
  }

  const { data, error } = await supabase.functions.invoke<{
    ok?: boolean;
    kyc_id?: string;
    status?: string;
    error?: string;
  }>("kyc-submit", {
    body: {
      subject_type: "individual",
      subject_id: args.subjectId,
      documents: args.documents,
      declared_data: args.declaredData ?? {},
    },
  });

  if (error) {
    return { ok: false, code: "edge_invoke_error", detail: error.message };
  }
  if (!data?.ok || !data.kyc_id) {
    return { ok: false, code: data?.error ?? "edge_rejected" };
  }
  return { ok: true, kycId: data.kyc_id, status: data.status ?? "in_review" };
}
