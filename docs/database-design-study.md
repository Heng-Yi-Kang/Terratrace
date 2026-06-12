# Terratrace Database Design Study

## Overview

Terratrace uses a PostgreSQL database as the main persistence layer for authentication, eco-directory data, saved places, carbon history, trips, todos, analytics goals, and community engagement. The schema is defined in `db/init/001_schema.sql` and is applied directly to the local PostgreSQL service started by Docker Compose.

The backend accesses the database from the Express API through the `pg` package. The project does not use an ORM. SQL queries are written close to each feature route, while `backend/src/utils/db.ts` provides the shared `pg.Pool` and query helper.

This design keeps the database model explicit: table definitions, constraints, indexes, and foreign-key relationships are visible in SQL, and application routes use parameterized queries to read and write data.

## Database Technology and Runtime Setup

The local database is PostgreSQL 16 running in Docker. The `docker-compose.yml` file defines a service named `terratrace-postgres` with:

- Database name: `terratrace`
- Database user: `terratrace`
- Host port: `5433`
- Container port: `5432`
- Initialization scripts mounted from `db/init`
- A persistent Docker volume named `terratrace-postgres-data`

The default local connection string is:

```env
DATABASE_URL=postgresql://terratrace:terratrace@localhost:5433/terratrace
```

Common database commands are:

```bash
docker compose up -d postgres
npm run db:apply-schema
npm run db:seed:locations:from-supabase
```

`npm run db:apply-schema` applies `db/init/001_schema.sql` to the running container. The seed command imports eco-directory locations from a hosted Supabase project into the local `locations` table.

## Schema

The database schema is defined in `db/init/001_schema.sql`. It creates the PostgreSQL extension, application tables, foreign-key relationships, check constraints, unique constraints, indexes, and seed rows for community data.

The schema is organized around the main product modules:

| Domain | Tables | Purpose |
| --- | --- | --- |
| Authentication and profile | `users` | Stores local user accounts, password hashes, roles, and profile metadata. |
| Eco Directory | `locations`, `user_favourites` | Stores sustainable places and each user's saved locations. |
| Carbon tracking and analytics | `carbon_entries`, `carbon_budget_goals` | Stores carbon calculation history and yearly carbon budget goals. |
| Todo and itinerary planning | `todos`, `trips`, `trip_items` | Stores user todos, planned trips, and itinerary items. |
| Community | `community_reviews`, `community_review_helpful`, `community_badges`, `community_challenges`, `community_challenge_progress`, `community_user_badges` | Stores public reviews, helpful votes, challenges, user progress, and earned badges. |

## Collections/Tables

Terratrace uses PostgreSQL relational tables rather than document collections. The main collections/tables are listed below.

### `users`

The `users` table is the root table for authenticated accounts. Each user has a UUID primary key, email, bcrypt password hash, optional username, role, metadata JSON columns, and timestamps.

Important design points:

- `id` defaults to `gen_random_uuid()`.
- `role` is limited to `user` or `admin`.
- `email` is required and enforced as unique case-insensitively through `users_email_lower_idx`.
- `password_hash` is required because authentication is handled locally by the backend.
- `raw_app_meta_data` and `raw_user_meta_data` preserve compatibility with Supabase-like metadata shapes.

### `locations`

The `locations` table stores Eco Directory places. It includes display fields, category, city, country, address, latitude/longitude data, eco certifications, eco tags, description, image URLs, Foursquare ID, optional booking URL, and timestamps.

Important design points:

- `public_id` is required and unique. API routes use it as a stable external identifier.
- `foursquare_id` is unique when present, preventing duplicate imported places from Foursquare.
- `eco_certs` and `eco_tags` are PostgreSQL text arrays with empty-array defaults.
- `lat`, `lng`, and `long` exist to support imported data that may use different longitude field names.

### `user_favourites`

The `user_favourites` table links users to saved locations.

Important design points:

- `user_id` references `users(id)` with `on delete cascade`.
- `location_id` references `locations(id)` with `on delete cascade`.
- The `(user_id, location_id)` uniqueness rule prevents the same user from saving the same location more than once.

### `carbon_entries`

The `carbon_entries` table stores saved carbon calculator results for authenticated users.

Important design points:

- `trips` is stored as JSONB so the original calculator input can be preserved.
- Emissions are stored in total and category-specific numeric columns.
- Entries are linked to a user and deleted when the user account is deleted.

### `carbon_budget_goals`

The `carbon_budget_goals` table stores annual carbon budgets per user.

