# Senkron durumu (tek kaynak — Cursor günceller)

**Kural:** Bu dosyayı Kimi oturumu açmadan önce kullanıcı **tek parça** Kimi’ye yapıştırır. Cursor her doğrulama turundan sonra burayı günceller.

```yaml
state_version: 1
updated_utc: "2026-04-29T12:00:00Z"
phase: "MVP-front-admin"
last_git_sha_short: "(commit sonrası)"
last_processed_kimi_file: "kimi-20260428-k51-k53.md"
blockers:
  - "B2: K51/K53 tam gövde — inbox'ta metin eksik (Kimi)"
next_kimi_tasks:
  - "K51 tam gövde (800-1200 kelime) inbox veya docs/icerik"
  - "K53 sözlük 20+ satır"
next_cursor_tasks:
  - "Supabase SQL: manual_push_v2→v3→v4 sırası + Replication auctions"
  - "İsteğe bağlı: TRY→₺ son sayfalar (X24)"
```

## Ürün kapısı (hepsi true olunca “tur kapalı”)

- [x] `npm run typecheck` yeşil
- [x] `npm run build` yeşil
- [x] `npm run test:run` yeşil
- [x] `src/lib/fees.ts` mevcut ve import kırığı yok
- [x] SellerHub / DataStrategy / userFlows rotaları ve dosyaları mevcut
- [ ] İlan kartı + detay + form belge hikâyesi regresyon yok (smoke — manuel)

## Kimi son tur özeti (Kimi doldurmaz; Cursor veya kullanıcı özet yapıştırır)

**2026-04-28:** `inbox/kimi-20260428-k51-k53.md` oluşturuldu; §6 YAML + 20 madde + KIMI_SIGNOFF mevcut. K51/K53 **gövde metni** kullanıcı iletiminde eksik — `docs/icerik/faz2-kimi/kimi-20260428-k51-k53-teslim.md` arşiv kopyası; blocker B2.

**2026-04-28 (kontrol turu):** `kimi-20260428-k51-k53.md` tekrar okundu; `### K51` / `### K53` gövdesi yok — `K51-yetki-ozeti.md` / `K53-form-hata-sozlugu.md` oluşturulmadı (komut: yoksa değişiklik yok). B2 açık kaldı. npm üçlüsü yeşil.

**2026-04-28 (self-check güncellemesi):** Kullanıcı/Kimi §5.3 maddeleri güncelledi (inbox dosyası yazıldı). Gövde metin hâlâ yok; B2 devam. `SONRAKI_ADIM_KOMUTLARI.txt` Kimi talimatı sıkılaştırıldı.

**2026-04-28 (böl komutu — tekrar):** `kimi-20260428-k51-k53.md` okundu; `### K51` / `### K53` altında gerçek gövde yok (YAML + self-check + SIGNOFF). `K51-yetki-ozeti.md` / `K53-form-hata-sozlugu.md` oluşturulmadı; B2 açık. npm üçlüsü yeşil.
