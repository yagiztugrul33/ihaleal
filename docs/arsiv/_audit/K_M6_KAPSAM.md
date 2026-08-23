# Mobile K-M6 Kapsam Doğrulama — Auth-Bound Ekranlar

**Tarih:** 2026-05-30 (R12 FINAL refresh)  
**Referans HEAD (web):** `6331110`  
**Repo:** `ihaleal-mobile` worktree (`C:\Users\yagiz\Documents\GitHub\ihaleal-mobile`)  
**Önkoşul:** K-M3 `ihaleler` → Supabase ✅; K-M5+ tarama: mesajlar/bildirimler/favoriler/belgeler **auth-bound**, anon SELECT uygun değil.

---

## 1. Mobil ekran envanteri (43 route `.tsx`)

Auth-guard (`_layout.tsx`): `profil`, `bildirimler`, `mesajlar`, `favoriler`, `belgeler`, …

**K-M6 hedef 4 ekran:**

| Ekran | Path | Data dosyası | Durum |
|---|---|---|---|
| Mesajlar | `mobile/src/app/mesajlar/index.tsx` | `mesajlar/data.ts` | MOCK (`MOCK_CONVERSATIONS`, 250ms delay) |
| Bildirimler | `mobile/src/app/bildirimler/index.tsx` | `bildirimler/data.ts` | MOCK |
| Favoriler | `mobile/src/app/favoriler/index.tsx` | `favoriler/data.ts` | MOCK (`DEMO_LISTINGS` slice) |
| Belgeler | `mobile/src/app/belgeler/index.tsx` | `belgeler/data.ts` | MOCK |

Her ekran: `FeedbackStateCard` + loading/error/empty pattern (K-M3 ile uyumlu refactor adayı).

---

## 2. Supabase tablo gereksinimi (web migrations — tablo VAR)

| Mobil ekran | Postgres tablo(lar) | Migration | RLS özeti |
|---|---|---|---|
| **Favoriler** | `watchlist` (+ `listings` join) | `20260516120200_v2_liquidity.sql` | `user_id = auth.uid()` ALL |
| **Bildirimler** | `notifications` | aynı | `select` owner; insert genelde server |
| **Belgeler** | `documents` | `20260428120000_initial_schema.sql` | `owner_id = auth.uid()` select/insert |
| **Mesajlar** | `chat_threads`, `chat_thread_participants`, `chat_messages` | `20260504140000_chat_messages_compliance_stub.sql` | participant-based select/insert |

**Yeni tablo gerekmez** — şema mevcut. Eksik olan: **mobil SELECT hook'ları + shape mapping**.

### Mesajlar — en karmaşık mapping

```
chat_thread_participants (profile_id = auth.uid())
  → chat_threads
  → chat_messages (son mesaj, unread count)
```

Stub RPC: `post_chat_message` (migration'da iskelet) — okuma için doğrudan SELECT yeterli MVP.

### Belgeler — storage

- `documents.file_path` → Supabase Storage bucket (bucket adı / policy ayrı doğrulama gerekir)
- MVP: metadata listesi SELECT; indirme signed URL

### Favoriler — en basit

```sql
select w.*, l.title, l.city, l.district, l.start_price_try
from watchlist w
join listings l on l.id = w.listing_id
where w.user_id = auth.uid();
```

---

## 3. RLS taslak (zaten migration'da — referans)

```sql
-- watchlist (mevcut)
using (user_id = auth.uid()) with check (user_id = auth.uid());

-- notifications (mevcut — select only)
using (user_id = auth.uid());

-- documents (mevcut)
using (owner_id = auth.uid());

-- chat_messages (mevcut — participant)
exists (
  select 1 from chat_thread_participants p
  where p.thread_id = chat_messages.thread_id
    and p.profile_id = auth.uid()
)
```

**Grant notu:** `20260528170000_grants_restore_systemic.sql` — `authenticated` için watchlist/notifications grant'ları tanımlı.

---

## 4. K-M6 sprint planı

### Öneri: **4 fazlı mini-sprint** (mega sprint değil)

| Faz | Ekran | Tablo | Zorluk | Tahmini efor |
|---|---|---|---:|---:|
| **K-M6.1** | Favoriler | `watchlist` + `listings` | 🟢 Düşük | 2–3 saat |
| **K-M6.2** | Bildirimler | `notifications` | 🟢 Düşük | 2–3 saat |
| **K-M6.3** | Belgeler | `documents` (+ storage?) | 🟡 Orta | 3–4 saat |
| **K-M6.4** | Mesajlar | threads + messages + participants | 🔴 Yüksek | 4–6 saat |

**Toplam:** ~**11–16 saat** (test + auth smoke dahil).

### Neden mega sprint değil?

- Mesajlar thread/participant join + unread logic ayrı pattern
- Belgeler storage signed URL ek risk
- Favoriler/bildirimler hızlı kazanım → master erken demo

### Ortak pattern (her faz)

1. `useXxxList.ts` hook (K-M3 `useAuctionList` kalıbı)
2. `data.ts` mock korunur veya `__DEV__` fallback
3. Auth session zorunlu (`getSupabaseClient()`)
4. RLS hata mesajı Türkçe
5. `tsc` + `expo export --platform web`

---

## 5. Bağımlılıklar / blokajlar

| Blokaj | Etki |
|---|---|
| Boş prod tablolar | UI empty state (beklenen) |
| Mesajlarda thread seed yok | Demo seed SQL veya ilk mesaj RPC |
| Storage bucket policy | Belgeler indirme bloklanabilir |
| `ihaleal` repo'da `mobile/` yok | Tüm iş **ihaleal-mobile** worktree |

---

## 6. K-M6 kabul kriterleri

- [ ] 4 ekran mock yerine authenticated Supabase SELECT
- [ ] Logout → auth guard, veri sızmaz
- [ ] Anon key ile başka user verisi gelmez (RLS smoke)
- [ ] Mock `data.ts` silinmez (fallback veya test fixture)
- [ ] K-M3/K-M5 dokunulmaz alanlar korunur

---

## 7. Sıra önerisi (master)

1. K-M6.1 Favoriler (watchlist — tablo + RLS hazır)
2. K-M6.2 Bildirimler
3. K-M6.3 Belgeler (+ storage doğrulama)
4. K-M6.4 Mesajlar (+ opsiyonel seed migration)
