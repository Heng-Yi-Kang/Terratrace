# Terratrace Backend Study

## Backend Stack

Terratrace's backend is a Node.js workspace located in `backend/`. It is implemented as an Express.js API written in TypeScript and compiled with `tsc`. Development runs through `nodemon` and `ts-node`, while production startup uses the compiled `dist/index.js` entry point.

Persistence is PostgreSQL accessed through the `pg` package. The project does not use an ORM; route handlers and utility modules issue plain parameterized SQL through a shared connection pool. Local database development is supported by Docker Compose, which starts a PostgreSQL 16 container on host port `5433` and mounts `db/init` as the initialization directory.

The main backend dependencies are Express, CORS, cookie parsing, bcrypt password hashing, JSON Web Tokens, PostgreSQL, Axios, Nano ID, Google Gemini, and Unsplash tooling. Vitest is configured for Node-based backend tests under `backend/src`.

External services appear in two areas:

- Runtime API routes call Gemini, OpenRouteService, Open-Meteo, Nominatim, and DuckDuckGo HTML search.
- Seed/import scripts can load location data from Supabase, Foursquare Places, Unsplash, Gemini-generated descriptions, and OpenStreetMap/Overpass.

## Runtime and Application Entry

`backend/src/index.ts` is the runtime entry point. It loads environment variables, imports the Express application, reads `PORT` with a default of `3001`, and starts listening.

`backend/src/app.ts` owns application construction through `createApp()`. This function configures:

- CORS with `credentials: true` and `CORS_ORIGIN`, defaulting to `http://localhost:3000`.
- JSON and URL-encoded body parsing.
- Cookie parsing for session cookies.
- Health and root API responses at `/health` and `/api`.
- Route mounting under `/api/*`.
- A final 404 JSON handler.
- A global error handler that logs the stack and returns a generic 500 response.

The exported `createApp()` is important for tests because integration tests can construct an app without opening a network listener. The default export is the configured app instance used by `index.ts`.

The mounted route groups are:

- `/api/weather`
- `/api/recommendations`
- `/api/eco-route`
- `/api/auth`
- `/api/carbon`
- `/api/locations`
- `/api/favourites`
- `/api/todos`
- `/api/trips`
- `/api/user`
- `/api/community`
- `/api/analytics`

## Database Layer

`backend/src/utils/db.ts` is deliberately small. It loads environment variables, reads `DATABASE_URL`, creates a `pg.Pool`, exports that pool, and exposes a typed `query()` helper that delegates to `pool.query()`.

Most database behavior is expressed in SQL close to the feature route. The schema in `db/init/001_schema.sql` defines the core tables:

- `users`
- `locations`
- `user_favourites`
- `carbon_entries`
- `carbon_budget_goals`
- `todos`
- `trips`
- `trip_items`
- `community_reviews`
- `community_review_helpful`
- `community_badges`
- `community_challenges`
- `community_challenge_progress`
- `community_user_badges`

The schema uses PostgreSQL constraints for integrity:

- `users.role` is constrained to `user` or `admin`.
- Email uniqueness is enforced case-insensitively through an index on `lower(email)`.
- Favourites are unique per `(user_id, location_id)`.
- Carbon budget goals are unique per `(user_id, year)`.
- Trip dates must satisfy `start_date <= end_date`.
- Trip status, source, day part, challenge category, ratings, scores, and progress all have check constraints.
- Foreign keys use cascades where user-owned data should be removed with the user.

Indexes target common access paths such as user-owned carbon history, favourites, trips by start date, trip item ordering, location category/city filtering, community review sorting, and leaderboard/progress lookups.

## Authentication and Authorization

Authentication is implemented locally rather than through Supabase Auth. The `users` table stores email, username, role, and a bcrypt password hash.

`backend/src/utils/auth.ts` contains the session primitives:

