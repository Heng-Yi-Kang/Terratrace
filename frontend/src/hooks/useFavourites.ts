'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/utils/supabase/client'
import { useUser } from './useUser'
import { Place } from './useLocations'
import { useEffect } from 'react'

const LOCAL_FAVOURITES_KEY = 'terratrace_local_favourites'

// Helper for HTTP requests
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const response = await fetch(url, { ...options, headers })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `HTTP error! Status: ${response.status}`)
  }
  return response.json()
}

export function useFavourites() {
  const { data: user } = useUser()

  const dbQuery = useQuery({
    queryKey: ['favourites', user?.id],
    queryFn: async (): Promise<Place[]> => {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
      return fetchWithAuth(`${baseUrl}/api/favourites`)
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  const localQuery = useQuery({
    queryKey: ['favourites', 'local'],
    queryFn: async (): Promise<Place[]> => {
      if (typeof window === 'undefined') return []
      const stored = localStorage.getItem(LOCAL_FAVOURITES_KEY)
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch (e) {
          console.error(e)
        }
      }
      return []
    },
    enabled: !user,
    initialData: [],
  })

  return {
    data: user ? (dbQuery.data ?? []) : (localQuery.data ?? []),
    isLoading: user ? dbQuery.isLoading : localQuery.isLoading,
    isError: user ? dbQuery.isError : localQuery.isError,
    error: user ? dbQuery.error : localQuery.error,
    isLocal: !user,
  }
}

export function useAddFavourite() {
  const queryClient = useQueryClient()
  const { data: user } = useUser()

  return useMutation({
    mutationFn: async (place: Place) => {
      if (user) {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
        return fetchWithAuth(`${baseUrl}/api/favourites`, {
          method: 'POST',
          body: JSON.stringify({ locationId: place.id }),
        })
      } else {
        const stored = localStorage.getItem(LOCAL_FAVOURITES_KEY)
        let list: Place[] = stored ? JSON.parse(stored) : []
        if (!list.some(p => p.id === place.id)) {
          list.push(place)
          localStorage.setItem(LOCAL_FAVOURITES_KEY, JSON.stringify(list))
        }
        return place
      }
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['favourites', user.id] })
      } else {
        queryClient.invalidateQueries({ queryKey: ['favourites', 'local'] })
      }
    },
  })
}

export function useRemoveFavourite() {
  const queryClient = useQueryClient()
  const { data: user } = useUser()

  return useMutation({
    mutationFn: async (locationId: string) => {
      if (user) {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
        return fetchWithAuth(`${baseUrl}/api/favourites/${locationId}`, {
          method: 'DELETE',
        })
      } else {
        const stored = localStorage.getItem(LOCAL_FAVOURITES_KEY)
        if (stored) {
          let list: Place[] = JSON.parse(stored)
          list = list.filter(p => p.id !== locationId)
          localStorage.setItem(LOCAL_FAVOURITES_KEY, JSON.stringify(list))
        }
        return { success: true }
      }
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['favourites', user.id] })
      } else {
        queryClient.invalidateQueries({ queryKey: ['favourites', 'local'] })
      }
    },
  })
}

export function useSyncFavourites() {
  const { data: user } = useUser()
  const queryClient = useQueryClient()

  useEffect(() => {
    const sync = async () => {
      if (user) {
        const stored = localStorage.getItem(LOCAL_FAVOURITES_KEY)
        if (stored) {
          try {
            const list: Place[] = JSON.parse(stored)
            if (list.length > 0) {
              const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
              const failed: Place[] = []
              for (const place of list) {
                try {
                  await fetchWithAuth(`${baseUrl}/api/favourites`, {
                    method: 'POST',
                    body: JSON.stringify({ locationId: place.id }),
                  })
                } catch (e) {
                  console.error('Error syncing local favorite:', e)
                  failed.push(place)
                }
              }
              if (failed.length > 0) {
                localStorage.setItem(LOCAL_FAVOURITES_KEY, JSON.stringify(failed))
              } else {
                localStorage.removeItem(LOCAL_FAVOURITES_KEY)
              }
              queryClient.invalidateQueries({ queryKey: ['favourites', user.id] })
            }
          } catch (e) {
            console.error('Error syncing favourites:', e)
          }
        }
      }
    }
    sync()
  }, [user, queryClient])
}

