# Feature Implementation Status

Source feature list: `docs/WIF2003 Project Job Distribution Occ3-Team04.pdf`  
Review date: 2026-06-10

## Status Legend

- **Implemented**: Feature has working code paths wired to UI, API, auth, or persistence.
- **Partially implemented**: Feature is visible or partly functional, but uses mock/local data, lacks persistence, or does not cover the full documented behavior.
- **Not found**: No clear implementation was found in the current codebase.

## Summary

| Status | Count |
| --- | ---: |
| Implemented | 11 |
| Partially implemented | 11 |
| Not found | 0 |

## Feature Matrix

| No. | Module | Feature | Status | Evidence / Notes |
| ---: | --- | --- | --- | --- |
| 1 | General | Register new user account | Implemented | Signup UI uses `AuthForm` in `frontend/src/app/signup/page.tsx`; Supabase signup helper stores email, password, username, and role metadata in `frontend/src/utils/supabase/auth.ts`. |
| 2 | General | Login | Implemented | Login page uses the shared auth form and calls Supabase `signInWithPassword` through `frontend/src/utils/supabase/auth.ts`. |
| 3 | General | Logout | Implemented | User/admin sidebars call `signOut()` and redirect to `/login` in `frontend/src/components/dashboard/UserSidebar.tsx` and `frontend/src/components/shared/ReusableSidebar.tsx`. |
| 4 | General | Manage sessions | Implemented | Route middleware checks Supabase user state, protects `/dashboard` and `/admin`, redirects authenticated users away from auth pages, and enforces admin role routing in `frontend/src/middleware.ts`. |
| 5 | Profile Management | View profile | Implemented | Profile screen reads current Supabase user via `useUser()` and displays username, email, and role in `frontend/src/components/dashboard/ProfileTab.tsx`. |
| 6 | Profile Management | Update profile | Implemented | `useUpdateUser()` updates Supabase auth metadata; the profile tab exposes username editing and invalidates the cached user query. |
| 7 | Profile Management | Delete/Deactivate User Account | Partially implemented | UI confirmation and frontend mutation exist; backend `DELETE /api/user/account` deletes the Supabase Auth user with the service role. The modal says associated data is removed, but the backend only deletes the auth user and does not explicitly delete trips, saved places, carbon records, or other relational data. |
| 8 | Profile Management | Change password | Implemented | Profile tab validates current/new password fields, re-authenticates with the current password, then calls `supabase.auth.updateUser({ password })` through `useChangePassword()`. |
| 9 | Eco-friendly Directory Module | Sustainable Directory | Implemented | Directory UI fetches locations from backend through `useLocations()`; backend `GET /api/locations` maps Supabase `locations` rows into accommodation, dining, and transport place cards. |
| 10 | Eco-friendly Directory Module | Geo-Specific Search | Partially implemented | Directory search filters by name, city, category, and eco certificates client-side in `EcoDirectoryClient`. It supports city/town text search, but not a dedicated geo search API, radius search, map search, or coordinate filtering. |
| 11 | Eco-friendly Directory Module | Favorites System | Partially implemented | Saved sections/routes exist (`frontend/src/app/dashboard/saved/page.tsx`, `SavedTab`), and trips are saved to localStorage, but no durable favorites/bookmark implementation for directory places was found. |
| 12 | Green Itinerary Module | Itinerary Creator | Partially implemented | `TripsTab` lets users view/filter trips and includes smart recommendation UI; recommendation-derived trips can be stored in localStorage. No date-specific itinerary builder, schedule editor, or persisted itinerary model/API was found. |
| 13 | Green Itinerary Module | Smart Recommendations | Implemented | Frontend form posts city, dates, budget, and interests to `POST /api/recommendations/smart`; backend scores search candidates using eco evidence, interest fit, weather fit, and budget fit, then uses Gemini when configured with deterministic fallback. |
| 14 | Green Itinerary Module | Weather Integration | Implemented | `WeatherForecastSection` calls `GET /api/weather/forecast`; backend uses Open-Meteo geocoding and 35-day ensemble weather data and returns forecast cards filtered by selected dates. Weather context is also used by smart recommendations. |
| 15 | Carbon Footprint Module | Emission Calculator | Implemented | `frontend/src/app/carbonFootprint/page.tsx` calculates emissions for flights, cars, lodging, rail, bus, and taxi using type/class multipliers. This exceeds the documented flights, car travel, and lodging scope. |
| 16 | Carbon Footprint Module | Impact Insights | Implemented | Carbon page shows total emissions, trees/year equivalent, and category breakdown percentages after calculation. Analytics dashboard also visualizes saved carbon using `calculateCarbonSaved()`. |
| 17 | Carbon Footprint Module | Offset Integration | Implemented | Carbon page shows offset suggestions, estimated tree count, personalized reduction tips based on the largest emission source, and external carbon-credit links such as Climate Impact X, Gold Standard, and Cool Effect. |
| 18 | Community Impact Module | Eco-Reviews & Ratings | Partially implemented | Community page displays review cards with ratings, locations, practices, helpful counts, and verification flags, but all data is static in `CommunityClient`; no create/edit/rate persistence or API was found. |
| 19 | Community Impact Module | Community Challenges | Partially implemented | Community page shows static challenges, badges, progress, leaderboard, and points. There is no backend persistence, challenge enrollment, task completion, or badge-award logic. |
| 20 | Analytics and Reporting Module | Personal Impact Dashboard | Partially implemented | Analytics page shows carbon saved, trips logged, tree equivalent, transport comparison bars, and trip table, but values are based on hard-coded trip data rather than user trip history from Supabase/API. |
| 21 | Analytics and Reporting Module | Sustainability Reports | Partially implemented | Analytics page can generate monthly and annual PDF files with `jsPDF` and `jspdf-autotable`, but reports use hard-coded trip data rather than actual user/trip/carbon records. |
| 22 | Analytics and Reporting Module | Goal Setting | Partially implemented | Analytics page displays an annual carbon budget, monthly usage progress, remaining budget, and alert states, but the budget is hard-coded and cannot be user-set or persisted. |

## Additional Implemented Capabilities Found

These are not separate rows in the PDF feature table, but they support or extend the documented scope:

- Eco route planning is implemented through `frontend/src/components/eco-route-planner-section.tsx` and `backend/src/routes/eco-route.ts`, including geocoding, current-location support, walking/cycling/driving route comparisons, OpenRouteService ETAs, and CO2 estimates.
- Directory details and related place recommendations are implemented through `GET /api/locations/:publicId` and `GET /api/locations/recommendations`.
- Admin pages exist for dashboard, destinations, users, and analytics under `frontend/src/app/admin`, protected by role-aware middleware.

## Main Gaps

- Several user-specific features are not persisted beyond Supabase Auth metadata or browser localStorage.
- Community reviews/challenges are static display data and do not yet support real user contribution workflows.
- Analytics, reports, and goal-setting are functional UI prototypes, but they are not connected to real trip/carbon data.
- Account deletion removes the Supabase Auth user, but no explicit cleanup of associated application data was found.
