import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type SystemQaTurn = { role: "user" | "assistant"; content: string };

export type SystemQaResult =
  | { ok: true; text: string }
  | { ok: false; code: string; detail?: string };

/**
 * Supabase Edge `ai_qa` — bilgi bankasi + OpenAI.
 * Uretim: Dashboard'da OPENAI_API_KEY; fonksiyonu deploy edin (`supabase functions deploy ai_qa`).
 */
export async function invokeSystemQa(messages: SystemQaTurn[]): Promise<SystemQaResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, code: "supabase_not_configured" };
  }
  if (messages.length === 0 || messages[messages.length - 1]?.role !== "user") {
    return { ok: false, code: "invalid_thread" };
  }

  const { data, error } = await supabase.functions.invoke<{ reply?: string; error?: string; detail?: string }>("ai_qa", {
    body: { messages },
  });

  if (error) {
    return { ok: false, code: "invoke_failed", detail: error.message };
  }
  if (data && typeof data === "object" && "reply" in data && typeof data.reply === "string" && data.reply.length > 0) {
    return { ok: true, text: data.reply };
  }
  const err = data && typeof data === "object" && "error" in data ? String((data as { error?: string }).error) : "empty";
  const detail = data && typeof data === "object" && "detail" in data ? String((data as { detail?: string }).detail) : undefined;
  return { ok: false, code: err, detail };
}
