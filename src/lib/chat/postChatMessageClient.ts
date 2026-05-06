import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sanitizeChatPlainText } from "@/lib/sanitizePlainText";

export type EdgeCompliancePayload = {
  flaggedKeywords: string[];
  severity: "low" | "medium" | "high";
  modelScore: number;
};

export type PostChatMessageSuccess = {
  ok: true;
  messageId: string;
  compliance: EdgeCompliancePayload;
};

export type PostChatMessageFailure = {
  ok: false;
  code: string;
  detail?: string;
};

export type PostChatMessageResult = PostChatMessageSuccess | PostChatMessageFailure;

type EdgeInvokeBody = {
  thread_id: string;
  body: string;
  client_msg_id: string;
};

type EdgeFnResponse = {
  ok: boolean;
  messageId?: string;
  compliance?: { flaggedKeywords: string[]; severity: string; modelScore: number };
  error?: string;
  detail?: string;
};

/**
 * Supabase Edge `post_chat_message` → RPC `public.post_chat_message`.
 * Oturum: `supabase.auth` üzerinden gönderilir (`functions.invoke`).
 */
export async function postChatMessageViaEdge(args: {
  threadId: string;
  text: string;
  clientMsgId: string;
}): Promise<PostChatMessageResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, code: "supabase_not_configured" };
  }

  const body = sanitizeChatPlainText(args.text);
  if (!body) {
    return { ok: false, code: "empty_message" };
  }

  const invokeBody: EdgeInvokeBody = {
    thread_id: args.threadId,
    body,
    client_msg_id: args.clientMsgId,
  };

  const { data, error } = await supabase.functions.invoke<EdgeFnResponse>("post_chat_message", {
    body: invokeBody,
  });

  if (error) {
    return {
      ok: false,
      code: error.name === "FunctionsHttpError" ? "edge_http_error" : "edge_invoke_error",
      detail: error.message,
    };
  }

  if (!data || typeof data !== "object") {
    return { ok: false, code: "empty_response" };
  }

  if (!data.ok) {
    return { ok: false, code: data.error ?? "edge_rejected", detail: data.detail };
  }

  if (!data.messageId || !data.compliance) {
    return { ok: false, code: "invalid_edge_payload" };
  }

  const sev = data.compliance.severity;
  const severity: EdgeCompliancePayload["severity"] =
    sev === "high" || sev === "medium" || sev === "low" ? sev : "low";

  return {
    ok: true,
    messageId: data.messageId,
    compliance: {
      flaggedKeywords: data.compliance.flaggedKeywords ?? [],
      severity,
      modelScore: typeof data.compliance.modelScore === "number" ? data.compliance.modelScore : 0,
    },
  };
}
