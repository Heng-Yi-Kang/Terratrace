import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import SignupPage from './page'
import * as auth from '@/utils/supabase/auth'

const mockPush = vi.fn()
const mockRefresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}))

vi.mock('@/utils/supabase/auth', () => ({
  signUp: vi.fn(),
  getRedirectPath: vi.fn(),
}))

function renderWithQueryClient(ui: ReactNode, queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })) {
  return {
    queryClient,
    ...render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>),
  }
}

describe('SignupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('creates a user account and navigates to the dashboard', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const clearSpy = vi.spyOn(queryClient, 'clear')
    const user = { id: 'user-2', email: 'traveler@example.com', role: 'user', user_metadata: { role: 'user', username: 'traveler' } }
    vi.mocked(auth.signUp).mockResolvedValue({ data: { user }, error: null })
    vi.mocked(auth.getRedirectPath).mockResolvedValue('/dashboard')

    renderWithQueryClient(<SignupPage />, queryClient)
    await userEvent.type(screen.getByLabelText(/username/i), 'traveler')
    await userEvent.type(screen.getByLabelText(/email/i), 'traveler@example.com')
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123')
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(auth.signUp).toHaveBeenCalledWith('traveler@example.com', 'password123', 'traveler')
      expect(clearSpy).toHaveBeenCalledOnce()
      expect(queryClient.getQueryData(['user'])).toEqual(user)
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('shows signup API errors and stays on the page', async () => {
    vi.mocked(auth.signUp).mockResolvedValue({
      data: null,
      error: { message: 'An account with this email already exists' },
    })

    renderWithQueryClient(<SignupPage />)
    await userEvent.type(screen.getByLabelText(/username/i), 'traveler')
    await userEvent.type(screen.getByLabelText(/email/i), 'taken@example.com')
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123')
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }))

    expect(await screen.findByText(/account with this email already exists/i)).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })
})
