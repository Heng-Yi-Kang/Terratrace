import { http, HttpResponse } from 'msw'

const BASE_URL = 'https://placeholder.supabase.co'

export const authHandlers = [
  http.post(`${BASE_URL}/auth/v1/token?action=signin`, async ({ request }) => {
    const body = (await request.json()) as any
    const { email, password } = body

    if (email === 'valid@test.com' && password === 'password123') {
      return HttpResponse.json({
        id: 'user-123',
        email: 'valid@test.com',
        role: 'authenticated',
        user_metadata: { role: 'user', username: 'testuser' },
        session: {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
        },
      })
    }

    return HttpResponse.json(
      { error: 'Invalid login credentials', error_code: 'invalid_credentials' },
      { status: 400 }
    )
  }),

  http.get(`${BASE_URL}/auth/v1/user`, () => {
    return HttpResponse.json({
      id: 'user-123',
      email: 'valid@test.com',
      user_metadata: { role: 'user', username: 'testuser' },
    })
  }),
]