Important design points:

- `year` must be between 2000 and 2100.
- `annual_budget_kg` must be positive.
- `(user_id, year)` is unique, allowing the analytics API to upsert one goal per user per year.

### `todos`

The `todos` table stores small authenticated user tasks.

Important design points:

- `id` uses `bigserial`.
- Every todo belongs to a user.
- `name` is required.
- `is_complete` defaults to `false`.

### `trips`

The `trips` table stores user trip plans.

Important design points:

- Each trip belongs to a user.
- `destination`, `start_date`, and `end_date` are required.
- `start_date <= end_date` is enforced at the database level.
- `eco_score` must be between 0 and 100.
- `status` is limited to `upcoming` or `completed`.
- `source` is limited to `manual`, `recommendation`, or `local-import`.
- `(user_id, source_request_id)` is unique, supporting idempotent imports from locally stored recommendations.

### `trip_items`

The `trip_items` table stores itinerary items under a trip.

Important design points:

- `trip_id` references `trips(id)` with `on delete cascade`.
- `location_id` optionally references `locations(id)` with `on delete set null`.
- `day_part` is limited to `morning`, `afternoon`, `evening`, or `flexible`.
- `sort_order` supports stable ordering inside a trip day.

### Community Tables

The community module uses several connected tables:

- `community_reviews` stores public review content, rating, sustainability practices, reviewer display fields, verification state, and optional links to a user or location.
- `community_review_helpful` stores one helpful vote per `(review_id, user_id)`.
- `community_badges` stores badge definitions by unique slug.
- `community_challenges` stores challenge definitions, reward text, point value, category, total target, unit, active state, and optional badge reward.
- `community_challenge_progress` stores each user's joined challenge progress.
- `community_user_badges` stores badges earned by each user.

This design separates static community configuration, user progress, and public review content. It also allows public community data to remain visible even if a linked user or location is removed.

## Relationships

The main relationship pattern is user ownership. User-owned tables include `user_favourites`, `carbon_entries`, `carbon_budget_goals`, `todos`, `trips`, `community_review_helpful`, `community_challenge_progress`, and `community_user_badges`.

Key relationships:

| Relationship | Foreign key behavior | Reason |
| --- | --- | --- |
| `user_favourites.user_id -> users.id` | `on delete cascade` | Saved places should disappear when a user account is deleted. |
| `user_favourites.location_id -> locations.id` | `on delete cascade` | Saved references should disappear when a location is removed. |
| `carbon_entries.user_id -> users.id` | `on delete cascade` | Carbon history belongs to the user. |
| `carbon_budget_goals.user_id -> users.id` | `on delete cascade` | Budget goals belong to the user. |
| `todos.user_id -> users.id` | `on delete cascade` | Todo records belong to the user. |
| `trips.user_id -> users.id` | `on delete cascade` | Trip plans belong to the user. |
| `trip_items.trip_id -> trips.id` | `on delete cascade` | Itinerary items should be deleted with their parent trip. |
| `trip_items.location_id -> locations.id` | `on delete set null` | A trip item can still exist even if the referenced directory location is removed. |
| `community_reviews.user_id -> users.id` | `on delete set null` | Public reviews can remain after account deletion without preserving user ownership. |
| `community_reviews.location_id -> locations.id` | `on delete set null` | Reviews can remain as historical public content if a location is removed. |
| `community_review_helpful.review_id -> community_reviews.id` | `on delete cascade` | Helpful votes should disappear with the review. |
| `community_challenge_progress.challenge_id -> community_challenges.id` | `on delete cascade` | Progress depends on the challenge definition. |
| `community_user_badges.badge_id -> community_badges.id` | `on delete cascade` | Earned badge rows depend on badge definitions. |

Account deletion in `backend/src/routes/user.ts` deletes the authenticated `users` row in a transaction. The database then applies cascade rules to remove dependent user-owned data.

## Constraints and Data Integrity

The database uses constraints for rules that must stay true regardless of which route writes the data.

Important constraints include:

