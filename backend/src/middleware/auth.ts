import { Request, Response, NextFunction } from 'express'
import { supabase } from '../utils/supabase'

export interface AuthRequest extends Request {
  user?: any
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' })
    }

    const token = authHeader.substring(7)

    // Verify token using the supabase client (initialized with service key)
    const { data: userData, error: authError } = await supabase.auth.getUser(token)

    if (authError || !userData?.user) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    // Attach user to request
    ;(req as any).user = userData.user
    next()
  } catch (error) {
    console.error('Authentication middleware error:', error)
    return res.status(500).json({ error: 'Internal server error during authentication' })
  }
}
