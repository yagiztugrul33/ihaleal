# SENKRON TEK KOMUT — Kimi + Cursor (repoda sabit el sıkışması; ucu kapalı)

**Önce bunu okuyun:** Kimi ve Cursor’a **aynı anda tek yapıştırma** için asıl dosya: **`docs/TEK_YAPISTIR_IKILI_KIMI_CURSOR.md`** (özet + gömülü STATE + tetik cümleleri). Bu dosya (`SENKRON`) **rubrik detayı** ve uzun prosedürdür.

**Bu dosyanın tamamını** önce **Cursor**a, aynı metni **Kimi**ye yapıştırın. Bu belge **tek üst komuttur**; alt belgeler yalnızca referanstır: `SOZLESMESONRASI_TEK_KOMUT.md` §A, `KIMI_CURSOR_MASTER_KANITLI_KOMUT.md` B-tablosu, `KIMI_CURSOR_FAZ2_SON_HAL_GENIS_KOMUT.md` K51–K70 / X21–X40.

**Kimi (kısa yol):** `docs/sync/KIMI_YAPISTIR_PAKET.md` — veya ikili tek blok: `docs/TEK_YAPISTIR_IKILI_KIMI_CURSOR.md`. Cursor `STATE.md` değiştikçe gömülü STATE bölümlerini eşitlemelidir.

**Gerçeklik:** İki yapay zeka arasında gizli ağ senkronu yoktur. Senkronizasyon **yalnızca bu repodaki `docs/sync/` dosyaları + kanıt komutları** ile yapılır. Kullanıcı “çoban” değildir; **minimal iki hamle** yeterlidir (aşağıda §3).

**Yapıştırma uyarısı (kopyala-hata önleme):** Komutu **yalnızca bir kez** kopyalayın: `# SENKRON TEK KOMUT` satırı **bir** kez başlar; en sonda **bir** kez `*Dosya: docs/SENKRON_TEK_KOMUT.md*` biter. §6’da YAML mutlaka **kod çiti içinde** olmalı (` ```yaml ` … ` ``` `); girintili `---` satırları veya “repo dosyasıyla birebir” notu **yanlış kopyadır** — Kimi/Cursor’a öyle yapıştırmayın.

---

## 1) Amaç ve sınır (ucu kapalı)

| Hedef | Tanım |
|--------|--------|
| **Ürün** | ihaleal.com: §A ile uyumlu ilan hikâyesi (belge şeridi, form, detay), demo gerçeği gizlenmez, telif ihlali yok. |
| **Kapanış** | `docs/sync/STATE.md` içindeki **Ürün kapısı** checkbox’ları tamam + Faz 2 maddeleri ya **tamam** ya da `FERAGAT:` ile numaralı gerekçe. |
| **Üst sınır** | **3 tam döngü** (§4’teki K→C→G) ardından kalan işler `STATE.md` → `blockers` listesine yazılır; yeni komut açılmaz, kullanıcı kararı beklenir. |

---

## 2) Dosya sistemi = tek sözleşme (senkron kökü)

```
docs/sync/
  README.md          ← bu klasörün amacı
  STATE.md           ← faz, görevler, kapı, blocker (Cursor yazar)
  SESSION_LOG.md     ← her Cursor turunda append kanıt
  inbox/             ← Kimi teslimleri (bir dosya / mantıksal tur)
    README.md        ← dosya adlandırma kuralı
```

**Kimi repoya yazamaz.** “Senkron” = Kimi çıktısı **mutlaka** `inbox/` altında **bir dosya** haline gelir (kullanıcı kaydeder **veya** Cursor kullanıcıdan gelen metni yazar).

---

## 3) Kullanıcı rolü (minimum — “güdülmez”)

1. **Cursor oturumu başında:** Cursor’a yalnızca şunu söyleyin: “`SENKRON_TEK_KOMUT` + `docs/sync/STATE.md` oku, turu çalıştır.”  
2. **Kimi oturumu başında:** Kimi’ye **önce** `docs/sync/STATE.md` dosyasının **güncel içeriğini tek parça** yapıştırın; **sonra** “Bu komutun Kimi bölümünü çalıştır” deyin.  
3. **Kimi bitince:** Kimi çıktısını **bir kez** ya `inbox/kimi-YYYYMMDD-kXX-kisa-baslik.md` olarak kaydedin ya da Cursor’a yapıştırıp “inbox’a yaz” deyin.

Başka sürekli komut yazma zorunluluğu yoktur: **STATE + bu dosya** yeterlidir.

---

## 4) Kapalı döngü (en fazla 3 tur)

Her tur: **K → C → G**

