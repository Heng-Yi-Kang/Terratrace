import { describe, expect, it } from 'vitest'
import { groupByPeriod } from './CarbonTab'
import type { CarbonEntry } from '@/utils/carbon'

const entry = (created_at: string, total_emissions: number): CarbonEntry => ({
  id: created_at,
  created_at,
  trips: [],
  total_emissions,
  flight_emissions: 0,
  car_emissions: 0,
  hotel_emissions: 0,
  rail_emissions: 0,
  bus_emissions: 0,
  taxi_emissions: 0,
})

describe('groupByPeriod', () => {
  it('orders daily chart data chronologically when API entries are newest first', () => {
    const data = groupByPeriod(
      [
        entry('2026-06-12T10:00:00.000Z', 12),
        entry('2026-06-10T10:00:00.000Z', 10),
        entry('2026-06-08T10:00:00.000Z', 8),
      ],
      'month',
      new Date('2026-06-12T12:00:00.000Z'),
    )

    expect(data).toEqual([
      { label: '8 Jun', footprint: 8 },
      { label: '10 Jun', footprint: 10 },
      { label: '12 Jun', footprint: 12 },
    ])
  })

  it('orders yearly chart data by month', () => {
    const data = groupByPeriod(
      [
        entry('2026-06-12T10:00:00.000Z', 12),
        entry('2026-04-12T10:00:00.000Z', 4),
        entry('2026-05-12T10:00:00.000Z', 5),
      ],
      'year',
      new Date('2026-06-12T12:00:00.000Z'),
    )

    expect(data).toEqual([
      { label: 'Apr', footprint: 4 },
      { label: 'May', footprint: 5 },
      { label: 'Jun', footprint: 12 },
    ])
  })
})
