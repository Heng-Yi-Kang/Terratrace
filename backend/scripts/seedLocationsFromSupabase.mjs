import fs from 'node:fs'
import pg from 'pg'
import dotenv from 'dotenv'

for (const path of ['.env', 'backend/.env', 'frontend/.env.local']) {
  if (fs.existsSync(path)) {
    dotenv.config({ path, override: false })
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const databaseUrl = process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL

if (!supabaseUrl) {
  console.error('Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL')
  process.exit(1)
}

if (!supabaseKey) {
  console.error('Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')
  process.exit(1)
}

if (!databaseUrl) {
  console.error('Missing required environment variable: DATABASE_URL')
  process.exit(1)
}

const pool = new pg.Pool({ connectionString: databaseUrl })
const pageSize = 1000

function normalizeTextArray(value) {
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string') : []
}

function normalizeNumber(value) {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

async function fetchSupabaseLocations() {
  const baseUrl = supabaseUrl.replace(/\/$/, '')
  const rows = []

  for (let from = 0; ; from += pageSize) {
    const to = from + pageSize - 1
    const url = `${baseUrl}/rest/v1/locations?select=*&order=category.asc&order=city.asc&order=name.asc`
    const response = await fetch(url, {
      headers: {
        apikey: supabaseKey,
        authorization: `Bearer ${supabaseKey}`,
        prefer: 'count=exact',
        range: `${from}-${to}`,
      },
    })

    const body = await response.text()
    if (!response.ok) {
      throw new Error(`Supabase locations query failed: ${response.status} ${response.statusText}\n${body}`)
    }

    const page = body ? JSON.parse(body) : []
    rows.push(...page)

    if (page.length < pageSize) return rows
  }
}

async function upsertLocation(client, row) {
  if (!row.public_id) {
    throw new Error(`Supabase location is missing public_id: ${row.name ?? row.id ?? 'unknown row'}`)
  }

  await client.query(
    `insert into locations (
       id, name, public_id, category, city, country, address, lat, lng, long,
       eco_certs, eco_tags, eco_score, description, image_url, image_thumb,
       foursquare_id, ex_booking_url, created_at, updated_at
     ) values (
       $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
       $11, $12, $13, $14, $15, $16,
       $17, $18, coalesce($19::timestamptz, now()), coalesce($20::timestamptz, now())
     )
     on conflict (public_id) do update set
       name = excluded.name,
       category = excluded.category,
       city = excluded.city,
       country = excluded.country,
       address = excluded.address,
       lat = excluded.lat,
       lng = excluded.lng,
       long = excluded.long,
       eco_certs = excluded.eco_certs,
       eco_tags = excluded.eco_tags,
       eco_score = excluded.eco_score,
       description = excluded.description,
       image_url = excluded.image_url,
       image_thumb = excluded.image_thumb,
       foursquare_id = excluded.foursquare_id,
       ex_booking_url = excluded.ex_booking_url,
       updated_at = now()`,
    [
      row.id ?? null,
      row.name ?? null,
      row.public_id,
      row.category ?? null,
      row.city ?? null,
      row.country ?? null,
      row.address ?? null,
      normalizeNumber(row.lat),
      normalizeNumber(row.lng),
      normalizeNumber(row.long ?? row.lng),
      normalizeTextArray(row.eco_certs),
      normalizeTextArray(row.eco_tags),
      normalizeNumber(row.eco_score),
      row.description ?? null,
      row.image_url ?? null,
      row.image_thumb ?? null,
      row.foursquare_id ?? null,
      row.ex_booking_url ?? null,
      row.created_at ?? null,
      row.updated_at ?? null,
    ],
  )
}

async function main() {
  const rows = await fetchSupabaseLocations()
  const client = await pool.connect()

  try {
    await client.query('begin')
    for (const row of rows) {
      await upsertLocation(client, row)
    }
    await client.query('commit')
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
    await pool.end()
  }

  const counts = rows.reduce((acc, row) => {
    const category = row.category ?? '(null)'
    acc[category] = (acc[category] ?? 0) + 1
    return acc
  }, {})

  console.log(`Seeded ${rows.length} locations from Supabase into local Postgres.`)
  for (const [category, count] of Object.entries(counts).sort(([a], [b]) => a.localeCompare(b))) {
    console.log(`- ${category}: ${count}`)
  }
}

main().catch(async (error) => {
  await pool.end().catch(() => {})
  console.error(error)
  process.exit(1)
})
