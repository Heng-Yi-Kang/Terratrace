import { describe, expect, it } from 'vitest'
import { buildImpactSummary, calculateTripImpact } from './analytics'
import type { TripInput } from './carbonCalculator'

describe('analytics impact calculations', () => {
  it.each([
    [{ type: 'flight', distanceKm: 1000, flightClass: 'business', isReturn: false }, 316.56, 109.16, 0],
    [{ type: 'rail', distanceKm: 100, RailType: 'national', isReturn: false }, 3.546, 16.272, 12.726],
    [{ type: 'bus', distanceKm: 100, BusType: 'coach' }, 2.776, 16.272, 13.496],
    [{ type: 'car', distanceKm: 100, CarType: 'hybrid', passengers: 2 }, 6.4125, 16.272, 9.8595],
    [{ type: 'taxi', distanceKm: 100 }, 14.861, 16.272, 1.411],
    [{ type: 'hotel', nights: 2, HotelType: 'budget' }, 20.8, 50, 29.2],
  ] as [TripInput, number, number, number][])(
    'compares %s against conservative traditional baseline',
    (trip, actualKg, expectedBaseline, expectedSaved) => {
      const impact = calculateTripImpact(trip, actualKg)

      expect(impact.baselineKg).toBeCloseTo(expectedBaseline, 3)
      expect(impact.savedKg).toBeCloseTo(expectedSaved, 3)
    },
  )

  it('clamps saved emissions at zero when actual exceeds baseline', () => {
    const impact = calculateTripImpact(
      { type: 'flight', distanceKm: 1000, flightClass: 'first', isReturn: false },
      436.63,
    )

    expect(impact.baselineKg).toBeCloseTo(109.16, 3)
    expect(impact.savedKg).toBe(0)
  })

  it('summarizes mixed entries with totals, breakdowns, details, and tree equivalent', () => {
    const summary = buildImpactSummary(
      [
        {
          id: 'entry-1',
          created_at: '2026-06-05T00:00:00.000Z',
          trips: [
            { type: 'rail', distanceKm: 100, RailType: 'national', isReturn: false },
            { type: 'hotel', nights: 2, HotelType: 'budget' },
          ],
          total_emissions: 24.346,
          flight_emissions: 0,
          car_emissions: 0,
          hotel_emissions: 20.8,
          rail_emissions: 3.546,
          bus_emissions: 0,
          taxi_emissions: 0,
        },
      ],
      'month',
    )

    expect(summary.actualEmissionsKg).toBe(24.3)
    expect(summary.baselineEmissionsKg).toBe(66.3)
    expect(summary.carbonSavedKg).toBe(41.9)
    expect(summary.treeEquivalent).toBe(2)
    expect(summary.loggedCalculations).toBe(1)
    expect(summary.breakdown.map((item) => item.method)).toEqual(['hotel', 'rail'])
    expect(summary.entries[0]).toMatchObject({
      id: 'entry-1',
      method: 'hotel',
      actualKg: 24.3,
      baselineKg: 66.3,
      savedKg: 41.9,
    })
    expect(summary.overTime[0]).toMatchObject({ period: '2026-06-05', count: 1 })
  })
})
