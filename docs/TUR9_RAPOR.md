# Tur #9 — durum raporu (Cursor)

## §B — ADIM 0: git PATH

- PowerShell’de `git` komutu **PATH’te yoktu** (`git : The term 'git' is not recognized`).
- Tam yol ile çalıştı: `C:\Program Files\Git\bin\git.exe` → `git version 2.54.0.windows.1`.

**Git Bash / PATH için (kullanıcı):**

```bash
# Git Bash
export PATH="/c/Program Files/Git/bin:$PATH"
git --version
```

PowerShell kalıcı PATH: Sistem Özellikleri → Ortam Değişkenleri → Path → `C:\Program Files\Git\bin` ekleyin.

---

## §B — ADIM 1: Mevcut Supabase envanteri (ham)

| Dosya / dizin | Durum |
|----------------|--------|
| `.env.local` | Var; `.gitignore` ile `git check-ignore -v .env.local` → **repoya eklenmez** |
| `.env.example` | Var (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) |
| `src/lib/supabase.ts` | Var — `createClient`, `detectSessionInUrl` |
| `src/lib/remoteAuctionsMapper.ts` | Var |
| `src/lib/supabaseAuctionsFetch.ts` | Var |
| `src/lib/supabaseAuthBridge.ts` | Var |
| `supabase/` | Var (`config.toml`, `migrations/`, `functions/`) |

`package.json` içinde `@supabase/supabase-js` (dependencies) ve `supabase` (devDependencies) — `rg` ile eşleşir.

`supabase/config.toml` ilk satırlar: `project_id = "ihaleal.com"`, `[api] enabled = true`, `port = 54321`, `[db] port = 54322`, `major_version = 17`.

---

## §B — ADIM 2 (otomatik B): `.env.local`

- Önceki `.env.local` → **`.env.local.bak`** yedeklendi (varsa üzerine yazıldı).
- **`.env.local` otomatik dolduruldu:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_PROJECT_REF` talimattaki değerlerle; `SUPABASE_SERVICE_ROLE_KEY=` boş.
- `.gitignore`: `.env.local`, `.env.*.local`, `.env.local.bak` açıkça eklendi (`*.local` / `.env.*` ile birlikte).

---

## §B — TUR #9 SUPABASE TAM KURULUM (devam turu)

### ADIM 1 — envanter (tekrar)

| Kontrol | Sonuç |
|---------|--------|
| `git` PATH | `git` yok; `C:\Program Files\Git\bin\git.exe --version` → **2.54.0.windows.1** |
| `.env.local` | **VAR** (gitignore) |
| `.env.example` | **VAR** |
| `src/lib/supabase.ts` | **VAR** |
| `supabase/` | **VAR**; `supabase/migrations/` → **3 aktif dosya** (`20000`, `20100`, `20200`) |
| Eski migrasyonlar | `supabase/migrations_archive_pre_tur9/` altında arşiv |
| `package.json` `@supabase/supabase-js` | **2.105.0** |
| `package.json` `supabase` (dev) | **2.95.5** |

### ADIM 3 — `.env.example`

Repoya commit’lenen şablon talimattaki satırlarla güncellendi (placeholder değerler).

### ADIM 4 — paketler

`npm list` + `npx supabase --version` → kurulum **tamam** (ek kurulum gerekmedi).

### ADIM 5 — `supabase init`

`supabase/config.toml` **VAR** → init atlandı.

### ADIM 6 — migrasyonlar (YEREL; `db push` YOK)

| Dosya | Açıklama |
|-------|----------|
| `20260428120000_initial_schema.sql` | Şema + `handle_new_user` + `findeks_score` (Edge `place_bid` uyumu) |
| `20260428120100_rls_policies.sql` | RLS + `DROP POLICY IF EXISTS` |
| `20260428120200_place_bid_function.sql` | `place_bid` RPC + `GRANT authenticated` |

**Push:** Talimat gereği bu turda **`supabase db push` çalıştırılmadı.**

### ADIM 7 — KIMI 10 dosya tablosu

| Dosya | Durum |
|-------|--------|
| `public/og-image.png` | **VAR** |
| `public/logo/logo-horizontal.png` | **YOK** |
| `public/logo/logo-square.png` | **YOK** |
| `public/favicon.png` | **VAR** |
| `public/social/new-auction-post.png` | **YOK** |
| `public/social/winner-post.png` | **YOK** |
| `public/social/comparison-post.png` | **YOK** |
| `public/email/email-header-welcome.png` | **YOK** |
| `public/email/email-header-winner.png` | **YOK** |
| `public/email/email-header-confirm.png` | **YOK** |

**Özet:** **3 / 10** (og-image, favicon; ayrıca önceki turda üretilen `logo-mark-512`, `share-card-1200`, `email-header-600` KIMI listesinde yoktu). `public/logo`, `public/social`, `public/email` klasörleri mevcut.

### ADIM 8 — build / audit / test / REST

- `npm run typecheck` → **OK**
- `npm run build` → **OK**
- `npm audit` → **0 vulnerabilities**
- `npm run test:run` → **6/6 test**
- `GET https://…supabase.co/rest/v1/` + `apikey` → **HTTP 401** (erişilebilir; JWT olmadan beklenen)

---

## §C — [CURSOR]

- Tur #9 ADIM 1–8 (bu devam turu): `.env.local` otomatik, `.env.example` güncellendi, migrasyon 3 dosya + eski set arşiv, frontend mapper `current_high_bid_try` + `jsonb body` uyumu, **`db push` yok.**
- KIMI: **3/10** listedeki dosya doğrulandı; kalan 7 için klasörler hazır, dosyalar KIMI üretimine bırakıldı.

---

## §D — kayıt

- **K12 (Supabase credentials):** [KULLANICI: URL + anon `.env.local` içinde otomatik dolduruldu; `SUPABASE_SERVICE_ROLE_KEY` boş — push sonrası / Dashboard secrets — 2026-04-28]
- **K17 (yeni):** Supabase **Personal Access Token** + **service_role** — `supabase link` / `db push` ve CLI için; kullanıcı `supabase.com/dashboard/account/tokens` + proje API ayarlarından alacak.

