import { writeFile } from 'fs/promises'
import { Pool } from 'pg'
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

const outputPath = 'test/database-test.docx'
const defaultDatabaseUrl = 'postgresql://terratrace:terratrace@localhost:5433/terratrace'
const databaseUrl = process.env.DATABASE_URL || defaultDatabaseUrl
const reportDate = new Date().toISOString().slice(0, 10)
const runId = `dbtest_${Date.now()}`

const pool = new Pool({ connectionString: databaseUrl })
const cases = []
let client
let savepointCounter = 0

function redactConnectionString(value) {
  return value.replace(/:\/\/([^:@/]+):([^@/]+)@/, '://$1:***@')
}

function addCase(id, module, scenario, input, expected, execute) {
  cases.push({
    id,
    module,
    scenario,
    input,
    expected,
    actual: 'Not run',
    status: 'Pending',
    evidence: '',
    execute,
  })
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function q(text, params = []) {
  return client.query(text, params)
}

async function withSavepoint(callback) {
  const savepoint = `sp_${++savepointCounter}`
  await q(`savepoint ${savepoint}`)
  try {
    const result = await callback()
    await q(`release savepoint ${savepoint}`)
    return result
  } catch (error) {
    await q(`rollback to savepoint ${savepoint}`)
    await q(`release savepoint ${savepoint}`)
    throw error
  }
}

async function expectDbError(callback, expectedCode) {
  const savepoint = `sp_${++savepointCounter}`
  await q(`savepoint ${savepoint}`)
  let caught = null
  try {
    await callback()
  } catch (error) {
    caught = error
  }
  await q(`rollback to savepoint ${savepoint}`)
  await q(`release savepoint ${savepoint}`)

  if (!caught) throw new Error(`Expected PostgreSQL error ${expectedCode}, but query succeeded`)
  if (caught.code !== expectedCode) {
    throw new Error(`Expected PostgreSQL error ${expectedCode}, received ${caught.code || caught.message}`)
  }
  return `PostgreSQL rejected operation with code ${caught.code}: ${caught.constraint || caught.detail || caught.message}`
}

async function createUser(suffix, overrides = {}) {
  const email = overrides.email || `${runId}.${suffix}@example.com`
  const role = overrides.role || 'user'
  const username = overrides.username || `${runId}_${suffix}`
  const { rows } = await q(
    `insert into users (email, password_hash, username, role)
     values ($1, $2, $3, $4)
     returning id, email, username, role, created_at, updated_at`,
    [email, 'database-test-password-hash', username, role],
  )
  return rows[0]
}

async function createLocation(suffix, overrides = {}) {
  const { rows } = await q(
    `insert into locations (
       name, public_id, category, city, country, address, lat, lng, long,
       eco_certs, eco_tags, eco_score, description, image_url, image_thumb, foursquare_id
     )
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
     returning id, name, public_id, category, city, country, eco_tags, eco_score, foursquare_id`,
    [
      overrides.name || `Database Test Location ${suffix}`,
      overrides.publicId || `${runId}.${suffix}`,
      overrides.category || 'Accommodation',
      overrides.city || 'Kuala Lumpur',
      overrides.country || 'Malaysia',
      overrides.address || 'Database Test Address',
      overrides.lat ?? 3.139,
      overrides.lng ?? 101.6869,
      overrides.long ?? 101.6869,
      overrides.ecoCerts || ['Green Key'],
      overrides.ecoTags || ['Solar', 'Local'],
      overrides.ecoScore ?? 88,
      overrides.description || 'Database testing row',
      overrides.imageUrl || null,
      overrides.imageThumb || null,
      overrides.foursquareId || `${runId}_${suffix}`,
    ],
  )
  return rows[0]
}

async function createTrip(userId, suffix, overrides = {}) {
  const { rows } = await q(
    `insert into trips (
       user_id, destination, start_date, end_date, budget, interests, eco_score,
       status, source, source_request_id, weather_condition, total_estimated_cost
     )
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     returning id, destination, start_date::text, end_date::text, eco_score, status, source`,
    [
      userId,
      overrides.destination || `Database Trip ${suffix}`,
      overrides.startDate || '2026-07-01',
      overrides.endDate || '2026-07-05',
      overrides.budget ?? 1200,
      overrides.interests || ['nature', 'transit'],
      overrides.ecoScore ?? 82,
      overrides.status || 'upcoming',
      overrides.source || 'manual',
      overrides.sourceRequestId || `${runId}.${suffix}`,
      overrides.weatherCondition || 'sunny',
      overrides.totalEstimatedCost ?? 980,
    ],
  )
  return rows[0]
}

async function createBadge(suffix) {
  const { rows } = await q(
    `insert into community_badges (slug, name, icon, color)
     values ($1, $2, 'leaf', '#059669')
     returning id, slug, name`,
    [`${runId}-${suffix}`, `Database Badge ${suffix}`],
  )
  return rows[0]
}

async function createChallenge(badgeId, suffix, overrides = {}) {
  const { rows } = await q(
    `insert into community_challenges (
       slug, title, description, reward, points, badge_id, category, total, unit
     )
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     returning id, slug, category, points, total`,
    [
      `${runId}-${suffix}`,
      `Database Challenge ${suffix}`,
      'Database testing challenge',
      'Database Badge',
      overrides.points ?? 100,
      badgeId,
      overrides.category || 'Active',
      overrides.total ?? 3,
      overrides.unit || 'days',
    ],
  )
  return rows[0]
}

function shortJson(value) {
  return JSON.stringify(value)
    .replace(/\s+/g, ' ')
    .slice(0, 450)
}

addCase(
  'DB-USR-001',
  'Users',
  'Create a valid user with required fields and defaults.',
  'Insert email, password_hash, username, and default user role.',
  'A user row is created with UUID primary key, role=user, and timestamps.',
  async () => {
    const user = await createUser('create')
    assert(user.id && user.role === 'user' && user.created_at, 'User defaults were not applied')
    return {
      actual: `Created user ${user.email} with role ${user.role}.`,
      evidence: `users.id=${user.id}; created_at=${user.created_at.toISOString()}`,
    }
  },
)

addCase(
  'DB-USR-002',
  'Users',
  'Reject duplicate email regardless of case.',
  'Insert one email, then insert same email using different casing.',
  'The unique lower(email) index rejects the second insert.',
  async () => {
    const email = `${runId}.case.unique@example.com`
    await createUser('case-a', { email })
    const evidence = await expectDbError(
      () => createUser('case-b', { email: email.toUpperCase() }),
      '23505',
    )
    return { actual: 'Duplicate case-insensitive email was rejected.', evidence }
  },
)

addCase(
  'DB-USR-003',
  'Users',
  'Reject invalid user role.',
  'Insert a user with role=manager.',
  'The role check constraint rejects values outside user/admin.',
  async () => {
    const evidence = await expectDbError(() => createUser('bad-role', { role: 'manager' }), '23514')
    return { actual: 'Invalid role was rejected.', evidence }
  },
)

addCase(
  'DB-USR-004',
  'Users',
  'Update username and verify persistence.',
  'Create a user, update username, then read the row.',
  'The updated username is stored in users.',
  async () => {
    const user = await createUser('update')
    const updated = `${runId}_updated_username`
    await q('update users set username = $2, updated_at = now() where id = $1', [user.id, updated])
    const { rows } = await q('select username from users where id = $1', [user.id])
    assert(rows[0]?.username === updated, 'Updated username was not persisted')
    return { actual: `Username updated to ${rows[0].username}.`, evidence: `select username returned ${rows[0].username}` }
  },
)

addCase(
  'DB-LOC-001',
  'Locations',
  'Create a valid sustainable location.',
  'Insert public_id, category, city/country, coordinates, eco arrays, score, and foursquare_id.',
  'Location is created with unique public_id and retrievable eco metadata.',
  async () => {
    const location = await createLocation('create')
    assert(location.id && location.public_id && Number(location.eco_score) === 88, 'Location row was not created correctly')
    return {
      actual: `Created location ${location.public_id} in ${location.city}.`,
      evidence: shortJson({ id: location.id, ecoTags: location.eco_tags, ecoScore: Number(location.eco_score) }),
    }
  },
)

addCase(
  'DB-LOC-002',
  'Locations',
  'Reject duplicate public_id.',
  'Insert two locations with the same public_id.',
  'The public_id unique constraint rejects the second row.',
  async () => {
    const publicId = `${runId}.duplicate-public`
    await createLocation('dup-public-a', { publicId })
    const evidence = await expectDbError(() => createLocation('dup-public-b', { publicId }), '23505')
    return { actual: 'Duplicate public_id was rejected.', evidence }
  },
)

addCase(
  'DB-LOC-003',
  'Locations',
  'Reject duplicate foursquare_id.',
  'Insert two locations with the same foursquare_id.',
  'The foursquare_id unique constraint rejects the second row.',
  async () => {
    const foursquareId = `${runId}_duplicate_foursquare`
    await createLocation('dup-fs-a', { foursquareId })
    const evidence = await expectDbError(() => createLocation('dup-fs-b', { foursquareId }), '23505')
    return { actual: 'Duplicate foursquare_id was rejected.', evidence }
  },
)

addCase(
  'DB-LOC-004',
  'Locations',
  'Read locations by category and city.',
  'Insert a location, then query lower(category) and city.',
  'The inserted location is returned by filter criteria used by directory APIs.',
  async () => {
    const location = await createLocation('read-filter', { category: 'Dining', city: 'Penang' })
    const { rows } = await q(
      'select public_id from locations where lower(category) = lower($1) and city = $2 and public_id = $3',
      ['Dining', 'Penang', location.public_id],
    )
    assert(rows.length === 1, 'Filtered location query did not return expected row')
    return { actual: 'Filtered query returned the inserted row.', evidence: shortJson(rows) }
  },
)

addCase(
  'DB-LOC-005',
  'Locations',
  'Update eco score and tags.',
  'Update eco_score and eco_tags for a location, then read it back.',
  'Stored values match the update.',
  async () => {
    const location = await createLocation('update')
    await q('update locations set eco_score = $2, eco_tags = $3 where id = $1', [location.id, 93, ['Zero Waste', 'Rainwater']])
    const { rows } = await q('select eco_score, eco_tags from locations where id = $1', [location.id])
    assert(Number(rows[0].eco_score) === 93 && rows[0].eco_tags.includes('Zero Waste'), 'Location update did not persist')
    return { actual: 'Location eco metadata was updated.', evidence: shortJson(rows[0]) }
  },
)

addCase(
  'DB-FAV-001',
  'User Favourites',
  'Create favourite linked to valid user and location.',
  'Insert user_favourites row using existing user_id and location_id.',
  'Favourite row is created and joins back to its parent records.',
  async () => {
    const user = await createUser('fav-create')
    const location = await createLocation('fav-create')
    const { rows } = await q(
      `insert into user_favourites (user_id, location_id)
       values ($1, $2)
       returning id, user_id, location_id`,
      [user.id, location.id],
    )
    assert(rows[0].user_id === user.id && rows[0].location_id === location.id, 'Favourite link was not created')
    return { actual: 'Favourite relationship was created.', evidence: shortJson(rows[0]) }
  },
)

addCase(
  'DB-FAV-002',
  'User Favourites',
  'Reject duplicate favourite.',
  'Insert the same user_id/location_id pair twice.',
  'The unique(user_id, location_id) constraint rejects the duplicate.',
  async () => {
    const user = await createUser('fav-dup')
    const location = await createLocation('fav-dup')
    await q('insert into user_favourites (user_id, location_id) values ($1, $2)', [user.id, location.id])
    const evidence = await expectDbError(
      () => q('insert into user_favourites (user_id, location_id) values ($1, $2)', [user.id, location.id]),
      '23505',
    )
    return { actual: 'Duplicate favourite was rejected.', evidence }
  },
)

addCase(
  'DB-FAV-003',
  'User Favourites',
  'Reject invalid favourite foreign key.',
  'Insert favourite with a valid user and non-existent location UUID.',
  'The foreign key rejects the invalid location reference.',
  async () => {
    const user = await createUser('fav-bad-fk')
    const evidence = await expectDbError(
      () => q('insert into user_favourites (user_id, location_id) values ($1, $2)', [user.id, '00000000-0000-4000-8000-000000000000']),
      '23503',
    )
    return { actual: 'Invalid location reference was rejected.', evidence }
  },
)

addCase(
  'DB-FAV-004',
  'User Favourites',
  'Cascade favourites when a parent user is deleted.',
  'Create favourite, delete user, count matching favourite rows.',
  'Deleting the user removes related favourites.',
  async () => {
    const user = await createUser('fav-cascade-user')
    const location = await createLocation('fav-cascade-user')
    await q('insert into user_favourites (user_id, location_id) values ($1, $2)', [user.id, location.id])
    await q('delete from users where id = $1', [user.id])
    const { rows } = await q('select count(*)::int as count from user_favourites where user_id = $1', [user.id])
    assert(rows[0].count === 0, 'Favourite row remained after user delete')
    return { actual: 'User delete cascaded to favourites.', evidence: `remaining favourites=${rows[0].count}` }
  },
)

addCase(
  'DB-CAR-001',
  'Carbon Entries',
  'Create carbon history entry with JSON trips and emissions totals.',
  'Insert carbon_entries row for a valid user.',
  'Entry stores JSON trip payload and numeric emissions values.',
  async () => {
    const user = await createUser('carbon-create')
    const { rows } = await q(
      `insert into carbon_entries (
         user_id, trips, total_emissions, flight_emissions, car_emissions,
         hotel_emissions, rail_emissions, bus_emissions, taxi_emissions
       )
       values ($1, $2, 12.5, 0, 3.2, 0, 9.3, 0, 0)
       returning id, trips, total_emissions, rail_emissions`,
      [user.id, JSON.stringify([{ type: 'rail', distanceKm: 100 }])],
    )
    assert(Number(rows[0].total_emissions) === 12.5 && rows[0].trips[0].type === 'rail', 'Carbon entry was not stored correctly')
    return { actual: 'Carbon entry was created.', evidence: shortJson(rows[0]) }
  },
)

addCase(
  'DB-CAR-002',
  'Carbon Entries',
  'Read carbon entries ordered newest first.',
  'Insert two entries for one user with different created_at values.',
  'Query returns entries by created_at descending.',
  async () => {
    const user = await createUser('carbon-order')
    await q(
      'insert into carbon_entries (user_id, trips, total_emissions, created_at) values ($1, $2, 1, $3), ($1, $2, 2, $4)',
      [user.id, JSON.stringify([{ type: 'bus' }]), '2026-01-01T00:00:00Z', '2026-02-01T00:00:00Z'],
    )
    const { rows } = await q('select total_emissions from carbon_entries where user_id = $1 order by created_at desc', [user.id])
    assert(Number(rows[0].total_emissions) === 2, 'Carbon entries were not ordered newest first')
    return { actual: 'Newest carbon entry was returned first.', evidence: shortJson(rows.map((row) => Number(row.total_emissions))) }
  },
)

addCase(
  'DB-CAR-003',
  'Carbon Entries',
  'Cascade carbon entries when user is deleted.',
  'Create carbon entry, delete user, count remaining entries.',
  'Deleting user removes related carbon entries.',
  async () => {
    const user = await createUser('carbon-cascade')
    await q('insert into carbon_entries (user_id, trips, total_emissions) values ($1, $2, 4)', [user.id, JSON.stringify([{ type: 'taxi' }])])
    await q('delete from users where id = $1', [user.id])
    const { rows } = await q('select count(*)::int as count from carbon_entries where user_id = $1', [user.id])
    assert(rows[0].count === 0, 'Carbon entry remained after user delete')
    return { actual: 'User delete cascaded to carbon entries.', evidence: `remaining carbon entries=${rows[0].count}` }
  },
)

addCase(
  'DB-GOAL-001',
  'Carbon Budget Goals',
  'Create and update annual carbon budget goal.',
  'Insert a per-user yearly goal, update annual_budget_kg, then read it back.',
  'The goal row is unique per user/year and stores updated budget.',
  async () => {
    const user = await createUser('goal-update')
    const year = 2026
    const { rows } = await q(
      `insert into carbon_budget_goals (user_id, year, annual_budget_kg)
       values ($1, $2, 1500)
       returning id`,
      [user.id, year],
    )
    await q('update carbon_budget_goals set annual_budget_kg = $3 where user_id = $1 and year = $2', [user.id, year, 1200])
    const read = await q('select annual_budget_kg from carbon_budget_goals where id = $1', [rows[0].id])
    assert(Number(read.rows[0].annual_budget_kg) === 1200, 'Budget goal update did not persist')
    return { actual: 'Annual budget goal was created and updated.', evidence: `annual_budget_kg=${read.rows[0].annual_budget_kg}` }
  },
)

addCase(
  'DB-GOAL-002',
  'Carbon Budget Goals',
  'Reject duplicate user/year goal.',
  'Insert two goals for the same user and year.',
  'The unique(user_id, year) constraint rejects the second row.',
  async () => {
    const user = await createUser('goal-dup')
    await q('insert into carbon_budget_goals (user_id, year, annual_budget_kg) values ($1, 2026, 1000)', [user.id])
    const evidence = await expectDbError(
      () => q('insert into carbon_budget_goals (user_id, year, annual_budget_kg) values ($1, 2026, 1100)', [user.id]),
      '23505',
    )
    return { actual: 'Duplicate annual goal was rejected.', evidence }
  },
)

addCase(
  'DB-GOAL-003',
  'Carbon Budget Goals',
  'Reject invalid goal values.',
  'Insert year outside valid range and non-positive budget.',
  'Check constraints reject invalid year and annual_budget_kg.',
  async () => {
    const user = await createUser('goal-invalid')
    const yearEvidence = await expectDbError(
      () => q('insert into carbon_budget_goals (user_id, year, annual_budget_kg) values ($1, 1999, 1000)', [user.id]),
      '23514',
    )
    const budgetEvidence = await expectDbError(
      () => q('insert into carbon_budget_goals (user_id, year, annual_budget_kg) values ($1, 2026, 0)', [user.id]),
      '23514',
    )
    return { actual: 'Invalid year and budget were rejected.', evidence: `${yearEvidence}; ${budgetEvidence}` }
  },
)

addCase(
  'DB-TODO-001',
  'Todos',
  'Create, read, update, and delete todo row.',
  'Insert todo for a user, mark complete, then delete it.',
  'Todo CRUD operations persist expected state changes.',
  async () => {
    const user = await createUser('todo-crud')
    const inserted = await q('insert into todos (user_id, name) values ($1, $2) returning id, is_complete', [user.id, 'Database todo'])
    await q('update todos set is_complete = true where id = $1 and user_id = $2', [inserted.rows[0].id, user.id])
    const updated = await q('select is_complete from todos where id = $1', [inserted.rows[0].id])
    await q('delete from todos where id = $1', [inserted.rows[0].id])
    const deleted = await q('select count(*)::int as count from todos where id = $1', [inserted.rows[0].id])
    assert(updated.rows[0].is_complete === true && deleted.rows[0].count === 0, 'Todo CRUD state was incorrect')
    return { actual: 'Todo was created, completed, and deleted.', evidence: `is_complete=${updated.rows[0].is_complete}; remaining=${deleted.rows[0].count}` }
  },
)

addCase(
  'DB-TODO-002',
  'Todos',
  'Cascade todos when user is deleted.',
  'Create todo, delete parent user, count remaining todos.',
  'Deleting user removes related todos.',
  async () => {
    const user = await createUser('todo-cascade')
    await q('insert into todos (user_id, name) values ($1, $2)', [user.id, 'Cascade todo'])
    await q('delete from users where id = $1', [user.id])
    const { rows } = await q('select count(*)::int as count from todos where user_id = $1', [user.id])
    assert(rows[0].count === 0, 'Todo remained after user delete')
    return { actual: 'User delete cascaded to todos.', evidence: `remaining todos=${rows[0].count}` }
  },
)

addCase(
  'DB-TRIP-001',
  'Trips And Trip Items',
  'Create valid trip with itinerary item linked to location.',
  'Insert trip and trip_items row with valid day_part and location_id.',
  'Trip and item are stored and joined through foreign keys.',
  async () => {
    const user = await createUser('trip-create')
    const location = await createLocation('trip-create')
    const trip = await createTrip(user.id, 'trip-create')
    const { rows } = await q(
      `insert into trip_items (trip_id, location_id, trip_date, day_part, title, category, sort_order)
       values ($1, $2, '2026-07-02', 'morning', 'Solar walking tour', 'activity', 1)
       returning id, trip_id, location_id, day_part`,
      [trip.id, location.id],
    )
    assert(rows[0].trip_id === trip.id && rows[0].location_id === location.id, 'Trip item link was not stored')
    return { actual: 'Trip and linked itinerary item were created.', evidence: shortJson({ trip, item: rows[0] }) }
  },
)

addCase(
  'DB-TRIP-002',
  'Trips And Trip Items',
  'Reject invalid trip constraints.',
  'Insert invalid date range, status, source, and eco_score values.',
  'Check constraints reject invalid trip values.',
  async () => {
    const user = await createUser('trip-invalid')
    const badDate = await expectDbError(
      () => q(
        `insert into trips (user_id, destination, start_date, end_date)
         values ($1, 'Bad Date Trip', '2026-08-05', '2026-08-01')`,
        [user.id],
      ),
      '23514',
    )
    const badStatus = await expectDbError(
      () => q(
        `insert into trips (user_id, destination, start_date, end_date, status)
         values ($1, 'Bad Status Trip', '2026-08-01', '2026-08-05', 'draft')`,
        [user.id],
      ),
      '23514',
    )
    const badSource = await expectDbError(
      () => q(
        `insert into trips (user_id, destination, start_date, end_date, source)
         values ($1, 'Bad Source Trip', '2026-08-01', '2026-08-05', 'import')`,
        [user.id],
      ),
      '23514',
    )
    const badEco = await expectDbError(
      () => q(
        `insert into trips (user_id, destination, start_date, end_date, eco_score)
         values ($1, 'Bad Eco Trip', '2026-08-01', '2026-08-05', 101)`,
        [user.id],
      ),
      '23514',
    )
    return { actual: 'Invalid trip values were rejected.', evidence: `${badDate}; ${badStatus}; ${badSource}; ${badEco}` }
  },
)

addCase(
  'DB-TRIP-003',
  'Trips And Trip Items',
  'Cascade trip items when trip is deleted.',
  'Create trip item, delete trip, count remaining items.',
  'Deleting trip removes related trip_items.',
  async () => {
    const user = await createUser('trip-cascade')
    const trip = await createTrip(user.id, 'trip-cascade')
    await q(
      `insert into trip_items (trip_id, trip_date, day_part, title, category)
       values ($1, '2026-07-01', 'flexible', 'Cascade item', 'activity')`,
      [trip.id],
    )
    await q('delete from trips where id = $1', [trip.id])
    const { rows } = await q('select count(*)::int as count from trip_items where trip_id = $1', [trip.id])
    assert(rows[0].count === 0, 'Trip item remained after trip delete')
    return { actual: 'Trip delete cascaded to trip items.', evidence: `remaining trip_items=${rows[0].count}` }
  },
)

addCase(
  'DB-TRIP-004',
  'Trips And Trip Items',
  'Set trip item location_id to null when location is deleted.',
  'Create item linked to location, delete location, then read item.',
  'ON DELETE SET NULL preserves the item but clears location_id.',
  async () => {
    const user = await createUser('trip-location-null')
    const location = await createLocation('trip-location-null')
    const trip = await createTrip(user.id, 'trip-location-null')
    const item = await q(
      `insert into trip_items (trip_id, location_id, trip_date, day_part, title, category)
       values ($1, $2, '2026-07-01', 'morning', 'Location-linked item', 'activity')
       returning id`,
      [trip.id, location.id],
    )
    await q('delete from locations where id = $1', [location.id])
    const { rows } = await q('select location_id from trip_items where id = $1', [item.rows[0].id])
    assert(rows[0].location_id === null, 'Trip item location_id was not cleared')
    return { actual: 'Deleting location set trip item location_id to null.', evidence: `location_id=${rows[0].location_id}` }
  },
)

addCase(
  'DB-COM-001',
  'Community Reviews',
  'Create valid community review.',
  'Insert review linked to user and location.',
  'Review is stored with rating, reviewer, practices, and parent links.',
  async () => {
    const user = await createUser('review-create')
    const location = await createLocation('review-create')
    const { rows } = await q(
      `insert into community_reviews (
         user_id, location_id, location_name, city, country, category, rating,
         title, body, practices, reviewer_name, reviewer_initials, verified
       )
       values ($1, $2, $3, 'Kuala Lumpur', 'Malaysia', 'Accommodation', 5,
         'Strong sustainability practices', 'Clear sustainability evidence.', $4, 'Database Tester', 'DT', true)
       returning id, user_id, location_id, rating, practices`,
      [user.id, location.id, location.name, ['Solar Energy', 'Local Hiring']],
    )
    assert(rows[0].rating === 5 && rows[0].user_id === user.id, 'Review was not stored correctly')
    return { actual: 'Community review was created.', evidence: shortJson(rows[0]) }
  },
)

addCase(
  'DB-COM-002',
  'Community Reviews',
  'Reject invalid review rating.',
  'Insert community review with rating=6.',
  'The rating check constraint rejects values outside 1..5.',
  async () => {
    const evidence = await expectDbError(
      () => q(
        `insert into community_reviews (
           location_name, category, rating, title, body, reviewer_name, reviewer_initials
         )
         values ('Invalid Rating Place', 'Accommodation', 6, 'Bad rating', 'Invalid.', 'Tester', 'TT')`,
      ),
      '23514',
    )
    return { actual: 'Invalid rating was rejected.', evidence }
  },
)

addCase(
  'DB-COM-003',
  'Community Helpful Votes',
  'Create helpful vote and reject duplicate vote.',
  'Insert same review_id/user_id helpful vote twice.',
  'The composite primary key rejects duplicate helpful votes.',
  async () => {
    const user = await createUser('helpful-user')
    const reviewer = await createUser('helpful-reviewer')
    const review = await q(
      `insert into community_reviews (
         user_id, location_name, category, rating, title, body, reviewer_name, reviewer_initials
       )
       values ($1, 'Helpful Place', 'Dining', 4, 'Helpful review', 'Useful review body.', 'Reviewer', 'RV')
       returning id`,
      [reviewer.id],
    )
    await q('insert into community_review_helpful (review_id, user_id) values ($1, $2)', [review.rows[0].id, user.id])
    const evidence = await expectDbError(
      () => q('insert into community_review_helpful (review_id, user_id) values ($1, $2)', [review.rows[0].id, user.id]),
      '23505',
    )
    return { actual: 'Duplicate helpful vote was rejected.', evidence }
  },
)

addCase(
  'DB-COM-004',
  'Community Reviews',
  'Set review user_id and location_id to null when parent rows are deleted.',
  'Create linked review, delete user and location, then read review.',
  'ON DELETE SET NULL preserves review history without broken references.',
  async () => {
    const user = await createUser('review-null-user')
    const location = await createLocation('review-null-location')
    const review = await q(
      `insert into community_reviews (
         user_id, location_id, location_name, category, rating, title, body, reviewer_name, reviewer_initials
       )
       values ($1, $2, 'Null Link Place', 'Dining', 4, 'Review', 'Review body.', 'Reviewer', 'RV')
       returning id`,
      [user.id, location.id],
    )
    await q('delete from users where id = $1', [user.id])
    await q('delete from locations where id = $1', [location.id])
    const { rows } = await q('select user_id, location_id from community_reviews where id = $1', [review.rows[0].id])
    assert(rows[0].user_id === null && rows[0].location_id === null, 'Review links were not cleared')
    return { actual: 'Deleted parents cleared review foreign keys.', evidence: shortJson(rows[0]) }
  },
)

addCase(
  'DB-CHAL-001',
  'Community Challenges And Badges',
  'Verify seeded badges and challenges exist.',
  'Count seed rows loaded by db/init/001_schema.sql.',
  'Expected seed records are present for community feature data.',
  async () => {
    const badges = await q('select count(*)::int as count from community_badges')
    const challenges = await q('select count(*)::int as count from community_challenges')
    assert(badges.rows[0].count >= 8 && challenges.rows[0].count >= 4, 'Seeded community rows are missing')
    return {
      actual: 'Seeded community badges and challenges are present.',
      evidence: `community_badges=${badges.rows[0].count}; community_challenges=${challenges.rows[0].count}`,
    }
  },
)

addCase(
  'DB-CHAL-002',
  'Community Challenges And Badges',
  'Create challenge progress and user badge award.',
  'Insert progress and badge award for a valid user/challenge/badge.',
  'Composite primary keys store one progress and one badge award per user.',
  async () => {
    const user = await createUser('challenge-progress')
    const badge = await createBadge('progress')
    const challenge = await createChallenge(badge.id, 'progress')
    const progress = await q(
      `insert into community_challenge_progress (challenge_id, user_id, progress)
       values ($1, $2, 1)
       returning challenge_id, user_id, progress`,
      [challenge.id, user.id],
    )
    const award = await q(
      `insert into community_user_badges (badge_id, user_id)
       values ($1, $2)
       returning badge_id, user_id`,
      [badge.id, user.id],
    )
    assert(progress.rows[0].progress === 1 && award.rows[0].badge_id === badge.id, 'Progress or badge award was not stored')
    return { actual: 'Challenge progress and badge award were created.', evidence: shortJson({ progress: progress.rows[0], award: award.rows[0] }) }
  },
)

addCase(
  'DB-CHAL-003',
  'Community Challenges And Badges',
  'Reject invalid challenge and progress values.',
  'Insert challenge with invalid category, negative points, zero total, and progress below zero.',
  'Check constraints reject invalid community challenge values.',
  async () => {
    const user = await createUser('challenge-invalid')
    const badge = await createBadge('invalid')
    const badCategory = await expectDbError(() => createChallenge(badge.id, 'bad-category', { category: 'Archived' }), '23514')
    const badPoints = await expectDbError(() => createChallenge(badge.id, 'bad-points', { points: -1 }), '23514')
    const badTotal = await expectDbError(() => createChallenge(badge.id, 'bad-total', { total: 0 }), '23514')
    const challenge = await createChallenge(badge.id, 'valid-progress')
    const badProgress = await expectDbError(
      () => q('insert into community_challenge_progress (challenge_id, user_id, progress) values ($1, $2, -1)', [challenge.id, user.id]),
      '23514',
    )
    return { actual: 'Invalid challenge and progress values were rejected.', evidence: `${badCategory}; ${badPoints}; ${badTotal}; ${badProgress}` }
  },
)

addCase(
  'DB-CHAL-004',
  'Community Challenges And Badges',
  'Reject duplicate progress and badge award rows.',
  'Insert duplicate community_challenge_progress and community_user_badges rows.',
  'Composite primary keys reject duplicates.',
  async () => {
    const user = await createUser('challenge-dup')
    const badge = await createBadge('dup')
    const challenge = await createChallenge(badge.id, 'dup')
    await q('insert into community_challenge_progress (challenge_id, user_id, progress) values ($1, $2, 1)', [challenge.id, user.id])
    await q('insert into community_user_badges (badge_id, user_id) values ($1, $2)', [badge.id, user.id])
    const progressEvidence = await expectDbError(
      () => q('insert into community_challenge_progress (challenge_id, user_id, progress) values ($1, $2, 2)', [challenge.id, user.id]),
      '23505',
    )
    const badgeEvidence = await expectDbError(
      () => q('insert into community_user_badges (badge_id, user_id) values ($1, $2)', [badge.id, user.id]),
      '23505',
    )
    return { actual: 'Duplicate progress and badge rows were rejected.', evidence: `${progressEvidence}; ${badgeEvidence}` }
  },
)

addCase(
  'DB-CHAL-005',
  'Community Challenges And Badges',
  'Cascade challenge progress and badge award rows.',
  'Create progress and award rows, then delete challenge, badge, and user parent rows.',
  'Dependent rows are removed by ON DELETE CASCADE.',
  async () => {
    const user = await createUser('challenge-cascade')
    const badge = await createBadge('cascade')
    const challenge = await createChallenge(badge.id, 'cascade')
    await q('insert into community_challenge_progress (challenge_id, user_id, progress) values ($1, $2, 1)', [challenge.id, user.id])
    await q('insert into community_user_badges (badge_id, user_id) values ($1, $2)', [badge.id, user.id])
    await q('delete from community_challenges where id = $1', [challenge.id])
    await q('delete from community_badges where id = $1', [badge.id])
    const progress = await q('select count(*)::int as count from community_challenge_progress where challenge_id = $1', [challenge.id])
    const awards = await q('select count(*)::int as count from community_user_badges where badge_id = $1', [badge.id])
    assert(progress.rows[0].count === 0 && awards.rows[0].count === 0, 'Cascade delete did not remove dependent community rows')
    return {
      actual: 'Challenge and badge deletes cascaded to dependent rows.',
      evidence: `remaining progress=${progress.rows[0].count}; remaining awards=${awards.rows[0].count}`,
    }
  },
)

addCase(
  'DB-SCH-001',
  'Schema Metadata',
  'Verify required tables exist.',
  'Query information_schema.tables for Terratrace application tables.',
  'All major application tables are present.',
  async () => {
    const expectedTables = [
      'users',
      'locations',
      'user_favourites',
      'carbon_entries',
      'carbon_budget_goals',
      'todos',
      'trips',
      'trip_items',
      'community_reviews',
      'community_review_helpful',
      'community_badges',
      'community_challenges',
      'community_challenge_progress',
      'community_user_badges',
    ]
    const { rows } = await q(
      `select table_name from information_schema.tables
       where table_schema = 'public' and table_name = any($1::text[])
       order by table_name`,
      [expectedTables],
    )
    const found = rows.map((row) => row.table_name)
    const missing = expectedTables.filter((table) => !found.includes(table))
    assert(missing.length === 0, `Missing tables: ${missing.join(', ')}`)
    return { actual: `Found ${found.length}/${expectedTables.length} required tables.`, evidence: found.join(', ') }
  },
)

addCase(
  'DB-SCH-002',
  'Schema Metadata',
  'Verify key indexes exist.',
  'Query pg_indexes for expected unique and performance indexes.',
  'Indexes from db/init/001_schema.sql are present.',
  async () => {
    const expectedIndexes = [
      'users_email_lower_idx',
      'locations_category_city_idx',
      'user_favourites_user_id_idx',
      'carbon_entries_user_created_idx',
      'carbon_budget_goals_user_year_idx',
      'todos_user_inserted_idx',
      'trips_user_start_idx',
      'trip_items_trip_sort_idx',
      'trip_items_location_id_idx',
      'community_reviews_created_idx',
      'community_reviews_category_idx',
      'community_challenges_active_idx',
      'community_progress_user_idx',
      'community_user_badges_user_idx',
    ]
    const { rows } = await q('select indexname from pg_indexes where schemaname = $1 and indexname = any($2::text[])', ['public', expectedIndexes])
    const found = rows.map((row) => row.indexname)
    const missing = expectedIndexes.filter((index) => !found.includes(index))
    assert(missing.length === 0, `Missing indexes: ${missing.join(', ')}`)
    return { actual: `Found ${found.length}/${expectedIndexes.length} expected indexes.`, evidence: found.sort().join(', ') }
  },
)

addCase(
  'DB-SCH-003',
  'Schema Metadata',
  'Verify foreign-key and check constraints exist.',
  'Query pg_constraint for foreign key and check constraints on application tables.',
  'Relationship and validation constraints are registered in PostgreSQL.',
  async () => {
    const { rows } = await q(
      `select contype, count(*)::int as count
       from pg_constraint c
       join pg_namespace n on n.oid = c.connamespace
       where n.nspname = 'public'
         and c.conrelid::regclass::text = any($1::text[])
         and contype in ('f', 'c', 'u', 'p')
       group by contype
       order by contype`,
      [
        [
          'users',
          'locations',
          'user_favourites',
          'carbon_entries',
          'carbon_budget_goals',
          'todos',
          'trips',
          'trip_items',
          'community_reviews',
          'community_review_helpful',
          'community_badges',
          'community_challenges',
          'community_challenge_progress',
          'community_user_badges',
        ],
      ],
    )
    const counts = Object.fromEntries(rows.map((row) => [row.contype, row.count]))
    assert((counts.f || 0) >= 13 && (counts.c || 0) >= 10 && (counts.p || 0) >= 10, 'Constraint counts are lower than expected')
    return { actual: 'Foreign-key, check, unique, and primary-key constraints are present.', evidence: shortJson(counts) }
  },
)

async function collectSchemaSummary() {
  const server = await q('select version() as version')
  const tables = await q(
    `select table_name
     from information_schema.tables
     where table_schema = 'public' and table_type = 'BASE TABLE'
     order by table_name`,
  )
  const indexes = await q(
    `select tablename, indexname
     from pg_indexes
     where schemaname = 'public'
     order by tablename, indexname`,
  )
  const constraints = await q(
    `select
       c.conrelid::regclass::text as table_name,
       c.conname as constraint_name,
       case c.contype
         when 'p' then 'primary key'
         when 'f' then 'foreign key'
         when 'u' then 'unique'
         when 'c' then 'check'
         else c.contype::text
       end as constraint_type
     from pg_constraint c
     join pg_namespace n on n.oid = c.connamespace
     where n.nspname = 'public'
     order by table_name, constraint_type, constraint_name`,
  )

  return {
    version: server.rows[0].version,
    tables: tables.rows.map((row) => row.table_name),
    indexes: indexes.rows,
    constraints: constraints.rows,
  }
}

async function runCases() {
  for (const testCase of cases) {
    await withSavepoint(async () => {
      try {
        const result = await testCase.execute()
        testCase.actual = result.actual
        testCase.evidence = result.evidence
        testCase.status = 'Pass'
      } catch (error) {
        testCase.actual = error.stack || error.message
        testCase.evidence = 'Execution error'
        testCase.status = 'Fail'
      }
    })
  }
}

function paragraph(text, options = {}) {
  return new Paragraph({
    ...options,
    children: [new TextRun({ text: String(text), size: options.size || 22, bold: options.bold })],
  })
}

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    text,
    heading: level,
    spacing: { before: 260, after: 120 },
  })
}

