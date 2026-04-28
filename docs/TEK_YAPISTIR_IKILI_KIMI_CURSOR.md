# TEK YAPIŞTIRMA — Kimi VE Cursor (aynı metin)

**Cursor (tek komut — başka bir şey yazma):** `docs/CURSOR_TEK_KOMUT_YAPISTIR.txt` dosyasını aç, içindeki **tek satırı** kopyala, Cursor sohbetine yapıştır.

**Kimi (tek işlem — Cursor o turu bitirdikten sonra):** Bu dosyanın (`TEK_YAPISTIR_IKILI_KIMI_CURSOR.md`) **tamamını** IDE’de Ctrl+A kopyala, Kimi’ye yapıştır.

Önceki tüm talimatların özü aşağıda; ayrıntı repoda ilgili dosyalarda durur.

| Rol | Bu blokta ne yapar |
|-----|---------------------|
| **Kimi** | `STATE` içindeki `next_kimi_tasks` + protokol; repo iddiası yok; §5–§6 çıktı formatı |
| **Cursor** | Yukarıdaki tek satır komut (dosya: `CURSOR_TEK_KOMUT_YAPISTIR.txt`) |

**Üst kaynaklar (silinmedi — burada özet):** `SOZLESMESONRASI_TEK_KOMUT.md` §A · `KIMI_CURSOR_UZUN_MARATON_KOMUT.md` §0 telif · `KIMI_CURSOR_MASTER_KANITLI_KOMUT.md` B tablosu · `KIMI_CURSOR_FAZ2_SON_HAL_GENIS_KOMUT.md` K51–K70 / X21–X40 · `SENKRON_TEK_KOMUT.md` tam rubrik · uzun maraton X1–X20 (tamamlanmış kabul + regresyon).

---

## 1) §A — kuzey yıldızı (kısa; metin ve kod buna)

1. Yapay zeka destekli gayrimenkul platformu; satılık + kiralık; üç mod: **sadece ilan**, **teklif al**, **ihale**.  
2. İlanda taraf telefonu yok; muhatap **ihaleal.com**; teklifler platformdan malike/kiraya verene.  
3. Piyasa/bölge raporu + AI analiz; hukuki ekspertiz değil. SPK çizgisi, şerh/ipotek/haciz; AI ön tarama + insan onayı.  
4. Taahhüt alt/üst; üst limite gelince yükümlülük + cezai şart sözleşmede; alıcı/kiracı simetrisi hedefi.  
5. Resmi belgeler ayrı buton; tapu sürprizi azaltma hedefi.  
6. Gelir hedefi: **yalnızca başarılı işlem komisyonu**; matrah **anlaşılan tutar**; ilan/vitrin/doping/kullanıcıya reklam satışı **yok**.  
7. Kira: **kiraya verenden 1 aylık kira + KDV**; kiracıdan ilan ücreti yok.  
8. Demo gerçeği gizlenmez.  
9. Çelişki çıkarsa **§A kazanır**.

---

## 2) Telif (zorunlu)

- Örnek sözleşme / üçüncü taraf PDF **kelimesi kelimesine** aktarılmaz, OCR ile transkribe edilmez.  
- Ürün metni **ihaleal orijinal** dille; avukat onayı uyarısı.  
- Madde eşlemesi: `docs/hukuk/YETKI_VE_ARACILIK_TASLAK_CERCEVE.md` + avukat.

---

## 3) Senkron (tek el sıkışması)

- **STATE:** `docs/sync/STATE.md` (tek gerçeklik; Cursor yazar).  
- **Inbox:** `docs/sync/inbox/kimi-YYYYMMDD-kXX-baslik.md` — Kimi çıktısı buraya bir dosya.  
- **Günlük:** `docs/sync/SESSION_LOG.md` — Cursor her tur sonuna kanıt ekler.  
- **Döngü:** K (Kimi metin) → C (Cursor doğrula + kod + test) → G (kapı güncelle); **en fazla 3 tam tur**; sonra `phase: PAUSED` + `blockers` — sınırsız spekülasyon yok.

---

## 4) STATE — gömülü kopya (Cursor: `STATE.md` ile her turda eşitle)

# Senkron durumu (tek kaynak — Cursor günceller)

**Kural:** Bu dosyayı Kimi oturumu açmadan önce kullanıcı **tek parça** Kimi’ye yapıştırır. Cursor her doğrulama turundan sonra burayı günceller.

```yaml
state_version: 1
updated_utc: "2026-04-28T06:25:00Z"
phase: "C0"
last_git_sha_short: "(git PATH yok — yerel)"
last_processed_kimi_file: "kimi-20260428-k51-k53.md"
blockers:
  - "B2: K51/K53 tam gövde metni teslim dosyasında yok — yalnızca self-check + SIGNOFF; Kimi tam metni tekrar iletsin veya kullanıcı yapıştırsın"
next_kimi_tasks:
  - "K51 tam gövde (800-1200 kelime) bu dosyaya veya yeni inbox dosyasına ekle"
  - "K53 tam sözlük (20+ satır) aynı şekilde ekle"
next_cursor_tasks:
  - "X24: Compare/Investor dışı TRY→₺ (MapPage, SearchModal, Analytics, …) ayrı tur"
```

## Ürün kapısı (hepsi true olunca “tur kapalı”)

- [x] `npm run typecheck` yeşil
- [x] `npm run build` yeşil
- [x] `npm run test:run` yeşil
- [x] `src/lib/fees.ts` mevcut ve import kırığı yok
- [x] SellerHub / DataStrategy / userFlows rotaları ve dosyaları mevcut
- [ ] İlan kartı + detay + form belge hikâyesi regresyon yok (smoke — manuel)

