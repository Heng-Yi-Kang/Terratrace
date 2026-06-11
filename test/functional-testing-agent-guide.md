# Functional Testing Agent Guide

This guide tells future agents how to perform module-by-module functional testing for Terratrace according to `docs/REQUIREMENTS.md` and how to write the results to `test/functional-test.docx`.

## Report Scope

`test/functional-test.docx` should be the single functional test report for the whole Terratrace project. Do not create one final DOCX per module unless the user explicitly asks for separate reports.

Functional testing verifies user-facing system behavior against requirements. It should cover every visible feature, including:

- Registration, login, logout, session protection, and role-aware redirects.
- Profile view, update, password change, and account deletion.
- Eco-directory browsing, search, city/category filters, details, and empty states.
- Favourites and saved places for authenticated users and guests.
- Green itinerary and trips create, view, update, delete, schedule items, and saved-place insertion.
- Smart recommendations using destination, dates, budget, interests, and weather context.
- Weather forecast display and unavailable-location/error handling.
- Eco route planner inputs, route alternatives, current-location behavior, and error states.
- Carbon calculator, impact insights, offset suggestions, history, summary, and deletion.
- Community reviews, ratings, helpful votes, challenges, badges, and leaderboard.
- Personal analytics dashboard, PDF reports, and annual carbon budget goals.
- Admin dashboard, users, destinations, analytics, and role-protected access.

If a module is only partially testable, document the tested behavior and clearly state the remaining gap in that module section.

## What Counts As Functional Testing

Follow `docs/REQUIREMENTS.md`: functional tests must verify that each system feature behaves according to specified requirements from the user's point of view.

Functional tests should prove:

- Success cases work with valid input.
- Failure cases reject invalid, duplicate, unauthorized, or unavailable input.
- Edge cases handle empty data, empty forms, boundary values, missing sessions, and no results.
- Navigation, validation messages, loading states, error states, and final user-visible outcomes are correct.

Do not count isolated utility assertions as functional tests. Those belong in `test/unit-test.docx`. Do not count API plus database persistence assertions as functional tests unless the user-visible outcome is the main evidence; deeper API/database proof belongs in `test/integration-test.docx` or database testing.

## Before Testing A Module

Read these files first:

- `docs/REQUIREMENTS.md`
- `docs/feature-implementation-status.md`
- `test/test-list.md`
- Relevant page, component, hook, route, and schema files for the module
- Existing unit and integration guides for naming and report conventions

Check the current worktree:

```bash
git status --short
```

Do not overwrite unrelated user changes. If `test/functional-test.docx` already exists, preserve existing module sections by updating a project-wide report generator or data source instead of replacing the report with only one module.

## Test Environment

Use the local application unless the user provides another environment.

Default setup:

```bash
npm install
docker compose up -d postgres
npm run db:apply-schema
npm run dev
```

Default app URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001` or the port printed by the backend dev server
- PostgreSQL: `postgres://terratrace:terratrace@localhost:5433/terratrace`

Functional testing can be manual or automated:

- Manual browser testing is acceptable when evidence screenshots, console output, or notes are captured.
- Automated browser testing is preferred for repeated flows if Playwright or another browser runner is available or explicitly added.
- Frontend Vitest with Testing Library can support functional-style checks for user-visible behavior, but report it as functional only when it represents a complete feature behavior, not just one isolated component.

## Module Testing Order

Use this order so prerequisites are available for later modules:

1. Authentication and session management.
2. Profile management.
3. Eco-directory and location search.
4. Favourites and saved places.
5. Trips and green itinerary.
6. Smart recommendation.
7. Weather forecast.
8. Eco route planner.
9. Carbon footprint calculator, insights, offsets, and history.
10. Community reviews, challenges, badges, and leaderboard.
11. Personal analytics, sustainability reports, and goals.
12. Admin dashboard, users, destinations, and analytics.

## Case ID Convention

Use stable IDs so report rows remain traceable:

- `FT-AUTH-###` for authentication and sessions.
- `FT-PROFILE-###` for profile management.
- `FT-DIR-###` for eco-directory and location search.
- `FT-FAV-###` for favourites and saved places.
- `FT-TRIP-###` for trips and itinerary.
- `FT-RECO-###` for smart recommendation.
- `FT-WEATHER-###` for weather forecast.
- `FT-ROUTE-###` for eco route planner.
- `FT-CARBON-###` for carbon calculator, insights, offsets, and history.
- `FT-COMMUNITY-###` for community features.
- `FT-ANALYTICS-###` for personal analytics, reports, and goals.
- `FT-ADMIN-###` for admin features.

Avoid reusing an existing ID for a different scenario.

## Required Coverage Per Module

For each module, prepare at least:

