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
    files: '11 passed / 11',
    tests: '52 passed / 52',
    status: 'Pass',
    notes: 'Runner emitted localStorage and jsdom scrollTo warnings; they did not fail assertions.',
  },
  {
    name: 'Backend project unit tests',
    command: 'npm run test --workspace=backend -- src/utils/auth.test.ts src/utils/analytics.test.ts src/middleware/auth.test.ts',
    environment: 'Vitest v4.1.5, Node.js',
    files: '2 passed, 1 failed / 3',
    tests: '14 passed, 1 failed / 15',
    status: 'Fail',
    notes: 'analytics.test.ts failed because carbonSavedKg expected 42 but actual value was 41.9.',
  },
]

const modules = [
  {
    name: 'Authentication And Profile UI',
    objective: 'Validate login, signup, auth form, profile display, profile update, password-change, and delete-confirmation behavior in isolated React units.',
    command: 'npm run test --workspace=frontend -- AuthForm LoginPage SignupPage useUser ProfileTab',
    result: '5 files passed, 28 tests passed, 0 failed.',
    isolation: 'Next.js navigation, auth utilities, React Query hooks, and user mutations are mocked. Components are rendered with Testing Library and controlled inputs.',
    cases: [
      ['UT-AUTH-001', 'AuthForm', 'Login mode renders email, password, and submit controls.', 'Pass', 'DOM assertions found expected controls.'],
      ['UT-AUTH-002', 'AuthForm', 'Empty login submission is blocked.', 'Pass', 'onSubmit was not called.'],
      ['UT-AUTH-003', 'AuthForm', 'Short login password is rejected.', 'Pass', 'Validation message rendered and callback was not called.'],
      ['UT-AUTH-004', 'AuthForm', 'Mismatched signup passwords are rejected.', 'Pass', 'Passwords do not match message rendered.'],
      ['UT-AUTH-005', 'AuthForm', 'Valid login submits normalized email and password.', 'Pass', 'Callback received expected arguments.'],
      ['UT-AUTH-006', 'AuthForm', 'Signup-only username, confirm password, and role fields render.', 'Pass', 'Signup fields were present.'],
      ['UT-AUTH-007', 'LoginPage', 'Successful login redirects to role-aware dashboard path.', 'Pass', 'Router push and refresh were called.'],
      ['UT-AUTH-008', 'LoginPage', 'Failed login displays API error and avoids navigation.', 'Pass', 'Error text rendered; router push was not called.'],
      ['UT-AUTH-009', 'LoginPage', 'Static login page heading, inputs, button, and signup link render.', 'Pass', 'All static elements were found.'],
      ['UT-AUTH-010', 'SignupPage', 'Successful signup calls auth helper and redirects.', 'Pass', 'signUp, router push, and refresh matched expected calls.'],
      ['UT-AUTH-011', 'SignupPage', 'Signup API errors stay on the page.', 'Pass', 'Error message rendered and router push was not called.'],
      ['UT-PROFILE-001', 'useUser', 'Current-user hook returns mocked authenticated user.', 'Pass', 'Hook data matched mocked user.'],
      ['UT-PROFILE-002', 'useUpdateUser', 'Profile update invalidates cached user query.', 'Pass', 'invalidateQueries was called for user query.'],
      ['UT-PROFILE-003', 'useDeleteAccount', 'Account deletion clears query cache.', 'Pass', 'Query client clear was called.'],
      ['UT-PROFILE-004', 'useChangePassword', 'Password-change API errors propagate.', 'Pass', 'Mutation rejected with expected message.'],
      ['UT-PROFILE-005', 'ProfileTab', 'Profile identity fields render from user data.', 'Pass', 'Username, email, and role label were visible.'],
      ['UT-PROFILE-006', 'ProfileTab', 'Blank username is rejected.', 'Pass', 'Validation message rendered and update mutation was not called.'],
      ['UT-PROFILE-007', 'ProfileTab', 'Unchanged username skips unnecessary update.', 'Pass', 'Update mutation was not called.'],
      ['UT-PROFILE-008', 'ProfileTab', 'Changed username calls mutation and shows success feedback.', 'Pass', 'Mutation payload and success text matched.'],
      ['UT-PROFILE-009', 'ProfileTab', 'Password form requires all fields.', 'Pass', 'Validation message rendered.'],
      ['UT-PROFILE-010', 'ProfileTab', 'Password API error is displayed.', 'Pass', 'API error message rendered.'],
      ['UT-PROFILE-011', 'ProfileTab', 'Delete confirmation button stays disabled until DELETE is entered.', 'Pass', 'Button disabled/enabled state matched input.'],
    ],
  },
  {
    name: 'Eco Directory And Location Search',
    objective: 'Validate directory filtering utilities, search controls, place cards, catalog pagination, loading, error, and empty states.',
    command: 'npm run test --workspace=frontend -- locationFilters SearchBar PlaceCard EcoDirectoryClient',
    result: '4 files passed, 14 tests passed, 0 failed.',
    isolation: 'Location hooks, router functions, image subcomponents, and catalog data are mocked. Pure filter utilities are tested directly.',
    cases: [
      ['UT-ECO-001', 'locationFilters', 'Normalize empty, all, and whitespace-only filters.', 'Pass', 'Returned empty normalized filter values.'],
      ['UT-ECO-002', 'locationFilters', 'Trim valid filter values before building API URL.', 'Pass', 'URL contained encoded query, city, and category parameters.'],
      ['UT-ECO-003', 'locationFilters', 'Omit blank query parameters.', 'Pass', 'URL had no query string.'],
      ['UT-ECO-004', 'locationFilters', 'Read only supported categories from search params.', 'Pass', 'Unsupported category fell back to all.'],
      ['UT-ECO-005', 'SearchBar', 'Submit trimmed search query.', 'Pass', 'onSubmit received trimmed text.'],
      ['UT-ECO-006', 'SearchBar', 'Debounce trimmed query changes.', 'Pass', 'onChange received trimmed text after debounce.'],
      ['UT-ECO-007', 'SearchBar', 'Clear input and notify handlers.', 'Pass', 'Input cleared and callbacks received empty string.'],
      ['UT-ECO-008', 'PlaceCard', 'Render place details and eco certifications.', 'Pass', 'Name, city, category, and certifications rendered.'],
      ['UT-ECO-009', 'PlaceCard', 'Link to encoded eco-directory detail route.', 'Pass', 'href matched encoded route.'],
      ['UT-ECO-010', 'EcoDirectoryClient', 'Render category counts and first page from mocked data.', 'Pass', 'Counts, cards, and page indicator matched.'],
      ['UT-ECO-011', 'EcoDirectoryClient', 'Move to next page when pagination is clicked.', 'Pass', 'Next page item and page indicator rendered.'],
      ['UT-ECO-012', 'EcoDirectoryClient', 'Update URL when search, city, and category filters change.', 'Pass', 'Router replace calls matched expected URLs.'],
      ['UT-ECO-013', 'EcoDirectoryClient', 'Show loading and error states without catalog.', 'Pass', 'Loading and error states rendered.'],
      ['UT-ECO-014', 'EcoDirectoryClient', 'Show empty state and clear active filters.', 'Pass', 'Empty text rendered and filters routed back to /eco-directory.'],
    ],
  },
  {
    name: 'Favourites And Community Hooks',
    objective: 'Validate frontend hook behavior for saved places, localStorage fallback, sync, community data loading, reviews, helpful votes, and challenges.',
    command: 'npm run test --workspace=frontend -- useFavourites useCommunity',
    result: '2 files passed, 10 tests passed, 0 failed.',
    isolation: 'Auth state, fetch, localStorage, mutation responses, and QueryClient invalidation are controlled in hook-level tests.',
    cases: [
      ['UT-FAV-001', 'useFavourites', 'Logged-out user receives empty array when localStorage is empty.', 'Pass', 'Hook returned empty array.'],
      ['UT-FAV-002', 'useFavourites', 'Logged-out user receives localStorage favourites.', 'Pass', 'Hook returned stored local favourite items.'],
      ['UT-FAV-003', 'useFavourites', 'Hook data updates when a local favourite is added.', 'Pass', 'Rendered hook data reflected local change.'],
      ['UT-FAV-004', 'useSyncFavourites', 'Sync does nothing when user is logged out.', 'Pass', 'No upload request was attempted.'],
      ['UT-FAV-005', 'useSyncFavourites', 'Successful sync uploads all favourites and clears local storage.', 'Pass', 'Upload calls succeeded and local storage was cleared.'],
      ['UT-FAV-006', 'useSyncFavourites', 'Partial sync failure retains only failed favourites.', 'Pass', 'Failed favourite stayed in local storage.'],
      ['UT-COMMUNITY-001', 'useCommunity', 'Load public community data.', 'Pass', 'Hook returned mocked community data.'],
      ['UT-COMMUNITY-002', 'useCommunity', 'Create review and invalidate review/challenge data.', 'Pass', 'Mutation and invalidation calls matched.'],
      ['UT-COMMUNITY-003', 'useCommunity', 'Toggle helpful votes.', 'Pass', 'Mutation request matched expected review action.'],
      ['UT-COMMUNITY-004', 'useCommunity', 'Join challenges and update progress.', 'Pass', 'Challenge mutation behavior matched expected calls.'],
    ],
  },
  {
    name: 'Backend Authentication Utilities And Middleware',
    objective: 'Validate password hashing, JWT session helpers, session conversion, and authentication middleware decisions without starting the API server.',
    command: 'npm run test --workspace=backend -- src/utils/auth.test.ts src/middleware/auth.test.ts',
    result: '2 files passed, 7 tests passed, 0 failed.',
    isolation: 'bcrypt/JWT helpers are invoked directly with controlled env vars. Express request, response, and next objects are mocked.',
    cases: [
      ['UT-BACKEND-AUTH-001', 'auth helpers', 'Hash password and verify only matching password.', 'Pass', 'bcrypt hash was not raw password; correct password passed and wrong password failed.'],
      ['UT-BACKEND-AUTH-002', 'auth helpers', 'Reject empty or non-bcrypt stored hashes.', 'Pass', 'Invalid hashes resolved false.'],
      ['UT-BACKEND-AUTH-003', 'auth helpers', 'Sign and verify a session token.', 'Pass', 'Verified session user matched expected payload.'],
      ['UT-BACKEND-AUTH-004', 'auth helpers', 'Reject malformed and expired session tokens.', 'Pass', 'Both invalid tokens threw errors.'],
      ['UT-BACKEND-AUTH-005', 'requireAuth', 'Reject request without session token.', 'Pass', 'Response returned 401 missing session and next was not called.'],
      ['UT-BACKEND-AUTH-006', 'requireAuth', 'Attach user and continue for valid bearer session.', 'Pass', 'req.user was populated and next was called once.'],
      ['UT-BACKEND-AUTH-007', 'requireAuth', 'Reject invalid or expired session token.', 'Pass', 'Response returned 401 invalid or expired session.'],
    ],
  },
  {
    name: 'Backend Analytics Utilities',
    objective: 'Validate carbon impact baseline comparisons, saved-emission clamping, aggregate impact summaries, breakdowns, and chart data.',
    command: 'npm run test --workspace=backend -- src/utils/analytics.test.ts',
    result: '1 file failed, 7 tests passed, 1 test failed.',
    isolation: 'Analytics functions are called directly with controlled trip inputs and carbon-history rows. No database or HTTP route is used.',
    cases: [
      ['UT-ANALYTICS-001', 'calculateTripImpact', 'Compare flight emissions against economy-flight baseline.', 'Pass', 'Baseline and saved values matched expected close values.'],
      ['UT-ANALYTICS-002', 'calculateTripImpact', 'Compare rail emissions against petrol-car baseline.', 'Pass', 'Baseline and saved values matched expected close values.'],
      ['UT-ANALYTICS-003', 'calculateTripImpact', 'Compare bus emissions against petrol-car baseline.', 'Pass', 'Baseline and saved values matched expected close values.'],
      ['UT-ANALYTICS-004', 'calculateTripImpact', 'Compare hybrid car emissions against petrol-car baseline.', 'Pass', 'Baseline and saved values matched expected close values.'],
      ['UT-ANALYTICS-005', 'calculateTripImpact', 'Compare taxi emissions against petrol-car baseline.', 'Pass', 'Baseline and saved values matched expected close values.'],
      ['UT-ANALYTICS-006', 'calculateTripImpact', 'Compare budget hotel emissions against standard-hotel baseline.', 'Pass', 'Baseline and saved values matched expected close values.'],
      ['UT-ANALYTICS-007', 'calculateTripImpact', 'Clamp saved emissions at zero when actual exceeds baseline.', 'Pass', 'savedKg was 0.'],
      ['UT-ANALYTICS-008', 'buildImpactSummary', 'Summarize mixed entries with totals, breakdowns, details, and tree equivalent.', 'Fail', 'Expected carbonSavedKg 42 but received 41.9 at backend/src/utils/analytics.test.ts:57.'],
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

const children = [
  new Paragraph({
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER,
    children: [new TextRun('Terratrace Project Unit Test Report')],
  }),
  paragraph(`Report date: ${reportDate}`),
  paragraph('Project scope: whole Terratrace project unit-test surface across frontend and backend workspaces.'),
  paragraph('Unit-test definition: isolated utilities, components, hooks, and middleware tested with mocked network, router, database, or framework boundaries. Backend route/database integration tests remain documented in test/integration-test.docx.'),
  heading('1. Execution Summary'),
  table(
    ['Suite', 'Command Executed', 'Environment', 'Test Files', 'Tests', 'Status', 'Notes'],
    suiteRows,
  ),
  paragraph('Overall result: 66 of 67 unit tests passed. One backend analytics utility assertion failed in the current workspace.'),
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
  paragraph('Result: Test Files 11 passed (11); Tests 52 passed (52); Duration 2.34s.'),
  paragraph('Backend unit run: npm run test --workspace=backend -- src/utils/auth.test.ts src/utils/analytics.test.ts src/middleware/auth.test.ts'),
  paragraph('Result: Test Files 1 failed, 2 passed (3); Tests 1 failed, 14 passed (15). Failure: backend/src/utils/analytics.test.ts expected summary.carbonSavedKg to be 42 but received 41.9.'),
  heading('4. Notes And Limitations'),
  paragraph('This report excludes backend integration suites: backend/src/routes/auth-profile.integration.test.ts and backend/src/routes/analytics.integration.test.ts. Those belong in the integration report because they exercise API and database boundaries.'),
  paragraph('Frontend tests use jsdom and mocked framework/data boundaries, so they validate component, hook, and utility behavior rather than a real browser or live API.'),
  paragraph('Backend authentication middleware tests use mocked Express objects, so they validate middleware branch behavior without starting the server.'),
  paragraph('The current failing analytics unit should be resolved before declaring the whole unit suite passed.'),
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
