import { http, HttpResponse } from 'msw'

const API_URL = 'http://localhost:3001'

export const authHandlers = [
  http.post(`${API_URL}/api/auth/login`, async ({ request }) => {
    const body = (await request.json()) as any
    const { email, password } = body

    if (email === 'valid@test.com' && password === 'password123') {
      return HttpResponse.json({
        data: {
          user: {
            id: 'user-123',
            email: 'valid@test.com',
            role: 'user',
            user_metadata: { role: 'user', username: 'testuser' },
          },
          session: { user: { id: 'user-123' } },
        },
        error: null,
      })
    }

    return HttpResponse.json(
      { error: { message: 'Invalid login credentials' } },
      { status: 401 }
    )
  }),

  http.get(`${API_URL}/api/auth/me`, () => {
    return HttpResponse.json({
      data: {
        user: {
          id: 'user-123',
          email: 'valid@test.com',
          role: 'user',
          user_metadata: { role: 'user', username: 'testuser' },
        },
      },
      error: null,
    })
  }),
]
