import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfileTab from './ProfileTab'
import * as userHooks from '@/hooks/useUser'

const updateMutateAsync = vi.fn()
const changePasswordMutateAsync = vi.fn()
const deleteMutateAsync = vi.fn()
const signOut = vi.fn()

vi.mock('@/hooks/useUser', () => ({
  useUser: vi.fn(),
  useUpdateUser: vi.fn(),
  useDeleteAccount: vi.fn(),
  useChangePassword: vi.fn(),
}))

vi.mock('@/utils/supabase/auth', () => ({
  signOut: () => signOut(),
}))

describe('ProfileTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(userHooks.useUser).mockReturnValue({
      data: {
        id: 'user-1',
        email: 'profile@example.com',
        user_metadata: { username: 'traveler', role: 'user' },
      },
    } as any)
    vi.mocked(userHooks.useUpdateUser).mockReturnValue({ mutateAsync: updateMutateAsync, isPending: false } as any)
    vi.mocked(userHooks.useChangePassword).mockReturnValue({ mutateAsync: changePasswordMutateAsync, isPending: false } as any)
    vi.mocked(userHooks.useDeleteAccount).mockReturnValue({ mutateAsync: deleteMutateAsync, isPending: false } as any)
  })

  afterEach(() => {
    cleanup()
  })

  it('displays username, email, and role', () => {
    render(<ProfileTab />)

    expect(screen.getByRole('heading', { name: 'traveler' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('profile@example.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Eco Traveler')).toBeInTheDocument()
  })

  it('rejects an empty username', async () => {
    render(<ProfileTab />)

    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    const usernameInput = screen.getByPlaceholderText(/enter username/i)
    await userEvent.clear(usernameInput)
    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    expect(await screen.findByText(/username cannot be empty/i)).toBeInTheDocument()
    expect(updateMutateAsync).not.toHaveBeenCalled()
  })

  it('skips the API call when username is unchanged', async () => {
    render(<ProfileTab />)

    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    expect(updateMutateAsync).not.toHaveBeenCalled()
  })

  it('updates username and shows success feedback', async () => {
    updateMutateAsync.mockResolvedValue({ user: { username: 'updated' } })
    render(<ProfileTab />)

    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    const usernameInput = screen.getByPlaceholderText(/enter username/i)
    await userEvent.clear(usernameInput)
    await userEvent.type(usernameInput, 'updated')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => expect(updateMutateAsync).toHaveBeenCalledWith({ username: 'updated' }))
    expect(await screen.findByText(/profile updated successfully/i)).toBeInTheDocument()
  })

  it('validates password fields before changing password', async () => {
    render(<ProfileTab />)

    await userEvent.click(screen.getByRole('button', { name: /^change password$/i }))
    await userEvent.click(screen.getByRole('button', { name: /update password/i }))

    expect(await screen.findByText(/all password fields are required/i)).toBeInTheDocument()
    expect(changePasswordMutateAsync).not.toHaveBeenCalled()
  })

  it('shows password change errors from the API', async () => {
    changePasswordMutateAsync.mockRejectedValue(new Error('Current password is incorrect'))
    render(<ProfileTab />)

    await userEvent.click(screen.getByRole('button', { name: /^change password$/i }))
    await userEvent.type(screen.getByPlaceholderText(/enter current password/i), 'wrongpass')
    await userEvent.type(screen.getByPlaceholderText(/enter new password/i), 'newpass123')
    await userEvent.type(screen.getByPlaceholderText(/confirm new password/i), 'newpass123')
    await userEvent.click(screen.getByRole('button', { name: /update password/i }))

    expect(await screen.findByText(/current password is incorrect/i)).toBeInTheDocument()
  })

  it('keeps delete disabled until DELETE is confirmed', async () => {
    render(<ProfileTab />)

    await userEvent.click(screen.getByRole('button', { name: /^delete account$/i }))
    const confirmDeleteButton = screen.getAllByRole('button', { name: /^delete account$/i }).at(-1)!
    expect(confirmDeleteButton).toBeDisabled()

    await userEvent.type(screen.getByPlaceholderText('DELETE'), 'DELETE')
    expect(confirmDeleteButton).not.toBeDisabled()
  })
})
