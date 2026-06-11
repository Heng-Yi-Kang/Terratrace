import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { server } from '../test/mocks/server'
import {
  useCommunityBadges,
  useCommunityChallenges,
  useCommunityLeaderboard,
  useCommunityReviews,
  useCommunitySummary,
  useCreateCommunityReview,
  useJoinCommunityChallenge,
  useToggleReviewHelpful,
  useUpdateCommunityChallengeProgress,
} from './useCommunity'

const API = 'http://localhost:3001'

function createWrapper(queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useCommunity hooks', () => {
  beforeEach(() => {
    server.use(
      http.get(`${API}/api/community/reviews`, () =>
        HttpResponse.json([
          {
            id: 'review-1',
            location: 'Eco Lodge',
            category: 'Eco-Lodge',
            rating: 5,
            reviewer: 'Traveler',
            reviewerInitials: 'TT',
            createdAt: new Date().toISOString(),
            title: 'Excellent',
            body: 'Visible sustainability practices.',
            practices: ['Solar'],
            helpful: 2,
            verified: true,
            color: '#059669',
            viewerMarkedHelpful: false,
            viewerCanEdit: false,
          },
        ]),
      ),
      http.post(`${API}/api/community/reviews`, async ({ request }) => {
        const body = (await request.json()) as any
        return HttpResponse.json({ id: 'review-2', ...body, helpful: 0 }, { status: 201 })
      }),
      http.post(`${API}/api/community/reviews/:id/helpful`, ({ params }) =>
        HttpResponse.json({ id: params.id, helpful: 3, viewerMarkedHelpful: true }),
      ),
      http.delete(`${API}/api/community/reviews/:id/helpful`, ({ params }) =>
        HttpResponse.json({ id: params.id, helpful: 2, viewerMarkedHelpful: false }),
      ),
      http.get(`${API}/api/community/challenges`, () =>
        HttpResponse.json([
          {
            id: 'challenge-1',
            slug: 'low-carbon-week',
            title: 'Low Carbon Week',
            description: 'Keep emissions low.',
            reward: 'Carbon Crusher Badge',
            points: 500,
            badge: 'Carbon Crusher',
            badgeColor: '#059669',
            badgeIcon: 'leaf',
            category: 'Active',
            progress: 0,
            total: 7,
            unit: 'days',
            participants: 4,
            daysLeft: 2,
            joinedAt: null,
            completedAt: null,
          },
        ]),
      ),
      http.post(`${API}/api/community/challenges/:id/join`, () => HttpResponse.json({ success: true })),
      http.patch(`${API}/api/community/challenges/:id/progress`, async ({ request }) => {
        const body = (await request.json()) as any
        return HttpResponse.json({ progress: body.progress, completedAt: null })
      }),
      http.get(`${API}/api/community/badges`, () =>
        HttpResponse.json([{ id: 'badge-1', name: 'Carbon Crusher', icon: 'leaf', color: '#059669', earned: false }]),
      ),
      http.get(`${API}/api/community/leaderboard`, () =>
        HttpResponse.json([{ id: 'user-1', rank: 1, name: 'Traveler', points: 500, badges: 1, you: true }]),
      ),
      http.get(`${API}/api/community/summary`, () =>
        HttpResponse.json({
          points: 500,
          earnedBadges: 1,
          reviewCount: 12,
          activeChallengeCount: 3,
          badgesEarnedCount: 8,
          verifiedRatingPercentage: 75,
        }),
      ),
    )
  })

  it('loads public community data', async () => {
    const { result: reviews } = renderHook(() => useCommunityReviews(), { wrapper: createWrapper() })
    const { result: challenges } = renderHook(() => useCommunityChallenges(), { wrapper: createWrapper() })
    const { result: badges } = renderHook(() => useCommunityBadges(), { wrapper: createWrapper() })
    const { result: leaders } = renderHook(() => useCommunityLeaderboard(), { wrapper: createWrapper() })
    const { result: summary } = renderHook(() => useCommunitySummary(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(reviews.current.data?.[0].location).toBe('Eco Lodge')
      expect(challenges.current.data?.[0].title).toBe('Low Carbon Week')
      expect(badges.current.data?.[0].name).toBe('Carbon Crusher')
      expect(leaders.current.data?.[0].you).toBe(true)
      expect(summary.current.data).toMatchObject({
        reviewCount: 12,
        activeChallengeCount: 3,
        badgesEarnedCount: 8,
        verifiedRatingPercentage: 75,
      })
    })
  })

  it('creates a review and invalidates review/challenge data', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCreateCommunityReview(), { wrapper: createWrapper(queryClient) })

    await result.current.mutateAsync({
      location: 'New Lodge',
      category: 'Eco-Lodge',
      rating: 5,
      title: 'Strong impact',
      body: 'Great local hiring.',
      practices: ['Local Hiring'],
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['community', 'reviews'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['community', 'challenges'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['community', 'summary'] })
  })

  it('toggles helpful votes', async () => {
    const { result } = renderHook(() => useToggleReviewHelpful(), { wrapper: createWrapper() })

    await expect(result.current.mutateAsync({ id: 'review-1', marked: false })).resolves.toMatchObject({
      helpful: 3,
      viewerMarkedHelpful: true,
    })
    await expect(result.current.mutateAsync({ id: 'review-1', marked: true })).resolves.toMatchObject({
      helpful: 2,
      viewerMarkedHelpful: false,
    })
  })

  it('joins challenges and updates progress', async () => {
    const { result: join } = renderHook(() => useJoinCommunityChallenge(), { wrapper: createWrapper() })
    const { result: progress } = renderHook(() => useUpdateCommunityChallengeProgress(), { wrapper: createWrapper() })

    await expect(join.current.mutateAsync('challenge-1')).resolves.toEqual({ success: true })
    await expect(progress.current.mutateAsync({ id: 'challenge-1', progress: 1 })).resolves.toMatchObject({
      progress: 1,
    })
  })
})
