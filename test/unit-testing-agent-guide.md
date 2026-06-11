# Unit Testing Agent Guide

This guide tells future agents how to add unit tests for one Terratrace module and append the result to `test/unit-test.docx`.

## Report Scope

`test/unit-test.docx` is the single unit test report for the whole Terratrace project. Do not create separate final DOCX files per module unless the user explicitly asks for one.

Unit tests in this project cover isolated code units:

- React components rendered with Testing Library.
- React hooks rendered with local providers and mocked dependencies.
- Pure utility functions called directly.
- Backend helpers and middleware tested with mocked framework objects.

Backend route tests that start the Express app, use HTTP requests, or assert PostgreSQL state are integration tests. Keep those in `test/integration-test.docx`.

## Before Writing Or Running Tests

Check the current worktree:

```bash
git status --short
```

Read these files before changing a module:

- Relevant source files for the module.
- Existing nearby `*.test.ts` or `*.test.tsx` files.
- `frontend/vitest.config.ts` for frontend tests.
- `backend/vitest.config.ts` for backend tests.
- `test/generate-unit-test-report.mjs` before updating the DOCX.

Do not overwrite unrelated user changes. If `test/unit-test.docx` already contains other module sections, preserve them by updating the project-wide generator data and regenerating the full report.

## Frontend Unit Test Pattern

Use frontend Vitest for components, hooks, and utilities under `frontend/src`.

Preferred tools:

- Vitest.
- React Testing Library.
- `@testing-library/user-event`.
- Local `QueryClientProvider` for React Query hooks.
- `vi.mock` for Next.js navigation, API utilities, hooks, and child components that are outside the unit.

Run one module or test file:

```bash
npm run test --workspace=frontend -- <module-or-test-name>
```

Run the full frontend unit suite:

```bash
npm run test --workspace=frontend
```

Frontend tests should assert user-visible behavior, callback payloads, hook state, query invalidation, router calls, loading states, error states, and empty states as appropriate.

## Backend Unit Test Pattern

Use backend Vitest for helpers, calculation utilities, middleware, and small service functions under `backend/src`.

Preferred tools:

- Vitest.
- Direct function calls for utilities.
- Mocked Express `req`, `res`, and `next` objects for middleware.
- Controlled environment variables for auth/session helpers.

Run one backend module:

```bash
npm run test --workspace=backend -- <path-or-name>.test.ts
```

Run backend unit tests without route integration suites:

```bash
npm run test --workspace=backend -- src/utils/auth.test.ts src/utils/analytics.test.ts src/middleware/auth.test.ts
```

If you add a new backend unit test file, include it in this targeted command and in `test/generate-unit-test-report.mjs`.

## Case ID Convention

Use stable IDs so report rows remain traceable:

- `UT-AUTH-###` for authentication UI/page behavior.
- `UT-PROFILE-###` for profile hooks and components.
- `UT-ECO-###` for eco-directory and location filtering.
- `UT-FAV-###` for favourites.
- `UT-COMMUNITY-###` for community hooks and UI.
- `UT-CARBON-###` for carbon calculator units.
- `UT-ANALYTICS-###` for analytics utilities.
- `UT-BACKEND-AUTH-###` for backend auth helpers and middleware.
- `UT-ADMIN-###` for admin modules.

Avoid reusing an existing ID for a different scenario.

## Minimum Evidence Per Report Row

Every unit-test row in the DOCX should include:

- Test case ID.
- Unit under test.
- Scenario.
- Pass or fail status.
- Concrete evidence.

Good evidence examples:

- Callback received expected arguments.
- Router `push` or `replace` received expected path.
- Query cache was invalidated or cleared.
- Rendered text or state appeared.
- Middleware returned expected status and body.
- Utility returned expected number or object.
- Failure line and actual value for a failing assertion.

## Appending A Module Result To `test/unit-test.docx`

Use the generator:

```bash
node test/generate-unit-test-report.mjs
```

Append workflow:

1. Run the module's targeted unit command and capture the summary.
2. Run the broader workspace suite when the module touches shared utilities, providers, or hooks.
3. Edit `test/generate-unit-test-report.mjs`.
4. Add or update the module entry in the `modules` array.
5. Update the `suites` array if project-wide counts changed.
6. Regenerate `test/unit-test.docx`.
7. Validate the DOCX archive.
8. Search the DOCX XML for the new module heading.

Validation commands:

```bash
unzip -t test/unit-test.docx
unzip -p test/unit-test.docx word/document.xml | rg "Terratrace Project Unit Test Report|Module Section"
```

Do not manually edit the DOCX in a word processor if the same change can be made in the generator. Scripted regeneration keeps the report repeatable.

## Reporting Failures

If a test fails and you are not fixing it in the same task:

- Keep the row status as `Fail`.
- Include the failing command.
- Include the file, line, expected value, and actual value when available.
- Update the overall suite summary to show the failure.
- Do not mark a module or whole project as passed until the automated result is actually green.

## Cleanup Rules

Frontend tests should reset mocks, query clients, localStorage, and MSW handlers when used.

Backend unit tests should avoid real database writes. If a test needs HTTP or PostgreSQL state, it is probably an integration test and belongs in the integration workflow instead.
