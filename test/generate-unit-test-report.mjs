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

const outputPath = 'test/unit-test.docx'
const reportDate = '2026-06-11'

const suites = [
  {
    name: 'Frontend project unit tests',
    command: 'npm run test --workspace=frontend',
    environment: 'Vitest v4.1.5, jsdom, React Testing Library',
    files: '20 passed / 20',
    tests: '93 passed / 93',
    status: 'Pass',
    notes: 'Runner emitted localStorage and jsdom scrollTo warnings; they did not fail assertions.',
  },
  {
    name: 'Backend project unit tests',
    command: 'npm run test --workspace=backend -- src/utils/auth.test.ts src/utils/analytics.test.ts src/middleware/auth.test.ts src/utils/carbonCalculator.test.ts',
    environment: 'Vitest v4.1.5, Node.js',
    files: '4 passed / 4',
    tests: '22 passed / 22',
    status: 'Pass',
    notes: 'Auth helpers, analytics utility, auth middleware, and carbon calculator utility all passed.',
  },
]

const modules = [
  {
    name: 'General',
    objective: 'Validate the general authentication features from the feature matrix: register new user account, login, logout/session helper behavior, and session validation boundaries.',
    command: 'npm run test --workspace=frontend -- AuthForm LoginPage SignupPage UserSidebar; npm run test --workspace=backend -- src/utils/auth.test.ts src/middleware/auth.test.ts',
    result: 'Frontend auth/page/sidebar files passed; backend auth helper and middleware files passed. Retained rows summarize the most significant isolated unit assertions for general auth behavior.',
    isolation: 'Next.js navigation, auth utilities, bcrypt/JWT helpers, and Express request/response objects are mocked or controlled. Components are rendered with Testing Library and backend helpers are invoked directly.',
    cases: [
      ['UT-AUTH-001', 'AuthForm', 'Login mode renders email, password, and submit controls.', 'Pass', 'Vitest output: passed src/components/auth/AuthForm.test.tsx > AuthForm > Login Mode > renders login form correctly.'],
      ['UT-AUTH-004', 'AuthForm', 'Mismatched signup passwords are rejected.', 'Pass', 'Vitest output: passed src/components/auth/AuthForm.test.tsx > AuthForm > Signup Mode > prevents submission when passwords do not match.'],
      ['UT-AUTH-005', 'AuthForm', 'Valid login submits normalized email and password.', 'Pass', 'Vitest output: passed src/components/auth/AuthForm.test.tsx > AuthForm > Login Mode > calls onSubmit with email and password on valid submit.'],
      ['UT-AUTH-007', 'LoginPage', 'Successful login redirects to role-aware dashboard path.', 'Pass', 'Vitest output: passed src/app/login/LoginPage.test.tsx > LoginPage > Success State > navigates to dashboard on successful login.'],
      ['UT-AUTH-008', 'LoginPage', 'Failed login displays API error and avoids navigation.', 'Pass', 'Vitest output: passed src/app/login/LoginPage.test.tsx > LoginPage > Error State > displays error message on failed login.'],
      ['UT-AUTH-010', 'SignupPage', 'Successful signup calls auth helper and redirects.', 'Pass', 'Vitest output: passed src/app/signup/SignupPage.test.tsx > SignupPage > creates an account and navigates to the role-aware redirect path.'],
      ['UT-BACKEND-AUTH-003', 'auth helpers', 'Sign and verify a session token.', 'Pass', 'Vitest output: passed src/utils/auth.test.ts > auth helpers > signs and verifies a session token.'],
      ['UT-BACKEND-AUTH-004', 'auth helpers', 'Reject malformed and expired session tokens.', 'Pass', 'Vitest output: passed src/utils/auth.test.ts > auth helpers > rejects malformed and expired session tokens.'],
      ['UT-BACKEND-AUTH-006', 'requireAuth', 'Attach user and continue for valid bearer session.', 'Pass', 'Vitest output: passed src/middleware/auth.test.ts > requireAuth > attaches a user and continues for a valid bearer session.'],
    ],
  },
  {
    name: 'Profile Management',
    objective: 'Validate profile management features from the feature matrix: view profile, update profile, delete/deactivate account, and change password.',
    command: 'npm run test --workspace=frontend -- useUser ProfileTab',
    result: '2 frontend files passed. Retained profile rows focus on profile data, update, password-error, and deletion safeguards.',
    isolation: 'React Query hooks, user mutations, and profile component state are mocked or controlled. Components are rendered with Testing Library and hook behavior is verified through a local query client.',
    cases: [
      ['UT-PROFILE-001', 'useUser', 'Current-user hook returns mocked authenticated user.', 'Pass', 'Vitest output: passed src/hooks/useUser.test.tsx > useUser hooks > fetches the current user.'],
      ['UT-PROFILE-002', 'useUpdateUser', 'Profile update invalidates cached user query.', 'Pass', 'Vitest output: passed src/hooks/useUser.test.tsx > useUser hooks > invalidates the user query after profile update.'],
      ['UT-PROFILE-003', 'useDeleteAccount', 'Account deletion clears query cache.', 'Pass', 'Vitest output: passed src/hooks/useUser.test.tsx > useUser hooks > clears the query cache after account deletion.'],
      ['UT-PROFILE-004', 'useChangePassword', 'Password-change API errors propagate.', 'Pass', 'Vitest output: passed src/hooks/useUser.test.tsx > useUser hooks > propagates password change API errors.'],
      ['UT-PROFILE-005', 'ProfileTab', 'Profile identity fields render from user data.', 'Pass', 'Vitest output: passed src/components/dashboard/ProfileTab.test.tsx > ProfileTab > displays username, email, and role.'],
      ['UT-PROFILE-008', 'ProfileTab', 'Changed username calls mutation and shows success feedback.', 'Pass', 'Vitest output: passed src/components/dashboard/ProfileTab.test.tsx > ProfileTab > updates username and shows success feedback.'],
    ],
  },
  {
    name: 'Eco-friendly Directory Module',
    objective: 'Validate eco-directory features from the feature matrix: sustainable directory display, geo-specific search, and favourites.',
    command: 'npm run test --workspace=frontend -- locationFilters SearchBar PlaceCard EcoDirectoryClient useFavourites',
    result: '5 frontend files passed. Retained directory rows focus on filter construction, URL state, pagination, edge states, and favourite persistence.',
    isolation: 'Location hooks, router functions, image subcomponents, catalog data, auth state, fetch, localStorage, mutation responses, and QueryClient invalidation are controlled. Pure filter utilities are tested directly.',
    cases: [
      ['UT-ECO-002', 'locationFilters', 'Trim valid filter values before building API URL.', 'Pass', 'Vitest output: passed src/utils/locationFilters.test.ts > locationFilters > trims valid filter values before building the API URL.'],
      ['UT-ECO-008', 'PlaceCard', 'Render place details and eco certifications.', 'Pass', 'Vitest output: passed src/app/eco-directory/components/PlaceCard.test.tsx > PlaceCard > renders place details and eco certifications.'],
      ['UT-ECO-010', 'EcoDirectoryClient', 'Render category counts and first page from mocked data.', 'Pass', 'Vitest output: passed src/app/eco-directory/components/EcoDirectoryClient.test.tsx > EcoDirectoryClient > renders category counts and the first page of places from mocked location data.'],
      ['UT-ECO-012', 'EcoDirectoryClient', 'Update URL when search, city, and category filters change.', 'Pass', 'Vitest output: passed src/app/eco-directory/components/EcoDirectoryClient.test.tsx > EcoDirectoryClient > updates the URL when search, city, and category filters change.'],
      ['UT-ECO-014', 'EcoDirectoryClient', 'Show empty state and clear active filters.', 'Pass', 'Vitest output: passed src/app/eco-directory/components/EcoDirectoryClient.test.tsx > EcoDirectoryClient > shows an empty state and clears active filters.'],
      ['UT-FAV-002', 'useFavourites', 'Logged-out user receives localStorage favourites.', 'Pass', 'Vitest output: passed src/hooks/useFavourites.test.tsx > useFavourites Hooks > useFavourites > returns localStorage items when logged out.'],
      ['UT-FAV-003', 'useFavourites', 'Hook data updates when a local favourite is added.', 'Pass', 'Vitest output: passed src/hooks/useFavourites.test.tsx > useFavourites Hooks > useFavourites > updates data when new local favourite is added.'],
      ['UT-FAV-005', 'useSyncFavourites', 'Successful sync uploads all favourites and clears local storage.', 'Pass', 'Vitest output: passed src/hooks/useFavourites.test.tsx > useFavourites Hooks > useSyncFavourites > syncs all favorites successfully and clears local storage.'],
      ['UT-FAV-006', 'useSyncFavourites', 'Partial sync failure retains only failed favourites.', 'Pass', 'Vitest output: passed src/hooks/useFavourites.test.tsx > useFavourites Hooks > useSyncFavourites > retains only the failed favorites in local storage when some uploads fail.'],
    ],
  },
  {
    name: 'Green Itinerary Module',
    objective: 'Track unit-test coverage for itinerary creator, smart recommendations, and weather integration features from the feature matrix.',
    command: 'npm run test --workspace=frontend -- useTrips smart-recommendation-section weather-forecast-section',
    result: '3 frontend files passed. Retained itinerary rows focus on payload normalization, recommendation status, API error handling, save flow, and forecast filtering.',
    isolation: 'Payload helpers are invoked directly. Smart recommendation and weather components are rendered with Testing Library while fetch, Next.js Link/Image, and save callbacks are mocked or controlled.',
    cases: [
      ['UT-ITINERARY-001', 'localTripToPayload', 'Convert legacy saved recommendation trip into normalized trip payload.', 'Pass', 'Vitest output: passed src/hooks/useTrips.test.tsx > useTrips payload helpers > converts a legacy recommendation trip into a trip payload.'],
      ['UT-ITINERARY-004', 'recommendationTripToPayload', 'Map recommendation plan items into itinerary items for upcoming trips.', 'Pass', 'Vitest output: passed src/hooks/useTrips.test.tsx > useTrips payload helpers > maps recommendations into itinerary items and marks future trips upcoming.'],
      ['UT-ITINERARY-005', 'recommendationTripToPayload', 'Mark recommendation payloads completed when end date is in the past.', 'Pass', 'Vitest output: passed src/hooks/useTrips.test.tsx > useTrips payload helpers > marks recommendation payloads completed when the end date is in the past.'],
      ['UT-ITINERARY-006', 'SmartRecommendationSection', 'Block blank-city submission before API call.', 'Pass', 'Vitest output: passed src/components/smart-recommendation-section.test.tsx > SmartRecommendationSection > renders validation errors without calling the API.'],
      ['UT-ITINERARY-007', 'SmartRecommendationSection', 'Render successful smart recommendation response.', 'Pass', 'Vitest output: passed src/components/smart-recommendation-section.test.tsx > SmartRecommendationSection > renders successful recommendation results.'],
      ['UT-ITINERARY-008', 'SmartRecommendationSection', 'Render failed smart recommendation API error.', 'Pass', 'Vitest output: passed src/components/smart-recommendation-section.test.tsx > SmartRecommendationSection > renders API errors from failed recommendation responses.'],
      ['UT-ITINERARY-009', 'SmartRecommendationSection', 'Save recommendation as itinerary payload.', 'Pass', 'Vitest output: passed src/components/smart-recommendation-section.test.tsx > SmartRecommendationSection > generates an itinerary payload when saving a recommendation.'],
      ['UT-ITINERARY-012', 'WeatherForecastSection', 'Filter forecast cards by selected date range.', 'Pass', 'Vitest output: passed src/components/weather-forecast-section.test.tsx > WeatherForecastSection > filters rendered forecast days by selected dates.'],
    ],
  },
  {
    name: 'Carbon Footprint Module',
    objective: 'Track unit-test coverage for emission calculator, impact insights, and offset integration features from the feature matrix.',
    command: 'npm run test --workspace=frontend -- calculate CarbonOffset ImpactInsights; npm run test --workspace=backend -- src/utils/carbonCalculator.test.ts',
    result: '3 frontend files and 1 backend file passed. Retained carbon rows focus on representative emissions math, aggregation, offsets, insights, and recommendations.',
    isolation: 'Frontend and backend calculator helpers are invoked directly. CarbonOffset and ImpactInsights are rendered with Testing Library while framer-motion in-view behavior and the doughnut chart are mocked.',
    cases: [
      ['UT-CARBON-001', 'backend CalcTotal', 'Calculate flight return-trip emissions.', 'Pass', 'Vitest output: passed src/utils/carbonCalculator.test.ts > carbon calculator utility > calculates flight economy return emissions.'],
      ['UT-CARBON-007', 'backend CalcTotal', 'Aggregate mixed trip emissions by category and total.', 'Pass', 'Vitest output: passed src/utils/carbonCalculator.test.ts > carbon calculator utility > aggregates emissions by travel category and total.'],
      ['UT-CARBON-008', 'frontend calculate', 'Calculate representative frontend trip emissions by type.', 'Pass', 'Vitest output: passed src/app/carbonFootprint/constant/calculate.test.ts > frontend carbon calculation helpers > calculates flight, car, hotel, rail, bus, and taxi emissions.'],
      ['UT-CARBON-009', 'frontend CalcTotal', 'Aggregate frontend category emissions and total.', 'Pass', 'Vitest output: passed src/app/carbonFootprint/constant/calculate.test.ts > frontend carbon calculation helpers > totals category emissions for mixed trips.'],
      ['UT-CARBON-013', 'CarbonOffset', 'Show tips for highest emission source.', 'Pass', 'Vitest output: passed src/app/carbonFootprint/sections/CarbonOffset.test.tsx > CarbonOffset > shows reduction tips for the highest emission source.'],
      ['UT-CARBON-015', 'ImpactInsights', 'Render total emissions and tree equivalent.', 'Pass', 'Vitest output: passed src/app/carbonFootprint/sections/ImpactInsights.test.tsx > ImpactInsights > renders totals, breakdown, chart percentages, and tree equivalent.'],
      ['UT-CARBON-016', 'ImpactInsights', 'Render doughnut chart percentages from category breakdown.', 'Pass', 'Vitest output: passed src/app/carbonFootprint/sections/ImpactInsights.test.tsx > ImpactInsights > renders totals, breakdown, chart percentages, and tree equivalent.'],
      ['UT-CARBON-018', 'ImpactInsights', 'Identify highest-impact source and recommendation.', 'Pass', 'Vitest output: passed src/app/carbonFootprint/sections/ImpactInsights.test.tsx > ImpactInsights > identifies the highest-impact source and recommendation text.'],
    ],
  },
  {
    name: 'Community Impact Module',
    objective: 'Validate community impact features from the feature matrix: eco-reviews, ratings, helpful votes, challenges, progress, and badges through frontend hook behavior.',
    command: 'npm run test --workspace=frontend -- useCommunity',
    result: '1 frontend hook file passed. All four community rows were retained because they cover distinct read and mutation workflows.',
    isolation: 'Community fetch calls, auth state, mutation responses, and QueryClient invalidation are controlled in hook-level tests.',
    cases: [
      ['UT-COMMUNITY-001', 'useCommunity', 'Load public community data.', 'Pass', 'Vitest output: passed src/hooks/useCommunity.test.tsx > useCommunity hooks > loads public community data.'],
      ['UT-COMMUNITY-002', 'useCommunity', 'Create review and invalidate review/challenge data.', 'Pass', 'Vitest output: passed src/hooks/useCommunity.test.tsx > useCommunity hooks > creates a review and invalidates review/challenge data.'],
      ['UT-COMMUNITY-003', 'useCommunity', 'Toggle helpful votes.', 'Pass', 'Vitest output: passed src/hooks/useCommunity.test.tsx > useCommunity hooks > toggles helpful votes.'],
      ['UT-COMMUNITY-004', 'useCommunity', 'Join challenges and update progress.', 'Pass', 'Vitest output: passed src/hooks/useCommunity.test.tsx > useCommunity hooks > joins challenges and updates progress.'],
    ],
  },
  {
    name: 'Analytics and Reporting Module',
    objective: 'Validate analytics and reporting features from the feature matrix: personal impact calculations, sustainability report source data, and goal-progress summary inputs where covered by isolated utilities.',
    command: 'npm run test --workspace=backend -- src/utils/analytics.test.ts; npm run test --workspace=frontend -- src/app/dashboard/analytics/page.test.tsx',
    result: '2 files passed. Retained analytics rows focus on baseline comparison, clamping, summary aggregation, dashboard rendering, PDF generation, and goal alerting.',
    isolation: 'Backend analytics functions are called directly with controlled trip inputs and carbon-history rows. Frontend analytics page tests mock fetch, jsPDF, autoTable, and ImpactCard so PDF and goal UI paths are verified without live APIs or browser downloads.',
    cases: [
      ['UT-ANALYTICS-001', 'calculateTripImpact', 'Compare flight emissions against economy-flight baseline.', 'Pass', 'Vitest output: passed src/utils/analytics.test.ts > analytics impact calculations > compares flight trip against conservative traditional baseline.'],
      ['UT-ANALYTICS-007', 'calculateTripImpact', 'Clamp saved emissions at zero when actual exceeds baseline.', 'Pass', 'Vitest output: passed src/utils/analytics.test.ts > analytics impact calculations > clamps saved emissions at zero when actual exceeds baseline.'],
      ['UT-ANALYTICS-008', 'buildImpactSummary', 'Summarize mixed entries with totals, breakdowns, details, and tree equivalent.', 'Pass', 'Vitest output: passed src/utils/analytics.test.ts > analytics impact calculations > summarizes mixed entries with totals, breakdowns, details, and tree equivalent.'],
      ['UT-ANALYTICS-010', 'Analytics dashboard page', 'Render real impact metrics, category breakdown rows, and detailed entries.', 'Pass', 'Vitest output: passed src/app/dashboard/analytics/page.test.tsx > analytics dashboard page > renders real impact metrics, breakdown rows, and detailed entries.'],
      ['UT-ANALYTICS-011', 'Analytics dashboard page', 'Generate monthly PDF from current-month analytics data.', 'Pass', 'Vitest output: passed src/app/dashboard/analytics/page.test.tsx > analytics dashboard page > generates a monthly PDF from current-month data when records exist.'],
      ['UT-ANALYTICS-013', 'Analytics dashboard page', 'Render saved-goal progress and budget alert state.', 'Pass', 'Vitest output: passed src/app/dashboard/analytics/page.test.tsx > analytics dashboard page > renders saved-goal progress and alert state.'],
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
        children: [new TextRun({ text, bold })],
      }),
    ],
  })
}

