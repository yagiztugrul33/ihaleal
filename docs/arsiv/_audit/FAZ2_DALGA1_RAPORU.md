# 🌐 FAZ 2 — DALGA 1: CSS Logical/RTL Dönüşümü (global/layout)

**Tarih:** 2026-06-03
**Tag baseline:** `safe-before-faz2-d1` (5531fd3)
**Doktrin:** Sadece YÖN çevrilir (left/right→start/end); DEĞER/renk/boşluk/tasarım DEĞİŞMEZ. LTR piksel-aynı, AR aynalanır. ÇEKİRDEK + görsel tasarım DOKUNMA (className-only diff).

---

## ⚡ TEK-CÜMLELİK ÖZET

DALGA 1 (global/layout: **Navbar + Footer**) fiziksel yön sınıfları **19 dönüşümle** logical'e çevrildi (text-left→text-start ×14, left-0→start-0, right-0→end-0, ml-2→ms-2, border-l→border-s, pl-2→ps-2); **değer/renk/boşluk/tasarım AYNEN, git diff className-only (mantık SIFIR)**; `left-1/2 + -translate-x-1/2` centering idiom **[REVIEW] BIRAKILDI** (RTL'de aynalanırsa ortalama bozulur); **LTR piksel-aynı KESİN KANIT (computed-style/bbox): footer text-start LTR'de ikon SOL'da (icon_from_left:0, eski text-left ile AYNI), AR'da SAĞ'da (aynalandı)**; byte-compare yöntemi uygulama-geneli mikro-animasyon nedeniyle geçersiz (kontrol testiyle kanıtlandı); tailwind.config DOKUNULMADI (3.4.19 logical native); build YEŞİL + 4 dil × 2 sayfa 8/8 (0 pageerror, AR dir=rtl).

---

## 1) BLOK 1 — Envanter + DALGA PLANI

### tailwind.config
- Tailwind **3.4.19** → logical utility'ler (ms/me/ps/pe/start/end/text-start/text-end/border-s/border-e/rounded-s/rounded-e) **NATIVE destekli** → **config DOKUNULMADI** (ekleme gerekmedi).

### Envanter düzeltmesi (KRİTİK bulgu)
- Audit'teki "359" (ve benim ilk grep 1436) **false-positive şişirme**: `rounded-lg/xl/2xl/md/full` (NÖTR, tüm köşe boyutu) `rounded-l` deseniyle yanlış eşleşmiş; `border-slate-X` (renk) `border-l` ile. 
- **Kesin desen** (word-boundary, boyut-harfi hariç) ile gerçek yönlü sınıf sayısı çok düşük.

