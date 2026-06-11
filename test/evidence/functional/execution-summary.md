# Functional Test Evidence Summary

Date: 2026-06-11

Environment:

- PostgreSQL container: `terratrace-postgres`, healthy, mapped to localhost port 5433.
- Schema command: `npm run db:apply-schema`.
- Local isolated backend check: `PORT=3003 CORS_ORIGIN=http://localhost:3002 npm run dev --workspace=backend`.
- Local isolated frontend check: `PORT=3002 NEXT_PUBLIC_API_BASE_URL=http://localhost:3003 NEXT_PUBLIC_API_URL=http://localhost:3003 npm run dev --workspace=frontend -- -p 3002`.

Database setup:

- `locations` was empty after schema setup.
- Seeded disposable rows:
- `functional-test-solar-lodge`, visible as `functional-test Rain Lodge`, Accommodation, Kuala Lumpur.
  - `functional-test-compost-cafe`, visible as `functional-test Compost Cafe`, Dining, Penang.
  - `functional-test-bike-hub`, visible as `functional-test Bike Hub`, Transport, Kuala Lumpur.
- Community seed tables existed after schema setup: 4 reviews, 4 challenges, 8 badges.

Fresh automated evidence:

- Frontend command: `npm run test --workspace=frontend`.
- Frontend result: 20 test files passed, 93 tests passed.
- Green Itinerary targeted command: `npm run test --workspace=frontend -- TripsTab useTrips`.
- Green Itinerary targeted result: 2 test files passed, 13 tests passed, covering trip create/list/edit/delete, manual itinerary items, saved-place insertion, directory-search insertion, validation, empty states, persisted schedule details, and recommendation payload mapping.
- Backend command: `npm run test --workspace=backend`.
- Backend result after resolving a disposable seed collision: 7 test files passed, 39 tests passed.

Local route/API evidence:

- `GET http://localhost:3003/api/locations` returned seeded functional-test location cards.
- `GET http://localhost:3002/eco-directory` returned HTTP 200 with a 61,339 byte rendered HTML response.
- Headless Firefox screenshot capture was attempted but blocked by an existing Firefox profile/process conflict and then a headless render hang, so no screenshot files are included.

Known limitations:

- No Playwright, Cypress, Selenium, or Puppeteer executable is installed as a direct project dependency.
- Interactive browser form flows were not completed end-to-end in this run; Green Itinerary browser-flow risk is covered by functional-style TripsTab component tests instead.
- External weather, route, and recommendation services depend on network/API-provider behavior and were documented as blocked where no visible local UI result was captured.