- Passwords are hashed with bcrypt at cost 12.
- Password verification only accepts bcrypt-style hashes.
- User IDs are generated with `crypto.randomUUID()`.
- JWTs are signed with `JWT_SECRET` and default to a seven-day expiry unless `JWT_EXPIRES_IN` is set.
- The session cookie name defaults to `terratrace_session`, overridable with `SESSION_COOKIE_NAME`.
- Session cookies are HTTP-only, `sameSite: 'lax'`, scoped to `/`, and marked secure in production.
- Tokens can be read from the session cookie or from `Authorization: Bearer ...`.

`backend/src/middleware/auth.ts` provides `requireAuth`. It reads the token, verifies it, attaches the session user to `req.user`, and rejects missing or invalid sessions with 401 responses.

The auth route supports:

- `POST /api/auth/signup`: validates email/password, hashes the password, inserts a user, creates a JWT session, sets the session cookie, and returns a Supabase-like `data.user` and `data.session.access_token` shape.
- `POST /api/auth/login`: finds a user case-insensitively by email, verifies the password, and returns the same session shape.
- `POST /api/auth/logout`: clears the session cookie.
- `GET /api/auth/me`: returns the current user from the database.
- `PATCH /api/auth/me`: updates username and refreshes the JWT cookie.
- `PATCH /api/auth/password`: verifies the current password before storing a new hash.

Protected routes consistently scope user-owned SQL by `req.user!.id`. Examples include carbon history, analytics, favourites, todos, trips, account deletion, reviews authored by the user, and challenge progress.

## Server-Side Logic by Feature

### Carbon Calculation

`backend/src/utils/carbonCalculator.ts` calculates emissions for flight, car, hotel, rail, bus, and taxi inputs. Each travel type has fixed multipliers, and `CalcTotal()` aggregates category totals plus an overall total.

`POST /api/carbon/calculate` validates trip inputs, calculates totals, and optionally persists a `carbon_entries` row when the request contains a valid session token. The route does not require authentication for calculation, but authenticated users get history persistence.

`GET /api/carbon/history`, `GET /api/carbon/summary`, and `DELETE /api/carbon/entries/:id` require authentication and filter by the current user. The summary endpoint returns rounded totals, calculation count, biggest trip, average trip, and raw entries.

`POST /api/carbon/suggestions` identifies the highest-emission source and tries to generate reduction suggestions with Gemini. If Gemini is unavailable or returns invalid output, the route returns deterministic fallback suggestions.

### Analytics and Goals

`backend/src/routes/analytics.ts` exposes authenticated impact and carbon budget endpoints. The impact endpoint reads carbon entries for the user, optionally filtered to the current month or year, and delegates summary construction to `backend/src/utils/analytics.ts`.

The analytics utility estimates a baseline for each trip type, compares it to actual emissions, computes saved kilograms, derives a tree equivalent, groups results by method, and builds over-time points.

The goal endpoints read and upsert annual budget goals in `carbon_budget_goals`. `PUT /api/analytics/goal` uses `on conflict (user_id, year)` to update an existing goal for the same year.

### Trips and Itinerary Items

`backend/src/routes/trips.ts` applies `requireAuth` to the entire router. It validates date ranges, status, source, eco score, and itinerary items. It normalizes text, optional numbers, interests, day parts, and linked location IDs.

Trip reads join `trips`, `trip_items`, and `locations`, then map flattened SQL rows into nested trip objects with item arrays and optional place summaries.

Trip creation and updates use explicit PostgreSQL transactions through a pooled client. A trip write inserts or updates the parent row and replaces all itinerary items inside the same transaction. This keeps the parent trip and its child items consistent.

The `import-local` endpoint accepts multiple locally stored trips, handles duplicate `sourceRequestId` values, imports valid trips, and returns both imported and failed items.

### Eco Directory and Locations

`backend/src/routes/locations.ts` is the public Eco Directory backend. It supports:

- Listing locations with optional text, city, and category filters.
- Listing distinct cities.
- Returning same-category recommendations in a city while excluding the current public ID.
- Fetching a single location by `public_id`.

