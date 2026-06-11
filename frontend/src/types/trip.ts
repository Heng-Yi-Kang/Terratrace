export type TripStatus = 'upcoming' | 'completed' | 'all'
export type EcoScoreFilter = 'all' | 'high' | 'medium'
export type PersistedTripStatus = Exclude<TripStatus, 'all'>
export type TripSource = 'manual' | 'recommendation' | 'local-import'
export type DayPart = 'morning' | 'afternoon' | 'evening' | 'flexible'

export interface RecommendationItem {
  candidateId: string
  title: string
  category: string
  estimatedCost: number
  rationale: string
  weatherAlternative: string
  communityImpact: string
}

export interface SavedTripFromRecommendation {
  id: string
  destination: string
  dates: string
  ecoScore: number
  status: 'upcoming' | 'completed'
  imageColor: string
  savedFromRecommendation: true
  requestId: string
  budget: number
  interests: string[]
  weatherCondition: string
  totalEstimatedCost: number
  recommendations: RecommendationItem[]
  createdAt: string
}

export interface TripItem {
  id?: string
  tripId?: string
  locationId?: string | null
  tripDate: string
  dayPart: DayPart
  title: string
  category: string
  estimatedCost?: number | null
  rationale?: string | null
  weatherAlternative?: string | null
  communityImpact?: string | null
  sortOrder: number
  place?: {
    publicId: string
    name?: string | null
    category?: string | null
    city?: string | null
  } | null
}

export interface Trip {
  id: string
  destination: string
  startDate: string
  endDate: string
  budget?: number | null
  interests: string[]
  ecoScore: number
  status: PersistedTripStatus
  source: TripSource
  sourceRequestId?: string | null
  weatherCondition?: string | null
  totalEstimatedCost?: number | null
  createdAt: string
  updatedAt: string
  items: TripItem[]
}

export type TripPayload = Omit<Trip, 'id' | 'createdAt' | 'updatedAt' | 'items'> & {
  items: TripItem[]
}
