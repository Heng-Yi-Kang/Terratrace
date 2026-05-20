import { Request, Response, Router } from 'express'
import { supabase } from '../utils/supabase'

const router = Router()

interface DatabaseLocation {
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
const mapDbLocationToPlace = (row: DatabaseLocation) => {
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
    lat: Number(row.lat) || 0,
    long: Number(row.lng) || Number(row.long) || 0, // Map 'lng' to 'long'
    ecoCerts: Array.isArray(row.eco_certs) ? row.eco_certs : [],
    ecoTags: Array.isArray(row.eco_tags) ? row.eco_tags : [],
    ecoScore: row.eco_score ? Number(row.eco_score) : undefined,
    description: row.description ?? undefined,
    imageUrl: row.image_url ?? undefined,
    imageThumb: row.image_thumb ?? undefined,
    bookingUrl,
    publicId: row.public_id,
  }
}

// GET /api/locations
// Fetch all locations
router.get('/', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')

    if (error) {
      console.error('Error fetching locations from Supabase:', error)
      return res.status(500).json({ error: 'Failed to retrieve destinations.' })
    }

    const places = (data ?? []).map(mapDbLocationToPlace)
    return res.status(200).json(places)
  } catch (error) {
    console.error('Unexpected error in locations route:', error)
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
    // We fetch matching rows
    let query = supabase.from('locations').select('*')

    // Handle DB lowercase vs uppercase
    const categoryLower = category.toLowerCase()
    query = query.or(`category.eq.${categoryLower},category.eq.${category}`)

    if (city) {
      query = query.eq('city', city)
    }

    if (excludeId) {
      query = query.neq('public_id', excludeId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching recommendations from Supabase:', error)
      return res.status(500).json({ error: 'Failed to retrieve recommendations.' })
    }

    // Map and shuffle/randomize results
    const places = (data ?? []).map(mapDbLocationToPlace)
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
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('public_id', publicId)
      .maybeSingle()

    if (error) {
      console.error(`Error fetching location ${publicId} from Supabase:`, error)
      return res.status(500).json({ error: 'Failed to retrieve destination details.' })
    }

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
