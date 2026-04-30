# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Terratrace is a full-stack eco-friendly travel planning application with a Next.js frontend and Express.js backend. It helps users plan sustainable journeys, track carbon footprints, and discover green destinations.

## Development Commands

```bash
# Install all dependencies (monorepo uses npm workspaces)
npm install

# Start both frontend and backend in development mode
npm run dev

# Start only frontend (http://localhost:3000)
npm run dev:frontend

# Start only backend (http://localhost:3001)
npm run dev:backend

# Build both workspaces
npm run build

# Start backend in production mode
npm run start

# Lint all workspaces
npm run lint
```

## Architecture

### Monorepo Structure
- `/frontend` - Next.js 14 with App Router, TypeScript, Tailwind CSS
- `/backend` - Express.js API server, TypeScript, runs on port 3001
- Root `package.json` uses npm workspaces to manage both

### Frontend Architecture (Next.js App Router)
- `frontend/src/app/` - App Router pages and layouts
- Global CSS variables defined in `globals.css` under `:root`
- Tailwind extends the design tokens (colors, fonts, shadows, border-radius)
- Fonts loaded via `next/font/google` (Poppins for headings, Open Sans for body)

### Backend Architecture
- Single entry point: `backend/src/index.ts`
- Health check endpoint: `GET /health`
- API base: `/api`
- CORS enabled, dotenv for environment variables

## Design System

The design system is defined in `design-system/terratrace/MASTER.md`. Key tokens:

### Color Palette
| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary | `#0891B2` | `--color-primary` |
| Secondary | `#22D3EE` | `--color-secondary` |
| CTA/Accent | `#22C55E` | `--color-cta` |
| Background | `#ECFEFF` | `--color-background` |
| Text | `#164E63` | `--color-text` |

Note: The Tailwind config (`frontend/tailwind.config.ts`) uses different green values (primary: `#059669`, secondary: `#10B981`, cta: `#FBBF24`). The CSS variables in globals.css and the design system MASTER.md both use cyan-based colors. When in doubt, prioritize the CSS variables in globals.css and Tailwind config over the MASTER.md values since those are what the actual components use.

### Typography
- Headings: Poppins (weights 400-700)
- Body: Open Sans (weights 300-700)

### Custom Tailwind Extensions
- `rounded-organic`: 24px, `rounded-organic-lg`: 32px
- `shadow-organic`: 0 8px 32px rgba(0,0,0,0.08), `shadow-organic-lg`: 0 12px 48px rgba(0,0,0,0.12)

### UI Patterns
- Minimal Single Column page pattern: Hero headline → description → benefits (3 max) → CTA → Footer
- Large sections with 48px+ gaps, bold hover states, scroll-snap, large type (32px+)
- 200-300ms transitions on all interactive elements

### Component Guidelines
- All clickable elements must have `cursor-pointer`
- Hover states must use smooth transitions (150-300ms)
- No emojis as icons - use SVG (Heroicons, Lucide)
- All icons must be from a consistent icon set
- Focus states must be visible for keyboard accessibility
- Respect `prefers-reduced-motion`
- Maintain 4.5:1 minimum contrast ratio for text

## Environment Variables

Copy `backend/.env.example` to `backend/.env` for local development. The backend uses `PORT` (default 3001).
