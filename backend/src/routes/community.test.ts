import express from 'express'
import type { Server } from 'http'
import type { AddressInfo } from 'net'
import { afterEach, describe, expect, it, vi } from 'vitest'

const dbMocks = vi.hoisted(() => ({
  query: vi.fn(),
  connect: vi.fn(),
}))

vi.mock('../utils/db', () => ({
  query: dbMocks.query,
  pool: {
    connect: dbMocks.connect,
  },
}))

const communityRoutes = (await import('./community')).default

function createTestServer() {
  const app = express()
  app.use(express.json())
  app.use('/api/community', communityRoutes)
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
  vi.clearAllMocks()
})

describe('community routes', () => {
  it('builds the leaderboard from all signed-up users', async () => {
    dbMocks.query.mockResolvedValueOnce({
      rows: [
        { id: 'user-1', rank: 1, name: 'Active Traveler', points: 500, badges: 1, you: false },
        { id: 'user-2', rank: 2, name: 'New Traveler', points: 0, badges: 0, you: false },
      ],
    })

    const { server, baseUrl } = await createTestServer()

    try {
      const response = await fetch(`${baseUrl}/api/community/leaderboard`)
      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body).toHaveLength(2)

      const leaderboardSql = String(dbMocks.query.mock.calls[0][0])
      expect(leaderboardSql).toMatch(/from\s+users\s+u/i)
      expect(leaderboardSql).not.toMatch(/active_users/i)
      expect(leaderboardSql).not.toMatch(/rank\s*<=\s*10/i)
    } finally {
      await closeServer(server)
    }
  })
})