function table(headers, rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((header) => cell(header, true)),
      }),
      ...rows.map((row) => new TableRow({
        children: row.map((value) => cell(value)),
      })),
    ],
  })
}

const suiteRows = suites.map((suite) => [
  suite.name,
  suite.command,
  suite.environment,
  suite.files,
  suite.tests,
  suite.status,
  suite.notes,
])

const retainedCaseCount = modules.reduce((total, module) => total + module.cases.length, 0)

const children = [
  new Paragraph({
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER,
    children: [new TextRun('Terratrace Project Unit Test Report')],
  }),
  paragraph(`Report date: ${reportDate}`),
  paragraph('Project scope: whole Terratrace project unit-test surface across frontend and backend workspaces.'),
  paragraph('Unit-test definition: isolated utilities, components, hooks, and middleware tested with mocked network, router, database, or framework boundaries. Backend route/database integration tests remain documented in test/integration-test.docx.'),
  paragraph(`Documented test-case rows: ${retainedCaseCount} significant cases retained from the full passing unit-test suite.`),
  heading('1. Execution Summary'),
  table(
    ['Suite', 'Command Executed', 'Environment', 'Test Files', 'Tests', 'Status', 'Notes'],
    suiteRows,
  ),
  paragraph('Overall result: 115 of 115 unit tests passed across the documented frontend and backend unit commands.'),
  heading('2. Module Results'),
]

