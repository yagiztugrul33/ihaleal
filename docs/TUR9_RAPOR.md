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

## §B — ADIM 2: `.env.local`

Tur #9 talimatı: placeholder / temiz şablon. **İçerik boş `VITE_*` satırları + yorum** olarak yazıldı (anahtarlar sohbete yazılmaz).

**Sonraki adım (kullanıcı):** Masaüstü `supabase-keys.txt` doldurulduktan sonra proje kökünde `npm run env:sync` veya `SYNC_ENV.bat`.

---

## §B — ADIM 4: KIMI görsel doğrulama (dosya sistemi)

| Yol | Sonuç |
|-----|--------|
| `public/og-image.png` | **VAR** |
| `public/favicon.png` | **VAR** (tur #9 `gen:assets`) |
| `public/logo/` | **VAR** — `logo-mark-512.png`, `README.txt` |
| `public/social/` | **VAR** — `share-card-1200.png`, `README.txt` |
| `public/email/` | **VAR** — `email-header-600.png`, `README.txt` |

Ayrıca: `icon-192.png`, `icon-512.png`, `logo.svg` (mevcut).

---

## §B — Supabase DB push (backend)

```text
npx supabase db push
→ Cannot find project ref. Have you run supabase link?
```

**Sonuç:** Uzak projeye link yok; bu ortamda `db push` **çalışmadı**. Kullanıcı: `npx supabase login` → `npm run supabase:link` → `npm run supabase:push`.

---

## Build

`npm run verify` (tur #9 bu commit öncesi çalıştırıldı): typecheck + vitest + vite build **başarılı**.

---

## Otonom kararlar (tur #9)

- `.env.local` anahtarları **şablona sıfırlandı** (talimat ADIM 2). Yerelde tekrar doldurma gerekir.
- KIMI eksikleri kapatmak için `gen-assets.mjs` genişletildi; `index.html` içine `favicon.png` linki eklendi.
