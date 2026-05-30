-- S2-G1 — Storage buckets + storage.objects RLS (idempotent)
-- Kaynak: _audit/S2_STORAGE_PLAN.md
-- Path: listing-photos/{owner_id}/{entity_id}/...
--       project-docs/{org_id}/{entity_id}/{doc_kind}/...
--       expertise-reports/{entity_id}/...

begin;

-- ── Buckets ─────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'listing-photos',
    'listing-photos',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'project-docs',
    'project-docs',
    false,
    10485760,
    array['application/pdf', 'image/jpeg', 'image/png']
  ),
  (
    'expertise-reports',
    'expertise-reports',
    false,
    15728640,
    array['application/pdf']
  )
on conflict (id) do nothing;

-- ── Helper: platform admin check (storage policies) ─────────────────────────

create or replace function public.storage_is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (p.is_admin = true or p.role = 'admin')
  );
$$;

revoke all on function public.storage_is_platform_admin() from public;
grant execute on function public.storage_is_platform_admin() to authenticated, service_role;

-- ── listing-photos (public read, owner write) ───────────────────────────────

drop policy if exists "storage_listing_photos_select_public" on storage.objects;
create policy "storage_listing_photos_select_public"
  on storage.objects
  for select
  to public
  using (bucket_id = 'listing-photos');

drop policy if exists "storage_listing_photos_insert_owner" on storage.objects;
create policy "storage_listing_photos_insert_owner"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'listing-photos'
    and auth.uid() is not null
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "storage_listing_photos_update_owner" on storage.objects;
create policy "storage_listing_photos_update_owner"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'listing-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'listing-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "storage_listing_photos_delete_owner" on storage.objects;
create policy "storage_listing_photos_delete_owner"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'listing-photos'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or public.storage_is_platform_admin()
    )
  );

-- ── project-docs (private: org member + admin, anon yok) ────────────────────

drop policy if exists "storage_project_docs_select_member" on storage.objects;
create policy "storage_project_docs_select_member"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'project-docs'
    and (
      public.has_org_role(
        (storage.foldername(name))[1]::uuid,
        array['owner', 'admin', 'manager', 'agent', 'viewer']
      )
      or public.storage_is_platform_admin()
    )
  );

drop policy if exists "storage_project_docs_insert_member" on storage.objects;
create policy "storage_project_docs_insert_member"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'project-docs'
    and auth.uid() is not null
    and (
      public.has_org_role(
        (storage.foldername(name))[1]::uuid,
        array['owner', 'admin', 'manager', 'agent']
      )
      or public.storage_is_platform_admin()
    )
  );

drop policy if exists "storage_project_docs_update_member" on storage.objects;
create policy "storage_project_docs_update_member"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'project-docs'
    and (
      public.has_org_role(
        (storage.foldername(name))[1]::uuid,
        array['owner', 'admin', 'manager', 'agent']
      )
      or public.storage_is_platform_admin()
    )
  )
  with check (
    bucket_id = 'project-docs'
    and (
      public.has_org_role(
        (storage.foldername(name))[1]::uuid,
        array['owner', 'admin', 'manager', 'agent']
      )
      or public.storage_is_platform_admin()
    )
  );

drop policy if exists "storage_project_docs_delete_member" on storage.objects;
create policy "storage_project_docs_delete_member"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'project-docs'
    and (
      public.has_org_role(
        (storage.foldername(name))[1]::uuid,
        array['owner', 'admin', 'manager']
      )
      or public.storage_is_platform_admin()
    )
  );

-- ── expertise-reports (private: listing seller + admin) ───────────────────────

drop policy if exists "storage_expertise_reports_select_seller" on storage.objects;
create policy "storage_expertise_reports_select_seller"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'expertise-reports'
    and (
      exists (
        select 1
        from public.listings l
        where l.id::text = (storage.foldername(name))[1]
          and l.seller_id = auth.uid()
      )
      or public.storage_is_platform_admin()
    )
  );

drop policy if exists "storage_expertise_reports_insert_seller" on storage.objects;
create policy "storage_expertise_reports_insert_seller"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'expertise-reports'
    and auth.uid() is not null
    and (
      exists (
        select 1
        from public.listings l
        where l.id::text = (storage.foldername(name))[1]
          and l.seller_id = auth.uid()
      )
      or public.storage_is_platform_admin()
    )
  );

drop policy if exists "storage_expertise_reports_update_seller" on storage.objects;
create policy "storage_expertise_reports_update_seller"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'expertise-reports'
    and (
      exists (
        select 1
        from public.listings l
        where l.id::text = (storage.foldername(name))[1]
          and l.seller_id = auth.uid()
      )
      or public.storage_is_platform_admin()
    )
  )
  with check (
    bucket_id = 'expertise-reports'
    and (
      exists (
        select 1
        from public.listings l
        where l.id::text = (storage.foldername(name))[1]
          and l.seller_id = auth.uid()
      )
      or public.storage_is_platform_admin()
    )
  );

drop policy if exists "storage_expertise_reports_delete_seller" on storage.objects;
create policy "storage_expertise_reports_delete_seller"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'expertise-reports'
    and (
      exists (
        select 1
        from public.listings l
        where l.id::text = (storage.foldername(name))[1]
          and l.seller_id = auth.uid()
      )
      or public.storage_is_platform_admin()
    )
  );

commit;

-- ── Doğrulama (apply sonrası çıktı) ─────────────────────────────────────────

select id, name, public, file_size_limit
from storage.buckets
where id in ('listing-photos', 'project-docs', 'expertise-reports')
order by id;

select count(*) as storage_objects_policy_count
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname like 'storage_%';
