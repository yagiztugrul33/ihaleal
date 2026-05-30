import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
};

function mapRow(row: {
  id: number;
  type: string;
  payload: unknown;
  created_at: string;
  read_at: string | null;
}): AppNotification {
  const payload = (row.payload ?? {}) as Record<string, unknown>;
  return {
    id: String(row.id),
    type: row.type,
    title: String(payload.title ?? payload.subject ?? row.type),
    body: String(payload.body ?? payload.message ?? ""),
    createdAt: row.created_at,
    read: row.read_at != null,
  };
}

export function useNotifications() {
  const { user } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!user || !isSupabaseConfigured()) {
      setItems([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: qErr } = await supabase
      .from("notifications")
      .select("id, type, payload, created_at, read_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (qErr) {
      setError("Bildirimler yüklenemedi.");
      setItems([]);
      setLoading(false);
      return;
    }

    setItems((data ?? []).map(mapRow));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const markRead = useCallback(
    async (id: string) => {
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      if (!user || !isSupabaseConfigured()) return;
      await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", Number(id))
        .eq("user_id", user.id);
    },
    [user],
  );

  const markAllRead = useCallback(async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    if (!user || !isSupabaseConfigured()) return;
    const unreadIds = items.filter((n) => !n.read).map((n) => Number(n.id));
    if (unreadIds.length === 0) return;
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .in("id", unreadIds)
      .eq("user_id", user.id);
  }, [user, items]);

  return { items, loading, error, reload, markRead, markAllRead, unreadCount: items.filter((n) => !n.read).length };
}
