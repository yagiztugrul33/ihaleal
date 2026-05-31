/**
 * Web Push Notification handler — Service Worker eklentisi.
 *
 * vite-plugin-pwa workbox `importScripts` ile generated SW'ye katılır.
 * Workbox precache + runtime caching + KRİTİK Supabase NetworkOnly korumalarına
 * EK olarak çalışır — onlara DOKUNMAZ.
 *
 * Backend `push-notifier` Edge function'ı VAPID ile aşağıdaki payload'u gönderir:
 *   { title, body, url?, icon?, badge?, tag? }
 *
 * Dalga 5 / Capacitor sonrası — backend onayı dahilinde.
 */

self.addEventListener("push", (event) => {
  let payload = { title: "ihaleal", body: "Yeni bildirim" };
  try {
    if (event.data) {
      payload = { ...payload, ...event.data.json() };
    }
  } catch (_) {
    // payload JSON değilse text deneme
    try {
      payload.body = event.data ? event.data.text() : payload.body;
    } catch (_) {
      /* sessiz */
    }
  }

  const options = {
    body: payload.body || "",
    icon: payload.icon || "/icon-192.png",
    badge: payload.badge || "/icon-192.png",
    tag: payload.tag || "ihaleal-default",
    data: {
      url: payload.url || "/",
      timestamp: Date.now(),
    },
    requireInteraction: false,
    silent: false,
  };

  event.waitUntil(self.registration.showNotification(payload.title || "ihaleal", options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/";

  // Mevcut sekme açıksa focus, değilse yeni sekme.
  event.waitUntil(
    (async () => {
      try {
        const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
        for (const client of all) {
          try {
            const url = new URL(client.url);
            const origin = self.location.origin;
            if (url.origin === origin) {
              await client.focus();
              if ("navigate" in client) {
                await client.navigate(target);
              }
              return;
            }
          } catch (_) {
            /* sessiz */
          }
        }
        if (self.clients.openWindow) {
          await self.clients.openWindow(target);
        }
      } catch (_) {
        /* sessiz */
      }
    })(),
  );
});

self.addEventListener("pushsubscriptionchange", (event) => {
  // Tarayıcı subscription'ı yeniden üretirse: backend'e haber ver.
  // Şu an no-op — useDevicePushSubscription hook bir sonraki açılışta
  // mevcut subscription'ı kontrol edip RPC'yi yeniden çağıracak.
  event.waitUntil(Promise.resolve());
});
