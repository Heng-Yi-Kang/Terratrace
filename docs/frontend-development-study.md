# Terratrace Frontend Development Study

This study documents the current Terratrace frontend implementation in `frontend/`. It describes how the UI is built today, where state and routing live, and which implementation details matter when extending or testing the app.

## Tech Stack

The frontend is a Next.js App Router application using:

| Area | Implementation |
| --- | --- |
| Framework | Next.js 15.5 with `src/app` App Router |
| UI runtime | React 19 and TypeScript |
| Styling | Tailwind CSS 3.4, `frontend/src/app/globals.css`, `frontend/tailwind.config.ts` |
| Server/client data | TanStack Query 5 with `QueryProvider` and selected server prefetch/hydration |
| Motion | Framer Motion on auth forms; CSS keyframes and IntersectionObserver on public landing sections |
| Icons | Mostly Lucide React in dashboard/places/community, with several local inline SVG icon sets |
| PDF export | `jspdf` and `jspdf-autotable` in dashboard analytics |
| Testing | Vitest, Testing Library, jsdom, MSW |

`frontend/src/app/layout.tsx` defines the root metadata, loads Poppins and Open Sans through `next/font/google`, applies the Tailwind theme classes to `<body>`, and wraps the app in `QueryProvider`.

## UI/UX Direction

Terratrace's live UI is built around sustainable travel: glassy white cards, emerald/cyan environmental colors, rounded organic surfaces, and lightweight motion. The main visual language appears in:

- Public landing page: fixed glass navbar, animated hero, stat counters, scroll reveal sections, eco route planner and weather sections.
- Auth pages: compact centered cards, Poppins/Open Sans hierarchy, Framer Motion entrance animation, shared password field.
- Dashboard: dense SaaS-style layout with a persistent cyan sidebar, content panels, KPI cards, filters, tables, and workflow tabs.
- Admin: separate sidebar built on `ReusableSidebar`, cyan photo/gradient background, and admin-specific tab pages.
- Community: emerald background, tab switcher for reviews/challenges, badge and leaderboard modules.

The documented design system in `design-system/terratrace/MASTER.md` does not exactly match the live token implementation:

| Token role | Master design doc | Live CSS/Tailwind |
| --- | --- | --- |
| Primary | `#0891B2` cyan | `#059669` emerald |
| Secondary | `#22D3EE` cyan | `#10B981` emerald |
| CTA | `#22C55E` green | `#FBBF24` yellow |
| Background | `#ECFEFF` pale cyan | `#ECFDF5` pale green |
| Text | `#164E63` cyan text | `#064E3B` green text |

The live frontend still uses cyan heavily, especially in sidebars and dashboard accents, but primary action styling has shifted toward emerald/yellow. `globals.css` also defines organic radii, glass cards, scroll reveal classes, reduced-motion handling, and animation helpers. `tailwind.config.ts` mirrors the live colors and adds `rounded-organic`, `rounded-organic-lg`, organic shadows, and font families.

## Routing

Routes are implemented directly in `frontend/src/app`. There are no explicit route groups in directory names; the app is organized by public pages, auth pages, dashboard pages, admin pages, and feature pages.

### Public And Auth Routes

| Route | File | Rendering and behavior |
| --- | --- | --- |
| `/` | `frontend/src/app/page.tsx` | Client landing page with local animation hooks, public navbar, and links to auth/smart recommendation. |
| `/login` | `frontend/src/app/login/page.tsx` | Client auth page; calls `signIn`, clears React Query cache, seeds `['user']`, then uses `router.push` and `router.refresh`. |
| `/signup` | `frontend/src/app/signup/page.tsx` | Client auth page; calls `signUp`, then same query cache and redirect pattern as login. |
| `/smart-recommendation` | `frontend/src/app/smart-recommendation/page.tsx` | Server wrapper returning the client `SmartRecommendationSection`. |
| `/carbonFootprint` | `frontend/src/app/carbonFootprint/page.tsx` | Server wrapper returning client carbon calculator view. |
| `/carbonFootprint/history` | `frontend/src/app/carbonFootprint/history/page.tsx` | Client history view that checks current user and fetches saved carbon entries. |
| `/community` | `frontend/src/app/community/page.tsx` | Redirects to `/dashboard/community`. |
| `/todos` | `frontend/src/app/todos/page.tsx` | Protected by middleware; server wrapper around client todos list. |
| `/eco-directory` | `frontend/src/middleware.ts` | Legacy path handled in middleware; redirects authenticated users into `/dashboard/overview/places`. |

### Protected User Routes

