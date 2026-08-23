# CANLI DOĞRULAMA RAPORU — 2026-05-30

**Yöntem:** Salt-okuma (curl, canlı bundle analizi, repo migration grep). Kod, git, migration **değiştirilmedi**.  
**BASE:** `https://www.ihaleal.com`  
**Supabase proje (canlı bundle):** `https://wsjifesrdaeorrdzbvmk.supabase.co`  
**Doğrulama zamanı:** 2026-05-30

---

## ÖZET

| Alan | Sonuç |
|------|-------|
| **MOBİL** | **200-TEMİZ** (tüm rotalarda DESK=MOB=200; mobil body'de 500/Application error/stack yok — *curl yalnızca HTML shell'i test eder, React hydration client crash bu yöntemle kanıtlanamaz*) |
| **DEPLOY** | **Aynı hash** — `index-z6JoDqv8.js` (önceki tur ile aynı; Claude Code hotfix deploy kanıtı **yok**) |
| **ANON DENY** | **PASS** — organizations INSERT **401**, developer_projects INSERT **401** |

---

## A) MOBİL 500 BAĞIMSIZ TEŞHİS

### A1 — Desktop vs iPhone UA HTTP kodları

Komut kalıbı (curl.exe, Windows):

```bash
curl -s -o NUL -w "DESK %{http_code}\n" "https://www.ihaleal.com/<yol>"
curl -s -A "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148" -o NUL -w "MOB %{http_code}\n" "https://www.ihaleal.com/<yol>"
```

| Rota | DESK | MOB | Kanıt |
|------|:----:|:---:|-------|
| `/` | **200** | **200** | curl.exe 2026-05-30 |
| `/ilan` | **200** | **200** | Invoke-WebRequest + curl.exe |
| `/muteahhit/panel` | **200** | **200** | Invoke-WebRequest |
| `/giris` | **200** | **200** | Invoke-WebRequest |
| `/kayit?profil=muteahhit` | **200** | **200** | Invoke-WebRequest |

**Sonuç:** Hiçbir rotada mobil UA **gerçek HTTP 500** üretmedi. Desktop ile mobil kodlar **birebir aynı**.

### A2 — Mobil UA response body (ilk ~40 satır)

Komut: `curl -s -A "<iPhone UA>" "https://www.ihaleal.com/<yol>"` → body taraması.

| Rota | HTTP | Body pattern | Teşhis |
|------|:----:|--------------|--------|
| `/` | 200 | `500`, `Application error`, stack trace **YOK** | Shell temiz |
| `/ilan` | 200 | Aynı — hata pattern **YOK** | Shell temiz |
| `/muteahhit/panel` | 200 | Aynı | Shell temiz |
| `/giris` | 200 | Aynı | Shell temiz |
| `/kayit?profil=muteahhit` | 200 | Aynı | Shell temiz |

Mobil body örneği (tüm rotalar aynı SPA shell):

```html
<!doctype html>
<html lang="tr" data-theme="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
```

**SERVER-500 vs CLIENT-CRASH ayrımı:**

| Senaryo | Bu doğrulamada |
|---------|----------------|
| Gerçek server 500 | **Görülmedi** — HTTP 200 |
| SPA shell 200 + body'de hata metni | **Görülmedi** |
| Client-side React crash (hydration/runtime) | **curl ile kanıtlanamaz** — shell 200 döner, JS runtime ayrı test (Playwright/Safari) gerekir |

**MOBİL teşhis:** **200-TEMİZ** (server katmanı). Mobil 500 şikâyeti varsa kaynak büyük olasılıkla **client runtime** (Claude Code paralel inceleme alanı).

### A3 — Canlı index hash

| Kontrol | Sonuç |
|---------|-------|
| Önceki tur referansı | `index-z6JoDqv8.js` (`R14_FIX_DOGRULAMA_2`) |
| Bu tur canlı | `index-z6JoDqv8.js` |
| Vendor chunk örnekleri | `vendor-react-DbBl4joo.js`, `vendor-supabase-dTDx1jjQ.js` |

**DEPLOY:** Hash **değişmemiş** — hotfix deploy **yok** (aynı build).

Kanıt komutu:

```bash
curl -s "https://www.ihaleal.com/" | findstr index-
# → assets/index-z6JoDqv8.js
```

---

## B) DB CANLI GERÇEĞİ (SADECE OKUMA)

### B0 — Ortam

| Kaynak | Durum |
|--------|-------|
| `.env.local` | **YOK** — repo kökünde bulunamadı (yalnızca `.env.example`, `.env.production.example`) |
| `pg_policies` via anon REST | **Mümkün değil** — sistem katalog tabloları PostgREST yüzeyinde yok |
| Canlı doğrulama | **Master SQL Editor'da koşmalı** |

