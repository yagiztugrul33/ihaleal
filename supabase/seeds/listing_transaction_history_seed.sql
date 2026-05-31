-- ═══════════════════════════════════════════════════════════════════════════
-- LISTING TRANSACTION HISTORY — Demo seed (12 catalog ilanı için)
-- ═══════════════════════════════════════════════════════════════════════════
-- Master canlıda çalıştırır (migration ayrıdır — bu sadece veri).
-- Idempotent: aynı (listing_id, transaction_date, transaction_type) tekrar
-- girilirse hata vermez (on conflict yok, ama duplicate önlemek için listing_id
-- bazında DELETE FIRST yapılır).
--
-- Pattern (her ilan):
--   - İlk listeleme (~2-3 yıl önce, %60-80 mevcut fiyat)
--   - Opsiyonel satış veya fiyat güncellemesi (~1 yıl önce, %80-90)
--   - Bugünkü liste (mevcut currentBid)
--
-- Kaynak: src/data/auctions.ts — id "1".."12"
-- ═══════════════════════════════════════════════════════════════════════════

begin;

-- Tekrar çalıştırılabilir olsun diye demo kayıtları sil.
delete from public.listing_transaction_history
  where listing_id in ('1','2','3','4','5','6','7','8','9','10','11','12')
    and source = 'demo';

insert into public.listing_transaction_history
  (listing_id, transaction_date, transaction_type, price_try, owner_changed, source, notes)