- One success case.
- One failure case.
- One edge case.

If a feature has CRUD behavior, cover create, display/read, update, and delete from the UI. If a feature is protected, cover authenticated and unauthenticated access. If a feature has role restrictions, cover authorized and unauthorized roles.

## Module-by-Module Functional Checklist

### Authentication And Sessions

Cover:

- Registration succeeds with valid email, password, username, and role.
- Registration rejects missing fields, invalid email, short password, password mismatch, and duplicate email.
- Login succeeds with valid credentials and routes the user to the correct page.
- Login rejects wrong email/password and shows a clear error.
- Logout clears the session and redirects away from protected pages.
- Protected dashboard/admin pages redirect unauthenticated users to login.
- Authenticated users are redirected away from login/signup pages.
- Non-admin users cannot access admin pages.

Evidence examples:

- Signup form screenshot before submit and resulting dashboard/profile page.
- Login error message screenshot.
- Browser URL after protected-route redirect.
- DevTools application cookie/local storage state where useful.

### Profile Management

Cover:

- Profile page displays username, email, and role.
- Username update succeeds and the new value remains visible after refresh.
- Empty or unchanged username is handled correctly.
- Password change rejects wrong current password.
- Password change succeeds with valid current/new password, old password no longer logs in, and new password works.
- Account deletion requires explicit confirmation.
- Deleted account is logged out and cannot access protected pages.

Evidence examples:

- Profile page before/after screenshots.
- Validation/error messages.
- Login result after password change.

### Eco-Directory And Location Search

Cover:

- Directory loads place cards with names, categories, cities, images, and eco details.
- Search by text filters results.
- City filter returns matching places.
- Category filter returns matching places.
- Combined search, city, and category filters update the URL and results.
- No-result state appears for unmatched filters and clear/reset works.
- Place details page opens for a selected place.
- Broken or missing image data falls back gracefully.

Evidence examples:

- Directory results screenshot.
- URL with query parameters.
- Empty state screenshot.
- Place detail page screenshot.

### Favourites And Saved Places

Cover:

- Guest can favourite a place locally.
- Guest favourites remain visible during the session/browser storage.
- Authenticated user can save and unsave a place.
- Saved page lists the saved place.
- Duplicate favourite action is handled without duplicate visible cards.
- Empty saved state appears when no favourites exist.
- Guest favourites sync or remain handled correctly after login, if the flow is implemented.

Evidence examples:

- Heart/save button state before and after.
- Saved page screenshot.
- Empty saved page screenshot.

### Trips And Green Itinerary

Cover:

- User creates a trip with valid title/date information.
- User can view created trip in the trips list.
- User edits trip details.
- User deletes a trip and it disappears from the list.
- User adds a manual itinerary item.
- User adds a saved place or directory place to an itinerary.
- Required fields and invalid dates are rejected.
- Empty trip list and empty itinerary states render correctly.

Evidence examples:

- Create/edit form screenshots.
- Trip list before/after delete.
- Itinerary item display with schedule/day-part details.

### Smart Recommendation

Cover:

- Recommendation form accepts destination, dates, budget, and interests.
- Valid submission displays ranked recommendations with explanation or score.
- Missing required fields are rejected.
- Unsupported destination or no candidate state is handled.
- Weather-aware or budget-aware explanation appears when available.
- Loading state appears while recommendations are being generated.

Evidence examples:

- Completed form screenshot.
- Recommendation result cards.
- Validation or fallback message screenshot.

### Weather Forecast

Cover:

- Valid destination/date search displays forecast cards.
- Forecast includes user-relevant values such as date, temperature, condition, or precipitation.
- Invalid or unknown location shows an error or empty state.
- Date range edge cases are handled, including no selected date or out-of-supported-range dates.
- Loading state appears during fetch.

Evidence examples:

- Forecast result screenshot.
- Error/empty state screenshot.

### Eco Route Planner

Cover:

- Route planner accepts origin and destination.
- Walking, cycling, and driving alternatives are displayed where available.
- CO2 estimate or savings are displayed.
- Current-location flow behaves correctly when browser geolocation is allowed.
- Geolocation denial shows a useful error or fallback.
- Invalid origin/destination is rejected or shown as unavailable.
- Loading state appears during route lookup.

Evidence examples:

- Route alternatives screenshot.
- CO2 estimate screenshot.
- Browser permission/error state screenshot.

### Carbon Footprint Calculator, Insights, Offsets, And History

Cover:

- Calculator accepts valid flight, car, lodging, rail, bus, or taxi inputs.
- Calculation displays total emissions and category breakdown.
- Invalid numeric input, missing required fields, or negative values are rejected.
- Impact insights identify the largest source or equivalent impact.
- Offset section shows relevant suggestions or external links.
- Authenticated calculation is saved to history.
- History and dashboard carbon summary display saved records.
- Deleting a history entry removes it from the list and summary updates.
- Empty history state is clear.

