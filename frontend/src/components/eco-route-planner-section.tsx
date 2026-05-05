'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'

type DestinationSuggestion = {
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

type RoutePlanResponse = {
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

const modeLabel: Record<Mode, string> = {
  walking: 'Walking',
  cycling: 'Cycling',
  driving: 'Driving',
}

const greenerBadgeStyle: Record<Mode, string> = {
  walking: 'bg-primary/15 text-primary border-primary/30',
  cycling: 'bg-cyan-primary/15 text-cyan-primary border-cyan-primary/30',
  driving: 'bg-amber-100 text-amber-700 border-amber-300',
}

const formatDuration = (minutes: number): string => {
  const rounded = Math.round(minutes)
  const hrs = Math.floor(rounded / 60)
  const mins = rounded % 60
  if (hrs === 0) return `${mins} min`
  if (mins === 0) return `${hrs} hr`
  return `${hrs} hr ${mins} min`
}

export default function EcoRoutePlannerSection() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

  const [geoLoading, setGeoLoading] = useState(false)
  const [startPoint, setStartPoint] = useState<{ lat: number; lon: number } | null>(null)
  const [startLabel, setStartLabel] = useState('Current location not selected yet')

  const [destinationQuery, setDestinationQuery] = useState('')
  const [destination, setDestination] = useState<DestinationSuggestion | null>(null)
  const [destinationOptions, setDestinationOptions] = useState<DestinationSuggestion[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [plan, setPlan] = useState<RoutePlanResponse | null>(null)

  const canSubmit = Boolean(startPoint && destination && !loading)

  useEffect(() => {
    const query = destinationQuery.trim()

    if (query.length < 2 || (destination && destination.displayName === destinationQuery)) {
      setDestinationOptions([])
      return
    }

    const timeout = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const response = await fetch(`${baseUrl}/api/eco-route/search-destination?query=${encodeURIComponent(query)}`)
        const payload = (await response.json()) as { suggestions?: DestinationSuggestion[]; error?: string }

        if (!response.ok) {
          throw new Error(payload.error || 'Unable to search destinations.')
        }

        setDestinationOptions(payload.suggestions || [])
      } catch {
        setDestinationOptions([])
      } finally {
        setSearchLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [baseUrl, destination, destinationQuery])

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }

    setGeoLoading(true)
    setError('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point = {
          lat: Number(position.coords.latitude.toFixed(6)),
          lon: Number(position.coords.longitude.toFixed(6)),
        }

        setStartPoint(point)
        setStartLabel(`Lat ${point.lat}, Lon ${point.lon}`)
        setGeoLoading(false)
      },
      () => {
        setError('Unable to access your current location. Please allow location permission.')
        setGeoLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
      },
    )
  }

  const selectDestination = (item: DestinationSuggestion) => {
    setDestination(item)
    setDestinationQuery(item.displayName)
    setDestinationOptions([])
  }

  const onPlanRoute = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!startPoint || !destination) {
      setError('Please choose current location and destination first.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${baseUrl}/api/eco-route/plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startLat: startPoint.lat,
          startLon: startPoint.lon,
          destinationLat: destination.lat,
          destinationLon: destination.lon,
          destinationLabel: destination.displayName,
        }),
      })

      const payload = (await response.json()) as RoutePlanResponse & { error?: string }

      if (!response.ok) {
        throw new Error(payload.error || 'Unable to plan eco route.')
      }

      setPlan(payload)
    } catch (err) {
      setPlan(null)
      setError(err instanceof Error ? err.message : 'Unable to plan eco route.')
    } finally {
      setLoading(false)
    }
  }

  const topRecommendation = useMemo(() => plan?.recommendations?.[0], [plan])

  return (
    <section id="eco-route" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-text mb-4">Eco Route Planner</h2>
          <p className="text-text/70 max-w-2xl mx-auto">
            Choose your current location and destination to compare low-impact routes.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-organic-lg p-6 md:p-8 shadow-organic">
          <form onSubmit={onPlanRoute} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-background p-4 border border-white/70">
                <p className="text-sm font-medium text-text mb-2">Current location</p>
                <p className="text-sm text-text/70 mb-3 break-words">{startLabel}</p>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={geoLoading}
                  className="bg-primary text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-secondary disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
                >
                  {geoLoading ? 'Locating...' : 'Use Current Location'}
                </button>
              </div>

              <div className="rounded-2xl bg-background p-4 border border-white/70 relative">
                <label htmlFor="destination" className="block text-sm font-medium text-text mb-2">
                  Destination
                </label>
                <input
                  id="destination"
                  value={destinationQuery}
                  onChange={(event) => {
                    setDestinationQuery(event.target.value)
                    setDestination(null)
                  }}
                  placeholder="Type a destination city or place"
                  className="w-full px-4 py-3 rounded-xl border border-text/20 text-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors duration-200"
                />

                {searchLoading && <p className="text-xs text-text/60 mt-2">Searching destinations...</p>}

                {destinationOptions.length > 0 && (
                  <ul className="absolute z-20 left-4 right-4 mt-2 bg-white border border-text/15 rounded-xl shadow-organic max-h-56 overflow-y-auto">
                    {destinationOptions.map((item) => (
                      <li key={`${item.displayName}-${item.lat}-${item.lon}`}>
                        <button
                          type="button"
                          onClick={() => selectDestination(item)}
                          className="w-full text-left px-4 py-3 hover:bg-primary/10 transition-colors duration-200 cursor-pointer"
                        >
                          <span className="text-sm text-text">{item.displayName}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="bg-cyan-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-cyan-secondary disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
            >
              {loading ? 'Planning Route...' : 'Plan Eco Route'}
            </button>
          </form>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          {plan && (
            <div className="mt-8 space-y-4">
              <div className="rounded-2xl bg-primary/10 border border-primary/20 p-4">
                <p className="text-sm text-text/80">From</p>
                <p className="font-semibold text-text">{plan.start.label}</p>
                <p className="text-sm text-text/80 mt-2">To</p>
                <p className="font-semibold text-text">{plan.destination.label}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {plan.recommendations.map((item) => {
                  const isBest = item.mode === plan.greenerChoice
                  return (
                    <article key={item.mode} className="bg-background rounded-2xl p-4 border border-white/70 shadow-organic">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-heading font-semibold text-text">{modeLabel[item.mode]}</h3>
                        {isBest && (
                          <span
                            className={`text-xs border px-2 py-1 rounded-full font-semibold ${greenerBadgeStyle[item.mode]}`}
                          >
                            Best Eco Choice
                          </span>
                        )}
                      </div>

                      <dl className="mt-3 text-sm text-text/75 space-y-1">
                        <div className="flex items-center justify-between gap-3">
                          <dt>Distance</dt>
                          <dd>{item.distanceKm} km</dd>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <dt>Duration</dt>
                          <dd>{formatDuration(item.durationMinutes)}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-3 font-semibold text-text">
                          <dt>Estimated CO2</dt>
                          <dd>{item.estimatedCo2Kg} kg</dd>
                        </div>
                      </dl>
                    </article>
                  )
                })}
              </div>

              {topRecommendation && (
                <p className="text-sm text-text/70">
                  Recommended: <span className="font-semibold text-text">{modeLabel[topRecommendation.mode]}</span> for the
                  lowest estimated emissions.
                </p>
              )}

              <ul className="text-sm text-text/60 list-disc pl-5 space-y-1">
                {plan.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