The route maps database rows into frontend `Place` objects through `mapDbLocationToPlace()`. That mapping normalizes category casing, converts latitude and longitude to numbers, exposes eco certifications and tags as arrays, carries image fields, and builds a Google search fallback booking URL.

### Favourites and Todos

`backend/src/routes/favourites.ts` is fully authenticated. It joins `user_favourites` to `locations`, maps saved locations through the same Eco Directory mapper, and returns favourite metadata such as `favouriteId` and `savedAt`. Inserts rely on the database uniqueness constraint to reject duplicate favourites.

`backend/src/routes/todos.ts` is also fully authenticated. It provides small CRUD operations over the `todos` table and filters every read, update, and delete by `user_id`.

### Profile and Account Deletion

`backend/src/routes/user.ts` currently implements account deletion. It starts a transaction, deletes the authenticated user row, relies on foreign-key cascades for associated data, commits, clears the session cookie, and returns a success response.

### Community

`backend/src/routes/community.ts` implements reviews, helpful votes, challenges, badges, leaderboard, and summary statistics.

Some community reads use optional authentication. If a valid token is present, the response includes viewer-specific fields such as whether the viewer marked a review helpful, can edit a review, joined a challenge, earned a badge, or appears in the leaderboard. Invalid optional tokens are ignored for public reads.

Authenticated community writes include:

- Creating and editing reviews owned by the current user.
- Marking and unmarking reviews as helpful.
- Joining challenges.
- Updating challenge progress.

Challenge progress updates use a transaction. When progress reaches the challenge total, the route records completion and awards the associated badge with `on conflict do nothing`.

### Eco Route Planning

`backend/src/routes/eco-route.ts` provides public route-planning helpers. It uses Nominatim for geocoding and reverse geocoding, and OpenRouteService for walking, cycling, and driving routes.

`GET /api/eco-route/search-location` and `GET /api/eco-route/search-destination` return Nominatim suggestions for a text query. `POST /api/eco-route/plan` requires start and destination coordinates, fetches all three travel-mode routes in parallel, estimates driving emissions with a fixed `0.21 kg/km` factor, sorts options by estimated emissions, and returns the greener choice plus route notes.

### Weather

`backend/src/routes/weather.ts` proxies forecast data from Open-Meteo. It geocodes a city with the Open-Meteo geocoding API, requests a 35-day ensemble forecast, converts WMO weather codes into descriptions and OpenWeather-style icon codes, computes daily temperature summaries, and derives precipitation probability from available ensemble members.

The route uses an abort timeout and returns a 504 provider timeout if the upstream call exceeds 15 seconds.

### Smart Recommendations

`backend/src/routes/smart-recommendation.ts` implements the smart trip recommendation flow.

The route validates city, start date, end date, budget, and interests. It normalizes supported interests, builds a cache key, and uses an in-memory TTL cache controlled by `SMART_RECO_CACHE_TTL_MS`.

For fresh requests, it builds weather context with Open-Meteo geocoding and forecast data. It then queries DuckDuckGo HTML search for sustainable hotels, restaurants, activities, and destinations. Search results are parsed, de-duplicated, categorized, scored for eco evidence, source trust, interest match, weather fit, and budget fit, then shortlisted.

Gemini is the preferred provider when `GEMINI_API_KEY` is available. The prompt requires JSON output and restricts recommendations to shortlisted candidate IDs. The route validates the generated plan and gives Gemini one repair attempt if the first output fails validation.

If search confidence is too low, Gemini is unavailable, or provider validation fails, the route falls back to deterministic recommendations. The fallback still returns a complete plan with candidate IDs, rationale, weather alternatives, community impact, and estimated cost.

## External Integrations

The runtime backend uses these external integrations:

- Gemini: carbon reduction suggestions and smart recommendation generation.
- DuckDuckGo HTML search: candidate discovery for smart recommendations.
- Open-Meteo geocoding and forecast APIs: weather forecasts and smart recommendation weather context.
- OpenRouteService: walking, cycling, and driving route geometries, distances, and durations.
- Nominatim: location search and reverse geocoding for eco-route planning.

