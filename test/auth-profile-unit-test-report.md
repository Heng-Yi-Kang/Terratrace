# Auth And Profile Unit Test Report

## 1. Report Overview

| Item | Details |
| --- | --- |
| Project | Terratrace |
| Modules Covered | General Authentication and Profile Management |
| Source Test Matrix | `test/auth-profile-test-cases.md` |
| Report Scope | Unit testing of individual functions, React components, hooks, and middleware in isolation |
| Report Date | 2026-06-11 |
| Test Runner | Vitest v4.1.5 |
| Frontend Test Environment | jsdom with React Testing Library |
| Backend Test Environment | Node.js Vitest environment |

This report documents the unit tests derived from `test/auth-profile-test-cases.md`. The tests isolate the following units:

- `AuthForm` authentication form component.
- `LoginPage` and `SignupPage` page-level submit behavior with mocked navigation and auth utilities.
- `useUser`, `useUpdateUser`, `useDeleteAccount`, and `useChangePassword` React Query hooks.
- `ProfileTab` profile-management component with mocked user hooks.
- Backend authentication helpers in `backend/src/utils/auth.ts`.
- Backend `requireAuth` middleware in `backend/src/middleware/auth.ts`.

## 2. Unit Test Execution Summary

| Test Suite | Command Executed | Test Files | Tests | Actual Result |
| --- | --- | ---: | ---: | --- |
| Frontend auth/profile unit tests | `npm run test --workspace=frontend -- AuthForm LoginPage SignupPage useUser ProfileTab` | 5 passed / 5 | 28 passed / 28 | Passed |
| Backend auth unit tests | `npm run test --workspace=backend` | 2 passed / 2 | 7 passed / 7 | Passed |
| Total | Combined targeted unit runs | 7 passed / 7 | 35 passed / 35 | Passed |

Observed frontend runner notes:

- Vitest reported `localStorage is not available because --localstorage-file was not provided`.
- jsdom reported `Not implemented: Window's scrollTo() method`.
- These messages did not fail the test run and did not affect the tested assertions.

## 3. Isolation And Mocking Strategy

| Unit Under Test | Isolation Method |
| --- | --- |
| `AuthForm` | Rendered directly with a mocked `onSubmit` callback. No API or router calls are used. |
| `LoginPage` | `next/navigation` router functions and `@/utils/supabase/auth` functions are mocked with `vi.mock`. |
| `SignupPage` | `next/navigation` router functions and signup auth helpers are mocked with `vi.mock`. |
| `useUser` hooks | Rendered with a local `QueryClientProvider`; auth API utility functions are mocked. |
| `ProfileTab` | User hooks are mocked so component behavior can be tested without React Query or backend access. |
| Backend auth helpers | Password and JWT helper functions are tested directly with controlled environment variables. |
| `requireAuth` middleware | Express request, response, and `next` objects are mocked. JWT tokens are generated locally. |

## 4. Detailed Unit Test Cases

### 4.1 Authentication Form Component

| Test Case ID | Unit | Test Objective | Test Input / Setup | Expected Output | Actual Result |
| --- | --- | --- | --- | --- | --- |
| UT-AUTH-001 | `AuthForm` login mode | Verify login form renders required controls. | Render `<AuthForm mode="login" onSubmit={mockOnSubmit} />`. | Email input, password input, and `Log In` button are present. | Passed. Controls were found in the DOM. |
| UT-AUTH-002 | `AuthForm` login validation | Verify empty login fields block submission. | Click `Log In` without entering email or password. | `onSubmit` is not called. | Passed. `mockOnSubmit` was not called. |
| UT-AUTH-003 | `AuthForm` password validation | Verify short password is rejected. | Email `test@example.com`, password `12345`, then submit. | Error `Password must be at least 6 characters`; `onSubmit` is not called. | Passed. Error message displayed and callback was not called. |
| UT-AUTH-005 | `AuthForm` login submit | Verify valid login submits normalized arguments. | Email `test@example.com`, password `password123`. | `onSubmit('test@example.com', 'password123', '', 'user')` is called. | Passed. Callback received the expected arguments. |
| UT-AUTH-005A | `AuthForm` login error state | Verify submit exceptions are displayed. | Mock `onSubmit` rejects with `Invalid credentials`. | Error text containing `Invalid credentials` appears. | Passed. Error was rendered in the form. |
| UT-AUTH-005B | `AuthForm` loading state | Verify submit button shows loading feedback. | Mock `onSubmit` resolves after delay. | Button displays `Processing...` while submission is pending. | Passed. Loading text appeared during pending submit. |
| UT-AUTH-004 | `AuthForm` signup validation | Verify mismatched signup passwords are rejected. | Email `test@example.com`, username `testuser`, password `password123`, confirmation `differentpass`. | Error `Passwords do not match`; `onSubmit` is not called. | Passed. Error displayed and callback was not called. |
| UT-AUTH-006 | `AuthForm` signup render | Verify signup-only fields render. | Render `<AuthForm mode="signup" onSubmit={mockOnSubmit} />`. | Username, confirm password, and account type controls are present. | Passed. Signup fields were found in the DOM. |
| UT-AUTH-006A | `AuthForm` signup submit | Verify valid signup submits username and role. | Username `traveler`, email `new@example.com`, password and confirmation `password123`, role `admin`. | `onSubmit('new@example.com', 'password123', 'traveler', 'admin')` is called. | Passed. Callback received expected signup data. |

