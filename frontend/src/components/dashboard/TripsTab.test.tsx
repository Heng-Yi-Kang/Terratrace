import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TripsTab from './TripsTab'
import * as tripHooks from '@/hooks/useTrips'
import * as favouriteHooks from '@/hooks/useFavourites'
import * as locationHooks from '@/hooks/useLocations'
import type { Trip, TripPayload } from '@/types/trip'
import type { Place } from '@/hooks/useLocations'

const mockUseTrips = vi.mocked(tripHooks.useTrips)
const mockUseCreateTrip = vi.mocked(tripHooks.useCreateTrip)
const mockUseUpdateTrip = vi.mocked(tripHooks.useUpdateTrip)
const mockUseDeleteTrip = vi.mocked(tripHooks.useDeleteTrip)
const mockUseFavourites = vi.mocked(favouriteHooks.useFavourites)
const mockUseLocations = vi.mocked(locationHooks.useLocations)

const createTripMutateAsync = vi.fn()
const updateTripMutateAsync = vi.fn()
const deleteTripMutateAsync = vi.fn()

vi.mock('@/hooks/useTrips', () => ({
  useTrips: vi.fn(),
  useCreateTrip: vi.fn(),
  useUpdateTrip: vi.fn(),
  useDeleteTrip: vi.fn(),
  useImportLocalTrips: vi.fn(),
}))

vi.mock('@/hooks/useFavourites', () => ({
  useFavourites: vi.fn(),
}))

