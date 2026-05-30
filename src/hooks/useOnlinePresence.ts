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
    let mounted = true;

    // try/catch: React Strict Mode iki kez mount edip aynı CHANNEL_NAME'i
    // re-instantiate ederse Supabase eski (zaten subscribed) channel'i dondurur ve
    // `.on()` "cannot add presence callbacks after subscribe()" firlatir.
    // Bu durumda anasayfa ErrorBoundary'e dusuyordu. Sessiz gec, presence sayisi
    // bir sonraki effect mount'unda dogru dogal akisla yakalanir.
    try {
      channel.on("presence", { event: "sync" }, () => mounted && syncCount(channel));
      channel.on("presence", { event: "join" }, () => mounted && syncCount(channel));
      channel.on("presence", { event: "leave" }, () => mounted && syncCount(channel));

      void channel.subscribe(async (status) => {
        if (!mounted) return;
        if (status === "SUBSCRIBED") {
          setConnected(true);
          await channel.track({ online_at: new Date().toISOString() }).catch(() => {});
          syncCount(channel);
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          setConnected(false);
        }
      });
    } catch (err) {
      console.warn("[useOnlinePresence] duplicate channel subscribe, skipping", err);
    }

    return () => {
      mounted = false;
      try {
        void channel.untrack().catch(() => {});
        void supabase.removeChannel(channel);
      } catch {
        /* cleanup sessiz */
      }
      setConnected(false);
    };
  }, [user?.id, syncCount]);

  return { onlineCount, connected };
}
