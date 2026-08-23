# Push Notifications — Web Push Altyapısı (Capacitor Sonrası Köprü)

**Tarih:** 2026-05-31
**Tetikleyici:** Anayasa döngüsünde Capacitor sonrası adımı. Master "yeni tablo SERBEST, onay var" dedi.
**Tag:** `safe-before-push-notif` (baseline, pushed)
**Migration:** `20260527130000_device_push_tokens.sql` — ZATEN VAR, dokunulmadı.

---

## 1) Mevcut Altyapı (Tespit)

| Bileşen | Durum | Yer |
|---|---|---|
| `device_push_tokens` tablo | ✅ Var | migration `20260527130000` |
| RLS owner-only | ✅ Var | aynı migration |
| `register_push_token(token, platform, ...)` RPC (SECURITY DEFINER) | ✅ Var | aynı migration |
| `unregister_push_token(token)` RPC | ✅ Var | aynı migration |
| Bildirim tercihleri (`useNotificationPreferences`) | ✅ Var | Dalga 4-3'te eklenmişti |
| Web Push SW handler | ❌ Yoktu → eklendi |
| Frontend subscribe hook | ❌ Yoktu → eklendi |
| Edge function `push-notifier` | ❌ Yoktu → iskelet eklendi |

Yani backend zaten hazırmış — sadece web push stack'i bağladık.

---

## 2) Eklenenler

### A) `public/push-handler.js` — SW push event listener
- vite-plugin-pwa workbox `importScripts: ['push-handler.js']` ile generated SW'ye katılır.
- Mevcut Workbox precache + runtime caching + Supabase NetworkOnly korumalarına DOKUNMAZ.
- `push` event → `self.registration.showNotification(title, options)`.
- `notificationclick` event → mevcut sekme varsa focus, yoksa `openWindow` (intra-origin doğrulama ile).
- `pushsubscriptionchange` event → no-op (frontend hook bir sonraki açılışta yeniden kayıt eder).

### B) `vite.config.ts` — Workbox importScripts
```ts
workbox: {
  importScripts: ["push-handler.js"],
  // ... mevcut config
}
```
Bu tek satır generated SW'ye push-handler.js'yi importScripts() ile ekler. Workbox runtime caching aynı kalır.

### C) `src/hooks/useDevicePushSubscription.ts` — Frontend hook
- Tarayıcı PushManager üzerinden subscribe (VAPID).
- `register_push_token` RPC ile Supabase'a kaydeder.
- States: `unsupported | no-vapid | needs-permission | denied | subscribing | subscribed | error`.
- Otomatik durum tespiti: mevcut subscription varsa silently `subscribed`.
- `enable()` + `disable()` callback'leri.
- `VITE_VAPID_PUBLIC_KEY` env yoksa "no-vapid" state — UI gracefully disabled.
- Platform tespiti: ios | android | web (UA tabanlı).

### D) `src/pages/NotificationsPage.tsx` — Cihaz bildirim toggle
- /bildirimler sayfasında üstte cyan gradient "Cihaza bildirim (Push)" kartı.
- `BellRing` ikon + durum açıklaması.
- "Bildirimleri aç" CTA (push hook ile) veya "Kapat" + "Aktif" badge.
- Tarayıcı / VAPID / izin sorunlarını mesaj olarak gösterir.

### E) `supabase/functions/push-notifier/index.ts` — Edge function iskelet
- POST /functions/v1/push-notifier
- Body: `{ user_ids, title, body, url?, tag?, icon? }`
- service_role ile `device_push_tokens` tarar.
- Şu an gönderim **iskelet** (console.log) — gerçek web push için VAPID JWT + AES-128-GCM encryption gerek. Master canlı deploy öncesi VAPID env'lerini Supabase secrets'a koyup encryption mantığını ekler.
- CORS + 405 + 400 + 500 error handling.

---

## 3) Anayasa Kanıt

| Test | Sonuç |
|---|---|
| Build | ✅ 17.16s yeşil — **279 entry precache** (önceki 278 + push-handler.js) |
| Playwright EB | ✅ 0 / 104 (52 rota × 2 viewport) |
| Push hook regresyonu | ✅ — /bildirimler sayfası HTTP 200, EB=0, EBox=N |
| Sealed maskeleme | ✅ Supabase NetworkOnly korundu, push-handler dokunmadı |
| Migration | ✅ ZATEN VAR (20260527130000), yeni migration EKLENMEDİ |
| /ilan/:id 500 koruması | ✅ prop-XXX hepsi "İlan bulunamadı" h1 |

**SW push handler test edilebilir mi?**
Lokal test: Chrome DevTools → Application → Service Workers → Push (test payload) butonuyla push.event manuel tetiklenebilir. Bu testi Master canlı deploy sonrası VAPID + Edge function ile yapacak. Lokal preview'da sadece kod sağlığı (build + EB=0) doğrulandı.

---

## 4) Master Yapılacaklar (Üretim Aktivasyonu)

1. **VAPID anahtar üret** (Node + web-push):
   ```bash
   npx web-push generate-vapid-keys
   ```
2. **Supabase secrets ekle**:
   ```
   VAPID_PUBLIC_KEY=BB...
   VAPID_PRIVATE_KEY=AAA...
   VAPID_SUBJECT=mailto:info@ihaleal.com
   ```
3. **Vercel env ekle**: `VITE_VAPID_PUBLIC_KEY=BB...` (aynı public key, build time'da bundle'a girer).
4. **Edge function deploy**:
   ```bash
   npx supabase functions deploy push-notifier --no-verify-jwt
   ```
   *Not: --no-verify-jwt çünkü trigger backend tarafından çağrılır, service_role header ile.*
5. **web-push library ekleyip iskelet → gerçek gönderim**: `supabase/functions/push-notifier/index.ts` içinde TODO yorumları gerçek `pushService.send()` çağrısına dönüştürülür. Deno için `https://deno.land/x/webpush` veya manuel ECDH + HKDF + AES-128-GCM encryption.
6. **Trigger tablo ile bağla**: `listing_offer_notifications`, `saved_search_listing_trigger` ve auction-close cron işleri push-notifier'a HTTP POST yapacak.

---

## 5) Mobile (Capacitor) Native Push

Web push (bu paket) ≠ native push. Capacitor App Store deploy sonrası:
- **iOS**: `@capacitor/push-notifications` + APNs sertifika (Apple Developer)
- **Android**: `@capacitor/push-notifications` + Firebase Cloud Messaging (Google account)
- Cihaz token formatı farklı, `register_push_token` RPC platform parametresi olarak `ios` / `android` gönderir.
- Edge function `push-notifier` ileride platform'a göre çatallanır: web → VAPID, ios → APNs, android → FCM.

Bu Dalga 6 sonrası bir alt iş paketi olarak yapılabilir.

---

## 6) Sıradaki Adım

Anayasa döngüsü:
- ✅ Dalga 5 PWA
- ✅ /ilan/:id 500 fix + tam tarama
- ✅ Capacitor App Store hazırlık paketi
- ✅ Push notifications (bu)
- ▶ **Dalga 6 — i18n EN** (react-i18next zaten kurulu, EN dil paketini tamamla)

Her dalga: 500/hata/boşluk taraması + atomik commit + push.

— bitti —
