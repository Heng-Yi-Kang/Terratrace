import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthForm from './AuthForm'

describe('AuthForm', () => {
  const mockOnSubmit = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  describe('Login Mode', () => {
    it('renders login form correctly', () => {
      render(<AuthForm mode="login" onSubmit={mockOnSubmit} />)
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
    })

    it('prevents submission when fields are empty', async () => {
      render(<AuthForm mode="login" onSubmit={mockOnSubmit} />)
      await userEvent.click(screen.getByRole('button', { name: /log in/i }))
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('shows an error when password is shorter than 6 characters', async () => {
      render(<AuthForm mode="login" onSubmit={mockOnSubmit} />)
      await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
      await userEvent.type(screen.getByLabelText(/password/i), '12345')
      await userEvent.click(screen.getByRole('button', { name: /log in/i }))

      expect(await screen.findByText(/password must be at least 6 characters/i)).toBeInTheDocument()
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('calls onSubmit with email and password on valid submit', async () => {
      render(<AuthForm mode="login" onSubmit={mockOnSubmit} />)
      await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
      await userEvent.type(screen.getByLabelText(/password/i), 'password123')
      await userEvent.click(screen.getByRole('button', { name: /log in/i }))
      expect(mockOnSubmit).toHaveBeenCalledWith('test@example.com', 'password123', '')
    })

    it('displays error message when onSubmit throws', async () => {
      const errorOnSubmit = vi.fn().mockRejectedValue(new Error('Invalid credentials'))
      render(<AuthForm mode="login" onSubmit={errorOnSubmit} />)
      await userEvent.type(screen.getByLabelText(/email/i), 'bad@test.com')
      await userEvent.type(screen.getByLabelText(/password/i), 'wrongpass')
      await userEvent.click(screen.getByRole('button', { name: /log in/i }))
      await waitFor(() => {
        expect(screen.getByText((content) => content.toLowerCase().includes('invalid credentials'))).toBeInTheDocument()
      })
    })

    it('shows loading state while submitting', async () => {
      const slowSubmit = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      render(<AuthForm mode="login" onSubmit={slowSubmit} />)
      await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
      await userEvent.type(screen.getByLabelText(/password/i), 'password123')
      await userEvent.click(screen.getByRole('button', { name: /log in/i }))
      expect(screen.getByText(/processing/i)).toBeInTheDocument()
    })
  })

  describe('Signup Mode', () => {
    it('renders additional fields for signup', () => {
      render(<AuthForm mode="signup" onSubmit={mockOnSubmit} />)
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
      expect(screen.queryByLabelText(/account type/i)).not.toBeInTheDocument()
    })

    it('prevents submission when passwords do not match', async () => {
      render(<AuthForm mode="signup" onSubmit={mockOnSubmit} />)
      await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
      await userEvent.type(screen.getByLabelText(/username/i), 'testuser')
      await userEvent.type(screen.getByLabelText(/^password$/i), 'password123')
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'differentpass')
      await userEvent.click(screen.getByRole('button', { name: /sign up/i }))
      expect(mockOnSubmit).not.toHaveBeenCalled()
      expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument()
    })

    it('calls onSubmit with username on valid signup', async () => {
      render(<AuthForm mode="signup" onSubmit={mockOnSubmit} />)
      await userEvent.type(screen.getByLabelText(/username/i), 'traveler')
      await userEvent.type(screen.getByLabelText(/email/i), 'new@example.com')
      await userEvent.type(screen.getByLabelText(/^password$/i), 'password123')
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123')
      await userEvent.click(screen.getByRole('button', { name: /sign up/i }))

      expect(mockOnSubmit).toHaveBeenCalledWith('new@example.com', 'password123', 'traveler')
    })
  })
})
