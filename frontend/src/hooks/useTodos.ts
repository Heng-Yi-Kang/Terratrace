'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/utils/supabase/client'

export type Todo = {
  id: number
  name: string
  isComplete: boolean
  inserted_at: string
}

export function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: async (): Promise<Todo[]> => {
      const { data, error } = await supabase.from('todos').select()

      if (error) throw error
      return data ?? []
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useCreateTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase.from('todos').insert({ name }).select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

export function useToggleTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, isComplete }: { id: number; isComplete: boolean }) => {
      const { data, error } = await supabase
        .from('todos')
        .update({ is_complete: isComplete })
        .eq('id', id)
        .select()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}

export function useDeleteTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('todos').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}
