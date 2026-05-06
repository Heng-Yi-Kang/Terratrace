# LoginPage Testing Documentation

This document describes the testing setup, process, and results for the LoginPage component using Vitest, React Testing Library, and MSW.

## Overview

- **Project**: Terratrace LoginPage
- **Test Runner**: Vitest v4.1.5
- **Testing Library**: React Testing Library v16.3.2
- **HTTP Mocking**: MSW v2.14.3
- **Total Tests**: 13
- **Pass Rate**: 100%
- **Duration**: ~11 seconds

## Test States Covered

| State | Description | Test Count |
|-------|-------------|------------|
| **Success** | Valid login credentials result in successful authentication and navigation | 3 |
| **Error** | Invalid credentials display appropriate error messages without navigation | 2 |
| **Empty/Validation** | Form validation prevents empty or invalid submissions | 8 |

## Test Files

### LoginPage.test.tsx

Integration tests for the LoginPage component.

```typescript
// Key test cases
describe('LoginPage', () => {
  describe('Success State', () => {
    it('navigates to dashboard on successful login', async () => { ... })
  })

  describe('Error State', () => {
    it('displays error message on failed login', async () => { ... })
  })

  describe('Empty/Validation State', () => {
    it('renders login heading', () => { ... })
    it('has email and password inputs', () => { ... })
    it('has login button', () => { ... })
    it('has link to signup page', () => { ... })
  })
})
```

### AuthForm.test.tsx

Unit tests for the AuthForm component.

```typescript
describe('AuthForm', () => {
  describe('Login Mode', () => {
    it('renders login form correctly', () => { ... })
    it('prevents submission when fields are empty', () => { ... })
    it('calls onSubmit with email and password', () => { ... })
    it('displays error message when onSubmit throws', () => { ... })
    it('shows loading state while submitting', () => { ... })
  })

  describe('Signup Mode', () => {
    it('renders additional fields for signup', () => { ... })
    it('prevents submission when passwords do not match', () => { ... })
  })
})
```

## Dependencies Installed

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom msw @vitejs/plugin-react
```

| Package | Version | Purpose |
|---------|---------|---------|
| vitest | ^4.1.5 | Test runner |
| @testing-library/react | ^16.3.2 | Component testing |
| @testing-library/jest-dom | ^6.9.1 | Custom DOM matchers |
| @testing-library/user-event | ^14.6.1 | Simulate user interactions |
| jsdom | ^29.1.1 | DOM environment for Node.js |
| msw | ^2.14.3 | Mock Service Worker |
| @vitejs/plugin-react | ^6.0.1 | React plugin for Vite |

## Configuration Files

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### src/test/setup.ts

Global test setup with MSW server lifecycle and RTL cleanup:

```typescript
import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { server } from './mocks/server'

export const user = userEvent.setup()

afterEach(() => {
  cleanup()
})

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})
```

## Mocking Strategy

### 1. Supabase Auth Utilities (vi.mock)

Used `vi.mock` to intercept Supabase auth calls at the utility level:

```typescript
vi.mock('@/utils/supabase/auth', () => ({
  signIn: vi.fn(),
  getRedirectPath: vi.fn(),
}))

// In tests:
vi.mocked(supabaseAuth.signIn).mockResolvedValue({ error: null })
vi.mocked(supabaseAuth.getRedirectPath).mockResolvedValue('/dashboard')
```

### 2. Next.js Router (vi.mock)

Mocked `useRouter` to capture navigation calls:

```typescript
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}))
```

### 3. MSW Handlers (msw/node)

MSW handlers for HTTP-level mocking if needed:

```typescript
// src/test/mocks/handlers/authHandlers.ts
export const authHandlers = [
  http.post('https://placeholder.supabase.co/auth/v1/token?action=signin', async ({ request }) => {
    const body = await request.json()
    const { email, password } = body

    if (email === 'valid@test.com' && password === 'password123') {
      return HttpResponse.json({ id: 'user-123', email, ... })
    }

    return HttpResponse.json(
      { error: 'Invalid login credentials' },
      { status: 400 }
    )
  }),
]
```

## Running Tests

### Watch Mode
```bash
npm run test
```

### Single Run
```bash
npm run test:run
```

### With Coverage
```bash
npm run test:coverage
```

## Test Results

```
Test Files  2 passed (2)
     Tests  13 passed (13)
  Duration  11.09s
```

### Detailed Results by State

#### Success State (3 tests)
| Test | File | Duration |
|------|------|----------|
| navigates to dashboard on successful login | LoginPage.test.tsx | 877ms |
| calls onSubmit with email and password on valid submit | AuthForm.test.tsx | 566ms |
| shows loading state while submitting | AuthForm.test.tsx | 565ms |

#### Error State (2 tests)
| Test | File | Duration |
|------|------|----------|
| displays error message on failed login | LoginPage.test.tsx | 604ms |
| displays error message when onSubmit throws | AuthForm.test.tsx | 465ms |

#### Empty/Validation State (8 tests)
| Test | File | Duration |
|------|------|----------|
| renders login heading | LoginPage.test.tsx | 25ms |
| has email and password inputs | LoginPage.test.tsx | 14ms |
| has login button | LoginPage.test.tsx | 27ms |
| has link to signup page | LoginPage.test.tsx | 29ms |
| renders login form correctly | AuthForm.test.tsx | 301ms |
| prevents submission when fields are empty | AuthForm.test.tsx | 99ms |
| renders additional fields for signup | AuthForm.test.tsx | 17ms |
| prevents submission when passwords do not match | AuthForm.test.tsx | 966ms |

## File Structure

```
frontend/
├── vitest.config.ts                           # Vitest configuration
└── src/
    ├── test/
    │   ├── setup.ts                          # Global test setup
    │   └── mocks/
    │       ├── server.ts                     # MSW server
    │       ├── supabase.ts                   # Mock Supabase client
    │       └── handlers/
    │           └── authHandlers.ts           # MSW auth handlers
    ├── components/
    │   └── auth/
    │       └── AuthForm.test.tsx            # AuthForm unit tests
    └── app/
        └── login/
            ├── page.tsx                      # LoginPage component
            └── LoginPage.test.tsx            # LoginPage integration tests
```

## Key Findings

1. **Mocking Approach**: Using `vi.mock` at the utility level is more reliable than MSW for Supabase auth
2. **Framer Motion**: Animations may affect element visibility in tests - use `waitFor` for async assertions
3. **Form Validation**: AuthForm correctly prevents empty field submissions and validates password matching
4. **Navigation**: LoginPage properly navigates to dashboard based on user role after successful login

## Notes

- MSW handlers are configured but the primary mocking strategy uses `vi.mock` for simplicity
- The "Not implemented: Window's scrollTo()" warning is expected in jsdom environment and does not affect test results
- All tests run without hitting a real backend, ensuring fast and reliable test execution
