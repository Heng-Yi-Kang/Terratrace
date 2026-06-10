'use client'

import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useUser } from './useUser'
import type { DayPart, SavedTripFromRecommendation, Trip, TripItem, TripPayload } from '@/types/trip'

const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
const LOCAL_TRIPS_KEY = 'terratrace_saved_trips'
const syncingLocalTripsForUsers = new Set<string>()

type ImportResponse = {
  imported: Trip[]
  failed: TripPayload[]
}

async function fetchJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(body.error || 'Request failed')
  }

  return body as T
}

function parseLegacyDateRange(dates: string): { startDate: string; endDate: string } {
  const currentYear = new Date().getFullYear()
  const match = dates.match(/^([A-Za-z]{3})\s+(\d{1,2})\s+-\s+([A-Za-z]{3})?\s*(\d{1,2}),\s*(\d{4})$/)

  if (!match) {
    const today = new Date().toISOString().slice(0, 10)
    return { startDate: today, endDate: today }
  }

  const [, startMonth, startDay, maybeEndMonth, endDay, yearValue] = match
  const year = Number(yearValue || currentYear)
  const endMonth = maybeEndMonth || startMonth
  const start = new Date(`${startMonth} ${startDay}, ${year}`)
  const end = new Date(`${endMonth} ${endDay}, ${year}`)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    const today = new Date().toISOString().slice(0, 10)
    return { startDate: today, endDate: today }
  }

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  }
}

function recommendationItemsToTripItems(items: SavedTripFromRecommendation['recommendations'], startDate: string): TripItem[] {
  return items.map((item, index) => ({
    tripDate: startDate,
    dayPart: 'flexible' as DayPart,
    title: item.title,
    category: item.category,
    estimatedCost: item.estimatedCost,
    rationale: item.rationale,
    weatherAlternative: item.weatherAlternative,
    communityImpact: item.communityImpact,
    sortOrder: index,
  }))
}

function isTripPayload(value: unknown): value is TripPayload {
  const trip = value as TripPayload
  return Boolean(trip?.destination && trip?.startDate && trip?.endDate && Array.isArray(trip?.items))
}

export function localTripToPayload(trip: SavedTripFromRecommendation | TripPayload): TripPayload {
  if (isTripPayload(trip)) return trip

  const { startDate, endDate } = parseLegacyDateRange(trip.dates)

  return {
    destination: trip.destination,
    startDate,
    endDate,
    budget: trip.budget,
    interests: trip.interests,
    ecoScore: trip.ecoScore,
    status: trip.status,
    source: 'recommendation',
    sourceRequestId: trip.requestId || trip.id,
    weatherCondition: trip.weatherCondition,
    totalEstimatedCost: trip.totalEstimatedCost,
    items: recommendationItemsToTripItems(trip.recommendations, startDate),
  }
}

export function recommendationTripToPayload(args: {
  destination: string
  startDate: string
  endDate: string
  budget: number
  interests: string[]
  ecoScore: number
  requestId: string
  weatherCondition: string
  totalEstimatedCost: number
  recommendations: SavedTripFromRecommendation['recommendations']
}): TripPayload {
  return {
    destination: args.destination,
    startDate: args.startDate,
    endDate: args.endDate,
    budget: args.budget,
    interests: args.interests,
    ecoScore: args.ecoScore,
    status: args.endDate < new Date().toISOString().slice(0, 10) ? 'completed' : 'upcoming',
    source: 'recommendation',
    sourceRequestId: args.requestId,
    weatherCondition: args.weatherCondition,
    totalEstimatedCost: args.totalEstimatedCost,
    items: recommendationItemsToTripItems(args.recommendations, args.startDate),
  }
}

export function useTrips() {
  const { data: user } = useUser()

  return useQuery({
    queryKey: ['trips', user?.id],
    queryFn: () => fetchJson<Trip[]>('/api/trips'),
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateTrip() {
  const queryClient = useQueryClient()
  const { data: user } = useUser()

  return useMutation({
    mutationFn: (trip: TripPayload) => fetchJson<Trip>('/api/trips', {
      method: 'POST',
      body: JSON.stringify(trip),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', user?.id] })
    },
  })
}

export function useUpdateTrip() {
  const queryClient = useQueryClient()
  const { data: user } = useUser()

  return useMutation({
    mutationFn: ({ id, trip }: { id: string; trip: Partial<TripPayload> }) => fetchJson<Trip>(`/api/trips/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(trip),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', user?.id] })
    },
  })
}

export function useDeleteTrip() {
  const queryClient = useQueryClient()
  const { data: user } = useUser()

  return useMutation({
    mutationFn: (id: string) => fetchJson<{ success: true }>(`/api/trips/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', user?.id] })
    },
  })
}

export function useImportLocalTrips() {
  const queryClient = useQueryClient()
  const { data: user } = useUser()

  useEffect(() => {
    const sync = async () => {
      if (!user || typeof window === 'undefined') return
      if (syncingLocalTripsForUsers.has(user.id)) return

      const stored = localStorage.getItem(LOCAL_TRIPS_KEY)
      if (!stored) return

      try {
        syncingLocalTripsForUsers.add(user.id)
        const localTrips = JSON.parse(stored) as Array<SavedTripFromRecommendation | TripPayload>
        const payloads = localTrips.map(localTripToPayload)
        if (payloads.length === 0) return

        const result = await fetchJson<ImportResponse>('/api/trips/import-local', {
          method: 'POST',
          body: JSON.stringify({ trips: payloads }),
        })

        if (result.failed.length > 0) {
          localStorage.setItem(LOCAL_TRIPS_KEY, JSON.stringify(result.failed))
        } else {
          localStorage.removeItem(LOCAL_TRIPS_KEY)
        }

        queryClient.invalidateQueries({ queryKey: ['trips', user.id] })
      } catch (error) {
        console.error('Error syncing local trips:', error)
      } finally {
        syncingLocalTripsForUsers.delete(user.id)
      }
    }

    sync()
  }, [queryClient, user])
}
