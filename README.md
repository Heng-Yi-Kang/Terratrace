# Terratrace

An eco-friendly travel planning application that helps users plan sustainable journeys, track carbon footprints, and discover green destinations.

## Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Supabase** for authentication

### Backend
- **Express.js** (TypeScript)
- **CORS** enabled
- **dotenv** for environment variables

## Project Structure

```
terratrace/
├── frontend/           # Next.js application
│   ├── src/
│   │   └── app/        # App Router pages and layouts
│   └── public/         # Static assets
├── backend/            # Express.js API server
│   └── src/
│       └── index.ts    # Server entry point
├── design-system/      # Design tokens and documentation
├── package.json       # Root package.json with npm workspaces
└── CLAUDE.md          # Claude Code instructions
```

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
| `.env` (root) | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| `frontend/.env.local` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| `backend/.env` | `PORT`, `NODE_ENV`, `FRONTEND_URL` |

## API

- Health check: `GET http://localhost:3001/health`
- API base: `/api`