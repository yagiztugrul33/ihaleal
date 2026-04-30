# ihaleal.com — durum ve referans

## Repo içinde bitirilen (demo katmanı)

Bu oturumlarda kod tarafında yapıldı; **deploy anahtarı veya hukuk imzası gerektirmez:**

- **`src/lib/fees.ts`** — işlem komisyonu satıcıdan %4 + KDV, ortak B2B %2 + KDV, alıcı işlem komisyonu 0; vitest doğrulaması.
- **Sayfa/doküman uyumu** — İş modeli, İhale Koşulları, Rehber, rakipler, Footer vb. ile uyumlu metinler.
- **Kalite** — erişilebilir skip link, OG/PWA için `gen:assets` dokümantasyonu, demo şeridi (`DemoBanner`).
- **Doğrulama** — yerelde sürekli: `npm run verify` (typecheck + test + build).
- **Hukuki organizasyon (taslak)** — `docs/hukuk/TAPUBID_IHALLEGAL_MASTER_PLAN.md`, `EK_SOZLESME_TASLAK_PAKETI.md`; site özeti `#/hukuk-strateji-master`.

**Tek kaynak komisyon:** `src/lib/fees.ts` · özet: `docs/REVENUE_MODEL.md`

---

## Hızlı komutlar (geliştirici)

```powershell
cd "C:\Users\yagiz\Desktop\ihaleal.com"
npm install
npm run verify
```

İsteğe bağlı görseller: `npm run gen:assets`

Uzaktan DB kontrolü (`.env.local` dolu iken): `npm run precheck:supabase`

---

## İlerleme yüzdeleri (tahmini)

Güncel tablo: **`docs/PROJE_ILERLEME_YUZDE.md`**

Yayın kontrol listesi: **`docs/LAUNCH_CHECKLIST.md`**

---

## Senden istenenler (özet — tek blok)

Cursor kod yazabilir; **Supabase Dashboard, gerçek anahtarlar, ödeme sözleşmesi ve avukat** senin hesabında ve sürecindedir.

### 1) Ortam dosyası

1. [Supabase Dashboard](https://supabase.com/dashboard) → projen → **Settings → API**
2. **Project URL**, **anon**, **service_role** secret kopyala (service_role’ü kimseyle paylaşma, Git’e koyma)
3. `ihaleal.com\.env.local` içinde tek satırda yapıştır — şema için **`docs/SUPABASE_ADIM_ADIM.md`**

### 2) Uzak SQL

Supabase **SQL Editor**: Tek dosya olarak **`supabase/SQL_EDITOR_TEK_DOSYA.sql`** (yenilemek için `CALISTIR_SQL_DOSYASI_URET.bat` veya `npm run sql:bundle`). Parça parça tercih: **`docs/SQL_EDITOR_TEK_TEK_YAPISTIR.md`**

### 3) Hosting

Vercel (veya eşdeğeri): **`VITE_SUPABASE_URL`**, **`VITE_SUPABASE_ANON_KEY`**; build çıktısı `dist`. Ayrıntı **`docs/LAUNCH_CHECKLIST.md` → A)**

### 4) İçerik paketi

**`docs/KIMI_SYNC_TASKS.md`** maddeleri tamamlanınca dosyalar repoya girsin; sonra Cursor’a bağlatılabilir.

### 5) Canlı ürün (ileri faz)

Ödeme sağlayıcısı (ör. iyzico sandbox/prod), avukat onayı (TKHK, ön bilgilendirme, komisyon sözleşmesi).

---

## Tek satır kontrol (isteğe bağlı)

```powershell
cd "C:\Users\yagiz\Desktop\ihaleal.com"; npm run verify; npm run precheck:supabase
```
