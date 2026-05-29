# ihaleal — Master Yol Haritası

**Tarih:** 2026-05-29 (olay günü) · **Son güncelleme:** 2026-05-30 akşam  
**Hazırlayan:** Cursor — 10-komut zinciri sonu kapsamlı analiz  
**Operatör:** Master (yagiztugrul33)  
**Audit HEAD:** `8482872` · **Prod bundle:** `index-BH3oeyCz.js` + `vendor-charts` 445 KB

> **Master: Her sabah bu dosyayı aç (~5 dk).** Detay: [`KALAN_ISLER.md`](./KALAN_ISLER.md) · [`FEATURE_INVENTORY.md`](./FEATURE_INVENTORY.md) · [`R13_PANTSIR_PLAN.md`](./R13_PANTSIR_PLAN.md)

---

## A) BUGÜNKÜ BAŞARILAR (2026-05-29 → 2026-05-30)

### Sabah krizi → akşam stabilizasyon (doğrulanmış)

| Saat (yaklaşık) | Olay | Durum |
|---|---|---|
| Sabah | Production “500” ekranı (`home.investor` undefined; HTTP aslında 200) | ✅ **Çözüldü** |
| ~90 dk | **5 hotfix** deploy | ✅ `c66e875` → `2fa878a` |
| Gün | TS Sağlık Sprint 1 (npm restore, valuation lib, tsconfig) | ✅ 131 → ~33 hata |
| Gün | TS Sağlık Sprint 2 (paket 5–7) | 🟡 **33 → 27 hata** (hedef 0 değil) |
| Akşam | R6 + Console merge | ✅ Cherry-pick `99f8f39`, `d564a04` |
| Akşam | Bundle prod split (R6) | ✅ Monolit ~930 KB → index **300 KB** + charts **445 KB** |
| Akşam | Edge kısmi deploy | 🟡 `ai_qa` + `earthquakes_latest` **401** (deployed) |
| Gece | 10-komut audit zinciri (envanter + sweep) | ✅ 11+ audit dosyası güncel |
| Gece | R13 Pantsir **plan** | ✅ `R13_PANTSIR_PLAN.md` — **kod henüz yok** |

**Dürüst düzeltme (sweep ile teyit):**

| İddia | Gerçek (2026-05-30 sweep) |
|---|---|
| TS → 0 hata | ❌ Fresh **tsc = 27 hata** |
| v0.12.8 tag | ❌ Remote yalnızca **v0.12.6** |
| R13.4 Pantsir UI canlı | ❌ `PantsirPanel` repo + bundle **yok** |
| R13.2 POI canlı | ❌ `nearby-poi` Edge **404** |
| earthquakes_latest → 200 anon | 🟡 **401** POST (deployed; auth gerekli) |

### Kümülatif sayılar (R12 dönemi + 29 Mayıs)

| Metrik | Değer |
|---|---:|
| Production commit (29–30 Mayıs) | **20+** |
| R12.6 → HEAD delta (Faz A paketi) | **+9.471 satır** / 75 dosya |
| Canlı route (App.tsx) | **~100** statik |
| Endpoint sweep (kritik 73 path) | **73/73 HTTP 200** |
| Rollback (29 Mayıs) | **0** |
| Veri kaybı | **0** |
| Audit dosyası (güncel set) | **12+** |

---

## B) MEVCUT DURUM (ŞU AN — sweep `8482872`)

### Üretim sağlık

| Kategori | Durum | Kanıt |
|---|---|---|
| Site HTTP | ✅ 200 | [`ENDPOINT_SWEEP.md`](./ENDPOINT_SWEEP.md) |
| Bundle largest | ✅ **445 KB** < 819 KB | `vendor-charts-DUXOCkR2.js` |
| TS hatalar | ❌ **27** | `tsc -p tsconfig.app.json --noEmit` |
| Endpoint test | ✅ **73/73** 200 | iPhone UA sweep |
| Sprint 3 RLS | ✅ Sağlam | listings/auctions 200, profiles 401 |
| Edge function | 🟡 Kısmi | 2 yeni deployed; 4+ hâlâ 404 |
| Release tag | ⏳ | **v0.12.8 bekliyor** (TS 0 sonrası) |

### Tamamlanan özellikler (özet)

Detay: [`FEATURE_INVENTORY.md`](./FEATURE_INVENTORY.md) — **~78 canlı**, **~14 kısmi/mock**

