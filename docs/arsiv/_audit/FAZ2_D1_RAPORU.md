# 🌐 FAZ 2 — DALGA 1: CSS Logical/RTL — global/layout (KATI 3-KANIT)

**Tarih:** 2026-06-03
**Tag:** `safe-before-faz2-d1` (5531fd3) → `safe-after-faz2-d1` (DALGA 1 tam)
**Doktrin:** Sadece YÖN (left/right→start/end); DEĞER/renk/boşluk/tasarım/animasyon DEĞİŞMEZ. LTR piksel-aynı (KANIT şart), AR aynalanır. className-only diff.

---

## ⚡ TEK-CÜMLELİK ÖZET

DALGA 1 global/layout fiziksel→logical: **Navbar (6) + Footer (14)** [önceki tur, d675ac3] **+ ui/dialog.tsx (2) + Toast.tsx (1)** [bu tur, global modal/toast wrapper — ilk turda atlanmıştı] = **23 dönüşüm**; **KATI 3-KANIT ile LTR piksel-aynı KESİN doğrulandı**: kontrol (2xAFTER frozen navbar BYTE-AYNI) + **animasyon-dondurulmuş before/after navbar+footer BYTE-IDENTICAL ✅** + dialog kapat butonu LTR=sağ/AR=sol aynalama; sheet/drawer side-variant'ları (slide-animasyonu eşleşmiş) + Toast slide-yönü + Navbar centering idiom **[REVIEW]** (animasyon DOKUNMA kuralı); **className-only diff (çekirdek/JSX/mantık SIFIR)**; tailwind.config DOKUNULMADI (3.4 native); build YEŞİL + 4 dil 0 pageerror + AR dir=rtl.

---

## 1) ENVANTER + MEKANİK HARİTA

### tailwind.config: 3.4.19 → logical NATIVE → DOKUNULMADI

### Bu turda eklenen global wrapper'lar (ilk turda Navbar+Footer-only atlamıştı)
| Dosya | Dönüşüm | Etki |
|---|---|---|
| **ui/dialog.tsx** | `right-4`→`end-4` (kapat X) + `sm:text-left`→`sm:text-start` (DialogHeader) | **TÜM modal'lar** — RTL'de kapat butonu sol-üst |
| **Toast.tsx** | `right-4`→`end-4` (konum) | **TÜM toast'lar** — RTL'de sol kenar |