- `users.role` must be `user` or `admin`.
- `users_email_lower_idx` prevents duplicate emails with different casing.
- `user_favourites` prevents duplicate saved locations for one user.
- `carbon_budget_goals.year` must be in the valid range from 2000 to 2100.
- `carbon_budget_goals.annual_budget_kg` must be greater than zero.
- `carbon_budget_goals` allows only one goal per user per year.
- `trips.start_date` must be before or equal to `trips.end_date`.
- `trips.eco_score` must be from 0 to 100.
- `trips.status` must be `upcoming` or `completed`.
- `trips.source` must be `manual`, `recommendation`, or `local-import`.
- `trip_items.day_part` must be one of the supported day-part values.
- `community_reviews.rating` must be from 1 to 5.
- `community_challenges.points` cannot be negative.
- `community_challenges.total` must be greater than zero.
- `community_challenges.category` must be `Active`, `Featured`, or `Streak`.
- `community_challenge_progress.progress` cannot be negative.

The backend also validates request payloads before writing, but the database constraints provide a final integrity layer.

## Indexes

Indexes are designed around common API access paths:

| Index | Purpose |
| --- | --- |
| `users_email_lower_idx` | Fast case-insensitive login/signup lookup and uniqueness enforcement. |
| `locations_category_city_idx` | Directory filtering by category and city. |
| `user_favourites_user_id_idx` | Fetching a user's saved places. |
| `carbon_entries_user_created_idx` | Reading a user's carbon history by newest entries first. |
| `carbon_budget_goals_user_year_idx` | Reading and upserting annual budget goals. |
| `todos_user_inserted_idx` | Reading todos for a user in recent-first order. |
| `trips_user_start_idx` | Reading user trips ordered by start date. |
| `trip_items_trip_sort_idx` | Loading trip items in date and sort order. |
| `trip_items_location_id_idx` | Joining itinerary items to directory locations. |
| `community_reviews_created_idx` | Listing newest community reviews. |
| `community_reviews_category_idx` | Filtering community reviews by category. |
| `community_reviews_user_idx` | Reading reviews by author. |
| `community_helpful_user_idx` | Reading helpful votes by user. |
| `community_challenges_active_idx` | Listing active challenges. |
| `community_progress_user_idx` | Reading user challenge progress. |
| `community_user_badges_user_idx` | Reading earned badges by user. |

The indexes match the route-level query patterns in the backend and help keep common dashboard, directory, and community views efficient.

## Data Access Patterns

Terratrace uses direct SQL from route handlers. The shared database helper creates a PostgreSQL pool and exposes a typed `query()` wrapper. For multi-step writes, routes use a pooled client and explicit transactions.

Important access patterns:

- Authentication reads users by `lower(email)` and stores bcrypt password hashes in `users.password_hash`.
- Protected routes scope user-owned reads and writes with `where user_id = $currentUserId`.
- Favourites join `user_favourites` to `locations` so the API can return saved place details.
- Carbon history and analytics read from `carbon_entries`; analytics goals use `insert ... on conflict (user_id, year) do update`.
- Trip create and update operations write the parent `trips` row and replace child `trip_items` rows in one transaction.
- Community challenge progress uses a transaction to update progress and award badges consistently.
- Directory routes expose `locations` through frontend-oriented mapping, including category normalization and image fields.

This approach keeps database behavior transparent, but it also means validation and mapping logic is distributed across feature routes.

## Seed and Migration Flow

The schema file also inserts default community badges, challenges, and sample reviews. These rows are inserted with conflict handling so the schema can be re-applied without duplicating seeded community records.

Eco Directory locations are seeded separately. The `npm run db:seed:locations:from-supabase` command reads from a hosted Supabase project and upserts rows into local PostgreSQL by `public_id`.

For broader migration, `db/migrate-from-supabase.sh` can import supported app data and transform Supabase Auth users into the local `users` table. The migration preserves existing bcrypt-compatible password hashes where possible.

## Design Observations

Terratrace's database design is pragmatic and feature-oriented. The model is normalized where relationships matter, such as users to favourites, trips to itinerary items, and challenges to progress. Flexible JSONB and array columns are used where the data shape can vary, such as carbon calculator trip inputs and eco tags.

The strongest integrity choices are the use of foreign keys, cascade rules for user-owned data, check constraints for controlled values, uniqueness constraints for duplicate prevention, and transactions for multi-table writes.

The design supports the current application well because each major user workflow maps clearly to a small set of tables:

- Signup and login use `users`.
- Eco Directory browsing uses `locations`.
- Saved places use `user_favourites`.
- Carbon history and reports use `carbon_entries` and `carbon_budget_goals`.
- Trip planning uses `trips` and `trip_items`.
- Community participation uses reviews, helpful votes, challenge progress, and badges.

Overall, the database schema provides a clear relational foundation for Terratrace while leaving room for imported directory data and provider-generated recommendation content.
