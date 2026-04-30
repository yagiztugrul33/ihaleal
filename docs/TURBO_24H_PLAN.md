# 24 saatlik patron direktifi — ihaleal.com

Bu dosya **tek kaynak**. Cursor’a ve Kimi’ye **farklı paragrafları** yapıştır; aynı bloğu ikisine verme.

---

## Tek doğruluk (ikisi de uyacak)

- İş modeli rakamları ve komisyon: **`src/lib/fees.ts`** — işlem komisyonu **satıcıdan %4 + KDV**; ortak emlakçı **B2B %2 + KDV**; alıcıdan işlem üzerinden komisyon **yok** (yıllık üyelik ayrı); mahsup üretim kuralına göre.
- Mimari / güvenlik sınırları: **`docs/ARCHITECTURE.md`**, **`docs/SECURITY_MODEL.md`**.
- Yayın öncesi teknik liste: **`docs/LAUNCH_CHECKLIST.md`** (A grubu = kod/deploy/env).

---

## BLOK A — Yalnız Cursor’a yapıştır (patron: repo + mimari + güvenlik)

```
Sen bu repoda PATRON’sun. 24 saat içinde şunları bitir veya net teknik borç kalemi olarak dokümante et:

1) LAUNCH_CHECKLIST.md “A) Teknik teslim” maddelerini tek tek ele al: verify (typecheck+test+build), .env.local şeması, Supabase precheck (jwt_role_service=service_role olana kadar anahtar/satır biçimini doğrula), uzak DB’de manual_push sırası.

2) Mimari: ARCHITECTURE.md ile kod yapısı uyumlu mu kontrol et; eksikse tek dosyada net diff öner (gereksiz refactor yok).

3) Güvenlik: SECURITY_MODEL.md’ye aykırı iddia eden UI metinlerini (PCI/abartılı güvenlik) temizle; service role asla VITE_* olmasın.

4) fees.ts ile çelişen UI/rota metinlerini düzelt (satıcı %4 işlem komisyonu + KDV; ortak B2B %2 + KDV; alıcı işlem komisyonu yok).

5) Kimi’nin işi: içerik dosyalarına dokunma (docs/kimi-mega-pack metin üretimi Kimi’de). Sen yalnızca kod ve teknik dokümana odaklan.

Bitiş tanımı: npm run verify yeşil; mümkünse npm run precheck:supabase’te service JWT okunuyor ve tablo HTTP kodları makul; kritik engel varsa LAUNCH_CHECKLIST veya bu dosyanın sonuna kullanıcı için tek paragraflık not düş (yeni dosya açma zorunluluğu yok).
```

---

## BLOK B — Yalnız Kimi’ye yapıştır (içerik; terminal yok)

```
Sen içerik ajansısın; repo komutu çalıştırmıyorsun. Tek kaynak: src/lib/fees.ts ve docs/KIMI_SYNC_TASKS.md.

Görev: KIMI_SYNC_TASKS.md maddelerini sırayla uygula — işlem komisyonu satıcıdan %4 + KDV; alıcıdan işlem üzerinden komisyon yok; ortak emlakçı B2B %2 + KDV; mahsup satıcı tarafı. Çıktıları kullanıcının belirttiği formatta teslim et.

Cursor’un işi: kod ve deploy. Sen kod dosyası değiştirmezsin; yalnız metin/JSON/script teslimi yaparsın. Tekrar etme: mimari, npm, Supabase anahtarı Cursor’da.
```

---

## Çift iş yok — özet tablo

| Konu | Cursor | Kimi |
|------|--------|------|
| TypeScript, build, test, env, SQL, Vercel | Evet | Hayır |
| fees.ts veya React kodu | Cursor | Hayır |
| Mega paket metinleri, e-posta, SSS metni | Hayır | Evet |
| fees ile uyumlu ifade | İkisi de metinde uygun | Kimi üretir, Cursor kodda doğrular |

---

## Terminale tek satır (Cursor kullanıcısı — doğrulama)

Tam paket (verify + Supabase):

```powershell
cd "c:\Users\yagiz\Desktop\ihaleal.com"; npm run verify; npm run precheck:supabase
```

Hızlı (test atlamadan):

```powershell
cd "c:\Users\yagiz\Desktop\ihaleal.com"; npm run typecheck; npm run build; node scripts/precheck-supabase.mjs
```

---

## Kimi panoya görev (isteğe bağlı)

```powershell
Get-Content "c:\Users\yagiz\Desktop\ihaleal.com\docs\KIMI_SYNC_TASKS.md" -Raw | Set-Clipboard; Write-Host "KIMI_SYNC_TASKS panoda."
```

---

## İlgili dokümanlar

- [Kimi içerik senkron](KIMI_SYNC_TASKS.md)
- [Mimari](ARCHITECTURE.md)
- [Güvenlik modeli](SECURITY_MODEL.md)
- [Yayına hazırlık](LAUNCH_CHECKLIST.md)

---

## BLOK A — oturum notu (env / Supabase — kullanıcı)

Son `npm run precheck:supabase` çıktısında `jwt_role_service=(okunamadi)` görülürse Dashboard **service_role** secret’ını tek satır yeniden yapıştırın; `403`/`500`/`404` tablo kodları uzak şemaya bağlıdır — `docs/SUPABASE_ADIM_ADIM.md`. `kimi_full_report_2026_04_29.md` repoda yoksa Kimi çıktısı henüz eklenmemiştir.
