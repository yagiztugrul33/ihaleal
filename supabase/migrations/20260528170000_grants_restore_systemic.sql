-- ═══════════════════════════════════════════════════════════════════════════
-- SİSTEMİK GRANT RESTORE (atomik tek migration)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- AMAÇ:
--   Initial schema'dan beri eksik kalan table-level GRANT'leri sistemik
--   restore eder. matching-fanout edge function (Faz 4 500 db_error) + web
--   direct table SELECT'lerinin silent fail'i tek seferde çözülür.
--
-- ÖN-KONTROL KANITI (2026-05-28, salt-okuma teşhis):
--
--   - public schema 47 BASE TABLE + 2 view (auction_bid_public_summary/tape)
--   - service_role SELECT: SADECE 2 tablo (memberships, bid_bonds) — 45 eksik
--   - authenticated SELECT: SADECE 6 tablo + 2 view (agent_perf, authorizations,
--     bid_bonds, commission_records, memberships, service_fees) — 39 eksik
--   - anon SELECT: SADECE 2 view — hiç tablo yok
--   - Kritik 5 tablo (listings/profiles/bids/auctions/bid_deposits): HEPSI MISSING
--   - matching-fanout edge function 5 kez ardışık 500 + "permission denied
--     for table listings" log mesajı (kanıt: cron.job_run_details +
--     Dashboard logs)
--   - RLS DURUMU: 47 tablo'nun HEPSI RLS ENABLED → grant açmak güvenli
--   - RLS=ON policy=0 tablolar (3): bid_bonds (RB2 orphan, bilinçli),
--     idempotency_keys (system), rate_limit_events (system)
--   - Web direct table from(): sadece 9 dosyada — çoğu RPC kullanıyor
--   - Auth-guard YOK web'de (PROTECTED_ROUTES grep boş)
--
-- KAYNAK ANALİZ:
--   Bizim eklediğimiz 9 migration (5fix, RB1/RB2, Faz 4, 5 unmerged land,
--   buy_now_kyc_guard, device_push_tokens) tablo-level GRANT etkilemedi —
--   hepsi fonksiyon revoke veya policy DROP/CREATE. Origin/main'de de 25
--   migration var, aynı durum — boşluk INITIAL_SCHEMA'dan beri var, BİZ
--   KIRMADIK.
--
-- RLS POLICY GÜVENLİK ANALİZİ (PII riski yok):
--   - profiles: profiles_select_self (auth.uid()=id) + profiles_select_admin
--     → grant açınca her kullanıcı SADECE kendi profilini görür ✓
--   - listings: listings_select_active (status in active/closed OR seller_own)
--     → public browse policy mevcut, anon active/closed görür (KASITLI) ✓
--   - auctions: auctions_select_public (status != draft)
--     → public browse, anon non-draft görür (KASITLI) ✓
--   - bids: bids_select_bidder_or_listing_owner (own + listing owner)
--     → own-only, auth.uid() NULL ise (anon) hiçbir satır görünmez ✓
--   - bid_deposits: deposits_buyer_self + deposits_seller_view + admin
--     → own-only ✓
--   - watchlist/notifications: own-only (user_id=auth.uid())
--
-- DEĞİŞMEYEN:
--   - 47 tablonun RLS=ON bayrağı
--   - Tüm policy'ler
--   - Tüm fonksiyonlar + fonksiyon GRANT'leri
--   - schema yapısı
--
-- DEPLOY:
--   _audit/migration_deploy/extra_grants_restore.sql üzerinden atomik
--   BEGIN/COMMIT + 60-check smoke (önceki 47 + 13 yeni). Faz 4 cron
--   reschedule dahil (grant fix sonrası matching-fanout fonksiyonel olur).
--
-- REVERSE:
--   _audit/migration_deploy/extra_grants_restore.sql REVERSE bloğunda
--   atomik revoke + schema_migrations DELETE + cron unschedule.
-- ═══════════════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────────────────
-- 1) service_role: tüm public CRUD (Supabase admin default)
-- ──────────────────────────────────────────────────────────────────────────

grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

alter default privileges in schema public grant select, insert, update, delete on tables to service_role;
alter default privileges in schema public grant usage, select on sequences to service_role;
alter default privileges in schema public grant execute on functions to service_role;

-- ──────────────────────────────────────────────────────────────────────────
-- 2) authenticated: tüm public SELECT (RLS policy filter eder)
-- ──────────────────────────────────────────────────────────────────────────

grant select on all tables in schema public to authenticated;
alter default privileges in schema public grant select on tables to authenticated;

-- Spesifik INSERT/UPDATE/DELETE (RPC olmayan direct writes — src/ grep kanıtı):
-- CorporateContact.tsx, AuctionDetail.tsx, AdminDashboard.tsx, aiAnalysis.ts,
-- HizmetBedelleri.tsx, PreLaunch.tsx, YillikUyelik.tsx, CreateAuction.tsx
grant insert, update, delete on public.watchlist to authenticated;
grant insert on public.notifications to authenticated;
grant insert, update on public.profiles to authenticated;
grant update on public.listings to authenticated;
grant insert on public.auctions to authenticated;
grant insert on public.report_approvals to authenticated;
grant insert on public.memberships to authenticated;
grant insert on public.authorizations to authenticated;
grant insert on public.service_fees to authenticated;
grant insert on public.bid_deposits to authenticated;
grant insert on public.corporate_leads to authenticated;

-- Sequence usage (auto-increment için)
grant usage, select on all sequences in schema public to authenticated;
alter default privileges in schema public grant usage, select on sequences to authenticated;

-- ──────────────────────────────────────────────────────────────────────────
-- 3) anon: KISITLI (sadece public-facing tablolar, "all tables" YAPILMAZ)
-- ──────────────────────────────────────────────────────────────────────────

-- Public browse — RLS policy zaten filter (listings_select_active +
-- auctions_select_public): anon active/closed listings + non-draft auctions
-- görür, draft/private görmez
grant select on public.listings to anon;
grant select on public.auctions to anon;

-- Form INSERT akışları
grant insert on public.corporate_leads to anon;
-- pre_launch_signups: 20260430140000_pre_launch_signups.sql'de zaten var (idempotent skip)

-- anon SELECT açılmayacak: profiles (PII), bids (kullanıcı verisi),
-- bid_deposits (finansal), watchlist/notifications (private),
-- organizations (member-only), tüm sistem tabloları (rate_limit,
-- idempotency, audit_log, vb.)

-- ──────────────────────────────────────────────────────────────────────────
-- 4) Faz 4 cron reschedule (grant fix sonrası matching-fanout fonksiyonel)
-- ──────────────────────────────────────────────────────────────────────────

do $cron_reschedule$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    -- Önceki schedule sil (yoksa skip)
    begin
      perform cron.unschedule(jobid) from cron.job where jobname = 'matching-fanout-every-minute';
    exception when others then null;
    end;
    -- Yeniden schedule (extra_phase4.sql'deki cron bloğunun aynısı)
    perform cron.schedule(
      'matching-fanout-every-minute',
      '* * * * *',
      $cmd$
        select net.http_post(
          url := 'https://wsjifesrdaeorrdzbvmk.supabase.co/functions/v1/matching-fanout',
          headers := jsonb_build_object(
            'content-type', 'application/json',
            'x-internal-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'matching_fanout_cron_secret' limit 1)
          ),
          body := '{}'::jsonb
        )
      $cmd$
    );
  end if;
exception when others then
  raise notice 'matching cron reschedule skipped: %', sqlerrm;
end
$cron_reschedule$;