values
  -- ───────────────────────────────────────────────────────────────────────
  -- ilan/1 — Levent Plaza Katı (₺28.5M)
  -- ───────────────────────────────────────────────────────────────────────
  ('1',  '2023-04-15', 'listing',      18500000, false, 'demo', 'İlk platform listemesi (demo)'),
  ('1',  '2024-09-01', 'sale',         24500000, true,  'demo', 'Önceki satış işlemi (demo)'),
  ('1',  '2026-05-31', 'listing',      28500000, false, 'demo', 'Şu anki listeleme'),

  -- ───────────────────────────────────────────────────────────────────────
  -- ilan/2 — Bebek Boğaz Villa (₺142M) — ÖRNEK ÜST SEGMENT
  -- ───────────────────────────────────────────────────────────────────────
  ('2',  '2022-06-20', 'listing',      92000000,  false, 'demo', 'İlk platform listemesi (demo)'),
  ('2',  '2023-11-12', 'price_change', 115000000, false, 'demo', 'Liste fiyatı güncellemesi (demo)'),
  ('2',  '2025-03-04', 'sale',         132000000, true,  'demo', 'Önceki satış işlemi (demo)'),
  ('2',  '2026-05-31', 'listing',      142000000, false, 'demo', 'Şu anki listeleme'),

  -- ───────────────────────────────────────────────────────────────────────
  -- ilan/3 — Ataşehir AVM Yatırım (₺195M)
  -- ───────────────────────────────────────────────────────────────────────
  ('3',  '2023-02-10', 'listing',      140000000, false, 'demo', 'İlk platform listemesi (demo)'),
  ('3',  '2025-06-15', 'price_change', 175000000, false, 'demo', 'Liste fiyatı güncellemesi (demo)'),
  ('3',  '2026-05-31', 'listing',      195000000, false, 'demo', 'Şu anki listeleme'),

  -- ───────────────────────────────────────────────────────────────────────
  -- ilan/4 — Bodrum Yalıkavak Rezidans (₺18.5M)
  -- ───────────────────────────────────────────────────────────────────────
  ('4',  '2022-11-20', 'listing',      11500000, false, 'demo', 'İlk platform listemesi (demo)'),
  ('4',  '2024-05-10', 'sale',         15000000, true,  'demo', 'Önceki satış işlemi (demo)'),
  ('4',  '2026-05-31', 'listing',      18500000, false, 'demo', 'Şu anki listeleme'),

  -- ───────────────────────────────────────────────────────────────────────
  -- ilan/5 — Ankara Çankaya Kurumsal Ofis (₺14.5M)
  -- ───────────────────────────────────────────────────────────────────────
  ('5',  '2023-09-01', 'listing',      9800000,  false, 'demo', 'İlk platform listemesi (demo)'),
  ('5',  '2026-05-31', 'listing',      14500000, false, 'demo', 'Şu anki listeleme'),

  -- ───────────────────────────────────────────────────────────────────────
  -- ilan/6 — İzmir Kordon Daire (₺12.5M)
  -- ───────────────────────────────────────────────────────────────────────
  ('6',  '2023-05-12', 'listing',      8200000,  false, 'demo', 'İlk platform listemesi (demo)'),
  ('6',  '2024-12-03', 'price_change', 10500000, false, 'demo', 'Liste fiyatı güncellemesi (demo)'),
  ('6',  '2026-05-31', 'listing',      12500000, false, 'demo', 'Şu anki listeleme'),

  -- ───────────────────────────────────────────────────────────────────────
  -- ilan/7 — Antalya Konyaaltı Villa (₺18.5M)
  -- ───────────────────────────────────────────────────────────────────────
  ('7',  '2022-08-15', 'listing',      11200000, false, 'demo', 'İlk platform listemesi (demo)'),
  ('7',  '2024-02-20', 'sale',         15200000, true,  'demo', 'Önceki satış işlemi (demo)'),
  ('7',  '2026-05-31', 'listing',      18500000, false, 'demo', 'Şu anki listeleme'),

  -- ───────────────────────────────────────────────────────────────────────
  -- ilan/8 — Bursa Tarla 5000m² (₺8.5M)
  -- ───────────────────────────────────────────────────────────────────────
  ('8',  '2024-01-10', 'listing',      6500000,  false, 'demo', 'İlk platform listemesi (demo)'),
  ('8',  '2026-05-31', 'listing',      8500000,  false, 'demo', 'Şu anki listeleme'),

  -- ───────────────────────────────────────────────────────────────────────
  -- ilan/9 — Kadıköy Eşyalı Daire (₺7.8M)
  -- ───────────────────────────────────────────────────────────────────────
  ('9',  '2023-10-22', 'listing',      5400000,  false, 'demo', 'İlk platform listemesi (demo)'),
  ('9',  '2025-01-14', 'price_change', 6800000,  false, 'demo', 'Liste fiyatı güncellemesi (demo)'),
  ('9',  '2026-05-31', 'listing',      7800000,  false, 'demo', 'Şu anki listeleme'),

  -- ───────────────────────────────────────────────────────────────────────
  -- ilan/10 — Ankara Eryaman 3+1 (₺5.5M)
  -- ───────────────────────────────────────────────────────────────────────
  ('10', '2024-03-18', 'listing',      4100000,  false, 'demo', 'İlk platform listemesi (demo)'),
  ('10', '2026-05-31', 'listing',      5500000,  false, 'demo', 'Şu anki listeleme'),

  -- ───────────────────────────────────────────────────────────────────────
  -- ilan/11 — İzmir Karşıyaka Komple Bina 8 daire (₺28M)
  -- ───────────────────────────────────────────────────────────────────────
  ('11', '2022-12-05', 'listing',      18200000, false, 'demo', 'İlk platform listemesi (demo)'),
  ('11', '2024-08-10', 'sale',         23500000, true,  'demo', 'Önceki satış işlemi (demo)'),
  ('11', '2026-05-31', 'listing',      28000000, false, 'demo', 'Şu anki listeleme'),

  -- ───────────────────────────────────────────────────────────────────────
  -- ilan/12 — Maslak 1+0 Stüdyo (₺6.2M)
  -- ───────────────────────────────────────────────────────────────────────
  ('12', '2023-07-08', 'listing',      4400000,  false, 'demo', 'İlk platform listemesi (demo)'),
  ('12', '2026-05-31', 'listing',      6200000,  false, 'demo', 'Şu anki listeleme');

commit;

-- ═══════════════════════════════════════════════════════════════════════════
-- KANIT QUERY
-- ═══════════════════════════════════════════════════════════════════════════
-- Kontrolde:
-- select listing_id, count(*) as tx_count, min(transaction_date) as first_date,
--        max(transaction_date) as last_date,
--        (max(price_try)/min(price_try) - 1) * 100 as price_growth_pct,
--        sum(case when owner_changed then 1 else 0 end) as ownership_changes
--   from listing_transaction_history
--  where source = 'demo'
--  group by listing_id
--  order by listing_id::int;
-- ═══════════════════════════════════════════════════════════════════════════
