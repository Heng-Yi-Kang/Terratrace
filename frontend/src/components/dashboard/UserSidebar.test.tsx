import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

describe('UserSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(signOut).mockResolvedValue({ error: null })
  })

  afterEach(() => {
    cleanup()
  })

  it('signs out and redirects to login when Sign Out is clicked', async () => {
    render(<UserSidebar />)

    await userEvent.click(screen.getByRole('button', { name: /sign out/i }))

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledOnce()
      expect(mockPush).toHaveBeenCalledWith('/login')
      expect(mockRefresh).toHaveBeenCalledOnce()
    })
  })
})
