-- N23 — Belge imza kayıtları (MVP görsel imza + bütünlük hash)
-- CC-apply: Claude Code canlı Supabase'e uygulayacak
-- NOT: Yasal nitelikli e-imza değildir; _audit/EIMZA_NOTU.md

begin;

create table if not exists public.signatures (
  id uuid primary key default gen_random_uuid(),
  document_id text not null,
  document_type text not null default 'pdf'
    check (document_type in ('pdf', 'contract', 'expertise', 'listing', 'kka', 'project')),
  signer_id uuid not null references auth.users(id) on delete cascade,
  signature_data text not null,
  content_hash text not null,
  signed_at timestamptz not null default now(),
  storage_path text,
  created_at timestamptz not null default now()
);

create index if not exists idx_signatures_signer on public.signatures (signer_id, signed_at desc);
create index if not exists idx_signatures_document on public.signatures (document_id);

alter table public.signatures enable row level security;

drop policy if exists "signatures_owner_select" on public.signatures;
create policy "signatures_owner_select"
  on public.signatures for select to authenticated
  using (signer_id = auth.uid());

drop policy if exists "signatures_owner_insert" on public.signatures;
create policy "signatures_owner_insert"
  on public.signatures for insert to authenticated
  with check (signer_id = auth.uid());

grant select, insert on public.signatures to authenticated;

commit;

select tablename from pg_tables where schemaname = 'public' and tablename = 'signatures';
