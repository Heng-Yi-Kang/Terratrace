# Local Postgres

Start the database:

```bash
docker compose up -d postgres
```

The default local connection string is:

```bash
DATABASE_URL=postgresql://terratrace:terratrace@localhost:5433/terratrace
```

One-time import from hosted Supabase:

```bash
export SUPABASE_DATABASE_URL='postgresql://...'
export DATABASE_URL='postgresql://terratrace:terratrace@localhost:5433/terratrace'
bash db/migrate-from-supabase.sh
```

The import copies app tables and transforms `auth.users` into the local `users` table. Existing bcrypt-compatible Supabase password hashes are preserved.
