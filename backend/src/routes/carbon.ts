import { Router, Request, Response } from 'express'
import { CalcTotal, TripInput } from '../utils/carbonCalculator'
import { query } from '../utils/db'
import { readTokenFromRequest, verifySessionToken } from '../utils/auth'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()

type CarbonResult = ReturnType<typeof CalcTotal>

type CarbonSuggestionProvider = 'gemini' | 'deterministic-fallback'

type CarbonSuggestionsResponse = {
  provider: CarbonSuggestionProvider
  highestSource: string
  suggestions: string[]
}

const getUserIdFromRequest = (req: Request): string | null => {
  const token = readTokenFromRequest(req)
  if (!token) return null
  try {
    return verifySessionToken(token).id
  } catch {
    return null
  }
}

const carbonSources = (result: CarbonResult) => [
  { name: 'Flight', value: result.flightEmissions },
  { name: 'Car', value: result.carEmissions },
  { name: 'Hotel', value: result.hotelEmissions },
  { name: 'Rail', value: result.railEmissions },
  { name: 'Bus', value: result.busEmissions },
  { name: 'Taxi', value: result.taxiEmissions },
]

const getHighestSource = (result: CarbonResult) =>
  carbonSources(result).reduce((max, curr) => (curr.value > max.value ? curr : max))

const fallbackSuggestionsFor = (sourceName: string): string[] => {
  if (sourceName === 'Flight') {
    return [
      'Consider taking a train or bus for shorter distances.',
      'Choose airlines with better sustainability practices.',
      'Choose economy class instead of business or first class.',
    ]
  }
  if (sourceName === 'Car') {
    return [
      'Try carpooling or using public transportation.',
      'Walk or bike for short trips instead of driving.',
      'Consider switching to an electric or hybrid vehicle.',
    ]
  }
  if (sourceName === 'Hotel') {
    return [
      'Look for eco-friendly hotels with sustainability practices.',
      'Minimize energy use by switching off lights and AC when not in use.',
      'Consider staying at accommodations that support local communities.',
    ]
  }
  if (sourceName === 'Rail') {
    return [
      'Choose trains over flights for shorter distances.',
      'Select coaches with better sustainability practices.',
      'Consider traveling during off-peak hours to reduce energy consumption.',
    ]
  }
  if (sourceName === 'Bus') {
    return [
      'Opt for buses instead of cars for longer trips.',
      'Choose buses with better fuel efficiency or alternative fuel sources.',
      'Consider carpooling or ride-sharing to reduce the number of vehicles on the road.',
    ]
  }
  if (sourceName === 'Taxi') {
    return [
      'Choose rideshare options over individual taxi rides.',
      'Opt for electric or hybrid taxis when available.',
      'Consider using public transportation or walking for short trips.',
    ]
  }
  return [
    'Choose lower-emission transport options where possible.',
    'Reduce unnecessary travel distance by grouping nearby activities.',
    'Offset remaining emissions through reputable climate projects.',
  ]
}

const numberFromBody = (value: unknown): number => {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

const normalizeCarbonResult = (body: any): CarbonResult => ({
  total: numberFromBody(body?.total ?? body?.total_emissions),
  flightEmissions: numberFromBody(body?.flightEmissions ?? body?.flight_emissions),
  carEmissions: numberFromBody(body?.carEmissions ?? body?.car_emissions),
  hotelEmissions: numberFromBody(body?.hotelEmissions ?? body?.hotel_emissions),
  railEmissions: numberFromBody(body?.railEmissions ?? body?.rail_emissions),
  busEmissions: numberFromBody(body?.busEmissions ?? body?.bus_emissions),
  taxiEmissions: numberFromBody(body?.taxiEmissions ?? body?.taxi_emissions),
})

const extractGeminiText = (payload: any): string => {
  const parts = payload?.candidates?.[0]?.content?.parts
  if (!Array.isArray(parts)) return ''
  return parts.map((part) => part?.text || '').join('').trim()
}

const validateSuggestions = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => String(entry || '').trim())
    .filter((entry) => entry.length >= 12 && entry.length <= 180)
    .slice(0, 5)
}

const generateAiSuggestions = async (result: CarbonResult, highestSource: string): Promise<string[]> => {
  const key = process.env.GEMINI_API_KEY
  if (!key) {
    throw new Error('GEMINI_API_KEY is missing')
  }

  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
  const prompt = [
    'You are a sustainable travel carbon coach.',
    'Return JSON only. No markdown.',
    'Schema: {"suggestions":["string"]}',
    `Carbon result in kg CO2: ${JSON.stringify(result)}`,
    `Highest source: ${highestSource}`,
    'Write 3 to 5 concise, actionable suggestions for reducing future travel emissions.',
    'Make each suggestion specific to the highest source when possible.',
    'Do not include carbon credit purchase links.',
  ].join('\n')

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: 'application/json',
        },
      }),
    },
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini request failed: ${response.status} ${errorText}`)
  }

  const payload = await response.json()
  const text = extractGeminiText(payload)
  if (!text) {
    throw new Error('Gemini did not return JSON text')
  }

  const parsed = JSON.parse(text)
  const suggestions = validateSuggestions(parsed?.suggestions)
  if (suggestions.length === 0) {
    throw new Error('Gemini returned invalid suggestions')
  }

  return suggestions
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

router.post('/suggestions', async (req: Request, res: Response) => {
  const result = normalizeCarbonResult(req.body?.result ?? req.body)

  if (!result.total || result.total <= 0) {
    return res.status(400).json({ error: 'A positive carbon result is required.' })
  }

  const highestSource = getHighestSource(result).name

  try {
    const suggestions = await generateAiSuggestions(result, highestSource)
    const payload: CarbonSuggestionsResponse = {
      provider: 'gemini',
      highestSource,
      suggestions,
    }
    return res.status(200).json(payload)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (message !== 'GEMINI_API_KEY is missing') {
      console.warn('[carbon-suggestions] provider-failed', {
        provider: 'gemini',
        message,
      })
    }

    const payload: CarbonSuggestionsResponse = {
      provider: 'deterministic-fallback',
      highestSource,
      suggestions: fallbackSuggestionsFor(highestSource),
    }
    return res.status(200).json(payload)
  }
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
