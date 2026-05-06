'use client'

import { FormEvent, useState, useEffect } from 'react'
import type { RecommendationItem, SavedTripFromRecommendation } from '@/types/trip'

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
    scoreBreakdown: { ecoCertScore: number; interestMatch: number; weatherFit: number; budgetFit: number; total: number }
  }>
  plan: {
    summary: string
    totalEstimatedCost: number
    recommendations: RecommendationItem[]
  }
  error?: string
}

const interestsCatalog: Interest[] = ['nature', 'culture', 'food', 'adventure', 'wellness', 'history', 'shopping']

const recommendationImageColors = ['bg-emerald-400', 'bg-teal-400', 'bg-cyan-400', 'bg-lime-400', 'bg-green-400', 'bg-emerald-500']

interface SmartRecommendationModalProps {
  onClose: () => void
  onSave: (trip: SavedTripFromRecommendation) => void
}

export default function SmartRecommendationModal({ onClose, onSave }: SmartRecommendationModalProps) {
  const [city, setCity] = useState('Kuala Lumpur')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [budget, setBudget] = useState('400')
  const [interests, setInterests] = useState<Interest[]>(['nature', 'food'])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<SmartRecommendationResponse | null>(null)
  const [savedCount, setSavedCount] = useState(0)

  useEffect(() => {
    const stored = localStorage.getItem('terratrace_saved_trips')
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as SavedTripFromRecommendation[]
        setSavedCount(parsed.length)
      } catch {
        setSavedCount(0)
      }
    }
  }, [])

  const toggleInterest = (interest: Interest) => {
    setInterests((current) =>
      current.includes(interest) ? current.filter((e) => e !== interest) : [...current, interest],
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedCity = city.trim()
    const parsedBudget = Number(budget)

    if (!normalizedCity) { setError('Please enter a city.'); return }
    if (!startDate || !endDate) { setError('Please select start and end dates.'); return }
    if (startDate > endDate) { setError('Start date must be before or equal to end date.'); return }
    if (!Number.isFinite(parsedBudget) || parsedBudget <= 0) { setError('Please enter a valid positive budget.'); return }

    setLoading(true)
    setError('')

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
      const response = await fetch(`${baseUrl}/api/recommendations/smart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: normalizedCity, startDate, endDate, budget: parsedBudget, interests }),
      })

      const data = (await response.json()) as SmartRecommendationResponse
      if (!response.ok) throw new Error(data.error || 'Unable to generate recommendations.')

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate recommendations right now.')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const deriveEcoScore = (weights: SmartRecommendationResponse['scoringWeights']) => {
    return Math.round((weights.ecoCertScore * 0.35 + weights.interestMatch * 0.25 + weights.weatherFit * 0.2 + weights.budgetFit * 0.2) * 100)
  }

  const formatDateRange = (start: string, end: string) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const s = new Date(start)
    const e = new Date(end)
    return `${months[s.getMonth()]} ${s.getDate()} - ${months[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`
  }

  const handleSaveAsTrip = () => {
    if (!result) return

    const trip: SavedTripFromRecommendation = {
      id: `rec-${result.requestId}`,
      destination: `${result.weather.cityName}${result.weather.country ? `, ${result.weather.country}` : ''}`,
      dates: formatDateRange(startDate, endDate),
      ecoScore: deriveEcoScore(result.scoringWeights),
      status: new Date(endDate) < new Date() ? 'completed' : 'upcoming',
      imageColor: recommendationImageColors[savedCount % recommendationImageColors.length],
      savedFromRecommendation: true,
      requestId: result.requestId,
      budget: Number(budget),
      interests,
      weatherCondition: result.weather.condition,
      totalEstimatedCost: result.plan.totalEstimatedCost,
      recommendations: result.plan.recommendations,
      createdAt: new Date().toISOString(),
    }

    onSave(trip)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white/80 backdrop-blur-md rounded-organic-lg shadow-organic-lg p-6 md:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-text/60 hover:text-text hover:bg-text/10 transition-colors duration-200 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="font-heading font-bold text-2xl text-text mb-1">Smart Recommendations</h2>
        <p className="text-text/60 text-sm mb-6">AI-powered eco-friendly destination recommendations</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="modal-city" className="block text-sm font-medium text-text mb-2">City</label>
              <input
                id="modal-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., Kyoto"
                className="w-full px-4 py-3 rounded-xl border border-text/20 text-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors duration-200"
              />
            </div>
            <div>
              <label htmlFor="modal-budget" className="block text-sm font-medium text-text mb-2">Budget (total)</label>
              <input
                id="modal-budget"
                type="number"
                min={1}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-text/20 text-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors duration-200"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="modal-start" className="block text-sm font-medium text-text mb-2">Start date</label>
              <input
                id="modal-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-text/20 text-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors duration-200"
              />
            </div>
            <div>
              <label htmlFor="modal-end" className="block text-sm font-medium text-text mb-2">End date</label>
              <input
                id="modal-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
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
                      active ? 'bg-primary text-white border-primary' : 'bg-white text-text/80 border-text/20 hover:border-primary/40'
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
            className="w-full bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-secondary disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
          >
            {loading ? 'Generating recommendations...' : 'Generate Smart Recommendation'}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>
        )}

        {result && (
          <div className="mt-6 space-y-5">
            <div className="rounded-2xl bg-background p-4 border border-white/70">
              <p className="text-xs text-text/60">Provider: {result.provider} • Weather: {result.weather.condition} • {result.weather.avgTemperatureC}°C avg</p>
              <p className="mt-2 text-text/80 text-sm">{result.plan.summary}</p>
              <p className="mt-1 text-sm text-text/70">Total estimated cost: {result.plan.totalEstimatedCost}</p>
            </div>

            <div>
              <h3 className="font-semibold text-text mb-2">Shortlisted</h3>
              <div className="grid md:grid-cols-2 gap-2">
                {result.shortlistedCandidates.slice(0, 4).map((c) => (
                  <div key={c.id} className="bg-white rounded-xl border border-text/10 p-3 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-text text-sm">{c.name}</span>
                      <span className="text-xs text-text/60 uppercase">{c.category}</span>
                    </div>
                    <p className="text-xs text-text/60 mt-1">{c.sourceDomain}</p>
                    <p className="text-xs text-text/70 mt-1 line-clamp-2">{c.snippet}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-text mb-2">Recommendations</h3>
              <div className="space-y-2">
                {result.plan.recommendations.map((item, i) => (
                  <div key={`${item.candidateId}-${i}`} className="bg-white rounded-xl border border-text/10 p-3 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-text text-sm">{item.title}</span>
                      <span className="text-xs text-text/60 uppercase">{item.category}</span>
                    </div>
                    <p className="text-xs text-text/70 mt-1">Why: {item.rationale}</p>
                    <p className="text-xs text-text/50 mt-1">Community impact: {item.communityImpact}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSaveAsTrip}
              className="w-full bg-cta text-white px-6 py-3 rounded-xl font-semibold hover:bg-cta/90 transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Save as Trip
            </button>
          </div>
        )}
      </div>
    </div>
  )
}