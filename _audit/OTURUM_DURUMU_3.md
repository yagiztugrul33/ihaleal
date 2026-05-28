# ihaleal — Sprint 3 Oturum Durumu (2026-05-28)

**Yazıldığı an:** 2026-05-28 ~22:30 (sprint kapanışı)
**Önceki snapshot'lar:** `OTURUM_DURUMU.md` (sprint 1), `OTURUM_DURUMU_2.md` (sprint 2)
**Amaç:** Sprint 3 (DB sertleştirme + Faz 4 + grants restore + main push + Vercel env + DNS) tam kayıt — sonraki oturum hatırlasın.

---

## 🟢 BU SPRINT'TE TAMAMLANANLAR (kronolojik, 4 production deploy + 5 destek)

### A. RB1/RB2 RLS Hardening — commit `c81de0d`

**Atomik production deploy** (2026-05-28 12:28:20 UTC, 36/36 smoke):

- **corporate_leads (3 policy → 2):**
  - DROP `cl_insert_anyone` (dublike INSERT)
  - DROP `allow_select_all` (geniş SELECT — anon+auth tüm satır)
  - CREATE `corporate_leads_select_admin` (profiles.is_admin/role=admin only)
  - `allow_insert_all` KORUNDU → anon form INSERT (CorporateContact.tsx:24) sağlam

- **organizations (2 policy → 2):**
  - DROP `org_public_read` (public sızıntı: contact_email/phone/tax_number/ai_quota_*/settings)
  - CREATE `org_select_admin` (profiles.is_admin)
  - `org_select_member` KORUNDU → active member SELECT (useActiveOrg.ts:34) sağlam

- **bid_bonds (3 policy → 0):**
  - DROP `bid_bonds_insert_self` + `bid_bonds_select_self` + `bid_bonds_update_self`
  - Orphan tablo (prosrc ref=0, rowcount=0) — tablo + grants korundu

Migration: `supabase/migrations/20260528150000_rb1_rb2_rls_hardening.sql`
Deploy: `_audit/migration_deploy/extra_rb1_rb2.sql`
schema_migrations: 32 → 33

### B. Faz 4 pgmq + matching cron + vault pattern — commit `94e4df6`

**Atomik production deploy** (2026-05-28 14:32:53 UTC, 47/47 smoke):

