// Kill-switch Service Worker.
// Eski PWA Service Worker'ini imha eder, tum cache'leri siler, sayfayi yeniler.
// Bu dosya repo'da kalir; bir sure sonra (3-4 hafta) silinebilir.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch (_) {}

      try {
        await self.registration.unregister();
      } catch (_) {}

      try {
        const clients = await self.clients.matchAll({ type: "window" });
        for (const client of clients) {
          try {
            client.postMessage({ type: "SW_KILLED_RELOAD" });
          } catch (_) {}
        }
      } catch (_) {}
    })()
  );
});

self.addEventListener("fetch", (event) => {
  // Hicbir sey cache'leme. Direkt network'e gec.
  event.respondWith(fetch(event.request));
});
