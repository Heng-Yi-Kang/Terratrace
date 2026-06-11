import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ImpactInsights } from './ImpactInsights'
import type { CarbonResult } from '../constant/types'

const inViewState = vi.hoisted(() => ({ value: true }))

vi.mock('framer-motion', () => ({
  useInView: () => inViewState.value,
}))

vi.mock('@/app/carbonFootprint/component/doughnutChart', () => ({
  default: (props: Record<string, number>) => (
    <div data-testid="doughnut-chart">
      {Object.entries(props).map(([key, value]) => `${key}:${value}`).join(',')}
    </div>
  ),
}))

const result: CarbonResult = {
  total: 110,
  flightEmissions: 20,
  carEmissions: 70,
  hotelEmissions: 10,
  railEmissions: 5,
  busEmissions: 3,
  taxiEmissions: 2,
}

describe('ImpactInsights', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    inViewState.value = true
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(1500)
      return 1
    })
    vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => undefined)
    vi.spyOn(performance, 'now').mockReturnValue(0)
  })

  it('renders the empty state when no result exists', () => {
    render(<ImpactInsights result={null} />)

    expect(screen.getByText(/No data. Please enter your travel details/i)).toBeInTheDocument()
  })

  it('renders totals, breakdown, chart percentages, and tree equivalent', async () => {
    render(<ImpactInsights result={result} />)

    expect(screen.getByText('Impact Insights')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('110.00')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
    })
    expect(screen.getByText('trees/year to absorb')).toBeInTheDocument()
    expect(screen.getByTestId('doughnut-chart')).toHaveTextContent('flight:18.2')
    expect(screen.getByTestId('doughnut-chart')).toHaveTextContent('car:63.6')
    expect(screen.getByText('70.00')).toBeInTheDocument()
    expect(screen.getByText('(63.6%)')).toBeInTheDocument()
  })

  it('shows calculated totals even when the count-up observer has not fired', async () => {
    inViewState.value = false

    render(<ImpactInsights result={result} />)

    await waitFor(() => {
      expect(screen.getByText('110.00')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
    })
  })

  it('identifies the highest-impact source and recommendation text', () => {
    render(<ImpactInsights result={result} />)

    expect(screen.getByText("Car contributes the most to your travel's carbon footprint.")).toBeInTheDocument()
    expect(screen.getByText(/try carpooling, using public transportation/i)).toBeInTheDocument()
  })
})
