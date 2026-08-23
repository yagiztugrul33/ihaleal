# LINT TEMİZLİĞİ TURU — RAPOR

**AMAÇ:** Pre-existing 8 lint hatasını gider; davranış **hiç değişmesin** (yalnız ölü kod + regex eslint-disable).
Tarih: 2026-06-03 · Tag: `safe-before-lint-temizlik` → `safe-after-lint-temizlik` · Nitelik: **İZOLE, çekirdeğe SIFIR dokunuş, davranış SIFIR değişim**

---

## 1. 8 HATA — HER BİRİ NE YAPILDI

| # | Dosya:Satır | Kural | Tür | Eylem | Davranış |
|---|---|---|---|---|---|
| 1 | `aiSanitize.ts:36:20` | `no-control-regex` | Kasıtlı güvenlik kodu | **eslint-disable-next-line** (3 yorum satırı) | **AYNEN korundu** |
| 2 | `aiSanitize.ts:36:26` | `no-irregular-whitespace` | Kasıtlı (ZW karakter regex) | aynı disable satırı kapsıyor | **AYNEN korundu** |
| 3 | `aiSanitize.ts:36:29` | `no-irregular-whitespace` | Kasıtlı (BOM regex) | aynı disable satırı kapsıyor | **AYNEN korundu** |
| 4 | `GesAnalysisPage.tsx:5:51` | `@typescript-eslint/no-unused-vars` (Zap) | Ölü import | import satırından sil | Sayfa render +0 pageerror |
| 5 | `GesAnalysisPage.tsx:5:56` | aynı (MapPin) | Ölü import | sil | aynı |
| 6 | `GesAnalysisPage.tsx:5:64` | aynı (Building) | Ölü import | sil | aynı |
| 7 | `WarRoomPage.tsx:5:52` | aynı (ChevronDown) | Ölü import | sil | Sayfa render +0 pageerror |
| 8 | `WarRoomPage.tsx:5:65` | aynı (Building) | Ölü import | sil | aynı |

---

## 2. aiSanitize.ts — KASITLI KOD, MANTIK KORUNDU

**Yapılan tek değişiklik:** regex satırı üzerine 3 yorum satırı eklendi (eslint-disable-next-line direktifi). **Regex literal'i byte-identical kaldı.**

```diff
 function stripControlChars(s: string): string {
   // Tüm kontrol karakterleri + zero-width joiner kötüye kullanımı temizle.
   // 0x00-0x1F (NUL→US) + 0x7F (DEL) + 0x200B-0x200F (ZW) + FEFF (BOM)
+  // ESLint kuralları (no-control-regex + no-irregular-whitespace) KASITLI susturuldu:
+  // bu regex'in AMACI tam olarak bu karakterleri yakalamak. Mantık AYNEN korunur.
+  // eslint-disable-next-line no-control-regex, no-irregular-whitespace
   return s.replace(/[ -​-‏﻿]/g, "");
 }
```

**`git diff --text` kanıtı:** yalnız 3 `+` satır eklenmiş, regex satırı `-` olarak çıkmamış — bayt-bayt aynı.

### Sanity test (davranış proxy)
Test, kaynak dosyadan regex literal'ini okur, RegExp olarak yeniden inşa eder, kontrol karakterleriyle çağırır:

| Test | Girdi | Beklenen | Sonuç |
|---|---|---|---|
| NUL+text | `merhaba\x00dünya` | `merhabadünya` | ✓ |
| BEL+text | `selam\x07ihaleal` | `selamihaleal` | ✓ |
| ZWSP | `ihaleal​com` | `ihalealcom` | ✓ |
| BOM_at_start | `﻿içerik` | `içerik` | ✓ |
| RLM | `kuş‏yem` | `kuşyem` | ✓ |
| no_control_passthrough | `Selam Dünya 1.234,56 ₺ — ok` | aynı (passthrough) | ✓ |