| Paket | İçerik | Durum |
|---|---|---|
| **Sprint 3** | İhale, KYC UI, teklif, deposit, komisyon | ✅ Canlı |
| **R12.1** | Borsa (6 ekran) | ✅ Canlı |
| **R12.2** | 7 portal / hizmetler | ✅ Canlı |
| **R12.3 + Faz A-1** | Deprem modülleri + AfetDisasterHub | ✅ Canlı |
| **Faz A-2** | 4 harita modülü | ✅ Canlı |
| **Faz A-3** | 10 ders + LessonView | ✅ Canlı |
| **Faz A-4** | 16 ikincil modül | ✅ Canlı |
| **Faz A-5** | Değerleme + GES UI | 🟡 TS/runtime risk parçaları |
| **R12.7** | 5 calculator engine | ✅ Canlı |
| **N2** | PDF export (lazy jspdf) | ✅ Canlı |
| **R12.10** | assistantEngine + knowledgeBase | ✅ Kod; ChatWidget QA Edge kısmi |
| **R12.5** | Premium home + logo SVG | ✅ Canlı |
| **R6** | Bundle budget fix | ✅ **Prod doğrulandı** |

### Açık maddeler

| ID | Madde | Öncelik |
|---|---|---|
| **R13.4** | Pantsir tek panel UI | 🔴 Sırada (plan hazır) |
| **R13.2** | Yakın POI gerçek API | 🔴 Sırada |
| **R13.1** | Konum bildirim (geofence + push) | 🔴 Vizyon kalbi |
| **R13.3** | Sosyo-ekonomik ETL (TÜİK/MEB) | 🟡 |
| **R13.5** | Mobile geofence | 🟡 |
| **TS → 0 + v0.12.8** | Release baseline | 🔴 Bloklayıcı |
| **KYC** | 1 prod user verify SQL | 🔴 Release-blocker |
| **K-M6** | Mobile 4 auth-bound ekran | 🟡 |
| **Edge** | `pvgis_solar`, `post_chat_message`, `tcmb_yiufe` | 🟡 |
| **N6** | ChatWidget hibrit UX | 🟡 Master karar |
| **R12.13** | Multilang tam sürüm | 🟢 Ayrı sprint |
| **Resmi** | Banka + Avukat + Şirket | 🟠 Master kararı |

---

## C) ÖNCELİK MATRİSİ (Cursor önerisi — sahiplenerek)

### 🔴 BU HAFTA (kritik)

| # | İş | Süre | Neden |
|---|---|---:|---|
| 1 | **TS Sprint 2 bitir → 0 hata → v0.12.8 tag** | 2–4s | Release disiplini; yeni feature güvenliği |
| 2 | **R13.4 Pantsir UI mock** (Feature-Visible-First) | ~1 gün | Master/yatırımcı görsel; plan hazır |
| 3 | **KYC 1 user verify + browser test** | 15–30 dk | Teklif gate açılır |
| 4 | **R13.2 POI** (OSM hybrid MVP) | ~8s | Gerçek veri kazanımı, düşük maliyet |

### 🟡 BU AY (önemli)

| # | İş | Süre |
|---|---|---:|
| 5 | **R13.1 Konum bildirim** (web geofence + push) | ~10s |
| 6 | **R13.3 Sosyo ETL** (TÜİK ücretsiz → Endeksa karar) | ~12s |
| 7 | **K-M6 mobile** (favorites ile başla) | ~11–16s |
| 8 | **Edge kalan 3** (`pvgis`, `post_chat_message`, `tcmb_yiufe`) | ~3s |
| 9 | **ChatWidget hibrit** | ~4s |

### 🟢 İLERLEYEN (planlı)

| # | İş |
|---|---|
| 10 | R13.5 Mobile geofence |
| 11 | R12.13 Multilang |
| 12 | Premium home code-split (N3 — düşük öncelik) |
| 13 | Banka + Avukat + Şirket (master resmi) |
| 14 | PSP / gerçek escrow (ürün + hukuk) |

**Sıralama kararı (Master onayı):**

- **Seçenek A (önerilen):** TS 0 → v0.12.8 → R13.4 mock → R13.2 POI → R13.1 geofence → R13.3 ETL → R13.5 mobile
- **Seçenek B (retention-first):** R13.1 geofence önce — görünürlük gecikir
- **Seçenek C (data-first):** R13.3 ETL önce — UI geç kalır

---

## D) STRATEJİK ÖNERİLER

### 1. Vizyon — Pantsir

**Hedef:** Konum bazlı tam donanımlı emlak istihbarat — bildirim + yakın kurum + suç/eğitim/sosyo skorları **tek panelde**.

