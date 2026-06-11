# Test List

Last updated: 2026-06-11

This document lists the automated tests currently present in the Terratrace repository.

## Test Commands

| Area | Command |
| --- | --- |
| Backend | `npm run test --workspace=backend` |
| Frontend | `npm run test --workspace=frontend` |

## Backend Tests

### `backend/src/utils/auth.test.ts`

Suite: `auth helpers`

| Test | Coverage |
| --- | --- |
| `hashes passwords and verifies only the matching password` | Password hashing and verification success/failure paths. |
| `does not accept empty or non-bcrypt password hashes` | Invalid password hash handling. |
| `signs and verifies a session token` | Session JWT creation and verification. |
| `rejects malformed and expired session tokens` | Invalid and expired session JWT rejection. |

### `backend/src/middleware/auth.test.ts`

Suite: `requireAuth`

| Test | Coverage |
| --- | --- |
| `rejects requests without a session token` | Missing bearer token/session rejection. |
| `attaches a user and continues for a valid bearer session` | Valid bearer session authentication middleware flow. |
| `rejects invalid or expired session tokens` | Invalid or expired session rejection. |

### `backend/src/routes/auth-profile.integration.test.ts`

Suite: `auth and profile integration`

| Test | Coverage |
| --- | --- |
| `IT-AUTH-001 signs up a user, stores a hashed password, and sets a session cookie` | Signup API, stored password hashing, and session cookie creation. |
| `IT-AUTH-002 rejects duplicate signup emails case-insensitively` | Duplicate email handling with case-insensitive comparison. |
| `IT-AUTH-003 logs in with valid credentials and rejects invalid credentials` | Login success and invalid credential failure. |
| `IT-AUTH-004 returns the current user with a valid session and rejects missing sessions` | Current-user endpoint session handling. |
| `IT-PROFILE-001 updates the username in PostgreSQL and refreshes the session cookie` | Profile username update persistence and refreshed session. |
| `IT-PROFILE-002 changes a password and only accepts the new credential afterward` | Password change persistence and old/new credential behavior. |
| `IT-PROFILE-003 clears the session cookie on logout` | Logout API cookie clearing. |
| `IT-PROFILE-004 deletes the account row and rejects the old session afterward` | Account deletion and stale session rejection. |

### `backend/src/routes/eco-directory.integration.test.ts`

Suite: `eco-friendly directory integration`

| Test | Coverage |
| --- | --- |
| `IT-DIR-001 lists sustainable directory locations from PostgreSQL through the API` | Locations API list endpoint, PostgreSQL seeded location rows, and public place mapping. |
| `IT-DIR-002 applies geo-specific search filters and exposes city options` | Query, city, category filtering, invalid category rejection, and cities endpoint. |
| `IT-DIR-003 returns detail and same-category recommendation data for place pages` | Location detail lookup, missing public ID handling, and same-category recommendation endpoint. |
| `IT-DIR-004 persists authenticated favourites and returns mapped saved places` | Signup session cookie, favourites create/list/delete APIs, duplicate handling, and `user_favourites` persistence. |

## Frontend Tests

### `frontend/src/utils/locationFilters.test.ts`

Suite: `locationFilters`

| Test | Coverage |
| --- | --- |
| `normalizes empty, all, and whitespace-only filters` | Filter normalization defaults. |
| `trims valid filter values before building the API URL` | API URL construction with trimmed filters. |
| `omits blank query parameters from the API URL` | Empty query parameter omission. |
| `reads only supported categories from search params` | Search parameter parsing and category validation. |

### `frontend/src/app/eco-directory/components/EcoDirectoryClient.test.tsx`

Suite: `EcoDirectoryClient`

| Test | Coverage |
| --- | --- |
| `renders category counts and the first page of places from mocked location data` | Initial eco-directory rendering. |
| `moves to the next page when pagination is clicked` | Pagination behavior. |
| `updates the URL when search, city, and category filters change` | Search and filter URL state updates. |
| `shows loading and error states without rendering the catalog` | Loading/error UI states. |
| `shows an empty state and clears active filters` | Empty results and filter reset behavior. |

### `frontend/src/app/eco-directory/components/PlaceCard.test.tsx`

Suite: `PlaceCard`

| Test | Coverage |
| --- | --- |
| `renders place details and eco certifications` | Place details and certification rendering. |
| `links to the encoded eco-directory detail route` | Encoded detail route link generation. |

### `frontend/src/app/eco-directory/components/SearchBar.test.tsx`

Suite: `SearchBar`

| Test | Coverage |
| --- | --- |
| `submits the trimmed search query` | Search submit behavior. |
| `debounces trimmed query changes` | Debounced search input updates. |
| `clears the input and notifies handlers` | Clear action and callbacks. |

### `frontend/src/app/login/LoginPage.test.tsx`

Suite: `LoginPage`

| Group | Test | Coverage |
| --- | --- | --- |
| `Success State` | `navigates to dashboard on successful login` | Successful login redirect. |
| `Error State` | `displays error message on failed login` | Failed login error display. |
| `Empty/Validation State` | `renders login heading` | Login page heading render. |
| `Empty/Validation State` | `has email and password inputs` | Login form fields. |
| `Empty/Validation State` | `has login button` | Login submit button. |
| `Empty/Validation State` | `has link to signup page` | Signup navigation link. |

