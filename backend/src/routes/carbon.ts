import { Router, Request, Response } from 'express'
import { CalcTotal, TripInput } from '../utils/carbonCalculator'
import { query } from '../utils/db'
import { readTokenFromRequest, verifySessionToken } from '../utils/auth'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()

const getUserIdFromRequest = (req: Request): string | null => {
  const token = readTokenFromRequest(req)
  if (!token) return null
  try {
    return verifySessionToken(token).id
  } catch {
    return null
  }
}

router.post('/calculate', async (req: Request, res: Response) => {
  const { trips }: { trips: TripInput[] } = req.body

  if (!trips || !Array.isArray(trips) || trips.length === 0) {
    res.status(400).json({ error: 'trips array is required ' })
    return
  }

  for (const trip of trips) {
    if (trip.type === 'hotel') {
      if (!trip.nights || trip.nights < 1) {
        res.status(400).json({ error: 'Hotel nights must be at least 1' })
        return
      }
    } else if (!trip.distanceKm || trip.distanceKm < 0) {
      res.status(400).json({ error: 'Distance must be more than 0 km' })
      return
    }

    if ('passengers' in trip && (!trip.passengers || trip.passengers < 1)) {
      res.status(400).json({ error: 'passengers must be at least 1' })
      return
    }
  }

  const result = CalcTotal(trips)
  const userId = getUserIdFromRequest(req)

  if (userId) {
    try {
      await query(
        `insert into carbon_entries (
          user_id, trips, total_emissions, flight_emissions, car_emissions,
          hotel_emissions, rail_emissions, bus_emissions, taxi_emissions
        ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          userId,
          JSON.stringify(trips),
          result.total,
          result.flightEmissions,
          result.carEmissions,
          result.hotelEmissions,
          result.railEmissions,
          result.busEmissions,
          result.taxiEmissions,
        ],
      )
    } catch (err) {
      console.error('Failed to save carbon entry:', err)
    }
  }

  res.status(200).json(result)
})

router.get('/history', requireAuth, async (req: AuthRequest, res: Response) => {
  const { rows } = await query(
    `select *
     from carbon_entries
     where user_id = $1
     order by created_at desc`,
    [req.user!.id],
  )

  res.status(200).json(rows)
})

router.get('/summary', requireAuth, async (req: AuthRequest, res: Response) => {
  const { rows } = await query(
    `select id, total_emissions, flight_emissions, car_emissions, hotel_emissions,
            rail_emissions, bus_emissions, taxi_emissions, created_at
     from carbon_entries
     where user_id = $1
     order by created_at desc`,
    [req.user!.id],
  )

  const totalEmissions = rows.reduce((sum, entry: any) => sum + Number(entry.total_emissions || 0), 0)
  const biggest = rows.length ? Math.max(...rows.map((entry: any) => Number(entry.total_emissions || 0))) : 0
  const avgPerTrip = rows.length ? totalEmissions / rows.length : 0

  res.status(200).json({
    totalEmissions: Math.round(totalEmissions),
    totalCalculations: rows.length,
    biggestTrip: Math.round(biggest),
    avgPerTrip: Math.round(avgPerTrip),
    entries: rows,
  })
})

router.delete('/entries/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params

  await query('delete from carbon_entries where id = $1 and user_id = $2', [id, req.user!.id])
  res.status(200).json({ message: 'Entry deleted successfully' })
})

export default router
