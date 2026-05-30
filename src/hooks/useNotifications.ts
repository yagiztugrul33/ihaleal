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
      if (isMissingSchemaError(qErr)) {
        setItems([]);
        setError(null);
      } else {
        setError("Bildirimler yüklenemedi.");
        setItems([]);
      }
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

  return { items, loading, error, reload, markRead, unreadCount: items.filter((n) => !n.read).length };
}
