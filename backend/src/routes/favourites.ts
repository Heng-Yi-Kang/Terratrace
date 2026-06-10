import { Router, Response } from 'express'
import { supabase } from '../utils/supabase'
import { requireAuth, AuthRequest } from '../middleware/auth'
import { mapDbLocationToPlace } from './locations'

const router = Router()

// Apply authentication middleware to all routes in this router
router.use(requireAuth)

// GET /api/favourites - Retrieve all favourites for the authenticated user
router.get('/', async (req: AuthRequest, res: Response) => {
  const userId = req.user.id

  try {
    const { data, error } = await supabase
      .from('user_favourites')
      .select('id, created_at, locations(*)')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching favourites:', error)
      return res.status(500).json({ error: 'Failed to retrieve favourites' })
    }

    const places = (data ?? [])
      .filter((row: any) => row.locations !== null && row.locations !== undefined)
      .map((row: any) => {
        const rawLocation = Array.isArray(row.locations) ? row.locations[0] : row.locations
        const place = mapDbLocationToPlace(rawLocation)
        return {
          ...place,
          favouriteId: row.id,
          savedAt: row.created_at,
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
  const userId = req.user.id
  const { locationId } = req.body

  if (!locationId) {
    return res.status(400).json({ error: 'locationId is required' })
  }

  try {
    const { data, error } = await supabase
      .from('user_favourites')
      .insert({ user_id: userId, location_id: locationId })
      .select('id, created_at, locations(*)')
      .single()

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'This location is already in your favourites' })
      }
      console.error('Error adding favourite:', error)
      return res.status(500).json({ error: 'Failed to add favourite' })
    }

    if (!data || !data.locations) {
      return res.status(500).json({ error: 'Failed to retrieve favorited location details' })
    }

    const rawLocation = Array.isArray(data.locations) ? data.locations[0] : data.locations
    if (!rawLocation) {
      return res.status(500).json({ error: 'Failed to retrieve favorited location details' })
    }

    const place = mapDbLocationToPlace(rawLocation as any)
    return res.status(201).json({
      ...place,
      favouriteId: data.id,
      savedAt: data.created_at,
    })
  } catch (error) {
    console.error('Unexpected error in POST favourites:', error)
    return res.status(500).json({ error: 'An unexpected error occurred' })
  }
})

// DELETE /api/favourites/:locationId - Remove a location from favourites
router.delete('/:locationId', async (req: AuthRequest, res: Response) => {
  const userId = req.user.id
  const { locationId } = req.params

  try {
    const { error } = await supabase
      .from('user_favourites')
      .delete()
      .eq('user_id', userId)
      .eq('location_id', locationId)

    if (error) {
      console.error('Error deleting favourite:', error)
      return res.status(500).json({ error: 'Failed to delete favourite' })
    }

    return res.status(200).json({ success: true, message: 'Favourite removed successfully' })
  } catch (error) {
    console.error('Unexpected error in DELETE favourites:', error)
    return res.status(500).json({ error: 'An unexpected error occurred' })
  }
})

export default router
