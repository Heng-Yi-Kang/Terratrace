import { createClient } from './client'
import { redirect } from 'next/navigation'

export type UserRole = 'user' | 'admin'

export async function signIn(email: string, password: string) {
  const supabase = createClient()
  if (!supabase) return { error: { message: 'Supabase not configured' } }
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signUp(email: string, password: string, username?: string, role: UserRole = 'user') {
  const supabase = createClient()
  if (!supabase) return { error: { message: 'Supabase not configured' } }
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role, username }
    }
  })
}

export async function signOut() {
  const supabase = createClient()
  if (!supabase) return { error: { message: 'Supabase not configured' } }
  return supabase.auth.signOut()
}

export async function getCurrentUser() {
  const supabase = createClient()
  if (!supabase) return { data: { user: null }, error: null }
  return supabase.auth.getUser()
}

export async function getSession() {
  const supabase = createClient()
  if (!supabase) return { data: { session: null }, error: null }
  return supabase.auth.getSession()
}

export async function getRedirectPath(): Promise<string> {
  const supabase = createClient()
  if (!supabase) return '/login'

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return '/login'

  const role = user.user_metadata?.role as UserRole | undefined
  return role === 'admin' ? '/admin/dashboard' : '/dashboard'
}

export function isAdmin(user: { user_metadata?: { role?: string } } | null): boolean {
  return user?.user_metadata?.role === 'admin'
}