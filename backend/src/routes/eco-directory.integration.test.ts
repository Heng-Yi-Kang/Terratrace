import type { Server } from 'http'
import type { AddressInfo } from 'net'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Application } from 'express'
import type { Pool, QueryResult, QueryResultRow } from 'pg'

process.env.DATABASE_URL ||= 'postgres://terratrace:terratrace@localhost:5433/terratrace'
process.env.JWT_SECRET ||= 'terratrace-integration-test-secret'
process.env.NODE_ENV = 'test'

type Query = <T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
) => Promise<QueryResult<T>>

type JsonResponse = {
  status: number
  headers: Headers
  body: any
}

type SeedLocation = {
  id: string
  public_id: string
  name: string
  category: string
  city: string
}

let app: Application
let server: Server
let baseUrl: string
let query: Query
let pool: Pool
let seededLocations: SeedLocation[] = []

const prefix = `integration.eco-directory.${Date.now()}`
const email = `${prefix}@example.com`

async function api(path: string, options: RequestInit = {}): Promise<JsonResponse> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  })

  const text = await response.text()
  return {
    status: response.status,
    headers: response.headers,
    body: text ? JSON.parse(text) : null,
  }
}

function extractSessionCookie(headers: Headers): string {
  const setCookie = headers.get('set-cookie') || ''
  const match = setCookie.match(/terratrace_session=[^;]+/)
  expect(match, 'expected response to set terratrace_session cookie').not.toBeNull()
  return match![0]
}

async function cleanupTestData(): Promise<void> {
  await query(
    `delete from user_favourites
     where location_id in (select id from locations where public_id like $1)
        or user_id in (select id from users where email = $2)`,
    [`${prefix}.%`, email],
  )
  await query('delete from locations where public_id like $1', [`${prefix}.%`])
  await query('delete from users where email = $1', [email])
}

async function seedLocations(): Promise<SeedLocation[]> {
  const { rows } = await query<SeedLocation>(
    `insert into locations
       (name, public_id, category, city, country, address, lat, lng, eco_certs, eco_tags, eco_score, description, image_url, image_thumb)
     values
       ($1, $2, 'Accommodation', 'Kuala Lumpur', 'Malaysia', '1 Canopy Lane', 3.1528, 101.7037, ARRAY['Green Key', 'Solar powered'], ARRAY['rainwater', 'low waste'], 92, 'Solar-powered retreat with low-waste amenities.', 'https://example.com/canopy.jpg', 'https://example.com/canopy-thumb.jpg'),
       ($3, $4, 'Dining', 'Penang', 'Malaysia', '2 Compost Street', 5.4164, 100.3327, ARRAY['Organic Certified'], ARRAY['vegan', 'composting'], 88, 'Plant-forward cafe with composting program.', 'https://example.com/compost.jpg', 'https://example.com/compost-thumb.jpg'),
       ($5, $6, 'Transport', 'Kuala Lumpur', 'Malaysia', '3 Transit Hub', 3.139, 101.6869, ARRAY['EV charging'], ARRAY['public transit'], 84, 'Electric shuttle and bike-share station.', 'https://example.com/transit.jpg', 'https://example.com/transit-thumb.jpg')
     returning id, public_id, name, category, city`,
    [
      `${prefix} Solar Canopy Lodge`,
      `${prefix}.solar-canopy-lodge`,
      `${prefix} Compost Kitchen`,
      `${prefix}.compost-kitchen`,
      `${prefix} Electric Transit Hub`,
      `${prefix}.electric-transit-hub`,
    ],
  )

  return rows
}

async function signupAndGetCookie(): Promise<string> {
  const response = await api('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password: 'password123',
      username: 'eco-directory-user',
      role: 'user',
    }),
  })

  expect(response.status).toBe(200)
  return extractSessionCookie(response.headers)
}

beforeAll(async () => {
  const appModule = await import('../app')
  const dbModule = await import('../utils/db')

  app = appModule.createApp()
  query = dbModule.query
  pool = dbModule.pool

  await query('select 1')
  await cleanupTestData()
  seededLocations = await seedLocations()

  server = app.listen(0)
  await new Promise<void>((resolve) => server.once('listening', resolve))
  const address = server.address() as AddressInfo
  baseUrl = `http://127.0.0.1:${address.port}`
})

afterAll(async () => {
  await cleanupTestData()
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()))
  })
  await pool.end()
})