- **Async altyapı:** pgmq extension + 2 queue (q_bulk_listings + q_kyc_prescan) + 3 RPC wrapper (pgmq_send/read/delete)
- **pg_cron job:** `matching-fanout-every-minute` her dakika → `net.http_post` → `matching-fanout` edge function
- **Vault pattern (GUC alternatifi):**
  - `app.functions_url` GUC permission denied (Supabase superuser ister) — **kullanıldı: URL hardcode** `https://wsjifesrdaeorrdzbvmk.supabase.co/functions/v1/matching-fanout`
  - `app.cron_secret` GUC alternatifi: `vault.create_secret('<64-hex>', 'matching_fanout_cron_secret')` (vault.create_secret SECURITY DEFINER, SQL Editor postgres role'den çalışır)
  - Cron job runtime'da `vault.decrypted_secrets` okuyor
- **Edge function deploy:** matching-fanout production'a deploy edildi (önceki tur, `npx supabase functions deploy matching-fanout --no-verify-jwt`)
- **Cron secret:** `4aec8c6c274f08bdbab6520881a5e226fc88a9ad105d882fd1e206cf6b9bcadb` (Dashboard'da edge function `INTERNAL_CRON_SECRET` env var olarak set)

**Cron ilk tetik teyit (deploy + 1 dk):** succeeded @ 14:34:00, AMA edge function 500 db_error (`{"ok":false,"error":"db_error"}`) — listings sorgu hatası → SÜRPRİZ.

Migration: `supabase/migrations/20260516120400_v2_pgmq_matching.sql` (önceden vardı, ilk kez deploy)
Deploy: `_audit/migration_deploy/extra_phase4.sql`
schema_migrations: 33 → 34

### C. db_error teşhis: TÜM SPRINT'İN EN BÜYÜK KEŞFİ

**Hipotez yolculuğu (zincir):**

1. `permission denied for table listings` (Dashboard log)
2. service_role bypassrls=YES ama `listings_service_role_SELECT: MISSING` → GRANT seviyesi sorun (RLS değil)
3. Sistemik tarama (`tmp_grant_full_scan.sql`): 47 tablodan **45'inde service_role SELECT eksik**, **39'unda authenticated SELECT eksik**, **0 tabloda anon SELECT** (sadece 2 view)
4. Migration grep: bizim 4 migration (5fix + RB1/RB2 + Faz 4) tablo grant'i etkilemedi — sadece fonksiyon revoke + policy DROP/CREATE
5. Origin/main (10 gün öncesi 6179800) ve initial schema'da da aynı boşluk → **GRANT eksikliği INITIAL_SCHEMA'dan beri var**, BİZ KIRMADIK
6. Web tarafı `src/lib/supabase.ts` anon key ile bağlanır — direct table SELECT silent fail, RPC çağrıları (SECURITY DEFINER) çalışır
7. Production trafiği 0 + RPC dominant → **görünmez bug**, kimse fark etmedi

### D. Sistemik Grants Restore (Seçenek C) — commit `78c127c`

**Atomik production deploy** (2026-05-28 15:18:04 UTC, 67/67 smoke):

- **service_role:** tüm public CRUD + sequences + functions + **alter default privileges** (yeni tablolar otomatik grant alır)
- **authenticated:** tüm public SELECT + 11 spesifik INSERT/UPDATE/DELETE (watchlist + notifications + profiles + listings + auctions + report_approvals + memberships + authorizations + service_fees + bid_deposits + corporate_leads) + default privileges
- **anon:** KISITLI — sadece listings + auctions SELECT (RLS policy zaten public browse filter: `listings_select_active` status in active/closed, `auctions_select_public` status != draft) + corporate_leads INSERT (RB1 form)
- **Faz 4 cron reschedule** (matching-fanout-every-minute) — grant fix sonrası fonksiyonel

**RLS güvenlik teyit (canlı SELECT analiz):**
- profiles_select_self (auth.uid()=id) + admin → own-only ✓
- listings_select_active → public browse kasıtlı ✓
- bids_select_bidder_or_listing_owner → own-only ✓
- bid_deposits_buyer_self + seller_view + admin → own-only ✓
- 47/47 tablo RLS ENABLED korundu

**Post-deploy cron tetik (deploy + 70 sn):**
- 3 ardışık 200 OK (15:19/15:20/15:21)
- Body: `{"ok":true,"processed":0}` — permission denied tamamen gitti
- matching-fanout fonksiyonel

Migration: `supabase/migrations/20260528170000_grants_restore_systemic.sql`
Deploy: `_audit/migration_deploy/extra_grants_restore.sql`
schema_migrations: 34 → 35

### E. Main Push + Web Bundle + REST API Canlı Kanıt — commit `3fd5776`

**main push:** `6179800..3fd5776 main -> main` (31 commit, 2026-05-28 15:43)

**3 workflow sonucu:**
- ✅ Supabase v2 Deploy: SUCCESS (migration push no-op, 35/35 skip + 5 edge function deploy)
- ⚠️ CI: FAILURE step 13 (`check-bundle-budget.mjs`) — **PRE-EXISTING** (10 gün öncesi 6179800 commit'inde de AYNI fail, kanıt: GitHub API run jobs)
- ⚠️ Deploy Vercel CLI: FAILURE 0 sn (secret eksik) — **PRE-EXISTING** + Vercel Git Connect deploy yaptı (Last-Modified 15:48)

**Bundle teyit (Vercel env eklendi sonrası):**
- Önceki bundle: `placeholder.supabase.co` + placeholder anon JWT → web Supabase'e hiç bağlanmıyordu
- Sonraki bundle (`index-yqeQzcpp.js`): **gerçek `wsjifesrdaeorrdzbvmk` URL + gerçek anon JWT** (decode: `{"iss":"supabase","ref":"wsjifesrdaeorrdzbvmk","role":"anon"}`)

**REST API canlı kanıt (anon JWT bundle'dan extract):**

| Test | Endpoint | Sonuç | Beklenti |
|---|---|---|---|
| listings (anon SELECT açık) | `/rest/v1/listings?select=id&limit=1` | **200 + []** | ✅ GRANT çalışıyor |
| auctions (anon SELECT açık) | `/rest/v1/auctions?select=id&limit=1` | **200 + []** | ✅ GRANT çalışıyor |
| profiles (anon yasak) | `/rest/v1/profiles` | **401 + permission denied (SQLSTATE 42501)** | ✅ PII korunuyor |
| bids (anon yasak) | `/rest/v1/bids` | **401 + permission denied** | ✅ Kullanıcı verisi korunuyor |
| bid_deposits (anon yasak) | `/rest/v1/bid_deposits` | **401 + permission denied** | ✅ Finansal veri korunuyor |
| view (anon SELECT açık) | `/rest/v1/auction_bid_public_summary` | **200 + []** | ✅ View grant çalışıyor |

**Vercel env ekleme:** Master Vercel Dashboard'tan `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` Production + Preview environment'a ekledi → Vercel auto-redeploy (1m12s) → bundle gerçek URL/key ile build.

**Cloudflare DNS geçişi:** Master nameserver'ları dnsenable.com → Cloudflare'e geçirdi (R11 in progress, propagation bekleniyor).

### F. R5 CI ön-kontrol — commit `3fd5776` (audit doc parça)

Lokal CI simülasyonu (10 step PASS, 2 SKIP):
- typecheck + precheck:encoding + test:run (151+2) + build (12.72s) + test:rls (8/8) + test:coverage (80%) + bundle-budget (lokal 455 KB PASS — CI'da 827 KB FAIL) + lint:ci + security:audit (--audit-level=high exit 0) + rls:matrix

Migration uyum: 35 local file = 35 production schema_migrations row → db push --include-all no-op (hepsi skip).

---

## 🟡 SPRINT 3 KEŞİFLERİ (kayıt, sonraki oturum bilsin)

### Keşif 1 — GRANT bug INITIAL_SCHEMA'dan beri var

**Kanıt:** `supabase/migrations/20260428120000_initial_schema.sql` 116 satır, `grep "grant"` = 0 sonuç. Sonraki migration'lar sadece spesifik akışlar için tek tek grant ekledi (memberships, service_fees, pre_launch, bid_bonds — toplam 4 migration). listings/profiles/bids/auctions/bid_deposits/buyer_preferences/listing_matches/notifications/watchlist için **kimse grant eklemedi**. Origin/main (10 gün öncesi production) ve local main aynı boşluk. **Tüm 4 sprint öncesi de aynı.**

### Keşif 2 — Web Vercel bundle PLACEHOLDER ile build edilmişti

**Kanıt:** Production bundle `index-DXij52SN.js` → `placeholder.supabase.co` + `eyJ...placeholder` JWT. src/lib/supabase.ts fallback PLACEHOLDER_URL/KEY → env yoksa kullanılır.

**Sebep:** `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` Vercel Environment Variables panel'inde **hiç set edilmemişti**. 10 gün önceki production'da da aynı durum.

**Etki:** Web statik render OK ama hiçbir Supabase API çağrısı çalışmıyor — silent fail. Production trafiği 0 + RPC dominant → kimse fark etmedi.

**Düzeltme:** Sprint sonu master Vercel Dashboard'tan iki env değişkenini Production + Preview için ekledi → auto-redeploy → gerçek bundle.

### Keşif 3 — Cloudflare DNS migration (devam ediyor)

**Eski:** dnsenable.com (tr/us/eu) → ihaleal.com A 185.33.234.105 (LiteSpeed cPanel placeholder)
**Hedef:** Cloudflare DNS → ihaleal.com A 76.76.21.21 (Vercel apex) + CNAME www → cname.vercel-dns.com
**Mevcut HTTP:** ihaleal.com şu an cPanel default sayfası (cgi-sys/defaultwebpage.cgi) — gerçek site yok
**E-posta (korunmalı):** MX `mx01.ihaleal.com` + SPF `v=spf1 ip4:93.89.226.0/24 ip4:93.89.232.0/24 -all`
**Reverse:** A record geri çevrilir, reversible

### Keşif 4 — CI bundle budget fail pre-existing

**Kanıt (GitHub Actions API):**
- 3fd5776 (bugün) — step 13 `check-bundle-budget.mjs` failed 0 sn
- 6179800 (10 gün öncesi production) — aynı step, aynı 0 sn fail

**Sebep:** Vercel/CI build'inde index bundle 827 KB (lokal 198 KB). Vite chunk splitting CI env'inde farklı output. Lokal `npm run build` + `check-bundle-budget` → vendor-charts 455 KB / limit 800 KB PASS. CI'da en büyük chunk 827 KB > 800 KB → exit 1.

**Etki:** Workflow yeşil olmuyor ama production build çalışıyor. R6 olarak listelendi.

### Keşif 5 — Vercel CLI workflow secret pre-existing fail + Git Connect tek mekanizma

**Kanıt:** deploy-vercel.yml `if: secrets.VERCEL_TOKEN != ''` ama 0 sn fail → ya secret var ama yanlış değer ya condition farklı. Önceki commit'te de aynı fail.

**Çözüm:** Vercel'in Git Connect integration'ı her push'ta otomatik deploy yapıyor (sprint sonu Last-Modified 21:59 = ana sayfa fetch). Workflow CLI tek başına gereksiz. R7 olarak listelendi (devre dışı bırakma opsiyonu).

---

## 🔵 PRODUCTION DURUMU (sprint başı vs sonu karşılaştırma)

| Metrik | Sprint başı | Sprint sonu |
|---|---|---|
| **schema_migrations** | 31 satır | **35 satır** (+4) |
| Production migration gap | 1 (Faz 4 deploy edilmedi) | **0** |
| Edge function matching-fanout deploy | Yok | **Var** (2026-05-28 deploy) |
| Cron pipeline | Yok | **matching-fanout-every-minute 200 OK her dakika** |
| service_role SELECT tablo | 2/47 (memberships + bid_bonds) | **47/47 + 2 view** |
| authenticated SELECT tablo | 6/47 + 2 view | **47/47 + 2 view** |
| anon SELECT tablo | 0/47 + 2 view | **2/47 + 2 view** (listings + auctions, public browse) |
| Vercel build env | placeholder (URL + key) | **gerçek wsjifesrdaeorrdzbvmk + anon JWT** |
| Web → Supabase API | Placeholder DNS fail | **GRANT canlı kanıt (curl 200 + [])** |
| 5fix bundle (Faz 1.2/1.9/1.10/1.11) | Henüz deploy değil | **Deploy edildi** (önceki sprint sonu) |
| corp_leads policy | 3 (dublike + geniş + INSERT) | **2** (admin-only SELECT + anon INSERT) |
| organizations policy | 2 (public_read + member) | **2** (admin + member) |
| bid_bonds policy | 3 (orphan) | **0** (clean) |
| main commit | 6179800 origin (10 gün eski) | **3fd5776 origin senkron** (31 commit push'lu) |
| RLS=ON tüm tablo | 47/47 | **47/47** (korundu) |

### Güvenlik durumu

- ✅ KYC guard (execute_buy_now + register_bid_deposit) — sunucu
- ✅ Faz 1 (bids private + view public) — anon PII korunuyor
- ✅ 5-fix bundle (place_bid deposit guard + 3 RPC auth + revoke PUBLIC)
- ✅ RB1/RB2 (corp_leads admin-only + org member-only + bid_bonds orphan)
- ✅ Faz 4 vault pattern (cron secret encrypted)
- ✅ **Sistemik grants** (service_role admin + authenticated RLS-filtered + anon kısıtlı)
- ✅ **3 anon yasak canlı teyit** (profiles + bids + bid_deposits → 401)
- ✅ 47/47 RLS ENABLED

### Sayısal kanıt (sprint sonu)

- 4 production migration deploy (5fix + RB1/RB2 + Faz 4 + grants restore)
- 5 atomik smoke: 27/27 + 36/36 + 47/47 + 67/67 + RLS contract 8/8
- 0 destructive operation
- 0 push --force
- 0 rollback
- 0 production data kaybı
- 100% atomik koruma (smoke fail → abort)

---

## 🔴 KALAN İŞLER (kısa özet, detay `_audit/KALAN_ISLER.md`'de)

1. **R11 DNS** — Cloudflare nameserver geçişi yapıldı, propagation bekleniyor (5 dk - 24 saat)
2. **R6 CI bundle budget fail** — pre-existing, R6'da vite chunk splitting fix
3. **R7 Vercel CLI workflow** — Git Connect tek mekanizma, workflow devre dışı bırakma opsiyonu
4. **R8 KYC verify F1.1** — release-blocker (manuel admin RPC veya gerçek iyzico entegrasyon karar)
5. **R10 K-M3 mobile mock → Supabase** — Cursor ADIM 1 teşhis bitti (master notu), plan bekliyor
6. **R12 isimtescil hosting iptal** — gereksiz paket kontrol (paket yoksa atla)
7. **Dashboard yanlış SQL temizlik** — Corporate leads test insert/RLS query'leri Dashboard SQL Editor history'de
8. **RB5-a screen capture EAS build** — autolinking doğrulama (Cursor commit 2614cda, master notu)
9. **Mobile env (EXPO_PUBLIC_*)** — K-M3 plan içinde netleşecek

---

## ⚠️ KRİTİK KURALLAR (sprint 3 boyunca uygulandı, devam etmeli)

1. **main'e push** — bu sprint sonu yapıldı (3fd5776), workflow tetiklendi, Supabase SUCCESS + Vercel Git Connect deploy başarılı. Sonraki push'lar için CI bundle budget fix öncelikli olabilir.
2. **Atomik deploy + smoke** — her migration `do $regress$ ... raise exception` ile transaction içinde, fail → abort, DB değişmez. **Sıfır rollback rekoru korundu.**
3. **Reverse SQL hazır** — her extra_*.sql'in header yorum bloğunda atomik geri-alma. Hiç kullanılmadı bu sprintte.
4. **Salt-okuma teşhis önce** — her sürpriz (db_error, GRANT bug, bundle placeholder) önce canlı SELECT/grep ile kanıtlandı, sonra düzeltme.
5. **Çekirdeğe (src/lib) dokunulmadı** — bu sprint sadece SQL + audit doc + 1 Vercel env değişikliği. Web/mobile kod değişmedi (Cursor RB4 önceki sprintte).
6. **Sürpriz çıkınca DUR + raporla + karar bekle** — master kararı olmadan otomatik karar verilmedi (özellikle GRANT geniş/dar seçimi, vault pattern kararı).
7. **Production'a yazma izni "BAS" + spesifik komut** — her deploy explicit master onayı (BAS RB1+RB2, BAS Faz 4 deploy, BAS grants deploy, BAS main push).

---

## 📂 ÇALIŞMA YAPISI

### İki Worktree

```
C:\Users\yagiz\Documents\GitHub\ihaleal               ← Ana worktree
  branch:        main (3fd5776, origin senkron ✓)
  agent:         Claude Code
  sorumluluk:    Çekirdek (src/lib), Supabase migrations, deploy, production
                 yazma, müfettiş turları, repo yönetimi

C:\Users\yagiz\Documents\GitHub\ihaleal-mobile        ← Cursor worktree
  branch:        feat/mobile-calculators (4da7c43, origin senkron ✓)
  agent:         Cursor
  sorumluluk:    Mobile UI (mobile/src/app/**), navigation, KVKK ekranlar,
                 push integration, mobil testler, EAS build
```

### Sprint 3 commit hash'leri (4 ana + 5 audit)

```
3fd5776 docs(audit): R5 CI ön-kontrol — RLS matrix güncel + schema_migrations liste
78c127c wip(security): sistemik grants restore — service_role/auth/anon table grants + Faz 4 cron reschedule
94e4df6 wip(security): Faz 4 deploy — pgmq + matching cron + vault pattern
7a9d684 docs(audit): Faz 4 hazırlık — extra_phase4.sql atomik deploy + canlı tespit
c81de0d wip(security): RB1+RB2 RLS hardening — corporate_leads + organizations + bid_bonds orphan policy cleanup
b400b42 docs(audit): cursor RB5 komutu + archive paket + RB1/RB2 precheck
2c9bea6 docs(audit): cursor RB4 komutu - mobil sertlestirme  (sprint 2 sonu)
```

### Sprint 3 deploy zaman damgaları

```
2026-05-28 12:28:20  RB1/RB2 RLS hardening   (smoke 36/36)
2026-05-28 14:32:53  Faz 4 pgmq + cron       (smoke 47/47) — db_error sürpriz
2026-05-28 15:18:04  Grants restore systemic (smoke 67/67) — cron 200 OK
2026-05-28 15:43:00  main push (31 commit)
2026-05-28 15:48:28  Vercel Git Connect deploy
2026-05-28 21:59:27  Vercel auto-redeploy (env eklendi sonrası, bundle gerçek URL)
2026-05-28 22:xx:xx  Cloudflare DNS NS geçişi (devam)
```

---

## 🎯 SONRAKİ OTURUM SIRADAKİ ADIM

**Sprint 3 büyük resim kapandı.** Sonraki oturum öncelik kararı:

1. **R11 DNS doğrulama** — Cloudflare propagation tamamlandı mı (nslookup + curl https://ihaleal.com → Vercel)
2. **R8 KYC verify** — F1.1 release-blocker, manuel admin RPC kararı (geçici test) veya gerçek iyzico entegrasyon (uzun)
3. **R10 K-M3 mobile mock → Supabase** — Cursor'ın hazırladığı plan değerlendirmesi
4. **R6 CI bundle budget fix** — vite chunk splitting (workflow yeşil için, prod etkilenmiyor)

**Bağlam dosyaları (sonraki oturum oku):**
1. `_audit/OTURUM_DURUMU_3.md` (bu dosya — sprint 3 özet)
2. `_audit/KALAN_ISLER.md` (R6-R12 detay)
3. `_audit/OTURUM_DURUMU_2.md` (sprint 2 özet — tarihsel)
4. `_audit/OTURUM_DURUMU.md` (sprint 1 özet — tarihsel)
5. `_audit/GARANTI_YOL_KURALLARI.md` (kurallar — değişmedi)
6. `_audit/journal.txt` (transcript journal)
7. `_audit/SISTEM_ROENTGENI.md` (DB+web+mobile inventory — sprint 1)
8. `_audit/archive/sprint3/` (12 tmp SQL audit kanıt — bu sprint'in teşhis sorguları)

**KRİTİK HATIRLATICILAR:**
- Production şu an SAĞLAM ve GÜNCEL (DB + web + edge function pipeline aktif)
- Vercel'de gerçek bundle (placeholder gitti)
- DNS Cloudflare'de (propagation bitince ihaleal.com → Vercel)
- R8 KYC verify olmadan production "demo" durumda (0 listings, 0 auctions, 4 user kyc=none)
- Cursor RB4 push'lu (4da7c43), RB5 komutu yazılmış ama henüz yapıştırılmamış olabilir

**Sıfır acil durum.** Production çalışıyor, sprint 3 başarıyla kapatıldı.
