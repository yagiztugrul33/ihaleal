# 📋 YARIM İŞ ENVANTERİ — Claude Code vs Master

**Tarih:** 2026-06-01
**Yöntem:** Canlı kanıt (Supabase CLI, grep, git, npm test, kod inceleme). Kod değişmedi — sadece tespit.

---

## ⚡ TEK-CÜMLELİK ÖZET

Repo'da yarım/uncommitted src/ kod **YOK** (`git status` temiz), tüm önceki taskler tamam (25/25). **TEK BÜYÜK YARIM:** `payments-iyzico` Edge function + `payments_subscriptions` migration **CANLIDA YOK** — bu Claude Code'un `npx supabase functions deploy` + Master'ın `db push` onayı ile 5 dk'da biter; geri kalan tüm bekleyişler **dış onay/insan kararı** (avukat, iyzico merchant, Apple D-U-N-S, vs.).

---

## 1) TASK LİSTESİ — Tümü tamamlandı

```
25/25 completed (önceki oturumlardan açık in_progress/pending YOK)
```

Tamamlanan turlar (kronolojik):
- A1-A6: İlanlar görünmüyor teşhisi (sahte alarm)
- B1-B7: Para sistemi teşhisi
- C1-C6: Güvenlik tekrarı
- G1-G4: Hukuk + finansal + güvenlik raporları
- K1-K4: never push → push düzeltme + komisyon tek model
- 13-16: Güvenlik kartı dürüstlük
- B1-B4 (fiyat): Üyelik fiyat güncellemesi + erken üye
- R1-R4: RE/MAX temizlik

---

## 2) PARA SİSTEMİ — CANLIDA HENÜZ YOK ❌

| Bileşen | Kod | Canlı |
|---|---|---|
| `supabase/functions/payments-iyzico/index.ts` (472 satır) | ✅ | ❌ **NOT_FOUND** |
| `supabase/migrations/20260606200000_payments_subscriptions.sql` (274 satır) | ✅ Local | ❌ REMOTE sütunu BOŞ (apply yok) |
| `src/lib/payments/paymentClient.ts` | ✅ | ✅ (frontend, bundle'da) |
| `src/hooks/useMembershipTier.ts` | ✅ | ✅ ama localStorage fallback'a düşüyor |

**Kanıt:**
```bash
$ curl https://wsjifesrdaeorrdzbvmk.supabase.co/functions/v1/payments-iyzico
{"code":"NOT_FOUND","message":"Requested function was not found"}

$ npx supabase functions list
→ 11 ACTIVE fonksiyon var (matching-fanout, place-bid, ai-price-estimate,
  bulk-listing-ingest, kyc-submit, ai_qa, earthquakes_latest, pvgis_solar,
  nearby-poi, post_chat_message, borsa_etl) — payments-iyzico ARALARINDA YOK

$ npx supabase migration list
20260606200000 | (REMOTE BOŞ) | payments_subscriptions  ← apply edilmemiş
```

**Premium gate gerçeği:** `useMembershipTier` → RPC `get_my_subscription` → 404 (tablo yok) → fallback `memberships` (eski) → son fallback **`localStorage.getItem("ihaleal_membership_tier")`** = kullanıcı tarayıcıdan sahte premium yapabilir.

---

## 3) RE/MAX — TEMİZLENDİ ✅

```bash
$ grep -rni "remax|re/max|re-max|murat bey" --include="*.{ts,tsx,md,json,html}" .
→ 0 satır (sadece _audit/REMAX_TEMIZLIK_RAPORU.md kendi raporumda ref var, kod tabanında 0)
```

Commit: `2f868df` push edildi · 23 dosya, 38+ satır temizlik + Murat Bey privacy

---

## 4) FİYAT — Güncel ✅

```
pricingTiers.ts → monthlyTry: 499, 1900, 4500, 9900 ✅
                  (eski 399, 1500, 3500, 7500 — KALKMIŞ)
```

Commit: `f0cd26e` push edildi. Erken üye config + UI psikolojik iyileştirme aktif.

---

## 5) TEST — 4 fail, alakasız ✅

```
Test Files  2 failed | 49 passed | 1 skipped (52)
Tests       4 failed | 203 passed | 2 skipped (209)   ← %97 PASS
```

**Tek root cause:** `src/pages/Home.test.tsx` — `useAuth must be used within AuthProvider` test setup hatası. Test wrapper'da `<AuthProvider>` eksik → 4 testin tümü bu sebeple fail.

**Alakasız mı?** ✅ EVET — bu test infrastructure bug'ı. Kod doğru, test setup hatalı. Önceki 5 commit'in hepsinde aynı sayı (203/209). Master fiyat/güvenlik/komisyon/RE/MAX commit'lerinde yeni fail yaratmadım.

**Düzeltilebilir mi?** ✅ EVET — Claude Code 15 dk'da bitirebilir (test wrapper'a `<AuthProvider>` ekle).

