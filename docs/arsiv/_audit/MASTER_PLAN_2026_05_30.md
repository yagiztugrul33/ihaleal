# 🏛️ ihaleal — TEK KAPSAMLI MASTER PLAN

**Tarih:** 2026-05-30 · **Baş mimar:** Web Claude
**Durum:** Lansman çekirdeği KANITLI tamam · İkinci dalga kurgulu · Yasal cephe Master'da
**Kaynak:** N1-N26 + pentest + E2E + tüm apply/seed/deploy raporları (hepsi kanıtlı)
**Tag çıpa:** `v1.0.0-rc1` (HEAD `e87e001`) · `safe-after-v0.13.0` · `safe-2026-05-30-night`

---

## 0) NEREDEYIZ — KANITLI GERÇEK DURUM (uydurma değil, test edilmiş)

### ✅ ÇEKİRDEK CANLI + KANITLI
| Alan | Kanıt |
|---|---|
| **Funnel 1-6/6** | E2E PASS: signup→RPC→verify→panel→proje→birim→lansman listing (id 46b15514)→/ilan badge→/proje public |
| **İlan yayını** | listings INSERT çalışıyor (42846 fix), trigger DELTA=1 |
| **Güvenlik** | RLS'siz tablo 0 · test:rls 8/8 · pentest 6/8 GÜVENLİ, **2 KISMİ kapatıldı** (sealed maskeleme VIEW + XSS audit 0 risk), 0 AÇIK |
| **Storage** | 3 bucket + 12 policy, private 401, anon yazma engelli |
| **Borsa** | price_index 121 satır (10 il × 12 ay), /borsa gerçek veri (mock bitti) |
| **Bildirim** | 4 trigger canlı (teklif/favori/mesaj/arama→notifications) |
| **6633 SEO URL** | sitemap-programmatic.xml |
| **Tüm N özellikleri** | rating, teklif/pazarlık (sealed maskeli), kayıtlı arama, doping, harita, geofence MVP, PDF, e-imza MVP, chat widget, presence |
| **Emniyet** | smoke 36/36 · smoke:r14 4/4 · safe tag'ler · rollback |

### 🟡 KISMİ (çalışıyor ama tam değil)
- **Borsa verisi:** placeholder `source='platform'` (TCMB EVDS 302 auth — gerçek veri Master API key bekler)
- **Geofence:** web/PWA MVP (native arka plan değil)
- **E-imza:** görsel imza + hash (yasal nitelikli değil — avukat)
- **ai_qa chat:** widget hazır, OpenAI billing bekler (kota bitik)
- **INTERNAL_CRON_SECRET:** kod kullanıyor, Master Dashboard set bekler (Functions → borsa_etl → Settings → Env Vars)

### ❌ YOK (lansman bloklayıcı — kod DEĞİL)
- **Escrow/ödeme** (Iyzico — Master onayı + entegrasyon)
- **EİDS** (yasal zorunlu — Master + hukuki)
- **Pantsir R13.3/R13.5** (sosyo veri + native mobil)

---

## 1) LANSMAN GO/NO-GO

| Lansman türü | Karar | Gerekçe |
|---|---|---|
| **Soft/demo vitrin** | ✅ **GO** | Funnel + güvenlik + borsa + tüm özellikler canlı/kanıtlı; pentest 0 açık |
| **Tam ticari** | 🔴 **NO-GO** | Escrow + EİDS + avukat + OpenAI billing + TCMB gerçek veri eksik |

**Tam ticari lansman için kalan 5 blok (öncelik):**
1. 🔴 **Iyzico escrow** (para akışı — Master onay + Claude Code entegrasyon)
2. 🔴 **EİDS** (yasal ilan zorunluluğu — Master + hukuki)
3. 🔴 **Avukat** (ihale hukuku + sözleşme + para yapısı)
4. 🟡 **OpenAI billing** (ai_qa — Master, ~$10)
5. ✅ **Pentest 2 KISMİ fix** kapatıldı (sealed maskeleme VIEW + XSS audit)

---

## 2) İCRA SIRASI — 3 FAZ

### 🔵 FAZ 1 — LANSMAN ÇEKİRDEĞİ TAMAMLAMA (şimdi → v1.0.0)
Kod %95 hazır. Kalan:

**Kod (Cursor/Claude Code — küçük):**
- ✅ Pentest 2 KISMİ fix: sealed maskeleme VIEW + XSS audit (Claude bu turda kapattı)
- 🟡 INTERNAL_CRON_SECRET set sonrası borsa_etl cron doğrula (Master Dashboard sonrası Claude)
- 🟡 Commitlenmemiş N12_N18_RAPOR.md push (Cursor karar verir)

**Master (kod DEĞİL — paralel, lansman bloklayıcı):**
- **Iyzico merchant başvurusu** (HEMEN — haftalar sürer)
- **Avukat** (ihale hukuku + sözleşme + ortak alım + e-imza yasal)
- **EİDS** entegrasyon kararı/başvuru
- **OpenAI billing** (~$10 — ai_qa açılır)
- **Şirket + KVKK/VERBİS + aydınlatma metni**
- **TCMB EVDS API key** (borsa gerçek veri)
- **Uptime monitor** (~30 dk)
- **INTERNAL_CRON_SECRET env** (Dashboard set, ~2 dk)

**→ Iyzico onayı gelince:** Claude Code escrow entegrasyonu (ödeme + teminat + komisyon split) → **v1.0.0 TAM TİCARİ LANSMAN**

### 🟢 FAZ 2 — İKİNCİ DALGA: ZEKA + GÖRSEL (lansman sonrası 30-60 gün)
İhaleal'i "zeka platformu" yapan + görsel sıçrama:

