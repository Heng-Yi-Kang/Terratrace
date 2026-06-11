import { Router, Response } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { pool } from '../utils/db'
import { clearSessionCookie } from '../utils/auth'

const router = Router()

router.delete('/account', requireAuth, async (req: AuthRequest, res: Response) => {
  const client = await pool.connect()
  let transactionOpen = false

  try {
    await client.query('begin')
    transactionOpen = true

    const result = await client.query(
      'delete from users where id = $1 returning id',
      [req.user!.id],
    )

    if (!result.rows[0]) {
      await client.query('rollback')
      transactionOpen = false
      clearSessionCookie(res)
      return res.status(404).json({ error: 'User not found' })
    }

    await client.query('commit')
    transactionOpen = false
    clearSessionCookie(res)

    return res.status(200).json({
      success: true,
      message: 'Account and associated data deleted successfully',
    })
  } catch (error) {
    if (transactionOpen) {
      await client.query('rollback')
    }
    console.error('Delete account error:', error)
    return res.status(500).json({ error: 'Something went wrong!' })
  } finally {
    client.release()
  }
})

export default router