| Adım | Kimi | Cursor |
|------|------|--------|
| **K** | `STATE.md`’deki `next_kimi_tasks` için metin üretir; çıktı **§6 formatına** uygun | — |
| **C** | — | `inbox/` dosyasını okur; **§7 rubrik**; repo `grep`/dosya; patch; `npm run typecheck` + `build` + `test:run`; sonuçları `SESSION_LOG.md`’ye yazar; `STATE.md` günceller |
| **G** | — | Kapı checkbox’ları güncellenir; `phase` ve `next_*` satırları yenilenir; bir sonraki K için Kimi’ye verilecek **STATE** hazır |

**3 tur sonra** hâlâ kapı açıksa: `blockers` doldurulur, `phase: "PAUSED"`; spekülasyon yasak.

---

## 5) Kimi — üst düzey disiplin (ciddi denetim)

### 5.1 Yasak ifadeler (otomatik red)

Aşağıdakileri **cümle olarak kullanma** (repo erişimin yok):

- “Build yeşil / test geçti” (komut çıktısı senin değil)  
- “Repoda X dosyası yok” (**Cursor doğrulayacak**; sen: “Ben repoya erişemiyorum, Cursor `Glob` ile arasın”)  
- Rakip sözleşme / PDF **alıntı** veya OCR transkript  
- §A’ya aykırı vitrin/doping **kullanıcıya satış** vaadi  

### 5.2 Zorunlu içerik kalitesi

- Her teslim: **Kaynak:** satırları (`gözlem` | `varsayım` | `kullanıcı` | `STATE`)  
- Hukuki iddia yerine: **hedef / taslak / demo / avukat onayı** dili  
- Uzun metinler: Faz 2 kodları **K51–K70** (`KIMI_CURSOR_FAZ2_…`) ile hizalı başlıklar  

### 5.3 Kimi kendi kendine denetim (20 madde — çıktının SONUNA ekle)

Metin olarak işaretle: `[ ]` → tamamlanınca `[x]`

1. [ ] §A ile çelişen cümle yok  
2. [ ] Telif/PDF kopyası yok  
3. [ ] “Repo’da kesin” iddiası yok (veya hepsi “Cursor doğrulasın” ile çevrildi)  
4. [ ] Varsayımlar numaralı  
5. [ ] TR dilbilgisi: ürün yüzü için ASCII kaçınma (ı, ş, ğ…)  
6. [ ] Komisyon / kira / taahhüt dili §A ile uyumlu  
7. [ ] Demo vs canlı ayrımı bozulmadı  
8. [ ] Rakip marka gereksiz yok (istisna: karşılaştırma sayfası politikası)  
9. [ ] KVKK iddiası abartılmadı  
10. [ ] E-posta/şablon: spam hissi yok, konu satırı net  
11. [ ] SSS cevapları iddiasız  
12. [ ] Video senaryosu çalıntı değil  
13. [ ] İngilizce parça istenmişse ton tutarlı  
14. [ ] Tekrar / önceki K maddesi ile çakışma yoksa birleştirildi  
15. [ ] `STATE.next_kimi_tasks` kapsamı dışına taşma yok  
16. [ ] Hassas veri örneği (TC, IBAN) yok  
17. [ ] “Yasal olarak kesin” ifadesi yok  
18. [ ] Yatırımcı metni abartılı valuation iddiası içermiyor  
19. [ ] Uzunluk hedefi (varsa STATE’te) sağlandı  
20. [ ] Son satır: `KIMI_SIGNOFF: state_version=… | görev no=… | hazır`

---

## 6) Kimi çıktı formatı (parse edilebilir — başa ekle)

```yaml
---
kimi_delivery_id: "kXX-YYYYMMDD-topic"
responds_to_state_version: 1
tasks_claimed: ["K51"]
repo_touched: false
---
```

Ardından normal Markdown gövdesi. Dosya adı `inbox/` kuralına uygun olmalı.

---

## 7) Cursor — ciddi doğrulama rubriği (25 madde; tur bitmeden atlanmaz)

Tur sonunda `SESSION_LOG.md` içine **kısa sonuç** (pass/fail + dosya yolu):

