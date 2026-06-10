import { Router, Response } from 'express'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { mapDbLocationToPlace } from './locations'
import { query } from '../utils/db'

const router = Router()

// Apply authentication middleware to all routes in this router
router.use(requireAuth)

// GET /api/favourites - Retrieve all favourites for the authenticated user
router.get('/', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id

  try {
    const { rows } = await query(
      `select f.id as favourite_id, f.created_at as saved_at, l.*
       from user_favourites f
       join locations l on l.id = f.location_id
       where f.user_id = $1
       order by f.created_at desc`,
      [userId],
    )

    const places = rows.map((row: any) => {
        const place = mapDbLocationToPlace(row)
        return {
          ...place,
          favouriteId: row.favourite_id,
          savedAt: row.saved_at,
        }
      })

    return res.status(200).json(places)
  } catch (error) {
    console.error('Unexpected error in GET favourites:', error)
    return res.status(500).json({ error: 'An unexpected error occurred' })
  }
})

// POST /api/favourites - Add a location to favourites
router.post('/', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id
  const { locationId } = req.body

  if (!locationId) {
    return res.status(400).json({ error: 'locationId is required' })
  }

  try {
    const { rows } = await query(
      `with inserted as (
         insert into user_favourites (user_id, location_id)
         values ($1, $2)
         returning id, created_at, location_id
       )
       select inserted.id as favourite_id, inserted.created_at as saved_at, l.*
       from inserted
       join locations l on l.id = inserted.location_id`,
      [userId, locationId],
    )

    if (!rows[0]) return res.status(404).json({ error: 'Location not found' })

    const place = mapDbLocationToPlace(rows[0] as any)
    return res.status(201).json({
      ...place,
      favouriteId: rows[0].favourite_id,
      savedAt: rows[0].saved_at,
    })
  } catch (error: any) {
    if (error?.code === '23505') {
      return res.status(409).json({ error: 'This location is already in your favourites' })
    }
    console.error('Unexpected error in POST favourites:', error)
    return res.status(500).json({ error: 'An unexpected error occurred' })
  }
})

// DELETE /api/favourites/:locationId - Remove a location from favourites
router.delete('/:locationId', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id
  const { locationId } = req.params

  try {
    await query('delete from user_favourites where user_id = $1 and location_id = $2', [userId, locationId])

    return res.status(200).json({ success: true, message: 'Favourite removed successfully' })
  } catch (error) {
    console.error('Unexpected error in DELETE favourites:', error)
    return res.status(500).json({ error: 'An unexpected error occurred' })
  }
})

export default router
