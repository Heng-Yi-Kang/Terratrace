import { Router, Request, Response, NextFunction } from 'express'
import { query } from '../utils/db'
import {
  DbUser,
  clearSessionCookie,
  hashPassword,
  newUserId,
  setSessionCookie,
  signSession,
  toSessionUser,
  verifyPassword,
} from '../utils/auth'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()

const userColumns = 'id, email, password_hash, username, role, created_at, updated_at'
type AsyncRoute = (req: Request, res: Response, next: NextFunction) => Promise<unknown>

function asyncHandler(handler: AsyncRoute) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next)
  }
}

async function findUserByEmail(email: string): Promise<DbUser | null> {
  const result = await query<DbUser>(
    `select ${userColumns} from users where lower(email) = lower($1) limit 1`,
    [email],
  )
  return result.rows[0] || null
}

async function findUserById(id: string): Promise<DbUser | null> {
  const result = await query<DbUser>(
    `select ${userColumns} from users where id = $1 limit 1`,
    [id],
  )
  return result.rows[0] || null
}

function sendSession(res: Response, user: DbUser) {
  const token = signSession(user)
  setSessionCookie(res, token)
  return res.status(200).json({
    data: {
      user: toSessionUser(user),
      session: { access_token: token, user: toSessionUser(user) },
    },
    error: null,
  })
}

router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')

  if (!email || !password) {
    return res.status(400).json({ error: { message: 'Email and password are required' } })
  }

  const user = await findUserByEmail(email)
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return res.status(401).json({ error: { message: 'Invalid email or password' } })
  }

  return sendSession(res, user)
}))

router.post('/signup', asyncHandler(async (req: Request, res: Response) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')
  const username = String(req.body?.username || '').trim() || null
  const role = req.body?.role === 'admin' ? 'admin' : 'user'

  if (!email || !password) {
    return res.status(400).json({ error: { message: 'Email and password are required' } })
  }

  if (password.length < 6) {
    return res.status(400).json({ error: { message: 'Password must be at least 6 characters' } })
  }

  try {
    const passwordHash = await hashPassword(password)
    const result = await query<DbUser>(
      `insert into users (id, email, password_hash, username, role)
       values ($1, $2, $3, $4, $5)
       returning ${userColumns}`,
      [newUserId(), email, passwordHash, username, role],
    )

    return sendSession(res, result.rows[0])
  } catch (error: any) {
    if (error?.code === '23505') {
      return res.status(409).json({ error: { message: 'An account with this email already exists' } })
    }
    console.error('Signup error:', error)
    return res.status(500).json({ error: { message: 'Failed to create account' } })
  }
}))

router.post('/logout', (_req: Request, res: Response) => {
  clearSessionCookie(res)
  return res.status(200).json({ error: null })
})

router.get('/me', requireAuth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await findUserById(req.user!.id)
  return res.status(200).json({ data: { user: user ? toSessionUser(user) : null }, error: null })
}))

router.patch('/me', requireAuth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const username = String(req.body?.username || '').trim()
  if (!username) {
    return res.status(400).json({ error: { message: 'Username cannot be empty' } })
  }

  const result = await query<DbUser>(
    `update users
     set username = $2, updated_at = now()
     where id = $1
     returning ${userColumns}`,
    [req.user!.id, username],
  )

  if (!result.rows[0]) {
    return res.status(404).json({ error: { message: 'User not found' } })
  }

  const token = signSession(result.rows[0])
  setSessionCookie(res, token)
  return res.status(200).json({ data: { user: toSessionUser(result.rows[0]) }, error: null })
}))

router.patch('/password', requireAuth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const currentPassword = String(req.body?.currentPassword || '')
  const newPassword = String(req.body?.newPassword || '')

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: { message: 'Current and new passwords are required' } })
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: { message: 'New password must be at least 6 characters' } })
  }

  const user = await findUserById(req.user!.id)
  if (!user || !(await verifyPassword(currentPassword, user.password_hash))) {
    return res.status(401).json({ error: { message: 'Current password is incorrect' } })
  }

  await query('update users set password_hash = $2, updated_at = now() where id = $1', [
    user.id,
    await hashPassword(newPassword),
  ])

  return res.status(200).json({ success: true, error: null })
}))

export default router