function cell(text, options = {}) {
  return new TableCell({
    width: options.width ? { size: options.width, type: WidthType.PERCENTAGE } : undefined,
    shading: options.header ? { fill: 'D9EAD3' } : undefined,
    children: [
      new Paragraph({
        children: [new TextRun({ text: String(text ?? ''), bold: options.header, size: options.header ? 20 : 18 })],
      }),
    ],
  })
}

function table(headers, rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: headers.map((header) => cell(header, { header: true })) }),
      ...rows.map((row) => new TableRow({ children: row.map((value) => cell(value)) })),
    ],
  })
}

function statusSummaryRows() {
  const pass = cases.filter((testCase) => testCase.status === 'Pass').length
  const fail = cases.filter((testCase) => testCase.status === 'Fail').length
  return [
    ['Total database test cases', cases.length],
    ['Passed', pass],
    ['Failed', fail],
    ['Pass rate', `${Math.round((pass / cases.length) * 100)}%`],
  ]
}

async function buildReport(schemaSummary) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'Terratrace Database Testing Report', bold: true, size: 32 })],
            spacing: { after: 220 },
          }),
          paragraph(`Report date: ${reportDate}`),
          paragraph(`Schema source: db/init/001_schema.sql`),
          paragraph(`Database connection: ${redactConnectionString(databaseUrl)}`),
          paragraph(`PostgreSQL version: ${schemaSummary.version}`),
          heading('Objective', HeadingLevel.HEADING_1),
          paragraph(
            'Verify Terratrace database CRUD operations, integrity rules, uniqueness constraints, check constraints, foreign-key relationships, cascading behavior, seed data, indexes, and data consistency using direct PostgreSQL queries.',
          ),
          heading('Environment And Tools', HeadingLevel.HEADING_1),
          table(
            ['Item', 'Value'],
            [
              ['Database', 'PostgreSQL local Docker service terratrace-postgres'],
              ['Connection', redactConnectionString(databaseUrl)],
              ['Execution tool', 'Node.js script using pg and docx packages'],
              ['Isolation method', 'Top-level transaction with per-test savepoints and final rollback'],
              ['Evidence type', 'SQL query results, row counts, returned rows, and PostgreSQL error codes'],
            ],
          ),
          heading('Execution Summary', HeadingLevel.HEADING_1),
          table(['Metric', 'Result'], statusSummaryRows()),
          heading('Schema Summary', HeadingLevel.HEADING_1),
          paragraph(`Application tables found: ${schemaSummary.tables.join(', ')}`),
          paragraph(`Indexes documented: ${schemaSummary.indexes.length}`),
          paragraph(`Constraints documented: ${schemaSummary.constraints.length}`),
          table(
            ['Constraint Type', 'Count'],
            Object.entries(
              schemaSummary.constraints.reduce((acc, row) => {
                acc[row.constraint_type] = (acc[row.constraint_type] || 0) + 1
                return acc
              }, {}),
            ),
          ),
          heading('Detailed Test Cases', HeadingLevel.HEADING_1),
          table(
            ['Test ID', 'Module/Feature', 'Scenario', 'Input/Steps', 'Expected Result', 'Actual Result', 'Status', 'Evidence'],
            cases.map((testCase) => [
              testCase.id,
              testCase.module,
              testCase.scenario,
              testCase.input,
              testCase.expected,
              testCase.actual,
              testCase.status,
              testCase.evidence,
            ]),
          ),
          heading('Indexes Verified', HeadingLevel.HEADING_1),
          table(
            ['Table', 'Index'],
            schemaSummary.indexes.map((row) => [row.tablename, row.indexname]),
          ),
          heading('Constraints Verified', HeadingLevel.HEADING_1),
          table(
            ['Table', 'Constraint', 'Type'],
            schemaSummary.constraints.map((row) => [row.table_name, row.constraint_name, row.constraint_type]),
          ),
          heading('Conclusion', HeadingLevel.HEADING_1),
          paragraph(
            cases.every((testCase) => testCase.status === 'Pass')
              ? 'All executed database test cases passed. CRUD operations, uniqueness rules, check constraints, foreign-key integrity, cascade behavior, seed data, indexes, and schema metadata matched the expected Terratrace database design.'
              : 'One or more database test cases failed. Review the failed rows in the detailed test table before submission.',
          ),
        ],
      },
    ],
  })

  const buffer = await Packer.toBuffer(doc)
  await writeFile(outputPath, buffer)
}

async function main() {
  client = await pool.connect()
  let schemaSummary

  try {
    await q('begin')
    await q('select 1')
    schemaSummary = await collectSchemaSummary()
    await runCases()
    await q('rollback')
  } catch (error) {
    try {
      await q('rollback')
    } catch {
      // Ignore rollback failures while reporting the original error.
    }
    throw error
  } finally {
    client.release()
    await pool.end()
  }

  await buildReport(schemaSummary)

  const passed = cases.filter((testCase) => testCase.status === 'Pass').length
  const failed = cases.filter((testCase) => testCase.status === 'Fail').length
  console.log(`Database tests complete: ${passed} passed, ${failed} failed, ${cases.length} total`)
  console.log(`Report written to ${outputPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
