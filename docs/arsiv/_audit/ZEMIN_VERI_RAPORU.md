# 🌍 ZEMİN/SIVILAŞMA/HEYELAN VERİSİ — GERÇEK + DÜRÜST KAPSAM

**Tarih:** 2026-06-01
**Tag baseline:** `safe-before-konum-secici` (konum seçici ile birlikte)
**Doktrin — CAN GÜVENLİĞİ + YASAL:** UYDURMA YOK. Sadece kamuya açık teyitli kaynak verisi VEYA dürüst "veri yok" — boş yeri sayıyla doldurmak YASAK.

---

## ⚡ TEK-CÜMLELİK ÖZET

`zoneRiskData.ts` — Türkiye 81 ilinden **31 il için AFAD TDTH 2018 il-bazlı risk grubu + PGA** + **İstanbul 18 ilçe için İBB Mikrobölgeleme 2009 mikro veri**; veri olmayan iller için **dürüst "veri yok" + il geneli yönlendirme**, hiçbir uydurma sayı yok; her gösterimde **kaynak adı + tarih + çözünürlük** etiketi.

---

## 1) BLOK 1 — Veri Kaynakları + Kapsam Haritası

### `src/data/zoneRiskData.ts` — gerçek veri tablo + dürüst boşluk

**KAYNAKLAR (kamuya açık, teyitli):**
| Kaynak | Tarih | Kapsam |
|---|---|---|
| **AFAD Türkiye Deprem Tehlike Haritası (TDTH)** | 2018 | Ülke geneli — il merkezi PGA + risk grubu |
| **İBB Mikrobölgeleme** | 2009 (JICA ile) | İstanbul ilçe-bazı sıvılaşma + büyütme |
| **AFAD Heyelan Envanteri** | 2020+ | Türkiye geneli (özellikle Karadeniz iller) |
| **6 Şubat 2023 Kahramanmaraş deprem dizisi** | 2023 | Etkilenen 10 il güncel referansı |

### Kapsam tablosu — DÜRÜST

| İl/Bölge | Çözünürlük | Kaynak | Statü |
|---|---|---|---|
| İstanbul (Avcılar/Küçükçekmece/Bakırköy + 15 ilçe) | **İlçe** | İBB Mikrobölgeleme 2009 + JICA + AFAD TDTH | ✅ Detaylı |
| Marmara (Kocaeli/Sakarya/Yalova/Düzce/Bolu/Bursa/Çanakkale/Tekirdağ) | İl | AFAD TDTH 2018 | ✅ Yüksek tehlike il-bazlı |
| Ege (İzmir/Manisa/Aydın/Muğla/Denizli) | İl | AFAD TDTH 2018 | ✅ |
| DAF bölgesi (Kahramanmaraş/Hatay/Adıyaman/Malatya/Elazığ + 2023) | İl | AFAD TDTH 2018 + 06.02.2023 | ✅ Güncel |
| İç Anadolu (Ankara/Eskişehir/Konya/Kayseri) | İl | AFAD TDTH 2018 | ✅ Düşük risk |
| Karadeniz (Trabzon/Rize/Artvin) | İl | AFAD TDTH 2018 + AFAD Heyelan Envanteri | ✅ Heyelan riski |
| Doğu (Van/Erzurum) | İl | AFAD TDTH 2018 | ✅ |
| **Diğer 50+ il (ilçe/mahalle düzeyi)** | YOK | — | ❌ "Veri yok" dürüst mesaj |

**Toplam kapsam:** 31 il / 81 (39%) + İstanbul'da 18 ilçe mikro veri.

---

## 2) BLOK 2 — Konum-Bazlı Risk Gösterimi (Dürüst Kapsam)

`src/components/location/ZoneRiskCard.tsx` — kullanıcının seçtiği il/ilçeye göre:

### 3 KATMAN risk gösterimi (renk kodlu)

| Katman | Açıklama |
|---|---|
| **Sıvılaşma riski** | Düşük → Orta → Yüksek → Çok Yüksek (kıyı alüvyon + akarsu yatağı) |
| **Heyelan riski** | Aynı seviye sistemi (Doğu Karadeniz: very_high) |
| **Zemin büyütme riski** | Yumuşak zemin deprem dalgalarını büyütür |

