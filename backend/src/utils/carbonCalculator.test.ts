import { describe, expect, it } from 'vitest'
import { CalcTotal, type TripInput } from './carbonCalculator'

describe('carbon calculator utility', () => {
  it.each([
    [{ type: 'flight', distanceKm: 1000, flightClass: 'economy', isReturn: true }, 218.32],
    [{ type: 'car', distanceKm: 300, CarType: 'petrol', passengers: 3 }, 16.272],
    [{ type: 'hotel', nights: 4, HotelType: 'standard' }, 100],
    [{ type: 'rail', distanceKm: 250, RailType: 'national', isReturn: true }, 17.73],
    [{ type: 'bus', distanceKm: 120, BusType: 'coach' }, 3.3312],
    [{ type: 'taxi', distanceKm: 20 }, 2.9722],
  ] as [TripInput, number][])('calculates %s emissions', (trip, expected) => {
    expect(CalcTotal([trip]).total).toBeCloseTo(expected, 4)
  })

  it('aggregates emissions by travel category and total', () => {
    const result = CalcTotal([
      { type: 'flight', distanceKm: 1000, flightClass: 'economy', isReturn: true },
      { type: 'car', distanceKm: 300, CarType: 'petrol', passengers: 3 },
      { type: 'hotel', nights: 4, HotelType: 'standard' },
      { type: 'rail', distanceKm: 250, RailType: 'national', isReturn: true },
      { type: 'bus', distanceKm: 120, BusType: 'coach' },
      { type: 'taxi', distanceKm: 20 },
    ])

    expect(result.flightEmissions).toBeCloseTo(218.32, 4)
    expect(result.carEmissions).toBeCloseTo(16.272, 4)
    expect(result.hotelEmissions).toBeCloseTo(100, 4)
    expect(result.railEmissions).toBeCloseTo(17.73, 4)
    expect(result.busEmissions).toBeCloseTo(3.3312, 4)
    expect(result.taxiEmissions).toBeCloseTo(2.9722, 4)
    expect(result.total).toBeCloseTo(358.6254, 4)
  })
})
