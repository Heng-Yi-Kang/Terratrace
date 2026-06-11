import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import EcoDirectoryClient from './EcoDirectoryClient'
import type { Place } from './PlaceCard'

const replace = vi.fn()
let queryString = ''

const useLocations = vi.fn()
const useLocationCities = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  usePathname: () => '/eco-directory',
  useSearchParams: () => new URLSearchParams(queryString),
}))

vi.mock('@/hooks/useLocations', () => ({
  useLocations: (...args: unknown[]) => useLocations(...args),
  useLocationCities: (...args: unknown[]) => useLocationCities(...args),
}))

vi.mock('./PlaceCard', () => ({
  default: ({ place }: { place: Place }) => <article>{place.name}</article>,
}))

const places: Place[] = [
  { id: '1', name: 'Eco Hotel One', category: 'Accommodation', city: 'Ipoh', lat: 0, long: 0, ecoCerts: [], publicId: 'p1' },
  { id: '2', name: 'Eco Hotel Two', category: 'Accommodation', city: 'Ipoh', lat: 0, long: 0, ecoCerts: [], publicId: 'p2' },
  { id: '3', name: 'Green Cafe', category: 'Dining', city: 'Penang', lat: 0, long: 0, ecoCerts: [], publicId: 'p3' },
  { id: '4', name: 'EV Shuttle', category: 'Transport', city: 'Kuala Lumpur', lat: 0, long: 0, ecoCerts: [], publicId: 'p4' },
  { id: '5', name: 'Bike Hub', category: 'Transport', city: 'Kuala Lumpur', lat: 0, long: 0, ecoCerts: [], publicId: 'p5' },
  { id: '6', name: 'Organic Bistro', category: 'Dining', city: 'Melaka', lat: 0, long: 0, ecoCerts: [], publicId: 'p6' },
  { id: '7', name: 'Rainwater Inn', category: 'Accommodation', city: 'Kuching', lat: 0, long: 0, ecoCerts: [], publicId: 'p7' },
  { id: '8', name: 'Solar Tram', category: 'Transport', city: 'Putrajaya', lat: 0, long: 0, ecoCerts: [], publicId: 'p8' },
  { id: '9', name: 'Compost Kitchen', category: 'Dining', city: 'Penang', lat: 0, long: 0, ecoCerts: [], publicId: 'p9' },
]

describe('EcoDirectoryClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queryString = ''
    Element.prototype.scrollIntoView = vi.fn()
    useLocations.mockReturnValue({ data: places, isLoading: false, error: null })
    useLocationCities.mockReturnValue({ data: ['Ipoh', 'Penang'], isLoading: false, error: null })
  })

  it('renders category counts and the first page of places from mocked location data', () => {
    render(<EcoDirectoryClient />)

    expect(screen.getByText('Accommodations').previousElementSibling).toHaveTextContent('3')
    expect(screen.getAllByText('Dining').at(-1)?.previousElementSibling).toHaveTextContent('3')
    expect(screen.getAllByText('Transport').at(-1)?.previousElementSibling).toHaveTextContent('3')
    expect(screen.getByText('Eco Hotel One')).toBeInTheDocument()
    expect(screen.queryByText('Compost Kitchen')).not.toBeInTheDocument()
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
  })

  it('moves to the next page when pagination is clicked', async () => {
    render(<EcoDirectoryClient />)

    await userEvent.click(screen.getByRole('button', { name: /next/i }))

    expect(screen.getByText('Compost Kitchen')).toBeInTheDocument()
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()
  })

  it('updates the URL when search, city, and category filters change', async () => {
    render(<EcoDirectoryClient />)

    await userEvent.type(screen.getByLabelText(/search eco directory/i), ' cafe ')
    await userEvent.click(screen.getByRole('button', { name: /^search$/i }))
    expect(replace).toHaveBeenLastCalledWith('/eco-directory?q=cafe', { scroll: false })

    await userEvent.selectOptions(screen.getByLabelText(/city or town/i), 'Penang')
    expect(replace).toHaveBeenLastCalledWith('/eco-directory?city=Penang', { scroll: false })

    await userEvent.click(screen.getByRole('button', { name: 'Dining' }))
    expect(replace).toHaveBeenLastCalledWith('/eco-directory?category=Dining', { scroll: false })
  })

  it('shows loading and error states without rendering the catalog', () => {
    useLocations.mockReturnValueOnce({ data: [], isLoading: true, error: null })
    const { rerender } = render(<EcoDirectoryClient />)

    expect(screen.getByText(/loading eco destinations/i)).toBeInTheDocument()

    useLocations.mockReturnValueOnce({
      data: [],
      isLoading: false,
      error: new Error('Network unavailable'),
    })
    rerender(<EcoDirectoryClient />)

    expect(screen.getByText(/failed to load eco destinations: network unavailable/i)).toBeInTheDocument()
  })

  it('shows an empty state and clears active filters', async () => {
    queryString = 'q=unknown'
    useLocations.mockReturnValue({ data: [], isLoading: false, error: null })

    render(<EcoDirectoryClient />)

    const emptyState = screen.getByText(/no eco destinations found/i).closest('div')
    expect(emptyState).not.toBeNull()
    expect(within(emptyState!).getByText(/try another city, category, or search term/i)).toBeInTheDocument()

    await userEvent.click(within(emptyState!).getByRole('button', { name: /clear filters/i }))

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/eco-directory', { scroll: false })
    })
  })
})
