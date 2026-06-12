import express from 'express'
import type { Server } from 'http'
import type { AddressInfo } from 'net'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { auditCrudOperations } from './crudAudit'

function createTestServer() {
  const app = express()
  app.use(express.json())
  app.use('/api', auditCrudOperations)
  app.get('/api/items/:id', (req, res) => {
    ;(req as any).user = { id: 'user-1', email: 'traveler@example.com', role: 'user' }
    res.status(200).json({ id: req.params.id })
  })
  app.post('/api/items', (req, res) => res.status(201).json({ id: 'item-1' }))
  app.patch('/api/items/:id', (_req, res) => res.status(400).json({ error: 'Invalid item' }))
  app.options('/api/items', (_req, res) => res.status(204).end())
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

describe('auditCrudOperations', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('logs successful CRUD operations with actor and route metadata', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const { server, baseUrl } = await createTestServer()

    try {
      const response = await fetch(`${baseUrl}/api/items/123`)
      expect(response.status).toBe(200)

      expect(info).toHaveBeenCalledTimes(1)
      expect(warn).not.toHaveBeenCalled()
      expect(info).toHaveBeenCalledWith('[crud]', expect.objectContaining({
        event: 'crud_operation',
        operation: 'read',
        method: 'GET',
        path: '/api/items/123',
        route: '/api/items/:id',
        statusCode: 200,
        actorId: 'user-1',
        actorEmail: 'traveler@example.com',
        actorRole: 'user',
      }))
    } finally {
      await closeServer(server)
    }
  })

  it('logs failed CRUD operations as warnings', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const { server, baseUrl } = await createTestServer()

    try {
      const response = await fetch(`${baseUrl}/api/items/123`, { method: 'PATCH' })
      expect(response.status).toBe(400)

      expect(info).not.toHaveBeenCalled()
      expect(warn).toHaveBeenCalledWith('[crud]', expect.objectContaining({
        operation: 'update',
        method: 'PATCH',
        statusCode: 400,
      }))
    } finally {
      await closeServer(server)
    }
  })

  it('does not log non-CRUD HTTP methods', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const { server, baseUrl } = await createTestServer()

    try {
      const response = await fetch(`${baseUrl}/api/items`, { method: 'OPTIONS' })
      expect(response.status).toBe(204)

      expect(info).not.toHaveBeenCalled()
      expect(warn).not.toHaveBeenCalled()
    } finally {
      await closeServer(server)
    }
  })
})
