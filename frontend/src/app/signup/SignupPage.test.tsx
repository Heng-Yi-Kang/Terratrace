import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

describe('SignupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('creates an account and navigates to the role-aware redirect path', async () => {
    vi.mocked(auth.signUp).mockResolvedValue({ data: { user: null }, error: null })
    vi.mocked(auth.getRedirectPath).mockResolvedValue('/admin/dashboard')

    render(<SignupPage />)
    await userEvent.type(screen.getByLabelText(/username/i), 'adminuser')
    await userEvent.type(screen.getByLabelText(/email/i), 'admin@example.com')
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123')
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123')
    await userEvent.selectOptions(screen.getByLabelText(/account type/i), 'admin')
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(auth.signUp).toHaveBeenCalledWith('admin@example.com', 'password123', 'adminuser', 'admin')
      expect(mockPush).toHaveBeenCalledWith('/admin/dashboard')
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('shows signup API errors and stays on the page', async () => {
    vi.mocked(auth.signUp).mockResolvedValue({
      data: null,
      error: { message: 'An account with this email already exists' },
    })

    render(<SignupPage />)
    await userEvent.type(screen.getByLabelText(/username/i), 'traveler')
    await userEvent.type(screen.getByLabelText(/email/i), 'taken@example.com')
    await userEvent.type(screen.getByLabelText(/^password$/i), 'password123')
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /sign up/i }))

    expect(await screen.findByText(/account with this email already exists/i)).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })
})
