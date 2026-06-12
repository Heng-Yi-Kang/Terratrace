# TerraTrace Presentation Slide Outline

## Slide 1: Title, Features, and Task Distribution

**Title:** TerraTrace - Eco-Friendly Travel Planner  
**Course:** WIF2003 Web Programming, Semester 2 2025/2026  
**Group:** OCC3 G4

**Core Features:**
- Profile Management: sign up, login, logout, session management, profile update, password change, account deletion.
- Eco-Friendly Directory: sustainable destination directory, geo-specific search, favourites system.
- Green Itinerary: itinerary planner, smart recommendations, weather integration.
- Carbon Footprint: emission calculator, impact insights, offset integration.
- Community Impact: eco reviews, ratings, community challenges.
- Analytics and Reporting: personal impact dashboard, sustainability reports, goal settings.

**Task Distribution:**
- Heng Yi Kang: General and Profile Management.
- Yong Yung Kang: Eco-Friendly Directory.
- Wong Wei Li: Green Itinerary.
- Nurul Farzana Binti Anuar: Carbon Footprint.
- Aqil Amani Bin Misni: Community Impact.
- Nur Alisya Qistina Binti Mohd Hazli: Analytics and Reporting.

**Suggested Visual:** TerraTrace logo or homepage screenshot with a compact feature/team table.

## Slide 2: Project Overview and Objectives

**Main Idea:**
- TerraTrace is an eco-friendly travel planner web application.
- It helps users plan sustainable journeys while increasing environmental awareness.
- The system combines travel planning, green destination discovery, carbon tracking, community engagement, and reporting.

**Objectives:**
- Help users discover sustainable destinations and travel options.
- Support itinerary planning with smart recommendations and weather context.
- Allow users to calculate and monitor travel carbon emissions.
- Encourage eco-friendly travel behavior through community features.
- Provide sustainability analytics and reports for personal impact tracking.

**Quality Focus:**
- Performance efficiency, usability, reliability, security, compatibility, maintainability, and responsive design.

**Suggested Visual:** Simple system overview diagram showing users connected to directory, itinerary, carbon, community, and analytics modules.

## Slide 3: Frontend Technology and UI/UX Design

**Frontend Stack:**
- Next.js 15.5 with App Router.
- React 19 and TypeScript.
- Tailwind CSS 3.4 for styling.
- TanStack Query 5 for client/server data flow.
- Framer Motion, CSS animations, and IntersectionObserver for interactive UI effects.
- Lucide React icons and jsPDF export for analytics reports.

**UI/UX Direction:**
- Sustainable travel visual identity using emerald/cyan environmental colors.
- Public landing page with animated hero, route planner, weather section, and scroll reveal content.
- Auth pages with compact centered cards and motion transitions.
- Dashboard with sidebar navigation, KPI cards, filters, tables, and workflow tabs.
- Community page with reviews, challenges, badges, and leaderboard.

**Suggested Visual:** Screenshots of landing page, auth page, and dashboard layout.

## Slide 4: Frontend Routing, Authentication, and Data Flow

**Routing Structure:**
- Public routes: `/`, `/login`, `/signup`, `/smart-recommendation`, `/carbonFootprint`.
- Protected user routes: `/dashboard`, `/dashboard/overview`, `/dashboard/trips`, `/dashboard/carbon`, `/dashboard/profile`, `/dashboard/analytics`.
- Admin routes are protected separately with role-aware access.

**Route Guards:**
- Next.js middleware protects dashboard, admin, and todo routes.
- JWT is read from the `terratrace_session` cookie.
- Unauthenticated users are redirected to login with the intended path preserved.
- Admin-only pages redirect non-admin users to the dashboard.

**Client-Side Data Flow:**
- React Query caches user, trips, favourites, locations, todos, and community data.
- Server components are used for redirects and selected prefetch/hydration.
- Client components handle forms, filters, pagination, local storage migration, and interactive dashboards.

**Suggested Visual:** Route map or flow diagram from login to dashboard features.

## Slide 5: Backend Architecture and Authentication

**Backend Stack:**
- Node.js and Express.js API written in TypeScript.
- PostgreSQL persistence through the `pg` package.
- No ORM; routes use direct parameterized SQL.
- Docker Compose runs PostgreSQL 16 locally.
- Vitest supports backend testing.

**Application Entry:**
- `backend/src/index.ts` starts the server.
- `backend/src/app.ts` builds the Express app with CORS, JSON parsing, cookie parsing, routes, and error handling.
- `createApp()` supports integration tests without opening a real network listener.

**Authentication:**
- Local auth is implemented with bcrypt password hashes and JWT sessions.
- Session cookie defaults to `terratrace_session`.
- `requireAuth` middleware verifies tokens and attaches the current user.
- Protected routes scope user-owned data by `req.user.id`.

**Suggested Visual:** Backend request lifecycle: frontend request -> Express route -> auth middleware -> PostgreSQL.

## Slide 6: Backend Feature Logic and External Integrations

