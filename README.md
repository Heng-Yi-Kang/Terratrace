# Terratrace

An eco-friendly travel planning application that helps users plan sustainable journeys, track carbon footprints, and discover green destinations.

## Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Supabase** for authentication and database

### Backend
- **Express.js** (TypeScript)
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
│   │   ├── utils/           # Utility functions (Supabase clients, helpers)
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

- **Supabase** as the primary source of truth for auth and data
- **Local React state** (`useState`, `useEffect`) for UI state
- **Middleware** for route protection and auth guards
- **No Redux, Zustand, or Context API** — see [`docs/state-management.md`](docs/state-management.md) for details

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

1. Copy environment files:
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development servers:
   ```bash
   npm run dev
   ```

   Start local Postgres first:

   ```bash
   docker compose up -d postgres
   ```

   Then start the app:

   ```bash
   npm run dev
   ```

   This starts both:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

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