The data tooling uses these additional integrations:

- Supabase REST: imports existing `locations` rows into local PostgreSQL.
- Foursquare Places: searches sustainable destination places during seeding.
- Unsplash: attaches location imagery during seed generation.
- Gemini: generates seed descriptions.
- OpenStreetMap/Overpass: imports candidate locations from OSM data.

Configuration is environment-variable driven. The source references variables such as `DATABASE_URL`, `LOCAL_DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `SESSION_COOKIE_NAME`, `CORS_ORIGIN`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `OPENROUTESERVICE_API_KEY`, Supabase keys, Foursquare keys, and Unsplash keys. The documentation should not include actual secret values.

## Key Design Implementation

The backend favors plain, direct implementation over framework-heavy abstraction.

SQL is explicit and local to feature routes. This makes each route easy to inspect, but it also means validation, normalization, and response mapping are decentralized. Shared helpers exist where the behavior is genuinely cross-cutting: database access, auth/session handling, carbon calculation, analytics summary building, and location row mapping.

Route-level validation is used throughout. Inputs are normalized before SQL writes, and user-owned data is protected with `where user_id = $currentUserId` rather than relying only on middleware.

PostgreSQL constraints carry important integrity rules. The application catches expected constraint failures in places such as duplicate signup, duplicate favourites, and duplicate trip imports.

Transactions are used when a route writes related records that must stay consistent. Trip create/update operations write the parent trip and replace child itinerary items in one transaction. Account deletion and community challenge progress updates also use explicit transactions.

External provider failures are handled gracefully where the feature can still produce useful output. Carbon suggestions and smart recommendations have deterministic fallbacks. Eco route and weather routes return provider-oriented errors when upstream services are required for the response.

The API response shapes are tailored to the frontend. Examples include Supabase-like auth responses, frontend `Place` objects from location rows, nested trip objects from joined rows, and viewer-aware community fields.

## Testing and Local Development

Backend scripts in `backend/package.json` include:

- `npm run dev --workspace=backend`: runs `nodemon` with `ts-node src/index.ts`.
- `npm run build --workspace=backend`: compiles TypeScript.
- `npm run test --workspace=backend`: runs Vitest.
- `npm run start --workspace=backend`: starts `dist/index.js`.
- `npm run lint --workspace=backend`: lints TypeScript files.
- `npm run seed:locations:from-supabase --workspace=backend`: imports locations from Supabase into PostgreSQL.

Root workspace scripts coordinate frontend and backend development, database schema application, location seeding, build, start, and lint commands.

`docker-compose.yml` defines a local PostgreSQL service named `terratrace-postgres`. It creates the `terratrace` database and user, persists data in a named volume, maps host port `5433` to container port `5432`, runs `db/init` scripts on first initialization, and includes a `pg_isready` health check.

Vitest is configured with a Node environment and includes `src/**/*.{test,spec}.ts`. Current backend tests cover:

- Auth helpers and middleware.
- Auth/profile integration flows.
- Carbon calculator and carbon suggestions.
- Analytics utility and route integration.
- Trips route validation and transaction behavior.
- Eco Directory and favourites integration.
- Smart recommendations.
- Weather forecast mapping.

## Observations

Terratrace's backend is organized around feature routes rather than a layered service architecture. That matches the application's current size: each route can be read as a complete implementation of its feature, while shared concerns remain in small utilities.

The strongest implementation themes are local JWT authentication, PostgreSQL-backed ownership checks, direct SQL, route-level validation, transaction use for multi-table writes, and pragmatic fallbacks for provider-dependent features.

The backend is not just a proxy for the frontend. It contains substantive server-side logic for carbon calculations, analytics baselines, recommendation scoring, itinerary persistence, community progression, external provider normalization, and frontend-oriented response mapping.
