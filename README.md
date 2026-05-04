# Terratrace

A full-stack web application built with Next.js (frontend) and Express.js (backend).

## Project Structure

```
terratrace/
├── frontend/          # Next.js application (App Router + TypeScript)
│   ├── src/
│   │   └── app/       # App Router pages and layouts
│   └── ...
├── backend/           # Express.js API server (TypeScript)
│   ├── src/
│   │   └── index.ts   # Server entry point
│   └── ...
├── .env               # Environment variables (create from .env.example)
└── package.json       # Root package.json for workspace management
```

## Prerequisites

- Node.js 18+
- npm 9+

## Getting Started

1. Copy environment files and configure:
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   ```

2. Update `.env` with your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - Your Supabase publishable key

3. Install dependencies for all workspaces:
   ```bash
   npm install
   ```

4. Start development servers:
   ```bash
   npm run dev
   ```
   This starts both the frontend (http://localhost:3000) and backend (http://localhost:3001).

5. Or start them individually:
   ```bash
   npm run dev:frontend   # Frontend only
   npm run dev:backend    # Backend only
   ```

## Environment Variables

Create `.env` files from the provided examples:

| File | Required Variables |
|------|-------------------|
| `.env` (root) | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| `backend/.env` | `PORT`, `NODE_ENV`, `FRONTEND_URL` |

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend in development mode |
| `npm run dev:frontend` | Start Next.js development server (loads .env) |
| `npm run dev:backend` | Start Express.js server with hot reload |
| `npm run build` | Build both frontend and backend |
| `npm run start` | Start backend server in production mode |
| `npm run lint` | Lint all workspaces |

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS

### Backend
- Express.js
- TypeScript
- CORS enabled
- dotenv for environment variables

## Development

- Frontend runs on `http://localhost:3000`
- Backend API runs on `http://localhost:3001`
- API health check: `GET http://localhost:3001/health`