'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

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
      const response = await fetch(`${API}/api/todos`, { credentials: 'include' })
      if (!response.ok) throw new Error('Failed to load todos')
      return response.json()
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useCreateTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch(`${API}/api/todos`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!response.ok) throw new Error('Failed to create todo')
      return response.json()
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
      const response = await fetch(`${API}/api/todos/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isComplete }),
      })
      if (!response.ok) throw new Error('Failed to update todo')
      return response.json()
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
      const response = await fetch(`${API}/api/todos/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!response.ok) throw new Error('Failed to delete todo')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}