Evidence examples:

- Calculator input and result screenshots.
- History before/after delete.
- Dashboard summary screenshot.

### Community Reviews, Challenges, Badges, And Leaderboard

Cover:

- Public community page loads reviews/challenges/leaderboard.
- Authenticated user creates a review with rating and text.
- Invalid review input is rejected.
- User edits or updates their own review if supported.
- Helpful vote toggles visible state/count.
- User joins a challenge.
- Progress update changes points, badges, or leaderboard where applicable.
- Empty or unauthenticated restricted actions show the correct prompt.

Evidence examples:

- Review form and created review screenshot.
- Challenge progress screenshot.
- Badge or leaderboard update screenshot.

### Personal Analytics, Sustainability Reports, And Goals

Cover:

- Analytics dashboard loads carbon saved, totals, charts, and detail rows from available data.
- Empty analytics state appears when the user has no carbon records.
- Monthly report download button works when data exists.
- Annual report download button works when data exists.
- Report buttons are disabled or clearly unavailable when no data exists.
- Carbon budget goal can be created or updated.
- Goal progress state changes for on-track, monitor, or alert thresholds where test data allows.
- Invalid goal value is rejected.

Evidence examples:

- Analytics dashboard screenshot.
- Browser download evidence or generated PDF filename.
- Goal setup/progress screenshot.

### Admin Dashboard, Users, Destinations, And Analytics

Cover:

- Admin user can access admin layout and dashboard.
- Non-admin user is redirected or denied.
- Admin users page displays user records.
- Admin destination page displays destination records.
- Destination create/update/delete flows work if the UI exposes them.
- Admin analytics page displays system metrics.
- Empty, loading, and error states are handled.

Evidence examples:

- Admin dashboard screenshot.
- Unauthorized redirect screenshot.
- Admin table before/after CRUD action.

## Standard Test Case Table

Use the columns required by `docs/REQUIREMENTS.md`:

| Test ID | Category | Module/Feature | Scenario | Input/Steps | Expected Result | Actual Result | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FT-AUTH-001 | Functional | Registration | Valid account creation | Open `/signup`, enter valid details, submit | Account is created and user reaches dashboard/profile area | TBD | TBD | Screenshot: TBD |

Status must be `Pass`, `Fail`, or `Blocked`. Use `Blocked` only when the scenario cannot be executed because required setup, credentials, API keys, seed data, or implementation is unavailable.

## Evidence Rules

Every report row needs concrete evidence. Good evidence includes:

- Screenshot filename or short screenshot description.
- Browser URL after navigation.
- Visible validation or success message.
- Visible table/card/list changes before and after an action.
- Downloaded PDF filename.
- Terminal output from a browser test runner.
- Console/network error summary if a scenario fails.

Use evidence filenames that map to test IDs when screenshots are stored, for example:

```text
test/evidence/functional/FT-AUTH-001-valid-signup.png
test/evidence/functional/FT-DIR-003-city-filter.png
```

Do not mark a row `Pass` unless the observed UI behavior matches the expected result.

## Writing The DOCX Report

Use the existing root `docx` dependency. Prefer a repeatable generator script over manual Word edits.

Recommended output:

```text
test/functional-test.docx
```

Recommended generator:

```text
test/generate-functional-test-report.mjs
```

The generator should contain a project-wide data structure, not only one module, so rerunning it preserves every module section.

Minimum generator structure:

