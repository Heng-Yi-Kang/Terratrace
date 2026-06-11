# Integration Testing Agent Guide

This guide tells future agents how to add project-wide integration tests and append results to `test/integration-test.docx`.

## Report Scope

`test/integration-test.docx` is the single integration test report for the whole Terratrace project. Do not create a separate final DOCX per module unless the user explicitly asks for one.

Each module must be appended as a section inside the same report:

- Authentication and Profile Management
- Eco-friendly Directory and Location Search
- Favourites and Saved Places
- Green Itinerary and Trips
- Carbon Footprint Calculator and History
- Community Reviews, Challenges, Badges, and Leaderboard
- Smart Recommendation
- Weather and Eco Route APIs
- Admin Dashboard, Users, Destinations, and Analytics

If a module has only partial integration coverage, document the covered flows and clearly state remaining gaps in that module section.

## What Counts As Integration Testing

Follow `docs/REQUIREMENTS.md`: integration tests must prove interaction between at least two layers or modules.

Good integration tests in this repo include:

- API route plus PostgreSQL state, such as `POST /api/auth/signup` creating a `users` row.
- Frontend utility or hook plus API contract, when the network boundary is intentionally mocked but the UI data flow is tested.
- Authenticated API flow across routes, such as signup -> cookie -> protected endpoint -> database update.
- Module-to-module data flow, such as saved location -> trip item, carbon calculation -> persisted history, or community review -> leaderboard data.

Do not count isolated component rendering, pure utility functions, or mocked-only service functions as integration tests. Those belong in unit or functional reports.

## Before Writing Tests

Read these files first:

- `docs/REQUIREMENTS.md`
- `docs/feature-implementation-status.md`
- `test/test-list.md`
- Relevant route, hook, component, and schema files for the module
- Existing integration tests, especially `backend/src/routes/auth-profile.integration.test.ts`

Check the current worktree before editing:

```bash
git status --short
```

Do not overwrite unrelated user changes. If `test/integration-test.docx` already contains sections for other modules, preserve them.

## Backend Integration Test Pattern

Use backend Vitest tests for real API/database integration.

Preferred setup:

- Import `createApp()` from `backend/src/app.ts`.
- Start the Express app on an ephemeral port with `app.listen(0)`.
- Use Node built-in `fetch` for HTTP requests.
- Use `pg` queries from `backend/src/utils/db.ts` for database assertions.
- Use disposable test data with a unique prefix and cleanup in `beforeAll` and `afterAll`.
- Close the HTTP server and `pool.end()` in `afterAll`.

Default local database:

```bash
docker compose up -d postgres
npm run db:apply-schema
```

Default test environment values:

```ts
process.env.DATABASE_URL ||= 'postgres://terratrace:terratrace@localhost:5433/terratrace'
process.env.JWT_SECRET ||= 'terratrace-integration-test-secret'
process.env.NODE_ENV = 'test'
```

Test command:

```bash
npm run test --workspace=backend -- <module>.integration
```

Then run the full backend suite:

```bash
npm run test --workspace=backend
```

## Frontend Integration Test Pattern

Use frontend Vitest tests when the integration boundary is inside the frontend app, such as page -> hook -> API utility -> rendered result.

Preferred setup:

- Use Testing Library and `user-event`.
- Use MSW handlers from `frontend/src/test/mocks` for API boundaries.
- Verify user-visible behavior after data loads, form submits, filter changes, pagination, cache invalidation, or route updates.
- Keep mocked API responses realistic and aligned with backend route shapes.

Test command:

```bash
npm run test --workspace=frontend -- <test-name>
```

Then run the full frontend suite when the touched area is broad:

```bash
npm run test --workspace=frontend
```

## Case ID Convention

Use stable IDs so report rows remain traceable:

- `IT-AUTH-###` for authentication.
- `IT-PROFILE-###` for profile.
- `IT-DIR-###` for eco-directory/location search.
- `IT-FAV-###` for favourites.
- `IT-TRIP-###` for trips/itinerary.
- `IT-CARBON-###` for carbon calculator/history.
- `IT-COMMUNITY-###` for community features.
- `IT-RECO-###` for smart recommendation.
- `IT-WEATHER-###` for weather.
- `IT-ROUTE-###` for eco route planner.
- `IT-ADMIN-###` for admin features.

Avoid reusing an existing ID for a different scenario.

## Minimum Evidence Per Test Case

Every report row should include:

- Test ID.
- Category: Integration.
- Module or feature.
- Scenario.
- Input or steps.
- Expected result.
- Actual result.
- Pass or fail status.
- Evidence.

Evidence should be concrete:

- HTTP method, route, status code, and important response fields.
- SQL query result, row count, or before/after database assertion.
- Cookie/session behavior for authenticated routes.
- Rendered UI state for frontend integration tests.
- Test command and summarized runner output.

## Appending To `test/integration-test.docx`

The DOCX is the final project-wide report. Append new module sections; do not replace the whole document with a module-only report.

For each module section, add:

1. Heading: `Module Section: <Module Name>`.
2. Objective paragraph for that module.
3. Environment/tools paragraph.
4. Test command and summarized result.
5. Test case table using the standard columns from `docs/REQUIREMENTS.md`.
6. Evidence summary.
7. Module conclusion with remaining gaps, if any.

Use the existing root `docx` dependency for scripted updates when possible. If the script regenerates the DOCX, it must generate the complete project-wide report from all known module result data, not only the module being added.

Safe append workflow:

1. Extract or inspect current report content.
2. Add the new module section to a project-wide report data source or generator.
3. Regenerate `test/integration-test.docx`.
4. Verify the previous module sections are still present.
5. Validate the DOCX archive.

Validation command:

```bash
unzip -t test/integration-test.docx
```

Quick title/content check:

```bash
unzip -p test/integration-test.docx word/document.xml | rg "Terratrace Project Integration Test Report|Module Section"
```

## Reporting Failures

If a test fails and the implementation is not being fixed in the same task:

- Keep the test result as Fail in the report.
- Include the failing command.
- Include the observed error or status code.
- State the likely source of failure if known.
- Do not mark a scenario Pass unless the automated test or manual evidence actually passed.

## Cleanup And Data Safety

Use disposable records only.

Backend database tests should:

- Prefix test-created emails, public IDs, slugs, or names with a unique integration prefix.
- Clean up records by that prefix before and after the suite.
- Avoid deleting broad production-like data.
- Avoid `truncate` unless the database is guaranteed to be an isolated test database.
- Prefer transaction-safe cleanup when testing delete/cascade behavior.

Frontend tests should:

- Reset MSW handlers between tests.
- Clear localStorage/sessionStorage between tests when used.
- Reset query clients and mocks between tests.

## Final Verification Checklist

Before handing off:

- New integration tests are committed to the correct workspace area.
- Targeted test command passes.
- Relevant full test suite passes, or any skipped suite is explained.
- `test/integration-test.docx` exists.
- `test/integration-test.docx` has a project-wide title.
- Existing module sections were preserved.
- New module section includes table rows and evidence.
- `unzip -t test/integration-test.docx` reports no errors.
- `test/test-list.md` is updated if new automated tests were added.
