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

const testCases = [
  {
    id: 'IT-AUTH-001',
    category: 'Integration',
    module: 'Authentication',
    scenario: 'Signup creates a persisted authenticated user.',
    steps: 'POST /api/auth/signup with disposable user email, password, username, and role.',
    expected: 'API returns 200, sets terratrace_session, stores lowercased email, and stores a bcrypt password hash.',
    actual: 'Passed. Response returned session user and access token; SQL verified lowercased email and bcrypt hash.',
    evidence: 'Vitest API response assertions plus SQL select from users by returned user id.',
  },
  {
    id: 'IT-AUTH-002',
    category: 'Integration',
    module: 'Authentication',
    scenario: 'Duplicate email is rejected case-insensitively.',
    steps: 'Signup once, then POST /api/auth/signup again with the same email in uppercase.',
    expected: 'API returns 409 and duplicate user is not created.',
    actual: 'Passed. API returned 409 with account already exists message.',
    evidence: 'Vitest HTTP status and error body assertions.',
  },
  {
    id: 'IT-AUTH-003',
    category: 'Integration',
    module: 'Authentication',
    scenario: 'Login validates stored credentials.',
    steps: 'Create user, login with wrong password, then login with correct password.',
    expected: 'Wrong password returns 401; correct password returns user data and sets session cookie.',
    actual: 'Passed. Invalid credentials were rejected and valid credentials returned admin user data with cookie.',
    evidence: 'Vitest HTTP response and Set-Cookie assertions.',
  },
  {
    id: 'IT-AUTH-004',
    category: 'Integration',
    module: 'Authentication',
    scenario: 'Current session lookup requires authentication.',
    steps: 'GET /api/auth/me without cookie, then with signup session cookie.',
    expected: 'Missing cookie returns 401; valid cookie returns the current user.',
    actual: 'Passed. Missing session returned 401; valid session returned expected id, email, username, and role.',
    evidence: 'Vitest HTTP response assertions.',
  },
  {
    id: 'IT-PROFILE-001',
    category: 'Integration',
    module: 'Profile',
    scenario: 'Profile username update persists and refreshes session.',
    steps: 'PATCH /api/auth/me with a new username, then query PostgreSQL and call GET /api/auth/me.',
    expected: 'Username updates in users table, session cookie refreshes, and current-user API returns new username.',
    actual: 'Passed. SQL and follow-up API call both returned the updated username.',
    evidence: 'Vitest HTTP, Set-Cookie, and SQL before/after assertions.',
  },
  {
    id: 'IT-PROFILE-002',
    category: 'Integration',
    module: 'Profile',
    scenario: 'Password change replaces the active credential.',
    steps: 'PATCH /api/auth/password with wrong current password, then correct current password; retry old and new logins.',
    expected: 'Wrong current password returns 401; correct update succeeds; old login fails; new login succeeds.',
    actual: 'Passed. Password change flow behaved as expected across API and login verification.',
    evidence: 'Vitest HTTP status and response body assertions.',
  },
  {
    id: 'IT-PROFILE-003',
    category: 'Integration',
    module: 'Authentication',
    scenario: 'Logout clears browser session state.',
    steps: 'POST /api/auth/logout with a valid session cookie, then call /api/auth/me without a cookie.',
    expected: 'Logout returns 200, clears terratrace_session, and protected access without cookie returns 401.',
    actual: 'Passed. Clear-cookie header was present and unauthenticated current-user request failed.',
    evidence: 'Vitest Set-Cookie and HTTP status assertions.',
  },
  {
    id: 'IT-PROFILE-004',
    category: 'Integration',
    module: 'Profile',
    scenario: 'Account deletion removes the authenticated user.',
    steps: 'DELETE /api/user/account with valid cookie, query users table, then reuse old cookie against /api/auth/me.',
    expected: 'Delete returns 200, clears cookie, removes user row, and old session no longer resolves to a user.',
    actual: 'Passed. SQL count changed from 1 to 0 and old session returned User not found.',
    evidence: 'Vitest HTTP, Set-Cookie, and SQL count assertions.',
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

const rows = [
  new TableRow({
    tableHeader: true,
    children: [
      'Test ID',
      'Category',
      'Module/Feature',
      'Scenario',
      'Input/Steps',
      'Expected Result',
      'Actual Result',
      'Status',
      'Evidence',
    ].map((label) => cell(label, true)),
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
      'Pass',
      testCase.evidence,
    ].map((value) => cell(value)),
  })),
]

const doc = new Document({
  sections: [
    {
      properties: {},
      children: [
        new Paragraph({
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          children: [new TextRun('Terratrace Project Integration Test Report')],
        }),
        paragraph('Reference: docs/REQUIREMENTS.md'),
        paragraph('Report scope: whole Terratrace project. Each module must be appended as its own integration-test section.'),
        heading('Objective', HeadingLevel.HEADING_1),
        paragraph(
          'Document integration evidence for all Terratrace modules by proving API request/response behavior, database persistence, and module-to-module data flow required by docs/REQUIREMENTS.md.',
        ),
        heading('Environment And Tools', HeadingLevel.HEADING_1),
        paragraph('Common commands: npm run test --workspace=backend for backend API/database integration tests; npm run test --workspace=frontend for frontend integration-style tests using mocked network boundaries where applicable.'),
        paragraph('Database: PostgreSQL using DATABASE_URL, with the local Docker default postgres://terratrace:terratrace@localhost:5433/terratrace for real API/database integration tests.'),
        paragraph('Report maintenance rule: append new module results to this report; do not replace existing module sections unless regenerating from a complete project-wide data source.'),
        heading('Module Section: Authentication And Profile Management', HeadingLevel.HEADING_1),
        paragraph('Test command: npm run test --workspace=backend -- auth-profile.integration'),
        paragraph('Result: 1 test file passed, 8 tests passed, 0 failed.'),
        paragraph('Tools: Vitest, Express API imported through createApp(), Node fetch, PostgreSQL via pg, bcrypt password hashes, JWT session cookies.'),
        heading('Auth/Profile Test Cases And Results', HeadingLevel.HEADING_2),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows,
        }),
        heading('Auth/Profile Evidence Summary', HeadingLevel.HEADING_2),
        paragraph('API evidence: each test asserts HTTP method, route, status code, response body, and session cookie behavior where relevant.'),
        paragraph('Database evidence: signup, profile update, and account deletion tests query the users table directly before or after API calls.'),
        paragraph('Security evidence: passwords are verified as bcrypt hashes, invalid credentials are rejected, and deleted accounts no longer resolve through /api/auth/me.'),
        heading('Conclusion', HeadingLevel.HEADING_1),
        paragraph(
          'Current documented integration coverage includes the Authentication and Profile Management module. Future agents should append additional module sections for eco-directory, favourites, trips, carbon, community, admin, analytics, and other project features as their integration tests are implemented.',
        ),
      ],
    },
  ],
})

await writeFile(outputPath, await Packer.toBuffer(doc))
console.log(`Wrote ${outputPath}`)
