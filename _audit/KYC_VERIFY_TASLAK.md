# KYC Manuel Verify Hazırlık — Master SQL Taslak

**Tarih:** 2026-05-30 (R12 FINAL refresh)  
**Referans HEAD:** `6331110`  
**Kaynak:** DEV-FIZIBILITE — "4 user kyc=none, buy_now/bid bloklu (Sprint 3 guard)"

---

## 1. Şema özeti (migrations)

### `public.profiles.kyc_status`

**İlk şema** (`20260428120000_initial_schema.sql`):

```sql
kyc_status text not null default 'none'
  check (kyc_status in ('none','pending','verified','rejected'))
```

**Not:** `kyc_verified_at` sütunu **profiles'ta yok**. Zaman damgası için `updated_at` kullanılabilir veya migration ile sütun eklenir.

### Sunucu tarafı zorunlu KYC (Sprint 3)

`20260527120000_buy_now_kyc_guard.sql`:

- `register_bid_deposit` → `kyc_status <> 'verified'` ise `{ code: 'kyc_required' }`
- `execute_buy_now` → aynı guard

**İstemci:** `BuyNow.tsx`, `AuctionDetail.tsx` profil select ile yönlendirme (ikincil; RPC sert).

### İlgili tablolar

| Tablo | Amaç |
|---|---|
| `profiles` | `kyc_status` kaynağı |
| `kyc_verifications` | Org KYC başvuruları (`20260516120300_v2_kyc_moderation_bulk.sql`) — bireysel profil verify'den farklı |
| `listings` insert | `kyc_status = 'verified'` gerekir (satıcı) |

---

## 2. Prod kullanıcı listesi (kyc=none)

**Anon key ile SELECT yapılamaz** (RLS: kullanıcı yalnızca kendi profilini görür).

Master / ops **service role** veya Supabase Dashboard SQL Editor ile:

```sql
-- READ-ONLY envanter (service role / dashboard)
select
  p.id as user_id,
  p.email,
  p.full_name,
  p.kyc_status,
  p.e_devlet_status,
  p.created_at,
  p.updated_at
from public.profiles p
where p.kyc_status = 'none'
order by p.created_at desc
limit 20;
```

**4 user UUID:** Canlı DB'ye erişim olmadan bu turda listelenemedi. Master yukarıdaki sorguyu çalıştırıp UUID'leri doldurur.

---

## 3. Manuel verify SQL taslakları

### Tek kullanıcı (önerilen — master 1 user test)

```sql
-- ⚠️ SERVICE ROLE / Dashboard only — production dikkat
begin;

update public.profiles
set
  kyc_status = 'verified',
  updated_at = now()
where id = '<USER_UUID>'::uuid
  and kyc_status in ('none', 'pending', 'rejected');

-- Doğrulama
select id, email, full_name, kyc_status, updated_at
from public.profiles
where id = '<USER_UUID>'::uuid;

commit;
```

### Opsiyonel: audit izi (kyc_verifications stub)

Bireysel akışta tablo org odaklı; gerekirse:

```sql
-- Sadece moderasyon izi gerekiyorsa (org_id null ise atla)
insert into public.kyc_verifications (
  organization_id, submitted_by, status, documents, reviewed_at
) values (
  null,  -- org yoksa migration şemasına göre uyarla
  '<USER_UUID>'::uuid,
  'verified',
  '{"source":"manual_master_verify","note":"R12 kapanış test user"}'::jsonb,
  now()
);
```

**Not:** `kyc_verifications` şeması org-centric — master schema'yı Dashboard'dan doğrulamalı.

### Geri alma (rollback)

```sql
update public.profiles
set kyc_status = 'none', updated_at = now()
where id = '<USER_UUID>'::uuid;
```

---

## 4. Verify sonrası browser test akışı

1. **Login** — verify edilen kullanıcı ile web (`/#/giris` veya auth flow).
2. **Profil kontrol** — `kyc_status` UI'da "doğrulandı" veya eşdeğer badge (varsa).
3. **Bid test:**
   - Aktif demo/canlı ihale aç (`/#/ihale/<id>` veya auction detail).
   - Teklif ver → `register_bid_deposit` RPC → **kyc_required dönmemeli**.
4. **Buy Now test:**
   - Hemen Al akışı → `execute_buy_now` → başarı veya deposit/PSP blokajı (KYC dışı nedenler ayrı).
5. **Negatif kontrol:** `kyc=none` ikinci kullanıcı ile aynı adımlar → `kyc_required` toast/alert beklenir.

**Network kanıt:** Browser DevTools → Supabase RPC response `{ code: 'kyc_required' }` vs success.

---

## 5. Güvenlik notları

- Service role key **asla** istemci bundle'a (`VITE_*`) konmaz.
- Manuel verify **yalnızca test/staging** veya master onaylı prod pilot kullanıcı için.
- Prod'da gerçek KYC: `e_devlet_status`, belge yükleme, moderasyon kuyruğu (`kyc_verifications`) hedef akış.

---

## 6. Checklist (master)

- [ ] Service role ile 4 `kyc=none` user listele
- [ ] 1 pilot user seç → verify SQL çalıştır
- [ ] Bid + Buy Now smoke (web)
- [ ] Rollback SQL hazır tut
- [ ] (Opsiyonel) `kyc_verified_at` migration planla