1. [ ] `docs/sync/STATE.md` okundu  
2. [ ] `inbox/` en yeni dosya (varsa) okundu; yoksa “inbox boş” notu  
3. [ ] Kimi YAML frontmatter alanları eksik değil  
4. [ ] Kimi 20 maddelik self-check var mı; `KIMI_SIGNOFF` var mı  
5. [ ] Yasak ifade avı: Kimi metninde §5.1 tetikleyici var mı → varsa **inbox reddedilmez**, `STATE.blockers` + kullanıcıya “Kimi düzelt”  
6. [ ] `src/lib/fees.ts` var mı (`Glob` veya bilinen yol)  
7. [ ] `FEE_TEXTS` / komisyon metni UI ile çelişiyor mu (örnek grep)  
8. [ ] SellerHub / DataStrategy / userFlows dosya yolları doğrulandı  
9. [ ] `App.tsx` route seti ile Footer/Navbar linkleri örtüşüyor mu  
10. [ ] `ListingDocumentFooter` kritik sayfalarda regresyon  
11. [ ] CreateAuction validasyon mesajları TR ve anlaşılır  
12. [ ] Compare / InvestorDashboard TRY kalıntısı `grep`  
13. [ ] `npm run typecheck` — exit 0  
14. [ ] `npm run build` — exit 0  
15. [ ] `npm run test:run` — exit 0  
16. [ ] Yeni patch’te gereksiz refactor yok (diff disiplini)  
17. [ ] Gizli anahtar / .env örneği commit edilmedi  
18. [ ] `dangerouslySetInnerHTML` / eval tarandı  
19. [ ] DemoBanner / demo metinleri bozulmadı  
20. [ ] Erişilebilirlik: yeni etkileşimde `button` / `aria` kontrolü  
21. [ ] SEO: `seo.ts` veya Helmet kullanımı kırılmadı  
22. [ ] `docs/hukuk` telif uyarısı silinmedi  
23. [ ] `STATE.md` güncellendi (`updated_utc`, `phase`, `last_git_sha_short`, `next_*`)  
24. [ ] `SESSION_LOG.md` append edildi  
25. [ ] `CURSOR_SIGNOFF: rubric=25/25 veya fail=maddeler`

---

## 8) Cursor — Kimi metnini ürüne alma kuralı

- Inbox metni **§5.1 temiz** ve **§6 tam** ise: ilgili içerik `docs/icerik/` veya ilgili TSX **sabit string** olarak entegre edilir.  
- Kimi TSX önerdiyse: **en fazla 80 satır** ve tek dosya; aksi **reddedilir** (`blockers`: “Kimi kod bloğu çok uzun — özet metin ver”).  
- Her entegrasyon sonunda **§7** tekrar.

---

## 9) Halüsinasyon köprüsü (Kimi tablosu ↔ repo)

Kimi “X dosyası yok” dediyse Cursor **mutlaka** şunu yapar: repo kökünde `fees` → `**/fees.ts` arama; `SellerHub` → `Glob **/SellerHub.tsx`. Sonuç `SESSION_LOG`’a yazılır. Özet sabit tablo: `KIMI_CURSOR_MASTER_KANITLI_KOMUT.md` **B)**.

---

## 10) Faz 2 (sınırlı ek paket)

- Kimi: **K51–K70** (dosya: `KIMI_CURSOR_FAZ2_SON_HAL_GENIS_KOMUT.md`)  
- Cursor: **X21–X40**  
- **STATE.md** `next_kimi_tasks` / `next_cursor_tasks` alanlarına **madde numarası** ile yazılır; serbest metin görev **eklenmez**.

---

## 11) Bitiş (PROJECT_SYNC_DONE)

Aynı anda:

- [ ] `STATE.md` → `phase: "COMPLETE"` (veya `PAUSED` + tüm blocker’lar numaralı)  
- [ ] Ürün kapısı checkbox’ları hepsi `[x]` **veya** `FERAGAT: Kxx — gerekçe`  
- [ ] `SESSION_LOG.md` son girişte üç npm komutu **exit 0**  
- [ ] `inbox/` içinde işlenmemiş dosya kalmadı (veya `blockers`’da reddedildi)

---

## 12) Kimi — bu oturumda yapılacak komut cümlesi (kopyala)

> Aşağıdaki `STATE.md` içeriğine uy: `next_kimi_tasks` listesindeki maddeleri üret. Repo hakkında kesin konuşma. Çıktın §6 YAML + §5.3 20 madde + `KIMI_SIGNOFF` ile bitsin. Dosya adı: `inbox/README.md` kuralına uygun öner.

(Kullanıcı buraya güncel `STATE.md` yapıştırır.)

---

## 13) Cursor — bu oturumda yapılacak komut cümlesi (kopyala)

> `docs/SENKRON_TEK_KOMUT.md` ve `docs/sync/STATE.md` oku. `inbox/` varsa işle. §7 rubriği uygula; patch gerekirse uygula; üç npm komutunu çalıştır; `SESSION_LOG.md` ve `STATE.md` güncelle; `CURSOR_SIGNOFF` yaz.

---

## 14) Tek cümle

**Senkron = `docs/sync/` + kanıtlı npm + rubrik; Kimi en üst düzey metni protokolle verir, Cursor en sert düzeyde doğrular ve kaydeder; kullanıcı yalnızca STATE’i Kimi’ye bir kez iletir ve inbox’ı bir kez kapatır.**

---

*Dosya: `docs/SENKRON_TEK_KOMUT.md` — Senkron kökü: `docs/sync/`*
