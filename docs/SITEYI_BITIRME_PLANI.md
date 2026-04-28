# ihaleal.com — siteyi bitirme planı ve komut sırası

“Tek komutla her şey biter” yoktur; aşağıda **otomatik** ve **manuel / uzman** ayrımı vardır.

## Tanım: “Bitti” ne demek?

| Seviye | Anlamı | Tahmini ek iş |
|--------|--------|----------------|
| **L1 — Teknik yeşil** | `typecheck` + test + `build` + audit temiz | 1 gün otomasyon |
| **L2 — Demo yayın** | `dist/` bir hostinge gider; domain açılır | 0,5–2 gün |
| **L3 — Ürün beta** | Supabase Auth + gerçek ilan/ihale okuma-yazma (RLS) | 2–4 hafta |
| **L4 — Para alan** | Ödeme + teminat + sözleşme + KYC operasyon | 2–3 ay + hukuk |
| **L5 — Tam uyum** | KEP, e-imza, iyzico prod, SMS, loglama, SLA | aylar |

Bu dosya **L1→L3** için komutları sıkılaştırır; **L4–L5** maddeleri kontrol listesidir.

---

## Faz 0 — Önkoşullar (bir kez)

- Node.js LTS, Git for Windows.
- `C:\Users\yagiz\Desktop\ihaleal.com\.env.local` (Supabase URL, anon, service_role — repoda yok).
- GitHub erişimi (`origin` push).

---

## Faz 1 — Teknik bitirme (otomatik)

Çalıştır:

```bat
C:\Users\yagiz\Desktop\ihaleal.com\CALISTIR_SITEYI_BITIR.bat
```

İçerik: `npm install` → `typecheck` → `test:run` → `build` → `audit` → (varsa) `kimi-import` commit.

---

## Faz 2 — İçerik bitirme (yarı otomatik)

1. Cloud/Kimi çıktısını `docs\kimi-import\` içine zip’ten çıkar.
2. Aynı betiği tekrar çalıştır veya:

```bat
cd /d C:\Users\yagiz\Desktop\ihaleal.com
git add docs\kimi-import
git commit -m "content: kimi import"
git push
```

3. Cursor görevi: `src/data` veya mevcut seed ile JSON’ları **tek kaynak** yap; çift liste kaldır.

---

## Faz 3 — Backend bitirme (manuel + Cursor)

| Adım | Komut / iş |
|------|------------|
| Şema güncel | `npm run sql:bundle` → Supabase SQL Editor’da çalıştır veya `supabase db push` (PAT/link ile) |
| Edge | `supabase functions deploy place_bid` (CLI login sonrası) |
| Auth UI | `Login`/`Register` → `supabase.auth`; mock kaldırma planı |
| RLS test | Dashboard’dan satır ekleme + anon JWT ile API test |

---

## Faz 4 — Yayın (demo / staging)

Örnek (Netlify CLI varsayılmış değil — panelden de yapılır):

1. `npm run build`
2. `dist/` klasörünü statik hostinge yükle.
3. Ortam değişkenleri: `VITE_*` production değerleri.
4. HashRouter ise SEO için prerender kararı (ayrı iş).

---

## Faz 5 — Canlı ürün (L4)

- iyzico / ödeme: sandbox → prod anahtar, hukuk metni.
- KVKK / sözleşme: avukat onaylı PDF sürümü.
- İzleme: Sentry vb. (ürün kararı).

---

## Tek satır “maksimum otomasyon” (CMD)

```bat
C:\Users\yagiz\Desktop\ihaleal.com\CALISTIR_SITEYI_BITIR.bat
```

## Yerel siteyi gör

```bat
cd /d C:\Users\yagiz\Desktop\ihaleal.com
npm run dev
```

Tarayıcı: `http://localhost:5173`

---

Son güncelleme: plan dosyası oluşturuldu; yüzde özet için `docs/PROJE_ILERLEME_YUZDE.md`.
