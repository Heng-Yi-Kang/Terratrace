import { Request, Response, Router } from 'express'

const router = Router()

type Coordinate = {
  lat: number
  lon: number
}

type PlaceSuggestion = {
  displayName: string
  lat: number
  lon: number
}

type Mode = 'walking' | 'cycling' | 'driving'

type ModeResult = {
  mode: Mode
  distanceKm: number
  durationMinutes: number
  estimatedCo2Kg: number
  coordinates: Array<[number, number]>
}

type RouteResponse = {
  start: {
    label: string
    lat: number
    lon: number
  }
  destination: {
    label: string
    lat: number
    lon: number
  }
  recommendations: ModeResult[]
  greenerChoice: Mode
  notes: string[]
}

const nominatimBase = 'https://nominatim.openstreetmap.org'
const openRouteServiceBase = 'https://api.openrouteservice.org'

const emissionFactorKgPerKm: Record<Mode, number> = {
  walking: 0,
  cycling: 0,
  driving: 0.21,
}

const openRouteProfileByMode: Record<Mode, string> = {
  walking: 'foot-walking',
  cycling: 'cycling-regular',
  driving: 'driving-car',
}

const fetchJson = async <T>(url: string, headers?: Record<string, string>): Promise<T> => {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Terratrace-EcoRoute/1.0 (educational project)',
      ...(headers || {}),
    },
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return (await response.json()) as T
}

const postJson = async <T>(url: string, body: unknown, headers?: Record<string, string>): Promise<T> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return (await response.json()) as T
}

const round = (value: number, digits = 2): number => Number(value.toFixed(digits))

const reverseGeocode = async (point: Coordinate): Promise<string> => {
  try {
    const payload = await fetchJson<{ display_name?: string }>(
      `${nominatimBase}/reverse?format=jsonv2&lat=${point.lat}&lon=${point.lon}`,
    )
    return payload.display_name || `Lat ${point.lat}, Lon ${point.lon}`
  } catch {
    return `Lat ${point.lat}, Lon ${point.lon}`
  }
}

const geocode = async (query: string): Promise<PlaceSuggestion[]> => {
  const payload = await fetchJson<
    Array<{
      display_name: string
      lat: string
      lon: string
    }>
  >(`${nominatimBase}/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=6`)

  return payload.map((item) => ({
    displayName: item.display_name,
    lat: Number(item.lat),
    lon: Number(item.lon),
  }))
}

const fetchModeRoute = async (mode: Mode, start: Coordinate, destination: Coordinate): Promise<ModeResult> => {
  const openRouteApiKey = process.env.OPENROUTESERVICE_API_KEY
  if (!openRouteApiKey) {
    throw new Error('Missing OPENROUTESERVICE_API_KEY')
  }

  const profile = openRouteProfileByMode[mode]

  const payload = await postJson<{
    routes?: Array<{
      summary?: {
        distance: number
        duration: number
      }
      geometry?: {
        coordinates?: Array<[number, number]>
      }
    }>
    features?: Array<{
      geometry?: {
        coordinates?: Array<[number, number]>
      }
      properties?: {
        summary?: {
          distance: number
          duration: number
        }
      }
    }>
  }>(
    `${openRouteServiceBase}/v2/directions/${profile}/geojson`,
    {
      coordinates: [
        [start.lon, start.lat],
        [destination.lon, destination.lat],
      ],
    },
    {
      Authorization: openRouteApiKey,
    },
  )

  const routeSummary = payload.routes?.[0]?.summary || payload.features?.[0]?.properties?.summary
  const routeCoordinates = payload.routes?.[0]?.geometry?.coordinates || payload.features?.[0]?.geometry?.coordinates || []

  if (!routeSummary) {
    throw new Error(`No ${mode} route found`)
  }

  const distanceKm = routeSummary.distance / 1000
  const durationMinutes = routeSummary.duration / 60
  const estimatedCo2Kg = distanceKm * emissionFactorKgPerKm[mode]

  return {
    mode,
    distanceKm: round(distanceKm),
    durationMinutes: round(durationMinutes),
    estimatedCo2Kg: round(estimatedCo2Kg, 3),
    coordinates: routeCoordinates,
  }
}

const searchLocationHandler = async (req: Request, res: Response) => {
  const query = String(req.query.query || '').trim()
  if (!query || query.length < 2) {
    return res.status(400).json({ error: 'Query must contain at least 2 characters.' })
  }

  try {
    const suggestions = await geocode(query)
    return res.status(200).json({ suggestions })
  } catch {
    return res.status(502).json({ error: 'Unable to search location right now.' })
  }
}

router.get('/search-location', searchLocationHandler)
router.get('/search-destination', searchLocationHandler)

router.post('/plan', async (req: Request, res: Response) => {
  const startLat = Number(req.body?.startLat)
  const startLon = Number(req.body?.startLon)
  const destinationLat = Number(req.body?.destinationLat)
  const destinationLon = Number(req.body?.destinationLon)
  const destinationLabel = String(req.body?.destinationLabel || '').trim()

  if (
    !Number.isFinite(startLat) ||
    !Number.isFinite(startLon) ||
    !Number.isFinite(destinationLat) ||
    !Number.isFinite(destinationLon)
  ) {
    return res.status(400).json({ error: 'Valid start and destination coordinates are required.' })
  }

  try {
    const [walking, cycling, driving, startLabelResolved] = await Promise.all([
      fetchModeRoute('walking', { lat: startLat, lon: startLon }, { lat: destinationLat, lon: destinationLon }),
      fetchModeRoute('cycling', { lat: startLat, lon: startLon }, { lat: destinationLat, lon: destinationLon }),
      fetchModeRoute('driving', { lat: startLat, lon: startLon }, { lat: destinationLat, lon: destinationLon }),
      reverseGeocode({ lat: startLat, lon: startLon }),
    ])

    const recommendations: ModeResult[] = [walking, cycling, driving]
      .sort((a, b) => a.estimatedCo2Kg - b.estimatedCo2Kg)

    const greenerChoice = recommendations[0]?.mode || 'walking'

    const payload: RouteResponse = {
      start: {
        label: startLabelResolved,
        lat: startLat,
        lon: startLon,
      },
      destination: {
        label: destinationLabel || `Lat ${destinationLat}, Lon ${destinationLon}`,
        lat: destinationLat,
        lon: destinationLon,
      },
      recommendations,
      greenerChoice,
      notes: [
        'Walking and cycling are assumed near-zero direct emissions.',
        'Driving CO2 estimate uses an average 0.21 kg/km factor.',
        'ETA values are fetched from OpenRouteService routing profiles.',
      ],
    }

    return res.status(200).json(payload)
  } catch {
    return res.status(502).json({ error: 'Unable to calculate eco route right now.' })
  }
})

export default router
