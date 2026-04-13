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
└── package.json       # Root package.json for workspace management
```

## Prerequisites

- Node.js 18+
- npm 9+

## Getting Started

1. Install dependencies for all workspaces:
   ```bash
   npm install
   ```

2. Start development servers:
   ```bash
   npm run dev
   ```
   This starts both the frontend (http://localhost:3000) and backend (http://localhost:3001).

3. Or start them individually:
   ```bash
   npm run dev:frontend   # Frontend only
   npm run dev:backend    # Backend only
   ```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend in development mode |
| `npm run dev:frontend` | Start Next.js development server |
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