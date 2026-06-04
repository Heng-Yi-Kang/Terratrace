import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  describe('Success State', () => {
    it('navigates to dashboard on successful login', async () => {
      vi.mocked(supabaseAuth.signIn).mockResolvedValue({ error: null })
      vi.mocked(supabaseAuth.getRedirectPath).mockResolvedValue('/dashboard')

      render(<LoginPage />)
      await userEvent.type(screen.getByLabelText(/email/i), 'valid@test.com')
      await userEvent.type(screen.getByLabelText(/password/i), 'password123')
      await userEvent.click(screen.getByRole('button', { name: /log in/i }))

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
        expect(mockRefresh).toHaveBeenCalled()
      })
    })
  })

  describe('Error State', () => {
    it('displays error message on failed login', async () => {
      vi.mocked(supabaseAuth.signIn).mockResolvedValue({
        error: { message: 'Invalid login credentials' },
      })

      render(<LoginPage />)
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
      render(<LoginPage />)
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
    })

    it('has email and password inputs', () => {
      render(<LoginPage />)
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    })

    it('has login button', () => {
      render(<LoginPage />)
      expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
    })

    it('has link to signup page', () => {
      render(<LoginPage />)
      const signupLink = screen.getByRole('link', { name: /sign up/i })
      expect(signupLink).toHaveAttribute('href', '/signup')
    })
  })
})