### DALGA 1 kapsamı: Navbar + Footer (Layout/MarketingNavbar = 0 yönlü, nötr)
| Dosya | Gerçek yönlü sınıf | Dönüşüm |
|---|---|---|
| Navbar.tsx | 6 (+1 [REVIEW]) | left-0→start-0, text-left→text-start, right-0→end-0, ml-2→ms-2, border-l→border-s, pl-2→ps-2 |
| Footer.tsx | 14 | text-left→text-start ×14 (w-full buton link'leri) |
| **TOPLAM** | **19 dönüşüm** | |

### Kalan dalga envanteri (kesin desen)
| Dalga | Kapsam | ≈ yönlü sınıf |
|---|---|---|
| DALGA 2 | ilan/borsa (AuctionDetail/LiveAuctions/borsa/listing/cinematic) | ~34 |
| DALGA 3 | dashboard üçlüsü + GES + profil | **~1** (11-N..N-3 zaten logical yazıldı ✅) |
| DALGA 4 | kalan (services/mega/modules) | ~58 |
> Gerçek toplam ~110 (359 değil); dashboard üçlüsü RTL-hazır doğmuş.

---

## 2) MEKANİK ÇEVİRİ HARİTASI (uygulanan, bire-bir)
| Fiziksel | Logical | Adet (D1) |
|---|---|---|
| `text-left` | `text-start` | 15 (Navbar 1 + Footer 14) |
| `left-0` | `start-0` | 1 |
| `right-0` | `end-0` | 1 |
| `ml-2` | `ms-2` | 1 |
| `border-l` | `border-s` | 1 |
| `pl-2` | `ps-2` | 1 |

### DOKUNULMAYAN (yön-nötr)
- `rounded-xl/lg/2xl`, `border` (renk/genişlik), `mt-2`, `py-1`, `px-3`, `gap-2`, `top-full`, `min-w-[...]`, `w-full`, `shadow-xl`, `z-[110]` → simetrik/nötr, DOKUNULMADI.

### [REVIEW] — BIRAKILDI (zorla-yönlü/centering)
| Konum | Sınıf | Sebep |
|---|---|---|
| Navbar.tsx:124 (mega-panel) | `left-1/2 -translate-x-1/2` | **Centering idiom** — `start-1/2` RTL'de ortalama bozar; translate-x fiziksel kalır. Görsel-merkez için fiziksel doğru. ZORLANMADI. |

---

## 3) KRİTİK — DEĞİŞMEYEN
- ✅ Renk/boşluk DEĞERİ/font/gölge/animasyon → HİÇBİRİ (ml-2→ms-2: değer 2 AYNI)
- ✅ ÇEKİRDEK mantık (placeBid/sealed/fees/Currency/auth) → SIFIR (CSS turu)
- ✅ JSX/onClick/metin → SIFIR (className-only)
- ✅ tailwind.config → DOKUNULMADI

---

## 4) BLOK 4 — TEST

### ⚠️ Byte-compare yöntemi GEÇERSİZ (dürüst not)
- BEFORE/AFTER full-page TR byte-diff = FARKLI (3788862b vs 3795551b) GÖRÜNDÜ.
- **KONTROL TESTİ:** aynı kodla 2 ardışık AFTER screenshot **da FARKLI** (3794282b vs 3795450b) + navbar element bile farklı.
- **SONUÇ:** uygulama-geneli mikro-animasyon (hero terminal + canlı ticker + rozet pulse/gradyan) → byte-compare bu uygulamada **non-deterministik, geçersiz yöntem**. Diff CSS'ten DEĞİL animasyondan.

### ✅ LTR PİKSEL-AYNI — KESİN KANIT (computed-style + bounding-box, deterministik)
Footer `text-start` butonu (her zaman görünür, animasyonsuz ölçüm):
| | LTR (tr) | AR |
|---|---|---|
| `textAlign` (computed) | `start` | `start` |
| ikon konumu | **SOL** (icon_from_left: **0**) | **SAĞ** (icon_from_right: **0**) |
| yorum | text-start = left → **eski text-left ile AYNI** | aynalandı ✅ |
> `text-align: start` LTR'de `left`'e çözülür (CSS spec) → ikon eskisi gibi sol kenarda (0px). LTR piksel-aynı KANITLANDI. AR'da ikon sağ kenara (0px) aynalandı.
> Navbar dönüşümleri (ms-2/border-s/ps-2/start-0/end-0) aynı CSS-spec garantisiyle LTR-özdeş (logical=physical, dir=ltr).

### AR AYNALAMA
- ✅ `<html dir="rtl">` + footer/navbar AR'da sağdan akar (screenshot)

### REGRESYON (4 dil × 2 sayfa, global navbar/footer)
| | / | /ihaleler |
|---|---|---|
| tr | 200 ltr 0err | 200 ltr 0err |
| en | 200 ltr 0err | 200 ltr 0err |
| ru | 200 ltr 0err | 200 ltr 0err |
| ar | 200 **rtl** 0err | 200 **rtl** 0err |

### git diff = className-only (KANIT)
- Navbar (4 satır) + Footer (13 satır): her `-/+` çiftinde YALNIZ yön token'ı değişti; onClick/JSX/metin/yapı AYNEN.
- ÇEKİRDEK mantık satırı → **SIFIR**

### Build + Lint
- PWA v1.3.0 — 299 entries (**6630.63 KiB**, +0.11 KiB) ✅ (className swap, hacim ~sabit)
- 2 dosya 0 error / 0 warning

### Screenshots
```
_audit/faz2-dalga1/  →  BEFORE-home-tr.png + AFTER-home-tr.png + AFTER-home-ar.png
```

---

## 5) ANAYASA KANITLARI
- ✅ Build YEŞİL — 299 entries (6630.63 KiB)
- ✅ Lint 0 error
- ✅ Tag: `safe-before-faz2-d1` (5531fd3) → `safe-after-faz2-d1`
- ✅ PUSH → `git log origin/main..HEAD` BOŞ
- ✅ className-only diff (çekirdek/tasarım SIFIR) · LTR piksel-aynı (computed proof) · AR aynalandı

---

## 6) SONRAKİ
| # | İş | ≈ |
|---|---|---|
| **FAZ 2 DALGA 2** | ilan/borsa (AuctionDetail/LiveAuctions/borsa/listing/cinematic) | ~34 |
| FAZ 2 DALGA 3 | dashboard üçlüsü + GES + profil | ~1 (neredeyse temiz) |
| FAZ 2 DALGA 4 | kalan (services/mega/modules) | ~58 |
| [MAĞAZA] | Mağaza modeli FİNAL kilit | — |
| 11-O | Emlakçı + Müteahhit panel | — |
| FAZ 3 | Yasal toplu + SEO hreflang + tarih Intl | — |

---

## 7) Master için 3 KARAR
1. **DALGA 1 bitti (global chrome RTL-hazır)** — DALGA 2 (ilan/borsa, ~34) hemen mi, yoksa mağaza/panel kararına mı?
2. **Envanter düzeltmesi:** "359" audit sayısı false-positive şişirmeydi; gerçek toplam ~110. Kalan 3 dalga bu gerçek sayıyla planlansın mı?
3. **left-1/2 centering [REVIEW]:** mega-panel ortalama idiom'u fiziksel bırakıldı (doğru karar). RTL'de mega-panel ortada görünüyor — onay?

---

— **Navbar + Footer 19 fiziksel→logical dönüşüm (text-left/left/right/ml/border-l/pl → start/end/ms/border-s/ps) · değer/renk/tasarım AYNEN · className-only diff (çekirdek SIFIR) · left-1/2 centering [REVIEW] bırakıldı · LTR piksel-aynı KESİN KANIT (computed: text-start→left icon_from_left:0) · AR aynalandı (icon_from_right:0) · byte-compare animasyon nedeniyle geçersiz (kontrol testi) · tailwind.config dokunulmadı (3.4 native) · build YEŞİL · 4 dil 8/8 0 pageerror · gerçek envanter ~110 (359 değil) · kalan D2~34/D3~1/D4~58.**
🌐🧭✅
