import express from 'express'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import carbonRoutes from './carbon'

const app = express()
app.use(express.json())
app.use('/api/carbon', carbonRoutes)

const carbonResult = {
  total: 110,
  flightEmissions: 80,
  carEmissions: 10,
  hotelEmissions: 5,
  railEmissions: 5,
  busEmissions: 5,
  taxiEmissions: 5,
}

describe('carbon routes', () => {
  const originalGeminiKey = process.env.GEMINI_API_KEY
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
    delete process.env.GEMINI_API_KEY
  })

  afterEach(() => {
    if (originalGeminiKey) {
      process.env.GEMINI_API_KEY = originalGeminiKey
    } else {
      delete process.env.GEMINI_API_KEY
    }
  })

  it('returns deterministic fallback suggestions when Gemini is not configured', async () => {
    const server = app.listen(0)
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('Test server did not start')

    try {
      const response = await fetch(`http://127.0.0.1:${address.port}/api/carbon/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result: carbonResult }),
      })

      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.provider).toBe('deterministic-fallback')
      expect(body.highestSource).toBe('Flight')
      expect(body.suggestions).toContain('Consider taking a train or bus for shorter distances.')
    } finally {
      server.close()
    }
  })

  it('returns Gemini suggestions when the provider returns valid JSON', async () => {
    process.env.GEMINI_API_KEY = 'test-key'
    vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      const url = String(input)
      if (url.includes('generativelanguage.googleapis.com')) {
        return Promise.resolve(
          Response.json({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: JSON.stringify({
                        suggestions: [
                          'Book direct flights where possible to avoid extra takeoff emissions.',
                          'Pack lighter luggage to reduce aircraft fuel burn.',
                        ],
                      }),
                    },
                  ],
                },
              },
            ],
          }),
        )
      }

      return originalFetch(input, init)
    })

    const server = app.listen(0)
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('Test server did not start')

    try {
      const response = await fetch(`http://127.0.0.1:${address.port}/api/carbon/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result: carbonResult }),
      })

      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.provider).toBe('gemini')
      expect(body.suggestions).toEqual([
        'Book direct flights where possible to avoid extra takeoff emissions.',
        'Pack lighter luggage to reduce aircraft fuel burn.',
      ])
    } finally {
      server.close()
    }
  })
})
