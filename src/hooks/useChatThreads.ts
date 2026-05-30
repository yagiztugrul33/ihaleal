import { useCallback, useEffect, useState } from "react";
import type { ChatThread } from "@/data/messagesDemo";
import { DEMO_CHAT_THREADS } from "@/data/messagesDemo";
import {
  ensureListingChatThread,
  fetchChatMessages,
  fetchUserChatThreads,
  remoteThreadToUi,
} from "@/lib/chat/chatSupabase";
import { isUuid } from "@/lib/chat/isUuid";
import { isSupabaseConfigured } from "@/lib/supabase";

type UseChatThreadsArgs = {
  userId: string | null;
  listingId?: string | null;
  listingTitle?: string | null;
  preferredThreadId?: string | null;
};

export function useChatThreads({
  userId,
  listingId,
  listingTitle,
  preferredThreadId,
}: UseChatThreadsArgs) {
  const [threads, setThreads] = useState<ChatThread[]>(() =>
    DEMO_CHAT_THREADS.map((t) => JSON.parse(JSON.stringify(t)) as ChatThread),
  );
  const [loading, setLoading] = useState(false);
  const [remoteReady, setRemoteReady] = useState(false);
  const [activeId, setActiveId] = useState<string>(() => threads[0]?.id ?? "");

  const reloadRemote = useCallback(async () => {
    if (!userId || !isSupabaseConfigured()) {
      setRemoteReady(false);
      return;
    }
    setLoading(true);
    try {
      let focusThreadId = preferredThreadId && isUuid(preferredThreadId) ? preferredThreadId : null;

      if (listingId && isUuid(listingId)) {
        const ensured = await ensureListingChatThread(
          listingId,
          listingTitle ?? "İlan mesajları",
          userId,
        );
        if (ensured) focusThreadId = ensured;
      }

      const { threads: remote, schemaMissing } = await fetchUserChatThreads();
      if (schemaMissing) {
        setRemoteReady(false);
        if (focusThreadId) setActiveId(focusThreadId);
        return;
      }

      let uiThreads = remote.map((r) => remoteThreadToUi(r, userId));
      if (focusThreadId && !uiThreads.some((t) => t.id === focusThreadId)) {
        uiThreads = [
          remoteThreadToUi(
            {
              id: focusThreadId,
              title: listingTitle ?? "İlan mesajları",
              listingId: listingId && isUuid(listingId) ? listingId : null,
              updatedAt: new Date().toISOString(),
            },
            userId,
          ),
          ...uiThreads,
        ];
      }

      if (uiThreads.length === 0) {
        setRemoteReady(false);
        return;
      }

      setThreads(uiThreads);
      setRemoteReady(true);
      setActiveId(
        focusThreadId && uiThreads.some((t) => t.id === focusThreadId)
          ? focusThreadId
          : (uiThreads[0]?.id ?? ""),
      );
    } finally {
      setLoading(false);
    }
  }, [userId, listingId, listingTitle, preferredThreadId]);

  useEffect(() => {
    void reloadRemote();
  }, [reloadRemote]);

  const loadMessagesForThread = useCallback(
    async (threadId: string) => {
      if (!userId || !isUuid(threadId)) return;
      const rows = await fetchChatMessages(threadId, userId);
      if (rows.length === 0) return;
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, messages: rows } : t)),
      );
    },
    [userId],
  );

  useEffect(() => {
    if (!activeId || !remoteReady) return;
    void loadMessagesForThread(activeId);
  }, [activeId, remoteReady, loadMessagesForThread]);

  return {
    threads,
    setThreads,
    activeId,
    setActiveId,
    loading,
    remoteReady,
    reloadRemote,
    loadMessagesForThread,
  };
}
