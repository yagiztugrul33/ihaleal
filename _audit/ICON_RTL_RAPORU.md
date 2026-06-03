# 🌐 İKON-YÖN RTL TURU — yönlü ikonları AR'da aynala (presentation-only)

**Tarih:** 2026-06-03 · **Tag:** `safe-before-icon-rtl` (9436b69) → `safe-after-icon-rtl`
**Doktrin:** Presentation-only, SADECE rtl: eklenir. LTR byte-identical (rtl: LTR'yi etkilemez). Çekirdek/handler SIFIR.

## ⚡ ÖZET
**141 yatay-yönlü ikona rtl: transform** eklendi (105 dosya); ArrowLeft/ArrowRight/ChevronLeft/ChevronRight → `rtl:rotate-180` (dikey-simetrik, D2 ile tutarlı), Send → `rtl:-scale-x-100` (diyagonal); **16 zaten-rtl atlandı (çift-ekleme YOK), 1 accordion ChevronRight hariç, 3 cn/template → [REVIEW]**; **diff RTL-ONLY (141/141 eklenen satır rtl:, başka değişiklik 0)**; computed transform LTR=none/AR=180°; negatif kontrol (yön-nötr ikon AR'da dönmedi); buton davranışı korundu; build YEŞİL + 0 pageerror.

## 1) SINIFLANDIRMA
| İkon | Sınıf | Yöntem | Adet |
|---|---|---|---|
| ArrowLeft | ✅ AYNALA (geri/ileri ok) | rtl:rotate-180 | 80 |
| ArrowRight | ✅ AYNALA (ileri/devam) | rtl:rotate-180 | 32 |
| ChevronRight | ✅ AYNALA (next/breadcrumb/git) | rtl:rotate-180 | ~30 |
| ChevronLeft | ✅ AYNALA (prev) | rtl:rotate-180 | 7 |
| Send | ✅ AYNALA (gönder oku, diyagonal) | **rtl:-scale-x-100** | 7 |
> Yöntem: dikey-simetrik (ok/chevron) → rotate-180 (D2 deseniyle tutarlı, 19 mevcut); diyagonal (Send) → scale-x (rotate-180 yanlış olurdu).

## 2) AYNALANMAYAN (🚫 — DOKUNULMADI, negatif kontrol)
- ChevronUp/Down (dikey), ArrowUp/Down (dikey), Clock/User/Home/Settings/Search/Heart/Star/Trash/Edit, Play/Pause (media), X/Menu/Plus/Minus/Check, logo/marka, sosyal ikonlar → **rtl: EKLENMEDİ**
- Negatif kontrol kanıtı: yön-nötr svg transform AR'da = `none` (dönmedi) ✅

## 3) [REVIEW] — BIRAKILDI
| Konum | Sebep |
|---|---|
| ChevronRight 3× `className={cn(...)}` | string-className değil, template/cn → manuel ekleme gerek |
| NasilCalisir:293 ChevronRight `group-open:rotate-90` | **accordion indicator** — rtl:rotate-180 rotate-90 ile çakışır (RTL+open=270°) → ayrı ele alınmalı |
| ui-primitive grup (FAZ 2 [REVIEW] grup 1) | animasyon-eşgüdümlü, bu tur değil |

## 4) ÇEKİRDEK SIFIR (rtl-only diff)
- onClick/handler/state/mantık → DOKUNULMADI (sadece görsel transform)
- placeBid/sealed/fees/motor/auth → SIFIR
- **diff: 141 eklenen satırın 141'i rtl: içerir; rtl: içermeyen ekleme = 0** (JSX/handler/string SIFIR)

## 5) TEST (LTR byte-identical + AR aynalama)
- **LTR BYTE-IDENTICAL:** rtl:-prefixli sınıf LTR'de uygulanmaz → flip ikon computed transform **LTR(tr)=`none`** (değişmedi); diff rtl-only (CSS spec garantisi)
- **AR AYNALAMA:** flip ikon AR computed transform = **`matrix(-1,0,0,-1,0,0)`** (180° aynalandı) ✅
- **NEGATİF KONTROL:** yön-nötr ikon AR transform = `none` (yanlışlıkla aynalanmadı) ✅
- **BUTON DAVRANIŞI:** AR geri butonu (ArrowLeft rtl:rotate-180) tıklandı → **navigated:true** (işlev korundu) ✅
- **REGRESYON:** 4 dil × (/ilan/1 + /sss + /mesajlar) → **0 pageerror**
- **ÇİFT-EKLEME YOK:** 16 zaten-rtl atlandı, double-rtl grep = boş
- Build YEŞİL — 299 entries · Lint 0

## 6) Screenshots
`_audit/icon-rtl/` → ilan-tr.png (ok düz) · ilan-ar.png (ok aynalı)

## 7) SONRAKİ
ui-primitive RTL (FAZ 2 [REVIEW] grup 1, animasyon-eşgüdümlü) → [3 KAPI + terim kararı] → SEO/hreflang (11-S) → MAĞAZA kodu.
BACKLOG: 3 cn/template ChevronRight + NasilCalisir accordion (manuel) · Supabase staging E2E · AI çok-dilli.

## 8) Master 3 KARAR
1. İkon-yön bitti (141 ikon AR'da doğru aynalandı, LTR byte-identical) — ui-primitive RTL turu mu, SEO (11-S) mi, MAĞAZA mı?
2. **Send yöntemi:** scale-x (diyagonal doğru) vs ok/chevron rotate-180 — iki-yöntem onaylandı mı?
3. **[REVIEW] 4 ikon** (3 cn ChevronRight + 1 accordion): ayrı manuel mikro-tur mu?

— **141 yatay-yönlü ikon rtl: (105 dosya) · ok/chevron rotate-180 + Send scale-x · 16 zaten-rtl atlandı (çift yok) · 1 accordion + 3 cn → [REVIEW] · diff RTL-ONLY · LTR=none(byte-identical)/AR=180°(aynalandı) · negatif kontrol (nötr dönmedi) · buton davranışı korundu · 0 pageerror · çekirdek SIFIR.**
🌐🧭🔄✅
