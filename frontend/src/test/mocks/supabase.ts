export const mockSupabaseClient = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      if (email === 'valid@test.com' && password === 'password123') {
        return {
          data: {
            session: {
              access_token: 'mock-access-token',
              user: { id: 'user-123', email: 'valid@test.com', user_metadata: { role: 'user' } },
            },
            user: { id: 'user-123', email: 'valid@test.com', user_metadata: { role: 'user' } },
          },
          error: null,
        }
      }
      return {
        data: { session: null, user: null },
        error: { message: 'Invalid login credentials' },
      }
    },
    getUser: async () => ({
      data: { user: { id: 'user-123', email: 'valid@test.com', user_metadata: { role: 'user' } } },
      error: null,
    }),
    getSession: async () => ({
      data: { session: { access_token: 'mock-access-token', user: { id: 'user-123' } } },
      error: null,
    }),
    signOut: async () => ({ error: null }),
  },
}
