# R14 P0 FIX — SALT-OKUNUR DOĞRULAMA RAPORU (v2)

**Tarih:** 2026-05-30  
**Yöntem:** Salt-okuma (grep + dosya okuma + canlı HTTP/curl). Kod ve git **değiştirilmedi**.  
**Repo:** `C:\Users\yagiz\Documents\GitHub\ihaleal`  
**Doğrulanan commit:** `ffc7b22` (HEAD, `origin/main` ile senkron)

---

## ÖZET

| Alan | Sonuç |
|------|-------|
| **KOD FIX** | **PASS** ✅ |
| **RLS INSERT HAZIR MI** | **HAYIR** ❌ — eksik: `organizations` INSERT policy, `organization_members` INSERT policy (ayrıca her iki tabloda `GRANT INSERT` migration'da tanımlı değil) |
| **DEPLOY CANLI** | **EVET** ✅ — index hash değişmiş; lazy chunk'larda R14 stringleri mevcut; rotalar 200 |

**Commit zinciri (4 atomik fix):**

| Hash | Mesaj |
|------|-------|
| `8bd179f` | fix(muteahhit): kayit akisinda organizations semasina uyum |
| `1af97b9` | fix(muteahhit): panel org sorgusu active_org + org_members |
| `53bcae0` | fix(nav): muteahhit panel giris ve kayit rotalari /giris /kayit |
| `ffc7b22` | fix(muteahhit): developer_projects ve listings org_id baglantisi |

---

## A) KOD DOĞRULAMA (commit `ffc7b22`)

| # | Kontrol | Sonuç | Kanıt (dosya:satır) |
|---:|---------|:-----:|---------------------|
| A1 | `Register.tsx`: `organizations` INSERT'te `name` / `owner_user_id` **YOK**; `slug`, `legal_name`, `display_name`, `org_type:'contractor'` **VAR** | **PASS** | `src/pages/auth/Register.tsx:88-101` — insert alanları: `slug`, `legal_name`, `display_name`, `org_type`, `tax_number`, `settings`. `name` yalnızca form state / `full_name` profil güncellemesinde (`:133`); org kolonu olarak kullanılmıyor. |
| A2 | `Register.tsx`: `organization_members` INSERT (`role:'owner'`) + `set_active_org` RPC + `refreshSession()` | **PASS** | `src/pages/auth/Register.tsx:110-126` — members insert `role:"owner"`, `status:"active"`; ardından `supabase.rpc("set_active_org", { p_org_id: orgRow.id })` ve `refreshSession()`. |
| A3 | `MuteahhitPanelPage.tsx`: `organizations.owner_user_id` filtresi **kalkmış**; aktif org `useActiveOrg`; role gate `organization_members` | **PASS** | `src/pages/portals/MuteahhitPanelPage.tsx:47` — `useActiveOrg()`; `:79-87` — `organization_members` role sorgusu; `:146-148` — `canAccessPanel = isPlatformAdmin \|\| isOrgOwnerOrAdmin`. Dosyada `owner_user_id` referansı **yok** (grep 0 eşleşme). |
| A4 | `src/` geneli: `/login` ve `/register` **kalmamış** | **PASS** | Grep `src/` → 0 eşleşme. Panel linkleri: `src/pages/portals/MuteahhitPanelPage.tsx:163` → `/giris?next=...`; `:181` → `/kayit?profil=muteahhit`. |
| A5 | `useDeveloperProjects.ts`: `createProject` → `org_id` + `owner_user_id`; `publishUnitAsListing` → `organization_id`; `getActiveOrgId()` canlı çağrılıyor | **PASS** | `src/hooks/useDeveloperProjects.ts:90,115,210` — `getActiveOrgId()` (3 çağrı); `:118-122` — insert `{ owner_user_id, org_id }`; `:223` — listings `{ organization_id: activeOrgId ?? null }`. `:92-96` — fetch `org_id.eq.${activeOrgId},owner_user_id.eq.${user.id}`. |
| A6 | `activeOrgId.ts` cast: `any` maskesi değil, gerekçeli typed erişim | **PASS** | `src/lib/activeOrgId.ts:5-6` — `Record<string, unknown>` + `typeof raw === "string"` guard. `any` / `@ts-ignore` yok. Aynı kalıp `src/hooks/useActiveOrg.ts:25-26`. |

**KOD FIX özeti:** 6/6 PASS.

---

## B) RLS POLICY DENETİMİ (migration grep + okuma)

Kaynak: `supabase/migrations/*.sql` — tüm migration dosyalarında `organizations` / `organization_members` için `FOR INSERT` policy araması yapıldı; **sıfır eşleşme**.

### B1 — `organizations` INSERT policy

| Alan | Değer |
|------|-------|
| **Policy** | **YOK** ❌ |
| **RLS** | Açık — `supabase/migrations/20260516120100_v2_multi_tenant.sql:65` |
| **Mevcut policy'ler (yalnızca SELECT)** | `org_select_member` — `:68-71` `USING (exists … organization_members …)` |
| | `org_select_admin` — `supabase/migrations/20260528150000_rb1_rb2_rls_hardening.sql:80-90` `FOR SELECT` admin profil kontrolü |
| **GRANT INSERT** | Migration'larda `GRANT INSERT ON public.organizations` **tanımlı değil** |
| **Sonuç** | Authenticated kullanıcı client-side `organizations.insert()` → **403 / permission denied** (RLS: policy yok + grant eksik) |

### B2 — `organization_members` INSERT policy

| Alan | Değer |
|------|-------|
| **Policy** | **YOK** ❌ |
| **RLS** | Açık — `20260516120100_v2_multi_tenant.sql:66` |
| **Mevcut policy (yalnızca SELECT)** | `om_select_self_or_member` — `:73-76` `USING (user_id = auth.uid() OR has_org_role(...))` |
| **GRANT INSERT** | Migration'larda `GRANT INSERT ON public.organization_members` **tanımlı değil** |
| **Sonuç** | Kayıt akışı adım 2 (`organization_members.insert` owner) → **403** |

### B3 — `developer_projects` INSERT policy

| Alan | Değer |
|------|-------|
| **Policy** | **VAR** ✅ |
| **Dosya:satır** | `supabase/migrations/20260530140000_r14_developer_projects.sql:128-132` |
| **Policy adı** | `developer_insert_own_projects` |
| **WITH CHECK** | `auth.uid() = owner_user_id` |
| **Org üyeliği şartı** | **Hayır** — yalnızca `owner_user_id = auth.uid()`; `org_id` veya `organization_members` kontrolü yok |
| **GRANT** | `:185` — `GRANT INSERT, UPDATE ON public.developer_projects TO authenticated` |

### B4 — `set_active_org` fonksiyonu

| Alan | Değer |
|------|-------|
| **SECURITY DEFINER** | **EVET** ✅ |
| **Dosya:satır** | `supabase/migrations/20260516120100_v2_multi_tenant.sql:40-51` |
| **Davranış** | `auth.uid()` null ise exception; `p_org_id` not null ise aktif üyelik kontrolü (`organization_members` satır 45-47); ardından `auth.users.raw_app_meta_data.active_org_id` güncellenir |
| **GRANT** | `:51` — `GRANT EXECUTE … TO authenticated` |
| **Not** | Üyelik satırı INSERT edilemediği için (B2 FAIL) RPC'ye ulaşılamaz; fonksiyon tanımı doğru olsa da funnel adım 3 pratikte çalışmaz |

### RLS INSERT eksiklik tablosu

| Tablo | INSERT policy | GRANT INSERT | Kayıt funnel etkisi |
|-------|:-------------:|:------------:|---------------------|
| `organizations` | **YOK** | **YOK** | Adım 1 FAIL → 403 |
| `organization_members` | **YOK** | **YOK** | Adım 2 FAIL → 403 |
| `developer_projects` | VAR | VAR | Org kaydı olmadan panel/projeler kısıtlı; insert tek başına çalışabilir |
| `set_active_org` (RPC) | N/A (DEFINER) | EXECUTE VAR | Adım 1-2 başarısızsa çağrılmaz |

**RLS INSERT HAZIR MI:** **HAYIR** — müteahhit self-register funnel'ı production DB'de **403 ile kırılır** (Claude Code uyarısı doğrulanmış).

---

## C) HTTP SMOKE (canlı, salt-okunur)

**BASE:** `https://www.ihaleal.com`  
**Zaman:** 2026-05-30 (doğrulama anı)

### C1 — Deploy / bundle kanıtı

| Kontrol | Sonuç | Detay |
|---------|:-----:|-------|
| Index hash değişimi | **EVET** | Eski referans: `index--YgsHSbq.js` → Canlı: `index-z6JoDqv8.js` |
| R14 stringleri bundle'da | **EVET** | Lazy chunk `Register-LucCS96C.js`: `set_active_org=True`, `organization_members=True`, `organization_id=True` |
| | | `useDeveloperProjects-C5sR64UP.js`: `organization_id=True` |
| | | `MuteahhitPanelPage-DhvwGtNr.js`: `organization_members=True`, `/giris=True`, `/login=False` |
| Ana index chunk | kısmi | `index-z6JoDqv8.js` — string yok (lazy split beklenen) |

### C2 — Rota HTTP durumları

| Rota | HTTP |
|------|:----:|
| `/` | **200** |
| `/kayit?profil=muteahhit` | **200** |
| `/muteahhit/panel` | **200** |
| `/giris` | **200** |

> Not: SPA rotaları 200 döner; müteahhit kayıt **DB INSERT** başarısı bu smoke ile test edilmez.

---

## SONUÇ

1. **Kod tarafı (`ffc7b22`):** P0 fix maddeleri tamam — şema-uyumlu kayıt akışı, panel org sorgusu, rota düzeltmeleri, `org_id` / `organization_id` bağlantıları doğrulandı.
2. **DB tarafı:** Migration set'inde `organizations` ve `organization_members` için INSERT policy **eksik**; self-service müteahhit kaydı canlıda **403 riski taşır**. Ayrı migration (INSERT policy + GRANT) gerekir — bu rapor yalnızca tespit içerir, düzeltme önermez.
3. **Deploy:** `ffc7b22` kodu canlıda; index hash ve lazy chunk stringleri bunu doğruluyor.
4. **Tag:** `v0.13.0` silinmiş; yeni tag E2E onayı bekleniyor (bu doğrulama kapsamı dışı).

---

*Rapor: salt-okunur doğrulama — `_audit/R14_FIX_DOGRULAMA_2_2026_05_30.md`*
