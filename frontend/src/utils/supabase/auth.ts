export type UserRole = 'user' | 'admin'

export type AppUser = {
  id: string
  email: string
  role: UserRole
  username?: string
  user_metadata: {
    role: UserRole
    username?: string
  }
}

const API = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

async function authFetch(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = typeof body.error === 'string'
      ? body.error
      : body.error?.message || 'Request failed'
    return {
      data: body.data ?? null,
      error: { message },
    }
  }

  return {
    data: body.data ?? body,
    error: body.error ?? null,
  }
}

export async function signIn(email: string, password: string) {
  return authFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function signUp(email: string, password: string, username?: string) {
  return authFetch('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, username }),
  })
}

export async function signOut() {
  return authFetch('/api/auth/logout', { method: 'POST' })
}

export async function getCurrentUser(): Promise<{ data: { user: AppUser | null }; error: { message: string } | null }> {
  const result = await authFetch('/api/auth/me')
  if (result.error) return { data: { user: null }, error: null }
  return result as { data: { user: AppUser | null }; error: null }
}

export async function getSession() {
  const { data, error } = await getCurrentUser()
  return {
    data: {
      session: data.user ? { user: data.user } : null,
    },
    error,
  }
}

export async function updateCurrentUser(metadata: Record<string, unknown>) {
  return authFetch('/api/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(metadata),
  })
}

export async function changePassword(currentPassword: string, newPassword: string) {
  return authFetch('/api/auth/password', {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword }),
  })
}

export async function deleteAccount() {
  const result = await authFetch('/api/user/account', { method: 'DELETE' })
  if (result.error) return { error: result.error }
  return { success: true }
}

export async function getRedirectPath(): Promise<string> {
  const { data } = await getCurrentUser()
  const role = data.user?.user_metadata?.role
  if (!data.user) return '/login'
  return role === 'admin' ? '/admin/dashboard' : '/dashboard'
}

export function isAdmin(user: { user_metadata?: { role?: string } } | null): boolean {
  return user?.user_metadata?.role === 'admin'
}
