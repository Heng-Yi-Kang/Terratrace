import { afterEach, describe, expect, it, vi } from 'vitest'
import { calculateAndSave } from './carbon'

const mockFetch = (body: unknown, ok = true) => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    json: vi.fn().mockResolvedValue(body),
  })

  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('carbon api helpers', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns normalized calculate results from camelCase API data', async () => {
    mockFetch({
      total: 42.5,
      flightEmissions: 20,
      carEmissions: 10,
      hotelEmissions: 5,
      railEmissions: 3,
      busEmissions: 2,
      taxiEmissions: 2.5,
    })

    await expect(calculateAndSave([{ type: 'taxi', distanceKm: 10 }])).resolves.toEqual({
      total: 42.5,
      flightEmissions: 20,
      carEmissions: 10,
      hotelEmissions: 5,
      railEmissions: 3,
      busEmissions: 2,
      taxiEmissions: 2.5,
    })
  })

  it('maps snake_case calculate results so insights do not render zero totals', async () => {
    mockFetch({
      total_emissions: '110',
      flight_emissions: '20',
      car_emissions: '70',
      hotel_emissions: '10',
      rail_emissions: '5',
      bus_emissions: '3',
      taxi_emissions: '2',
    })

    await expect(calculateAndSave([{ type: 'car', distanceKm: 100 }])).resolves.toEqual({
      total: 110,
      flightEmissions: 20,
      carEmissions: 70,
      hotelEmissions: 10,
      railEmissions: 5,
      busEmissions: 3,
      taxiEmissions: 2,
    })
  })
})
