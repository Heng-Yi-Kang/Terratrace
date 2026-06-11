import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import LoginPage from './page'
import * as supabaseAuth from '@/utils/supabase/auth'

const mockPush = vi.fn()
const mockRefresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}))

vi.mock('@/utils/supabase/auth', () => ({
  signIn: vi.fn(),
  getRedirectPath: vi.fn(),
}))

function renderWithQueryClient(ui: ReactNode, queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })) {
  return {
    queryClient,
    ...render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>),
  }
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  describe('Success State', () => {
    it('navigates to dashboard on successful login', async () => {
      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
      const clearSpy = vi.spyOn(queryClient, 'clear')
      const user = { id: 'user-2', email: 'valid@test.com', role: 'user', user_metadata: { role: 'user', username: 'valid' } }
      vi.mocked(supabaseAuth.signIn).mockResolvedValue({ data: { user }, error: null })
      vi.mocked(supabaseAuth.getRedirectPath).mockResolvedValue('/dashboard')

      renderWithQueryClient(<LoginPage />, queryClient)
      await userEvent.type(screen.getByLabelText(/email/i), 'valid@test.com')
      await userEvent.type(screen.getByLabelText(/password/i), 'password123')
      await userEvent.click(screen.getByRole('button', { name: /log in/i }))

      await waitFor(() => {
        expect(clearSpy).toHaveBeenCalledOnce()
        expect(queryClient.getQueryData(['user'])).toEqual(user)
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
        expect(mockRefresh).toHaveBeenCalled()
      })
    })
  })

  describe('Error State', () => {
    it('displays error message on failed login', async () => {
      vi.mocked(supabaseAuth.signIn).mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' },
      })

      renderWithQueryClient(<LoginPage />)
      await userEvent.type(screen.getByLabelText(/email/i), 'invalid@test.com')
      await userEvent.type(screen.getByLabelText(/password/i), 'wrongpassword')
      await userEvent.click(screen.getByRole('button', { name: /log in/i }))

      await waitFor(() => {
        expect(screen.getByText((content) => content.toLowerCase().includes('invalid'))).toBeInTheDocument()
      })
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('Empty/Validation State', () => {
    it('renders login heading', () => {
      renderWithQueryClient(<LoginPage />)
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
    })

    it('has email and password inputs', () => {
      renderWithQueryClient(<LoginPage />)
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    })

    it('has login button', () => {
      renderWithQueryClient(<LoginPage />)
      expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
    })

    it('has link to signup page', () => {
      renderWithQueryClient(<LoginPage />)
      const signupLink = screen.getByRole('link', { name: /sign up/i })
      expect(signupLink).toHaveAttribute('href', '/signup')
    })
  })
})