### B1 — Master için hazır SQL (canlı INSERT policy gerçeği)

```sql
-- organizations + organization_members INSERT policy GERÇEKTEN var mı (canlı):
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('organizations', 'organization_members')
ORDER BY tablename, cmd;

-- developer_projects policy detayı:
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'developer_projects';
```

**Beklenen (repo migration ile uyum):** `organizations` ve `organization_members` için `cmd = 'INSERT'` satırı **olmamalı**; `developer_projects` için `developer_insert_own_projects` INSERT satırı **olmalı**.

### B2 — Repo migration çapraz referans (canlıya erişilemedi — ikincil kanıt)

| Tablo | INSERT policy (repo) | Dosya:satır |
|-------|:--------------------:|-------------|
| `organizations` | **YOK** (yalnızca SELECT) | `supabase/migrations/20260516120100_v2_multi_tenant.sql:68-71` — `org_select_member` FOR SELECT |
| | Admin SELECT eklentisi | `supabase/migrations/20260528150000_rb1_rb2_rls_hardening.sql:80-90` — `org_select_admin` FOR SELECT |
| `organization_members` | **YOK** (yalnızca SELECT) | `supabase/migrations/20260516120100_v2_multi_tenant.sql:73-76` — `om_select_self_or_member` FOR SELECT |
| `developer_projects` | **VAR** | `supabase/migrations/20260530140000_r14_developer_projects.sql:128-132` — `WITH CHECK (auth.uid() = owner_user_id)` |

Repo migration grep: `organizations` / `organization_members` için `FOR INSERT` → **0 eşleşme**.

**Canlı DB durumu:** Bu turda **doğrulanamadı** — Master SQL Editor çıktısı bekleniyor. Repo ile tutarlılık varsayımı: canlıda da INSERT policy **yoksa** müteahhit self-register **403** (önceki audit ile uyumlu).

---

## C) ANON DENY KANIT (curl, anon key)

### C0 — Anahtar kaynağı

| Kaynak | Durum |
|--------|-------|
| `.env.local` | **YOK** — atlandı |
| Canlı bundle (public) | `index-z6JoDqv8.js` içinden `VITE_SUPABASE_URL` + anon JWT çıkarıldı (istemci bundle'da zaten public) |

```
URL  = https://wsjifesrdaeorrdzbvmk.supabase.co
ANON = eyJhbG... (JWT, bundle'dan — raporda tam değer yazılmadı)
```

### C1 — INSERT deny testleri

```bash
curl -s -o /dev/null -w "anon org insert: %{http_code}\n" \
  -X POST "$URL/rest/v1/organizations" \
  -H "apikey:$ANON" -H "Authorization:Bearer $ANON" \
  -H "Content-Type:application/json" \
  -d '{"slug":"audit-probe-20260530","legal_name":"P","display_name":"P","org_type":"contractor"}'

curl -s -o /dev/null -w "anon dev_proj insert: %{http_code}\n" \
  -X POST "$URL/rest/v1/developer_projects" \
  -H "apikey:$ANON" -H "Authorization:Bearer $ANON" \
  -H "Content-Type:application/json" \
  -d '{"project_name":"audit-probe"}'
```

| Test | HTTP | Response body (özet) | Sonuç |
|------|:----:|----------------------|:-----:|
| `organizations` INSERT (anon) | **401** | `{"code":"42501","message":"permission denied for table organizations","hint":"Grant ... GRANT INSERT ON public.organizations TO anon;"}` | **PASS** (deny) |
| `developer_projects` INSERT (anon) | **401** | `{"code":"42501","message":"permission denied for table developer_projects","hint":"Grant ... GRANT INSERT ON public.developer_projects TO anon;"}` | **PASS** (deny) |

**ANON DENY:** **PASS** — 201 dönmedi; anon rolü INSERT yapamıyor.

**Not:** Deny seviyesi **GRANT** (tablo izni yok) — RLS policy değerlendirmesine gelinmeden reddediliyor. Authenticated kullanıcı için ayrı test (JWT ile) bu tur kapsam dışı.

---

## SONUÇ TABLOSU

| Bölüm | Bulgu |
|-------|-------|
| A — Mobil 500 | **200-TEMİZ** — server 500 yok; shell temiz |
| A — Deploy | **index-z6JoDqv8.js** — değişiklik yok |
| B — Canlı pg_policies | **Doğrulanamadı** — Master SQL gerekli |
| B — Repo beklenti | org / org_members INSERT policy **YOK** |
| C — Anon deny | **PASS** — 401 + permission denied |

---

*Rapor: salt-okunur — `_audit/CANLI_DOGRULAMA_2026_05_30.md`*
