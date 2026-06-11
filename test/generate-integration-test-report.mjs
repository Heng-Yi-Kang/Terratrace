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

const outputPath = 'test/integration-test.docx'

const modules = [
  {
    name: 'General',
    objective:
      'Verify that authentication, session routing, and protected access work across frontend forms, backend auth APIs, session cookies, middleware, and PostgreSQL user records.',
    tools:
      'Backend Vitest API/database integration tests, Express createApp(), Node fetch, pg, bcrypt, JWT cookies, frontend AuthForm/Login/Signup tests.',
    command:
      'npm run test --workspace=backend -- auth-profile.integration; npm run test --workspace=frontend -- LoginPage SignupPage AuthForm',
    result:
      'Automated backend integration coverage exists for signup, duplicate signup, login, current session lookup, and logout. Frontend tests cover login/signup form integration with page navigation and submit behavior.',
    cases: [
      {
        id: 'IT-GEN-001',
        feature: 'Register new user account',
        scenario: 'Signup form submits account data to the auth API and creates a persisted user.',
        steps:
          'Submit email, password, username, and role through the signup flow; call POST /api/auth/signup; inspect the users table and session cookie.',
        expected:
          'A user row is created with normalized email and hashed password, and the response establishes an authenticated session.',
        actual:
          'Covered by backend auth-profile integration test IT-AUTH-001 and frontend SignupPage/AuthForm tests.',
        status: 'Pass',
        evidence:
          'backend/src/routes/auth-profile.integration.test.ts; frontend/src/app/signup/SignupPage.test.tsx; frontend/src/components/auth/AuthForm.test.tsx',
      },
      {
        id: 'IT-GEN-002',
        feature: 'Login',
        scenario: 'Stored credentials authenticate the user and route them to the correct area.',
        steps:
          'Create a user, attempt login with invalid credentials, then login with the valid password through POST /api/auth/login and frontend login page behavior.',
        expected:
          'Invalid credentials return 401; valid credentials return user data, set terratrace_session, and allow role-aware navigation.',
        actual:
          'Covered by backend auth-profile integration test IT-AUTH-003 and frontend LoginPage tests.',
        status: 'Pass',
        evidence:
          'backend/src/routes/auth-profile.integration.test.ts; frontend/src/app/login/LoginPage.test.tsx',
      },
      {
        id: 'IT-GEN-003',
        feature: 'Logout',
        scenario: 'Authenticated logout terminates the browser session.',
        steps:
          'Call POST /api/auth/logout with a valid session cookie, then request /api/auth/me without a valid cookie.',
        expected:
          'Logout clears terratrace_session and subsequent protected current-user access returns 401.',
        actual: 'Covered by backend auth-profile integration test IT-PROFILE-003.',
        status: 'Pass',
        evidence: 'backend/src/routes/auth-profile.integration.test.ts',
      },
      {
        id: 'IT-GEN-004',
        feature: 'Manage sessions',
        scenario: 'Protected routes and current-user lookups require a valid session.',
        steps:
          'Request /api/auth/me with and without cookies; inspect middleware behavior for dashboard and admin route access.',
        expected:
          'Missing or expired sessions are rejected, valid sessions expose the current user, and protected pages are guarded by middleware.',
        actual:
          'API behavior is covered by backend auth-profile integration test IT-AUTH-004; route protection is implemented in Next middleware.',
        status: 'Pass',
        evidence:
          'backend/src/routes/auth-profile.integration.test.ts; frontend/src/middleware.ts',
      },
    ],
  },
  {
    name: 'Profile Management',
    objective:
      'Verify that authenticated profile operations move correctly between dashboard UI, React Query hooks, backend account APIs, session refresh, and PostgreSQL persistence.',
    tools:
      'Backend Vitest API/database integration tests, frontend ProfileTab and useUser hook tests.',
    command:
      'npm run test --workspace=backend -- auth-profile.integration; npm run test --workspace=frontend -- ProfileTab useUser',
    result:
      'Automated backend integration coverage exists for profile update, password change, and account deletion. Frontend tests cover validation, mutation calls, cache invalidation, and guarded deletion UI.',
    cases: [
      {
        id: 'IT-PROFILE-001',
        feature: 'View profile',
        scenario: 'Dashboard profile view resolves the authenticated user.',
        steps:
          'Use a valid session to call GET /api/auth/me through useUser and render username, email, and role in ProfileTab.',
        expected:
          'Profile identity fields are displayed from the authenticated account record.',
        actual:
          'Covered by current-user API integration and frontend ProfileTab/useUser tests.',
        status: 'Pass',
        evidence:
          'backend/src/routes/auth-profile.integration.test.ts; frontend/src/components/dashboard/ProfileTab.test.tsx; frontend/src/hooks/useUser.test.tsx',
      },
      {
        id: 'IT-PROFILE-002',
        feature: 'Update profile',
        scenario: 'Username changes persist and refresh the authenticated session.',
        steps:
          'PATCH /api/auth/me with a new username, query PostgreSQL, and call GET /api/auth/me again.',
        expected:
          'The users row updates, the response refreshes the cookie, and the next current-user response returns the new username.',
        actual: 'Covered by backend auth-profile integration test IT-PROFILE-001.',
        status: 'Pass',
        evidence: 'backend/src/routes/auth-profile.integration.test.ts',
      },
      {
        id: 'IT-PROFILE-003',
        feature: 'Delete/Deactivate User Account',
        scenario: 'Account deletion removes the user and invalidates the old session.',
        steps:
          'DELETE /api/user/account with a valid cookie, query users, then reuse the old cookie against /api/auth/me.',
        expected:
          'The user row is removed, cascading application data is eligible for deletion by schema constraints, and the old session no longer resolves.',
        actual: 'Covered by backend auth-profile integration test IT-PROFILE-004.',
        status: 'Pass',
        evidence: 'backend/src/routes/auth-profile.integration.test.ts; db/init/001_schema.sql',
      },
      {
        id: 'IT-PROFILE-004',
        feature: 'Change password',
        scenario: 'Password update replaces the active credential.',
        steps:
          'Call PATCH /api/auth/password first with the wrong current password, then with the correct current password; retry old and new logins.',
        expected:
          'Wrong current password fails, correct update succeeds, old login fails, and new login succeeds.',
        actual: 'Covered by backend auth-profile integration test IT-PROFILE-002.',
        status: 'Pass',
        evidence: 'backend/src/routes/auth-profile.integration.test.ts',
      },
    ],
  },
  {
    name: 'Eco-friendly Directory Module',
    objective:
      'Verify that sustainable location discovery flows across backend location APIs, PostgreSQL location data, filter utilities, and directory UI components.',
    tools:
      'Backend Vitest API/database integration tests with Express createApp(), Node fetch, pg, PostgreSQL seed rows, authenticated session cookies, plus frontend Vitest component and utility tests.',
    command:
      'npm run test --workspace=backend -- eco-directory.integration; npm run test --workspace=frontend -- locationFilters EcoDirectoryClient PlaceCard SearchBar useFavourites',
    result:
      'Backend API/database integration passed for directory list, search filters, cities, details, recommendations, and authenticated favourites persistence. Frontend integration-style coverage passed for URL-backed filtering, pagination, loading/error states, place cards, search behavior, and guest favourite sync.',
    cases: [
      {
        id: 'IT-DIR-001',
        feature: 'Sustainable Directory',
        scenario: 'Directory UI loads sustainable accommodations, dining, and transport places from the locations API.',
        steps:
          'Seed PostgreSQL locations across Accommodation, Dining, and Transport; call GET /api/locations with a unique query prefix; render EcoDirectoryClient with realistic mocked API data and verify category counts, cards, details, and detail links.',
        expected:
          'Users can compare sustainable places with names, categories, city data, images, and eco certifications.',
        actual:
          'GET /api/locations returned three seeded rows ordered by name with mapped category labels, city/country data, ecoCerts, ecoTags, publicId, and generated bookingUrl. Frontend card/catalog tests also passed.',
        status: 'Pass',
        evidence:
          'backend/src/routes/eco-directory.integration.test.ts; frontend/src/app/eco-directory/components/EcoDirectoryClient.test.tsx; frontend/src/app/eco-directory/components/PlaceCard.test.tsx',
      },
      {
        id: 'IT-DIR-002',
        feature: 'Geo-Specific Search',
        scenario: 'Search, city, and category filters update the URL and drive API query parameters.',
        steps:
          'Call GET /api/locations with q, city, and category parameters; call GET /api/locations/cities; submit search text, select city/category filters, and verify URL/query construction plus filtered UI behavior.',
        expected:
          'Only valid non-empty filters are sent to the backend, and directory state remains shareable through URL search params.',
        actual:
          'GET /api/locations?q=solar&city=Kuala Lumpur&category=Accommodation returned only the seeded Solar Canopy Lodge, unsupported category returned 400, and /api/locations/cities included Kuala Lumpur and Penang. Frontend filter tests also passed.',
        status: 'Pass',
        evidence:
          'backend/src/routes/eco-directory.integration.test.ts; frontend/src/utils/locationFilters.test.ts; frontend/src/app/eco-directory/components/SearchBar.test.tsx',
      },
      {
        id: 'IT-DIR-003',
        feature: 'Place Details and Recommendations',
        scenario: 'Directory detail pages retrieve a selected place and same-category recommendations from backend location data.',
        steps:
          'Call GET /api/locations/:publicId for a seeded dining place, call the same route for a missing publicId, then call GET /api/locations/recommendations with category and city filters.',
        expected:
          'Existing public IDs return full mapped place details, missing public IDs return 404, and recommendation requests return same-category place cards.',
        actual:
          'The seeded Compost Kitchen detail returned id, publicId, category, and description; a missing publicId returned 404; category/city recommendations included the seeded Kuala Lumpur accommodation.',
        status: 'Pass',
        evidence:
          'backend/src/routes/eco-directory.integration.test.ts; backend/src/routes/locations.ts',
      },
      {
        id: 'IT-DIR-004',
        feature: 'Favorites System',
        scenario: 'Authenticated favourites persist through API calls and guest favourites sync after login.',
        steps:
          'Signup through POST /api/auth/signup, save a seeded location through POST /api/favourites with the session cookie, inspect user_favourites, list saved places, reject duplicate saves, delete the favourite, and run frontend useFavourites sync tests.',
        expected:
          'Saved places are retained for authenticated users, guest saves survive locally, and successful login sync clears uploaded local favourites.',
        actual:
          'Missing session returned 401; authenticated save returned 201 with favouriteId and savedAt; user_favourites row count became 1; duplicate save returned 409; GET /api/favourites returned the mapped saved place; DELETE removed the row. Frontend hook tests covered local fallback, sync success, and partial sync failure.',
        status: 'Pass',
        evidence:
          'backend/src/routes/eco-directory.integration.test.ts; frontend/src/hooks/useFavourites.test.tsx; backend/src/routes/favourites.ts; db/init/001_schema.sql',
      },
    ],
  },
  {
    name: 'Green Itinerary Module',
    objective:
      'Verify that trip planning, saved-place insertion, recommendations, and weather context connect frontend planning screens with trips, locations, recommendation, and weather APIs.',
    tools:
      'Implementation verification of backend route wiring and frontend dashboard components. No dedicated automated trip/recommendation/weather integration test file is currently present.',
    command:
      'Recommended: npm run test --workspace=backend -- trips smart-recommendation weather; npm run test --workspace=frontend -- TripsTab SmartRecommendation',
    result:
      'Feature implementation is present across route, schema, and UI files. Additional automated API/database integration tests are recommended for trip CRUD, trip items, weather fallback, and recommendation scoring.',
    cases: [
      {
        id: 'IT-TRIP-001',
        feature: 'Itinerary Creator',
        scenario: 'Users create date-specific trips and add itinerary items from manual entries or directory places.',
        steps:
          'Create/edit/delete a trip through TripsTab, persist items through /api/trips, and resolve linked location metadata for View place actions.',
        expected:
          'Trips and trip_items persist per authenticated user, linked locations survive location deletion through ON DELETE SET NULL, and dashboard reloads show saved itinerary data.',
        actual:
          'Implemented in dashboard trip UI, backend trips route, and schema relationships; no dedicated automated integration test file was found.',
        status: 'Implemented; automation recommended',
        evidence:
          'frontend/src/components/dashboard/TripsTab.tsx; backend/src/routes/trips.ts; db/init/001_schema.sql',
      },
      {
        id: 'IT-RECO-001',
        feature: 'Smart Recommendations',
        scenario: 'Recommendation requests combine city, dates, budget, interests, weather, and directory candidates.',
        steps:
          'Submit recommendation form to POST /api/recommendations/smart and inspect scored candidates and AI/fallback rationale.',
        expected:
          'The API returns lower-impact destination/activity recommendations with explainable scoring using interest, budget, eco, and weather context.',
        actual:
          'Implemented in frontend recommendation pages/components and backend smart recommendation route; automated integration test is recommended.',
        status: 'Implemented; automation recommended',
        evidence:
          'frontend/src/app/smart-recommendation/page.tsx; frontend/src/components/smart-recommendation-section.tsx; backend/src/routes/smart-recommendation.ts',
      },
      {
        id: 'IT-WEATHER-001',
        feature: 'Weather Integration',
        scenario: 'Destination weather forecasts are fetched and used by recommendation flows.',
        steps:
          'Call GET /api/weather/forecast for a destination/date range and verify rendered forecast cards plus recommendation weather context.',
        expected:
          'Forecast data returns for selected dates and can influence recommendation scoring.',
        actual:
          'Implemented through WeatherForecastSection and backend Open-Meteo route; automated integration test is recommended.',
        status: 'Implemented; automation recommended',
        evidence:
          'frontend/src/components/weather-forecast-section.tsx; backend/src/routes/weather.ts; backend/src/routes/smart-recommendation.ts',
      },
    ],
  },
  {
    name: 'Carbon Footprint Module',
    objective:
      'Verify that travel emissions are calculated, summarized, saved, and made available to dashboard history and analytics modules.',
    tools:
      'Implementation verification of carbon APIs, calculator utility, dashboard/history UI, and analytics integration tests that consume carbon_entries.',
    command:
      'Recommended: npm run test --workspace=backend -- carbon analytics.integration; npm run test --workspace=frontend -- carbon analytics',
    result:
      'Analytics integration tests validate downstream use of persisted carbon_entries. Dedicated carbon calculator API integration tests are recommended for calculate/history/delete endpoints.',
    cases: [
      {
        id: 'IT-CARBON-001',
        feature: 'Emission Calculator',
        scenario: 'Calculator inputs are posted to the backend and persisted for authenticated users.',
        steps:
          'Submit flight, car, hotel, rail, bus, and taxi inputs to POST /api/carbon/calculate; inspect returned totals and carbon_entries persistence.',
        expected:
          'The API returns total and category emissions, then saves authenticated calculations to PostgreSQL.',
        actual:
          'Implemented in carbon page, carbon route, calculator utility, and carbon_entries table; downstream analytics tests insert and read equivalent records.',
        status: 'Implemented; automation recommended',
        evidence:
          'frontend/src/app/carbonFootprint/page.tsx; backend/src/routes/carbon.ts; backend/src/utils/carbonCalculator.ts; backend/src/routes/analytics.integration.test.ts',
      },
      {
        id: 'IT-CARBON-002',
        feature: 'Impact Insights',
        scenario: 'Saved calculation data appears as totals, category breakdowns, and largest-source guidance.',
        steps:
          'Calculate emissions, request /api/carbon/summary and /api/carbon/history, then verify dashboard carbon insight cards and charts.',
        expected:
          'Users see total emissions, calculation count, average emissions, breakdowns, period charts, and guidance.',
        actual:
          'Implemented in carbon routes and dashboard CarbonTab/history pages; analytics integration validates summary-style aggregation over carbon_entries.',
        status: 'Implemented; automation recommended',
        evidence:
          'frontend/src/components/dashboard/CarbonTab.tsx; frontend/src/app/carbonFootprint/history/page.tsx; backend/src/routes/carbon.ts; backend/src/routes/analytics.integration.test.ts',
      },
      {
        id: 'IT-CARBON-003',
        feature: 'Offset Integration',
        scenario: 'Calculated emissions produce offset suggestions and external credit/reduction links.',
        steps:
          'Complete a calculation and verify tree-equivalent offsets, personalized reduction tips, and external offset links.',
        expected:
          'The result view gives actionable offset and reduction options based on the calculation output.',
        actual:
          'Implemented in the carbon footprint UI; automated UI integration test is recommended.',
        status: 'Implemented; automation recommended',
        evidence: 'frontend/src/app/carbonFootprint/page.tsx',
      },
    ],
  },
  {
    name: 'Community Impact Module',
    objective:
      'Verify that community reviews, helpful votes, challenge progress, badges, points, and leaderboard data connect frontend hooks with backend community APIs and persistence tables.',
    tools:
      'Frontend useCommunity hook tests and implementation verification of backend community route and schema tables.',
    command: 'npm run test --workspace=frontend -- useCommunity',
    result:
      'Frontend hook integration-style tests cover public data loading, review creation invalidation, helpful votes, challenge joining, and progress updates. Backend API/database integration tests are recommended.',
    cases: [
      {
        id: 'IT-COMMUNITY-001',
        feature: 'Eco-Reviews & Ratings',
        scenario: 'Users view, create, edit, and interact with sustainable location reviews.',
        steps:
          'Load public community data, create a review, and toggle helpful votes through useCommunity and /api/community/reviews.',
        expected:
          'Review data persists through community_reviews, helpful votes persist per user, and cached review/challenge data refreshes.',
        actual:
          'Covered at frontend hook/API-boundary level by useCommunity tests; backend persistence is implemented.',
        status: 'Pass',
        evidence:
          'frontend/src/hooks/useCommunity.test.tsx; backend/src/routes/community.ts; db/init/001_schema.sql',
      },
      {
        id: 'IT-COMMUNITY-002',
        feature: 'Community Challenges',
        scenario: 'Authenticated users join challenges, advance progress, and receive badges/points.',
        steps:
          'Join a challenge and update progress through useCommunity and /api/community/challenges.',
        expected:
          'Challenge progress, badges, points, and leaderboard data update consistently for the current user.',
        actual:
          'Covered at frontend hook/API-boundary level by useCommunity tests; backend persistence is implemented.',
        status: 'Pass',
        evidence:
          'frontend/src/hooks/useCommunity.test.tsx; backend/src/routes/community.ts; db/init/001_schema.sql',
      },
    ],
  },
  {
    name: 'Analytics and Reporting Module',
    objective:
      'Verify that saved carbon calculations feed authenticated impact summaries, downloadable reports, and annual budget goals across backend APIs and dashboard UI.',
    tools:
      'Backend Vitest API/database integration tests and frontend dashboard analytics tests with PDF generation mocks.',
    command:
      'npm run test --workspace=backend -- analytics.integration; npm run test --workspace=frontend -- dashboard/analytics',
    result:
      'Automated backend integration coverage exists for impact authentication, empty summaries, year filtering, per-user isolation, goal create/read/update, and invalid goal validation. Frontend tests cover empty states, metrics, PDF generation, goal save, and alert state.',
    cases: [
      {
        id: 'IT-ANALYTICS-001',
        feature: 'Personal Impact Dashboard',
        scenario: 'Authenticated carbon_entries are aggregated into impact dashboard metrics.',
        steps:
          'Create users, insert carbon_entries for multiple years and users, call /api/analytics/impact for all/year periods, and render dashboard metrics.',
        expected:
          'The API isolates the current user, filters by period, returns saved carbon values, tree equivalents, breakdowns, over-time data, and entries.',
        actual:
          'Covered by backend analytics integration tests and frontend dashboard analytics tests.',
        status: 'Pass',
        evidence:
          'backend/src/routes/analytics.integration.test.ts; frontend/src/app/dashboard/analytics/page.test.tsx',
      },
      {
        id: 'IT-ANALYTICS-002',
        feature: 'Sustainability Reports',
        scenario: 'Monthly and annual PDF actions use the same impact data shown on screen.',
        steps:
          'Load monthly/year impact data, verify report buttons are disabled for empty periods, and click Generate Report when records exist.',
        expected:
          'PDF generation is available only when saved records exist and exports the expected report file.',
        actual:
          'Covered by frontend dashboard analytics tests with jsPDF and autotable mocked.',
        status: 'Pass',
        evidence: 'frontend/src/app/dashboard/analytics/page.test.tsx',
      },
      {
        id: 'IT-ANALYTICS-003',
        feature: 'Goal Setting',
        scenario: 'Users create and update annual carbon budgets and receive progress/alert calculations.',
        steps:
          'PUT /api/analytics/goal, GET /api/analytics/goal, seed current-year emissions, and render saved-goal progress.',
        expected:
          'Goals persist per user/year, invalid budgets are rejected, used/remaining/percent values are calculated from carbon_entries, and alert states render near budget limits.',
        actual:
          'Covered by backend analytics integration tests and frontend dashboard analytics tests.',
        status: 'Pass',
        evidence:
          'backend/src/routes/analytics.integration.test.ts; frontend/src/app/dashboard/analytics/page.test.tsx',
      },
    ],
  },
  {
    name: 'Additional Integrated Capabilities',
    objective:
      'Record integration coverage for project capabilities listed as implemented outside the original feature matrix.',
    tools:
      'Implementation verification of route/component wiring and schema evidence.',
    command: 'Recommended: add targeted backend API/database integration tests for eco-route and admin modules.',
    result:
      'Eco route planning, carbon history, todos, and admin pages are implemented. Dedicated automated integration tests are recommended where not already covered by related module tests.',
    cases: [
      {
        id: 'IT-ROUTE-001',
        feature: 'Eco route planning',
        scenario: 'Users compare walking, cycling, and driving routes with ETA and CO2 estimates.',
        steps:
          'Submit origin/destination through the route planner and call backend eco-route geocoding/routing endpoints.',
        expected:
          'The UI renders route options with distance, ETA, and relative emissions.',
        actual:
          'Implemented in frontend route planner component and backend eco-route route; automated integration test is recommended.',
        status: 'Implemented; automation recommended',
        evidence:
          'frontend/src/components/eco-route-planner-section.tsx; backend/src/routes/eco-route.ts',
      },
      {
        id: 'IT-ADMIN-001',
        feature: 'Admin dashboard, destinations, users, and analytics',
        scenario: 'Admin-only pages are protected and expose operational views for users, destinations, and analytics.',
        steps:
          'Authenticate as admin, navigate /admin routes, and verify role-aware middleware and admin components.',
        expected:
          'Only admin sessions can access admin pages, and admin tabs render destination/user/analytics data flows.',
        actual:
          'Implemented through admin pages, shared sidebar, and role-aware middleware; automated admin integration tests are recommended.',
        status: 'Implemented; automation recommended',
        evidence:
          'frontend/src/app/admin; frontend/src/components/admin; frontend/src/middleware.ts',
      },
    ],
  },
]

