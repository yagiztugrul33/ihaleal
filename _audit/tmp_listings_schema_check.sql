-- matching-fanout edge function db_error root cause:
-- Edge function listings + buyer_preferences sorgu yapıyor, hangi kolon eksik?

select 'listings_columns' as k,
  coalesce(string_agg(column_name, ',' order by ordinal_position), 'TABLE_YOK') as v
from information_schema.columns
where table_schema='public' and table_name='listings'
union all
select 'listings_matched_at_exists',
  case when exists (select 1 from information_schema.columns
                    where table_schema='public' and table_name='listings' and column_name='matched_at')
       then 'EXISTS' else 'MISSING' end
union all
select 'listings_organization_id_exists',
  case when exists (select 1 from information_schema.columns
                    where table_schema='public' and table_name='listings' and column_name='organization_id')
       then 'EXISTS' else 'MISSING' end
union all
select 'buyer_preferences_columns',
  coalesce(string_agg(column_name, ',' order by ordinal_position), 'TABLE_YOK')
from information_schema.columns
where table_schema='public' and table_name='buyer_preferences'
union all
select 'listing_matches_columns',
  coalesce(string_agg(column_name, ',' order by ordinal_position), 'TABLE_YOK')
from information_schema.columns
where table_schema='public' and table_name='listing_matches'
union all
select 'notifications_columns',
  coalesce(string_agg(column_name, ',' order by ordinal_position), 'TABLE_YOK')
from information_schema.columns
where table_schema='public' and table_name='notifications'
union all
-- net response detayı (5 son tetik)
select 'net_recent_responses',
  coalesce((select string_agg(
              status_code::text || ':' || left(coalesce(content::text, 'null'), 80),
              ' | '
              order by created desc)
            from (select status_code, content, created
                  from net._http_response
                  where created >= now() - interval '5 minutes'
                  order by created desc limit 5) sub), 'NONE');
