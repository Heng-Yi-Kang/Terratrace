'use client'

import { useQuery } from '@tanstack/react-query'

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

export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async (): Promise<Place[]> => {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
      const response = await fetch(`${baseUrl}/api/locations`)
      if (!response.ok) {
        throw new Error('Failed to fetch destinations from backend')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
