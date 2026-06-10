export type TripStatus = 'upcoming' | 'completed' | 'all'
export type EcoScoreFilter = 'all' | 'high' | 'medium'

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

export type Trip = SavedTripFromRecommendation
