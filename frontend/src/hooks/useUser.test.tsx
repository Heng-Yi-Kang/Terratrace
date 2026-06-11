import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useChangePassword, useDeleteAccount, useUpdateUser, useUser } from './useUser'
import * as auth from '@/utils/supabase/auth'

vi.mock('@/utils/supabase/auth', () => ({
  changePassword: vi.fn(),
  deleteAccount: vi.fn(),
  getCurrentUser: vi.fn(),
  updateCurrentUser: vi.fn(),
}))

function createWrapper(queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useUser hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches the current user', async () => {
    const user = { id: 'user-1', email: 'test@example.com', user_metadata: { role: 'user', username: 'testuser' } }
    vi.mocked(auth.getCurrentUser).mockResolvedValue({ data: { user: user as any }, error: null })

    const { result } = renderHook(() => useUser(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.data).toEqual(user))
  })

  it('invalidates the user query after profile update', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    vi.mocked(auth.updateCurrentUser).mockResolvedValue({ data: { user: { username: 'updated' } }, error: null })

    const { result } = renderHook(() => useUpdateUser(), { wrapper: createWrapper(queryClient) })
    result.current.mutate({ username: 'updated' })

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['user'] })
    })
  })

  it('clears the query cache after account deletion', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
    const clearSpy = vi.spyOn(queryClient, 'clear')
    vi.mocked(auth.deleteAccount).mockResolvedValue({ success: true })

    const { result } = renderHook(() => useDeleteAccount(), { wrapper: createWrapper(queryClient) })
    result.current.mutate()

    await waitFor(() => expect(clearSpy).toHaveBeenCalled())
  })

  it('propagates password change API errors', async () => {
    vi.mocked(auth.changePassword).mockResolvedValue({ error: { message: 'Current password is incorrect' } })

    const { result } = renderHook(() => useChangePassword(), { wrapper: createWrapper() })

    await expect(result.current.mutateAsync({
      email: 'test@example.com',
      currentPassword: 'wrongpass',
      newPassword: 'newpass123',
    })).rejects.toThrow('Current password is incorrect')
  })
})
