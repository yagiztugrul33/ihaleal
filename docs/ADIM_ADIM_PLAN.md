# ihaleal.com — adım adım geliştirme planı

Bu dosya, projedeki **en büyük / en zahmetli** işleri sırayla ve bağımlılıklarıyla listeler.  
“Kim” (Task alt ajan) ara sıra zaman aşımına düşebilir; o durumda aynı maddeyi bu repoda tekrar çalıştırın veya Cursor’da yeni bir sohbet turu açın.

---

## Durum özeti (şu an)

| Alan | Durum |
|------|--------|
| Vite + React + TS | Çalışıyor |
| `npm run verify` (typecheck + test + build) | Kullanılmalı |
| `npm run backup` | Masaüstü `ihaleal-backups/` |
| Supabase istemci + Auth (giriş/kayıt/profil) | Ortam doluysa aktif |
| Uzak DB şeması (`db push`) | **Sizde:** `supabase login` → `npm run supabase:link` → `npm run supabase:push` |
| İlan/ihale verisi | Hâlâ **localStorage** (`auctionsSource`, `CreateAuction`, …) |
| Edge `place_bid` | Şablon var; secrets + deploy sizde |

---

## Faz 0 — Güvence (her turda 5 dk)

1. `npm run backup`  
2. `npm run verify`  
3. Git: `git status` — `.env.local` ve anahtar dosyaları stage’lenmemiş olmalı.

---

## Faz 1 — Bulut şema (blokör; ~30 dk + bekleme)

**En kritik tek adım:** migrasyonların uzak Supabase’e uygulanması.

```bash
cd ihaleal.com
npx supabase login
npm run supabase:link
npm run supabase:push
```

Sonra Dashboard’da tablolar: `profiles`, `listings`, `auctions`, `bids`, `payments`, `documents`.

---

## Faz 2 — Profil ve `user_flows` (orta; 1–2 gün)

- `auth.users` → `profiles` tetikleyici migrasyonda var.  
- Uygulama: `userFlows` okuma/yazmayı önce **Supabase `profiles.user_flows`** ile senkron; yoksa localStorage fallback.  
- Dosyalar: `src/lib/userFlows.ts`, `Navbar.tsx`, onboarding sayfaları.

---

## Faz 3 — İlan + ihale veri katmanı (en zor; çok günlük)

**Durum (kısmi):** `loadAllAuctionsForSearch()` uzak `auctions`+`listings` okuyup demo/yerel ile birleştirir; `listings.body` içinde JSON ile alan zenginleştirmesi mümkün. Yazma hâlâ ağırlıkla localStorage (`CreateAuction`).

**Hedef:** `listings` / `auctions` tek kaynak; localStorage yedek veya kaldırılır.

1. **Tip ve mapper:** DB satırı → mevcut UI “auction” modeli (`src/lib/auctionsSource.ts` + tüketen sayfalar).  
2. **Okuma:** Anasayfa / liste / detay → `supabase.from('auctions').select(...)` + join `listings`.  
3. **Yazma:** `CreateAuction` → insert `listings` + `auctions` (RLS: yalnızca `owner_id = auth.uid()`).  
4. **Geçiş:** İsteğe bağlı bir kerelik localStorage → DB import script’i (sadece demo verisi için).

Etkilenen örnek dosyalar: `CreateAuction.tsx`, `AuctionDetail` (glob ile bulunur), `Hero` / ihale listeleri, `src/lib/auctionsSource.ts`.

---

## Faz 4 — Teklifler ve `place_bid` RPC (zor; 2–4 gün)

- DB’de `place_bid` migrasyonu var.  
- İstemci: teklif göndermeden önce Edge veya doğrudan `rpc('place_bid', …)` (RLS + idempotency).  
- Edge: secrets (`SUPABASE_URL`, `SUPABASE_ANON_KEY`); deploy `supabase functions deploy place_bid`.  
- UI: teklif formu, hata mesajları, yükleme durumu.

---

## Faz 5 — Realtime (orta)

- Canlı ihale: `auctions` / `bids` için `supabase.channel(...).on('postgres_changes', …)`.  
- Oturum düşürme ve yeniden bağlanma (tab görünürlüğü).

---

## Faz 6 — Belgeler ve Storage (orta)

- `documents` tablosu + Supabase Storage bucket; yükleme RLS.  
- Profil / ihale eki akışları.

---

## Faz 7 — Ödeme / escrow (uzun; ürün + hukuk)

- `payments` + gerçek ödeme sağlayıcısı tasarımı; şimdilik yalnızca şema ve demo durumları.

---

## Faz 8 — Kalite (sürekli)

- Vitest kapsamı artırımı (auth, mapper, RLS davranışı mock ile).  
- İsteğe bağlı Playwright E2E.  
- Performans: büyük sayfalarda `React.lazy` denetimi, bundle analizi.

---

## Paralel “kim” (Task) kullanımı

Aynı turda şu prompt örneğiyle alt ajan açılabilir:

> `ihaleal.com` içinde `localStorage` kullanan tüm dosyaları listele; `listings`/`auctions` şemasıyla eşleştir; Faz 3 için dosya başına 1 cümle görev yaz.

Zaman aşımı olursa planı bu `docs/ADIM_ADIM_PLAN.md` üzerinden manuel sürdürün.

---

## Sıradaki tek komut (şimdi)

```bash
npm run verify
```

Bulut şema henüz yoksa Faz 3–4 kodu **feature flag** veya “yalnızca `db push` sonrası aktif” ile bağlanmalı; aksi halde üretim öncesi boş tablo hataları artar.
