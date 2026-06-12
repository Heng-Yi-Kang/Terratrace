# TerraTrace Presentation Slide Outline

## Slide 1: Project Overview

**Title:** TerraTrace - Eco-Friendly Travel Planner  
**Course:** WIF2003 Web Programming, Semester 2 2025/2026  
**Group:** OCC3 G4

**Main Idea:**
- Sustainable travel planning.
- Green destination discovery.
- Carbon tracking.
- Community impact.
- Analytics and reports.

**Objectives:**
- Find eco-friendly places.
- Plan greener trips.
- Track carbon emissions.
- Encourage sustainable habits.
- Show personal impact.

**Quality Focus:**
- Usability.
- Reliability.
- Security.
- Performance.
- Maintainability.
- Responsive design.


## Slide 2: Features and Task Distribution

| Feature | Main Scope | Person In Charge |
| --- | --- | --- |
| General/Profile | Auth, sessions, profile, account settings | Heng Yi Kang |
| Eco Directory | Places, search, details, favourites | Yong Yung Kang |
| Green Itinerary | Trips, itinerary, recommendations, weather | Wong Wei Li |
| Carbon Footprint | Emissions, history, insights, offsets | Nurul Farzana Binti Anuar |
| Community Impact | Reviews, votes, badges, challenges | Aqil Amani Bin Misni |
| Analytics/Reports | Dashboard, goals, reports, export | Nur Alisya Qistina Binti Mohd Hazli |

**Suggested Visual:** Feature ownership table with icons.

## Slide 3: Backend Architecture

**Backend Stack:**
- Node.js.
- Express.js.
- TypeScript.
- PostgreSQL.
- `pg` package.
- Vitest testing.

**Main Files:**
- `backend/src/index.ts`
- Starts the server.
- `backend/src/app.ts`
- Builds the Express app.
- `createApp()`
- Supports integration tests.

**Request Flow:**
- Browser request.
- Express middleware.
- Route handler.
- Validation and logic.
- PostgreSQL or external API.
- JSON response.

**Suggested Visual:** Request lifecycle diagram.

## Slide 4: Authentication and Security

**Authentication:**
- Signup and login.
- bcrypt password hashes.
- JWT session cookie.
- Cookie name: `terratrace_session`.
- Protected routes use `requireAuth`.

**Route Protection:**
- Token verified on server.
- Current user saved in `req.user`.
- User data scoped by `req.user.id`.
- Invalid session returns `401`.
- Admin routes check role.

**Account APIs:**
- Current user.
- Profile update.
- Password change.
- Logout.
- Account deletion.

**Suggested Visual:** Login -> JWT cookie -> `requireAuth` -> protected API.

## Slide 5: Database Scripting

**Database:**
- PostgreSQL.
- Schema: `db/init/001_schema.sql`.
- Stores users, trips, places, favourites, carbon, community, and analytics data.

**SQL Pattern:**
- Direct SQL queries.
- Parameterized inputs.
- No ORM.
- Explicit route logic.
- JSON response mapping.

**Data Integrity:**
- Foreign keys.
- Cascade deletes.
- Unique constraints.
- Check constraints.
- Indexes for faster lookup.

**Transactions:**
- Used for related records.
- Example: trip + itinerary items.
- Prevents partial saves.

**Suggested Visual:** Request -> SQL -> tables -> JSON.

## Slide 6: Server-Side Feature APIs

**Core APIs:**
- Auth and profile.
- Eco-directory.
- Favourites.
- Trips and todos.
- Carbon calculator.
- Community features.
- Analytics and reports.

**Backend Logic:**
- Validate inputs.
- Check ownership.
- Run business rules.
- Query database.
- Return status codes.
- Send structured JSON.

**Examples:**
- Carbon by transport type.
- Trip CRUD with itinerary items.
- Location filters and details.
- Reviews, votes, and badges.
- Goal progress and summaries.

**Suggested Visual:** API module map.

## Slide 7: External APIs and Recommendations

**Smart Recommendation Flow:**
- Validate city.
- Validate dates.
- Check budget.
- Match interests.
- Add weather context.
- Score candidates.
- Return recommendations.

**Scoring Factors:**
- Eco evidence.
- Interest match.
- Weather fit.
- Budget fit.

**External Services:**
- Gemini.
- DuckDuckGo search.
- Open-Meteo.
- OpenRouteService.
- Nominatim.
- Foursquare.
- Unsplash.
- OpenStreetMap/Overpass.

**Reliability:**
- Server-side API keys.
- Normalized provider data.
- Validated AI output.
- Fallback recommendations.

**Suggested Visual:** Express connected to database and external APIs.

## Slide 8: Testing

**Unit Tests:**
- Auth.
- Profile.
- Directory.
- Trips.
- Carbon.
- Community.
- Analytics.

**Functional Tests:**
- Register and login.
- Profile update.
- Search and favourites.
- Trip create/edit/delete.
- Recommendations and weather.
- Carbon and analytics.

**API Tests:**
- Signup.
- Login.
- Current user.
- Favourites.
- Carbon.
- Analytics.
- Weather.
- Recommendations.
- Community.

**Database Tests:**
- CRUD behavior.
- Duplicate prevention.
- Validation rules.
- Relationships.
- Protected routes.

**Key Result:**
- 100 automated unit tests passed.



## Slide 9: Key Code Contributions

**Express App Setup:**
- `backend/src/app.ts`
- CORS.
- JSON parsing.
- Cookies.
- API routes.
- Error handling.

**Authentication Middleware:**
- `backend/src/middleware/auth.ts`
- JWT check.
- `req.user`.
- `401` blocking.

**Database Helper:**
- `backend/src/utils/db.ts`
- Connection pool.
- `query()` helper.
- Parameterized SQL.

**Trips CRUD:**
- `backend/src/routes/trips.ts`
- Protected routes.
- Input validation.
- User ownership.
- Transactions.
- Nested JSON.

**Smart Recommendations:**
- `backend/src/routes/smart-recommendation.ts`
- Weather context.
- Search candidates.
- Scoring.
- Gemini validation.
- Fallback logic.
- Short cache.

**Suggested Visual:** Five-column code map.

## Slide 10: Demo and Conclusion

**Demo Screenshots:**
- Signup and login.
- Dashboard.
- Profile.
- Eco-directory.
- Favourites.
- Trip planner.
- Smart recommendation.
- Weather.
- Carbon calculator.
- Community.
- Analytics report.

**Demo Flow:**
1. Log in.
2. Search eco places.
3. Save a favourite.
4. Create a trip.
5. Generate recommendation.
6. Calculate carbon.
7. View analytics.

**Conclusion:**
- TerraTrace is a full-stack green travel platform.
- Backend powers auth, database, APIs, integrations, and protected workflows.
- Future work: more automated integration tests.