Char class hex codes: **`[00, 2d, 1f, 7f, 200b, 2d, 200f, feff]`** — `\x00-\x1f` + `\x7f` + `​-‏` + `﻿` (yorumla birebir uyumlu, `2d` = hyphen = range separator).

**`TÜM TESTLER GEÇTİ: true`** ✓

---

## 3. UNUSED IMPORTS — KAYNAKTA OLMADIĞI DOĞRULANDI

### GesAnalysisPage.tsx (`/arastirma/ges`)
- `Zap`, `MapPin`, `Building` — grep ile **yalnız import satırında** geçtikleri doğrulandı, JSX/kod gövdesinde **hiç kullanılmıyor** → güvenli sil.
- Diff: import bloğundan 3 sembol çıkarıldı, diğer 12 sembol ve dosya gövdesi dokunulmadı.

### WarRoomPage.tsx (`/arastirma/war-room`)
- `ChevronDown`, `Building` — aynı şekilde grep doğrulandı, sadece import satırında → güvenli sil.
- Diff: import bloğundan 2 sembol çıkarıldı.

---

## 4. LINT 8 → 0

**Önce:**
```
✖ 8 problems (8 errors, 0 warnings)
```

**Sonra:**
```
(çıktı yok — temiz)
```

`npm run lint` (`npx eslint . --max-warnings 0`) → exit 0 ✓.

---

## 5. REGRESYON (BLOK 3f) — taze kanıt

| Sayfa | Path | bodyLen | pageerror | Sonuç |
|---|---|---|---|---|
| GesAnalysisPage | `/arastirma/ges` | 5577 | **0** | ✓ render |
| WarRoomPage | `/arastirma/war-room` | 4933 | **0** | ✓ render |
| Anasayfa (dürüstlük turu) | `/` | 8535 | **0** | ✓ korundu |
| İhaleler (konum + PWA) | `/ihaleler` | 9011 | **0** | ✓ korundu |

İptal-edilen import'ların sayfayı **bozmadığı** kanıtlandı (kullanılmadıkları için).

---

## 6. BUILD + ÇEKİRDEK + KAPSAM DIŞI

- **Build:** YEŞİL (PWA SW 299 entry).
- **Kaynak diff:** yalnız 3 dosya, hepsi düzenli ve eşit kapsam:
  - `src/lib/security/aiSanitize.ts`: +3 yorum satırı (regex line dokunulmadı)
  - `src/pages/intelligence/GesAnalysisPage.tsx`: import satırında 3 sembol çıkarıldı
  - `src/pages/intelligence/WarRoomPage.tsx`: import satırında 2 sembol çıkarıldı
- **Çekirdek MANTIK diff:** **SIFIR** (fees/sealed/placeBid/auth/RLS/routing/CurrencyContext/FxRef).
- **Dürüstlük turu + anasayfa boşluk turu + PWA + konum** korundu (regresyon).

---

## 7. SONUÇ

8 pre-existing lint hatasının **hepsi giderildi**:
- 5 unused import güvenle silindi (kaynak grep ile doğrulandı).
- 3 control/irregular-whitespace lint kuralı, sanitization güvenlik regex'i üzerinde kasıtlı olarak eslint-disable ile susturuldu — **regex byte-identical**, `stripControlChars` davranışı 6/6 sanity testi geçti.

**Davranış SIFIR değişim.** Lint 0, build yeşil, 4 sayfa 0 pageerror, çekirdek sıfır diff. Bu tur tam olarak "ölü kod + güvenlik regex'i susturma" turu — başka bir şey değil.

---

**SONRAKİ:** `_vite_utf8.ts` ölü kopya temizliği (sıradaki küçük tur) → [tescil + 3 KAPI cevapları] → deploy → mağaza kodu.
**BACKLOG:** `_vite_utf8.ts` ölü kopya · Supabase staging E2E · AI çok-dilli yanıt · native mobil + geofencing-push (FAZ 2).
