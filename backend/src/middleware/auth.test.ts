import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { requireAuth, type AuthRequest } from './auth'
import { signSession, type DbUser } from '../utils/auth'

function mockResponse() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }
  return res as any
}

const dbUser: DbUser = {
  id: '1e42770e-3a9b-4269-bd4e-7f4f1ef66c36',
  email: 'test@example.com',
  password_hash: 'hash',
  username: 'traveler',
  role: 'user',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

describe('requireAuth', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret'
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('rejects requests without a session token', async () => {
    const req = { cookies: {}, headers: {} } as AuthRequest
    const res = mockResponse()
    const next = vi.fn()

    await requireAuth(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing session' })
    expect(next).not.toHaveBeenCalled()
  })

  it('attaches a user and continues for a valid bearer session', async () => {
    const token = signSession(dbUser)
    const req = { cookies: {}, headers: { authorization: `Bearer ${token}` } } as AuthRequest
    const res = mockResponse()
    const next = vi.fn()

    await requireAuth(req, res, next)

    expect(req.user).toMatchObject({ id: dbUser.id, email: dbUser.email, role: dbUser.role })
    expect(next).toHaveBeenCalledOnce()
    expect(res.status).not.toHaveBeenCalled()
  })

  it('rejects invalid or expired session tokens', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const req = { cookies: { terratrace_session: 'invalid-token' }, headers: {} } as unknown as AuthRequest
    const res = mockResponse()
    const next = vi.fn()

    await requireAuth(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired session' })
    expect(next).not.toHaveBeenCalled()
  })
})