**Bugün:** Altyapı güçlü (R12 deprem/harita/modül), mock iskelet var (AI rapor sekmesi), **Pantsir paneli henüz yok**.

**Fark:** Deprem + 32 modül + borsa — rakip setinde nadir; Pantsir tamamlanınca konum istihbaratında net ayrışma.

### 2. Maliyet ([`R13_PANTSIR_PLAN.md`](./R13_PANTSIR_PLAN.md))

| Kalem | Aylık (10K MAU) |
|---|---:|
| Google Places | ~$850 |
| Endeksa SES (EGM boşluğu) | ~$500 |
| TÜİK / MEB | ₺0 |
| **Toplam (premium)** | **~$1.350/ay** |

**Master kararı gerekli:**

- **Premium tier** (Places + Endeksa) vs **ücretsiz aggregate** (OSM + TÜİK + proxy suç)
- Hibrit: OSM dev/staging, Google prod

### 3. Mühendislik disiplini (10-komut zincirinden dersler)

1. **Fresh `tsc` zorunlu** — incremental cache yanıltıcı (29 Mayıs dersi)
2. **HTTP 200 ≠ JS sağlam** — Playwright smoke ekle
3. **Atomik commit + audit** — her paket sonrası `_audit/` güncelle
4. **v0.12.x tag = TS 0 + endpoint sweep OK** — tag erken atma
5. **Dürüst durum raporu** — plan ≠ deploy ayrımı net
6. **Cursor + Claude Code çapraz doğrulama** — çakışma sıfır (`_audit/` vs `src/`)

---

## E) EYLEM LİSTESİ (Master)

### Yarın sabah (15 dk kontrol listesi)

| # | Kontrol | Beklenen | Sweep |
|---|---|---|---|
| 1 | Fresh `npx tsc -p tsconfig.app.json --noEmit` | 0 hata | ❌ **27** |
| 2 | `git tag -l v0.12.8` | Tag var | ❌ Yok |
| 3 | Prod bundle hash | Split chunk | ✅ `BH3oeyCz` |
| 4 | `/ilan/prop-001` Pantsir panel | Görünür | ❌ Henüz yok |
| 5 | KYC SQL çalıştırıldı mı? | 1 user verified | ⏳ Master teyit |
| 6 | [`MASTER_YOL_HARITASI`](./MASTER_YOL_HARITASI_2026_05_30.md) | Bu dosya | ✅ |

### Bu hafta

1. TS 0 + **v0.12.8** tag push
2. **R13.4** Pantsir mock — 1 PR, canlı kanıt screenshot
3. **R13.2** POI MVP — OSM Overpass + Edge cache
4. KYC prod user verify + teklif akışı smoke
5. Master: **POI maliyet kararı** (Google vs OSM)

### Bu ay

1. R13 tam (5 paket, ~49s) — [`R13_PANTSIR_PLAN.md`](./R13_PANTSIR_PLAN.md)
2. K-M6 mobile (~16s)
3. Edge kalan + ChatWidget hibrit
4. Banka / avukat / şirket (paralel, master resmi)

---

## F) RİSK HARİTASI

### Yüksek risk

| Risk | Azaltma |
|---|---|
| **TS 27 hata + tag yok** | TS sprint bitir → v0.12.8 |
| **KYC release blocker** | [`KYC_VERIFY_TASLAK.md`](./KYC_VERIFY_TASLAK.md) SQL |
| **DNS apex / hosting** | Master sabah checklist |
| **Edge secrets eksik → 500** | Deploy öncesi Dashboard secrets |

### Orta risk

| Risk | Azaltma |
|---|---|
| Google Places maliyet aşımı | Cache + quota alarm |
| TÜİK CSV parse hataları | Stale fallback + kaynak etiketi |
| R13 scope creep | 5 paket sırasına bağlı kal |
| Mobile App Store süreci | R13.5 ayrı repo, erken plan |

### Düşük risk

| Risk | Not |
|---|---|
| Bundle budget | R6 sonrası %45 margin |
| Vercel rate limit | 73 path sweep OK |
| TS regression post-v0.12.8 | CI verify zorunlu |

---

## G) TEKNİK BORÇ SAATİ

| Kategori | Tahmini saat | Durum |
|---|---:|---|
| TS Sprint 2 bitir (27→0) | 2–4 | 🔴 Acil |
| R13 sprint tam (5 paket) | ~49 | Plan hazır |
| K-M6 mobile | ~16 | Plan hazır |
| Edge 3 kalan deploy | ~3 | Kısmi tamam |
| ChatWidget hibrit | ~4 | Plan hazır |
| Multilang R12.13 | ~8–16 | Skip edildi |
| TS maintenance | ~2/ay | Sürekli |
| **Toplam teknik borç (yakın vade)** | **~82–90s** | ~2 hafta yoğun |
| **Aylık maintenance** | **~6s** | |