| Route | File | Main component |
| --- | --- | --- |
| `/dashboard` | `frontend/src/app/dashboard/page.tsx` | Server redirect to `/dashboard/overview`. |
| `/dashboard/overview` | `frontend/src/app/dashboard/overview/page.tsx` | `OverviewTab`. |
| `/dashboard/overview/places` | `frontend/src/app/dashboard/overview/places/page.tsx` | Server prefetch + hydration, then `PlacesClient`. |
| `/dashboard/overview/places/[placeName]` | `frontend/src/app/dashboard/overview/places/[placeName]/page.tsx` | Server fetch of one place, then detail UI. |
| `/dashboard/trips` | `frontend/src/app/dashboard/trips/page.tsx` | `TripsTab`. |
| `/dashboard/carbon` | `frontend/src/app/dashboard/carbon/page.tsx` | `CarbonTab`. |
| `/dashboard/carbonHistory` | `frontend/src/app/dashboard/carbonHistory/page.tsx` | Reuses carbon footprint history page. |
| `/dashboard/analytics` | `frontend/src/app/dashboard/analytics/page.tsx` | Client analytics/reporting page with PDF export. |
| `/dashboard/community` | `frontend/src/app/dashboard/community/page.tsx` | Reuses `CommunityClient`. |
| `/dashboard/saved` | `frontend/src/app/dashboard/saved/page.tsx` | `SavedTab`. |
| `/dashboard/profile` | `frontend/src/app/dashboard/profile/page.tsx` | `ProfileTab`. |

`frontend/src/app/dashboard/layout.tsx` owns the responsive dashboard shell. It is a client component because it manages mobile sidebar state. `UserSidebar` reads the current pathname, user query, trips query, and local-trip import side effect; tab changes use `router.push('/dashboard/${tab}')`.

### Admin Routes

| Route | File | Main component |
| --- | --- | --- |
| `/admin/dashboard` | `frontend/src/app/admin/dashboard/page.tsx` | `AdminDashboardTab`. |
| `/admin/users` | `frontend/src/app/admin/users/page.tsx` | `UsersTab`. |
| `/admin/destinations` | `frontend/src/app/admin/destinations/page.tsx` | `DestinationsTab`. |
| `/admin/analytics` | `frontend/src/app/admin/analytics/page.tsx` | `AnalyticsTab`. |

`frontend/src/app/admin/layout.tsx` owns the admin shell and mobile sidebar state. It derives the active tab from `usePathname`, but tab changes use `window.location.href = '/admin/${tab}'`, unlike the user dashboard, which uses App Router navigation.

## Auth And Route Guards

`frontend/src/middleware.ts` protects `/dashboard`, `/admin`, and `/todos` using a JWT stored in `terratrace_session` by default, or `SESSION_COOKIE_NAME` when configured. The middleware verifies the JWT with `JWT_SECRET`, checks expiry, and redirects unauthenticated users to `/login?redirectTo=...`.

Additional guard behavior:

- `/login` and `/signup` redirect signed-in users to `/admin/dashboard` or `/dashboard` based on role.
- `/admin/*` redirects non-admin users to `/dashboard`.
- `/eco-directory` requires a user and then redirects into `/dashboard/overview/places`.

Client auth helpers live in `frontend/src/utils/supabase/auth.ts`, but they call the Terratrace backend API rather than the Supabase client directly. The API base is `NEXT_PUBLIC_API_BASE_URL`, falling back to `NEXT_PUBLIC_API_URL` or `http://localhost:3001` depending on helper. Requests use `credentials: 'include'` so cookie-backed sessions work across client fetches.

### Middleware

The frontend uses Next.js middleware in `frontend/src/middleware.ts` as the first routing layer before protected pages render. It is not a UI component; it runs during request handling and returns either `NextResponse.next()` or a redirect.

Middleware responsibilities:

- Read the session cookie. The cookie name defaults to `terratrace_session`, with `SESSION_COOKIE_NAME` available as an environment override.
- Verify the JWT signature with `JWT_SECRET` using the Web Crypto HMAC SHA-256 API.
- Decode the JWT payload and reject expired sessions by checking `exp`.
- Protect `/dashboard`, `/admin`, and `/todos` from unauthenticated access.
- Preserve the intended path for unauthenticated users by redirecting to `/login?redirectTo=<path>`.
- Redirect authenticated users away from `/login` and `/signup` to either `/admin/dashboard` or `/dashboard`.
- Enforce admin-only access for `/admin/*` by redirecting non-admin users to `/dashboard`.
- Support the legacy `/eco-directory` path by redirecting signed-in users to `/dashboard/overview/places` while preserving search parameters.

