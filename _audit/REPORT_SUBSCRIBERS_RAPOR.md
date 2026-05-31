# report_subscribers Backend Tamamlama — ANAYASA Raporu

**Tarih:** 2026-05-31
**Tag:** `safe-before-subscribers` (baseline, pushed)
**Tetikleyici:** Anayasa döngüsü — Master onay verdi ("yeni tablo SERBEST, onay var"). /raporlar abone formunu placeholder'dan canlı RPC'ye bağlamak.

---

## 1) Yapılanlar

### A) Migration `20260605120000_report_subscribers.sql`
- Tablo `public.report_subscribers`:
  - id (uuid pk)
  - email (text unique, lowercase lookup via fonksiyonel index)
  - cities text[] (boş = tümü)
  - categories text[] (konut/ticari/arsa filtresi)
  - confirmed_at timestamptz (double opt-in)
  - confirmation_token text (mail link için)
  - unsubscribe_token text (tek tık çıkış için)
  - ip_hash text (sha256, audit/rate-limit için; sade IP saklanmaz)
  - created_at + updated_at + auto-trigger
- 2 index: confirmed scan (partial), email lower-case unique
- RLS:
  - anon SELECT yok (gizlilik)
  - anon INSERT/UPDATE doğrudan yok (RPC dışı yol kapalı)
  - service_role bypass (Edge function için)
- 3 RPC (SECURITY DEFINER, search_path=public):
  - `subscribe_to_reports(email, cities, categories, ip_hash)` — idempotent upsert, yeni token üretir
  - `confirm_subscription(token)` — confirmed_at set
  - `unsubscribe_reports(token)` — delete
- grant execute anon + authenticated

### B) Edge function `supabase/functions/report-notifier/index.ts`
- POST /functions/v1/report-notifier (service_role auth)
- Body: `{ dry_run?: boolean, limit?: number }`
- service_role ile confirmed_at NOT NULL aboneleri tarar
- Her aboneye Türkçe HTML mail (koyu tema + cyan CTA + unsubscribe link)
- Resend API entegrasyonu (RESEND_API_KEY env ile aktif; yoksa skip mod)
- Aylık etiket otomatik: `${MONTH_NAMES[ay]} ${yıl}`
- CORS + 405 + 400 + 500 error handling
- Master canlı deploy: secrets ekle (`RESEND_API_KEY`, `MAIL_FROM`, `APP_BASE_URL`) + cron trigger

### C) `src/pages/Reports.tsx` — abone formu RPC'ye bağlandı
- `useState`: status `idle | submitting | saved | error`, message
- `handleSubscribe` artık async:
  1. `isSupabaseConfigured()` check
  2. `supabase.rpc("subscribe_to_reports", { p_email, p_cities, p_categories })`
  3. Hata → `setSubscribeStatus("error")` + mesaj
  4. Başarı → `setSubscribeStatus("saved")` + RPC dönen message
- Cities/categories filtreden otomatik dolar (kullanıcının baktığı şehir/kategori)
- "Gönderiliyor…" butonu submitting durumunda
- Error UI (rose-500 bg + rose text) + role="alert"
- Double opt-in açıklaması güncellendi

---

## 2) Anayasa Kanıt

| Test | Sonuç |
|---|---|
| Build | ✅ 25.55s yeşil, 279 entry precache aynı |
| Playwright tam tarama | ✅ 104/104 PASS (TR) |
| /raporlar render | ✅ Abone form HTTP 200 + EB=0 |
| Sealed maskeleme | ✅ değişmedi (yeni tablo bağımsız) |
| Migration güvenli | ✅ idempotent, `create table if not exists`, mevcut yapıya dokunmuyor |
| RLS anon doğrudan INSERT | ✅ kapalı — yalnız RPC üzerinden |
| `subscribe_to_reports` SECURITY DEFINER | ✅ search_path=public, email validation, idempotent upsert |
| Cursor lane | ✅ stash/restore korundu |
| Görünürlük | ✅ Abone Button artık `!bg-violet-500 !text-white` ile kontrast korunuyor |

---

## 3) Master Canlı Aktivasyon Adımları

1. Migration push:
   ```bash
   npm run supabase:push
   # veya
   supabase db push
   ```
2. Secrets (Supabase Dashboard → Edge Functions → Secrets):
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxx
   MAIL_FROM="ihaleal <info@ihaleal.com>"
   APP_BASE_URL=https://ihaleal.com
   ```
3. Edge function deploy:
   ```bash
   npx supabase functions deploy report-notifier --no-verify-jwt
   ```
4. Cron trigger (Supabase pg_cron):
   ```sql
   select cron.schedule(
     'report-notifier-monthly',
     '0 9 1 * *',   -- her ayın 1'i 09:00 UTC
     $$ select net.http_post(
          url := 'https://wsjifesrdaeorrdzbvmk.supabase.co/functions/v1/report-notifier',
          headers := '{"Authorization":"Bearer SERVICE_ROLE_KEY"}'::jsonb,
          body := '{}'::jsonb
        ) $$
   );
   ```
5. Confirmation mail handler:
   - Master tercih ederse Resend transactional mail template eklenir.
   - Veya basit endpoint: `/abone/onay?t=<token>` confirm_subscription RPC çağırır.
   - `/abone/iptal?t=<token>` unsubscribe_reports RPC çağırır.
   - (Bu sayfalar mikro-dalga olarak sonraki adımda eklenebilir.)

---

## 4) Bilinen Sınırlar

| Konu | Durum |
|---|---|
| Confirmation mail gönderimi | Şu an RPC sadece DB kaydı yapar — gerçek mail Master Resend setup'tan sonra |
| `/abone/onay` + `/abone/iptal` sayfaları | Mikro-dalga adayı (RPC çağıran basit sayfa) |
| Rate-limit | ip_hash kolon var ama trigger yok — Master istek üzerine eklenir |
| Cron job | pg_cron Master tarafından `npm run supabase:push` sonrası açılır |
| EN dil mail içeriği | Türkçe template var; EN şablonu Dalga 6 mikro-dalga |

---

## 5) Sıradaki Anayasa Döngüsü

Brief sırası:
1. ✅ Görünürlük + 500 teyit
2. ✅ report_subscribers backend (bu)
3. ▶ **EN i18n mikro-dalgalar** (giriş + kayıt + profil)
4. Kalan polish

Her dalga 500/EB/görünürlük taraması + atomic commit + push.

— bitti —
