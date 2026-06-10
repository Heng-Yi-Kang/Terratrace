'use client'

import Link from 'next/link'
import { FormEvent, useMemo, useState } from 'react'
import type { TripPayload } from '@/types/trip'
import { recommendationTripToPayload } from '@/hooks/useTrips'

type Interest = 'nature' | 'culture' | 'food' | 'adventure' | 'wellness' | 'history' | 'shopping'

type SmartRecommendationResponse = {
  requestId: string
  provider: 'gemini' | 'deterministic-fallback'
  cacheHit: boolean
  weather: {
    cityName: string
    country?: string
    condition: 'sunny' | 'rainy' | 'mixed' | 'unknown'
    avgTemperatureC: number
  }
  scoringWeights: {
    ecoCertScore: number
    interestMatch: number
    weatherFit: number
    budgetFit: number
  }
  shortlistedCandidates: Array<{
    id: string
    name: string
    url: string
    snippet: string
    sourceDomain: string
    category: 'accommodation' | 'restaurant' | 'activity'
    estimatedCost: number
    scoreBreakdown: {
      ecoCertScore: number
      interestMatch: number
      weatherFit: number
      budgetFit: number
      total: number
    }
  }>
  plan: {
    summary: string
    totalEstimatedCost: number
    recommendations: Array<{
      candidateId: string
      title: string
      category: 'accommodation' | 'restaurant' | 'activity'
      estimatedCost: number
      rationale: string
      weatherAlternative: string
      communityImpact: string
    }>
  }
  error?: string
}

const interestsCatalog: Interest[] = [
  'nature',
  'culture',
  'food',
  'adventure',
  'wellness',
  'history',
  'shopping',
]

const LeafIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9A9 9 0 0012 3a9 9 0 00-4.5 9c0 4.97 2.015 9 4.5 9z" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
)

const Navbar = () => (
  <nav className="fixed top-4 left-4 right-4 z-50">
    <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-md rounded-organic shadow-organic">
      <div className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 cursor-pointer group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <LeafIcon />
          </div>
          <span className="font-heading font-semibold text-xl text-text">Terratrace</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/#features" className="text-text/70 hover:text-primary transition-colors duration-200 cursor-pointer font-medium">Features</Link>
          <Link href="/#weather" className="text-text/70 hover:text-primary transition-colors duration-200 cursor-pointer font-medium">Weather</Link>
          <Link href="/#testimonials" className="text-text/70 hover:text-primary transition-colors duration-200 cursor-pointer font-medium">Stories</Link>
          <Link href="/#cta" className="text-text/70 hover:text-primary transition-colors duration-200 cursor-pointer font-medium">About</Link>
        </div>
        <Link href="/smart-recommendation" className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-secondary transition-colors duration-200 cursor-pointer flex items-center gap-2">
          Start Planning
          <ArrowRightIcon />
        </Link>
      </div>
    </div>
  </nav>
)

interface SmartRecommendationSectionProps {
  hideNavbar?: boolean
  onSaveTrip?: (trip: TripPayload) => Promise<void> | void
}

