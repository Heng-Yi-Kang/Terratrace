import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import type { Server } from 'http'
import type { AddressInfo } from 'net'
import { afterEach, describe, expect, it, vi } from 'vitest'

const dbMocks = vi.hoisted(() => {
  const query = vi.fn()
  const clientQuery = vi.fn()
  const release = vi.fn()
  const connect = vi.fn(async () => ({ query: clientQuery, release }))

  return {
    query,
    clientQuery,
    release,
    connect,
  }
})

vi.mock('../middleware/auth', () => ({
  requireAuth: (req: Request, _res: Response, next: NextFunction) => {
    ;(req as Request & { user: { id: string; email: string } }).user = {
      id: 'user-1',
      email: 'traveler@example.com',
    }
    next()
  },
}))

vi.mock('../utils/db', () => ({
  query: dbMocks.query,
  pool: {
    connect: dbMocks.connect,
  },
}))

const tripsRoutes = (await import('./trips')).default

function createTestServer() {
  const app = express()
  app.use(express.json())
  app.use('/api/trips', tripsRoutes)
  const server = app.listen(0)

  return new Promise<{ server: Server; baseUrl: string }>((resolve) => {
    server.once('listening', () => {
      const address = server.address() as AddressInfo
      resolve({ server, baseUrl: `http://127.0.0.1:${address.port}` })
    })
  })
}

async function closeServer(server: Server) {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()))
  })
}

async function postTrip(baseUrl: string, body: unknown) {
  const response = await fetch(`${baseUrl}/api/trips`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })

  return {
    status: response.status,
    body: await response.json(),
  }
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('trips routes', () => {
  it('rejects invalid trip date ranges before touching the database', async () => {
    const { server, baseUrl } = await createTestServer()

    try {
      const response = await postTrip(baseUrl, {
        destination: 'Penang',
        startDate: '2026-06-14',
        endDate: '2026-06-12',
      })

      expect(response.status).toBe(400)
      expect(response.body).toEqual({ error: 'startDate must be before or equal to endDate' })
      expect(dbMocks.connect).not.toHaveBeenCalled()
      expect(dbMocks.query).not.toHaveBeenCalled()
    } finally {
      await closeServer(server)
    }
  })

  it('creates a trip with normalized itinerary items in a transaction', async () => {
    const tripId = 'trip-1'
    dbMocks.clientQuery
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: tripId }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })

    dbMocks.query.mockResolvedValueOnce({
      rows: [{
        id: tripId,
        destination: 'Penang',
        start_date: '2026-06-12',
        end_date: '2026-06-14',
        budget: '500',
        interests: ['food', 'culture'],
        eco_score: 80,
        status: 'upcoming',
        source: 'manual',
        source_request_id: null,
        weather_condition: 'rainy',
        total_estimated_cost: '120',
        created_at: '2026-06-01T00:00:00.000Z',
        updated_at: '2026-06-01T00:00:00.000Z',
        item_id: 'item-1',
        location_id: null,
        trip_date: '2026-06-12',
        day_part: 'flexible',
        item_title: 'Local market',
        category: 'food',
        estimated_cost: '30',
        rationale: 'Local vendors',
        weather_alternative: null,
        community_impact: null,
        sort_order: 0,
        location_public_id: null,
        location_name: null,
        location_category: null,
        location_city: null,
      }],
    })

    const { server, baseUrl } = await createTestServer()

    try {
      const response = await postTrip(baseUrl, {
        destination: ' Penang ',
        startDate: '2026-06-12',
        endDate: '2026-06-14',
        budget: '500',
        interests: ['food', 'culture', ''],
        ecoScore: 80,
        weatherCondition: 'rainy',
        totalEstimatedCost: 120,
        items: [{
          tripDate: '2026-07-01',
          dayPart: 'late',
          title: ' Local market ',
          category: 'food',
          estimatedCost: '30',
          rationale: 'Local vendors',
        }],
      })

      expect(response.status).toBe(201)
      expect(response.body).toMatchObject({
        id: tripId,
        destination: 'Penang',
        budget: 500,
        interests: ['food', 'culture'],
        totalEstimatedCost: 120,
        items: [{
          title: 'Local market',
          tripDate: '2026-06-12',
          dayPart: 'flexible',
          estimatedCost: 30,
        }],
      })
      expect(dbMocks.clientQuery.mock.calls.map(([sql]) => String(sql).trim().split(/\s+/)[0].toLowerCase())).toEqual([
        'begin',
        'insert',
        'delete',
        'insert',
        'commit',
      ])
      expect(dbMocks.clientQuery.mock.calls[1][1]).toEqual([
        'user-1',
        'Penang',
        '2026-06-12',
        '2026-06-14',
        500,
        ['food', 'culture'],
        80,
        'upcoming',
        'manual',
        null,
        'rainy',
        120,
      ])
      expect(dbMocks.clientQuery.mock.calls[3][1]).toEqual([
        tripId,
        null,
        '2026-06-12',
        'flexible',
        'Local market',
        'food',
        30,
        'Local vendors',
        null,
        null,
        0,
      ])
      expect(dbMocks.release).toHaveBeenCalledOnce()
    } finally {
      await closeServer(server)
    }
  })
})