### `frontend/src/components/auth/AuthForm.test.tsx`

Suite: `AuthForm`

| Group | Test | Coverage |
| --- | --- | --- |
| `Login Mode` | `renders login form correctly` | Login form rendering. |
| `Login Mode` | `prevents submission when fields are empty` | Required-field validation. |
| `Login Mode` | `shows an error when password is shorter than 6 characters` | Minimum password validation. |
| `Login Mode` | `calls onSubmit with email and password on valid submit` | Valid login submission payload. |
| `Login Mode` | `displays error message when onSubmit throws` | Submit error handling. |
| `Login Mode` | `shows loading state while submitting` | Loading state during submit. |
| `Signup Mode` | `renders additional fields for signup` | Signup-specific fields. |
| `Signup Mode` | `prevents submission when passwords do not match` | Password confirmation validation. |
| `Signup Mode` | `calls onSubmit with username and role on valid signup` | Valid signup submission payload. |

### `frontend/src/components/dashboard/ProfileTab.test.tsx`

Suite: `ProfileTab`

| Test | Coverage |
| --- | --- |
| `displays username, email, and role` | Profile identity display. |
| `rejects an empty username` | Username validation. |
| `skips the API call when username is unchanged` | Avoiding unnecessary profile update calls. |
| `updates username and shows success feedback` | Username update success flow. |
| `validates password fields before changing password` | Password form validation. |
| `shows password change errors from the API` | Password change API error display. |
| `keeps delete disabled until DELETE is confirmed` | Delete confirmation guard. |

### `frontend/src/components/dashboard/UserSidebar.test.tsx`

Suite: `UserSidebar`

| Test | Coverage |
| --- | --- |
| `signs out and redirects to login when Sign Out is clicked` | Logout sidebar click calls the auth helper, redirects to `/login`, and refreshes the router. |

### `frontend/src/hooks/useFavourites.test.tsx`

Suite: `useFavourites Hooks`

| Group | Test | Coverage |
| --- | --- | --- |
| `useFavourites` | `returns empty array when logged out and localStorage is empty` | Logged-out empty favourites state. |
| `useFavourites` | `returns localStorage items when logged out` | Local favourites fallback. |
| `useFavourites` | `updates data when new local favourite is added` | Local favourite update behavior. |
| `useSyncFavourites` | `does nothing if user is logged out` | Sync no-op for logged-out users. |
| `useSyncFavourites` | `syncs all favorites successfully and clears local storage` | Successful favourite sync. |
| `useSyncFavourites` | `retains only the failed favorites in local storage when some uploads fail` | Partial sync failure handling. |

### `frontend/src/hooks/useUser.test.tsx`

Suite: `useUser hooks`

| Test | Coverage |
| --- | --- |
| `fetches the current user` | Current-user query. |
| `invalidates the user query after profile update` | Profile update cache invalidation. |
| `clears the query cache after account deletion` | Account delete cache cleanup. |
| `propagates password change API errors` | Password change mutation error propagation. |

### `frontend/src/app/signup/SignupPage.test.tsx`

Suite: `SignupPage`

| Test | Coverage |
| --- | --- |
| `creates an account and navigates to the role-aware redirect path` | Signup success and role-aware redirect. |
| `shows signup API errors and stays on the page` | Signup API error handling. |

### `frontend/src/hooks/useCommunity.test.tsx`

Suite: `useCommunity hooks`

| Test | Coverage |
| --- | --- |
| `loads public community data` | Public community data loading. |
| `creates a review and invalidates review/challenge data` | Review creation and cache invalidation. |
| `toggles helpful votes` | Helpful vote mutation behavior. |
| `joins challenges and updates progress` | Challenge join and progress update behavior. |

### `frontend/src/app/dashboard/analytics/page.test.tsx`

Suite: `analytics dashboard page`

| Test | Coverage |
| --- | --- |
| `renders empty states and disables report buttons when there are no records` | Empty analytics state and disabled PDF controls. |
| `renders real impact metrics, breakdown rows, and detailed entries` | Personal impact dashboard metrics, category comparison, and calculation log rendering. |
| `generates a monthly PDF from current-month data when records exist` | Monthly sustainability report generation through mocked `jsPDF`. |
| `shows the no-goal setup form and saves a new annual goal` | Carbon budget goal setup form and `PUT /api/analytics/goal` request. |
| `renders saved-goal progress and alert state` | Saved annual budget progress display and high-usage alert state. |

## Related Test Documentation

| File | Purpose |
| --- | --- |
| `test/auth-profile-test-cases.md` | Auth/profile manual, unit, integration, and database test cases. |
| `test/auth-profile-unit-test-report.md` | Auth/profile unit test execution report. |
| `test/auth-profile-unit-test-report.docx` | Word version of the auth/profile unit test report. |
| `test/auth-profile-integration-test-report.docx` | Word version of the auth/profile integration test report. |
| `docs/testing-process.md` | Project testing process documentation. |
| `docs/auth-profile-test-cases.md` | Auth/profile test cases under docs. |
