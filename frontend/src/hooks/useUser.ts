'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  changePassword,
  deleteAccount as deleteAccountApi,
  getCurrentUser,
  updateCurrentUser,
} from '@/utils/supabase/auth'

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await getCurrentUser()
      return data.user
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (metadata: Record<string, unknown>) => {
      const { data, error } = await updateCurrentUser(metadata)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { error } = await deleteAccountApi()
      if (error) throw error
      return { success: true }
    },
    onSuccess: () => {
      queryClient.clear()
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { email: string; currentPassword: string; newPassword: string }) => {
      const { error } = await changePassword(currentPassword, newPassword)
      if (error) throw error
      return { success: true }
    },
  })
}
