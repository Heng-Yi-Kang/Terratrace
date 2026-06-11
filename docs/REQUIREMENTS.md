# WIF2003 Project Presentation 2 Requirements

Source: `docs/WIF2003_PP2_Guidelines.pdf`

Due date for report, project files, recorded presentation, and peer evaluation: **12 June 2026, Friday, Week 14**.

## Main Deliverables

- Project report.
- Full project source code, including all front-end and back-end files.
- Clean and organised folder structure.
- README with setup and run instructions.
- Full database dump or database file.
- Separate file containing database connection details and login credentials.
- Recorded presentation video, maximum 15 minutes.
- Presentation slide deck in PPTX or PDF format.
- Peer team evaluation form submitted through SPeCTRUM.

## Project Report Content To Complete

- Brief project introduction: team, title, modules, and features.
- Latest task distribution table showing the PIC for each module.
- Front-end development documentation:
  - UI/UX work.
  - React components.
  - Client-side routing.
- Back-end development documentation:
  - Node.js/Express API.
  - Server-side logic.
  - Authentication.
- Database design documentation:
  - Schema.
  - Collections or tables.
  - Indexes.
  - Relationships.
- Screenshots of all system features for Section 2.2 of the report template.
- Testing documentation for unit, functional, integration, and database testing.

## Required Testing Work

All test results must be documented in the report with evidence. Evidence can include screenshots, logs, or test output.

### 1. Unit Testing

Purpose: test individual functions and components in isolation.

What to do:

- Identify each module's important functions, components, utilities, and validation logic.
- Write isolated tests for those units.
- Avoid relying on real back-end, database, or external services unless the unit specifically requires it.
- Document each test case with:
  - Module or component name.
  - Test case ID or name.
  - Input or precondition.
  - Expected output.
  - Actual result.
  - Pass or fail status.
  - Evidence, such as test runner output or screenshot.

Minimum coverage target:

- At least one meaningful unit test set per major assigned module.
- Include both normal and invalid input cases where applicable.

### 2. Functional Testing

Purpose: verify that each system feature behaves according to the specified requirements.

What to do:

- Test every visible system feature, not only the login flow.
- For each feature, cover:
  - Success case.
  - Failure case.
  - Edge case.
- Verify user-facing behaviour, form validation, navigation, displayed messages, and final feature outcome.

Functional test examples to prepare:

- Registration works with valid input.
- Registration rejects invalid or duplicate input.
- Login works with valid credentials.
- Login rejects wrong credentials.
- Protected pages cannot be accessed without authentication.
- CRUD features create, display, update, and delete records correctly.
- Reports, dashboards, or analytics display expected results.
- Empty states and invalid form states are handled properly.

### 3. Integration Testing

Purpose: test interactions between front-end, back-end, and database layers.

What to do:

- Validate API endpoints used by the front-end.
- Confirm end-to-end data flow from UI action to API request to database update and back to UI display.
- Test module-to-module interaction where one feature depends on another feature's data.
- Include evidence showing:
  - API request and response.
  - Database state before or after the operation.
  - UI result after the operation.

Integration test examples to prepare:

- Registration creates a user record in the database.
- Login authenticates against stored user data and returns the expected session/token behaviour.
- Creating a trip or feature record through the UI persists it in the database.
- Updating or deleting a record through the UI changes the database correctly.
- Report or analytics pages read data from the expected API/database source.

### 4. Database Testing

Purpose: verify CRUD operations, integrity rules, constraints, and data consistency.

What to do:

- Test create, read, update, and delete operations for each major collection or table.
- Verify referential integrity or relationships between records.
- Verify required fields, uniqueness rules, constraints, and validation.
- Check that data remains consistent after updates and deletes.
- Include database screenshots, query output, API output, or logs as evidence.

Database test examples to prepare:

- User records are created with required fields.
- Duplicate or invalid records are rejected.
- Related records are linked to the correct user or parent entity.
- Deleting or updating a record does not leave broken references.
- Stored values match the values submitted through the application.

## Testing Evidence Required In The Report

For each testing category, include:

- A short explanation of the testing objective.
- Test environment or tools used.
- Test case table.
- Expected results.
- Actual results.
- Pass/fail status.
- Screenshots, logs, terminal output, API responses, or database snapshots.
- Short conclusion explaining whether the tested module is working correctly.

Recommended test case table columns:

| Test ID | Category | Module/Feature | Scenario | Input/Steps | Expected Result | Actual Result | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| UT-001 | Unit | Login form | Reject empty submit | Click submit with empty fields | Validation message shown | TBD | TBD | TBD |
| FT-001 | Functional | Login | Valid login | Enter valid credentials | User reaches dashboard | TBD | TBD | TBD |
| IT-001 | Integration | Registration | Create account | Submit registration form | User saved in database | TBD | TBD | TBD |
| DB-001 | Database | Users | Duplicate email | Insert duplicate email | Insert rejected | TBD | TBD | TBD |

## Required Documentation Files

Create or update these documents before submission:

- `README.md`
  - Project overview.
  - Prerequisites.
  - Installation steps.
  - Environment variables.
  - Database setup or restore instructions.
  - Commands to run front-end, back-end, tests, and build.
  - Default test/demo credentials if applicable.
- Project report
  - Must include all sections listed above.
  - Must include current task distribution and screenshots of all system features.
  - Must include documented test results and evidence.
- Database dump/file
  - Full export of the database.
  - Should match the submitted application version.
- Database connection and credentials file
  - Connection URL or host details.
  - Database name.
  - Required usernames/passwords or demo login credentials.
  - Any seed data instructions.
- Presentation slides
  - Exactly 10 slides.
  - Member contribution breakdown must be clearly visible.
- Recorded presentation video
  - Maximum 15 minutes.
  - All members must present their individual contribution.
  - Group leader conducts and narrates the live demo with camera enabled.
- Peer evaluation form
  - Download from SPeCTRUM.
  - Complete honestly.
  - Submit before the deadline.

## Presentation And Demo Requirements Related To Documentation

- Every group member must explain their own assigned module and features.
- The demo should follow a logical sequence: registration, login, then other features.
- The demo must show input/output and prove database changes for CRUD operations.
- Code walkthrough should focus on server-side scripting in the MERN stack.
- Key code contributions should be highlighted.
- All members must understand the whole project because Week 14 physical presentations are random and any member may be asked to explain the project, code, features, or testing evidence.

## Immediate Action Checklist

- [ ] Update the task distribution table so every module has the correct PIC.
- [ ] Confirm all report sections are complete.
- [ ] Capture screenshots for every system feature.
- [ ] Write or update unit tests for major components/functions.
- [ ] Write or update functional tests for each user-facing feature.
- [ ] Write or update integration tests for UI/API/database flows.
- [ ] Verify database CRUD, constraints, relationships, and consistency.
- [ ] Save test output, logs, API responses, and database screenshots as evidence.
- [ ] Add all test cases and results to the project report.
- [ ] Export the full database dump/file.
- [ ] Create the database connection and credentials file.
- [ ] Update README setup/run/test instructions.
- [ ] Prepare exactly 10 presentation slides.
- [ ] Record the presentation within 15 minutes.
- [ ] Complete and submit peer evaluation.
