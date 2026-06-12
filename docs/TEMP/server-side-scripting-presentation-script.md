# Terratrace Server-Side Scripting Presentation Script

**Duration:** 5 minutes  
**Focus:** Backend architecture, server-side logic, Trips CRUD demo, and outstanding backend implementation  
**Demo style:** Browser UI

## 5-Minute Spoken Script

### 0:00-0:30 - Opening

Good morning everyone. Today I will present Terratrace from the server-side scripting perspective.

Terratrace is an eco-friendly travel planning web application. From the user side, it supports sustainable destination discovery, trip planning, carbon tracking, smart recommendations, community features, and analytics. But for this presentation, I will focus on what happens behind the interface: how the backend receives input, validates it, stores data, protects user routes, and returns structured output to the frontend.

The backend is built with Express.js and TypeScript, with PostgreSQL as the main database.

### 0:30-1:20 - Backend Architecture

The main backend entry point is `backend/src/index.ts`. This file loads the environment variables and starts the Express server on the configured port, usually port 3001.

The application setup is in `backend/src/app.ts`. This is where the backend configures CORS, JSON body parsing, URL-encoded request parsing, cookie parsing, health checks, API routes, 404 handling, and global error handling.

The route structure is modular. Each feature has its own route file, such as authentication, trips, carbon, locations, favourites, community, analytics, weather, eco-route, and smart recommendations.

The database layer is intentionally simple. In `backend/src/utils/db.ts`, the project creates a PostgreSQL connection pool using the `pg` package. Instead of using an ORM, the backend writes direct parameterized SQL queries. This makes the server-side logic explicit and easier to trace from HTTP request to database operation.

### 1:20-2:10 - Authentication and Protected Routes

Authentication is handled on the server using bcrypt password hashes and JWT sessions.

When a user signs up or logs in, the backend verifies the credentials, signs a JWT token, and stores it in an HTTP-only session cookie. Protected routes use the `requireAuth` middleware in `backend/src/middleware/auth.ts`.

This middleware reads the session token from the request, verifies it, and attaches the authenticated user to `req.user`. After that, route handlers can safely use `req.user.id` as the source of truth for ownership.

This is important because the frontend never decides which user owns a trip or a todo. The backend always scopes database queries using the authenticated user ID. For example, the Trips API only reads, updates, or deletes trips where `user_id` matches the current logged-in user.

### 2:10-3:20 - Live Demo: Trips CRUD

Now I will demonstrate CRUD using the Trips feature.

First, I log in to the application. This creates a backend session, so the protected Trips API can identify my user.

Next, I go to the trips page and create a new trip. For the input, I enter a destination, start date, end date, budget, interests, and itinerary items. When I submit the form, the frontend sends this data to the backend using `POST /api/trips`.

On the server, `backend/src/routes/trips.ts` validates the destination, date format, date range, status, eco score, and itinerary items. If the input is valid, the backend inserts the parent trip into the `trips` table and inserts the itinerary items into the `trip_items` table.

The output returned to the frontend is a JSON object containing the created trip and its nested itinerary items. The UI then displays the new trip in the trip list.

For the read operation, I refresh or view the trips list. This calls `GET /api/trips`. The backend queries only my trips, joins them with itinerary items and location data, then maps the flat SQL rows into a nested JSON structure.

For the update operation, I edit the trip, for example by changing the budget or itinerary. The frontend sends `PATCH /api/trips/:id`. The backend validates the updated values and applies the changes.

For the delete operation, I remove the trip. The frontend sends `DELETE /api/trips/:id`, and the backend deletes only the trip that belongs to my authenticated user.

This demonstrates the full CRUD cycle: create, read, update, and delete, with server-side validation, authentication, database access, and JSON output.

### 3:20-4:25 - Outstanding Backend Implementation

The most outstanding backend implementation is the combination of smart recommendations and transactional trip management.

For smart recommendations, the route is `backend/src/routes/smart-recommendation.ts`. The server validates the user's city, travel dates, budget, and interests. Then it gathers weather context, searches for sustainable travel candidates, scores candidates based on eco evidence, interest match, weather fit, and budget fit, and builds a shortlist.

If Gemini is available, the backend asks it to generate a recommendation plan using only the shortlisted candidates. The response is validated so the server does not blindly trust AI output. If Gemini fails, returns invalid data, or is not configured, the backend returns deterministic fallback recommendations. This keeps the feature usable even when an external provider is unavailable.

The Trips API is also important architecturally because trip creation and updates use explicit PostgreSQL transactions. A trip has parent data and child itinerary items. The backend saves them together so the database does not end up with a trip without its itinerary or itinerary items without a valid trip.

This shows strong server-side scripting because the backend is not just passing data through. It validates input, protects routes, controls ownership, manages database consistency, integrates external services, and produces stable output for the frontend.

### 4:25-5:00 - Closing

To conclude, Terratrace uses a TypeScript Express backend with PostgreSQL to support a full-stack sustainable travel application.

The backend handles the important server-side responsibilities: request parsing, authentication, authorization, validation, database CRUD, transactions, external API integration, fallback logic, and structured JSON responses.

