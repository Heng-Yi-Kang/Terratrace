import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import UserSidebar from './UserSidebar'
import { signOut } from '@/utils/supabase/auth'

const mockPush = vi.fn()
const mockRefresh = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/overview',
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}))

vi.mock('@/utils/supabase/auth', () => ({
  signOut: vi.fn(),
}))

vi.mock('@/hooks/useUser', () => ({
  useUser: () => ({
    data: {
      id: 'user-1',
      email: 'traveler@example.com',
      user_metadata: { username: 'traveler', role: 'user' },
    },
  }),
}))

vi.mock('@/hooks/useTrips', () => ({
  useTrips: () => ({ data: [] }),
  useImportLocalTrips: vi.fn(),
}))

function renderWithQueryClient(ui: ReactNode, queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })) {
  return {
    queryClient,
    ...render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>),
  }
}

describe('UserSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(signOut).mockResolvedValue({ data: {}, error: null })
  })

  afterEach(() => {
    cleanup()
  })

  it('signs out and redirects to login when Sign Out is clicked', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const clearSpy = vi.spyOn(queryClient, 'clear')

    renderWithQueryClient(<UserSidebar />, queryClient)

    await userEvent.click(screen.getByRole('button', { name: /sign out/i }))

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledOnce()
      expect(clearSpy).toHaveBeenCalledOnce()
      expect(mockPush).toHaveBeenCalledWith('/login')
      expect(mockRefresh).toHaveBeenCalledOnce()
    })
  })
})