### 4.2 Login And Signup Page Components

| Test Case ID | Unit | Test Objective | Test Input / Setup | Expected Output | Actual Result |
| --- | --- | --- | --- | --- | --- |
| UT-AUTH-007 | `LoginPage` success path | Verify successful login follows role-aware redirect path. | Mock `signIn` success and `getRedirectPath` returning `/dashboard`; submit valid credentials. | Router pushes `/dashboard` and refreshes. | Passed. `push('/dashboard')` and `refresh()` were called. |
| UT-AUTH-007A | `LoginPage` error path | Verify failed login displays API error and does not navigate. | Mock `signIn` error `Invalid login credentials`; submit invalid credentials. | Error containing `invalid` appears; router `push` is not called. | Passed. Error displayed and navigation did not occur. |
| UT-AUTH-007B | `LoginPage` static render | Verify login page base UI. | Render `LoginPage`. | Heading `Welcome Back`, email input, password input, login button, and signup link are present. | Passed. All expected static elements were present. |
| UT-AUTH-007C | `SignupPage` success path | Verify successful admin signup redirects through `getRedirectPath`. | Mock `signUp` success and `getRedirectPath` returning `/admin/dashboard`; submit admin signup data. | `signUp` receives signup values; router pushes `/admin/dashboard` and refreshes. | Passed. Auth helper and router were called with expected values. |
| UT-AUTH-007D | `SignupPage` error path | Verify signup API errors remain on the page. | Mock `signUp` error `An account with this email already exists`. | Error appears; router `push` is not called. | Passed. Error displayed and navigation did not occur. |

### 4.3 User React Query Hooks

| Test Case ID | Unit | Test Objective | Test Input / Setup | Expected Output | Actual Result |
| --- | --- | --- | --- | --- | --- |
| UT-PROFILE-001 | `useUser` | Verify current user query returns auth utility data. | Mock `getCurrentUser` returning user `user-1`, email `test@example.com`, role `user`, username `testuser`. | Hook `data` equals the mocked user object. | Passed. Hook returned the expected user. |
| UT-PROFILE-002 | `useUpdateUser` | Verify profile update invalidates cached user query. | Mock `updateCurrentUser` success; call mutation with `{ username: 'updated' }`. | `queryClient.invalidateQueries({ queryKey: ['user'] })` is called. | Passed. User query invalidation was called. |
| UT-PROFILE-002A | `useDeleteAccount` | Verify account deletion clears cached data. | Mock `deleteAccount` success; call delete mutation. | `queryClient.clear()` is called. | Passed. Query cache clear was called. |
| UT-PROFILE-003 | `useChangePassword` | Verify password-change API errors propagate. | Mock `changePassword` returning error `Current password is incorrect`. | `mutateAsync` rejects with `Current password is incorrect`. | Passed. Mutation rejected with expected message. |

### 4.4 Profile Management Component

