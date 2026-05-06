'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/utils/supabase/client'

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
}

export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async (): Promise<Place[]> => {
      const { data, error } = await supabase
        .from('locations')
        .select('id,name,category,city,lat,long,eco_certs,image_url,ex_booking_url')

      if (error) throw error

      return (data ?? []).map((row: { id: number; name?: string; category: string; city?: string; lat: number; long: number; eco_certs?: string[]; ex_booking_url?: string; image_url?: string }) => ({
        id: String(row.id),
        name: row.name ?? 'Unnamed',
        category: row.category as 'Transport' | 'Dining' | 'Accommodation',
        city: row.city ?? undefined,
        lat: row.lat,
        long: row.long,
        ecoCerts: Array.isArray(row.eco_certs) ? row.eco_certs : [],
        bookingUrl: row.ex_booking_url ?? undefined,
        imageUrl: row.image_url ?? undefined,
      }))
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
