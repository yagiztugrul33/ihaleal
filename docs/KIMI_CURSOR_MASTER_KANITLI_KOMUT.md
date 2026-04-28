# KİMİ + CURSOR — TEK MASTER KOMUT (kanıtlı, halüsinasyonsuz, siteyi kapatma)

**Bu dosyanın tamamını** hem **Kimi**ye hem **Cursor**a **aynı anda** yapıştırın. Bu belge, önceki maraton (`KIMI_CURSOR_UZUN_MARATON_KOMUT.md`), Faz 2 (`KIMI_CURSOR_FAZ2_SON_HAL_GENIS_KOMUT.md`) ve **Kimi’nin X1–X20 tablo raporunu** tek çatı altında birleştirir.

**Tek yapıştırma (Kimi + Cursor aynı metin):** `docs/TEK_YAPISTIR_IKILI_KIMI_CURSOR.md`

**Senkron üretim + kayıt + kapalı döngü (detay):** `docs/SENKRON_TEK_KOMUT.md` — `docs/sync/STATE.md` el sıkışması.

---

## A) “Kimi raporunu Cursor görüyor mu?”

| Durum | Açıklama |
|--------|-----------|
| **Metin olarak** | Kullanıcı veya Kimi raporu sohbete yapıştırılırsa Cursor **o metni** görür. |
| **Dosya olarak** | Kimi çıktısı `docs/icerik/` veya `docs/icerik/faz2-kimi/` altına yazılırsa Cursor **dosyayı okuyarak** görür. |
| **Otomatik** | Kimi ile Cursor arasında **gizli senkron yok**; “Kimi raporladı” iddiası **repo + komut çıktısı** ile **doğrulanana kadar** tamamlanmış sayılmaz. |

**Kural:** Her “✅ tamam” iddiası için Cursor **`grep` / dosya okuma / `npm run typecheck` + `build` + `test:run`** ile teyit eder. Kimi “dosya yok” derse Cursor **mutlaka** `Glob` veya `dir` / `Get-ChildItem` ile kökten arar.

---

## B) Kimi X1–X20 tablosu ↔ bu repo (doğrulama — 2026-04-27)

Aşağıdaki tablo **ihaleal.com** kökü için Cursor tarafından kontrol edilmiştir. Kimi raporu ile **çelişen** satırlar: **düzeltme gerekir** (Kimi yanlış varsayım yapmış olabilir veya farklı klasör düşünmüş olabilir).

| ID | Kimi ifadesi | Repo gerçeği | Ne yapılır |
|----|----------------|---------------|------------|
| **X4** | “fees.ts mevcut değil” | **VAR:** `src/lib/fees.ts` — `FEE_TEXTS.commissionMatrahLine` dahil | Kimi: “kök `fees.ts` aradım, asıl `src/lib/fees.ts`” diye düzelt. Cursor: `AuctionDetail` import yolu doğru mu bir kez daha grep. |
| **X7–X9** | “Bu repoda mevcut değil” | **VAR:** `src/pages/SellerHub.tsx`, `src/pages/DataStrategy.tsx`, `src/lib/userFlows.ts` — `App.tsx` route: `/sat-basla`, `/veri-ve-endeks` | Kimi raporunu **geçersiz say**; X7–X9 için **içerik uyumu** (metin ↔ kod) Cursor+Faz2 ile yeniden işaretle. |
| **X12** | “varsayım” | `docs/SOZLESMESONRASI_TEK_KOMUT.md` içinde §0 / ürün eşlemesi satırları **dosyada var**; doluluk oranı Cursor raporda belirtilir | Cursor: §0 tablosunda boş hücre varsa doldur veya `varsayım: avukat bekliyor` yaz. |
| **X16** | “varsayım, footer sığmaz” | **Güncel:** `Compare` sonuç tablosunda **“Rapor / belge”** satırı + kazanan kutusunda `ListingDocumentFooter` (Faz 1 sonrası) | Kimi raporu eskiyse güncelle; yoksa “tamamlandı” diye işaretle. |
| **X1–X3, X5–X6, X10–X11, X13–X15, X17–X20** | Kimi ✅ | Cursor `MARATON_CURSOR_RAPORU.md` ile genelde uyumlu | Regresyon smoke (§M) ile koru. |

