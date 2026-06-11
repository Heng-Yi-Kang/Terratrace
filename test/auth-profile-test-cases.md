# Auth And Profile Test Cases

These cases prepare report evidence for the General Authentication and Profile Management modules using the categories required by `docs/REQUIREMENTS.md`.

## Unit Tests

| ID | Area | Scenario | Evidence |
| --- | --- | --- | --- |
| UT-AUTH-001 | AuthForm | Renders login email/password fields and submit button. | `npm run test --workspace=frontend -- AuthForm` |
| UT-AUTH-002 | AuthForm | Blocks empty required login fields. | `npm run test --workspace=frontend -- AuthForm` |
| UT-AUTH-003 | AuthForm | Rejects passwords shorter than 6 characters. | `npm run test --workspace=frontend -- AuthForm` |
| UT-AUTH-004 | AuthForm | Rejects mismatched signup confirmation password. | `npm run test --workspace=frontend -- AuthForm` |
| UT-AUTH-005 | AuthForm | Submits valid login credentials to `onSubmit`. | `npm run test --workspace=frontend -- AuthForm` |
| UT-AUTH-006 | AuthForm | Submits valid signup with username and role. | `npm run test --workspace=frontend -- AuthForm` |
| UT-AUTH-007 | Auth pages | Login redirects through `getRedirectPath`; signup supports admin redirect. | `npm run test --workspace=frontend -- LoginPage SignupPage` |
| UT-AUTH-008 | Auth helpers | Hashes/verifies passwords and signs/verifies JWT sessions. | `npm run test --workspace=backend` |
| UT-AUTH-009 | Auth middleware | Rejects missing, invalid, and expired sessions. | `npm run test --workspace=backend` |
| UT-PROFILE-001 | useUser | Fetches current user from `/api/auth/me`. | `npm run test --workspace=frontend -- useUser` |
| UT-PROFILE-002 | useUser | Profile update invalidates `['user']`; delete clears query cache. | `npm run test --workspace=frontend -- useUser` |
| UT-PROFILE-003 | useUser | Password change propagates API errors. | `npm run test --workspace=frontend -- useUser` |
| UT-PROFILE-004 | ProfileTab | Displays username, email, and role. | `npm run test --workspace=frontend -- ProfileTab` |
| UT-PROFILE-005 | ProfileTab | Rejects blank username and skips unchanged username update. | `npm run test --workspace=frontend -- ProfileTab` |
| UT-PROFILE-006 | ProfileTab | Shows profile and password success/error feedback. | `npm run test --workspace=frontend -- ProfileTab` |
| UT-PROFILE-007 | ProfileTab | Keeps delete account action disabled until exact `DELETE`. | `npm run test --workspace=frontend -- ProfileTab` |

## Functional Tests

| ID | Scenario | Expected Result | Evidence To Capture |
| --- | --- | --- | --- |
| FT-AUTH-001 | Register with valid email, password, username, and user account type. | Account is created and user lands on `/dashboard`. | Browser screenshot after signup. |
| FT-AUTH-002 | Register with missing fields, short password, mismatched confirmation, and duplicate email. | Form or API error is shown; user remains on signup page. | Browser screenshots for each error. |
| FT-AUTH-003 | Login as a normal user. | User lands on `/dashboard`. | Browser screenshot of dashboard. |
| FT-AUTH-004 | Login as an admin. | User lands on `/admin/dashboard`. | Browser screenshot of admin dashboard. |
| FT-AUTH-005 | Login with wrong credentials. | Error is shown and route remains `/login`. | Browser screenshot of error. |
| FT-AUTH-006 | Logout from user and admin sidebars. | Session clears and protected pages redirect away. | Browser screenshots before and after logout. |
| FT-AUTH-007 | Visit `/dashboard`, `/admin`, and `/todos` while signed out. | Redirects to `/login?redirectTo=...`. | Address bar screenshots. |
| FT-AUTH-008 | Visit `/login` or `/signup` while signed in. | Redirects to role-specific dashboard. | Address bar screenshots. |
| FT-AUTH-009 | Visit `/admin/*` as a non-admin. | Redirects to `/dashboard`. | Address bar screenshot. |
| FT-PROFILE-001 | Open profile page. | Username, email, and role are visible. | Profile screenshot. |
| FT-PROFILE-002 | Update username. | New username appears and success message is shown. | Before/after screenshots. |
| FT-PROFILE-003 | Change password. | Correct current password succeeds; empty, short, mismatched, and incorrect current password fail. | Error/success screenshots. |
| FT-PROFILE-004 | Delete account. | Modal requires exact `DELETE`, deletes account, signs out, and redirects to `/?deleted=true`. | Modal and redirect screenshots. |

## Integration Tests

| ID | Flow | Expected Result | Evidence To Capture |
| --- | --- | --- | --- |
| IT-AUTH-001 | `POST /api/auth/signup` with disposable user. | User row is created, password is hashed, session cookie is set, and response contains session user. | HTTP log and SQL row screenshot. |
| IT-AUTH-002 | `POST /api/auth/login` with stored credentials. | Credentials verify, role-aware user data returns, session cookie is set. | HTTP request/response log. |
| IT-AUTH-003 | `POST /api/auth/logout` then access protected API/page. | Cookie clears and subsequent access fails or redirects. | HTTP log and browser screenshot. |
| IT-AUTH-004 | `GET /api/auth/me` with valid and missing sessions. | Valid session returns user; missing/invalid session rejects. | HTTP logs. |
| IT-PROFILE-001 | `PATCH /api/auth/me`. | Username updates in PostgreSQL, session cookie refreshes, frontend refetch shows new value. | HTTP log, SQL before/after, browser screenshot. |
| IT-PROFILE-002 | `PATCH /api/auth/password`. | Old password stops working; new password works. | HTTP logs for old/new login attempts. |
| IT-PROFILE-003 | `DELETE /api/user/account`. | User is deleted in a transaction, cookie clears, `/api/auth/me` fails afterward. | HTTP log and SQL after screenshot. |
| IT-AUTH-005 | Middleware route access for user/admin/anonymous sessions. | User dashboard allowed, admin dashboard allowed for admin only, missing/invalid session redirects. | Browser address bar screenshots. |

## Database Tests

| ID | Assertion | SQL Evidence |
| --- | --- | --- |
| DB-AUTH-001 | `users.email` uniqueness rejects duplicate emails case-insensitively. | `users_email_lower_idx` in `db/init/001_schema.sql`; duplicate insert attempt screenshot. |
| DB-AUTH-002 | Required user fields are enforced. | `users.id`, `email`, `password_hash`, and `role` definitions in schema plus failed null insert screenshot. |
| DB-AUTH-003 | Signup stores lowercased email and hashed password. | `select email, password_hash from users where email = lower(email);` before/after signup. |
| DB-PROFILE-001 | Profile update changes `users.username` and `updated_at`. | SQL before/after `PATCH /api/auth/me`. |
| DB-PROFILE-002 | Password change changes `users.password_hash` and `updated_at`. | SQL before/after `PATCH /api/auth/password`. |
| DB-PROFILE-003 | Account deletion removes the `users` row. | SQL before/after `DELETE /api/user/account`. |
| DB-PROFILE-004 | Delete cascades `user_favourites`, `carbon_entries`, `todos`, `trips`, and `trip_items`. | Row counts before/after deleting a disposable user. |
| DB-PROFILE-005 | Deleting one user leaves unrelated users and related rows intact. | Row counts for another user before/after deletion. |
| DB-AUTH-004 | Foreign keys reject nonexistent `user_id` or `trip_id`. | Failed insert screenshots for child tables. |
