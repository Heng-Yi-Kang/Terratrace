'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCurrentUser, deleteAccount as deleteAccountApi } from '@/utils/supabase/auth'
import { supabase } from '@/utils/supabase/client'

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
      const { data, error } = await supabase.auth.updateUser({ data: metadata })
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
    mutationFn: async ({ email, currentPassword, newPassword }: { email: string; currentPassword: string; newPassword: string }) => {
      // Re-authenticate
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      })
      if (signInError) throw signInError

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })
      if (updateError) throw updateError
      return { success: true }
    },
  })
}
