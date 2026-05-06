# Terratrace State Management Study

This document describes how state is managed across the Terratrace frontend application.

## Overview

Terratrace uses a **minimal, lightweight state management** approach with no centralized store like Redux or Zustand. The architecture relies on Supabase as the primary source of truth for authentication and data, combined with local React patterns for UI state.

---

## 1. Server State → Supabase

The primary "state management" is Supabase itself — user authentication and session are handled directly through Supabase Auth.

### File Reference

| File | Purpose |
|------|---------|
| `src/utils/supabase/client.ts` | Browser-side Supabase client (singleton) |
| `src/utils/supabase/server.ts` | Server-side Supabase client (for Server Components) |
| `src/utils/supabase/middleware.ts` | Supabase client factory for Edge Runtime |
| `src/utils/supabase/auth.ts` | Auth helpers: `signIn`, `signUp`, `signOut`, `getCurrentUser`, `getSession` |
| `src/utils/supabase/state.ts` | Connection state tracking (configured/missing-env) |

### Auth Flow (`src/utils/supabase/auth.ts`)

```typescript
export async function signIn(email: string, password: string) {
  const supabase = createClient()
  if (!supabase) return { error: { message: 'Supabase not configured' } }
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signUp(email: string, password: string, username?: string, role: UserRole = 'user') {
  const supabase = createClient()
  if (!supabase) return { error: { message: 'Supabase not configured' } }
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role, username }
    }
  })
}

export async function signOut() {
  const supabase = createClient()
  if (!supabase) return { error: { message: 'Supabase not configured' } }
  return supabase.auth.signOut()
}

export async function getCurrentUser() {
  const supabase = createClient()
  if (!supabase) return { data: { user: null }, error: null }
  return supabase.auth.getUser()
}
```

### Browser Client (`src/utils/supabase/client.ts`)

```typescript
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export const createClient = () => {
  if (!supabaseConnectionState.configured) return null;

  if (!browserClient) {
    const { url, key } = getSupabaseEnv();
    browserClient = createBrowserClient(url!, key!);
  }

  return browserClient;
};

export const supabase = createClient();
```

### Server Client (`src/utils/supabase/server.ts`)

```typescript
export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
  if (!supabaseConnectionState.configured) return null;

  const { url, key } = getSupabaseEnv();

  return createServerClient(url!, key!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // The setAll method can be called from a Server Component.
          // This is expected when middleware handles session refresh.
        }
      },
    },
  });
};
```

---

## 2. Client-Side State → Local React Patterns

### `useState` (Component-level)

Used throughout the application for local UI state:

- **`src/app/dashboard/layout.tsx`** — `sidebarOpen` toggle
- **`src/components/dashboard/UserSidebar.tsx`** — user info, loading states, trip counts, carbon stats
- **`src/app/eco-directory/components/EcoDirectoryClient.tsx`** — search/filter state
- **`src/app/community/components/CommunityClient.tsx`** — active tab, search, filters
- All tab components (`OverviewTab`, `TripsTab`, `ProfileTab`, etc.)

### `useEffect` + Local Storage

The `UserSidebar.tsx` component persists saved trips to localStorage:

```typescript
const SAVED_TRIPS_KEY = 'terratrace_saved_trips'

useEffect(() => {
  if (typeof window === 'undefined') return
  const stored = localStorage.getItem(SAVED_TRIPS_KEY)
  let savedTrips: { id: number; ecoScore: number; status: string }[] = []
  if (stored) {
    try {
      savedTrips = JSON.parse(stored) as { id: number; ecoScore: number; status: string }[]
    } catch {
      savedTrips = []
    }
  }
  const allTrips = [...mockTrips, ...savedTrips]
  setTotalTrips(allTrips.length)
  setCarbonSaved(calculateCarbonSaved(allTrips))
}, [])
```

### No `useReducer`

All complex state is either:
- Split into multiple `useState` calls
- Pushed to Supabase/database

---

## 3. Global State → None

There are **no React Context providers** for global state. The root layout is minimal:

```tsx
// src/app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${openSans.variable}`}>
      <body className="font-body bg-background text-text antialiased">
        {children}
      </body>
    </html>
  )
}
```

No providers wrapping the tree — each component fetches what it needs directly from Supabase.

---

## 4. Middleware Handles Auth Guards

`src/middleware.ts` protects routes by:

1. Checking session on every request via `supabase.auth.getUser()`
2. Redirecting unauthenticated users to `/login`
3. Redirecting authenticated users away from auth pages
4. Blocking non-admin users from `/admin/*`

```typescript
const protectedRoutes = ['/dashboard', '/admin'];
const authRoutes = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  // ...
  const { data: { user } } = await supabase.auth.getUser();

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return Response.redirect(redirectUrl);
  }

  if (isAuthRoute && user) {
    const role = user.user_metadata?.role;
    const redirectPath = role === 'admin' ? '/admin/dashboard' : '/dashboard';
    return Response.redirect(new URL(redirectPath, request.url));
  }

  if (pathname.startsWith('/admin') && user?.user_metadata?.role !== 'admin') {
    return Response.redirect(new URL('/dashboard', request.url));
  }

  return supabaseResponse;
}
```

---

## 5. State Management Summary

| Aspect | Approach |
|--------|----------|
| Auth state | Supabase (server-client) |
| User metadata | Supabase user metadata |
| Session cookies | Supabase SSR cookie handling |
| Component state | Local `useState`/`useEffect` |
| Global app state | None — lean architecture |
| Data fetching | Direct Supabase calls per component |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Browser                             │
│  ┌─────────────────────────────────────────────────┐    │
│  │                React Components                  │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────────────┐   │    │
│  │  │useState│ │useEffect│ │ Direct Supabase  │   │    │
│  │  │        │ │         │ │ Client Calls    │   │    │
│  │  └─────────┘ └─────────┘ └─────────────────┘   │    │
│  └─────────────────────────────────────────────────┘    │
│                         │                               │
│                         ▼                               │
│  ┌─────────────────────────────────────────────────┐    │
│  │           Supabase Browser Client               │    │
│  │          (src/utils/supabase/client.ts)         │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                      Server                             │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Next.js Middleware                 │    │
│  │             (src/middleware.ts)                 │    │
│  │  • Route protection                             │    │
│  │  • Session refresh                              │    │
│  └─────────────────────────────────────────────────┘    │
│                         │                               │
│  ┌─────────────────────────────────────────────────┐    │
│  │         Supabase Server Client                   │    │
│  │       (src/utils/supabase/server.ts)            │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                      Supabase                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Auth         │  │ Database    │  │ Storage      │  │
│  │ (Sessions,   │  │ (User data, │  │ (Files,      │  │
│  │  metadata)   │  │  trips)     │  │  images)     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Key Design Decisions

1. **No centralized store** — The app is intentionally simple. Each component manages its own state or fetches directly from Supabase.

2. **No Context API** — There is no `AuthProvider` or `UserProvider` wrapping the app. Auth state lives in Supabase and is accessed per-component.

3. **Supabase as source of truth** — User data, trips, and application state are stored in Supabase, not in frontend memory.

4. **Middleware for auth gates** — Route protection is centralized in middleware rather than duplicated in each page.

5. **Client-side only persistence** — LocalStorage is used only for non-critical UI state (like saved trips) that can be reconstructed from Supabase if needed.