import { Router, Response } from 'express'
import { pool, query } from '../utils/db'
import { requireAuth, AuthRequest } from '../middleware/auth'

type DayPart = 'morning' | 'afternoon' | 'evening' | 'flexible'
type TripStatus = 'upcoming' | 'completed'
type TripSource = 'manual' | 'recommendation' | 'local-import'

const router = Router()

router.use(requireAuth)

const validDayParts: DayPart[] = ['morning', 'afternoon', 'evening', 'flexible']
const validStatuses: TripStatus[] = ['upcoming', 'completed']
const validSources: TripSource[] = ['manual', 'recommendation', 'local-import']
type QueryRunner = (text: string, params?: unknown[]) => Promise<any>

type TripItemInput = {
  tripDate?: string
  dayPart?: DayPart
  title?: string
  category?: string
  estimatedCost?: number | null
  rationale?: string | null
  weatherAlternative?: string | null
  communityImpact?: string | null
  sortOrder?: number
}

type TripInput = {
  destination?: string
  startDate?: string
  endDate?: string
  budget?: number | null
  interests?: string[]
  ecoScore?: number
  status?: TripStatus
  source?: TripSource
  sourceRequestId?: string | null
  weatherCondition?: string | null
  totalEstimatedCost?: number | null
  items?: TripItemInput[]
}

const isIsoDate = (value: unknown): value is string => {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
}

const dateInRange = (date: string, startDate: string, endDate: string) => {
  return date >= startDate && date <= endDate
}

const normalizeText = (value: unknown) => String(value || '').trim()

const normalizeNullableText = (value: unknown) => {
  const text = normalizeText(value)
  return text || null
}