**T1 — Kolay + borsa hazır (önce):**
- N27 ROI/Kira getirisi hesaplayıcı
- N28 Fiyat düşüş bildirimi
- N29 İhale takvimi + hatırlatıcı
- N30 Aylık endeks raporu PDF
- N31 Lansman ön talep

**N43 — Cinematic redesign (görsel sıçrama):**
- Active Theory esini: koyu cinematic tema + terminal-AI hero ("Ne arıyorsunuz?")
- WebGL DEĞİL (performans), CSS/canvas + framer-motion
- bundle <800KB, mobil 60fps

**T2 — AI farklılaştırıcı (OpenAI billing sonrası):**
- N32 İhale Başarı Tahmini (EŞSİZ)
- N33 Fırsat Radar (piyasa-altı ilan)
- N34 Endeks Portföyü
- N35 KKA Senaryo Motoru
- N36 Yatırım Danışmanı AI

### 🟣 FAZ 3 — BÜYÜME + ORTAK ALIM (60-90 gün)
- N41-N42 **Ortak satın alma** (max 5 kişi — avukat + Iyzico bağlı)
- T3: N37 WhatsApp bot · N38 referans · N39 haftalık özet
- Pantsir R13.3 (sosyo veri) + R13.5 (native)
- TCMB EVDS gerçek entegrasyon

---

## 3) ÖZELLIK ENVANTERI — kanıtlı durum (tek bakış)

| # | Özellik | Durum |
|---|---|:-:|
| Funnel (kayıt→lansman) | ✅ E2E kanıtlı |
| İlan yayını + LANSMAN | ✅ |
| Müteahhit panel | ✅ |
| Storage (foto/tapu/ruhsat) | ✅ canlı |
| Borsa (endeks/trend/harita) | ✅ (veri placeholder) |
| Rating/yorum | ✅ |
| Teklif/pazarlık + kapalı teklif | ✅ + sealed maskeleme |
| Favori + kayıtlı arama + alarm | ✅ |
| Bildirim (4 trigger) | ✅ |
| Doping/öne çıkarma | ✅ |
| Harita (Leaflet) | ✅ |
| Geofence (mahalleden geçince) | 🟡 MVP web/PWA |
| PDF indirme | ✅ |
| E-imza | 🟡 MVP (yasal değil) |
| AI chat widget | 🟡 (billing bekler) |
| Canlı kullanıcı sayacı | ✅ |
| 6633 SEO sayfa | ✅ |
| Rehber sistemi | ✅ |
| Güvenlik (RLS+pentest) | ✅ 0 açık |
| **Escrow/ödeme** | ❌ Iyzico |
| **EİDS** | ❌ yasal |

---

## 4) BAŞ MİMAR ÖNERİSİ — net yol

**ŞİMDİ:** Lansman çekirdeği kanıtlı tamam. **Daha fazla özellik EKLEME** (scope creep) — vizyon zaten 40+ görev kurgulu (N27-N43 + ortak alım).

**Sıra:**
1. **Master yasal cepheyi başlat** (Iyzico + avukat + EİDS + billing) — bunlar haftalar sürer, ŞİMDİ başlamalı
2. ✅ **Pentest 2 KISMİ fix** kapatıldı (sealed maskeleme + XSS audit)
3. **Soft lansman / demo** yapılabilir (GO) — gerçek kullanıcı + geri bildirim
4. **Iyzico onayı gelince** → escrow → **v1.0.0 tam ticari**
5. **Sonra FAZ 2** (T1 + cinematic redesign + T2 AI) — ihaleal'i kategorisinde tek yapar

**Tek cümle:** Kod savaşı kazanıldı (funnel+güvenlik+borsa+20 özellik canlı, kanıtlı). Kalan savaş **yasal + ödeme** (Master cephesi) ve **ikinci dalga** (zaten kurgulu). Artık eklemek değil, **Master'ın yasal adımları + sıralı icra** zamanı.

---

## 5) SOFT LANSMAN HİJYEN — bu gece kapanış (Claude turu)

| Adım | Durum |
|---|:-:|
| Test/seed org kalıntı temizliği (11 → silindi, 4 gerçek kaldı) | ✅ |
| Sealed maskeleme VIEW migration + apply + canlı test (seller amount=null) | ✅ |
| XSS audit (`_audit/XSS_AUDIT.md` — 0 risk) | ✅ |
| RLS'siz public tablo 0 + test:rls 8/8 | ✅ |
| v1.0.0-rc1 tag (HEAD `e87e001`) + push | ✅ |
| MASTER_PLAN dosya (`_audit/MASTER_PLAN_2026_05_30.md`) | ✅ (bu dosya) |
| ROLLBACK.md güncel | ✅ (`safe-after-v0.13.0` çıpası) |

**Master için kalan TEK 2 dk işi:** Supabase Dashboard → Functions → borsa_etl → Settings → Env Vars → `INTERNAL_CRON_SECRET = <random secret>` ekle. Bu eklenmeden cron tetikleyici anon'a açık kalır (zarar düşük çünkü idempotent upsert, ama hijyen meselesi).

---

**Sonuç:** ihaleal, "%70 kabuk"tan (gün başı) "kanıtlı çalışan çekirdek + kurgulu zeka vizyonu"na (gün sonu) geldi. Funnel E2E, pentest 0-açık, borsa canlı, 20+ özellik kanıtlı. Soft lansman GO. Tam ticari için Master'ın 4 yasal/ödeme bloğu + 1 küçük secret env kaldı. İkinci dalga (40+ görev) kurgulu, sıralı, hazır. Plan net: yasal cepheyi başlat → soft lansman → escrow → v1.0.0 → zeka dalgası.
