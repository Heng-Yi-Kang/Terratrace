# Local Postgres

Start the database:

```bash
docker compose up -d postgres
```

The default local connection string is:

```bash
DATABASE_URL=postgresql://terratrace:terratrace@localhost:5433/terratrace
```

Apply or re-apply the schema:

```bash
npm run db:apply-schema
```

Seed Eco Directory locations from hosted Supabase:

```bash
npm run db:seed:locations:from-supabase
```

The seed command reads Supabase through the REST API and upserts rows into the local `locations` table by `public_id`. Add these values to `backend/.env` before running it:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
# Recommended if RLS prevents public reads:
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Use the full one-time import from hosted Supabase only when you need all supported app tables and auth users:

```bash
export SUPABASE_DATABASE_URL='postgresql://...'
export DATABASE_URL='postgresql://terratrace:terratrace@localhost:5433/terratrace'
bash db/migrate-from-supabase.sh
```

The import copies app tables and transforms `auth.users` into the local `users` table. Existing bcrypt-compatible Supabase password hashes are preserved.
