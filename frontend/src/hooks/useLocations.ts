'use client'

import { useQuery } from '@tanstack/react-query'
import { buildLocationsUrl, LocationFilters, normalizeLocationFilters } from '@/utils/locationFilters'

export type Place = {
  id: string
  name: string
  category: 'Transport' | 'Dining' | 'Accommodation'
  city?: string
  lat: number
  long: number
  ecoCerts: string[]
  bookingUrl?: string
  imageUrl?: string
  publicId: string
}

export function useLocations(filters: LocationFilters = {}) {
  const normalizedFilters = normalizeLocationFilters(filters)

  return useQuery({
    queryKey: ['locations', normalizedFilters],
    queryFn: async (): Promise<Place[]> => {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      if (!baseUrl) throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured')
      const response = await fetch(buildLocationsUrl(baseUrl, normalizedFilters))
      if (!response.ok) {
        throw new Error('Failed to fetch destinations from backend')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useLocationCities() {
  return useQuery({
    queryKey: ['locations', 'cities'],
    queryFn: async (): Promise<string[]> => {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
      if (!baseUrl) throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured')
      const response = await fetch(`${baseUrl}/api/locations/cities`)
      if (!response.ok) {
        throw new Error('Failed to fetch destination cities from backend')
      }
      return response.json()
    },
    staleTime: 10 * 60 * 1000,
  })
}
