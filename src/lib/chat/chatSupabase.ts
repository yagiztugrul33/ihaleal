import type { ChatMessage, ChatThread } from "@/data/messagesDemo";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { isUuid } from "@/lib/chat/isUuid";

export type RemoteChatThread = {
  id: string;
  title: string;
  listingId: string | null;
  updatedAt: string;
};

function isMissingSchemaError(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  const code = err.code ?? "";
  const msg = (err.message ?? "").toLowerCase();
  return (
    code === "PGRST205" ||
    code === "42P01" ||
    msg.includes("does not exist") ||
    msg.includes("could not find") ||
    msg.includes("schema cache")
  );
}

export async function fetchUserChatThreads(): Promise<{
  threads: RemoteChatThread[];
  schemaMissing: boolean;
}> {
  if (!isSupabaseConfigured()) return { threads: [], schemaMissing: false };

  const { data, error } = await supabase
    .from("chat_threads")
    .select("id, title, listing_id, updated_at")
    .order("updated_at", { ascending: false })
    .limit(40);

  if (error) {
    if (isMissingSchemaError(error)) return { threads: [], schemaMissing: true };
    return { threads: [], schemaMissing: false };
  }

  return {
    threads: (data ?? []).map((row) => ({
      id: String(row.id),
      title: String(row.title),
      listingId: row.listing_id ? String(row.listing_id) : null,
      updatedAt: String(row.updated_at),
    })),
    schemaMissing: false,
  };
}

export async function fetchChatMessages(
  threadId: string,
  currentUserId: string | null,
): Promise<ChatMessage[]> {
  if (!isSupabaseConfigured() || !isUuid(threadId)) return [];

  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, thread_id, author_id, body, client_msg_id, compliance, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error || !data) return [];

  return data.map((row) => {
    const complianceRaw = (row.compliance ?? {}) as Record<string, unknown>;
    const flagged = Array.isArray(complianceRaw.flaggedKeywords)
      ? (complianceRaw.flaggedKeywords as string[])
      : [];
    const severityRaw = complianceRaw.severity;
    const severity =
      severityRaw === "high" || severityRaw === "medium" || severityRaw === "low" ? severityRaw : "low";
    return {
      id: String(row.id),
      threadId: String(row.thread_id),
      authorId: row.author_id === currentUserId ? "p2" : String(row.author_id),
      body: String(row.body),
      sentAt: String(row.created_at),
      remoteSource: "edge" as const,
      complianceScan:
        flagged.length > 0
          ? {
              severity,
              flaggedKeywords: flagged,
              modelScore: typeof complianceRaw.modelScore === "number" ? complianceRaw.modelScore : 0,
            }
          : undefined,
    };
  });
}

export async function ensureListingChatThread(
  listingId: string,
  title: string,
  userId: string,
): Promise<string | null> {
  if (!isSupabaseConfigured() || !isUuid(listingId)) return null;

  const { data: existing, error: findErr } = await supabase
    .from("chat_threads")
    .select("id")
    .eq("listing_id", listingId)
    .eq("created_by", userId)
    .maybeSingle();

  if (findErr && isMissingSchemaError(findErr)) return null;
  if (existing?.id) return String(existing.id);

  const { data: created, error: insertErr } = await supabase
    .from("chat_threads")
    .insert({
      listing_id: listingId,
      title: title.slice(0, 200),
      created_by: userId,
    })
    .select("id")
    .single();

  if (insertErr || !created?.id) return null;

  const threadId = String(created.id);
  await supabase.from("chat_thread_participants").insert({
    thread_id: threadId,
    profile_id: userId,
    role: "buyer",
  });

  return threadId;
}

export function remoteThreadToUi(thread: RemoteChatThread, userId: string): ChatThread {
  return {
    id: thread.id,
    title: thread.title,
    listingSnippet: thread.listingId ? `İlan ${thread.listingId.slice(0, 8)}…` : "Platform sohbeti",
    participants: [
      { id: userId, role: "alici", displayName: "Siz" },
      { id: "platform", role: "platform", displayName: "Platform" },
    ],
    messages: [],
  };
}
