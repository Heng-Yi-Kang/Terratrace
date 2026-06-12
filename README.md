# Terratrace

An eco-friendly travel planning application that helps users plan sustainable journeys, track carbon footprints, and discover green destinations.

## Tech Stack

### Frontend
- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **JWT session cookies** for authentication state

### Backend
- **Express.js** (TypeScript)
- **PostgreSQL** for application data
- **CORS** enabled
- **dotenv** for environment variables

## Key Features

- **Trip Planning** — Plan eco-friendly travel itineraries
- **Carbon Footprint Tracking** — Monitor environmental impact of travel choices
- **Eco Directory** — Discover sustainable destinations and green businesses
- **Community Challenges** — Join challenges and compete on leaderboards
- **Smart Recommendations** — AI-powered suggestions for greener travel

## Project Structure

```
terratrace/
├── docs/                    # Project documentation
│   └── state-management.md  # Frontend state management study
├── frontend/                # Next.js application
│   ├── src/
│   │   ├── app/             # App Router pages and layouts
│   │   ├── components/      # React components
│   │   ├── utils/           # Utility functions and API helpers
│   │   └── middleware.ts    # Route protection middleware
│   └── public/              # Static assets
├── backend/                 # Express.js API server
│   └── src/
│       └── index.ts         # Server entry point
├── design-system/           # Design tokens and documentation
├── package.json             # Root package.json with npm workspaces
├── CLAUDE.md                # Claude Code instructions
└── README.md                # This file
```

## State Management

Terratrace uses a minimal, lightweight state management approach:

- **PostgreSQL-backed API data** as the primary source of truth
- **Local React state** (`useState`, `useEffect`) for UI state
- **Middleware** for route protection and auth guards
- **No Redux, Zustand, or Context API** — see [`docs/state-management.md`](docs/state-management.md) for details

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Docker Desktop on Windows/macOS, or Docker Engine with the Compose plugin on Linux
- Git for Windows or WSL on Windows if you want to use the root `npm run dev` script, because it invokes `bash`

Verify the tools are available:

```bash
node --version
npm --version
docker --version
docker compose version
```

### Installation and Local Setup

1. Copy environment files.

   macOS/Linux:

   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   ```

   Windows PowerShell:

   ```powershell
   Copy-Item .env.example .env
   Copy-Item backend/.env.example backend/.env
   Copy-Item frontend/.env.example frontend/.env.local
   ```

2. Update local environment values.

   For a local Docker database, keep `backend/.env` pointed at the exposed host port:

   ```env
   DATABASE_URL=postgresql://terratrace:terratrace@localhost:5433/terratrace
   ```

   Keep `JWT_SECRET` and `SESSION_COOKIE_NAME` the same in `.env`, `backend/.env`, and `frontend/.env.local`; the backend signs the cookie and the frontend middleware verifies it. Keep `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001` in `.env` and `frontend/.env.local` unless you run the API on another port.

   Optional API-backed features need additional `backend/.env` keys:
   - Smart recommendations and carbon AI summaries: `GEMINI_API_KEY`
   - Eco route planner: `OPENROUTESERVICE_API_KEY`
   - Eco Directory enrichment/seed scripts: `FOURSQUARE_API_KEY`, `UNSPLASH_ACCESS_KEY`
   - Supabase location import: `NEXT_PUBLIC_SUPABASE_URL` plus either `SUPABASE_SERVICE_ROLE_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

3. Start local Postgres with Docker:

   ```bash
   docker compose up -d postgres
   ```

   The first startup creates the `terratrace` database and runs SQL files from `db/init`.

4. Install dependencies:
   ```bash
   npm install
   ```

5. Seed the Eco Directory from Supabase:

   ```bash
   npm run db:seed:locations:from-supabase
   ```

   This copies hosted Supabase `locations` rows into local Postgres. It requires `NEXT_PUBLIC_SUPABASE_URL` plus either `SUPABASE_SERVICE_ROLE_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `backend/.env`. The script is safe to rerun because it upserts by `public_id`.

6. Start development servers:
   ```bash
   npm run dev
   ```

   On Windows without `bash`, open two PowerShell terminals instead:

   ```powershell
   npm run dev --workspace=backend
   ```

   ```powershell
   npm run dev --workspace=frontend
   ```

   This starts both:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Platform Notes

- **Windows**: Run the commands in PowerShell from the repository root. Docker Desktop must be running before `docker compose up -d postgres`. If `npm run dev` fails because `bash` is missing, use Git Bash, WSL, or the two-terminal workspace commands above.
- **macOS**: Docker Desktop must be running before starting Postgres.
- **Linux**: Start Docker first, for example `sudo systemctl start docker`. If your user is not in the `docker` group, run Docker commands with `sudo` or configure Docker permissions.

### Database Commands

| Command | Description |
|---------|-------------|
| `docker compose up -d postgres` | Start local Postgres |
| `docker compose ps` | Check container status |
| `docker compose logs postgres` | View Postgres logs |
| `docker compose down` | Stop local Postgres without deleting data |
| `docker compose down -v` | Stop Postgres and delete the local database volume |
| `npm run db:apply-schema` | Re-apply `db/init/001_schema.sql` to the running database |
| `npm run db:seed:locations:from-supabase` | Seed local `locations` from hosted Supabase |

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend |
| `npm run dev:frontend` | Start Next.js only |
| `npm run dev:backend` | Start Express.js server only |
| `npm run build` | Build both workspaces |
| `npm run start` | Start backend in production |
| `npm run lint` | Lint all workspaces |
| `npm run db:seed:locations:from-supabase` | Import/update Eco Directory locations from Supabase |

## Environment Variables

Copy the examples before running the app:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env.local
```

