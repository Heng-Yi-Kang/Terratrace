import type { TripInput } from './carbonCalculator'

const PETROL_CAR_KG_PER_KM = 0.16272
const ECONOMY_FLIGHT_KG_PER_KM = 0.10916
const STANDARD_HOTEL_KG_PER_NIGHT = 25

export type AnalyticsPeriod = 'month' | 'year' | 'all'

export type CarbonEntryRow = {
  id: string
  trips: TripInput[] | string
  total_emissions: string | number
  flight_emissions: string | number
  car_emissions: string | number
  hotel_emissions: string | number
  rail_emissions: string | number
  bus_emissions: string | number
  taxi_emissions: string | number
  created_at: string | Date
}

export type AnalyticsBreakdown = {
  method: string
  actualKg: number
  baselineKg: number
  savedKg: number
  count: number
}

export type AnalyticsEntryDetail = {
  id: string
  date: string
  method: string
  actualKg: number
  baselineKg: number
  savedKg: number
}

export type AnalyticsPoint = {
  period: string
  actualKg: number
  baselineKg: number
  savedKg: number
  count: number
}

export type ImpactSummary = {
  actualEmissionsKg: number
  baselineEmissionsKg: number
  carbonSavedKg: number
  treeEquivalent: number
  loggedCalculations: number
  breakdown: AnalyticsBreakdown[]
  overTime: AnalyticsPoint[]
  entries: AnalyticsEntryDetail[]
}

type TripImpact = {
  method: string
  actualKg: number
  baselineKg: number
  savedKg: number
}

function roundKg(value: number): number {
  return Math.round((Number(value) || 0) * 10) / 10
}

function effectiveDistance(trip: Extract<TripInput, { distanceKm: number }>): number {
  if ('isReturn' in trip && trip.isReturn) {
    return trip.distanceKm * 2
  }
  return trip.distanceKm
}

function parseTrips(trips: TripInput[] | string): TripInput[] {
  if (Array.isArray(trips)) return trips
  try {
    const parsed = JSON.parse(trips)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function entryCategoryValue(entry: CarbonEntryRow, method: string): number {
  return Number((entry as any)[`${method}_emissions`] || 0)
}

function calculateTripBaseline(trip: TripInput): number {
  switch (trip.type) {
    case 'flight':
      return effectiveDistance(trip) * ECONOMY_FLIGHT_KG_PER_KM
    case 'hotel':
      return trip.nights * STANDARD_HOTEL_KG_PER_NIGHT
    case 'car':
    case 'rail':
    case 'bus':
    case 'taxi':
      return effectiveDistance(trip) * PETROL_CAR_KG_PER_KM
  }
}

export function calculateTripImpact(trip: TripInput, actualKg: number): TripImpact {
  const baselineKg = calculateTripBaseline(trip)
  return {
    method: trip.type,
    actualKg,
    baselineKg,
    savedKg: Math.max(0, baselineKg - actualKg),
  }
}

function splitEntryImpacts(entry: CarbonEntryRow): TripImpact[] {
  const trips = parseTrips(entry.trips)
  const countsByMethod = trips.reduce<Record<string, number>>((acc, trip) => {
    acc[trip.type] = (acc[trip.type] || 0) + 1
    return acc
  }, {})

  return trips.map((trip) => {
    const methodTotal = entryCategoryValue(entry, trip.type)
    const actualKg = countsByMethod[trip.type] ? methodTotal / countsByMethod[trip.type] : 0
    return calculateTripImpact(trip, actualKg)
  })
}

function dominantMethod(impacts: TripImpact[]): string {
  if (!impacts.length) return 'unknown'
  return impacts.reduce((dominant, current) => (
    current.actualKg > dominant.actualKg ? current : dominant
  )).method
}

function periodKey(date: Date, period: AnalyticsPeriod): string {
  if (period === 'month') {
    return date.toISOString().slice(0, 10)
  }
  if (period === 'year') {
    return date.toISOString().slice(0, 7)
  }
  return date.getUTCFullYear().toString()
}

export function buildImpactSummary(rows: CarbonEntryRow[], period: AnalyticsPeriod): ImpactSummary {
  const breakdownMap = new Map<string, AnalyticsBreakdown>()
  const overTimeMap = new Map<string, AnalyticsPoint>()

  let actualEmissionsKg = 0
  let baselineEmissionsKg = 0
  let carbonSavedKg = 0

  const entries = rows.map((entry) => {
    const actualKg = Number(entry.total_emissions || 0)
    const impacts = splitEntryImpacts(entry)
    const baselineKg = impacts.reduce((sum, impact) => sum + impact.baselineKg, 0)
    const savedKg = Math.max(0, baselineKg - actualKg)
    const date = new Date(entry.created_at)
    const key = periodKey(date, period)

    actualEmissionsKg += actualKg
    baselineEmissionsKg += baselineKg
    carbonSavedKg += savedKg

    for (const impact of impacts) {
      const existing = breakdownMap.get(impact.method) || {
        method: impact.method,
        actualKg: 0,
        baselineKg: 0,
        savedKg: 0,
        count: 0,
      }
      existing.actualKg += impact.actualKg
      existing.baselineKg += impact.baselineKg
      existing.savedKg += impact.savedKg
      existing.count += 1
      breakdownMap.set(impact.method, existing)
    }

    const point = overTimeMap.get(key) || {
      period: key,
      actualKg: 0,
      baselineKg: 0,
      savedKg: 0,
      count: 0,
    }
    point.actualKg += actualKg
    point.baselineKg += baselineKg
    point.savedKg += savedKg
    point.count += 1
    overTimeMap.set(key, point)

    return {
      id: entry.id,
      date: date.toISOString(),
      method: dominantMethod(impacts),
      actualKg: roundKg(actualKg),
      baselineKg: roundKg(baselineKg),
      savedKg: roundKg(savedKg),
    }
  })

  return {
    actualEmissionsKg: roundKg(actualEmissionsKg),
    baselineEmissionsKg: roundKg(baselineEmissionsKg),
    carbonSavedKg: roundKg(carbonSavedKg),
    treeEquivalent: Math.ceil(carbonSavedKg / 22),
    loggedCalculations: rows.length,
    breakdown: Array.from(breakdownMap.values())
      .map((item) => ({
        ...item,
        actualKg: roundKg(item.actualKg),
        baselineKg: roundKg(item.baselineKg),
        savedKg: roundKg(item.savedKg),
      }))
      .sort((a, b) => b.savedKg - a.savedKg),
    overTime: Array.from(overTimeMap.values())
      .map((item) => ({
        ...item,
        actualKg: roundKg(item.actualKg),
        baselineKg: roundKg(item.baselineKg),
        savedKg: roundKg(item.savedKg),
      }))
      .sort((a, b) => a.period.localeCompare(b.period)),
    entries,
  }
}

export function getPeriodStart(period: AnalyticsPeriod, now = new Date()): Date | null {
  if (period === 'all') return null
  if (period === 'year') return new Date(Date.UTC(now.getUTCFullYear(), 0, 1))
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
}

