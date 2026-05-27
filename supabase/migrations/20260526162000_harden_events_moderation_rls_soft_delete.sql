begin;

-- moderation_queue: user-owned moderation records + soft delete
alter table public.moderation_queue
  add column if not exists created_by uuid references auth.users(id),
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references auth.users(id);

update public.moderation_queue
set created_by = coalesce(created_by, auth.uid())
where created_by is null;

alter table public.moderation_queue
  alter column created_by set default auth.uid();

alter table public.moderation_queue enable row level security;

drop policy if exists "mq_select_own_or_admin" on public.moderation_queue;
create policy "mq_select_own_or_admin"
  on public.moderation_queue
  for select
  using (
    deleted_at is null
    and (
      created_by = auth.uid()
      or is_profile_admin(auth.uid())
    )
  );

drop policy if exists "mq_insert_own" on public.moderation_queue;
create policy "mq_insert_own"
  on public.moderation_queue
  for insert
  with check (
    auth.uid() is not null
    and created_by = auth.uid()
  );

drop policy if exists "mq_update_own_or_admin" on public.moderation_queue;
create policy "mq_update_own_or_admin"
  on public.moderation_queue
  for update
  using (
    created_by = auth.uid()
    or is_profile_admin(auth.uid())
  )
  with check (
    created_by = auth.uid()
    or is_profile_admin(auth.uid())
  );

create or replace function public.soft_delete_moderation_queue()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.moderation_queue
  set deleted_at = now(),
      deleted_by = auth.uid(),
      status = case when status = 'deleted' then status else 'deleted' end
  where id = old.id
    and deleted_at is null;

  perform public.write_audit_v2(
    'soft_delete',
    'moderation_queue',
    old.id::text,
    jsonb_build_object('reason', old.reason, 'status', old.status)
  );

  return null;
end;
$$;

drop trigger if exists trg_soft_delete_moderation_queue on public.moderation_queue;
create trigger trg_soft_delete_moderation_queue
  before delete on public.moderation_queue
  for each row execute function public.soft_delete_moderation_queue();

drop policy if exists "mq_delete_soft_own_or_admin" on public.moderation_queue;
create policy "mq_delete_soft_own_or_admin"
  on public.moderation_queue
  for delete
  using (
    created_by = auth.uid()
    or is_profile_admin(auth.uid())
  );

-- events: user-owned activity feed + soft delete
alter table public.events
  add column if not exists created_by uuid references auth.users(id),
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references auth.users(id);

update public.events
set created_by = coalesce(created_by, user_id, auth.uid())
where created_by is null;

alter table public.events
  alter column created_by set default auth.uid();

alter table public.events enable row level security;

drop policy if exists "ev_select_own_or_admin" on public.events;
create policy "ev_select_own_or_admin"
  on public.events
  for select
  using (
    deleted_at is null
    and (
      user_id = auth.uid()
      or created_by = auth.uid()
      or is_profile_admin(auth.uid())
    )
  );

drop policy if exists "ev_insert_own" on public.events;
create policy "ev_insert_own"
  on public.events
  for insert
  with check (
    auth.uid() is not null
    and (user_id = auth.uid() or user_id is null)
    and created_by = auth.uid()
  );

drop policy if exists "ev_update_own_or_admin" on public.events;
create policy "ev_update_own_or_admin"
  on public.events
  for update
  using (
    user_id = auth.uid()
    or created_by = auth.uid()
    or is_profile_admin(auth.uid())
  )
  with check (
    user_id = auth.uid()
    or created_by = auth.uid()
    or is_profile_admin(auth.uid())
  );

create or replace function public.soft_delete_events()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.events
  set deleted_at = now(),
      deleted_by = auth.uid()
  where id = old.id
    and deleted_at is null;

  perform public.write_audit_v2(
    'soft_delete',
    'events',
    old.id::text,
    jsonb_build_object('kind', old.kind, 'entity_type', old.entity_type)
  );

  return null;
end;
$$;

drop trigger if exists trg_soft_delete_events on public.events;
create trigger trg_soft_delete_events
  before delete on public.events
  for each row execute function public.soft_delete_events();

drop policy if exists "ev_delete_soft_own_or_admin" on public.events;
create policy "ev_delete_soft_own_or_admin"
  on public.events
  for delete
  using (
    user_id = auth.uid()
    or created_by = auth.uid()
    or is_profile_admin(auth.uid())
  );

commit;
