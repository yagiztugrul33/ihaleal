# 12+1 Migration Deploy Planı — Production (wsjifesrdaeorrdzbvmk)

**Tarih:** 2026-05-27 (gece hazırlık)
**Durum:** ⏸ ONAY BEKLİYOR — hiçbir SQL production'a basılmadı
**Yöntem:** CLI `supabase db query --linked --file ...` (db push DEĞİL)
**Hedef:** Production'daki 13 eksik migration'ı sırayla, faz faz, smoke + reverse hazır olarak uygula

## Önkoşul Yapıldı (✅)

- Repo temizliği: 5 migration main'e kondu (commit `34315c8`), trade_offers UTF-8, duplicate timestamp düzeltildi
- main'de 31 migration; lokal commit, push YOK
- KYC guard (Faz öncesi) zaten deploy edildi (2026-05-27 önce)
- Production okuma denetimi yapıldı: bids public-read açığı KESİN, rate_limit_buckets RLS yok

## Faz Sırası

| Faz | Ad | Migration sayısı | Risk | Süre | Bağımlılık | Durum |
|-----|----|------------------|------|------|------------|-------|
| **1** | Güvenlik fix'leri | 2 | 🟢 Düşük (izole) | <5 dk | yok | ⏸ HAZIR |
| **2** | Temel veri modeli | 4 | 🟡 Orta (IF NOT EXISTS idempotent) | 5-10 dk | yok | ⏸ HAZIR |
| **3a** | Engineering + iBuyer ailesi | 4 | 🟡 Orta | 5-10 dk | Faz 2 | ⏸ HAZIR |
| **3b** | GES + P2P trade + Moderation | 3 | 🟡 Orta | 5-10 dk | Faz 2 | ⏸ HAZIR |
| **4** | Async altyapı (pgmq) | 1 | 🟠 Yüksek (Dashboard extension gerek) | 5-10 dk + Dashboard | pgmq + pg_cron extension | ⏸ HAZIR (Dashboard adımı bekliyor) |
| **Ek** | device_push_tokens (K1+K4 çözüm) | 1 | 🟢 Düşük (tamamen yeni) | <3 dk | Faz 2 önerilir (tg_set_updated_at trigger için) | ⏸ HAZIR (yeni 20260527130000) |

## Migration Eşleştirmesi

### Faz 1 — Güvenlik
1. `20260526200500_harden_rate_limit_buckets_rls.sql`
2. `20260521221500_harden_bids_visibility_and_public_views.sql`

### Faz 2 — Veri Modeli
1. `20260516120001_v2_core_safety_additive.sql` *(zaten uygulanmış, sadece schema_migrations INSERT)*
2. `20260516120100_v2_multi_tenant.sql` *(organizations kısmen uygulanmış — IF NOT EXISTS güvenli)*
3. `20260516120200_v2_liquidity.sql`
4. `20260516120300_v2_kyc_moderation_bulk.sql`

### Faz 3a — Engineering Altyapısı + iBuyer/Takas Ailesi
1. `20260517140000_land_ges_intelligence.sql`
2. `20260517150000_engineering_war_room.sql`
3. `20260518120000_ibuyer_trade_in.sql`
4. `20260518200000_takas_enhancements.sql`

### Faz 3b — GES + P2P Trade + Moderation Hardening
5. `20260518140000_ges_land_evaluation.sql`
6. `20260518300000_trade_offers.sql`
7. `20260526162000_harden_events_moderation_rls_soft_delete.sql`

### Faz 4 — Async Altyapı
1. `20260516120400_v2_pgmq_matching.sql` *(Dashboard'da pgmq + pg_cron extension aktif olmalı; app.functions_url + app.cron_secret GUC'leri ayarlanmalı)*

## Faz Dosyaları

Her faz dosyası:
- **DEPLOY** bölümü: BEGIN/COMMIT içinde tüm migration SQL'leri + schema_migrations INSERT
- **SMOKE** bölümü: faz sonu doğrulama (RLS aktif mi, tablo var mı, fonksiyon var mı, vb.)
- **REVERSE** bölümü: acil geri-alma SQL'leri (yorum içinde — yanlışlıkla çalışmasın)

Çalıştırma:
```bash
npx supabase db query --linked --file _audit/migration_deploy/phase1_security.sql --output json
```

Her faz sonrası **DUR + smoke kontrol + kullanıcı onayı** → sonraki faz.

## Smoke Tedbirleri

- Production'da hiç verified user yok (4 user, hepsi kyc=none)
- Behavioral smoke için random UUID kullanılır (yazma yapmaz, fonksiyonlar erken return)
- Schema doğrulaması SELECT ile yapılır (information_schema / pg_class / pg_policies)

## Reverse Politika

- Her migration'ın reverse SQL'i hazır
- Reverse çalıştırılması gerekirse: önce smoke ile hangi tablo/fonksiyon var teyit et, sonra sadece o spesifik reverse'i çalıştır
- `CREATE OR REPLACE FUNCTION` ile yapılan değişiklikler: önceki body'yi yeni migration olarak deploy et
- `CREATE TABLE` ile eklenen tablolar: `DROP TABLE` (veri kaybı!) — sadece veri yokken
- RLS policy değişiklikleri: drop + create reverse

## Kritik Notlar

- **Faz 4 öncesi Dashboard:** Supabase Dashboard'da Database → Extensions → pgmq ve pg_cron etkinleştirilmeli; ardından
  ```sql
  alter database postgres set app.functions_url = 'https://wsjifesrdaeorrdzbvmk.functions.supabase.co';
  alter database postgres set app.cron_secret = '<gizli>';
  ```
  bu komutlar Faz 4 öncesi MANUEL kullanıcı tarafından konsol/SQL editor üzerinden çalıştırılmalı.
- **Schema_migrations format:** `version text NOT NULL`, `name text`, `statements text[]` (KYC guard'da doğrulandı).
- **Push edilmemiş main commit'leri:** 6 commit local main'de (origin/main: `6179800`). main push edilirse `supabase-v2-deploy.yml` workflow'u tetiklenir ve `db push --include-all` bu 13 migration'ı CI üzerinden uygulamaya kalkar → şu an istenmiyor. main push **YALNIZCA bu 4 faz tamamen başarılı tamamlandıktan sonra** ele alınır.
- **Cursor iş alanı:** `ihaleal-mobile` worktree'sine (feat/mobile-calculators) HİÇ DOKUNULMAZ. Bu deploy planı sadece ana repo (main) ve production üzerine.

## Onay İşareti

Kullanıcı her faz için ayrı **"BAS Faz N"** demeli. Tek bir "BAS" emri tüm fazları çalıştırmaz.
