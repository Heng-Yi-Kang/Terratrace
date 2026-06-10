import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, cleanup } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useFavourites, useAddFavourite, useRemoveFavourite, useSyncFavourites } from './useFavourites'
import { useUser } from './useUser'
import { server } from '../test/mocks/server'
import { http, HttpResponse } from 'msw'
import React from 'react'

vi.mock('./useUser', () => ({
  useUser: vi.fn(),
}))

vi.mock('@/utils/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: {
            access_token: 'mock-token',
          },
        },
      }),
    },
  },
}))

describe('useFavourites Hooks', () => {
  let queryClient: QueryClient
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
  })

  afterEach(() => {
    cleanup()
  })

  describe('useFavourites', () => {
    it('returns empty array when logged out and localStorage is empty', async () => {
      vi.mocked(useUser).mockReturnValue({ data: null } as any)
      const { result } = renderHook(() => useFavourites(), { wrapper })
      
      await waitFor(() => {
        expect(result.current.data).toEqual([])
        expect(result.current.isLocal).toBe(true)
      })
    })

    it('returns localStorage items when logged out', async () => {
      vi.mocked(useUser).mockReturnValue({ data: null } as any)
      const items = [{ id: '1', name: 'Place 1' }]
      localStorage.setItem('terratrace_local_favourites', JSON.stringify(items))

      const { result } = renderHook(() => useFavourites(), { wrapper })

      await waitFor(() => {
        expect(result.current.data).toEqual(items)
        expect(result.current.isLocal).toBe(true)
      })
    })

    it('updates data when new local favourite is added', async () => {
      vi.mocked(useUser).mockReturnValue({ data: null } as any)
      
      const { result } = renderHook(() => useFavourites(), { wrapper })
      
      expect(result.current.data).toEqual([])

      const { result: addResult } = renderHook(() => useAddFavourite(), { wrapper })
      
      await addResult.current.mutateAsync({ id: '1', name: 'Place 1' } as any)

      await waitFor(() => {
        expect(result.current.data).toEqual([{ id: '1', name: 'Place 1' }])
      })
    })
  })

  describe('useSyncFavourites', () => {
    it('does nothing if user is logged out', async () => {
      vi.mocked(useUser).mockReturnValue({ data: null } as any)
      localStorage.setItem(
        'terratrace_local_favourites',
        JSON.stringify([{ id: '1', name: 'Place 1' }])
      )

      renderHook(() => useSyncFavourites(), { wrapper })

      expect(localStorage.getItem('terratrace_local_favourites')).toBe(
        JSON.stringify([{ id: '1', name: 'Place 1' }])
      )
    })

    it('syncs all favorites successfully and clears local storage', async () => {
      vi.mocked(useUser).mockReturnValue({ data: { id: 'user-123' } } as any)
      localStorage.setItem(
        'terratrace_local_favourites',
        JSON.stringify([
          { id: '1', name: 'Place 1' },
          { id: '2', name: 'Place 2' },
        ])
      )

      let callCount = 0
      server.use(
        http.post('http://localhost:3001/api/favourites', async () => {
          callCount++
          return HttpResponse.json({ success: true })
        })
      )

      renderHook(() => useSyncFavourites(), { wrapper })

      await waitFor(() => {
        expect(localStorage.getItem('terratrace_local_favourites')).toBeNull()
      })

      expect(callCount).toBe(2)
    })

    it('retains only the failed favorites in local storage when some uploads fail', async () => {
      vi.mocked(useUser).mockReturnValue({ data: { id: 'user-123' } } as any)
      const place1 = { id: '1', name: 'Place 1' }
      const place2 = { id: '2', name: 'Place 2' }
      localStorage.setItem(
        'terratrace_local_favourites',
        JSON.stringify([place1, place2])
      )

      server.use(
        http.post('http://localhost:3001/api/favourites', () => {
          return HttpResponse.json({ error: 'Database connection error' }, { status: 500 })
        })
      )

      renderHook(() => useSyncFavourites(), { wrapper })

      await waitFor(() => {
        const stored = localStorage.getItem('terratrace_local_favourites')
        expect(stored).not.toBeNull()
        const parsed = JSON.parse(stored!)
        expect(parsed).toHaveLength(2)
      })

      // Reset local storage for next step
      localStorage.setItem(
        'terratrace_local_favourites',
        JSON.stringify([place1, place2])
      )

      server.resetHandlers()
      server.use(
        http.post('http://localhost:3001/api/favourites', async ({ request }) => {
          const body = (await request.json()) as { locationId: string }
          if (body.locationId === '1') {
            return HttpResponse.json({ error: 'Sync failed for 1' }, { status: 500 })
          }
          return HttpResponse.json({ success: true })
        })
      )

      renderHook(() => useSyncFavourites(), { wrapper })

      await waitFor(() => {
        const stored = localStorage.getItem('terratrace_local_favourites')
        expect(stored).toBe(JSON.stringify([place1]))
      })
    })
  })
})
