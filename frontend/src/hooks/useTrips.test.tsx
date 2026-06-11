import { describe, expect, it, vi } from 'vitest'
import { localTripToPayload, recommendationTripToPayload } from './useTrips'
import type { SavedTripFromRecommendation, TripPayload } from '@/types/trip'

vi.mock('./useUser', () => ({
  useUser: vi.fn(),
}))

const recommendations: SavedTripFromRecommendation['recommendations'] = [
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
]

describe('useTrips payload helpers', () => {
  it('converts a legacy recommendation trip into a trip payload', () => {
    const payload = localTripToPayload({
      id: 'local-1',
      destination: 'Kyoto',
      dates: 'Jun 12 - Jun 14, 2026',
      ecoScore: 88,
      status: 'upcoming',
      imageColor: 'green',
      savedFromRecommendation: true,
      requestId: 'request-1',
      budget: 500,
      interests: ['nature', 'food'],
      weatherCondition: 'sunny',
      totalEstimatedCost: 225,
      recommendations,
      createdAt: '2026-06-01T00:00:00.000Z',
    })

    expect(payload).toMatchObject({
      destination: 'Kyoto',
      startDate: '2026-06-12',
      endDate: '2026-06-14',
      budget: 500,
      interests: ['nature', 'food'],
      ecoScore: 88,
      status: 'upcoming',
      source: 'recommendation',
      sourceRequestId: 'request-1',
      weatherCondition: 'sunny',
      totalEstimatedCost: 225,
    })
    expect(payload.items).toEqual([
      expect.objectContaining({
        tripDate: '2026-06-12',
        dayPart: 'flexible',
        title: 'Solar Lodge',
        category: 'accommodation',
        sortOrder: 0,
      }),
      expect.objectContaining({
        tripDate: '2026-06-12',
        dayPart: 'flexible',
        title: 'Farm Table Cafe',
        category: 'restaurant',
        sortOrder: 1,
      }),
    ])
  })

  it('falls back to today for an invalid legacy date range', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-11T08:00:00.000Z'))

    const payload = localTripToPayload({
      id: 'local-2',
      destination: 'Penang',
      dates: 'not a legacy date',
      ecoScore: 72,
      status: 'upcoming',
      imageColor: 'blue',
      savedFromRecommendation: true,
      requestId: 'request-2',
      budget: 300,
      interests: ['culture'],
      weatherCondition: 'mixed',
      totalEstimatedCost: 100,
      recommendations: recommendations.slice(0, 1),
      createdAt: '2026-06-01T00:00:00.000Z',
    })

    expect(payload.startDate).toBe('2026-06-11')
    expect(payload.endDate).toBe('2026-06-11')
    expect(payload.items[0].tripDate).toBe('2026-06-11')

    vi.useRealTimers()
  })

  it('passes already-normalized trip payloads through unchanged', () => {
    const tripPayload: TripPayload = {
      destination: 'Singapore',
      startDate: '2026-07-01',
      endDate: '2026-07-03',
      budget: 650,
      interests: ['wellness'],
      ecoScore: 91,
      status: 'upcoming',
      source: 'manual',
      sourceRequestId: null,
      weatherCondition: null,
      totalEstimatedCost: null,
      items: [],
    }

    expect(localTripToPayload(tripPayload)).toBe(tripPayload)
  })

  it('maps recommendations into itinerary items and marks future trips upcoming', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-11T08:00:00.000Z'))

    const payload = recommendationTripToPayload({
      destination: 'Kuala Lumpur, MY',
      startDate: '2026-06-20',
      endDate: '2026-06-22',
      budget: 450,
      interests: ['nature', 'food'],
      ecoScore: 83,
      requestId: 'smart-1',
      weatherCondition: 'rainy',
      totalEstimatedCost: 225,
      recommendations,
    })

    expect(payload.status).toBe('upcoming')
    expect(payload.items).toEqual([
      expect.objectContaining({
        title: 'Solar Lodge',
        tripDate: '2026-06-20',
        sortOrder: 0,
        rationale: 'Low-energy stay close to transit.',
        weatherAlternative: 'Indoor eco tour',
        communityImpact: 'Supports local staff',
      }),
      expect.objectContaining({
        title: 'Farm Table Cafe',
        tripDate: '2026-06-20',
        sortOrder: 1,
        rationale: 'Uses regional ingredients.',
        weatherAlternative: 'Covered market visit',
        communityImpact: 'Buys from nearby farms',
      }),
    ])

    vi.useRealTimers()
  })

  it('marks recommendation payloads completed when the end date is in the past', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-11T08:00:00.000Z'))

    const payload = recommendationTripToPayload({
      destination: 'Malacca',
      startDate: '2026-05-01',
      endDate: '2026-05-03',
      budget: 200,
      interests: ['history'],
      ecoScore: 80,
      requestId: 'smart-2',
      weatherCondition: 'sunny',
      totalEstimatedCost: 120,
      recommendations: recommendations.slice(0, 1),
    })

    expect(payload.status).toBe('completed')

    vi.useRealTimers()
  })
})
