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

type TestUser = {
  email: string
  password: string
  username: string
  role?: 'user' | 'admin'
}

let app: Application
let server: Server
let baseUrl: string
let query: Query
let pool: Pool

const emailPrefix = `integration.auth-profile.${Date.now()}`

function testEmail(suffix: string): string {
  return `${emailPrefix}.${suffix}@example.com`
}

function extractSessionCookie(headers: Headers): string {
  const setCookie = headers.get('set-cookie') || ''
  const match = setCookie.match(/terratrace_session=[^;]+/)
  expect(match, 'expected response to set terratrace_session cookie').not.toBeNull()
  return match![0]
}

function expectClearedSessionCookie(headers: Headers): void {
  const setCookie = headers.get('set-cookie') || ''
  expect(setCookie).toContain('terratrace_session=')
  expect(setCookie.toLowerCase()).toMatch(/expires=thu, 01 jan 1970|max-age=0/)
}

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

async function signupUser(user: TestUser): Promise<JsonResponse & { cookie: string; userId: string }> {
  const response = await api('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      email: user.email,
      password: user.password,
      username: user.username,
      role: user.role || 'user',
    }),
  })

  expect(response.status).toBe(200)
  return {
    ...response,
    cookie: extractSessionCookie(response.headers),
    userId: response.body.data.user.id,
  }
}

async function cleanupTestUsers(): Promise<void> {
  await query('delete from users where email like $1', [`${emailPrefix}.%@example.com`])
}

beforeAll(async () => {
  const appModule = await import('../app')
  const dbModule = await import('../utils/db')

  app = appModule.createApp()
  query = dbModule.query
  pool = dbModule.pool

  await query('select 1')
  await cleanupTestUsers()

  server = app.listen(0)
  await new Promise<void>((resolve) => server.once('listening', resolve))
  const address = server.address() as AddressInfo
  baseUrl = `http://127.0.0.1:${address.port}`
})

afterAll(async () => {
  await cleanupTestUsers()
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()))
  })
  await pool.end()
})

