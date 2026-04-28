# ORTAK KOMUT — Kimi + Cursor (video + kalan iş; Kimi çıktısı Cursor doğrular)

**Bu metni aynen hem Kimi’ye hem Cursor’a yapıştırın.** Kimi sandbox’ta kalır; **repoya yazma yetkisi yalnız Cursor’da**. Kimi “yaptım” derse Cursor **dosyada grep/build ile doğrular**; yoksa **geçersiz**.

---

## 0) Şu an video neden çalışmıyor? (gerçek)

- `public/**/*.mp4` **yok** (repo taraması: 0 dosya).
- `Hero.tsx` ve `AdCampaign.tsx` **`videos/hero-aerial.mp4`** bekliyor.
- **Çözüm:** Aşağıdaki Kimi görevi 1 + Cursor görevi 1 birlikte; dosya **mutlaka** `public/videos/hero-aerial.mp4` yolunda olmalı (max ~10 MB, H.264 önerilir).

---

## 1) KİMLİK

| Ajan | Ortam | Yetki |
|------|--------|--------|
| **Kimi** | Sandbox / sohbet | Metin, liste, **kopyala-yapıştır blokları**, küçük kod önerisi. **Repoya doğrudan yazamaz.** |
| **Cursor** | `ihaleal.com` repo + terminal | Dosya değişikliği, `npm run build`, doğrulama. **Kimi çıktısını merge etmeden önce kontrol eder.** |

**Çakışma yasağı:** Aynı turda aynı dosyayı iki ajan “ben yazdım” diye iddia etmesin. **Kanın: repodaki dosya + build.**

---

## 2) KİMİ — AĞIR İŞ (çok madde; etkin, halüsinasyon yok)

Aşağıdakileri **numaralı** üret. Her maddede **“kaynak: gözlem / varsayım / kullanıcı verisi”** etiketini kullan. **Uydurma dosya yolu, uydurma URL, uydurma build sonucu yasak.**

**K1 — Pexels / stok video (insan adımı netleştir)**  
- Pexels’te “aerial istanbul” veya “real estate drone city” için **3 aday video** öner: sayfa başlığı, süre, tahmini dosya boyutu.  
- Her biri için: **pexels.com/video/... sayfa URL’si** (doğrudan hotlink verme; CDN linkleri zamanla değişir).  
- `public/videos/README.md` içine kullanıcı yapıştırması için **1 paragraf “Manuel indirme adımları”** (Windows: dosyayı `public\videos\hero-aerial.mp4` olarak kaydet).

**K2 — 10 Reels senaryosu (metin only)**  
- Her biri: 9:16, ~8 sn, sahne sahne (3–5 sahne), Türkçe konuşma metni, hashtag satırı.  
- Marka: ihaleal.com. **Rakip fiyat iddiası yok** (KVKK / reklam hukuku).

**K3 — “Canlıya çıkış” checklist (tek sayfa metin)**  
- KVKK, çerez, ödeme (iyzico), SMS, Findeks, teminat iadesi, staging → prod sırası.

**K4 — (İsteğe bağlı) Küçük React parçası**  
- Sadece **tek bileşen**: örn. `VideoWithFallback` — `src` yüklenemezse gri kutu + “Video hazırlanıyor” metni. **Tam dosya içeriği** TypeScript/TSX olarak ver; **import path** projeyle uyumlu (`@/lib/publicAsset` kullanımını Cursor’a bırak notu düş).

**Kimi bitirince tek cümle:** “K1–K4 tamam; varsayım içeren satırlar şunlar: …”

---

## 3) CURSOR — KONTROL + UYGULAMA (Kimi’nin üstünde)

**C0 — Doğrulama (her Kimi turunda zorunlu)**  
- `public/videos/hero-aerial.mp4` var mı? (`Test-Path` veya dosya listesi)  
- Yoksa: **Kimi K1’i oku**; kullanıcı dosyayı koyana kadar **K4 bileşenini** (varsa) ekle; yoksa sadece README güncelle.  
- `npm run typecheck && npm run build && npm run test:run` — kırmızıysa Kimi kodunu **alma**, geri bildirim yaz.

**C1 — Video dosyası**  
- Kullanıcı `hero-aerial.mp4` eklediyse: boyut/format smoke check; gerekirse `<video poster=...>` ekle.

**C2 — Halüsinasyon avı**  
- Kimi “şu dosyada şu var” dediyse: **grep ile kanıt**; yoksa `AGENT_RAPORU.md` §B’ye “Kimi iddiası doğrulanmadı” yaz.

**C3 — Çakışma**  
- Aynı dosyada başka ajan diff’i varsa: **tek birleşik patch**; gereksiz refactor yok.

**Cursor bitirince:** `CLOUD_CIKTI/AGENT_RAPORU.md` §B’ye kısa tur notu + video durumu (VAR/YOK).

---

## 4) “Cursor’ın yapamadığını Kimi yaptı mı?” — doğru cevap

**Hayır — rol tersi:**  
- **Repo + build + migrasyon dosyası + Vitest** → **Cursor** (disk).  
- **Uzun metin, senaryo, checklist, Pexels araştırma metni** → **Kimi** (sandbox).  
- Kimi **“build yeşil / dosya eklendi”** iddiasını **kanıtlayamaz**; bunu **yalnız Cursor** doğrular.

**Cloud (sabah):** Hukuk/mimari §A; repoya dokunmadan veya çok seyrek — düşük kota ile **inceleme cümlesi** yeter.

---

## 5) Sabaha kadar çalışma düzeni (öneri)

1. Kimi **K1→K4** sırayla üretsin.  
2. Cursor **C0** ile her blok sonrası doğrulasın; kod varsa uygulasın.  
3. Video binary **insan veya Cursor ortamı** (indirme) — Kimi link önerir, dosyayı kullanıcı veya Cursor indirip `public/videos/` koyar.  
4. Gece sonu: tek paragraf özet kullanıcıya (video VAR/YOK, build, açık risk).

---

## 6) Sabah Cursor’a hatırlatma (kısa)

“`docs/ORTAK_KIMI_CURSOR_KOMUT_VIDEO.md` + `AGENT_RAPORU.md` §B son turu oku; Git/K12/K13 geldiyse tur #6 bağlantı.”
