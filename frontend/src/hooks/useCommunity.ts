'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

export type CommunityReview = {
  id: string
  userId?: string | null
  locationId?: string | null
  location: string
  city?: string | null
  country?: string | null
  category: string
  rating: number
  title: string
  body: string
  practices: string[]
  reviewer: string
  reviewerInitials: string
  createdAt: string
  helpful: number
  verified: boolean
  color: string
  viewerMarkedHelpful: boolean
  viewerCanEdit: boolean
}

export type CommunityChallenge = {
  id: string
  slug: string
  title: string
  description: string
  reward: string
  points: number
  badge: string
  badgeColor: string
  badgeIcon: string
  category: 'Active' | 'Featured' | 'Streak'
  progress: number
  total: number
  unit: string
  participants: number
  daysLeft: number | null
  joinedAt?: string | null
  completedAt?: string | null
}

export type CommunityBadge = {
  id: string
  name: string
  icon: string
  color: string
  earned: boolean
  earnedAt?: string | null
}

export type CommunityLeader = {
  id: string
  rank: number
  name: string
  points: number
  badges: number
  you: boolean
}

export type CommunitySummary = {
  points: number
  earnedBadges: number
  reviewCount: number
  activeChallengeCount: number
  badgesEarnedCount: number
  verifiedRatingPercentage: number
}

export type ReviewInput = {
  location: string
  city?: string
  country?: string
  category: string
  rating: number
  title: string
  body: string
  practices: string[]
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || `Request failed with status ${response.status}`)
  }
  return response.json()
}

export function useCommunityReviews(category = 'All') {
  return useQuery({
    queryKey: ['community', 'reviews', category],
    queryFn: () => {
      const params = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : ''
      return apiFetch<CommunityReview[]>(`/api/community/reviews${params}`)
    },
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateCommunityReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: ReviewInput) =>
      apiFetch<CommunityReview>('/api/community/reviews', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'reviews'] })
      queryClient.invalidateQueries({ queryKey: ['community', 'challenges'] })
      queryClient.invalidateQueries({ queryKey: ['community', 'summary'] })
    },
  })
}

export function useUpdateCommunityReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Pick<ReviewInput, 'rating' | 'title' | 'body' | 'practices'> }) =>
      apiFetch<CommunityReview>(`/api/community/reviews/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'reviews'] })
    },
  })
}

export function useToggleReviewHelpful() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, marked }: { id: string; marked: boolean }) =>
      apiFetch<CommunityReview>(`/api/community/reviews/${id}/helpful`, {
        method: marked ? 'DELETE' : 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'reviews'] })
    },
  })
}

export function useCommunityChallenges() {
  return useQuery({
    queryKey: ['community', 'challenges'],
    queryFn: () => apiFetch<CommunityChallenge[]>('/api/community/challenges'),
    staleTime: 2 * 60 * 1000,
  })
}

export function useJoinCommunityChallenge() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ success: true }>(`/api/community/challenges/${id}/join`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'challenges'] })
    },
  })
}

export function useUpdateCommunityChallengeProgress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, progress }: { id: string; progress: number }) =>
      apiFetch<{ progress: number; completedAt?: string | null }>(`/api/community/challenges/${id}/progress`, {
        method: 'PATCH',
        body: JSON.stringify({ progress }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'challenges'] })
      queryClient.invalidateQueries({ queryKey: ['community', 'badges'] })
      queryClient.invalidateQueries({ queryKey: ['community', 'leaderboard'] })
      queryClient.invalidateQueries({ queryKey: ['community', 'summary'] })
    },
  })
}

export function useCommunityBadges() {
  return useQuery({
    queryKey: ['community', 'badges'],
    queryFn: () => apiFetch<CommunityBadge[]>('/api/community/badges'),
    staleTime: 2 * 60 * 1000,
  })
}

export function useCommunityLeaderboard() {
  return useQuery({
    queryKey: ['community', 'leaderboard'],
    queryFn: () => apiFetch<CommunityLeader[]>('/api/community/leaderboard'),
    staleTime: 2 * 60 * 1000,
  })
}

export function useCommunitySummary() {
  return useQuery({
    queryKey: ['community', 'summary'],
    queryFn: () => apiFetch<CommunitySummary>('/api/community/summary'),
    staleTime: 2 * 60 * 1000,
  })
}