### Önceki tur (d675ac3, safe-after-faz2-d1 baz)
| Navbar (6) | left-0→start-0, text-left→text-start, right-0→end-0, ml-2→ms-2, border-l→border-s, pl-2→ps-2 |
| Footer (14) | text-left→text-start (w-full buton link'leri) |

### Mekanik harita (bire-bir, DEĞER KORUNUR)
text-left→text-start · left-X→start-X · right-X→end-X · ml→ms · pl→ps · border-l→border-s

---

## 2) [REVIEW] — BIRAKILDI (animasyon-eşleşmiş / centering, ZORLANMADI)
| Konum | Sınıf | Sebep |
|---|---|---|
| ui/sheet.tsx 61/63 | side=right `right-0 border-l` + side=left `left-0 border-r` | **slide-in-from-right/left animasyonuyla EŞLEŞMİŞ**; sadece konum çevirmek RTL'de animasyon uyumsuzluğu yaratır. Animasyon DOKUNMA → eşgüdümlü rtl: animasyon ayrı tur. (kullanan: ui/sidebar) |
| ui/drawer.tsx 62/63/80 | direction=right/left konum+border + text-left | aynı (vaul slide); (kullanan: KkaParselStudioPage) |
| Toast.tsx 31 | `animate-slide-in-right` | animasyon (DOKUNMA); konum end-4 çevrildi, RTL slide-yönü [REVIEW] |
| Navbar.tsx 124 | `left-1/2 -translate-x-1/2` | centering idiom (önceki tur [REVIEW]) |

> DOKUNULMAYAN yön-nötr: rounded-xl/lg, border renk/genişlik, mt/py/px/gap/w-full/top-4/z. Yeni physical class YOK.

---

## 3) NE DOKUNULMADI
- ✅ Renk/boşluk-DEĞERİ/font/gölge/**animasyon** → HİÇBİRİ (right-4→end-4: değer 4 AYNI)
- ✅ ÇEKİRDEK (placeBid/sealed/fees/Currency/auth) → SIFIR (CSS turu)
- ✅ JSX/mantık → SIFIR (className-only)
- ✅ tailwind.config → DOKUNULMADI

---

## 4) TEST — KATI 3-KANIT PROTOKOLÜ (LTR piksel-aynı + AR aynalama)

### 🔬 KANIT 1 — Kontrol (non-determinizm tespiti)
- 2x ardışık AFTER tam-sayfa: FARKLI → uygulama animasyonlu (hero/ticker/rozet pulse).
- **2x AFTER navbar (`animations:'disabled'`): BYTE-AYNI ✅** → frozen deterministik, byte-compare GEÇERLİ.

### 🔬 KANIT 2 — Animasyon-dondurulmuş before/after (ASIL KANIT)
`safe-before-faz2-d1` (5531fd3, fiziksel) build → frozen shot · `safe-after` (logical) build → frozen shot:
| Element | before/after (frozen, LTR) |
|---|---|
| **Navbar** | **BYTE-IDENTICAL ✅ PİKSEL-AYNI** |
| **Footer** | **BYTE-IDENTICAL ✅ PİKSEL-AYNI** |
> Fiziksel→logical dönüşüm LTR'de HİÇBİR pikseli değiştirmedi (start=left, ms=ml, end=right; CSS spec + empirik byte).

### 🔬 KANIT 3 — Navbar-izole + dialog mirror
- Navbar-izole frozen before/after = KANIT 2'deki byte-identical (izole element).
- **dialog kapat butonu (end-4):** LTR (tr) → **SAĞ/RIGHT** (eski right-4 ile AYNI) · AR → **SOL/LEFT** (aynalandı) ✅

### AR AYNALAMA
- ✅ `<html dir="rtl">` + navbar/footer sağdan akar (AFTER-navbar-ar.png / AFTER-footer-ar.png)
- ✅ dialog kapat sol-üst (AR) · toast sol kenar (end-4)

### REGRESYON (4 dil homepage)
| tr | en | ru | ar |
|---|---|---|---|
| 200 ltr 0err | 200 ltr 0err | 200 ltr 0err | 200 **rtl** 0err |

### git diff = className-only (KANIT)
- dialog/Toast/Navbar/Footer: her `-/+` çiftinde YALNIZ yön token'ı; JSX/onClick/mantık AYNEN. ÇEKİRDEK SIFIR.

### Build + Lint
- PWA v1.3.0 — 299 entries (**6644.90 KiB**) ✅ · 4 dosya 0 error / 0 warning

### Screenshots
```
_audit/faz2-dalga1/ → BEFORE/AFTER-navbar-tr.png · BEFORE/AFTER-footer-tr.png
                     · AFTER-navbar-ar.png · AFTER-footer-ar.png (+ önceki BEFORE/AFTER-home)
```

---

## 5) ANAYASA KANITLARI
- ✅ Build YEŞİL · Lint 0
- ✅ Tag: `safe-before-faz2-d1` (5531fd3) → `safe-after-faz2-d1`
- ✅ PUSH → `git log origin/main..HEAD` BOŞ
- ✅ className-only · LTR PİKSEL-AYNI (frozen byte-identical) · AR aynalandı · çekirdek SIFIR

---

## 6) KALAN DALGA ENVANTERİ (kesin desen, rounded-lg false-positive hariç)
| Dalga | Kapsam | ≈ |
|---|---|---|
| DALGA 2 | ilan/borsa (AuctionDetail/LiveAuctions/borsa/listing/cinematic) | ~34 |
| DALGA 3 | dashboard üçlüsü + GES + profil | ~1 (11-N..N-3 zaten logical) |
| DALGA 4 | kalan (services/mega/modules) | ~58 |
| [REVIEW] | sheet/drawer side-variant (animasyon-eşgüdümlü) + Navbar centering | ayrı |
> Gerçek toplam ~110 (audit "359" false-positive şişirmeydi).

---

## 7) SONRAKİ
FAZ 2 DALGA 2 (ilan/borsa) → DALGA 3 → DALGA 4 → sheet/drawer RTL animasyon turu → [MAĞAZA] → 11-O → FAZ 3 yasal.

---

## 8) Master için 3 KARAR
1. **DALGA 1 tam** (global chrome + dialog/toast RTL-hazır, 3-kanıt) — DALGA 2 (ilan/borsa ~34) hemen mi?
2. **sheet/drawer [REVIEW]:** side-variant'ları slide-animasyonuyla eşleşmiş → konum+animasyon eşgüdümlü rtl: turu ayrı planlansın mı?
3. **Toast slide-yönü:** konum aynalandı (end-4), `animate-slide-in-right` RTL'de ters → `rtl:animate-slide-in-left` keyframe eklensin mi (additive)?

---

— **Navbar+Footer (önceki) + dialog/Toast (bu tur, global modal/toast wrapper) = 23 fiziksel→logical · KATI 3-KANIT: kontrol(2xAFTER frozen BYTE-AYNI) + animasyon-dondurulmuş before/after navbar+footer BYTE-IDENTICAL PİKSEL-AYNI + dialog kapat LTR=sağ/AR=sol · className-only (çekirdek SIFIR) · sheet/drawer/centering [REVIEW] (animasyon DOKUNMA) · tailwind.config dokunulmadı · build YEŞİL · 4 dil 0 pageerror · AR dir=rtl · kalan ~110 (D2~34/D3~1/D4~58).**
🌐🧭🔬✅
