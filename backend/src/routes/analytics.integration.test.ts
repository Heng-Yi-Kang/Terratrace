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

let app: Application
let server: Server
let baseUrl: string
let query: Query
let pool: Pool

const emailPrefix = `integration.analytics.${Date.now()}`

function testEmail(suffix: string): string {
  return `${emailPrefix}.${suffix}@example.com`
}

function extractSessionCookie(headers: Headers): string {
  const setCookie = headers.get('set-cookie') || ''
  const match = setCookie.match(/terratrace_session=[^;]+/)
  expect(match).not.toBeNull()
  return match![0]
}

async function api(path: string, options: RequestInit = {}) {
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

async function signup(suffix: string) {
  const response = await api('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      email: testEmail(suffix),
      password: 'password123',
      username: suffix,
    }),
  })

  expect(response.status).toBe(200)
  return {
    userId: response.body.data.user.id as string,
    cookie: extractSessionCookie(response.headers),
  }
}

async function ensureGoalTable(): Promise<void> {
  await query(`
    create table if not exists carbon_budget_goals (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references users(id) on delete cascade,
      year integer not null check (year >= 2000 and year <= 2100),
      annual_budget_kg numeric not null check (annual_budget_kg > 0),
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      unique (user_id, year)
    )
  `)
}

async function cleanup(): Promise<void> {
  await query('delete from users where email like $1', [`${emailPrefix}.%@example.com`])
}

async function insertCarbonEntry(userId: string, createdAt: string, trips: unknown[], totals: Record<string, number>) {
  await query(
    `insert into carbon_entries (
      user_id, trips, total_emissions, flight_emissions, car_emissions, hotel_emissions,
      rail_emissions, bus_emissions, taxi_emissions, created_at
    ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      userId,
      JSON.stringify(trips),
      totals.total || 0,
      totals.flight || 0,
      totals.car || 0,
      totals.hotel || 0,
      totals.rail || 0,
      totals.bus || 0,
      totals.taxi || 0,
      createdAt,
    ],
  )
}

beforeAll(async () => {
  const appModule = await import('../app')
  const dbModule = await import('../utils/db')

  app = appModule.createApp()
  query = dbModule.query
  pool = dbModule.pool

  await query('select 1')
  await ensureGoalTable()
  await cleanup()

  server = app.listen(0)
  await new Promise<void>((resolve) => server.once('listening', resolve))
  const address = server.address() as AddressInfo
  baseUrl = `http://127.0.0.1:${address.port}`
})

afterAll(async () => {
  await cleanup()
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()))
  })
  await pool.end()
})

describe('analytics routes', () => {
  it('rejects unauthenticated impact requests', async () => {
    const response = await api('/api/analytics/impact')

    expect(response.status).toBe(401)
  })

  it('returns an empty authenticated impact summary', async () => {
    const user = await signup('empty')

    const response = await api('/api/analytics/impact?period=all', {
      headers: { cookie: user.cookie },
    })

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      actualEmissionsKg: 0,
      baselineEmissionsKg: 0,
      carbonSavedKg: 0,
      treeEquivalent: 0,
      loggedCalculations: 0,
      breakdown: [],
      overTime: [],
      entries: [],
    })
  })

  it('summarizes authenticated impact data and filters by current year', async () => {
    const user = await signup('impact')
    const other = await signup('other')
    const currentYear = new Date().getUTCFullYear()

    await insertCarbonEntry(
      user.userId,
      `${currentYear}-06-05T00:00:00.000Z`,
      [{ type: 'rail', distanceKm: 100, RailType: 'national', isReturn: false }],
      { total: 3.546, rail: 3.546 },
    )
    await insertCarbonEntry(
      user.userId,
      `${currentYear - 1}-06-05T00:00:00.000Z`,
      [{ type: 'bus', distanceKm: 100, BusType: 'coach' }],
      { total: 2.776, bus: 2.776 },
    )
    await insertCarbonEntry(
      other.userId,
      `${currentYear}-06-05T00:00:00.000Z`,
      [{ type: 'hotel', nights: 10, HotelType: 'luxury' }],
      { total: 600, hotel: 600 },
    )

    const all = await api('/api/analytics/impact?period=all', {
      headers: { cookie: user.cookie },
    })
    const year = await api('/api/analytics/impact?period=year', {
      headers: { cookie: user.cookie },
    })

    expect(all.status).toBe(200)
    expect(all.body.loggedCalculations).toBe(2)
    expect(all.body.carbonSavedKg).toBeCloseTo(26.2, 1)
    expect(all.body.breakdown.map((item: any) => item.method)).toEqual(['bus', 'rail'])

    expect(year.status).toBe(200)
    expect(year.body.loggedCalculations).toBe(1)
    expect(year.body.breakdown[0]).toMatchObject({ method: 'rail', savedKg: 12.7 })
  })

  it('creates, reads, and updates a per-user annual budget goal', async () => {
    const user = await signup('goal')
    const other = await signup('goal-other')
    const year = new Date().getUTCFullYear()

    await insertCarbonEntry(
      user.userId,
      `${year}-01-05T00:00:00.000Z`,
      [{ type: 'car', distanceKm: 100, CarType: 'petrol', passengers: 1 }],
      { total: 16.272, car: 16.272 },
    )
    await api('/api/analytics/goal', {
      method: 'PUT',
      headers: { cookie: other.cookie },
      body: JSON.stringify({ year, annualBudgetKg: 999 }),
    })

    const created = await api('/api/analytics/goal', {
      method: 'PUT',
      headers: { cookie: user.cookie },
      body: JSON.stringify({ year, annualBudgetKg: 100 }),
    })
    const fetched = await api(`/api/analytics/goal?year=${year}`, {
      headers: { cookie: user.cookie },
    })
    const updated = await api('/api/analytics/goal', {
      method: 'PUT',
      headers: { cookie: user.cookie },
      body: JSON.stringify({ year, annualBudgetKg: 200 }),
    })

    expect(created.status).toBe(200)
    expect(created.body.goal).toMatchObject({ year, annualBudgetKg: 100 })
    expect(fetched.status).toBe(200)
    expect(fetched.body.goal).toMatchObject({ year, annualBudgetKg: 100 })
    expect(fetched.body.usedKg).toBe(16.3)
    expect(fetched.body.remainingKg).toBe(83.7)
    expect(fetched.body.percentUsed).toBe(16.3)
    expect(updated.body.goal).toMatchObject({ year, annualBudgetKg: 200 })
  })

  it('rejects invalid goal budgets', async () => {
    const user = await signup('invalid-goal')

    const response = await api('/api/analytics/goal', {
      method: 'PUT',
      headers: { cookie: user.cookie },
      body: JSON.stringify({ year: 2026, annualBudgetKg: 0 }),
    })

    expect(response.status).toBe(400)
  })
})

