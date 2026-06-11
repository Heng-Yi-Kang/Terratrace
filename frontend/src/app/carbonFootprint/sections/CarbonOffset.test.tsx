import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CarbonOffset } from './CarbonOffset'
import type { CarbonResult } from '../constant/types'

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
})
