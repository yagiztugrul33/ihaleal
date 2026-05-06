# Yayına hazırlık — ihaleal.com

**“%100” iki katmandır:** (A) **Teknik teslim** — kod + hosting + env ile site yayında ve güvenli yapılandırılmış olabilir. (B) **Ürün / hukuk / ödeme** — avukat, ödeme sağlayıcısı ve iş süreçleri olmadan “tam ürün” bitmez; bunlar ayrı fazdır ve burada kontrol listesi olarak kalır.

**A0 — Demo / hukuk envanteri (tek satır):** Supabase yoksa uçlar mock/yerel; `data-demo="true"`: müzayede listesi `#auctions`, `CreateAuction` form kabuğu, `ChatWidget` launcher; yasal: `public/legal/agency_contract.md` + `AgencyContractView`; smoke: `/#/`, `/#/yasal/agency-contract`, `/#/giris`.

---

## Windows: çift tıklama ve betikler

| Ne | Dosya |
|----|--------|
| Günlük doğrulama + kimi `gorev*` commit (`npm install`, Vite açık kalabilir) | **`CALISTIR_SITEYI_BITIR.bat`** (`npm run site:finish`) |
| Tam CI + `.bundle` yedek + varsa commit/push (`npm ci` — **önce Vite’yi kapat**) | **`BITIR_VERIFY_CI.bat`** veya `scripts/bitir-kisitli-butce.ps1` (`npm run site:finish:ci`) |
| Uzun checklist (git, `npm ci`, `verify:ci`, `rg`, smoke, `gh`, tag) | `scripts/release-50-commands.ps1` |
| Hızlı adresler (canlı + yerel + repo) | **`IHALEAL_LINKLER.bat`** |
| Kimi `output.zip` + doğrulama + günlük bitirme (tek akış) | **`SITE_BITIR_TEK_CALISTIR.bat`** (`npm run site:finish:all`) |

**Not:** `npm ci` yalnızca `BITIR_VERIFY_CI.bat` / `bitir-kisitli-butce.ps1` içindedir; `esbuild.exe` EPERM için Vite’yi kapatın.

`package.json`: `site:finish`, `site:finish:all`, `site:finish:ci`.

---

## A) Teknik teslim (bu liste işaretlenince “deploy’a hazır” sayılır)

### Yerel doğrulama (CI ile aynı)

```bash
npm ci
npm run verify:ci
```

`verify:ci`: `verify` (typecheck + encoding + tests + build) + `test:coverage` + `scripts/check-bundle-budget.mjs`.

- [ ] `npm run verify:ci` hatasız tamamlanıyor.

Hafif zincir (yedek): `CALISTIR_KALAN_KONTROL.bat` — `npm install` + typecheck + test + build + audit (CI ile birebir değil; tam eşleşme için `verify:ci` kullanın).

Durum özeti ve sıranın sonundaki kullanıcı adımları: **`docs/KALAN_ADIMLAR_TEK_TEK.md`** · yüzdeler: **`docs/PROJE_ILERLEME_YUZDE.md`**

### Görseller (OG / PWA PNG)

Sosyal önizleme ve bazı cihazlar için PNG üretmek:

```bash
npm run gen:assets
```

Çıktı: `public/og-image.png`, `icon-192.png`, `icon-512.png`, vb.

### Ortam (geliştirme)

- [ ] `.env.local`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- [ ] Script için (commit etmeyin): `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] `npm run precheck:supabase` — anon JWT `role: anon`, service JWT `role: service_role`; kritik tablolar beklenen HTTP kodları.
- [ ] Adım adım rehber: **`docs/SUPABASE_ADIM_ADIM.md`**

### Supabase (uzak)

- [ ] Birleşik SQL (`manual_push.sql` ve gerekiyorsa `manual_push_v7.sql`) veya **`manual_push_v3_v6_combined.sql`** uzak DB’de çalıştırıldı.
- [ ] `profiles`, `listings`, `bid_bonds`, vb. tablolar ve RLS üretim kararına uygun test edildi.

### Vercel (hosting)

- [ ] Repo import veya CLI ile proje oluşturuldu.
- [ ] Build: `npm run build`, çıktı: **`dist`** — kökte **`vercel.json`** kullanılabilir.
- [ ] Production **Environment Variables**: `VITE_*` listesi — **`docs/VERCEL_ENV_AFTER_MAIN_MERGE.md`**
- [ ] Alan adı ve DNS tamam.

---

## B) Ürün / hukuk / operasyon (kapanış işleri — zaman ve üçüncü taraflar)

- [ ] Komisyon ve ücret metinleri üretim kararıyla sabit (`src/lib/fees.ts`, üyelik/hizmet sayfaları).
- [ ] TKHK / ön bilgilendirme ve sözleşme metinleri avukat onayı.
- [ ] Ödeme entegrasyonu (iyzico vb.), e-posta, İhaleal Endeksi için lisanslı veri / kurumsal API’ler.

---

## Planlı teknik borçlar (acil değil)

- SSR/prerender ve HashRouter ile SEO stratejisi (demo kural özeti: **`docs/SEO_HASH_CANONICAL.md`**).
- Kimi mega paket JSON içeriklerinin ürün içine bağlanması (`docs/kimi-mega-pack/`).

---

## Tek mesajda özet

| Durum | Anlam |
|--------|--------|
| **A tamam** | Hosting + DB + env ile site yayınlanabilir. |
| **B tamam** | Gerçek müşteri / hukuki olarak “tam ürün” sahaya çıkar. |