In the demo, the Trips feature showed input and output through a real CRUD workflow. In the code highlights, the smart recommendation route and transactional trip route showed the strongest backend architecture in the project.

That is how Terratrace's server-side scripting powers the user experience behind the scenes. Thank you.

## Browser Demo Checklist

Use this sequence during the live demo:

1. Open the Terratrace app in the browser.
2. Log in with a test account.
3. Navigate to the Trips or dashboard trip-planning page.
4. Create a trip:
   - Destination: `Penang`
   - Start date: `2026-07-01`
   - End date: `2026-07-03`
   - Budget: `500`
   - Interests: `nature`, `food`
   - Itinerary item: `Visit Penang National Park`
5. Show that the trip appears in the trip list.
6. Edit the trip:
   - Change budget to `650`, or add/update an itinerary item.
7. Show the updated output in the UI.
8. Delete the trip.
9. Point out that each action maps to a backend route:
   - Create: `POST /api/trips`
   - Read: `GET /api/trips`
   - Update: `PATCH /api/trips/:id`
   - Delete: `DELETE /api/trips/:id`

## Sample Input and Output for Trips CRUD

### Create Trip Input

```json
{
  "destination": "Penang",
  "startDate": "2026-07-01",
  "endDate": "2026-07-03",
  "budget": 500,
  "interests": ["nature", "food"],
  "ecoScore": 82,
  "status": "upcoming",
  "source": "manual",
  "items": [
    {
      "tripDate": "2026-07-01",
      "dayPart": "morning",
      "title": "Visit Penang National Park",
      "category": "activity",
      "estimatedCost": 50,
      "rationale": "Nature-based low-impact activity"
    }
  ]
}
```

### Create Trip Output

```json
{
  "id": "generated-trip-id",
  "destination": "Penang",
  "startDate": "2026-07-01",
  "endDate": "2026-07-03",
  "budget": 500,
  "interests": ["nature", "food"],
  "ecoScore": 82,
  "status": "upcoming",
  "source": "manual",
  "items": [
    {
      "id": "generated-item-id",
      "tripDate": "2026-07-01",
      "dayPart": "morning",
      "title": "Visit Penang National Park",
      "category": "activity",
      "estimatedCost": 50,
      "rationale": "Nature-based low-impact activity"
    }
  ]
}
```

### Update Trip Input

```json
{
  "budget": 650,
  "items": [
    {
      "tripDate": "2026-07-01",
      "dayPart": "morning",
      "title": "Visit Penang National Park",
      "category": "activity",
      "estimatedCost": 50
    },
    {
      "tripDate": "2026-07-02",
      "dayPart": "afternoon",
      "title": "Try local vegetarian food",
      "category": "restaurant",
      "estimatedCost": 40
    }
  ]
}
```

### Delete Trip Output

```json
{
  "success": true
}
```

## Key Code Contributions to Highlight

### Express App Setup

Reference: `backend/src/app.ts`

Highlight:

- Creates the Express application.
- Enables CORS for frontend access.
- Parses JSON request bodies and cookies.
- Mounts feature routes under `/api`.
- Provides health check, 404 response, and global error handling.

### Authentication Middleware

Reference: `backend/src/middleware/auth.ts`

Highlight:

- Reads session token from the request.
- Verifies JWT session.
- Attaches authenticated user data to `req.user`.
- Blocks protected routes with `401` when the session is missing or invalid.

### PostgreSQL Query Helper

Reference: `backend/src/utils/db.ts`

Highlight:

- Creates a shared PostgreSQL connection pool.
- Exposes a reusable `query()` helper.
- Supports direct parameterized SQL instead of string-concatenated queries.

### Trips CRUD and Transactions

Reference: `backend/src/routes/trips.ts`

Highlight:

- Protects every trip route with `requireAuth`.
- Validates destination, dates, status, eco score, and itinerary item data.
- Uses `req.user.id` to scope all user-owned data.
- Uses a transaction when creating or updating a trip and its itinerary items.
- Converts joined SQL rows into nested trip JSON for the frontend.

### Smart Recommendation Architecture

Reference: `backend/src/routes/smart-recommendation.ts`

Highlight:

- Validates request input before processing.
- Uses weather context and search candidates.
- Scores recommendations using eco evidence, interest match, weather fit, and budget fit.
- Uses Gemini when configured.
- Validates AI output before returning it.
- Provides deterministic fallback recommendations when external services fail.
- Uses a short-lived cache to avoid recomputing identical requests too often.

## Short Backup Script If Demo Fails

If the live demo cannot run, say this:

"If the live demo environment is unavailable, I can still explain the same CRUD flow from the backend routes. Creating a trip uses `POST /api/trips`, reading uses `GET /api/trips`, updating uses `PATCH /api/trips/:id`, and deleting uses `DELETE /api/trips/:id`. All four routes are protected by `requireAuth`, and each SQL query is scoped by the authenticated user's ID. The create and update routes use transactions so the trip and itinerary items are saved consistently."

## One-Sentence Takeaway

Terratrace's backend is responsible for turning user input into secure, validated, persistent, and useful travel-planning output through Express routes, JWT authentication, PostgreSQL queries, transactions, and external API integration.