describe('eco-friendly directory integration', () => {
  it('IT-DIR-001 lists sustainable directory locations from PostgreSQL through the API', async () => {
    const response = await api(`/api/locations?q=${encodeURIComponent(prefix)}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(3)
    expect(response.body.map((place: any) => place.name)).toEqual([
      `${prefix} Compost Kitchen`,
      `${prefix} Electric Transit Hub`,
      `${prefix} Solar Canopy Lodge`,
    ])
    expect(response.body[0]).toMatchObject({
      category: 'Dining',
      city: 'Penang',
      country: 'Malaysia',
      ecoCerts: ['Organic Certified'],
      ecoTags: ['vegan', 'composting'],
      publicId: `${prefix}.compost-kitchen`,
    })
    expect(response.body[0].bookingUrl).toContain('google.com/search')
  })

  it('IT-DIR-002 applies geo-specific search filters and exposes city options', async () => {
    const filtered = await api(
      `/api/locations?q=${encodeURIComponent('solar')}&city=${encodeURIComponent('Kuala Lumpur')}&category=Accommodation`,
    )

    expect(filtered.status).toBe(200)
    expect(filtered.body).toHaveLength(1)
    expect(filtered.body[0]).toMatchObject({
      name: `${prefix} Solar Canopy Lodge`,
      category: 'Accommodation',
      city: 'Kuala Lumpur',
    })

    const invalid = await api('/api/locations?category=Museum')
    expect(invalid.status).toBe(400)
    expect(invalid.body.error).toMatch(/category must be/i)

    const cities = await api('/api/locations/cities')
    expect(cities.status).toBe(200)
    expect(cities.body).toEqual(expect.arrayContaining(['Kuala Lumpur', 'Penang']))
  })

  it('IT-DIR-003 returns detail and same-category recommendation data for place pages', async () => {
    const target = seededLocations.find((location) => location.category === 'Dining')!

    const detail = await api(`/api/locations/${target.public_id}`)
    expect(detail.status).toBe(200)
    expect(detail.body).toMatchObject({
      id: target.id,
      publicId: target.public_id,
      name: target.name,
      category: 'Dining',
      description: 'Plant-forward cafe with composting program.',
    })

    const missing = await api(`/api/locations/${prefix}.missing`)
    expect(missing.status).toBe(404)
    expect(missing.body.error).toMatch(/not found/i)

    const recommendations = await api(
      `/api/locations/recommendations?category=Accommodation&city=${encodeURIComponent('Kuala Lumpur')}`,
    )
    expect(recommendations.status).toBe(200)
    expect(recommendations.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          publicId: `${prefix}.solar-canopy-lodge`,
          category: 'Accommodation',
          city: 'Kuala Lumpur',
        }),
      ]),
    )
  })

  it('IT-DIR-004 persists authenticated favourites and returns mapped saved places', async () => {
    const cookie = await signupAndGetCookie()
    const location = seededLocations.find((item) => item.category === 'Transport')!

    const missingSession = await api('/api/favourites')
    expect(missingSession.status).toBe(401)
    expect(missingSession.body.error).toBe('Missing session')

    const save = await api('/api/favourites', {
      method: 'POST',
      headers: { cookie },
      body: JSON.stringify({ locationId: location.id }),
    })
    expect(save.status).toBe(201)
    expect(save.body).toMatchObject({
      id: location.id,
      publicId: location.public_id,
      name: location.name,
      category: 'Transport',
      favouriteId: expect.any(String),
      savedAt: expect.any(String),
    })

    const stored = await query<{ count: string }>(
      'select count(*) from user_favourites where location_id = $1',
      [location.id],
    )
    expect(Number(stored.rows[0].count)).toBe(1)

    const duplicate = await api('/api/favourites', {
      method: 'POST',
      headers: { cookie },
      body: JSON.stringify({ locationId: location.id }),
    })
    expect(duplicate.status).toBe(409)

    const list = await api('/api/favourites', {
      headers: { cookie },
    })
    expect(list.status).toBe(200)
    expect(list.body).toEqual([
      expect.objectContaining({
        id: location.id,
        publicId: location.public_id,
        category: 'Transport',
      }),
    ])

    const remove = await api(`/api/favourites/${location.id}`, {
      method: 'DELETE',
      headers: { cookie },
    })
    expect(remove.status).toBe(200)

    const afterDelete = await query<{ count: string }>(
      'select count(*) from user_favourites where location_id = $1',
      [location.id],
    )
    expect(Number(afterDelete.rows[0].count)).toBe(0)
  })
})