**Özet:** Kimi raporunu **körü körüne** kabul etmeyin; **B tablosu** tek doğruluk köprüsüdür.

---

## C) Öncelik sırası (çakışma yok)

1. **Patron / ürün:** `docs/SOZLESMESONRASI_TEK_KOMUT.md` **§A** (kuzey yıldızı).  
2. **Telif:** Örnek PDF içeriği **kopyalanmaz**; `KIMI_CURSOR_UZUN_MARATON_KOMUT.md` §0.  
3. **Bu MASTER belge** (iş bölümü + kanıt).  
4. **Faz 2 metin görevleri:** `KIMI_CURSOR_FAZ2_SON_HAL_GENIS_KOMUT.md` (K51–K70).  
5. **Maraton raporu:** `docs/MARATON_CURSOR_RAPORU.md` + istenirse `docs/MARATON_FAZ2_RAPORU.md`.

Çelişki çıkarsa: **§A kazanır**; metin veya kod yumuşatılır.

---

## D) Roller (değişmez)

| Rol | Yapar | Yasak |
|-----|--------|--------|
| **Kimi** | Uzun metin, SSS, e-posta, tablo, video senaryosu, **kısa** TSX önerisi (isteğe bağlı) | Repo’ya doğrudan yazmak; “build yeşil” **komut çıktısı olmadan**; rakip sözleşme/PDF **alıntısı**; **“şu dosya yok”** demek için repo okumadan kesin konuşmak |
| **Cursor** | Patch, `grep`, `Glob`, `npm run typecheck`, `npm run build`, `npm run test:run`, Kimi metnini dosyaya alma | Büyük refactor; §A’ya ters “vitrin satışı” vaadi; kanıtsız “hepsi bitti” |

---

## E) Kimi — zorunlu disiplin (halüsinasyon önleme)

Her tur sonunda şu bloğu üret:

```text
=== KİMİ TUR ÖZETİ ===
Tamamlanan: K… / metin adı …
Repo iddiası: yok | var (sadece kullanıcı yapıştırdıysa veya dosya adı biliyorsam)
Varsayım satırları: (numaralandır)
§A ile çelişki: yok | var (madde: …)
=== SON ===
```

- **Dosya yolu iddiası** varsa: “Cursor şunu doğrulasın: `…`” de; **“yoktur” deme** yerine “ben repoya erişemiyorum, Cursor doğrulasın”.  
- **K51–K70** için tam liste: `docs/KIMI_CURSOR_FAZ2_SON_HAL_GENIS_KOMUT.md` §3.

---

## F) Cursor — zorununlu kanıt paketi (her büyük tur sonu)

PowerShell örnek (sırayla; `&&` yoksa `;` kullanın):

```powershell
cd <ihaleal.com-kökü>
npm run typecheck
npm run build
npm run test:run
```

Ardından rapora **ekleyin:**

- Çalıştırılan komutlar (kopya-yapıştır çıktısı veya “exit 0”).  
- Değişen dosya yolları listesi.  
- **B tablosu** ile uyum: Kimi’den gelen iddialardan hangileri **doğrulandı / düzeltildi**.

---

## G) Ürün envanteri — “site bitti” için kontrol listesi

Aşağıdaki her madde ya **kod** ya da **metin** ile dolu; **hayır** ise Faz 2 veya patch ile kapatılır.

