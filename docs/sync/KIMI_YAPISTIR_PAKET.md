# Kimi — tek yapıştırma paketi (ihaleal.com senkron)

**Önerilen:** Kimi + Cursor için **aynı dosya:** `docs/TEK_YAPISTIR_IKILI_KIMI_CURSOR.md` — tekrar yazma yok.

**Sadece Kimi:** Bu dosyayı Kimi sohbetine tek parça yapıştırın. Tam üst komut (Cursor dahil): `docs/SENKRON_TEK_KOMUT.md`.

**Cursor notu:** `docs/sync/STATE.md` değişince bu dosyadaki **STATE EKİ** bölümünü aynı içerikle güncelleyin.

---

## STATE EKİ — `docs/sync/STATE.md` ile birebir (Kimi buna uyar)

*(Aşağısı çit içinde değil; iç içe kod çiti hatası olmaması için düz metin.)*

# Senkron durumu (tek kaynak — Cursor günceller)

**Kural:** Bu dosyayı Kimi oturumu açmadan önce kullanıcı **tek parça** Kimi’ye yapıştırır. Cursor her doğrulama turundan sonra burayı günceller.

```yaml
state_version: 1
updated_utc: "2026-04-28T06:20:00Z"
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

**2026-04-28 (kontrol turu):** Gövde hâlâ yok; B2 korundu.

**2026-04-28 (self-check güncellemesi):** §5.3 liste güncellendi; `### K51` / `### K53` gövdesi yok. B2 devam.

---

## Kimi — yasaklar (§5.1)

Repo erişimin yok. Şunları **cümle olarak kullanma**:

- “Build yeşil / test geçti”
- “Repoda X dosyası yok” → yerine: “Repoya erişemiyorum; Cursor doğrulasın.”
- Rakip sözleşme / PDF alıntısı veya OCR
- Vitrin/doping kullanıcıya satış vaadi (§A’ya aykırı)

Her teslimde **Kaynak:** (`gözlem` | `varsayım` | `kullanıcı` | `STATE`). Hukuki dil: **hedef / taslak / demo / avukat onayı**.

---

## Kimi — çıktının en başına YAML (§6)

Aşağıdaki çitin **içindeki** metni çıktının **en üstüne** koy; ardından Markdown gövdesi.

```yaml
---
kimi_delivery_id: "kXX-YYYYMMDD-topic"
responds_to_state_version: 1
tasks_claimed: ["K51"]
repo_touched: false
---
```

Önerilen dosya adı (kullanıcı kaydı): `kimi-YYYYMMDD-kXX-kisa-baslik.md` → `docs/sync/inbox/`

---

## Kimi — çıktının en sonuna (§5.3 — 20 madde)

Metin: `[ ]` → tamamlanınca `[x]`

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

## Kimi — tetik cümlesi (§12)

> Yukarıdaki STATE EKİ’ndeki `next_kimi_tasks` maddelerini üret. Repo hakkında kesin konuşma. Çıktın §6 YAML + §5.3 yirmi madde + `KIMI_SIGNOFF` ile bitsin. Önerilen `inbox/` dosya adını bir satırda yaz.

---

*Paket dosyası: docs/sync/KIMI_YAPISTIR_PAKET.md — STATE kaynağı: docs/sync/STATE.md*
