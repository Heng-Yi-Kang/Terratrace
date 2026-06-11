import { describe, expect, it } from 'vitest'
import { CalcTotal, calculate } from './calculate'
import type { Trip } from './types'

describe('frontend carbon calculation helpers', () => {
  it.each([
    [{ id: 'flight-1', type: 'flight', distanceKm: 800, flightClass: 'business', isReturn: true }, 506.496],
    [{ id: 'car-1', type: 'car', distanceKm: 240, CarType: 'hybrid', passengers: 2 }, 15.39],
    [{ id: 'hotel-1', type: 'hotel', nights: 3, HotelType: 'luxury' }, 180],
    [{ id: 'rail-1', type: 'rail', distanceKm: 500, RailType: 'international', isReturn: false }, 2.23],
    [{ id: 'bus-1', type: 'bus', distanceKm: 100, BusType: 'standard' }, 10.385],
    [{ id: 'taxi-1', type: 'taxi', distanceKm: 12 }, 1.78332],
  ] as [Trip, number][])('calculates %s emissions', (trip, expected) => {
    expect(calculate(trip)).toBeCloseTo(expected, 5)
  })

  it('totals category emissions for mixed trips', () => {
    const result = CalcTotal([
      { id: 'flight-1', type: 'flight', distanceKm: 800, flightClass: 'business', isReturn: true },
      { id: 'car-1', type: 'car', distanceKm: 240, CarType: 'hybrid', passengers: 2 },
      { id: 'hotel-1', type: 'hotel', nights: 3, HotelType: 'luxury' },
      { id: 'rail-1', type: 'rail', distanceKm: 500, RailType: 'international', isReturn: false },
      { id: 'bus-1', type: 'bus', distanceKm: 100, BusType: 'standard' },
      { id: 'taxi-1', type: 'taxi', distanceKm: 12 },
    ])

    expect(result.flightEmissions).toBeCloseTo(506.496, 5)
    expect(result.carEmissions).toBeCloseTo(15.39, 5)
    expect(result.hotelEmissions).toBeCloseTo(180, 5)
    expect(result.railEmissions).toBeCloseTo(2.23, 5)
    expect(result.busEmissions).toBeCloseTo(10.385, 5)
    expect(result.taxiEmissions).toBeCloseTo(1.78332, 5)
    expect(result.total).toBeCloseTo(716.28432, 5)
  })
})