for (const module of modules) {
  children.push(
    heading(`Module Section: ${module.name}`, HeadingLevel.HEADING_2),
    paragraph(`Objective: ${module.objective}`),
    paragraph(`Command: ${module.command}`),
    paragraph(`Result: ${module.result}`),
    paragraph(`Isolation and mocking: ${module.isolation}`),
    table(
      ['Test Case ID', 'Unit Under Test', 'Scenario', 'Status', 'Evidence'],
      module.cases,
    ),
  )
}

children.push(
  heading('3. Command Output Evidence'),
  paragraph('Frontend unit run: npm run test --workspace=frontend'),
  paragraph('Result: Test Files 20 passed (20); Tests 93 passed (93); Duration 4.66s.'),
  paragraph('Backend unit run: npm run test --workspace=backend -- src/utils/auth.test.ts src/utils/analytics.test.ts src/middleware/auth.test.ts src/utils/carbonCalculator.test.ts'),
  paragraph('Result: Test Files 4 passed (4); Tests 22 passed (22); Duration 1.43s.'),
  heading('4. Notes And Limitations'),
  paragraph('This report excludes backend integration suites: backend/src/routes/auth-profile.integration.test.ts and backend/src/routes/analytics.integration.test.ts. Those belong in the integration report because they exercise API and database boundaries.'),
  paragraph('Frontend tests use jsdom and mocked framework/data boundaries, so they validate component, hook, and utility behavior rather than a real browser or live API.'),
  paragraph('Backend authentication middleware tests use mocked Express objects, so they validate middleware branch behavior without starting the server.'),
  paragraph('All documented unit commands passed in the current workspace.'),
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
