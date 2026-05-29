# KYC Manuel Verify — Master Copy-Paste SQL (FINAL)

**Tarih:** 2026-05-29 ~15:30  
**Referans HEAD:** `665dd2c`  
**Ortam:** Supabase Dashboard → SQL Editor (**service role** oturumu veya Dashboard admin)  
**Kaynak:** Sprint 3 guard — `register_bid_deposit` / `execute_buy_now` → `kyc_required` when `profiles.kyc_status <> 'verified'`

---

## 1. Şema notları (migration uyumu)

| Alan | Durum |
|---|---|
| `profiles.kyc_status` | `none` \| `pending` \| `verified` \| `rejected` |
| `profiles.kyc_verified_at` | **YOK** — zaman için `updated_at` kullan |
| `profiles.kyc_verified_by` | **YOK** — audit için `audit_log.payload` |
| `audit_log` kolonları | `actor_id`, `action`, `entity_type`, `entity_id`, `payload` |

**Anon key ile SELECT yapılamaz** — 4 user UUID listesi service-role sorgu gerektirir.

---

## 2. Ön kontrol — kaç user `kyc=none`?

Dashboard SQL Editor'a yapıştır (READ-ONLY):

```sql
-- Envanter: kyc doğrulanmamış profiller
select
  p.id as user_id,
  p.email,
  p.full_name,
  p.kyc_status,
  p.updated_at,
  p.created_at
from public.profiles p
where p.kyc_status = 'none'
   or p.kyc_status is null
order by p.created_at desc
limit 20;
```

**4 user UUID:** Yukarıdaki sonuçtan master pilot test kullanıcısını seçer. UUID'leri buraya not et:

| # | user_id (UUID) | email | Not |
|---|---|---|---|
| 1 | `<DOLDUR>` | | |
| 2 | `<DOLDUR>` | | |
| 3 | `<DOLDUR>` | | |
| 4 | `<DOLDUR>` | | |

---

## 3. Tek kullanıcı verify (önerilen pilot)

`<USER_UUID_HERE>` yerine Dashboard'dan kopyalanan UUID:

```sql
-- ⚠️ PRODUCTION — yalnızca master onaylı pilot test kullanıcısı
begin;

update public.profiles
set
  kyc_status = 'verified',
  updated_at = now()
where id = '<USER_UUID_HERE>'::uuid
  and kyc_status in ('none', 'pending', 'rejected');

-- Doğrulama (aynı transaction içinde)
select id, email, full_name, kyc_status, updated_at
from public.profiles
where id = '<USER_UUID_HERE>'::uuid;

-- Audit izi (gerçek şema: audit_log)
insert into public.audit_log (
  actor_id,
  action,
  entity_type,
  entity_id,
  payload
) values (
  null,
  'manual_kyc_verify',
  'profile',
  '<USER_UUID_HERE>'::uuid,
  jsonb_build_object(
    'reason', 'production_test_master_override',
    'date', '2026-05-29',
    'actor_label', 'admin_manual_master'
  )
);

commit;
```

**Beklenen:** `update` → 1 row; `select` → `kyc_status = verified`.

---

## 4. Rollback (hata veya test sonrası geri al)

```sql
begin;

update public.profiles
set
  kyc_status = 'none',
  updated_at = now()
where id = '<USER_UUID_HERE>'::uuid;

insert into public.audit_log (
  actor_id, action, entity_type, entity_id, payload
) values (
  null,
  'manual_kyc_verify_rollback',
  'profile',
  '<USER_UUID_HERE>'::uuid,
  '{"reason":"pilot_test_cleanup","date":"2026-05-29"}'::jsonb
);

commit;
```

---

## 5. Browser test akışı (master tarayıcı)

1. Verify edilen kullanıcı ile **giriş yap** (`/giris`).
2. Aktif demo/canlı ilan aç: `/ilan/<bir-ilan-id>` veya `/ihale/<id>`.
3. **Teklif Ver** → `register_bid_deposit` RPC → **`kyc_required` dönmemeli**.
4. **Hemen Al** (varsa) → `execute_buy_now` → KYC blokajı olmamalı (PSP/deposit ayrı konu).
5. **Negatif kontrol:** `kyc=none` ikinci kullanıcı ile aynı adım → `kyc_required` beklenir.
6. **Edge (opsiyonel):** KYC verified kullanıcı ile `ai-price-estimate` → anon **401** normal; oturum + verified ile **200** veya iş kuralı yanıtı (function deploy durumuna bağlı).

**Network kanıt:** DevTools → Supabase RPC response `{ code: 'kyc_required' }` vs success.

---

## 6. Güvenlik

- Service role key **asla** `VITE_*` / istemci bundle'a konmaz.
- Manuel verify yalnızca **pilot test** veya master onaylı prod kullanıcı için.
- Gerçek KYC: `e_devlet_status`, belge, moderasyon kuyruğu (`kyc_verifications`) — ayrı sprint.

---

## 7. Checklist

- [ ] Ön kontrol SQL → 4 UUID listelendi
- [ ] 1 pilot user seçildi
- [ ] Verify SQL çalıştırıldı (`commit` OK)
- [ ] Bid smoke PASS
- [ ] Rollback SQL hazır (panoda)
- [ ] (Opsiyonel) `kyc_verified_at` migration backlog

---

**Son güncelleme:** 2026-05-29 — Cursor FINAL audit (copy-paste SQL, gerçek `audit_log` şeması)
