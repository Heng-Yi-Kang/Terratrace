import express from 'express'
import type { Server } from 'http'
import type { AddressInfo } from 'net'
import { afterEach, describe, expect, it, vi } from 'vitest'
import weatherRoutes from './weather'

function createTestServer() {
  const app = express()
  app.use('/api/weather', weatherRoutes)
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

afterEach(() => {
  vi.restoreAllMocks()
})

describe('weather routes', () => {
  it('rejects forecast requests without a city', async () => {
    const { server, baseUrl } = await createTestServer()

    try {
      const response = await fetch(`${baseUrl}/api/weather/forecast`)
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body).toEqual({ error: 'City is required.' })
    } finally {
      await closeServer(server)
    }
  })

  it('maps Open-Meteo geocoding and ensemble daily data into app forecast shape', async () => {
    const originalFetch = globalThis.fetch
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
      const requestUrl = String(url)

      if (requestUrl.startsWith('http://127.0.0.1:')) {
        return originalFetch(url, init)
      }

      if (requestUrl.includes('geocoding-api.open-meteo.com')) {
        return new Response(JSON.stringify({
          results: [{
            latitude: 3.139,
            longitude: 101.6869,
            name: 'Kuala Lumpur',
            country: 'Malaysia',
            timezone: 'Asia/Kuala_Lumpur',
          }],
        }), { status: 200 })
      }

      return new Response(JSON.stringify({
        daily: {
          time: ['2026-06-12', '2026-06-13'],
          weather_code: [61, 0],
          temperature_2m_max: [31.4, 33.2],
          temperature_2m_min: [24.2, 25.1],
          precipitation_sum_member01: [0.2, 0],
          precipitation_sum_member02: [0, 0],
          wind_speed_10m_max: [18, 7.2],
        },
      }), { status: 200 })
    })

    const { server, baseUrl } = await createTestServer()

    try {
      const response = await fetch(`${baseUrl}/api/weather/forecast?city=Kuala%20Lumpur`)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body).toMatchObject({
        city: 'Kuala Lumpur',
        country: 'Malaysia',
        timezone: 'Asia/Kuala_Lumpur',
        units: 'metric',
      })
      expect(body.forecast).toEqual([
        expect.objectContaining({
          date: '2026-06-12',
          temperature: 28,
          minTemperature: 24,
          maxTemperature: 31,
          precipitation: 50,
          description: 'Rain',
          icon: '10d',
          windSpeed: 5,
        }),
        expect.objectContaining({
          date: '2026-06-13',
          temperature: 29,
          precipitation: 0,
          description: 'Clear sky',
          icon: '01d',
          windSpeed: 2,
        }),
      ])
      const externalCalls = fetchMock.mock.calls.filter(([url]) => !String(url).startsWith('http://127.0.0.1:'))
      expect(externalCalls).toHaveLength(2)
    } finally {
      await closeServer(server)
    }
  })
})
