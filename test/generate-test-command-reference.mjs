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

const outputPath = 'test/test-command-reference.docx'
const reportDate = '2026-06-11'

const commands = [
  {
    source: 'unit-test.docx',
    scope: 'Frontend project unit tests',
    command: 'npm run test --workspace=frontend',
    function:
      'Runs the complete frontend unit-test suite for isolated React components, hooks, utilities, and pages.',
    status: 'Executed in unit report',
  },
  {
    source: 'unit-test.docx',
    scope: 'Backend project unit tests',
    command:
      'npm run test --workspace=backend -- src/utils/auth.test.ts src/utils/analytics.test.ts src/middleware/auth.test.ts src/utils/carbonCalculator.test.ts',
    function:
      'Runs targeted backend unit tests for authentication helpers, analytics utilities, auth middleware, and carbon calculation logic.',
    status: 'Executed in unit report',
  },
  {
    source: 'unit-test.docx',
    scope: 'General authentication',
    command:
      'npm run test --workspace=frontend -- AuthForm LoginPage SignupPage UserSidebar; npm run test --workspace=backend -- src/utils/auth.test.ts src/middleware/auth.test.ts',
    function:
      'Validates isolated login, signup, sidebar/session UI behavior, auth token helpers, and protected middleware branches.',
    status: 'Module command',
  },
  {
    source: 'unit-test.docx',
    scope: 'Profile management',
    command: 'npm run test --workspace=frontend -- useUser ProfileTab',
    function:
      'Validates profile data hooks, profile update behavior, password-change errors, account deletion cache handling, and profile UI rendering.',
    status: 'Module command',
  },
  {
    source: 'unit-test.docx',
    scope: 'Eco-friendly directory',
    command:
      'npm run test --workspace=frontend -- locationFilters SearchBar PlaceCard EcoDirectoryClient useFavourites',
    function:
      'Validates directory filter construction, search UI behavior, place cards, directory list state, and favourite persistence/sync hooks.',
    status: 'Module command',
  },
  {
    source: 'unit-test.docx',
    scope: 'Green itinerary',
    command:
      'npm run test --workspace=frontend -- useTrips smart-recommendation-section weather-forecast-section',
    function:
      'Validates trip payload normalization, smart recommendation form/results behavior, itinerary save payloads, and weather forecast filtering.',
    status: 'Module command',
  },
  {
    source: 'unit-test.docx',
    scope: 'Carbon footprint',
    command:
      'npm run test --workspace=frontend -- calculate CarbonOffset ImpactInsights; npm run test --workspace=backend -- src/utils/carbonCalculator.test.ts',
    function:
      'Validates frontend carbon calculation helpers, offset/impact insight UI, and backend carbon calculator math.',
    status: 'Module command',
  },
  {
    source: 'unit-test.docx',
    scope: 'Community impact',
    command: 'npm run test --workspace=frontend -- useCommunity',
    function:
      'Validates community hook flows for public community data, review creation, helpful votes, challenge joining, and progress updates.',
    status: 'Module command',
  },
  {
    source: 'unit-test.docx',
    scope: 'Analytics and reporting',
    command:
      'npm run test --workspace=backend -- src/utils/analytics.test.ts; npm run test --workspace=frontend -- src/app/dashboard/analytics/page.test.tsx',
    function:
      'Validates backend impact summary utilities plus dashboard analytics rendering, report generation, saved goals, and alert states.',
    status: 'Module command',
  },
  {
    source: 'integration-test.docx',
    scope: 'General authentication integration',
    command:
      'npm run test --workspace=backend -- auth-profile.integration; npm run test --workspace=frontend -- LoginPage SignupPage AuthForm',
    function:
      'Verifies signup, duplicate signup, login, current-session lookup, logout, and frontend auth form/page integration behavior.',
    status: 'Executed in integration report',
  },
  {
    source: 'integration-test.docx',
    scope: 'Profile management integration',
    command:
      'npm run test --workspace=backend -- auth-profile.integration; npm run test --workspace=frontend -- ProfileTab useUser',
    function:
      'Verifies authenticated profile update, password change, account deletion, current-user lookup, and related frontend profile flows.',
    status: 'Executed in integration report',
  },
  {
    source: 'integration-test.docx',
    scope: 'Eco-friendly directory integration',
    command:
      'npm run test --workspace=backend -- eco-directory.integration; npm run test --workspace=frontend -- locationFilters EcoDirectoryClient PlaceCard SearchBar useFavourites',
    function:
      'Verifies backend directory, search, city, detail, recommendation, and favourites APIs with frontend directory/filter/favourite flows.',
    status: 'Executed in integration report',
  },
  {
    source: 'integration-test.docx',
    scope: 'Green itinerary integration',
    command:
      'Recommended: npm run test --workspace=backend -- trips smart-recommendation weather; npm run test --workspace=frontend -- TripsTab SmartRecommendation',
    function:
      'Recommended coverage for trip CRUD, trip items, smart recommendation requests, weather fallback, and dashboard trip/recommendation UI.',
    status: 'Recommended; automation not yet documented as executed',
  },
  {
    source: 'integration-test.docx',
    scope: 'Carbon footprint integration',
    command:
      'Recommended: npm run test --workspace=backend -- carbon analytics.integration; npm run test --workspace=frontend -- carbon analytics',
    function:
      'Recommended coverage for carbon calculate/history/delete APIs, carbon summary data, and frontend carbon analytics flows.',
    status: 'Recommended; automation not yet documented as executed',
  },
  {
    source: 'integration-test.docx',
    scope: 'Community impact integration',
    command: 'npm run test --workspace=frontend -- useCommunity',
    function:
      'Runs frontend hook integration-style tests for public community data, review mutations, helpful votes, challenge joining, and progress updates.',
    status: 'Executed in integration report; backend API/database tests recommended',
  },
  {
    source: 'integration-test.docx',
    scope: 'Analytics and reporting integration',
    command:
      'npm run test --workspace=backend -- analytics.integration; npm run test --workspace=frontend -- dashboard/analytics',
    function:
      'Verifies authenticated impact aggregation, year filtering, user isolation, goal APIs, dashboard analytics UI, PDF generation, and alert states.',
    status: 'Executed in integration report',
  },
  {
    source: 'integration-test.docx',
    scope: 'Additional integrated capabilities',
    command:
      'Recommended: add targeted backend API/database integration tests for eco-route and admin modules.',
    function:
      'Documents recommended future integration coverage for eco route planning endpoints and admin-only dashboard/pages.',
    status: 'Recommendation, not a runnable command',
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

function screenshotCell() {
  return new TableCell({
    columnSpan: 5,
    margins: { top: 120, bottom: 120, left: 80, right: 80 },
    children: [
      new Paragraph({
        children: [new TextRun({ text: 'Screenshot / Evidence:', bold: true })],
      }),
      new Paragraph({
        spacing: { before: 240, after: 240 },
        children: [new TextRun('')],
      }),
      new Paragraph({
        spacing: { before: 240, after: 240 },
        children: [new TextRun('')],
      }),
    ],
  })
}

function commandRows(rows) {
  return rows.flatMap((row) => [
    new TableRow({
      children: row.map((value) => cell(value)),
    }),
    new TableRow({
      children: [screenshotCell()],
    }),
  ])
}

function table(headers, rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((header) => cell(header, true)),
      }),
      ...commandRows(rows),
    ],
  })
}

const rows = commands.map((entry) => [
  entry.source,
  entry.scope,
  entry.command,
  entry.function,
  entry.status,
])

const children = [
  new Paragraph({
    heading: HeadingLevel.TITLE,
    alignment: AlignmentType.CENTER,
    children: [new TextRun('Terratrace Test Command Reference')],
  }),
  paragraph(`Report date: ${reportDate}`),
  paragraph(
    'Purpose: compile all test commands listed in test/unit-test.docx and test/integration-test.docx and describe what each command validates.',
  ),
  paragraph(
    'Commands prefixed with "Recommended:" are documented recommendations from the source reports. They are included for completeness, but are not recorded there as executed passing commands.',
  ),
  heading('Compiled Commands'),
  table(
    [
      'Source Document',
      'Scope',
      'Command',
      'Function',
      'Status / Notes',
    ],
    rows,
  ),
]

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
