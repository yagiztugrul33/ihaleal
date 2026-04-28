# Kalan iş — faz planı ve “kendine komut” listesi

Soru sormadan yürütülecek sıra. Her faz bitince bir altına **tarih + commit** yazın.

## Faz 1 — Sağlık kontrolü (her gün / her PR öncesi)

```bat
cd /d C:\Users\yagiz\Desktop\ihaleal.com
call CALISTIR_KALAN_KONTROL.bat
```

Beklenen: `typecheck` + `test:run` + `build` yeşil.

## Faz 2 — Kimi / Cloud çıktısını repoya alma

Önkoşul: `docs\kimi-import\` altında `gorev*.md|json` dosyaları (zip’ten çıkarılmış).

```bat
cd /d C:\Users\yagiz\Desktop\ihaleal.com
dir docs\kimi-import
git add docs\kimi-import
git status
git commit -m "content: kimi gorev ciktilari import"
git push
```

Yoksa: Cloud’a `docs/CLOUD_KIMI_SYNC_KOMUTU.txt` (varsa) veya kullanıcı talimatıyla zip indirme.

## Faz 3 — İçeriği uygulamaya bağlama (kod)

- `docs/kimi-import/` veya `kimi-mega-pack` JSON’larını `src/data/` altında tip güvenli okuyucu ile bağla (Cursor görevi).
- Demo ihale listesi tek kaynak olsun: ya JSON import ya mevcut seed; çift kaynak kaldır.

## Faz 4 — Supabase prod tamamlama

```bat
cd /d C:\Users\yagiz\Desktop\ihaleal.com
REM .env.local dolu olmalı
npm run sql:bundle
REM Dashboard SQL veya: (PAT varsa) npx supabase db push
```

- `supabase functions deploy place_bid` (hesapta CLI login sonrası).

## Faz 5 — Ödeme ve bildirim

- iyzico / ödeme sağlayıcı teknik doküman + sandbox anahtar.
- E-posta gönderimi: `gorev5_eposta.md` şablonlarını transactional HTML’e çevir (backend).

## Faz 6 — Canlı öncesi hukuk ve içerik dondurma

- Sözleşme / KVKK / komisyon metinlerinde avukat onayı tarihi.
- “Demo” etiketi kaldırılacak sayfaların listesi.

---

## Cursor kendine komut (tek blok, kopyala)

```
Hedef: ihaleal.com kökünde CALISTIR_KALAN_KONTROL.bat çalışsın; ardından docs/PROJE_ILERLEME_YUZDE.md ve docs/KALAN_IS_PLANI_VE_KOMUTLAR.md güncel kalsın.
1) cd C:\Users\yagiz\Desktop\ihaleal.com
2) npm ci veya npm install
3) npm run verify
4) docs\kimi-import varsa içerik sayısını doğrula; yoksa README’de “bekliyor” yaz
5) git add -A && git commit -m "chore: verify + ilerleme doc" && git push
```
