# CENTERING/ARBITRARY RTL TURU — RAPOR (FAZ 2 FİNALİ)

**FAZ 2 [REVIEW] grup 2 — merkez idiom + arbitrary değerler**
Tarih: 2026-06-03 · Tag: `safe-before-centering-rtl` (f1a8468) → `safe-after-centering-rtl`
Nitelik: **EN İNCE TUR** — merkezleme idiomu DOKUNULMAZ, yalnız net-yönlü arbitrary aynalanır.

---

## 1. İLKE
- **Merkez idiom** (`left-1/2 -translate-x-1/2`, `left-[50%] translate-x-[-50%]`): yatay
  merkezleme — yön taşımaz, AR'da da merkez aynı noktadır → **DOKUNULMAZ**.
- **Net-yönlü arbitrary**: yalnız tek-tarafa konumlanan (`left-[%]`/`right-[px]`) ve
  yön taşıyan değerler mantıksala çevrilir; **şüphede [REVIEW]**.
- **Simetrik** (`left-[10%] right-[10%]` ikisi birden): AR'da özdeş → DOKUNULMAZ.

---

## 2. TAM-SİTE ENVANTER & SINIFLANDIRMA

### 2.1 Merkez idiom (DOKUNULMADI) — 11 yer
- `left-1/2`/`right-1/2` × 9 (hepsi `-translate-x-1/2` ile; çıplak merkez-dışı YOK).
- `ui/dialog.tsx:61` + `ui/alert-dialog.tsx:55`: `left-[50%] … translate-x-[-50%]` (modal merkezleme).
→ **NEGATİF KONTROL ile doğrulandı** (AR'da merkezde kaldı, §3.1).

### 2.2 Simetrik (DOKUNULMADI) — 1 yer
- `sections/target/HomeTarget.tsx:337`: `left-[10%] right-[10%]` (ortalanmış şerit) → AR'da özdeş.

### 2.3 ÇEVRİLEN — WaveBackground orb'ları (3 yer) ✅
`components/home/WaveBackground.tsx` — dalga SVG katmanları **zaten `start-0` (mantıksal)**;
proje bu arka planı RTL'de aynalamayı amaçlamış, 3 glow-orb arbitrary olduğu için atlanmıştı.
Tamamlandı (dalgalarla tutarlı `start/end` stili):
| satır | eski (fiziksel) | yeni (mantıksal) | LTR | RTL |
|---|---|---|---|---|
| 10 | `-left-[20%]` | `-start-[20%]` | inset-inline-start:-20% (=left) | =right (aynalı) |
| 14 | `-right-[10%]` | `-end-[10%]` | inset-inline-end:-10% (=right) | =left (aynalı) |
| 18 | `left-[30%]` | `start-[30%]` | inset-inline-start:30% (=left) | =right (aynalı) |

**Güvenlik:** orb'lar `aria-hidden` + `pointer-events-none` + dekoratif (blur 80-100px,
opacity .2-.3); parent **`overflow-hidden`** → off-screen negatif konumlar clip'lenir,
**taşma riski yok** (§3.3 ile doğrulandı). Diff yalnız bu 3 satır, yön-only.

### 2.4 [REVIEW] — DOKUNULMADI (gerekçeli, UI-PRIMITIVE turuyla tutarlı)
| Öğe | Sebep |
|---|---|
| `ui/sidebar.tsx` (`left-0`/`right-0`/`left-[calc()]`/`right-[calc()]`/`-right-2`/`-left-2`/`right-1`/`right-3`) | Custom + `data-[side]`-koşullu + offcanvas calc; canlı test gerekli. |
| `ui/carousel.tsx` (`-left-12`/`-right-12` prev/next) | Embla **JS-scroll yönü**; CSS-only aynalamak kaydırmayı bozar. |
| `ui/navigation-menu.tsx` (`left-0` viewport + `slide-*-52` motion) | Radix-motion + DirectionProvider zaten align'ı aynalar. |

> Bu 3 primitive UI-PRIMITIVE turunda da [REVIEW] idi — tutarlı.

---

## 3. KANIT — `_audit/centering-rtl/result.json`

### 3.1 NEGATİF KONTROL (turun ANA kanıtı): merkez idiom AR'da merkezde
| idiom | LTR merkez | RTL merkez | beklenen | sonuç |
|---|---|---|---|---|
| `left-1/2 -translate-x-1/2` | 500 | 500 | 500 | ✓ ikisi de merkezde |
| `left-[50%] translate-x-[-50%]` | 500 | 500 | 500 | ✓ ikisi de merkezde |
→ Merkezleme **dokunulmadı**, AR'da kaymadı.

### 3.2 ORB aynalama (logical-arbitrary, gerçek derlenmiş CSS)
| orb | LTR | RTL | sonuç |
|---|---|---|---|
| `-start-[20%]` | left=-80 | right=-80 | ✓ aynalandı (LTR.left==RTL.right) |
| `start-[30%]` | left=120 | right=120 | ✓ aynalandı |
→ LTR fiziksel-özdeş (eski `-left-[20%]`=-80px ile birebir), AR aynalı.

### 3.3 TAŞMA KONTROLÜ (gerçek homepage, yatay scroll olmamalı)
| bağlam | overflow | sonuç |
|---|---|---|
| desktop TR / AR | false / false | ✓ taşma yok |
| mobil 375 TR / AR | false / false | ✓ taşma yok |
→ Orb aynalaması taşma yaratmadı (`overflow-hidden` tutuyor).

### 3.4 SMOKE & CSS
- Homepage 0 pageerror (LTR + AR). Build YEŞİL.
- CSS: `-start-[20%]`→`inset-inline-start:-20%`, `-end-[10%]`→`inset-inline-end:-10%`,
  `start-[30%]`→`inset-inline-start:30%` derlendi (LTR'de fiziksel ile özdeş).

### 3.5 Çekirdek/mantık
Sıfır mantık dokunuşu — yalnız 3 dekoratif CSS konum sınıfı.

---

## 4. SONUÇ

🎯 **FAZ 2 RTL TAM BİTTİ.**

FAZ 2 boyunca yapılanlar:
- **DALGA 1-4**: tüm fiziksel yönlü utility'ler (ml/mr/pl/pr/left/right/text/border/rounded) → mantıksal (non-ui = 0 kalıntı).
- **İKON-YÖN**: 141 yönlü ikon `rtl:rotate-180`/`rtl:-scale-x-100`.
- **UI-PRIMITIVE**: Sheet side-variant + radix DirectionProvider + Toast slide + menü-içi RTL.
- **CENTERING/ARBITRARY** (bu tur): merkez idiomları korundu (negatif kontrol), WaveBackground orb'ları aynalandı; sidebar/carousel/nav-menu gerekçeli [REVIEW].

Sonuç: **LTR birebir korundu** (mantıksal=özdeş + rtl:=scoped + merkez=dokunulmadı; footer
byte-identical, sentetik computed, taşma yok), **AR düzgün aynalanıyor**. Net-yönlü
fiziksel sınıf kalıntısı yok; kalan az sayıda öğe (JS-side/custom primitive) dürüstçe
[REVIEW] olarak işaretli ve gerekçeli.