export default function SmartRecommendationSection({ hideNavbar = false, onSaveTrip }: SmartRecommendationSectionProps) {
  const [city, setCity] = useState('Kuala Lumpur')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [budget, setBudget] = useState('400')
  const [interests, setInterests] = useState<Interest[]>(['nature', 'food'])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saveStatus, setSaveStatus] = useState('')
  const [result, setResult] = useState<SmartRecommendationResponse | null>(null)

  const toggleInterest = (interest: Interest) => {
    setInterests((current) =>
      current.includes(interest) ? current.filter((entry) => entry !== interest) : [...current, interest],
    )
  }

  const weatherSummary = useMemo(() => {
    if (!result) return ''
    return `${result.weather.cityName}${result.weather.country ? `, ${result.weather.country}` : ''} • ${result.weather.condition} • ${result.weather.avgTemperatureC}°C avg`
  }, [result])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedCity = city.trim()
    const parsedBudget = Number(budget)

    if (!normalizedCity) {
      setError('Please enter a city.')
      return
    }

    if (!startDate || !endDate) {
      setError('Please select start and end dates.')
      return
    }

    if (startDate > endDate) {
      setError('Start date must be before or equal to end date.')
      return
    }

    if (!Number.isFinite(parsedBudget) || parsedBudget <= 0) {
      setError('Please enter a valid positive budget.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
      const response = await fetch(`${baseUrl}/api/recommendations/smart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: normalizedCity,
          startDate,
          endDate,
          budget: parsedBudget,
          interests,
        }),
      })

      const data = (await response.json()) as SmartRecommendationResponse
      if (!response.ok) {
        throw new Error(data.error || 'Unable to generate recommendations right now.')
      }

      setResult(data)
      setSaveStatus('')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to generate recommendations right now.'
      setError(message)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const deriveEcoScore = (data: SmartRecommendationResponse) => {
    if (data.shortlistedCandidates.length === 0) return 75
    const average = data.shortlistedCandidates.reduce((sum, candidate) => sum + candidate.scoreBreakdown.total, 0) / data.shortlistedCandidates.length
    return Math.max(0, Math.min(100, Math.round(average * 100)))
  }

  const handleSaveTrip = async () => {
    if (!result || !onSaveTrip) return

    const destination = `${result.weather.cityName}${result.weather.country ? `, ${result.weather.country}` : ''}`

    try {
      await onSaveTrip(recommendationTripToPayload({
        destination,
        startDate,
        endDate,
        budget: Number(budget),
        interests,
        ecoScore: deriveEcoScore(result),
        requestId: result.requestId,
        weatherCondition: result.weather.condition,
        totalEstimatedCost: result.plan.totalEstimatedCost,
        recommendations: result.plan.recommendations,
      }))
      setSaveStatus('Trip saved to your itinerary.')
    } catch (err) {
      setSaveStatus(err instanceof Error ? err.message : 'Unable to save trip.')
    }
  }

  return (
    <>
      {!hideNavbar && <Navbar />}
      <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-organic-lg p-6 md:p-8 shadow-organic">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="smart-city" className="block text-sm font-medium text-text mb-2">City</label>
                <input
                  id="smart-city"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="e.g., Kyoto"
                  className="w-full px-4 py-3 rounded-xl border border-text/20 text-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors duration-200"
                />
              </div>
              <div>
                <label htmlFor="smart-budget" className="block text-sm font-medium text-text mb-2">Budget (total)</label>
                <input
                  id="smart-budget"
                  type="number"
                  min={1}
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-text/20 text-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors duration-200"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="smart-start" className="block text-sm font-medium text-text mb-2">Start date</label>
                <input
                  id="smart-start"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-text/20 text-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors duration-200"
                />
              </div>
              <div>
                <label htmlFor="smart-end" className="block text-sm font-medium text-text mb-2">End date</label>
                <input
                  id="smart-end"
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-text/20 text-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors duration-200"
                />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-text mb-2">Interests</p>
              <div className="flex flex-wrap gap-2">
                {interestsCatalog.map((interest) => {
                  const active = interests.includes(interest)
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-2 rounded-xl text-sm border transition-colors duration-200 cursor-pointer ${
                        active
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-text/80 border-text/20 hover:border-primary/40'
                      }`}
                    >
                      {interest}
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-secondary disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
            >
              {loading ? 'Generating recommendations...' : 'Generate Smart Recommendation'}
            </button>
          </form>

          {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

          {result && (
            <div className="mt-8 space-y-6">
              <div className="rounded-2xl bg-background p-4 border border-white/70">
                <p className="text-sm text-text/70">Provider: {result.provider}</p>
                <p className="text-sm text-text/70">Cache: {result.cacheHit ? 'hit' : 'miss'}</p>
                <p className="text-sm text-text/70">Weather: {weatherSummary}</p>
                <p className="mt-2 text-text/80">{result.plan.summary}</p>
                <p className="mt-1 text-sm text-text/70">Total estimated cost: {result.plan.totalEstimatedCost}</p>
              </div>

              <div>
                <h2 className="font-heading font-semibold text-xl text-text mb-3">Trusted shortlist and scores</h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {result.shortlistedCandidates.map((candidate) => (
                    <article key={candidate.id} className="bg-white rounded-xl border border-text/10 p-4 shadow-organic">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-text">{candidate.name}</h3>
                        <span className="text-xs text-text/60 uppercase">{candidate.category}</span>
                      </div>
                      <p className="text-xs text-text/60 mt-1">Source: {candidate.sourceDomain}</p>
                      <p className="text-sm text-text/70 mt-2">{candidate.snippet}</p>
                      <p className="text-sm text-text/70 mt-2">Estimated cost: {candidate.estimatedCost}</p>
                      <p className="text-xs text-text/60 mt-2">
                        Score {candidate.scoreBreakdown.total} (eco {candidate.scoreBreakdown.ecoCertScore}, interest {candidate.scoreBreakdown.interestMatch}, weather {candidate.scoreBreakdown.weatherFit}, budget {candidate.scoreBreakdown.budgetFit})
                      </p>
                      <a
                        href={candidate.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex mt-3 text-sm font-medium text-primary hover:text-secondary transition-colors duration-200 cursor-pointer"
                      >
                        Open source
                      </a>
                    </article>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="font-heading font-semibold text-xl text-text mb-3">Final recommendations</h2>
                <div className="space-y-3">
                  {result.plan.recommendations.map((item) => (
                    <article key={`${item.candidateId}-${item.title}`} className="bg-white rounded-xl border border-text/10 p-4 shadow-organic">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-text">{item.title}</h3>
                        <span className="text-xs text-text/60 uppercase">{item.category}</span>
                      </div>
                      <p className="text-sm text-text/70 mt-1">Estimated cost: {item.estimatedCost}</p>
                      <p className="text-sm text-text/70 mt-2">Why: {item.rationale}</p>
                      <p className="text-sm text-text/70 mt-1">Weather alternative: {item.weatherAlternative}</p>
                      <p className="text-sm text-text/70 mt-1">Community impact: {item.communityImpact}</p>
                    </article>
                  ))}
                </div>
              </div>
              {onSaveTrip && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveTrip}
                    className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-cta text-white font-semibold hover:bg-cta/90 transition-colors duration-200 cursor-pointer"
                  >
                    Save as Trip
                  </button>
                  {saveStatus && <p className="text-sm text-text/70">{saveStatus}</p>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
    </>
  )
}
