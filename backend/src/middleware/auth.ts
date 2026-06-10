import { Request, Response, NextFunction } from 'express'
import { readTokenFromRequest, SessionUser, verifySessionToken } from '../utils/auth'

export interface AuthRequest extends Request {
  user?: SessionUser
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = readTokenFromRequest(req)
    if (!token) {
      return res.status(401).json({ error: 'Missing session' })
    }

    ;(req as AuthRequest).user = verifySessionToken(token)
    next()
  } catch (error) {
    console.error('Authentication middleware error:', error)
    return res.status(401).json({ error: 'Invalid or expired session' })
  }
}