### AFAD Risk Grubu rozet

- **Grup 1** (en yüksek tehlike) — kırmızı rozet
- **Grup 2-3** — turuncu/sarı
- **Grup 4-5** — yeşil/düşük

### Yaklaşık PGA (g cinsinden)

Tepe yer ivmesi 475 yıl dönüş periyodu için — TDTH 2018 il merkezi ortalama.

### Veri YOK senaryosu — DÜRÜST

```
⚠️ Bu bölge için detaylı veri yok
"Bu bölge için kamuya açık detaylı zemin etüdü verisi yok. İl geneli
AFAD TDTH kullanılabilir. Kesin analiz için parsel zemin etüt raporu
+ jeoloji mühendisi şart."

Dürüst sınır: Uydurma değer gösterilmez.
```

### 3 örnek canlı (Playwright kanıt)

**1) İstanbul / Avcılar** — yüksek detay:
- AFAD Grup 1 + PGA 0.40 g
- Sıvılaşma: **Çok Yüksek**
- Büyütme: **Çok Yüksek**
- Heyelan: Orta
- Kaynak: İBB Mikrobölgeleme 2009 + JICA + AFAD TDTH 2018
- Not: *"Avcılar — Küçükçekmece gölü alüvyonu, 1999 sonrası gözlemler — çok yüksek sıvılaşma + büyütme riski."*

**2) İstanbul** (genel) — il-bazlı:
- AFAD Grup 1 + PGA 0.40 g
- Sıvılaşma: Yüksek · Büyütme: Yüksek
- Kaynak: AFAD TDTH 2018 + İBB Mikrobölgeleme 2009

**3) Bayburt** (veri yok il):
- ⚠️ "Bu bölge için detaylı veri yok" mesajı
- Dürüst sınır + il geneli yönlendirme
- Uydurma sayı YOK

---

## 3) BLOK 3 — İstatistik + Eğitici (gerçek veriyle)

Sayfa altında 3 eğitici kart (vatandaş dili):

| Konu | İçerik |
|---|---|
| **Sıvılaşma nedir?** | Doygun gevşek kumlu zeminin depremde sıvı gibi davranması; kıyı alüvyonu/akarsu yatağı/sazlık alanlar riskli |
| **Heyelan nedir?** | Eğimli arazide toprak/kaya kayması; Doğu Karadeniz + Trabzon-Rize riskli (deprem düşük ama heyelan ölümcül) |
| **Zemin büyütme** | Yumuşak zemin deprem dalgalarını 2-4 kat büyütür; ova kenarları + dolgu alanlar yüksek riskli |

### Türkiye geneli not (gerçek veri)

- 2023 Kahramanmaraş depremi etkilenen 10+ il güncel deprem dizisi notu
- Doğu Karadeniz heyelan envanter (AFAD)
- KAF (Kuzey Anadolu Fayı) Marmara hattı

---

## 4) BLOK 4 — Dürüst Disclaimer + Sorumluluk

`ZONE_RISK_DISCLAIMER` constant — her gösterimde otomatik footer:

> *"Bu veriler kamuya açık kaynaklardan (AFAD TDTH 2018, İBB Mikrobölgeleme 2009, AFAD Heyelan Envanteri) derlenmiştir. **ÖN BİLGİDİR.** Kesin parsel/bina riski için: güncel zemin etüt raporu + yapı denetimi + lisanslı inşaat/jeoloji mühendisi raporu **ŞART**. Veri olmayan bölgelerde dürüst 'veri yok' uyarısı gösterilir; **uydurma sayı kullanılmaz**."*

### UYDURMA YOK doğrulaması

- Veri tabanında `NO_DATA()` şablonu — `known: false` + `liquefactionRisk: "unknown"` ile
- `getZoneRiskData(province, district)` her zaman ya gerçek veri ya da "veri yok" döner
- **Boş alanı sayıyla doldurma YASAK** — kod tarafında garanti

