-- Production schema_migrations tam liste (35 satır beklenir).
select version || ' ' || name as v
from supabase_migrations.schema_migrations
order by version;