- [ ] İlan **kartı / liste / arama / yakında biten / harita / şehir rehberi / favori**: belge şeridi (`ListingDocumentFooter` veya bilinçli tek satır alternatif + gerekçe).  
- [ ] **İlan detay:** fiyat altı şerit + rapor / resmi belge butonları + Genel Bakış’ta 4’lü durum **çelişkisiz**.  
- [ ] **İlan oluştur:** ekspertiz, taahhüt limitleri, resmi belge beyanı, doğrulama mesajları TR.  
- [ ] **Karşılaştırma:** seçici + **sonuç** tablosunda belge satırı + kazanan kutusu.  
- [ ] **Yatırımcı paneli:** portföy kartlarında belge şeridi + ₺ tutarlılığı.  
- [ ] **`src/lib/fees.ts`:** komisyon matrahı metni tek kaynak; UI’da çelişki yok.  
- [ ] **SellerHub / DataStrategy / userFlows:** hikâye CreateAuction ile uyumlu (metin taraması).  
- [ ] **SEO / ölü link / demo uyarısı:** smoke geçer.  
- [ ] **Hukuk klasörü:** telif uyarısı + avukat bekleyen maddeler etiketli.  
- [ ] **K36–K50 + K51–K70:** `docs/icerik/` altında izlenebilir.

---

## H) Paralel çalışma — çakışma yok

| Zaman | Kimi | Cursor |
|--------|------|--------|
| **1** | K51–K60 metin | X21–X24: `faz2-kimi` dosyaları, grep TRY, fees import |
| **2** | K61–K70 + K70 rapor | X25–X32: metin gömme, SEO, a11y, vitest |
| **3** | Eksik cevap tamamlama | X33–X40 + MARATON Faz 2 + **B tablosunu** raporda güncelle |

**Aynı dosya:** Aynı oturumda Kimi büyük TSX gönderirken Cursor **aynı TSX’e** patch atmasın.

---

## I) Faz 2 görev özet pointer’ları (detay dosyada)

- **Kimi K51–K70:** `docs/KIMI_CURSOR_FAZ2_SON_HAL_GENIS_KOMUT.md` §3.  
- **Cursor X21–X40:** aynı dosya §4.  
- **Smoke 10 madde:** aynı dosya §7.

---

## J) Tek seferlik “Kimi raporu senkron” görevi (Cursor)

1. Bu dosyadaki **B tablosunu** `docs/MARATON_CURSOR_RAPORU.md` sonuna **“Kimi raporu düzeltmeleri (MASTER)”** başlığıyla kopyala veya özetle.  
2. X4, X7–X9, X12, X16 için **gerçek dosya yollarını** bir satırda yaz.  
3. `npm run typecheck` + `build` + `test:run` yeşil olduğunu not düş.

---

## K) Bitiş tanımı (MASTER Done)

- [ ] **B tablosu**ndaki yanlış Kimi iddiaları raporda **düzeltilmiş**.  
- [ ] **G** envanteri tüm kutular işaretlenebilir veya `varsayım:` ile kayıtlı feragat.  
- [ ] **F** kanıt paketi son turda yeşil.  
- [ ] **Kimi K70** + **Cursor X40** (veya Faz 2 kapanışı) tamam.

---

## L) Tek cümle (her iki ajan)

**Kimi metni üretir ama repo iddiasında yanılabilir; Cursor her iddiayı dosya ve komutla doğrular; ikisi birlikte §A ve telif kurallarında siteyi kapatır.**

---

## M) Ek: Hızlı smoke (Cursor, 10 dk)

1. `/` açılır.  
2. `/arama` veya liste: kartta belge şeridi.  
3. `/ilan/:id` detay: butonlar + şerit.  
4. `/ihale-ac` form: validasyon TR.  
5. `/karsilastir` veya Compare route: 2+ ilan, tabloda belge satırı.  
6. Dashboard yatırımcı: favoriyle kart + footer.  
7. `/sat-basla`, `/veri-ve-endeks` açılır (404 yok).  
8. Footer linkleri.  
9. Demo bandı (varsa) görünür.  
10. Konsol: kritik kırmızı hata yok.

---

*Dosya: `docs/KIMI_CURSOR_MASTER_KANITLI_KOMUT.md`*  
*İlişkili: `docs/KIMI_CURSOR_UZUN_MARATON_KOMUT.md` · `docs/KIMI_CURSOR_FAZ2_SON_HAL_GENIS_KOMUT.md` · `docs/MARATON_CURSOR_RAPORU.md` · `KONTROL_KOMUTU.txt`*