**Server-Side Feature Logic:**
- Carbon calculator handles flight, car, hotel, rail, bus, and taxi emissions.
- Analytics computes baselines, saved carbon, tree equivalents, summaries, and goal progress.
- Trips API stores parent trips and itinerary items in transactions.
- Locations API supports directory listing, filtering, details, and same-category recommendations.
- Favourites and todos are authenticated user-owned resources.
- Community API supports reviews, helpful votes, challenges, badges, leaderboard, and summary statistics.

**Smart Recommendation Flow:**
- Validates city, dates, budget, and interests.
- Uses weather context, search candidates, eco scoring, budget fit, and interest match.
- Uses Gemini when available and falls back to deterministic recommendations when needed.

**External Integrations:**
- Gemini for recommendations and carbon suggestions.
- DuckDuckGo HTML search for recommendation candidates.
- Open-Meteo for geocoding and weather forecasts.
- OpenRouteService and Nominatim for eco-route planning.
- Foursquare, Unsplash, Supabase, and OpenStreetMap/Overpass for data seeding/import.

**Suggested Visual:** Integration diagram showing backend connected to external APIs.

## Slide 7: Database Design

**Database Overview:**
- PostgreSQL is the main persistence layer.
- Schema is defined in `db/init/001_schema.sql`.
- Database stores authentication, eco-directory data, favourites, carbon history, trips, todos, analytics goals, and community engagement.

**Main Tables by Domain:**
- Authentication and profile: `users`.
- Eco Directory: `locations`, `user_favourites`.
- Carbon tracking and analytics: `carbon_entries`, `carbon_budget_goals`.
- Itinerary planning: `todos`, `trips`, `trip_items`.
- Community: `community_reviews`, `community_review_helpful`, `community_badges`, `community_challenges`, `community_challenge_progress`, `community_user_badges`.

**Integrity Design:**
- Foreign keys and cascade rules for user-owned data.
- Unique constraints prevent duplicate emails, duplicate favourites, and duplicate imported trips.
- Check constraints validate roles, statuses, day parts, ratings, goals, and challenge values.
- Indexes support login lookup, directory filtering, saved places, carbon history, trip ordering, and community views.

**Suggested Visual:** Entity relationship diagram or simplified table relationship map.

## Slide 8: Unit and Functional Testing

**Unit Testing Coverage:**
- General and authentication module.
- Profile management hooks and mutations.
- Eco-directory filters, cards, search, details, and favourites.
- Green itinerary payload conversion and trip handling.
- Carbon calculation utilities and emission logic.
- Community hooks and helpful vote behavior.
- Analytics trip impact calculations.

**Functional Testing Coverage:**
- Registration, login, logout, and validation.
- Profile display, update, password change, and account deletion.
- Directory cards, search filters, details, and recommendations.
- Guest and authenticated favourites.
- Trip creation, editing, deletion, and itinerary items.
- Smart recommendations, weather forecast, carbon calculator, community features, and analytics reports.

**Key Result:**
- 100 automated unit tests were executed successfully across frontend and backend workspaces.

**Suggested Visual:** Testing coverage matrix by module.

## Slide 9: Integration, API, Database, and Route Testing

**Integration Testing:**
- Covered authentication/profile, eco-directory, favourites, community, analytics, and reporting.
- Implemented paths exist for itinerary, recommendation, weather, carbon, route planning, and admin modules.
- Future priority is to automate more implemented cross-layer scenarios.

**API Testing:**
- Auth API: signup, duplicate signup, login, invalid login.
- Current-user and profile APIs.
- Favourites, carbon, analytics, weather, recommendations, and community routes.
- Expected responses and actual results were validated as pass.

**Database and Integrity Testing:**
- PostgreSQL testing used transaction isolation with savepoints and rollback.
- Verified CRUD behavior, duplicate prevention, validation rules, schema constraints, and relationships.
- Protected route testing confirmed guests and invalid sessions are blocked from restricted pages and APIs.

**Suggested Visual:** Pass-rate summary or layered test pyramid.

## Slide 10: Screenshots, Demonstration Flow, and Conclusion

**Screenshots to Include:**
- Signup and login.
- Dashboard overview.
- Profile management.
- Eco-directory search and place details.
- Saved favourites.
- Trip planner and smart recommendation.
- Weather forecast.
- Carbon calculator, history, insights, and offsets.
- Community reviews/challenges.
- Analytics dashboard and report generation.

**Suggested Demonstration Flow:**
1. Register or log in.
2. Search for sustainable places and save a favourite.
3. Create a trip or generate a smart recommendation.
4. Calculate carbon footprint and view insights.
5. Check analytics/reporting and community impact features.

**Conclusion:**
- TerraTrace delivers a full-stack sustainable travel planning platform.
- The system combines modern frontend design, Express/PostgreSQL backend logic, relational data integrity, external API integrations, and broad testing coverage.
- Main improvement area: expand automated integration tests for implemented itinerary, recommendation, weather, carbon, route, and admin flows.

**Suggested Visual:** Final collage of key UI screenshots plus a short closing statement.
