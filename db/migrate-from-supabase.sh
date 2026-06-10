#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${SUPABASE_DATABASE_URL:-}" ]]; then
  echo "SUPABASE_DATABASE_URL is required."
  exit 1
fi

DATABASE_URL="${DATABASE_URL:-postgresql://terratrace:terratrace@localhost:5432/terratrace}"
NETWORK="${DOCKER_NETWORK:-host}"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

echo "Exporting app tables from Supabase..."
docker run --rm --network "$NETWORK" -v "$TMP_DIR:/dump" postgres:16-alpine \
  pg_dump "$SUPABASE_DATABASE_URL" \
  --data-only \
  --column-inserts \
  --table=public.locations \
  --table=public.user_favourites \
  --table=public.carbon_entries \
  --table=public.todos \
  --file=/dump/app-data.sql

echo "Exporting Supabase auth users..."
docker run --rm --network "$NETWORK" -v "$TMP_DIR:/dump" postgres:16-alpine \
  psql "$SUPABASE_DATABASE_URL" \
  -c "\\copy (select id, email, encrypted_password as password_hash, raw_user_meta_data, raw_app_meta_data, created_at, updated_at from auth.users where encrypted_password is not null and email is not null) to '/dump/auth-users.csv' csv header"

echo "Applying local schema..."
docker run --rm --network "$NETWORK" -v "$PWD/db/init:/schema:ro" postgres:16-alpine \
  psql "$DATABASE_URL" -f /schema/001_schema.sql

echo "Transforming auth.users into public.users..."
docker run --rm --network "$NETWORK" -v "$TMP_DIR:/dump" postgres:16-alpine \
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
create temporary table supabase_auth_users_import (
  id uuid,
  email text,
  password_hash text,
  raw_user_meta_data jsonb,
  raw_app_meta_data jsonb,
  created_at timestamptz,
  updated_at timestamptz
);

\copy supabase_auth_users_import from '/dump/auth-users.csv' csv header

insert into users (
  id, email, password_hash, username, role,
  raw_user_meta_data, raw_app_meta_data, created_at, updated_at
)
select
  id,
  email,
  password_hash,
  coalesce(raw_user_meta_data->>'username', split_part(email, '@', 1)),
  case when coalesce(raw_user_meta_data->>'role', raw_app_meta_data->>'role') = 'admin' then 'admin' else 'user' end,
  coalesce(raw_user_meta_data, '{}'::jsonb),
  coalesce(raw_app_meta_data, '{}'::jsonb),
  coalesce(created_at, now()),
  coalesce(updated_at, created_at, now())
from supabase_auth_users_import
on conflict (id) do update set
  email = excluded.email,
  password_hash = excluded.password_hash,
  username = excluded.username,
  role = excluded.role,
  raw_user_meta_data = excluded.raw_user_meta_data,
  raw_app_meta_data = excluded.raw_app_meta_data,
  updated_at = excluded.updated_at;
SQL

echo "Importing app data..."
docker run --rm --network "$NETWORK" -v "$TMP_DIR:/dump" postgres:16-alpine \
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f /dump/app-data.sql

echo "Verifying row counts..."
docker run --rm --network "$NETWORK" postgres:16-alpine \
  psql "$DATABASE_URL" -c "
    select 'users' as table_name, count(*) from users
    union all select 'locations', count(*) from locations
    union all select 'user_favourites', count(*) from user_favourites
    union all select 'carbon_entries', count(*) from carbon_entries
    union all select 'todos', count(*) from todos;
  "

echo "Migration complete."
