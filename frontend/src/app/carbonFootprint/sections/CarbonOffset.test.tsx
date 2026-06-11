import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CarbonOffset } from './CarbonOffset'
import type { CarbonResult } from '../constant/types'
import { fetchCarbonSuggestions } from '@/utils/carbon'

vi.mock('@/utils/carbon', () => ({
  fetchCarbonSuggestions: vi.fn(),
}))

const result: CarbonResult = {
  total: 110,
  flightEmissions: 80,
  carEmissions: 10,
  hotelEmissions: 5,
  railEmissions: 5,
  busEmissions: 5,
  taxiEmissions: 5,
}

describe('CarbonOffset', () => {
  beforeEach(() => {
    vi.mocked(fetchCarbonSuggestions).mockRejectedValue(new Error('AI unavailable'))
  })

  it('renders nothing when no result is available', () => {
    const { container } = render(<CarbonOffset result={null} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('renders tree offset guidance from total emissions', () => {
    render(<CarbonOffset result={result} />)

    expect(screen.getByText('Offset Your Emissions')).toBeInTheDocument()
    expect(screen.getByText('Plant 5 trees to offset your emissions')).toBeInTheDocument()
  })

  it('renders carbon credit organization links', () => {
    render(<CarbonOffset result={result} />)

    expect(screen.getByRole('link', { name: 'Climate Impact X' })).toHaveAttribute('href', expect.stringContaining('climateimpactx.com'))
    expect(screen.getByRole('link', { name: 'Gold Standard' })).toHaveAttribute('href', 'https://www.goldstandard.org/donate-to-gold-standard')
    expect(screen.getByRole('link', { name: 'Cool Effect' })).toHaveAttribute('href', 'https://www.cooleffect.org/travel-offset')
  })

  it('shows reduction tips for the highest emission source', () => {
    render(<CarbonOffset result={result} />)

    expect(screen.getByText('Consider taking a train or bus for shorter distances.')).toBeInTheDocument()
    expect(screen.getByText('Choose airlines with better sustainability practices.')).toBeInTheDocument()
    expect(screen.getByText(/Choose economy class instead of business or first\s+class\./)).toBeInTheDocument()
  })

  it('replaces fallback tips with AI suggestions when available', async () => {
    vi.mocked(fetchCarbonSuggestions).mockResolvedValue({
      provider: 'gemini',
      highestSource: 'Flight',
      suggestions: [
        'Book direct flights where possible to avoid extra takeoff emissions.',
        'Pack lighter luggage to reduce aircraft fuel burn.',
      ],
    })

    render(<CarbonOffset result={result} />)

    expect(await screen.findByText('Book direct flights where possible to avoid extra takeoff emissions.')).toBeInTheDocument()
    expect(screen.getByText('Pack lighter luggage to reduce aircraft fuel burn.')).toBeInTheDocument()
    expect(screen.getByText('AI suggestions')).toBeInTheDocument()
  })
})
