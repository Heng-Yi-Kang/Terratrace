# Database Connection And Login Credentials

## Local Database

Terratrace uses local PostgreSQL through Docker Compose.

| Item | Value |
| --- | --- |
| Database | `terratrace` |
| User | `terratrace` |
| Password | `terratrace` |
| Host | `localhost` |
| Port | `5433` |
| Container port | `5432` |
| Connection URL | `postgresql://terratrace:terratrace@localhost:5433/terratrace` |

Start the database:

```bash
docker compose up -d postgres
```

Apply the schema if needed:

```bash
npm run db:apply-schema
```

The backend reads the database URL from `backend/.env`:

```env
DATABASE_URL=postgresql://terratrace:terratrace@localhost:5433/terratrace
```

## Application Login

Authentication is handled by the Express backend, not Supabase Auth at runtime. User accounts are stored in the `users` table with bcrypt password hashes.

The local schema seeds one default account:

| Email | Password |
| --- | --- |
| `traveler@terratrace.local` | `Password123!` |

Use the seeded email and password at:

```text
http://localhost:3000/login
```

New users can also create their own account from:

```text
http://localhost:3000/signup
```

The backend login endpoint is:

```text
POST http://localhost:3001/api/auth/login
```

with JSON body:

```json
{
  "email": "traveler@terratrace.local",
  "password": "Password123!"
}
```

Successful login sets the `terratrace_session` HTTP-only cookie and opens the user dashboard at `/dashboard`.

## Related Environment Values

Use the same `JWT_SECRET` and `SESSION_COOKIE_NAME` in the root `.env`, `backend/.env`, and `frontend/.env.local`.

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
JWT_SECRET=replace_with_a_long_random_secret
SESSION_COOKIE_NAME=terratrace_session
```

Supabase keys are only needed for one-time location seeding or migration, not for normal local login.