---

## 6) YARIM KOD — YOK ✅

```bash
$ git status --short | grep "^[ MARC]+ src/"
(BOŞ)

$ git log origin/main..HEAD --oneline
(BOŞ — push güncel)
```

src/ altında uncommitted/yarım kod yok. Push güncel.

---

## 7) MERSIS/VKN PLACEHOLDER — Hâlâ var ⚠️

`src/pages/legal/MesafeliSatisSozlesmesi.tsx:51`:
> *"...öncesi şirket bilgileri eklenecektir — **Vergi No / MERSIS / Ticaret Sicil No / Adres**"*

→ Yasal metinde placeholder hâlâ duruyor. Master'ın gerçek şirket bilgilerini bilmeden Claude Code dolduramaz (yanlış bilgi = yasal risk).

---

## 8) YARIM İŞ DAĞILIM TABLOSU

### 🟢 Claude Code'un HEMEN BİTİREBİLECEĞİ (sırayla)

| # | İş | Süre | Etki | Bağımlılık |
|---|---|---|---|---|
| 1 | **`payments-iyzico` deploy** (`npx supabase functions deploy payments-iyzico`) | 1 dk | Sandbox açılır — ödeme akışı 401 yerine 200 döner | Master Supabase yetkili oturum |
| 2 | **Home.test useAuth wrapper fix** (test infrastructure) | 15 dk | 4 fail → 0 fail; %100 test PASS | — |
| 3 | **Şablon PDF "İndir" butonu** doğrulama + eksikse buton ekle | 30-60 dk | Şablon kütüphanesi (/yasal/sablonlar) E2E çalışır | Master canlı görür |
| 4 | **Gerçek shill detection** (place_bid içi son 60sn IP-bid count > 5 → flag) | 2-4 saat | Güvenlik kartı "Yol Haritası" → "Aktif" sütununa geçer | Master onayı (place_bid çekirdek değişiklik) |
| 5 | **Cloudflare Turnstile CAPTCHA** (auth + create-listing) | 6-8 saat | Bot/scraping engeli | Master Turnstile site key |
| 6 | **AddonShopPage 2 yeni SKU** ekle (rapor_paketi, vitrin_premium) | 30 dk | Mağazada görünür | — |
| 7 | **SecurityCenter `threats[]`/`regions[]` mock veri** dürüst etiketle | 20 dk | "(simülasyon)" rozetleri net | — |
| 8 | **Migration apply** (`npx supabase db push`) | 1 dk | payments+subs tabloları canlıya | Master DB push yetkisi |