const normalizeNumber = (value: unknown, fallback: number | null = null) => {
  if (value === null || value === undefined || value === '') return fallback
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

const normalizeItems = (rawItems: unknown, startDate: string, endDate: string): TripItemInput[] => {
  if (!Array.isArray(rawItems)) return []

  return rawItems.map((item, index) => {
    const input = item as TripItemInput
    const tripDate = isIsoDate(input.tripDate) && dateInRange(input.tripDate, startDate, endDate)
      ? input.tripDate
      : startDate
    const dayPart = validDayParts.includes(input.dayPart as DayPart) ? input.dayPart : 'flexible'
    const title = normalizeText(input.title)

    if (!title) {
      throw new Error('Each itinerary item needs a title')
    }

    return {
      tripDate,
      dayPart,
      title,
      category: normalizeText(input.category) || 'activity',
      estimatedCost: normalizeNumber(input.estimatedCost),
      rationale: normalizeNullableText(input.rationale),
      weatherAlternative: normalizeNullableText(input.weatherAlternative),
      communityImpact: normalizeNullableText(input.communityImpact),
      sortOrder: Number.isInteger(input.sortOrder) ? input.sortOrder : index,
    }
  })
}

const withTransaction = async <T>(callback: (run: QueryRunner) => Promise<T>): Promise<T> => {
  const client = await pool.connect()

  try {
    await client.query('begin')
    const result = await callback((text, params = []) => client.query(text, params))
    await client.query('commit')
    return result
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}

const mapTripRows = (rows: any[]) => {
  const trips = new Map<string, any>()

  for (const row of rows) {
    if (!trips.has(row.id)) {
      trips.set(row.id, {
        id: row.id,
        destination: row.destination,
        startDate: row.start_date,
        endDate: row.end_date,
        budget: row.budget === null ? null : Number(row.budget),
        interests: row.interests || [],
        ecoScore: Number(row.eco_score),
        status: row.status,
        source: row.source,
        sourceRequestId: row.source_request_id,
        weatherCondition: row.weather_condition,
        totalEstimatedCost: row.total_estimated_cost === null ? null : Number(row.total_estimated_cost),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        items: [],
      })
    }

    if (row.item_id) {
      trips.get(row.id).items.push({
        id: row.item_id,
        tripId: row.id,
        tripDate: row.trip_date,
        dayPart: row.day_part,
        title: row.item_title,
        category: row.category,
        estimatedCost: row.estimated_cost === null ? null : Number(row.estimated_cost),
        rationale: row.rationale,
        weatherAlternative: row.weather_alternative,
        communityImpact: row.community_impact,
        sortOrder: row.sort_order,
      })
    }
  }

  return Array.from(trips.values())
}

const fetchTrips = async (userId: string, tripId?: string) => {
  const params = tripId ? [userId, tripId] : [userId]
  const filter = tripId ? 'and t.id = $2' : ''
  const { rows } = await query(
    `select
       t.id,
       t.destination,
       t.start_date::text,
       t.end_date::text,
       t.budget,
       t.interests,
       t.eco_score,
       t.status,
       t.source,
       t.source_request_id,
       t.weather_condition,
       t.total_estimated_cost,
       t.created_at,
       t.updated_at,
       i.id as item_id,
       i.trip_date::text,
       i.day_part,
       i.title as item_title,
       i.category,
       i.estimated_cost,
       i.rationale,
       i.weather_alternative,
       i.community_impact,
       i.sort_order
     from trips t
     left join trip_items i on i.trip_id = t.id
     where t.user_id = $1 ${filter}
     order by t.start_date desc, t.created_at desc, i.trip_date asc, i.sort_order asc`,
    params,
  )

  return mapTripRows(rows)
}

const validateTripInput = (body: TripInput, partial = false) => {
  const destination = normalizeText(body.destination)
  const startDate = body.startDate
  const endDate = body.endDate

  if (!partial || body.destination !== undefined) {
    if (!destination) return { error: 'destination is required' }
  }

  if (!partial || body.startDate !== undefined || body.endDate !== undefined) {
    if (!isIsoDate(startDate) || !isIsoDate(endDate)) return { error: 'valid startDate and endDate are required' }
    if (startDate > endDate) return { error: 'startDate must be before or equal to endDate' }
  }

  if (body.status !== undefined && !validStatuses.includes(body.status)) return { error: 'invalid status' }
  if (body.source !== undefined && !validSources.includes(body.source)) return { error: 'invalid source' }

  const ecoScore = body.ecoScore === undefined ? undefined : Number(body.ecoScore)
  if (ecoScore !== undefined && (!Number.isInteger(ecoScore) || ecoScore < 0 || ecoScore > 100)) {
    return { error: 'ecoScore must be an integer from 0 to 100' }
  }

  return { error: null }
}

const replaceTripItems = async (tripId: string, items: TripItemInput[], run: QueryRunner = query) => {
  await run('delete from trip_items where trip_id = $1', [tripId])

  for (const item of items) {
    await run(
      `insert into trip_items (
         trip_id,
         trip_date,
         day_part,
         title,
         category,
         estimated_cost,
         rationale,
         weather_alternative,
         community_impact,
         sort_order
       )
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        tripId,
        item.tripDate,
        item.dayPart,
        item.title,
        item.category,
        item.estimatedCost,
        item.rationale,
        item.weatherAlternative,
        item.communityImpact,
        item.sortOrder,
      ],
    )
  }
}

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const trips = await fetchTrips(req.user!.id)
    return res.status(200).json(trips)
  } catch (error) {
    console.error('GET trips error:', error)
    return res.status(500).json({ error: 'An unexpected error occurred' })
  }
})

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body as TripInput
    const validation = validateTripInput(body)
    if (validation.error) return res.status(400).json({ error: validation.error })

    const items = normalizeItems(body.items, body.startDate!, body.endDate!)
    const tripId = await withTransaction(async (run) => {
      const { rows } = await run(
        `insert into trips (
           user_id,
           destination,
           start_date,
           end_date,
           budget,
           interests,
           eco_score,
           status,
           source,
           source_request_id,
           weather_condition,
           total_estimated_cost
         )
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         returning id`,
        [
          req.user!.id,
          normalizeText(body.destination),
          body.startDate,
          body.endDate,
          normalizeNumber(body.budget),
          Array.isArray(body.interests) ? body.interests.map(normalizeText).filter(Boolean) : [],
          body.ecoScore ?? 75,
          body.status || (body.endDate! < new Date().toISOString().slice(0, 10) ? 'completed' : 'upcoming'),
          body.source || 'manual',
          normalizeNullableText(body.sourceRequestId),
          normalizeNullableText(body.weatherCondition),
          normalizeNumber(body.totalEstimatedCost),
        ],
      )

      await replaceTripItems(rows[0].id, items, run)
      return rows[0].id
    })

    const [trip] = await fetchTrips(req.user!.id, tripId)
    return res.status(201).json(trip)
  } catch (error: any) {
    if (error?.code === '23505') {
      const sourceRequestId = normalizeNullableText((req.body as TripInput).sourceRequestId)
      if (sourceRequestId) {
        const trips = await fetchTrips(req.user!.id)
        const existing = trips.find((trip) => trip.sourceRequestId === sourceRequestId)
        if (existing) return res.status(200).json(existing)
      }
      return res.status(409).json({ error: 'Trip already exists' })
    }
    console.error('POST trips error:', error)
    return res.status(error instanceof Error && error.message.includes('itinerary item') ? 400 : 500).json({
      error: error instanceof Error && error.message.includes('itinerary item') ? error.message : 'An unexpected error occurred',
    })
  }
})

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existingTrips = await fetchTrips(req.user!.id, req.params.id)
    const existing = existingTrips[0]
    if (!existing) return res.status(404).json({ error: 'Trip not found' })

    const body = req.body as TripInput
    const nextStartDate = body.startDate || existing.startDate
    const nextEndDate = body.endDate || existing.endDate
    const validation = validateTripInput(
      {
        ...body,
        destination: body.destination ?? existing.destination,
        startDate: nextStartDate,
        endDate: nextEndDate,
      },
      true,
    )
    if (validation.error) return res.status(400).json({ error: validation.error })

    await withTransaction(async (run) => {
      const { rows } = await run(
        `update trips
         set destination = $3,
             start_date = $4,
             end_date = $5,
             budget = $6,
             interests = $7,
             eco_score = $8,
             status = $9,
             weather_condition = $10,
             total_estimated_cost = $11,
             updated_at = now()
         where id = $1 and user_id = $2
         returning id`,
        [
          req.params.id,
          req.user!.id,
          body.destination === undefined ? existing.destination : normalizeText(body.destination),
          nextStartDate,
          nextEndDate,
          body.budget === undefined ? existing.budget : normalizeNumber(body.budget),
          body.interests === undefined ? existing.interests : body.interests.map(normalizeText).filter(Boolean),
          body.ecoScore === undefined ? existing.ecoScore : Number(body.ecoScore),
          body.status === undefined ? existing.status : body.status,
          body.weatherCondition === undefined ? existing.weatherCondition : normalizeNullableText(body.weatherCondition),
          body.totalEstimatedCost === undefined ? existing.totalEstimatedCost : normalizeNumber(body.totalEstimatedCost),
        ],
      )

      if (!rows[0]) throw new Error('Trip not found')

      if (body.items !== undefined) {
        await replaceTripItems(req.params.id, normalizeItems(body.items, nextStartDate, nextEndDate), run)
      }
    })

    const [trip] = await fetchTrips(req.user!.id, req.params.id)
    return res.status(200).json(trip)
  } catch (error) {
    console.error('PATCH trips error:', error)
    return res.status(error instanceof Error && error.message.includes('itinerary item') ? 400 : 500).json({
      error: error instanceof Error && error.message.includes('itinerary item') ? error.message : 'An unexpected error occurred',
    })
  }
})

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await query('delete from trips where id = $1 and user_id = $2', [req.params.id, req.user!.id])
    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('DELETE trips error:', error)
    return res.status(500).json({ error: 'An unexpected error occurred' })
  }
})

router.post('/import-local', async (req: AuthRequest, res: Response) => {
  try {
    const rawTrips = Array.isArray(req.body?.trips) ? req.body.trips : []
    const imported: any[] = []
    const failed: any[] = []

    for (const rawTrip of rawTrips) {
      try {
        const body = rawTrip as TripInput
        const validation = validateTripInput(body)
        if (validation.error) throw new Error(validation.error)

        const sourceRequestId = normalizeNullableText(body.sourceRequestId)
        if (sourceRequestId) {
          const existingTrips = await fetchTrips(req.user!.id)
          const existing = existingTrips.find((trip) => trip.sourceRequestId === sourceRequestId)
          if (existing) {
            imported.push(existing)
            continue
          }
        }

        const items = normalizeItems(body.items, body.startDate!, body.endDate!)
        const tripId = await withTransaction(async (run) => {
          const { rows } = await run(
            `insert into trips (
               user_id,
               destination,
               start_date,
               end_date,
               budget,
               interests,
               eco_score,
               status,
               source,
               source_request_id,
               weather_condition,
               total_estimated_cost
             )
             values ($1, $2, $3, $4, $5, $6, $7, $8, 'local-import', $9, $10, $11)
             on conflict (user_id, source_request_id) do update set updated_at = trips.updated_at
             returning id`,
            [
              req.user!.id,
              normalizeText(body.destination),
              body.startDate,
              body.endDate,
              normalizeNumber(body.budget),
              Array.isArray(body.interests) ? body.interests.map(normalizeText).filter(Boolean) : [],
              body.ecoScore ?? 75,
              body.status || 'upcoming',
              sourceRequestId,
              normalizeNullableText(body.weatherCondition),
              normalizeNumber(body.totalEstimatedCost),
            ],
          )

          await replaceTripItems(rows[0].id, items, run)
          return rows[0].id
        })

        const [trip] = await fetchTrips(req.user!.id, tripId)
        imported.push(trip)
      } catch (error) {
        failed.push(rawTrip)
      }
    }

    return res.status(200).json({ imported, failed })
  } catch (error) {
    console.error('POST import local trips error:', error)
    return res.status(500).json({ error: 'An unexpected error occurred' })
  }
})

export default router