The middleware matcher excludes Next.js static assets, optimized images, favicon, API routes, and common image file extensions:

```ts
matcher: ['/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
```

This keeps route guarding focused on page navigation. API authorization is still expected to be enforced by the backend because middleware only protects frontend route access and does not validate permissions for backend endpoints.

## Client-Side Scripting

Client-side scripting in Terratrace means JavaScript/TypeScript that runs in the user's browser after the page is loaded. In this Next.js App Router codebase, files that start with `'use client'` are the main client-side scripting surfaces. They can use React state, effects, event handlers, browser APIs, and client navigation.

Examples in the current frontend:

- `frontend/src/app/page.tsx` uses browser-side scripting for scroll reveal behavior, count-up animations, typed text animation, and public landing page interactions.
- `frontend/src/components/auth/AuthForm.tsx` handles input state, validation, loading state, and submit events in the browser before delegating login/signup to page-level handlers.
- `frontend/src/app/dashboard/layout.tsx`, `frontend/src/components/dashboard/UserSidebar.tsx`, and `frontend/src/app/admin/layout.tsx` use client state for responsive sidebar toggles and navigation actions.
- `frontend/src/app/dashboard/overview/places/components/PlacesClient.tsx` reads URL search parameters, updates filters with `router.replace`, paginates results, clears filters, and scrolls after page changes.
- `frontend/src/components/smart-recommendation-section.tsx` manages form fields, interest selection, API submission, result rendering, and optional trip saving.
- `frontend/src/app/carbonFootprint/CarbonFootprintView.tsx` keeps trip calculation input and result state in the browser, then scrolls to impact insights after a calculation.
- Hooks such as `useTrips`, `useFavourites`, `useTodos`, and `useCommunity` perform browser-side API calls through React Query and invalidate cached data after mutations.

Client-side scripting is required when the feature depends on user interaction, browser-only APIs such as `window`, `localStorage`, `IntersectionObserver`, or `requestAnimationFrame`, or React hooks like `useState` and `useEffect`. Server components are still used where browser interactivity is not needed, such as thin route wrappers, redirects, and the places server prefetch/hydration entry point.

## Component Architecture

### Public Landing

`frontend/src/app/page.tsx` is a large client component containing:

- `Navbar`, hero, stats, feature sections, and inline SVG icon helpers.
- `useCountUp` for stat animation using `requestAnimationFrame`.
- `useScrollAnimation` for CSS class-based reveal behavior through `IntersectionObserver`.
- Imports for `EcoRoutePlannerSection` and `WeatherForecastSection`.

The page owns visual state locally and does not use React Query.

### Auth

`AuthForm` owns form input state, client validation, loading, and error display. It receives an async `onSubmit` prop, which lets login and signup pages own backend calls and redirects. `PasswordField` is shared for password inputs.

### Dashboard

Dashboard route pages are thin wrappers around tab components under `frontend/src/components/dashboard`.

Important ownership:

- `UserSidebar` owns active-tab detection, sign-out, count-up sidebar stats, and triggers `useImportLocalTrips`.
- `TripsTab` manages saved trip CRUD through `useTrips`, `useCreateTrip`, `useUpdateTrip`, and `useDeleteTrip`.
- `SavedTab` uses favourites hooks for authenticated and local storage-backed saved places.
- `ProfileTab` uses user update, password change, and delete-account mutations.
- `CarbonTab` embeds the carbon calculator workflow.
- `Dashboard analytics` owns analytics fetch state, goal form state, report generation, and PDF export.

### Admin

Admin pages are also thin wrappers around tab components under `frontend/src/components/admin`. `AdminLayout` supplies shared navigation using `ReusableSidebar`. The admin sidebar uses inline SVGs rather than Lucide icon components, which is one source of icon style variation.

### Places Directory

The places directory has the clearest server/client split:

- `frontend/src/app/dashboard/overview/places/page.tsx` is a server component. It reads `searchParams`, normalizes filters, prefetches `['locations', normalizedFilters]`, and wraps the client view in `HydrationBoundary`.
- `PlacesClient` is a client component. It reads `useSearchParams`, keeps pagination state, updates filters with `router.replace(..., { scroll: false })`, and fetches places/cities with React Query hooks.
- `frontend/src/app/dashboard/overview/places/[placeName]/page.tsx` is a server component that decodes the route slug, fetches one place by ID with `cache: 'no-store'`, calls `notFound()` when missing, and renders `PlaceHero`, detail cards, Google Maps/booking links, and `MorePlaces`.

### Community

