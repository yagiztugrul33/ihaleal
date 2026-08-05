/**
 * Web Push subscription yönetimi.
 *
 * - Tarayıcı PushManager üzerinden subscription oluşturur (VAPID).
 * - register_push_token RPC ile Supabase'a kaydeder (auth.uid() güvenli).
 * - Permission durumunu yansıtır (granted/denied/default).
 * - Mevcut subscription varsa idempotent (her açılışta yeniden register etmez).
 *
 * Dalga 5 sonrası — Capacitor App Store hazırlık paketinin web-push eşdeğeri.
 * Native uygulamada @capacitor/push-notifications kullanılır (FCM/APNs).
 */

import { useCallback, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY ?? "";

type Status =
  | "unsupported"
  | "no-vapid"
  | "needs-permission"
  | "denied"
  | "subscribing"
  | "subscribed"
  | "error";

interface State {
  status: Status;
  permission: NotificationPermission | "unknown";
  subscription: PushSubscription | null;
  error: string | null;
}

// TS 5.7+ Uint8Array'i buffer turu uzerinden generic yapti; cikplak `Uint8Array`
// = Uint8Array<ArrayBufferLike> olup SharedArrayBuffer'i da kapsadigi icin
// PushSubscriptionOptions.applicationServerKey (BufferSource) ile uyusmuyordu.
// `new Uint8Array(number)` zaten ArrayBuffer uretir; imza gerceklige hizalandi.
function urlBase64ToUint8Array(b64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (b64.length % 4)) % 4);
  const base64 = (b64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function detectPlatform(): "ios" | "android" | "web" {
  if (typeof navigator === "undefined") return "web";
  const ua = navigator.userAgent || "";
  if (/iPad|iPhone|iPod/.test(ua) && !/Android/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "web";
}

export function useDevicePushSubscription() {
  const { user } = useAuth();
  const [state, setState] = useState<State>(() => ({
    status:
      typeof window === "undefined" || !("PushManager" in window) || !("serviceWorker" in navigator)
        ? "unsupported"
        : !VAPID_PUBLIC_KEY
          ? "no-vapid"
          : "needs-permission",
    permission: typeof Notification !== "undefined" ? Notification.permission : "unknown",
    subscription: null,
    error: null,
  }));

  // Mevcut subscription'ı kontrol et (sessiz, side effect yok).
  useEffect(() => {
    let alive = true;
    if (state.status === "unsupported" || state.status === "no-vapid") return;
    if (typeof Notification === "undefined") return;

    (async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        const existing = await reg.pushManager.getSubscription();
        if (!alive) return;
        if (existing) {
          setState((s) => ({
            ...s,
            status: "subscribed",
            permission: Notification.permission,
            subscription: existing,
            error: null,
          }));
        } else if (Notification.permission === "denied") {
          setState((s) => ({ ...s, status: "denied", permission: "denied" }));
        }
      } catch (e) {
        if (alive) setState((s) => ({ ...s, status: "error", error: String(e) }));
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enable = useCallback(async (): Promise<void> => {
    if (state.status === "unsupported" || state.status === "no-vapid") return;
    if (!user) {
      setState((s) => ({ ...s, status: "error", error: "Önce giriş yapın." }));
      return;
    }
    setState((s) => ({ ...s, status: "subscribing", error: null }));
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setState((s) => ({ ...s, status: "denied", permission: perm }));
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }
      const tokenJson = JSON.stringify(sub.toJSON());
      const platform = detectPlatform();

      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.rpc("register_push_token", {
          p_token: tokenJson,
          p_platform: platform,
          p_device_label: navigator.userAgent.slice(0, 120),
          p_app_version: "1.0.0",
        });
        if (error) {
          setState((s) => ({ ...s, status: "error", error: error.message }));
          return;
        }
        const result = (data ?? {}) as { status?: string; message?: string };
        if (result.status !== "ok") {
          setState((s) => ({ ...s, status: "error", error: result.message || "RPC failed" }));
          return;
        }
      }

      setState((s) => ({
        ...s,
        status: "subscribed",
        permission: "granted",
        subscription: sub,
        error: null,
      }));
    } catch (e) {
      setState((s) => ({ ...s, status: "error", error: String(e) }));
    }
  }, [state.status, user]);

  const disable = useCallback(async (): Promise<void> => {
    if (!state.subscription) return;
    try {
      const tokenJson = JSON.stringify(state.subscription.toJSON());
      await state.subscription.unsubscribe();
      if (isSupabaseConfigured()) {
        await supabase.rpc("unregister_push_token", { p_token: tokenJson });
      }
      setState((s) => ({
        ...s,
        status: "needs-permission",
        subscription: null,
        error: null,
      }));
    } catch (e) {
      setState((s) => ({ ...s, status: "error", error: String(e) }));
    }
  }, [state.subscription]);

  return {
    ...state,
    enable,
    disable,
    canEnable:
      state.status !== "unsupported" &&
      state.status !== "no-vapid" &&
      state.status !== "denied" &&
      state.status !== "subscribing",
  };
}