### Root `.env`

Used by the root development scripts and shared with the frontend process.

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Backend API base URL used by frontend data hooks. Default: `http://localhost:3001`. |
| `NEXT_PUBLIC_API_URL` | Compatibility | Legacy fallback for auth helpers. Keep it the same as `NEXT_PUBLIC_API_BASE_URL`. |
| `JWT_SECRET` | Yes | Must match `backend/.env` and `frontend/.env.local`. |
| `SESSION_COOKIE_NAME` | Yes | Must match `backend/.env` and `frontend/.env.local`. Default: `terratrace_session`. |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Legacy Supabase/API test value; also useful when seeding locations. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Optional | Public Supabase key for legacy flows and location import fallback. |

### Frontend `frontend/.env.local`

Used by Next.js.

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Backend API base URL. Default: `http://localhost:3001`. |
| `NEXT_PUBLIC_API_URL` | Compatibility | Legacy fallback for auth helpers. Keep it the same as `NEXT_PUBLIC_API_BASE_URL`. |
| `JWT_SECRET` | Yes | Must match the backend so middleware can verify session cookies. |
| `SESSION_COOKIE_NAME` | Yes | Must match the backend cookie name. |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Legacy Supabase auth/API value. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Optional | Legacy Supabase auth/API value. |

### Backend `backend/.env`

Used by the Express API and backend scripts.

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | API server port. Default: `3001`. |
| `NODE_ENV` | Yes | Use `development` locally. |
| `CORS_ORIGIN` | Yes | Frontend origin allowed to send cookies. Default: `http://localhost:3000`. |
| `DATABASE_URL` | Yes | PostgreSQL connection string. Local Docker default: `postgresql://terratrace:terratrace@localhost:5433/terratrace`. |
| `LOCAL_DATABASE_URL` | Optional | Overrides `DATABASE_URL` for `backend/scripts/seedLocationsFromSupabase.mjs`; usually keep it the same locally. |
| `JWT_SECRET` | Yes | Signs auth cookies; must match root and frontend env files. |
| `JWT_EXPIRES_IN` | Yes | JWT lifetime. Default: `7d`. |
| `SESSION_COOKIE_NAME` | Yes | Auth cookie name; must match root and frontend env files. |
| `SUPABASE_DATABASE_URL` | Optional | Hosted Supabase Postgres URL for the one-time migration script. |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Required only for `npm run db:seed:locations:from-supabase`. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Optional | Public Supabase key for location import fallback. |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Recommended for location import when table policies block public reads. |
| `GEMINI_API_KEY` | Optional | Enables smart recommendations and AI carbon summaries. |
| `GEMINI_MODEL` | Optional | Gemini model name. Default: `gemini-1.5-flash` unless overridden. |
| `SMART_RECO_CACHE_TTL_MS` | Optional | Smart recommendation cache TTL. Default: `900000`. |
| `SMART_RECO_MAX_RESULTS` | Optional | Smart recommendation result limit. Default: `6`. |
| `OPENROUTESERVICE_API_KEY` | Optional | Enables the eco route planner endpoint. |
| `FOURSQUARE_API_KEY` | Optional | Used by location seed/enrichment scripts. |
| `UNSPLASH_ACCESS_KEY` | Optional | Used by `backend/scripts/seedLocations.mjs`. |
| `NEXT_UNSPLASH_ACCESS_KEY` | Optional | Used by `backend/scripts/seedOSM.js`. |

## Local Database

Terratrace now uses plain PostgreSQL, not Supabase at runtime. The Docker Compose database uses:

```bash
DATABASE_URL=postgresql://terratrace:terratrace@localhost:5433/terratrace
```

For first-time Eco Directory content, seed `locations` from hosted Supabase:

```bash
npm run db:seed:locations:from-supabase
```

Required `backend/.env` values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
# Recommended if table policies block anonymous reads:
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

The locations seed imports only the directory rows and is idempotent.

To perform a broader one-time migration from hosted Supabase, provide `SUPABASE_DATABASE_URL` and run:

```bash
bash db/migrate-from-supabase.sh
```

The import copies app tables and converts `auth.users` into the app-owned `users` table, preserving bcrypt-compatible password hashes.

## Default Login

The local schema seeds one default account for new users:

| Email | Password |
|-------|----------|
| `traveler@terratrace.local` | `Password123!` |

Log in at http://localhost:3000/login after starting the frontend and backend. See [`docs/database-connection-and-login-credentials.md`](docs/database-connection-and-login-credentials.md) for the full database connection and credential details.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/auth/login` | Log in and set session cookie |
| POST | `/api/auth/signup` | Create user and set session cookie |
| POST | `/api/auth/logout` | Clear session cookie |
| GET | `/api/auth/me` | Get current user |
| PATCH | `/api/auth/me` | Update current user profile |
| PATCH | `/api/auth/password` | Change password |
| DELETE | `/api/user/account` | Delete user account |

## Documentation

- [`docs/database-connection-and-login-credentials.md`](docs/database-connection-and-login-credentials.md) — Local database connection and default login credentials
- [`docs/state-management.md`](docs/state-management.md) — Frontend state management architecture
