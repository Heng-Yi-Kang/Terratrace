import { Router, Request, Response } from 'express'
import { CalcTotal, TripInput } from '../utils/carbonCalculator'
import { createClient } from '@supabase/supabase-js'

const router = Router()

const getSupabase = () => {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
        throw new Error('Supabase not configured')
    }
    return createClient(url, key)
}

// POST /api/carbon/calculate
router.post('/calculate', async (req: Request, res: Response) => {
console.log('HIT /api/carbon/calculate') // ← add this
  console.log('Body:', req.body)  
    const { trips, user_id }: { trips: TripInput[], user_id?: string } = req.body

    if (!trips || !Array.isArray(trips) || trips.length === 0) {
        res.status(400).json({ error: 'trips array is required ' })
        return
    }

    for (const trip of trips) {
        if(trip.type == 'hotel'){
            if( !trip.nights || trip.nights < 1){
                res.status(400).json({ error: 'Hotel nights must be at least 1'})
                return
            }
        } else {
            if( !trip.distanceKm || trip.distanceKm < 0){
                res.status(400).json({ error: 'Distance must be more than 0 km'})
                return
            }
        }

        if ('passengers' in trip && (!trip.passengers || trip.passengers < 1)){
            res.status(400).json({ error: 'passengers must be at least 1'})
            return
        }
    }

    const result = CalcTotal(trips)

    if (user_id) {
        try {
            const supabase = getSupabase()
            const { error } = await supabase.from('carbon_entries').insert({
                user_id: user_id,
                trips,
                total_emissions: result.total,
                flight_emissions: result.flightEmissions,
                car_emissions: result.carEmissions,
                hotel_emissions: result.hotelEmissions,
                rail_emissions: result.railEmissions,
                bus_emissions: result.busEmissions,
                taxi_emissions: result.taxiEmissions,
            })
            if (error)
                console.error('Failed to save carbon entry:', error.message)
        } catch (err) {
            console.error('Supabase error:', err)
        }  
    }
    res.status(200).json(result)
})

// Get /api/carbon/history
router.get('/history', async (req: Request, res: Response) => {
    const {user_id} = req.query

    if (!user_id) {
        res.status(400).json({ error: 'user_id is required' })
        return
    }

    try {
        const supabase = getSupabase()
        const { data, error } = await supabase
            .from('carbon_entries')
            .select('*')
            .eq('user_id', user_id)
            .order('created_at', { ascending: false })

        if (error) {
            res.status(500).json({ error: error.message })
            return
        }

        res.status(200).json(data)
    } catch (err) {
        res.status(500).json({ error: 'Supabase not configured' })
    }

})

// GET /api/carbon/summary
router.get('/summary', async (req: Request, res: Response) => {
    const { user_id } = req.query

    if (!user_id) {
        res.status(400).json({ error: 'user_id is required' })
        return
    }

    try {
        const supabase = getSupabase()
        const { data, error } = await supabase
            .from('carbon_entries')
            .select('id, total_emissions, flight_emissions, car_emissions, hotel_emissions, rail_emissions, bus_emissions, taxi_emissions, created_at')
            .eq('user_id', user_id)
            .order('created_at', { ascending: false })

        if (error) {
            res.status(500).json({ error: error.message })
            return
        }

        const entries = data || []
        const totalEmissions = entries.reduce((sum, entry) => sum + (entry.total_emissions || 0), 0)
        const biggest = entries.length ? Math.max(...entries.map((e) => e.total_emissions)) : 0
        const avgPerTrip = entries.length ? totalEmissions / entries.length : 0

        res.status(200).json({
            totalEmissions: Math.round(totalEmissions),
            totalCalculations: entries.length,
            biggestTrip: Math.round(biggest),
            avgPerTrip: Math.round(avgPerTrip),
            entries,
        })
    } catch (err) {
        res.status(500).json({ error: 'Supabase not configured' })
    }

})

// delete /api/carbon/entry
router.delete('/entries/:id', async (req: Request, res: Response) => {
    const { id } = req.params

    try {
        const supabase = getSupabase()
        const { error } = await supabase
            .from('carbon_entries')
            .delete()
            .eq('id', id)

        if (error) {
            res.status(500).json({ error: error.message })
            return
        }

        res.status(200).json({ message: 'Entry deleted successfully' })
    } catch (err) {
        res.status(500).json({ error: 'Supabase not configured' })
    }
})

export default router