import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchNotificationPreferences,
  upsertNotificationPreferences,
  type NotificationPreferences,
} from "@/lib/notifications/notificationPreferencesClient";

export function useNotificationPreferences() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    if (!user?.id) {
      setPrefs(null);
      return;
    }
    setLoading(true);
    try {
      setPrefs(await fetchNotificationPreferences(user.id));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const save = useCallback(
    async (patch: Partial<NotificationPreferences>) => {
      if (!user?.id || !prefs) return { ok: false };
      setBusy(true);
      const next = { ...prefs, ...patch };
      const res = await upsertNotificationPreferences(user.id, next);
      if (res.ok) setPrefs(next);
      setBusy(false);
      return res;
    },
    [user, prefs],
  );

  return { prefs, loading, busy, reload, save };
}
