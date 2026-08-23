# 🌐 FAZ 2 — DALGA 2: CSS Logical/RTL — ilan/borsa

**Tarih:** 2026-06-03 · **Tag:** `safe-before-faz2-d2` (98fcb8a) → `safe-after-faz2-d2`
**Doktrin:** Sadece YÖN; değer/tasarım/animasyon DEĞİŞMEZ. className-only. Sealed/teklif/geri-sayım/motor MANTIK SIFIR.

## ⚡ ÖZET
ilan/borsa **34 fiziksel→logical** (7 dosya) + galeri chevron `rtl:rotate-180` (2); centering/arbitrary/border YOK; **sealed maskeleme (A***z) korundu**; computed-style kanıt (text-start LTR→sol/AR→sağ, 32 öğe); className-only diff (çekirdek SIFIR); build YEŞİL + 4 dil 0 pageerror + AR dir=rtl.

## 1) ENVANTER + DÖNÜŞÜM (34)
| Token | → | Adet |
|---|---|---|
| text-right | text-end | 10 |
| text-left | text-start | 6 |
| mr-1.5 | me-1.5 | 5 |
| right-4/0 | end-4/0 | 7 |
| left-4/2/0 | start-4/2/0 | 5 |
| ml-1 | ms-1 | 1 |
| ChevronLeft/Right | +rtl:rotate-180 | 2 (galeri ok) |

**Dosyalar:** AuctionDetail · LiveAuctions · ListingNearbyPoiSection · ListingSimilarSection · CinematicPropertyGallery · BorsaLayout · BorsaTerminali
**Yöntem:** precise sed (sınır korumalı `(^|[ "`>])`) → rounded-lg/xl/border-color/neutral DOKUNULMADI (sed kapsamı dışı).

## 2) [REVIEW] / DOKUNULMAYAN
- Centering/arbitrary/border-l/r → D2'de YOK
- `left-0 right-0` (tam-genişlik span) → `start-0 end-0` (simetrik, LTR piksel-aynı)
- order-book numeric `text-right`→`text-end`: sütun sayıları zaten `dir="ltr"` (i18n); hizalama mantıksal
- Yön-nötr (rounded-lg/xl, border renk, mx/my/px/py/gap) DOKUNULMADI

## 3) ÇEKİRDEK SIFIR (className-only)
- placeBidRpc/handleBid · **SEALED maskeleme** · geri sayım hesabı · AI/değerleme/ekspertiz motoru · doğrulandı rozeti · fees/Currency/FxRef · order-book mantığı → DOKUNULMADI
- git diff: her `-/+` çiftinde yalnız yön token + galeri rtl:rotate-180; JSX/mantık AYNEN

## 4) TEST (KANIT)
- **KONTROL:** 2xAFTER /borsa = FARKLI (canlı ticker) → byte-compare canlı içerikte N/A
- **COMPUTED-STYLE (deterministik, asıl kanıt):** /ilan/1 `text-start` 32 öğe → computed `textAlign:start`; LTR→**sol** (eski text-left ile AYNI = LTR piksel-aynı) · AR→**sağ** (aynalandı)
- **D1 metodu:** AYNI mekanik harita D1'de animasyon-dondurulmuş **byte-identical** kanıtlandı; CSS spec (logical=physical LTR) garantisi
- **SEALED:** /borsa bid-stream maskesi (A***z) TR+AR'da korundu ✅
- **AR AYNALAMA:** /ilan/1 + /borsa AR dir=rtl, bloklar sağa hizalı; geri sayım/₺ LTR korundu (i18n dir=ltr)
- **REGRESYON:** 4 dil × (/ilan/1 + /ihaleler) = 8/8 http 200 + dir doğru + **0 pageerror**
- Build YEŞİL — 299 entries · Lint 0

## 5) KALAN ENVANTER
| Dalga | ≈ |
|---|---|
| D3 dashboard üçlüsü+GES+profil | ~1 (zaten logical) |
| D4 kalan (services/mega/kurumsal/statik) | ~58 |

## 6) Master 3 KARAR
1. D2 bitti (ilan/borsa RTL-hazır, sealed korundu) — D3 (~1) hemen mi?
2. Galeri ok rtl:rotate-180 — RTL'de prev/next doğru yön. Onay?
3. order-book text-end (RTL'de sayılar sol-hizalı, dir=ltr içerikte) — onay?

— **ilan/borsa 34 fiziksel→logical + galeri chevron rtl:rotate-180 · sealed maskeleme korundu · computed text-start LTR=sol/AR=sağ · className-only (çekirdek SIFIR) · D1 byte-method + CSS spec · build YEŞİL · 4 dil 0 pageerror · AR dir=rtl.**
🌐🧭✅