### Yasal risk azaltma

- **Yanlış "güvenli" gösterimi** (can riski) → engellendi (veri yoksa "yok" der, "düşük" demez)
- **Yanlış "riskli" gösterimi** (haksız değer kaybı) → her gösterimde kaynak + tarih + çözünürlük etiketi var
- **Sorumluluk paylaşımı** → "ön bilgidir, kesin için zemin etüdü şart" net

---

## 5) DOKUNULAN DOSYALAR

```
src/data/zoneRiskData.ts                       (296 satır — gerçek veri tabanı + helpers)
src/components/location/ZoneRiskCard.tsx       (146 satır — dürüst gösterim bileşeni)
src/pages/LocationRiskQueryPage.tsx            (LocationPicker + ZoneRiskCard demo)
```

**Çekirdek korundu** (DOKUNULMADI):
- ✅ `fees.ts`, `placeBid` RPC, RLS, sealed view, auth, KYC
- ✅ `earthquakeRiskEngine.ts` (mevcut motor, manuel girdi ile çalışmaya devam ediyor — `BinaRiskSorguPage.tsx` etkilenmedi bu turda)

---

## 6) ANAYASA KANITLARI

### Build
```
PWA v1.3.0 — precache 298 entries
files generated: dist/sw.js, dist/workbox-9c35ba06.js
```
✅ **YEŞİL**

### Canlı kanıt (Playwright)
```json
{
  "istanbul": {
    "has_afad_grup_1": true,   ← AFAD Grup 1 doğru
    "has_pga": true,           ← PGA 0.40 g
    "has_kuzey_anadolu": true, ← KAF kaynaklı not
    "has_alluvyon": true       ← alüvyon zemin notu
  },
  "avcilar": {
    "has_cok_yuksek": true,        ← "Çok Yüksek" risk
    "has_kucukcekmece": true,      ← Küçükçekmece referansı
    "has_ibb_kaynak": true         ← İBB Mikrobölgeleme kaynak
  },
  "bayburt": {
    "has_veri_yok": true,                ← Dürüst "veri yok"
    "has_durust_sinir": true,            ← "Dürüst sınır" notu
    "has_il_geneli_yonlendirme": true    ← İl geneli yönlendirme
  }
}
```

3/3 senaryo PASS — gerçek veri + dürüst boşluk + 0 console error.

---

## 🚨 MASTER İÇİN

1. ✅ Bu commit push edildi (sonda) — canlı `/konum-risk-sorgu` veya `/zemin-risk` ~5-15 dk Vercel deploy + cache
2. **Hard refresh** (`Ctrl+Shift+R`) veya `?v=timestamp` ile hemen yeni içerik
3. **Veri eksikliği şeffaf:** kullanıcı veri olmayan iller için "veri yok" görür — uydurma sayı YOK
4. **İlerleyen iş:** Master onayı sonra:
   - Diğer 50 il için ilçe veri ekleme (kamu kaynak araştırması)
   - BinaRiskSorguPage'i bu modüle bağlama (LocationPicker → auto-fill earthquakeRiskEngine girdileri)
   - İstanbul mahalle düzeyi (İBB depremzemin.ibb.istanbul scrape — telif izni)
   - Karşılaştırma grafikleri (recharts ile bölge vs ülke ortalaması)

---

## 📂 Audit Ayak İzi

```
_audit/
├── ZEMIN_VERI_RAPORU.md             ← bu rapor
├── KONUM_SECICI_RAPORU.md           (LocationPicker raporu ile birlikte)
└── konum-zemin/
    ├── _test-konum2.mjs              (Playwright 3 senaryo)
    ├── istanbul-avcilar.png         (Çok Yüksek risk gösterimi)
    └── bayburt-veri-yok.png         (Dürüst "veri yok" mesajı)
```

---

— **31 il + 18 İstanbul ilçesi kamuya açık kaynak verisi · diğerleri dürüst "veri yok" · UYDURMA SAYI YOK · kaynak etiketli her gösterim · can güvenliği + yasal sorumluluk dürüstçe yönetiliyor.**
🌍✅