| Test Case ID | Unit | Test Objective | Test Input / Setup | Expected Output | Actual Result |
| --- | --- | --- | --- | --- | --- |
| UT-PROFILE-004 | `ProfileTab` display state | Verify profile identity fields render. | Mock `useUser` with email `profile@example.com`, username `traveler`, role `user`. | Heading `traveler`, email value, and role label `Eco Traveler` are visible. | Passed. Expected values were rendered. |
| UT-PROFILE-005 | `ProfileTab` username validation | Verify blank username is rejected. | Click `Edit`, clear username, click `Save`. | Error `Username cannot be empty`; update mutation is not called. | Passed. Error displayed and update mutation was not called. |
| UT-PROFILE-005A | `ProfileTab` unchanged username | Verify unchanged username skips unnecessary update. | Click `Edit`, then `Save` without changes. | Update mutation is not called. | Passed. No update call was made. |
| UT-PROFILE-006 | `ProfileTab` profile update success | Verify username update calls mutation and shows success feedback. | Change username to `updated`; mock update success. | `mutateAsync({ username: 'updated' })`; success message `Profile updated successfully!`. | Passed. Mutation and success feedback matched expectations. |
| UT-PROFILE-006A | `ProfileTab` password validation | Verify password form requires all fields. | Open change-password form and click `Update Password` with empty fields. | Error `All password fields are required`; password mutation is not called. | Passed. Error displayed and mutation was not called. |
| UT-PROFILE-006B | `ProfileTab` password API error | Verify password change errors are displayed. | Mock mutation rejection `Current password is incorrect`; submit complete password form. | Error `Current password is incorrect` appears. | Passed. API error was rendered. |
| UT-PROFILE-007 | `ProfileTab` delete confirmation | Verify delete action remains disabled until exact confirmation text is entered. | Open delete modal, inspect confirm button, type `DELETE`. | Confirm delete button starts disabled and becomes enabled after exact `DELETE`. | Passed. Button state matched expected behavior. |

### 4.5 Backend Authentication Helper Functions

| Test Case ID | Unit | Test Objective | Test Input / Setup | Expected Output | Actual Result |
| --- | --- | --- | --- | --- | --- |
| UT-AUTH-008 | `hashPassword` / `verifyPassword` | Verify password hashing and matching. | Hash `password123`; verify `password123` and `wrongpass`. | Hash is not raw password, matches bcrypt prefix, correct password verifies `true`, wrong password verifies `false`. | Passed. All password assertions matched. |
| UT-AUTH-008A | `verifyPassword` | Verify invalid stored hashes are rejected. | Verify against empty string and plain text `password123`. | Both checks resolve to `false`. | Passed. Invalid hashes were rejected. |
| UT-AUTH-008B | `signSession` / `verifySessionToken` / `toSessionUser` | Verify JWT session round trip. | Set `JWT_SECRET=test-secret`, `JWT_EXPIRES_IN=1h`; sign admin test user and verify token. | Verified session user equals `toSessionUser(dbUser)`. | Passed. Verified payload matched expected session user. |
| UT-AUTH-008C | `verifySessionToken` | Verify malformed and expired JWTs are rejected. | Verify `not-a-token` and a manually expired JWT. | Both calls throw errors. | Passed. Malformed and expired tokens threw errors. |

### 4.6 Backend Authentication Middleware

| Test Case ID | Unit | Test Objective | Test Input / Setup | Expected Output | Actual Result |
| --- | --- | --- | --- | --- | --- |
| UT-AUTH-009 | `requireAuth` missing session | Verify unauthenticated requests are rejected. | Mock request with no cookies and no `Authorization` header. | Response status `401`, JSON `{ error: 'Missing session' }`, `next` not called. | Passed. Response and `next` behavior matched. |
| UT-AUTH-009A | `requireAuth` bearer session | Verify valid bearer token attaches user and continues. | Sign test user session; pass as `Authorization: Bearer <token>`. | `req.user` contains id, email, and role; `next` called once; response status not called. | Passed. User was attached and middleware continued. |
| UT-AUTH-009B | `requireAuth` invalid session | Verify invalid cookie token is rejected. | Mock cookie `terratrace_session=invalid-token`. | Response status `401`, JSON `{ error: 'Invalid or expired session' }`, `next` not called. | Passed. Invalid token was rejected with expected response. |

## 5. Actual Command Output Evidence

Frontend targeted unit run:

```text
> frontend@0.1.0 test
> vitest run AuthForm LoginPage SignupPage useUser ProfileTab

Test Files  5 passed (5)
     Tests  28 passed (28)
  Duration  2.24s
```

Backend unit run:

```text
> backend@1.0.0 test
> vitest run

Test Files  2 passed (2)
     Tests  7 passed (7)
  Duration  984ms
```

## 6. Overall Unit Test Result

All documented authentication and profile unit tests passed in the current workspace.

| Metric | Result |
| --- | ---: |
| Total unit test files executed | 7 |
| Total unit tests executed | 35 |
| Passed | 35 |
| Failed | 0 |
| Pass rate | 100% |

## 7. Notes And Limitations

- These are unit tests only. They do not prove live database writes, browser routing through middleware, or real HTTP integration behavior.
- Page tests mock auth utilities and Next.js navigation, so they validate page behavior around successful and failed auth responses rather than the real backend implementation.
- Hook tests mock `@/utils/supabase/auth`, so they validate React Query behavior and error propagation in isolation.
- Backend middleware tests mock Express request and response objects, so they validate middleware decision logic without starting the Express server.