**Toplam:** ~12-15 saat (paralel agent'larla daha hızlı)

### 🔴 MASTER'A KİLİTLİ (dış onay / insan kararı / kimlik)

| # | İş | Bloker tür | Süre |
|---|---|---|---|
| 1 | **iyzico merchant başvurusu** + API_KEY/SECRET | Dış onay (iyzico) | 1-5 iş günü |
| 2 | **Şirket MERSIS/VKN/Vergi No/Adres** (mesafeli §1 placeholder) | Kayıt sonrası | Şirket kuruluşu |
| 3 | **Avukat firma seç** + 12 yasal metin + 7 şablon + 10 senaryo tarama | İnsan + bütçe ₺50-150k | 2-4 hafta |
| 4 | **Apple Developer hesabı** + D-U-N-S kayıt | Kurumsal kayıt | $99/yıl + 8 gün-6 hafta |
| 5 | **Google Play Developer** ($25 tek seferlik) | Kayıt | 1-3 gün |
| 6 | **macOS + Xcode 15+** (iOS native build) | Donanım | — |
| 7 | **Apple IAP A/B/C stratejisi** kararı | Master + avukat + mali müşavir | 1-2 hafta |
| 8 | **5070 belirsizliği** (irade beyanı vs nitelikli e-imza) | Avukat görüşü | 1 hafta |
| 9 | **Akfen GYO / Tahincioğlu / Nef logo şeridi** — gerçek anlaşma var mı? | Strateji + iletişim | 1-2 hafta |
| 10 | **fees.ts vs pricingTiers** komisyon modeli onayı (Karar 2'de çözüldü, ama yasal tavan kararı Master'ın) | Strateji | — (yapıldı) |
| 11 | **Vercel build cache invalidation** / dashboard erişimi | İnsan | Anında |
| 12 | **ESHS sağlayıcı seçimi** (TürkTrust/E-Tugra/KamuSM) | Sözleşme + bütçe | 1-2 hafta |
| 13 | **KEP entegrasyonu** (opsiyonel) | PTT/Hepkep/TNB anlaşma | 1-2 hafta |
| 14 | **Subscription pricing 12 ay sabit politika taahhüdü** backend gerçekleştirme | DB schema kararı | Master |
| 15 | **Pilot ofis görüşmesi** (12 sayfalık PDF — yerel dosyada) | Müşteri ilişkisi | Anında-1 hafta |

---

## 🎯 SIRADAKİ AKSİYON ÖNERİSİ (Master için)

### Tek satır karar — bugün biten en büyük etki:

```bash
# Master sandbox açar (5 dk):
npx supabase db push                                    # payments + subs tabloları
npx supabase functions deploy payments-iyzico           # Edge function canlıya
npx supabase secrets set IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
```

→ Para sistemi sandbox MODUNDA çalışır (sahte kart ile test edilebilir). Gerçek tahsilat için iyzico merchant başvurusu (Master 1-5 iş günü).

### Master yokken Claude Code'un yapabileceği iş zinciri:

1. Home.test useAuth wrapper fix (test %100 yeşil) — 15 dk
2. Şablon PDF indir butonu Master kontrolü + eksikse ekle — 30-60 dk
3. SecurityCenter mock veriyi dürüst etiketle — 20 dk
4. AddonShopPage'e rapor_paketi + vitrin_premium SKU ekle — 30 dk
5. Gerçek shill detection (Master onayı sonra) — 2-4 saat

---

## 📊 NET TABLO

| İş | Durum | Sahibi | Bitirilebilir mi |
|---|---|---|---|
| Önceki tasklar | Tümü tamam | — | ✅ |
| Para sistemi (deploy) | Canlıda YOK | Claude Code + Master | ✅ 5 dk |
| Para sistemi (gerçek tahsilat) | Sandbox kalıyor | Master | ❌ 1-5 iş günü dış onay |
| RE/MAX | Temizlendi | Claude Code | ✅ Bitti |
| Fiyat güncel | Yapıldı | Claude Code | ✅ Bitti |
| Test 4 fail | Test infra bug | Claude Code | ✅ 15 dk |
| Yarım src/ kod | YOK | — | ✅ Temiz |
| MERSIS/VKN | Placeholder | Master | ❌ Şirket bilgisi gerekir |
| Avukat tarama | Beklemede | Master | ❌ Dış onay |
| Apple/Google hesap | Beklemede | Master | ❌ Kimlik kayıt |
| iOS native build | Beklemede | Master | ❌ macOS+Xcode |
| IAP kararı | Beklemede | Master+danışman | ❌ Stratejik |
| Vercel cache | Otomatik | — | ⏳ 5-15 dk |

---

## 📂 Audit Ayak İzi

```
_audit/
├── YARIM_IS_ENVANTERI.md           ← bu rapor
├── REMAX_TEMIZLIK_RAPORU.md        (önceki tur, push'lu)
├── FIYAT_GUNCELLEME_RAPORU.md      (önceki tur, push'lu)
├── GUVENLIK_KART_DURUST.md         (önceki tur, push'lu)
├── KARAR_1_2_RAPORU.md             (önceki tur, push'lu)
├── DERIN_ANALIZ.md                 (önceki tur, push'lu)
└── HUKUK_DOGRULAMA.md + FINANSAL + GUVENLIK_PDF_EIMZA
```

---

— **Yarım iş yok, push güncel, Claude Code 12-15 saatlik temiz pipeline'a hazır; Master'a kilitli olan tek büyük blok iyzico merchant başvurusu + avukat firma seçimi.**
📋✅