function paragraph(text, options = {}) {
  return new Paragraph({
    ...options,
    spacing: options.spacing || { after: 120 },
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
        children: [new TextRun({ text, bold })],
      }),
    ],
  })
}

function makeTable(cases) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          'Test ID',
          'Feature',
          'Integration Scenario',
          'Input / Steps',
          'Expected Result',
          'Actual Result',
          'Status',
          'Evidence',
        ].map((label) => cell(label, true)),
      }),
      ...cases.map((testCase) =>
        new TableRow({
          children: [
            testCase.id,
            testCase.feature,
            testCase.scenario,
            testCase.steps,
            testCase.expected,
            testCase.actual,
            testCase.status,
            testCase.evidence,
          ].map((value) => cell(value)),
        }),
      ),
    ],
  })
}

const children = [
  new Paragraph({
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER,
    children: [new TextRun('Terratrace Project-Wide Integration Test Report')],
  }),
  paragraph('Generated date: 2026-06-11'),
  paragraph('Primary reference: docs/feature-implementation-status.md'),
  paragraph('Scope: whole Terratrace project, organized by the module parts listed in the feature implementation status document.'),
  heading('Objective'),
  paragraph(
    'This report documents project-wide integration testing for Terratrace by tracing each feature through the connected UI, API, authentication, database, and reporting layers that make the feature operational.',
  ),
  heading('Evidence Levels'),
  paragraph(
    'Pass means automated test coverage exists in the repository for the integration path or a closely matching API/UI integration boundary. Implemented; automation recommended means the connected implementation is present and documented from code evidence, but a dedicated automated integration test should still be added.',
  ),
  heading('Environment And Tools'),
  paragraph('Backend stack: Express, Vitest, Node fetch, pg, PostgreSQL, bcryptjs, JWT session cookies, and route-level API tests.'),
  paragraph('Frontend stack: Next.js, React, Vitest, Testing Library, React Query, MSW or mocked fetch boundaries, and PDF generation mocks where applicable.'),
  paragraph('Primary commands: npm run test --workspace=backend and npm run test --workspace=frontend, with targeted filters shown per module section.'),
  heading('Coverage Summary'),
  paragraph(`Module sections: ${modules.length}. Integration scenarios documented: ${modules.reduce((total, module) => total + module.cases.length, 0)}.`),
  paragraph('Automated evidence is strongest for General/Auth, Profile Management, Eco-friendly Directory API/database flows, Community frontend hooks, and Analytics/Reporting. Dedicated automated API/database tests are still recommended for trips, recommendations, weather, carbon calculate/history, eco-route, and admin workflows.'),
]