describe('auth and profile integration', () => {
  it('IT-AUTH-001 signs up a user, stores a hashed password, and sets a session cookie', async () => {
    const email = testEmail('signup')
    const response = await signupUser({
      email: email.toUpperCase(),
      password: 'password123',
      username: 'integration-user',
    })

    expect(response.body.data.user).toMatchObject({
      email,
      role: 'user',
      username: 'integration-user',
    })
    expect(response.body.data.session.access_token).toEqual(expect.any(String))

    const result = await query<{ email: string; password_hash: string; username: string; role: string }>(
      'select email, password_hash, username, role from users where id = $1',
      [response.userId],
    )
    expect(result.rows[0]).toMatchObject({
      email,
      username: 'integration-user',
      role: 'user',
    })
    expect(result.rows[0].password_hash).not.toBe('password123')
    expect(result.rows[0].password_hash).toMatch(/^\$2[aby]\$/)
  })

  it('IT-AUTH-001A ignores submitted admin roles during signup', async () => {
    const email = testEmail('signup-admin-role')
    const response = await signupUser({
      email,
      password: 'password123',
      username: 'role-test-user',
      role: 'admin',
    })

    expect(response.body.data.user).toMatchObject({
      email,
      role: 'user',
      username: 'role-test-user',
    })

    const result = await query<{ role: string }>(
      'select role from users where id = $1',
      [response.userId],
    )
    expect(result.rows[0].role).toBe('user')
  })

  it('IT-AUTH-002 rejects duplicate signup emails case-insensitively', async () => {
    const email = testEmail('duplicate')
    await signupUser({ email, password: 'password123', username: 'first-user' })

    const duplicate = await api('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: email.toUpperCase(),
        password: 'password123',
        username: 'second-user',
        role: 'user',
      }),
    })

    expect(duplicate.status).toBe(409)
    expect(duplicate.body.error.message).toMatch(/already exists/i)
  })

  it('IT-AUTH-003 logs in with valid credentials and rejects invalid credentials', async () => {
    const email = testEmail('login')
    await signupUser({ email, password: 'password123', username: 'login-user' })

    const invalid = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: 'wrong-password' }),
    })
    expect(invalid.status).toBe(401)
    expect(invalid.body.error.message).toMatch(/invalid email or password/i)

    const valid = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: 'password123' }),
    })
    expect(valid.status).toBe(200)
    expect(valid.body.data.user).toMatchObject({ email, role: 'user', username: 'login-user' })
    expect(extractSessionCookie(valid.headers)).toMatch(/^terratrace_session=/)
  })

  it('IT-AUTH-004 returns the current user with a valid session and rejects missing sessions', async () => {
    const email = testEmail('me')
    const signup = await signupUser({ email, password: 'password123', username: 'me-user' })

    const missing = await api('/api/auth/me')
    expect(missing.status).toBe(401)
    expect(missing.body.error).toBe('Missing session')

    const current = await api('/api/auth/me', {
      headers: { cookie: signup.cookie },
    })
    expect(current.status).toBe(200)
    expect(current.body.data.user).toMatchObject({
      id: signup.userId,
      email,
      username: 'me-user',
      role: 'user',
    })
  })

  it('IT-PROFILE-001 updates the username in PostgreSQL and refreshes the session cookie', async () => {
    const email = testEmail('profile')
    const signup = await signupUser({ email, password: 'password123', username: 'before-name' })

    const before = await query<{ username: string; updated_at: Date }>(
      'select username, updated_at from users where id = $1',
      [signup.userId],
    )
    expect(before.rows[0].username).toBe('before-name')

    const update = await api('/api/auth/me', {
      method: 'PATCH',
      headers: { cookie: signup.cookie },
      body: JSON.stringify({ username: 'after-name' }),
    })
    expect(update.status).toBe(200)
    expect(update.body.data.user.username).toBe('after-name')
    const refreshedCookie = extractSessionCookie(update.headers)

    const after = await query<{ username: string; updated_at: Date }>(
      'select username, updated_at from users where id = $1',
      [signup.userId],
    )
    expect(after.rows[0].username).toBe('after-name')
    expect(new Date(after.rows[0].updated_at).getTime()).toBeGreaterThanOrEqual(
      new Date(before.rows[0].updated_at).getTime(),
    )

    const current = await api('/api/auth/me', {
      headers: { cookie: refreshedCookie },
    })
    expect(current.status).toBe(200)
    expect(current.body.data.user.username).toBe('after-name')
  })

  it('IT-PROFILE-002 changes a password and only accepts the new credential afterward', async () => {
    const email = testEmail('password')
    const signup = await signupUser({ email, password: 'old-password', username: 'password-user' })

    const wrongCurrent = await api('/api/auth/password', {
      method: 'PATCH',
      headers: { cookie: signup.cookie },
      body: JSON.stringify({ currentPassword: 'incorrect', newPassword: 'new-password' }),
    })
    expect(wrongCurrent.status).toBe(401)
    expect(wrongCurrent.body.error.message).toMatch(/current password is incorrect/i)

    const change = await api('/api/auth/password', {
      method: 'PATCH',
      headers: { cookie: signup.cookie },
      body: JSON.stringify({ currentPassword: 'old-password', newPassword: 'new-password' }),
    })
    expect(change.status).toBe(200)
    expect(change.body).toMatchObject({ success: true, error: null })

    const oldLogin = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: 'old-password' }),
    })
    expect(oldLogin.status).toBe(401)

    const newLogin = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: 'new-password' }),
    })
    expect(newLogin.status).toBe(200)
    expect(newLogin.body.data.user.email).toBe(email)
  })

  it('IT-PROFILE-003 clears the session cookie on logout', async () => {
    const signup = await signupUser({
      email: testEmail('logout'),
      password: 'password123',
      username: 'logout-user',
    })

    const logout = await api('/api/auth/logout', {
      method: 'POST',
      headers: { cookie: signup.cookie },
    })
    expect(logout.status).toBe(200)
    expect(logout.body).toMatchObject({ error: null })
    expectClearedSessionCookie(logout.headers)

    const currentWithoutCookie = await api('/api/auth/me')
    expect(currentWithoutCookie.status).toBe(401)
  })

  it('IT-PROFILE-004 deletes the account row and rejects the old session afterward', async () => {
    const email = testEmail('delete')
    const signup = await signupUser({ email, password: 'password123', username: 'delete-user' })

    const before = await query<{ count: string }>('select count(*) from users where id = $1', [signup.userId])
    expect(before.rows[0].count).toBe('1')

    const deleted = await api('/api/user/account', {
      method: 'DELETE',
      headers: { cookie: signup.cookie },
    })
    expect(deleted.status).toBe(200)
    expect(deleted.body).toMatchObject({
      success: true,
      message: 'Account and associated data deleted successfully',
    })
    expectClearedSessionCookie(deleted.headers)

    const after = await query<{ count: string }>('select count(*) from users where id = $1', [signup.userId])
    expect(after.rows[0].count).toBe('0')

    const current = await api('/api/auth/me', {
      headers: { cookie: signup.cookie },
    })
    expect(current.status).toBe(404)
    expect(current.body.error.message).toMatch(/user not found/i)
  })
})