```js
import { writeFile } from 'fs/promises'
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx'

const outputPath = 'test/functional-test.docx'

const modules = [
  {
    name: 'Authentication And Session Management',
    objective: 'Verify user-facing registration, login, logout, route protection, and role-aware navigation behavior.',
    environment: 'Manual browser functional test on local frontend and backend.',
    commandOrMethod: 'npm run dev, then test in browser at http://localhost:3000.',
    resultSummary: 'TBD',
    conclusion: 'TBD',
    testCases: [
      {
        id: 'FT-AUTH-001',
        category: 'Functional',
        module: 'Authentication',
        scenario: 'Valid registration creates an account.',
        steps: 'Open /signup, enter valid username, email, password, confirm password, and role, then submit.',
        expected: 'User account is created and the user reaches the correct authenticated area.',
        actual: 'TBD',
        status: 'TBD',
        evidence: 'TBD',
      },
    ],
  },
]

function paragraph(text, options = {}) {
  return new Paragraph({
    ...options,
    children: [new TextRun(text)],
  })
}

function heading(text, level = HeadingLevel.HEADING_1) {
  return paragraph(text, {
    heading: level,
    spacing: { before: 240, after: 120 },
  })
}

function cell(text, bold = false) {
  return new TableCell({
    margins: { top: 80, bottom: 80, left: 80, right: 80 },
    children: [
      new Paragraph({
        children: [new TextRun({ text: String(text), bold })],
      }),
    ],
  })
}

function testCaseTable(testCases) {
  const headers = [
    'Test ID',
    'Category',
    'Module/Feature',
    'Scenario',
    'Input/Steps',
    'Expected Result',
    'Actual Result',
    'Status',
    'Evidence',
  ]

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((header) => cell(header, true)),
      }),
      ...testCases.map((testCase) => new TableRow({
        children: [
          testCase.id,
          testCase.category,
          testCase.module,
          testCase.scenario,
          testCase.steps,
          testCase.expected,
          testCase.actual,
          testCase.status,
          testCase.evidence,
        ].map((value) => cell(value)),
      })),
    ],
  })
}

const children = [
  new Paragraph({
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER,
    children: [new TextRun('Terratrace Project Functional Test Report')],
  }),
  paragraph('Reference: docs/REQUIREMENTS.md'),
  paragraph('Report scope: whole Terratrace project. Each module is documented as its own functional-test section.'),
  heading('Objective'),
  paragraph('Verify that every visible Terratrace system feature behaves according to requirements, including success, failure, and edge-case behavior.'),
  heading('Environment And Tools'),
  paragraph('Tools may include manual browser testing, screenshots, terminal logs, Vitest functional-style tests, or browser automation when available.'),
]

for (const module of modules) {
  children.push(
    heading(`Module Section: ${module.name}`),
    paragraph(`Objective: ${module.objective}`),
    paragraph(`Environment/tools: ${module.environment}`),
    paragraph(`Command or method: ${module.commandOrMethod}`),
    paragraph(`Result summary: ${module.resultSummary}`),
    testCaseTable(module.testCases),
    heading(`${module.name} Evidence Summary`, HeadingLevel.HEADING_2),
    paragraph('Evidence is listed per row in the test case table. Store screenshots under test/evidence/functional when applicable.'),
    heading(`${module.name} Conclusion`, HeadingLevel.HEADING_2),
    paragraph(module.conclusion),
  )
}

const doc = new Document({
  sections: [{ properties: {}, children }],
})

await writeFile(outputPath, await Packer.toBuffer(doc))
console.log(`Wrote ${outputPath}`)
```

Run:

```bash
node test/generate-functional-test-report.mjs
```

Validate the DOCX archive:

```bash
unzip -t test/functional-test.docx
```

Quick title/content check:

```bash
unzip -p test/functional-test.docx word/document.xml | rg "Terratrace Project Functional Test Report|Module Section"
```

## Safe Append Workflow

When adding a new module to the functional report:

1. Run or perform the module's functional tests.
2. Save screenshots/logs using traceable evidence names.
3. Update the `modules` array in `test/generate-functional-test-report.mjs`.
4. Add one section for the module with objective, environment, command/method, table rows, evidence summary, and conclusion.
5. Keep existing module objects in the generator.
6. Regenerate `test/functional-test.docx`.
7. Validate the DOCX with `unzip -t`.
8. Search the DOCX XML for the new module heading.
9. Update `test/test-list.md` if automated functional tests were added.

## Reporting Failures

If a functional test fails and the implementation is not being fixed in the same task:

- Keep the row status as `Fail`.
- Include the exact action that failed.
- Include the visible error, wrong page, missing message, broken state, or console/network issue.
- Attach or reference screenshot/log evidence.
- State the likely source of failure if known.
- Do not change the expected result to match broken behavior.

If a scenario cannot be tested:

- Mark it `Blocked`.
- Explain the blocker, such as missing API key, unavailable seed data, no admin credentials, or no UI control.
- Include what setup is required to unblock it.

## Data Safety

Use disposable test data:

- Prefix test accounts, trips, reviews, destinations, and goals with `functional-test-` or the test ID.
- Do not delete broad real-looking data.
- Avoid testing destructive account deletion on a shared demo account.
- Record credentials for disposable accounts only in local notes or a controlled test credentials file if the user requests it.

## Final Verification Checklist

Before handing off:

- Every major visible module from `docs/feature-implementation-status.md` has planned or completed functional rows.
- Each tested module includes success, failure, and edge cases.
- CRUD modules cover create, display, update, and delete where supported.
- Auth and role restrictions are covered.
- Test rows use the standard columns from `docs/REQUIREMENTS.md`.
- Evidence is concrete and traceable.
- `test/functional-test.docx` exists after report generation.
- Existing report module sections were preserved.
- `unzip -t test/functional-test.docx` reports no errors.
- Any failures or blocked scenarios are documented honestly.