---

## H) FİNAL ÖZET (1 paragraf — dürüst)

29 Mayıs sabah production krizi (i18n investor) **90 dakikada 5 hotfix ile çözüldü**; site HTTP 200, **0 rollback**. Gün boyunca TS sağlık sprint **131 → 27 hata** indirdi (henüz **0 değil**); R6 bundle fix prod'da **monolit 930 KB → split 300+445 KB** doğrulandı; R6 + Console main'e girdi. **10-komut audit zinciri** envanter, sweep, R13 plan ve master teslimat dosyalarını güncelledi. **R13 Pantsir vizyonu planlandı** — R13.4 UI ve R13.2 POI **henüz kodda/canlıda değil** (sweep teyit). Edge **kısmi** deploy (`ai_qa`, `earthquakes_latest`). **v0.12.8 tag bekliyor.** Sırada: TS 0 → tag → R13.4 görsel → R13.2 POI → R13.1 geofence → R13.3 ETL. Toplam teknik borç **~82–90 saat**. Master resmi işler (banka, avukat, şirket) paralel sürebilir.

---

## I) GÜNLÜK RUTİN (Master + ekip)

```
1. Sabah  → Bu dosyayı aç + KALAN_ISLER üst 3 madde
2. Sprint → Tek paket, atomik commit, tsc kontrol
3. Deploy → Bundle hash + 5 endpoint curl
4. Akşam  → Audit 1 satır güncelle (HEAD + bundle + tsc sayısı)
5. Disiplin → Plan ≠ deploy; sweep ile doğrula
```

### Audit dosya haritası (tek kaynak)

| Dosya | Ne zaman bak |
|---|---|
| **Bu dosya** | Her sabah |
| [`KALAN_ISLER.md`](./KALAN_ISLER.md) | Sprint öncesi/sonrası |
| [`FEATURE_INVENTORY.md`](./FEATURE_INVENTORY.md) | Özellik soruları |
| [`R13_PANTSIR_PLAN.md`](./R13_PANTSIR_PLAN.md) | R13 sprint |
| [`ENDPOINT_SWEEP.md`](./ENDPOINT_SWEEP.md) | Deploy sonrası |
| [`BUNDLE_FINAL.md`](./BUNDLE_FINAL.md) | Build/deploy |
| [`EDGE_FUNCTIONS_DEPLOY_STATUS.md`](./EDGE_FUNCTIONS_DEPLOY_STATUS.md) | Edge deploy |
| [`KYC_VERIFY_TASLAK.md`](./KYC_VERIFY_TASLAK.md) | KYC adımı |
| [`MASTER_TESLIMAT_2026_05_30.md`](./MASTER_TESLIMAT_2026_05_30.md) | Haftalık özet |

---

## J) 10-KOMUT ZİNCİRİ — KAPANIŞ TABLOSU

| Komut | İş | Durum |
|---:|---|---|
| 1 | TS Sprint 2 / v0.12.8 | 🟡 27 hata; tag yok |
| 2 | R6 + Console PR merge | ✅ |
| 3 | KYC verify | ⏳ SQL hazır |
| 4 | R13 plan | ✅ |
| 5 | FEATURE_INVENTORY | ✅ |
| 6 | (paralel sprint) | — |
| 7 | (paralel sprint) | — |
| 8 | Deploy / Edge kısmi | 🟡 |
| 9 | Tam sweep + audit | ✅ `8482872` |
| **10** | **Master yol haritası** | ✅ **Bu dosya** |

---

## K) SON SÖZ

10-komut zinciri **audit ve operasyonel baseline** açısından **başarıyla tamamlandı**. ihaleal **~78 canlı özellik**, **sağlam HTTP/RLS/bundle** ile R12'yi operasyonel olarak taşıyor. **Pantsir vizyonu net, plan yazılı, implementasyon sıradaki sprint.** Mühendislik standardı: dürüst tanı, atomik fix, sweep kanıtı, audit kayıt — **29 Mayıs krizinden çıkan en değerli süreç bu.**

**Sonraki tek bloklayıcı:** TS **27 → 0** → **v0.12.8** → **R13.4 mock UI**.

---

*Son commit (bu dosya): docs(audit) — 10-komut zinciri komut 10*
