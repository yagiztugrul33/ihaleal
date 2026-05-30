import { useCallback, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { getPresenceSessionId } from "@/lib/presence/presenceSessionId";
import type { RealtimeChannel } from "@supabase/supabase-js";

const CHANNEL_NAME = "site_presence_v1";

function countPresence(channel: RealtimeChannel): number {
  const state = channel.presenceState<{ online_at?: string }>();
  return Object.values(state).reduce((acc, entries) => acc + entries.length, 0);
}

export function useOnlinePresence() {
  const { user } = useAuth();
  const [onlineCount, setOnlineCount] = useState<number | null>(null);
  const [connected, setConnected] = useState(false);

  const syncCount = useCallback((channel: RealtimeChannel) => {
    setOnlineCount(countPresence(channel));
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setOnlineCount(null);
      setConnected(false);
      return;
    }

    const presenceKey = getPresenceSessionId(user?.id);
    const channel = supabase.channel(CHANNEL_NAME, {
      config: { presence: { key: presenceKey } },
    });

    channel.on("presence", { event: "sync" }, () => syncCount(channel));
    channel.on("presence", { event: "join" }, () => syncCount(channel));
    channel.on("presence", { event: "leave" }, () => syncCount(channel));

    void channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        setConnected(true);
        await channel.track({ online_at: new Date().toISOString() });
        syncCount(channel);
      } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
        setConnected(false);
      }
    });

    return () => {
      void channel.untrack();
      void supabase.removeChannel(channel);
      setConnected(false);
    };
  }, [user?.id, syncCount]);

  return { onlineCount, connected };
}
