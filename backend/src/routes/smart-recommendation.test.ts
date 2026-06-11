import express from 'express'
import type { Server } from 'http'
import type { AddressInfo } from 'net'
import { afterEach, describe, expect, it, vi } from 'vitest'
import smartRecommendationRoutes from './smart-recommendation'

function createTestServer() {
  const app = express()
  app.use(express.json())
  app.use('/api/recommendations', smartRecommendationRoutes)
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

async function postJson(baseUrl: string, body: unknown) {
  const response = await fetch(`${baseUrl}/api/recommendations/smart`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  const text = await response.text()
  let parsed: unknown
  try {
    parsed = text ? JSON.parse(text) : null
  } catch (error) {
    throw new Error(`Expected JSON response but got ${response.status}: ${text}`)
  }

  return {
    status: response.status,
    body: parsed,
  }
}

afterEach(() => {
  vi.restoreAllMocks()
  delete process.env.GEMINI_API_KEY
})

describe('smart recommendation routes', () => {
  it('validates required trip planning inputs', async () => {
    const { server, baseUrl } = await createTestServer()

    try {
      const response = await postJson(baseUrl, {
        city: '',
        startDate: '2026-06-12',
        endDate: '2026-06-13',
        budget: 200,
        interests: ['nature'],
      })

      expect(response.status).toBe(400)
      expect(response.body).toMatchObject({ error: 'City is required.' })
      expect(response.body.requestId).toEqual(expect.any(String))
    } finally {
      await closeServer(server)
    }
  })

  it('builds scored candidates and falls back deterministically when Gemini is unavailable', async () => {
    const city = `Testopolis-${Date.now()}`
    const originalFetch = globalThis.fetch
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
      const requestUrl = String(url)

      if (requestUrl.startsWith('http://127.0.0.1:')) {
        return originalFetch(url, init)
      }

      if (requestUrl.includes('geocoding-api.open-meteo.com')) {
        return new Response(JSON.stringify({
          results: [{
            name: city,
            country: 'Malaysia',
            latitude: 3.139,
            longitude: 101.6869,
          }],
        }), { status: 200 })
      }

      if (requestUrl.includes('api.open-meteo.com')) {
        return new Response(JSON.stringify({
          daily: {
            weather_code: [61, 80],
            temperature_2m_max: [30, 31],
            temperature_2m_min: [24, 25],
          },
        }), { status: 200 })
      }

      return new Response(`
        <a class="result__a" href="https://greenkey.global/test-eco-hotel">Green Key Eco Hotel</a>
        <div class="result__snippet">Eco-certified hotel with local sustainable travel programs.</div>
        <a class="result__a" href="https://responsibletravel.com/test-local-market">Local Sustainable Food Market</a>
        <div class="result__snippet">Responsible food market, organic restaurant, and community dining.</div>
        <a class="result__a" href="https://earthcheck.org/test-nature-museum">EarthCheck Nature Museum</a>
        <div class="result__snippet">Certified indoor museum with nature and culture exhibits.</div>
      `, { status: 200 })
    })

    const { server, baseUrl } = await createTestServer()

    try {
      const response = await postJson(baseUrl, {
        city,
        startDate: '2026-06-12',
        endDate: '2026-06-13',
        budget: 600,
        interests: ['nature', 'food', 'invalid'],
      })

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        provider: 'deterministic-fallback',
        cacheHit: false,
        weather: {
          cityName: city,
          country: 'Malaysia',
          condition: 'rainy',
        },
      })
      expect(response.body.shortlistedCandidates).toHaveLength(3)
      expect(response.body.shortlistedCandidates[0]).toMatchObject({
        sourceDomain: expect.any(String),
        scoreBreakdown: {
          total: expect.any(Number),
        },
      })
      expect(response.body.plan.recommendations).toHaveLength(3)
      expect(response.body.plan.totalEstimatedCost).toBeLessThanOrEqual(600)
    } finally {
      await closeServer(server)
    }
  })
})