vi.mock('@/hooks/useLocations', () => ({
  useLocations: vi.fn(),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

vi.mock('@/components/smart-recommendation-section', () => ({
  default: ({ onSaveTrip }: { onSaveTrip: (payload: TripPayload) => void }) => (
    <button
      type="button"
      onClick={() => onSaveTrip({
        destination: 'Smart Penang',
        startDate: '2026-07-01',
        endDate: '2026-07-02',
        budget: 300,
        interests: ['nature'],
        ecoScore: 90,
        status: 'upcoming',
        source: 'recommendation',
        sourceRequestId: 'smart-1',
        weatherCondition: 'sunny',
        totalEstimatedCost: 120,
        items: [],
      })}
    >
      Save mocked recommendation
    </button>
  ),
}))

const savedPlace: Place = {
  id: 'place-1',
  publicId: 'public-1',
  name: 'Solar Lodge',
  category: 'Accommodation',
  city: 'George Town',
  lat: 5.41,
  long: 100.33,
  ecoCerts: ['Green Key'],
}

const directoryPlace: Place = {
  id: 'place-2',
  publicId: 'public-2',
  name: 'Compost Cafe',
  category: 'Dining',
  city: 'Penang',
  lat: 5.42,
  long: 100.34,
  ecoCerts: ['Zero Waste'],
}

const persistedTrip: Trip = {
  id: 'trip-1',
  destination: 'George Town',
  startDate: '2026-07-10',
  endDate: '2026-07-11',
  budget: 500,
  interests: ['heritage', 'food'],
  ecoScore: 92,
  status: 'upcoming',
  source: 'manual',
  sourceRequestId: null,
  weatherCondition: null,
  totalEstimatedCost: 150,
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
  items: [
    {
      id: 'item-1',
      tripId: 'trip-1',
      locationId: 'place-1',
      tripDate: '2026-07-10',
      dayPart: 'morning',
      title: 'Solar Lodge',
      category: 'Accommodation',
      estimatedCost: 150,
      rationale: 'Stay at a certified eco hotel.',
      weatherAlternative: null,
      communityImpact: 'Green Key',
      sortOrder: 0,
      place: {
        publicId: 'public-1',
        name: 'Solar Lodge',
        category: 'Accommodation',
        city: 'George Town',
      },
    },
  ],
}

function savedTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    ...persistedTrip,
    id: 'created-trip',
    destination: 'Langkawi',
    items: [],
    ...overrides,
  }
}

describe('TripsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockUseTrips.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as any)
    mockUseFavourites.mockReturnValue({
      data: [savedPlace],
      isLoading: false,
    } as any)
    mockUseLocations.mockReturnValue({
      data: [],
      isLoading: false,
    } as any)
    mockUseCreateTrip.mockReturnValue({
      mutateAsync: createTripMutateAsync,
      isPending: false,
    } as any)
    mockUseUpdateTrip.mockReturnValue({
      mutateAsync: updateTripMutateAsync,
      isPending: false,
    } as any)
    mockUseDeleteTrip.mockReturnValue({
      mutateAsync: deleteTripMutateAsync,
      isPending: false,
    } as any)
    createTripMutateAsync.mockResolvedValue(savedTrip())
    updateTripMutateAsync.mockResolvedValue(savedTrip({ id: 'trip-1', destination: 'Updated George Town' }))
    deleteTripMutateAsync.mockResolvedValue({ success: true })
  })

  it('renders a persisted green itinerary with schedule details and place link', () => {
    mockUseTrips.mockReturnValue({
      data: [persistedTrip],
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    render(<TripsTab />)

    expect(screen.getByRole('heading', { name: 'My Trips' })).toBeInTheDocument()
    expect(screen.getByText('Total Trips')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'George Town' })).toBeInTheDocument()
    expect(screen.getByText('Solar Lodge')).toBeInTheDocument()
    expect(screen.getByText('Stay at a certified eco hotel.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /view place/i })).toHaveAttribute(
      'href',
      '/eco-directory/solar-lodge~public-1',
    )
  })

  it('creates a manual itinerary payload from the trip editor', async () => {
    const user = userEvent.setup()
    render(<TripsTab />)

    await user.click(screen.getByRole('button', { name: /^New Trip$/i }))
    await user.type(screen.getByLabelText('Destination'), 'Langkawi')
    await user.clear(screen.getByLabelText('Budget'))
    await user.type(screen.getByLabelText('Budget'), '450')
    fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2026-08-01' } })
    fireEvent.change(screen.getByLabelText('End date'), { target: { value: '2026-08-03' } })
    await user.type(screen.getByLabelText('Interests'), 'nature, food')
    await user.clear(screen.getByLabelText('Eco score'))
    await user.type(screen.getByLabelText('Eco score'), '88')

    await user.click(screen.getByRole('button', { name: /add item/i }))
    await user.type(screen.getByPlaceholderText('Activity or place'), 'Mangrove kayak tour')
    await user.clear(screen.getByPlaceholderText('Category'))
    await user.type(screen.getByPlaceholderText('Category'), 'activity')
    await user.type(screen.getByPlaceholderText('Estimated cost'), '80')

    await user.click(screen.getByRole('button', { name: /^Save Trip$/i }))

    await waitFor(() => expect(createTripMutateAsync).toHaveBeenCalledTimes(1))
    expect(createTripMutateAsync).toHaveBeenCalledWith(expect.objectContaining({
      destination: 'Langkawi',
      startDate: '2026-08-01',
      endDate: '2026-08-03',
      budget: 450,
      interests: ['nature', 'food'],
      ecoScore: 88,
      status: 'upcoming',
      source: 'manual',
      items: [
        expect.objectContaining({
          title: 'Mangrove kayak tour',
          category: 'activity',
          estimatedCost: 80,
          tripDate: '2026-08-01',
          dayPart: 'flexible',
          sortOrder: 0,
        }),
      ],
    }))
  })

  it('adds a saved green place to the itinerary payload', async () => {
    const user = userEvent.setup()
    render(<TripsTab />)

    await user.click(screen.getByRole('button', { name: /^New Trip$/i }))
    await user.type(screen.getByLabelText('Destination'), 'Penang')
    await user.click(screen.getByRole('button', { name: /Solar Lodge/ }))
    await user.click(screen.getByRole('button', { name: /^Save Trip$/i }))

    await waitFor(() => expect(createTripMutateAsync).toHaveBeenCalledTimes(1))
    expect(createTripMutateAsync).toHaveBeenCalledWith(expect.objectContaining({
      destination: 'Penang',
      items: [
        expect.objectContaining({
          locationId: 'place-1',
          title: 'Solar Lodge',
          category: 'Accommodation',
          dayPart: 'flexible',
          rationale: 'Sustainable accommodation option in George Town.',
          communityImpact: 'Green Key',
        }),
      ],
    }))
  })

  it('edits an existing trip payload', async () => {
    const user = userEvent.setup()
    mockUseTrips.mockReturnValue({
      data: [persistedTrip],
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    render(<TripsTab />)

    await user.click(screen.getByRole('button', { name: /^Edit$/i }))
    await user.clear(screen.getByLabelText('Destination'))
    await user.type(screen.getByLabelText('Destination'), 'Updated George Town')
    await user.clear(screen.getByLabelText('Budget'))
    await user.type(screen.getByLabelText('Budget'), '650')
    await user.click(screen.getByRole('button', { name: /^Save Trip$/i }))

    await waitFor(() => expect(updateTripMutateAsync).toHaveBeenCalledTimes(1))
    expect(updateTripMutateAsync).toHaveBeenCalledWith({
      id: 'trip-1',
      trip: expect.objectContaining({
        destination: 'Updated George Town',
        budget: 650,
        startDate: '2026-07-10',
        endDate: '2026-07-11',
        items: [
          expect.objectContaining({
            locationId: 'place-1',
            title: 'Solar Lodge',
            tripDate: '2026-07-10',
            dayPart: 'morning',
          }),
        ],
      }),
    })
  })

  it('deletes an existing trip', async () => {
    const user = userEvent.setup()
    mockUseTrips.mockReturnValue({
      data: [persistedTrip],
      isLoading: false,
      isError: false,
      error: null,
    } as any)

    render(<TripsTab />)

    await user.click(screen.getByRole('button', { name: /^Delete$/i }))

    await waitFor(() => expect(deleteTripMutateAsync).toHaveBeenCalledTimes(1))
    expect(deleteTripMutateAsync).toHaveBeenCalledWith('trip-1')
  })

  it('adds a directory search place to the itinerary payload', async () => {
    const user = userEvent.setup()
    mockUseLocations.mockReturnValue({
      data: [directoryPlace],
      isLoading: false,
    } as any)

    render(<TripsTab />)

    await user.click(screen.getByRole('button', { name: /^New Trip$/i }))
    await user.type(screen.getByLabelText('Destination'), 'Penang')
    await user.click(screen.getByRole('button', { name: /^Search$/i }))
    await user.type(screen.getByPlaceholderText(/search places/i), 'Compost')
    await user.click(screen.getByRole('button', { name: /Compost Cafe/ }))
    await user.click(screen.getByRole('button', { name: /^Save Trip$/i }))

    await waitFor(() => expect(createTripMutateAsync).toHaveBeenCalledTimes(1))
    expect(createTripMutateAsync).toHaveBeenCalledWith(expect.objectContaining({
      destination: 'Penang',
      items: [
        expect.objectContaining({
          locationId: 'place-2',
          title: 'Compost Cafe',
          category: 'Dining',
          rationale: 'Sustainable dining option in Penang.',
          communityImpact: 'Zero Waste',
        }),
      ],
    }))
  })

  it('blocks missing destination and invalid date ranges', async () => {
    const user = userEvent.setup()
    render(<TripsTab />)

    await user.click(screen.getByRole('button', { name: /^New Trip$/i }))
    await user.click(screen.getByRole('button', { name: /^Save Trip$/i }))

    expect(screen.getByText('Destination is required.')).toBeInTheDocument()
    expect(createTripMutateAsync).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText('Destination'), 'Penang')
    fireEvent.change(screen.getByLabelText('Start date'), { target: { value: '2026-08-03' } })
    fireEvent.change(screen.getByLabelText('End date'), { target: { value: '2026-08-01' } })
    await user.click(screen.getByRole('button', { name: /^Save Trip$/i }))

    expect(screen.getByText('Choose a valid date range.')).toBeInTheDocument()
    expect(createTripMutateAsync).not.toHaveBeenCalled()
  })

  it('renders empty trip and itinerary states', async () => {
    const user = userEvent.setup()
    render(<TripsTab />)

    expect(screen.getByText('No trips found')).toBeInTheDocument()
    expect(screen.getByText('Create a trip or save a recommendation to start your itinerary.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^Plan Your First Trip$/i }))

    expect(screen.getByText('No itinerary items yet.')).toBeInTheDocument()
  })
})
