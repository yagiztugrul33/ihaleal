# ihaleal.com — Neredeydik?

Bu doküman, yazılımı bilmediğin için sana hatırlatma olarak hazırlandı.
Yarın, gelecek hafta veya 1 ay sonra döndüğünde **buradan başla**.

## Şu An Durum

- **Canlı site:** https://ihaleal.vercel.app
- **Repo:** https://github.com/yagiztugrul33/ihaleal
- **Deploy:** `git push` → GitHub; üretim için güvenilir yol: `npm run build` + Vercel prebuilt (`docs/DEPLOYMENT_FINAL.md`)
- **Son canlı audit:** `_audit/final/01_canli.md` (Playwright, 29 route)

## Çalışan Modüller

### 1. Emlak pazaryeri (luxury auction teması)

- Ana sayfa (`/`), ilanlar, ihaleler, harita, karşılaştırma, favoriler, değerleme
- Üye ol / giriş / demo ilan akışları (demo modunda)

### 2. Kurumsal (RE/MAX hedefli)

- `/kurumsal` — Özellikler ve planlar
- `/kurumsal/iletisim` — Demo talep formu (Supabase)
- `/kurumsal/dashboard` — Org paneli iskeleti (giriş gerekir)

### 3. Intelligence (yatırım analizi)

- `/arastirma` — Hub
- `/arastirma/war-room` — Komuta merkezi (işlevsel, görsel sade)
- `/arastirma/ges` — GES analizi (motor + UI)
- `/arastirma/parsel` — Parsel intelligence
- `/arastirma/yatirim` — **Hub'a yönlendirir** (ayrı terminal kaldırıldı)

### 4. Kat karşılığı

- `/kat-karsiligi`, `/kat-karsiligi/studio`

## Bilinen Eksikler

- War Room Palantir/Bloomberg seviyesinde görsel redesign yapılmadı
- Profesyonel PDF rapor motoru yok (markdown export var)
- PVGIS gerçek API key gerekli (demo/heuristic veri)
- AFAD/tapu gerçek API yok
- Demo seed verisi sınırlı; `/ilan/demo-1` örnek slug

## Murat Bey (RE/MAX Türkiye)

- **12 sayfalık pilot PDF:** Repoda yok; Claude sohbet ekinde veya yerel dosya olarak duruyor olabilir
- **Strateji:** 30 dk görüşme + 90 günlük zero-cost pilot (Ankara RE/MAX Boss ofisi)
- Hukuki çerçeve: `docs/hukuk/` — RE/MAX örnek PDF'yi `docs/hukuk/kaynak/` altında **yerel** tut (telif)

## Sonraki Adımlar (öncelik)

### Kısa vade (1–2 hafta)

1. Murat Bey'e PDF gönder **veya** Intelligence modülünü zenginleştir (karar senin)
2. Demo seed: 50–100 gerçekçi ilan
3. Mobil responsive son tur testi

### Orta vade (1–2 ay)

1. War Room görsel redesign (freelance designer)
2. PDF rapor motoru (Puppeteer / ReportLab)
3. PVGIS production API
4. Supabase Edge Function'ları production deploy

### Uzun vade (3–6 ay)

1. Pilot sonuçlarına göre ürün-pazar uyumu
2. Gelir modeli (komisyon / abonelik) veya yatırım
3. PWA → gerekirse native mobil

## Önemli Hatırlatmalar

- **Vercel:** Trial biterse Hobby (ücretsiz) plana geçer
- **Supabase:** Ücretsiz tier şu an yeterli
- **Domain:** `ihaleal.com` — Vercel'de custom domain + DNS
- **Token:** Vercel token GitHub Secrets'ta (otomatik deploy)

## Acil sorun

1. Site açılmıyor → https://vercel.com/dashboard
2. Deploy fail → GitHub Actions / `npm run build` log
3. Yeni özellik → Cursor komutu
4. Karmaşık bug → Freelancer (20–50K TL bütçe aralığı örnek)

---

*Son güncelleme: 2026-05-17 — `_audit/final/01_canli.md` ile birlikte üretildi.*