`CommunityClient` owns tab state (`reviews` or `challenges`) and review category filter state. It queries reviews, challenges, badges, leaderboard, and summary through `frontend/src/hooks/useCommunity.ts`. Mutations invalidate the relevant community query prefixes after creating/updating reviews, toggling helpful state, joining challenges, or updating challenge progress.

### Carbon Footprint

`CarbonFootprintView.tsx` owns the current trip input list and calculated result. It passes state into `CarbonCalculator`, scrolls to the impact section after calculation, then renders `ImpactInsights` and `CarbonOffset`. History is a separate client page that fetches current user and carbon records imperatively.

### Smart Recommendation

`SmartRecommendationSection` is a client component that owns all form fields, loading/error/result state, and optional save status. It posts to `/api/recommendations/smart`, derives an eco score from shortlisted candidate scoring, and can save a recommendation as a `TripPayload` through the optional `onSaveTrip` callback. Local trip migration support lives in `useTrips`, where legacy recommendation trips from `localStorage` are converted and imported via `/api/trips/import-local`.

## Data Flow

`QueryProvider` creates one `QueryClient` per browser session and enables React Query Devtools. Defaults are centralized in `frontend/src/lib/queryClient.ts`:

- Query stale time: 5 minutes by default.
- Query garbage collection: 10 minutes by default.
- Refetch on window focus: enabled.
- Retry: one retry with exponential backoff.
- Mutation errors are logged globally.

Most feature hooks follow the same pattern:

- Build API URLs from `NEXT_PUBLIC_API_BASE_URL` with a local fallback in several files.
- Include cookies with `credentials: 'include'`.
- Use React Query keys scoped by feature and, when needed, user ID.
- Invalidate related queries after mutations.

Notable query keys:

| Feature | Query keys |
| --- | --- |
| User | `['user']` |
| Trips | `['trips', user?.id]` |
| Favourites | `['favourites', user?.id]` or `['favourites', 'local']` |
| Locations | `['locations', normalizedFilters]`, `['locations', 'cities']` |
| Todos | `['todos']` |
| Community | `['community', 'reviews', category]`, `['community', 'challenges']`, `['community', 'badges']`, `['community', 'leaderboard']`, `['community', 'summary']` |

The frontend mixes declarative React Query data flow with imperative `useEffect` fetches in analytics and carbon history. This is acceptable in the current implementation, but it is a useful distinction when adding tests or deciding where cache invalidation should happen.

## Testing Coverage

Existing Vitest coverage targets the main units and feature flows:

- Auth: `AuthForm`, login page, signup page.
- Dashboard: profile tab, trips tab, user sidebar, analytics page.
- Smart recommendation and weather forecast sections.
- Hooks: user, trips, favourites, community.
- Carbon: calculation utilities, carbon API utilities, carbon offset, impact insights.
- Places filters: `locationFilters`.

MSW setup lives under `frontend/src/test/mocks`, with `frontend/src/test/setup.ts` configured through `frontend/vitest.config.ts`.

Because this is a documentation-only change, no automated test is required for the new markdown file. For future frontend work, the current test suite is strongest around hooks and form-like components; full route-shell behavior and places hydration are less directly covered.

## Strengths And Risks

Strengths:

- The app has a clear user/admin/dashboard split and thin route files for most protected pages.
- Shared React Query defaults and feature hooks keep most backend access predictable.
- Places uses a strong App Router pattern: server prefetch, hydration, URL-backed filters, and client pagination.
- The design direction is recognizable and consistent enough across public, auth, dashboard, and community surfaces.
- Accessibility basics are present in several places, including labels, aria current state, aria labels, focus rings, and reduced-motion CSS.

Risks and maintenance notes:

- The master design system and live tokens disagree on primary/secondary/CTA colors, so future UI work should treat `globals.css` and `tailwind.config.ts` as the source of truth unless the design system is updated.
- Icon usage is inconsistent: Lucide is used in many dashboard and places components, while landing, auth, admin, carbon, and analytics include local inline SVGs.
- Several large client components own many concerns at once, especially `frontend/src/app/page.tsx`, `SmartRecommendationSection`, `UserSidebar`, and dashboard analytics.
- Navigation is not uniform. The app uses `Link`, `router.push`, `router.replace`, `redirect`, and `window.location.href`; this affects prefetching, history behavior, refresh behavior, and test setup.
- API base URL fallback behavior differs by helper. Some hooks require `NEXT_PUBLIC_API_BASE_URL`; others fall back to `http://localhost:3001` or also consider `NEXT_PUBLIC_API_URL`.
- Some feature pages use imperative effects instead of React Query, so loading/error/cache behavior differs from the rest of the app.
