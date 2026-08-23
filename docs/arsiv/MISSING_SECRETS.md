# MISSING_SECRETS — Eksik ortam değişkenleri / gizli anahtarlar (şablon)

> Bu dosya **şablondur**; gerçek değer içermez. Gerçek değerleri asla repoya commit'lemeyin.
> Web (Vite) değişkenleri `.env.local` dosyasına, Edge Function / worker sırları ise
> Supabase Dashboard → Edge Functions → Secrets (veya ilgili deploy ortamına) girilir.
> Şablon kaynakları: `env.local.SABLON`, `.env.example`, `.env.production.example`.

## 1. Web build (Vite) — `.env.local` (repo kökü)

Durum: repo taze klonlandığında `.env.local` YOK. `npm run validate:env` şu uyarıları veriyor:
`VITE_SUPABASE_URL missing or placeholder`, `VITE_SUPABASE_ANON_KEY missing or placeholder`.
Build yine de tamamlanıyor (strict olmayan mod), ancak canlı Supabase bağlantısı çalışmaz.

```env
# ZORUNLU (uygulamanın veri katmanı için)
VITE_SUPABASE_URL=            # https://<PROJE_REF>.supabase.co — Supabase Dashboard → Settings → API
VITE_SUPABASE_ANON_KEY=       # anon/publishable anahtar (tek satır)

# SUNUCU TARAFI (script'ler: seed/smoke/migration — tarayıcıya gitmez, GİZLİ tut)
SUPABASE_SERVICE_ROLE_KEY=    # service_role anahtarı
SUPABASE_PROJECT_REF=         # Supabase Reference ID (örn. wsjifesrdaeorrdzbvmk)

# OPSİYONEL
VITE_PAYMENT_MODE=            # mock | live (üretimde PSP denetimi bitmeden "live" KULLANMA)
VITE_ALLOW_LOCAL_AUTH=        # üretimde false; yalnız geliştirmede true
VITE_SENTRY_DSN=              # Sentry hata izleme (opsiyonel)
VITE_VAPID_PUBLIC_KEY=        # Web push bildirimleri için VAPID public key (opsiyonel)
VITE_TCMB_PROXY_URL=          # TCMB proxy edge function URL'i (opsiyonel)
```

## 2. Supabase Edge Functions — Dashboard → Edge Functions → Secrets

`supabase/functions/*` içinde `Deno.env.get(...)` ile okunan sırlar:

```env
SUPABASE_URL=                 # otomatik sağlanır (Supabase platformu)
SUPABASE_ANON_KEY=            # otomatik sağlanır
SUPABASE_SERVICE_ROLE_KEY=    # otomatik sağlanır
ALLOWED_ORIGINS=              # örn. https://ihaleal.vercel.app,https://ihaleal.com
APP_BASE_URL=                 # canlı site URL'i
ENVIRONMENT=                  # production | staging
INTERNAL_CRON_SECRET=         # cron tetikleyicileri için paylaşılan gizli anahtar

# Ödeme — PayTR
PAYTR_MERCHANT_ID=
PAYTR_MERCHANT_KEY=
PAYTR_MERCHANT_SALT=

# Ödeme — iyzico
IYZICO_API_KEY=
IYZICO_SECRET_KEY=
IYZICO_BASE_URL=              # örn. https://api.iyzipay.com (veya sandbox)

# E-posta
RESEND_API_KEY=               # Resend e-posta gönderimi
MAIL_FROM=                    # gönderen adres (örn. no-reply@ihaleal.com)

# Yapay zekâ
ANTHROPIC_API_KEY=            # Claude API
OPENAI_API_KEY=               # OpenAI API
OPENAI_MODEL=                 # opsiyonel model adı

# TCMB EVDS (vergi/endeks simülatörü — tcmb_yiufe fonksiyonu)
TCMB_EVDS_API_KEY=            # https://evds2.tcmb.gov.tr/ ücretsiz anahtar
TCMB_EVDS_KEY=                # (kodda her iki ad da aranıyor)
```

## 3. Worker (`workers/bulk-listing`) — deploy ortamı env'i

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

## 4. Script/CI değişkenleri (opsiyonel, yalnız ilgili script çalıştırılırken)

```env
AUDIT_BASE=                   # smoke testlerin hedef URL'i
PROD_URL= / PREVIEW_URL= / LOCAL_URL= / QA_TARGET= / BASE=
SAMPLE_PROJECT_ID= / SAMPLE_LISTING_ID= / DEMO_SEED_SELLER_ID=
VITE_DEV_PORT=                # dev sunucu portu
```
