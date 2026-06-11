import jwt from 'jsonwebtoken'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  hashPassword,
  signSession,
  toSessionUser,
  verifyPassword,
  verifySessionToken,
  type DbUser,
} from './auth'

const dbUser: DbUser = {
  id: '1e42770e-3a9b-4269-bd4e-7f4f1ef66c36',
  email: 'test@example.com',
  password_hash: '',
  username: 'traveler',
  role: 'admin',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

describe('auth helpers', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret'
    process.env.JWT_EXPIRES_IN = '1h'
  })

  it('hashes passwords and verifies only the matching password', async () => {
    const hash = await hashPassword('password123')

    expect(hash).not.toBe('password123')
    expect(hash).toMatch(/^\$2[aby]\$/)
    await expect(verifyPassword('password123', hash)).resolves.toBe(true)
    await expect(verifyPassword('wrongpass', hash)).resolves.toBe(false)
  })

  it('does not accept empty or non-bcrypt password hashes', async () => {
    await expect(verifyPassword('password123', '')).resolves.toBe(false)
    await expect(verifyPassword('password123', 'password123')).resolves.toBe(false)
  })

  it('signs and verifies a session token', () => {
    const token = signSession(dbUser)
    const sessionUser = verifySessionToken(token)

    expect(sessionUser).toEqual(toSessionUser(dbUser))
  })

  it('rejects malformed and expired session tokens', () => {
    const expiredToken = jwt.sign(
      { sub: dbUser.id, email: dbUser.email, role: dbUser.role, exp: Math.floor(Date.now() / 1000) - 10 },
      process.env.JWT_SECRET!,
    )

    expect(() => verifySessionToken('not-a-token')).toThrow()
    expect(() => verifySessionToken(expiredToken)).toThrow()
  })
})