for (const module of modules) {
  children.push(heading(`Module Section: ${module.name}`))
  children.push(paragraph(`Objective: ${module.objective}`))
  children.push(paragraph(`Tools: ${module.tools}`))
  children.push(paragraph(`Command: ${module.command}`))
  children.push(paragraph(`Result: ${module.result}`))
  children.push(makeTable(module.cases))
  children.push(paragraph(`Module conclusion: ${module.cases.filter((testCase) => testCase.status === 'Pass').length} of ${module.cases.length} scenarios have automated pass evidence; the rest are implemented integration paths that should receive dedicated automated tests as the suite expands.`))
}

children.push(heading('Conclusion'))
children.push(
  paragraph(
    'Terratrace has integration coverage across the main authentication/profile, eco-friendly directory, favourites, and analytics flows, frontend integration-style coverage for community and reporting interactions, and implemented cross-layer behavior for itinerary, recommendation, weather, carbon, route, and admin modules. The next testing priority is to convert the remaining implemented-but-not-automated rows into backend API/database integration tests using disposable records and the existing Express createApp pattern.',
  ),
)

const doc = new Document({
  sections: [
    {
      properties: {},
      children,
    },
  ],
})

await writeFile(outputPath, await Packer.toBuffer(doc))
console.log(`Wrote ${outputPath}`)
