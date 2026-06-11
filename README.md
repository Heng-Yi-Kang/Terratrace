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

2. Update `backend/.env` so Docker Postgres uses the exposed host port:

   ```env
   DATABASE_URL=postgresql://terratrace:terratrace@localhost:5433/terratrace
   ```

   Keep `JWT_SECRET` and `SESSION_COOKIE_NAME` the same in `.env`, `backend/.env`, and `frontend/.env.local`.

3. Start local Postgres with Docker:

   ```bash
   docker compose up -d postgres
   ```

   The first startup creates the `terratrace` database and runs SQL files from `db/init`.

4. Install dependencies:
   ```bash
   npm install
   ```

5. Start development servers:
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

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend |
| `npm run dev:frontend` | Start Next.js only |
| `npm run dev:backend` | Start Express.js server only |
| `npm run build` | Build both workspaces |
| `npm run start` | Start backend in production |
| `npm run lint` | Lint all workspaces |

## Environment Variables

| File | Variables |
|------|-----------|
| `.env` (root) | `NEXT_PUBLIC_API_BASE_URL`, `JWT_SECRET`, `SESSION_COOKIE_NAME` |
| `frontend/.env.local` | `NEXT_PUBLIC_API_BASE_URL`, `JWT_SECRET`, `SESSION_COOKIE_NAME` |
| `backend/.env` | `PORT`, `NODE_ENV`, `CORS_ORIGIN`, `DATABASE_URL`, `JWT_SECRET`, `SESSION_COOKIE_NAME` |

## Local Database

Terratrace now uses plain PostgreSQL, not Supabase at runtime. The Docker Compose database uses:

```bash
DATABASE_URL=postgresql://terratrace:terratrace@localhost:5433/terratrace
```

To import once from hosted Supabase, provide `SUPABASE_DATABASE_URL` and run:

```bash
bash db/migrate-from-supabase.sh
```

The import copies app tables and converts `auth.users` into the app-owned `users` table, preserving bcrypt-compatible password hashes.

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

- [`CLAUDE.md`](CLAUDE.md) — Claude Code development guidance
- [`docs/state-management.md`](docs/state-management.md) — Frontend state management architecture
