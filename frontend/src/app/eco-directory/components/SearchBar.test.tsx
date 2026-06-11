import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import SearchBar from './SearchBar'

describe('SearchBar', () => {
  it('submits the trimmed search query', async () => {
    const onSubmit = vi.fn()
    render(<SearchBar onSubmit={onSubmit} debounceMs={0} />)

    await userEvent.type(screen.getByLabelText(/search eco directory/i), '  green hotel  ')
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }))

    expect(onSubmit).toHaveBeenCalledWith('green hotel')
  })

  it('debounces trimmed query changes', async () => {
    const onChange = vi.fn()
    render(<SearchBar onChange={onChange} debounceMs={10} />)

    await userEvent.type(screen.getByLabelText(/search eco directory/i), '  cafe  ')

    await waitFor(() => {
      expect(onChange).toHaveBeenLastCalledWith('cafe')
    })
  })

  it('clears the input and notifies handlers', async () => {
    const onChange = vi.fn()
    const onSubmit = vi.fn()
    render(<SearchBar value="Penang" onChange={onChange} onSubmit={onSubmit} debounceMs={0} />)

    await userEvent.click(screen.getByRole('button', { name: /clear search/i }))

    expect(screen.getByLabelText(/search eco directory/i)).toHaveValue('')
    expect(onSubmit).toHaveBeenCalledWith('')
    expect(onChange).toHaveBeenCalledWith('')
  })
})
