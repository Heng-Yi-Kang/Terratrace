import { Request, Response, Router } from 'express'
import { query } from '../utils/db'

const router = Router()

const VALID_CATEGORIES = new Set(['accommodation', 'dining', 'transport'])

export interface DatabaseLocation {
  id: string | number
  name?: string | null
  category?: string | null
  city?: string | null
  country?: string | null
  address?: string | null
  lat?: number | string | null
  lng?: number | string | null
  long?: number | string | null
  eco_certs?: string[] | null
  eco_tags?: string[] | null
  eco_score?: number | string | null
  description?: string | null
  image_url?: string | null
  image_thumb?: string | null
  public_id: string
}

// Helper to map and sanitize database location rows to frontend Place objects
export const mapDbLocationToPlace = (row: DatabaseLocation) => {
  // Normalize category names (handle lowercase/uppercase variations)
  let category: 'Accommodation' | 'Dining' | 'Transport' = 'Accommodation'
  if (row.category) {
    const catLower = row.category.toLowerCase()
    if (catLower === 'accommodation') category = 'Accommodation'
    else if (catLower === 'dining') category = 'Dining'
    else if (catLower === 'transport') category = 'Transport'
  }

  // Create a fallback booking URL since ex_booking_url is not in the database table
  const searchName = row.name || 'Unnamed destination'
  const searchCity = row.city || ''
  const bookingUrl = `https://www.google.com/search?q=${encodeURIComponent(`${searchName} ${searchCity} booking`)}`

  return {
    id: String(row.id),
    name: row.name ?? 'Unnamed',
    category,
    city: row.city ?? undefined,
    country: row.country ?? undefined,
    address: row.address ?? undefined,
    lat: Number(row.lat ?? 0),
    long: Number(row.lng ?? row.long ?? 0), // Map 'lng' to 'long'
    ecoCerts: Array.isArray(row.eco_certs) ? row.eco_certs : [],
    ecoTags: Array.isArray(row.eco_tags) ? row.eco_tags : [],
    ecoScore: row.eco_score !== null && row.eco_score !== undefined ? Number(row.eco_score) : undefined,
    description: row.description ?? undefined,
    imageUrl: row.image_url ?? undefined,
    imageThumb: row.image_thumb ?? undefined,
    bookingUrl,
    publicId: row.public_id,
  }
}

// GET /api/locations
// Fetch locations, optionally filtered by text query, city, and category.
router.get('/', async (req: Request, res: Response) => {
  try {
    const search = typeof req.query.q === 'string' ? req.query.q.trim() : ''
    const city = typeof req.query.city === 'string' ? req.query.city.trim() : ''
    const category = typeof req.query.category === 'string' ? req.query.category.trim().toLowerCase() : ''

    if (category && !VALID_CATEGORIES.has(category)) {
      return res.status(400).json({ error: 'Category must be Accommodation, Dining, or Transport.' })
    }

    const conditions: string[] = []
    const values: unknown[] = []

    if (search) {
      values.push(`%${search.toLowerCase()}%`)
      const param = `$${values.length}`
      conditions.push(`(
        lower(coalesce(name, '')) like ${param}
        or lower(coalesce(city, '')) like ${param}
        or lower(coalesce(category, '')) like ${param}
        or exists (
          select 1
          from unnest(coalesce(eco_certs, '{}') || coalesce(eco_tags, '{}')) as tag
          where lower(tag) like ${param}
        )
      )`)
    }

    if (city) {
      values.push(city.toLowerCase())
      conditions.push(`lower(city) = $${values.length}`)
    }

    if (category) {
      values.push(category)
      conditions.push(`lower(category) = $${values.length}`)
    }

    const whereClause = conditions.length > 0 ? ` where ${conditions.join(' and ')}` : ''
    const { rows } = await query<DatabaseLocation>(`select * from locations${whereClause} order by name asc`, values)
    const places = rows.map(mapDbLocationToPlace)
    return res.status(200).json(places)
  } catch (error) {
    console.error('Unexpected error in locations route:', error)
    return res.status(500).json({ error: 'An unexpected error occurred.' })
  }
})

// GET /api/locations/cities
// Fetch known cities for geo-specific directory filtering.
router.get('/cities', async (_req: Request, res: Response) => {
  try {
    const { rows } = await query<{ city: string }>(
      `select distinct city
       from locations
       where city is not null and btrim(city) <> ''
       order by city asc`,
    )
    return res.status(200).json(rows.map((row) => row.city))
  } catch (error) {
    console.error('Unexpected error in location cities route:', error)
    return res.status(500).json({ error: 'An unexpected error occurred.' })
  }
})

// GET /api/locations/recommendations
// Get randomized recommendations of a specific category in a city, excluding current location
router.get('/recommendations', async (req: Request, res: Response) => {
  const category = req.query.category as string
  const city = req.query.city as string
  const excludeId = req.query.excludeId as string

  if (!category) {
    return res.status(400).json({ error: 'Category query parameter is required.' })
  }

  try {
    const categoryLower = category.toLowerCase()
    const conditions = ['lower(category) = $1']
    const values: unknown[] = [categoryLower]
    if (city) {
      values.push(city)
      conditions.push(`city = $${values.length}`)
    }
    if (excludeId) {
      values.push(excludeId)
      conditions.push(`public_id <> $${values.length}`)
    }

    const { rows } = await query<DatabaseLocation>(
      `select * from locations where ${conditions.join(' and ')}`,
      values,
    )
    const places = rows.map(mapDbLocationToPlace)
    const shuffled = [...places].sort(() => 0.5 - Math.random())
    const recommendations = shuffled.slice(0, 4)

    return res.status(200).json(recommendations)
  } catch (error) {
    console.error('Unexpected error in recommendations route:', error)
    return res.status(500).json({ error: 'An unexpected error occurred.' })
  }
})

// GET /api/locations/:publicId
// Fetch a single location by public_id
router.get('/:publicId', async (req: Request, res: Response) => {
  const { publicId } = req.params

  try {
    const { rows } = await query<DatabaseLocation>('select * from locations where public_id = $1 limit 1', [publicId])
    const data = rows[0]

    if (!data) {
      return res.status(404).json({ error: 'Destination not found.' })
    }

    const place = mapDbLocationToPlace(data)
    return res.status(200).json(place)
  } catch (error) {
    console.error('Unexpected error in location details route:', error)
    return res.status(500).json({ error: 'An unexpected error occurred.' })
  }
})

export default router
