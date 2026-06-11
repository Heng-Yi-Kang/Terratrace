import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SmartRecommendationSection from './smart-recommendation-section'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}))

const smartResponse = {
  requestId: 'request-123',
  provider: 'deterministic-fallback',
  cacheHit: false,
  weather: {
    cityName: 'Kyoto',
    country: 'JP',
    condition: 'rainy',
    avgTemperatureC: 18,
  },
  scoringWeights: {
    ecoCertScore: 0.4,
    interestMatch: 0.3,
    weatherFit: 0.2,
    budgetFit: 0.1,
  },
  shortlistedCandidates: [
    {
      id: 'stay-1',
      name: 'Solar Lodge',
      url: 'https://example.com/solar-lodge',
      snippet: 'A low-energy inn near transit.',
      sourceDomain: 'example.com',
      category: 'accommodation',
      estimatedCost: 180,
      scoreBreakdown: {
        ecoCertScore: 0.9,
        interestMatch: 0.8,
        weatherFit: 0.7,
        budgetFit: 0.9,
        total: 0.83,
      },
    },
  ],
  plan: {
    summary: 'A compact rainy-day eco itinerary.',
    totalEstimatedCost: 225,
    recommendations: [
      {
        candidateId: 'stay-1',
        title: 'Solar Lodge',
        category: 'accommodation',
        estimatedCost: 180,
        rationale: 'Low-energy stay close to transit.',
        weatherAlternative: 'Indoor eco tour',
        communityImpact: 'Supports local staff',
      },
      {
        candidateId: 'food-1',
        title: 'Farm Table Cafe',
        category: 'restaurant',
        estimatedCost: 45,
        rationale: 'Uses regional ingredients.',
        weatherAlternative: 'Covered market visit',
        communityImpact: 'Buys from nearby farms',
      },
    ],
  },
}

async function submitRecommendationForm() {
  await userEvent.clear(screen.getByLabelText(/city/i))
  await userEvent.type(screen.getByLabelText(/city/i), 'Kyoto')
  await userEvent.type(screen.getByLabelText(/start date/i), '2026-06-20')
  await userEvent.type(screen.getByLabelText(/end date/i), '2026-06-22')
  await userEvent.click(screen.getByRole('button', { name: /generate smart recommendation/i }))
}

describe('SmartRecommendationSection', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders validation errors without calling the API', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    render(<SmartRecommendationSection hideNavbar />)

    await userEvent.clear(screen.getByLabelText(/city/i))
    await userEvent.click(screen.getByRole('button', { name: /generate smart recommendation/i }))

    expect(await screen.findByText('Please enter a city.')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('renders successful recommendation results', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json(smartResponse))
    render(<SmartRecommendationSection hideNavbar />)

    await submitRecommendationForm()

    expect(await screen.findByText('A compact rainy-day eco itinerary.')).toBeInTheDocument()
    expect(screen.getByText(/Weather: Kyoto, JP/)).toBeInTheDocument()
    expect(screen.getAllByText('Solar Lodge')).toHaveLength(2)
    expect(screen.getByText('Farm Table Cafe')).toBeInTheDocument()
    expect(screen.getByText(/Why: Uses regional ingredients./)).toBeInTheDocument()
  })

  it('renders API errors from failed recommendation responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({ error: 'Recommendation service unavailable.' }, { status: 503 }),
    )
    render(<SmartRecommendationSection hideNavbar />)

    await submitRecommendationForm()

    expect(await screen.findByText('Recommendation service unavailable.')).toBeInTheDocument()
    expect(screen.queryByText('A compact rainy-day eco itinerary.')).not.toBeInTheDocument()
  })

  it('generates an itinerary payload when saving a recommendation', async () => {
    const onSaveTrip = vi.fn().mockResolvedValue(undefined)
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json(smartResponse))
    render(<SmartRecommendationSection hideNavbar onSaveTrip={onSaveTrip} />)

    await submitRecommendationForm()
    await screen.findByText('A compact rainy-day eco itinerary.')
    await userEvent.click(screen.getByRole('button', { name: /save as trip/i }))

    await waitFor(() => {
      expect(onSaveTrip).toHaveBeenCalledWith(expect.objectContaining({
        destination: 'Kyoto, JP',
        startDate: '2026-06-20',
        endDate: '2026-06-22',
        budget: 400,
        ecoScore: 83,
        source: 'recommendation',
        sourceRequestId: 'request-123',
        weatherCondition: 'rainy',
        totalEstimatedCost: 225,
      }))
    })
    expect(onSaveTrip.mock.calls[0][0].items).toEqual([
      expect.objectContaining({ title: 'Solar Lodge', sortOrder: 0, tripDate: '2026-06-20' }),
      expect.objectContaining({ title: 'Farm Table Cafe', sortOrder: 1, tripDate: '2026-06-20' }),
    ])
    expect(screen.getByText('Trip saved to your itinerary.')).toBeInTheDocument()
  })
})
