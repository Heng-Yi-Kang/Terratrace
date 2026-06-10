import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt, { SignOptions } from 'jsonwebtoken'
import { randomUUID } from 'crypto'

export type UserRole = 'user' | 'admin'

export type DbUser = {
  id: string
  email: string
  password_hash: string
  username: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export type SessionUser = {
  id: string
  email: string
  role: UserRole
  username?: string
  user_metadata: {
    role: UserRole
    username?: string
  }
}

const defaultCookieName = 'terratrace_session'

export const sessionCookieName = process.env.SESSION_COOKIE_NAME || defaultCookieName

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is missing in environment variables.')
  }
  return secret
}

export function toSessionUser(user: Pick<DbUser, 'id' | 'email' | 'role' | 'username'>): SessionUser {
  const username = user.username || undefined
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    username,
    user_metadata: {
      role: user.role,
      username,
    },
  }
}

export function signSession(user: Pick<DbUser, 'id' | 'email' | 'role' | 'username'>): string {
  const options: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'] }
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      username: user.username || undefined,
    },
    getJwtSecret(),
    options,
  )
}

export function verifySessionToken(token: string): SessionUser {
  const payload = jwt.verify(token, getJwtSecret()) as jwt.JwtPayload
  if (!payload.sub || typeof payload.email !== 'string') {
    throw new Error('Invalid session token')
  }

  const role: UserRole = payload.role === 'admin' ? 'admin' : 'user'
  const username = typeof payload.username === 'string' ? payload.username : undefined

  return {
    id: String(payload.sub),
    email: payload.email,
    role,
    username,
    user_metadata: {
      role,
      username,
    },
  }
}

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(sessionCookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7,
    path: '/',
  })
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(sessionCookieName, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })
}

export function readTokenFromRequest(req: Request): string | null {
  const cookieToken = req.cookies?.[sessionCookieName]
  if (typeof cookieToken === 'string' && cookieToken) return cookieToken

  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) return authHeader.substring(7)

  return null
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  if (!passwordHash) return false
  if (passwordHash.startsWith('$2a$') || passwordHash.startsWith('$2b$') || passwordHash.startsWith('$2y$')) {
    return bcrypt.compare(password, passwordHash)
  }
  return false
}

export function newUserId(): string {
  return randomUUID()
}
