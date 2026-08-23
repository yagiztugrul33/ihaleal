-- KYC üçüncü parti doğrulama sağlayıcısı entegrasyonu için gerekli alanlar.
-- kyc-submit Edge Function artık (KYC_PROVIDER_API_URL/KEY tanımlıysa) bir dış
-- sağlayıcıya doğrulama isteği gönderiyor; bu alanlar sağlayıcı referansını ve
-- asenkron webhook'tan (kyc-submit?action=provider_callback) gelen sonucu tutar.
-- Sağlayıcı yoksa (varsayılan durum) davranış değişmez: status 'in_review' kalır,
-- manuel inceleme kuyruğu önceki gibi çalışmaya devam eder.

alter table public.kyc_verifications
  add column if not exists provider text,
  add column if not exists provider_ref text,
  add column if not exists verdict text,
  add column if not exists verdict_reason text,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists kyc_verifications_provider_ref_idx
  on public.kyc_verifications (provider, provider_ref);

create or replace function public.set_kyc_verifications_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_kyc_verifications_updated_at on public.kyc_verifications;
create trigger trg_kyc_verifications_updated_at
  before update on public.kyc_verifications
  for each row execute function public.set_kyc_verifications_updated_at();
