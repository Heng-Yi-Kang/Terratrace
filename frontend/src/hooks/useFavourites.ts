'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/utils/supabase/client'
import { useUser } from './useUser'
import { Place } from './useLocations'
import { useState, useEffect } from 'react'

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
  const [localFavourites, setLocalFavourites] = useState<Place[]>([])
  const queryClient = useQueryClient()

  // Listen to local changes
  useEffect(() => {
    if (!user) {
      const updateLocal = () => {
        const stored = localStorage.getItem(LOCAL_FAVOURITES_KEY)
        if (stored) {
          try {
            setLocalFavourites(JSON.parse(stored))
          } catch (e) {
            console.error(e)
          }
        } else {
          setLocalFavourites([])
        }
      }
      updateLocal()

      // Set up simple listener for React Query queryClient invalidations on 'local' key
      const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
        if (event?.type === 'updated' && event?.query?.queryKey?.includes('local')) {
          updateLocal()
        }
      })
      return () => unsubscribe()
    }
  }, [user, queryClient])

  const dbQuery = useQuery({
    queryKey: ['favourites', user?.id],
    queryFn: async (): Promise<Place[]> => {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
      return fetchWithAuth(`${baseUrl}/api/favourites`)
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  return {
    data: user ? (dbQuery.data ?? []) : localFavourites,
    isLoading: user ? dbQuery.isLoading : false,
    isError: user ? dbQuery.isError : false,
    error: user ? dbQuery.error : null,
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
              for (const place of list) {
                await fetchWithAuth(`${baseUrl}/api/favourites`, {
                  method: 'POST',
                  body: JSON.stringify({ locationId: place.id }),
                }).catch(e => console.error('Error syncing local favorite:', e))
              }
              localStorage.removeItem(LOCAL_FAVOURITES_KEY)
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