## Kimi son tur özeti (Kimi doldurmaz; Cursor veya kullanıcı özet yapıştırır)

**2026-04-28:** `inbox/kimi-20260428-k51-k53.md` oluşturuldu; §6 YAML + 20 madde + KIMI_SIGNOFF mevcut. K51/K53 **gövde metni** kullanıcı iletiminde eksik — `docs/icerik/faz2-kimi/kimi-20260428-k51-k53-teslim.md` arşiv kopyası; blocker B2.

**2026-04-28 (kontrol turu):** `kimi-20260428-k51-k53.md` tekrar okundu; `### K51` / `### K53` gövdesi yok — `K51-yetki-ozeti.md` / `K53-form-hata-sozlugu.md` oluşturulmadı (komut: yoksa değişiklik yok). B2 açık kaldı. npm üçlüsü yeşil.

**2026-04-28 (self-check güncellemesi):** Kullanıcı/Kimi §5.3 maddeleri güncelledi (inbox dosyası yazıldı). Gövde metin hâlâ yok; B2 devam. `SONRAKI_ADIM_KOMUTLARI.txt` Kimi talimatı sıkılaştırıldı.

**2026-04-28 (böl komutu — tekrar):** `kimi-20260428-k51-k53.md` okundu; `### K51` / `### K53` altında gerçek gövde yok (YAML + self-check + SIGNOFF). `K51-yetki-ozeti.md` / `K53-form-hata-sozlugu.md` oluşturulmadı; B2 açık. npm üçlüsü yeşil.

---

## 5) Kimi — yasak (repo yok)

- “Build / test geçti” deme.  
- “Repoda dosya yok” deme → “Repoya erişemiyorum; Cursor doğrulasın.”  
- Rakip PDF alıntısı / OCR yok.  
- Vitrin/doping kullanıcıya satış vaadi yok.

**Her teslim:** `Kaynak: gözlem | varsayım | kullanıcı | STATE`

---

## 6) Kimi — çıktı başı (YAML; üç tire çiti içinde aynen)

```yaml
---
kimi_delivery_id: "kXX-YYYYMMDD-topic"
responds_to_state_version: 1
tasks_claimed: ["K51"]
repo_touched: false
---
```

Ardından gövde (Markdown). Sonunda **20 madde** (hepsini `[x]` yap) + son satır `KIMI_SIGNOFF`:

1. [ ] §A çelişkisi yok  
2. [ ] Telif/PDF kopyası yok  
3. [ ] Repo kesin iddiası yok  
4. [ ] Varsayımlar numaralı  
5. [ ] TR karakterler (ı ş ğ …)  
6. [ ] Komisyon / kira / taahhüt §A uyumlu  
7. [ ] Demo vs canlı  
8. [ ] Rakip marka (istisna: karşılaştırma politikası)  
9. [ ] KVKK abartı yok  
10. [ ] E-posta net, spam hissi yok  
11. [ ] SSS iddiasız  
12. [ ] Video çalıntı değil  
13. [ ] EN ton tutarlı (varsa)  
14. [ ] Önceki K tekrarı yok  
15. [ ] `next_kimi_tasks` dışına taşma yok  
16. [ ] TC/IBAN örneği yok  
17. [ ] “Yasal kesin” yok  
18. [ ] Valuation abartısı yok  
19. [ ] Uzunluk hedefi (STATE’te varsa)  
20. [ ] `KIMI_SIGNOFF: state_version=1 | görev no=… | hazır`

---

## 7) Cursor — her tur sonu (kısa rubrik; tam liste SENKRON §7)

1. `STATE.md` + `inbox/` oku.  
2. Kimi YAML + 20 madde + SIGNOFF kontrol.  
3. `src/lib/fees.ts`, SellerHub, DataStrategy, userFlows, `App` route, Footer link, `ListingDocumentFooter` regresyon.  
4. `npm run typecheck` · `npm run build` · `npm run test:run` — hepsi exit 0.  
5. `STATE.md` + `SESSION_LOG.md` güncelle; `CURSOR_SIGNOFF: rubric=…`

---

## 8) Repo doğruluk (Kimi “yok” iddiasına izin yok — Cursor kanıtladı)

| Konu | Gerçek yol |
|------|------------|
| Komisyon / matrah | `src/lib/fees.ts` — `FEE_TEXTS` |
| Satıcı hub | `src/pages/SellerHub.tsx` — route `/sat-basla` |
| Veri stratejisi | `src/pages/DataStrategy.tsx` — `/veri-ve-endeks` |
| Akış | `src/lib/userFlows.ts` |

---

## 9) Faz 2 ve maraton (özet)

- **Kimi:** K51–K70 metin paketi (`KIMI_CURSOR_FAZ2_…` §3).  
- **Cursor:** X21–X40 (`KIMI_CURSOR_FAZ2_…` §4).  
- **X1–X20:** Tamamlanmış kabul; **regresyon ve smoke** her turda zorunlu.

---

## 10) Kimi tetik (kopyala-sohbet)

> Yukarıdaki STATE içindeki `next_kimi_tasks` maddelerini üret. §6 YAML + 20 madde + KIMI_SIGNOFF. Repo kesinliği yok.

## 11) Cursor tetik

**Dosya:** `docs/CURSOR_TEK_KOMUT_YAPISTIR.txt` içindeki tek satır (üst başlıkta yazıyor).

---

## 12) Tek cümle

**Aynı blok iki ajan: Kimi metni protokolle üretir; Cursor repoda doğrular, gömer, testlerle hatasız tutar; STATE tek sözlük.**

---

*Bu dosya: `docs/TEK_YAPISTIR_IKILI_KIMI_CURSOR.md` — Cursor: STATE gömülü bölümü `docs/sync/STATE.md` ile senkron tut.*
