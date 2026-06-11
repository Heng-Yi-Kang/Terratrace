import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import PlaceCard, { Place } from './PlaceCard'

vi.mock('./CardImage', () => ({
  default: ({ place }: { place: Place }) => <img alt={place.name} src={place.imageUrl || '/placeholder.png'} />,
}))

describe('PlaceCard', () => {
  const place: Place = {
    id: 'place-1',
    name: 'Solar Forest Retreat',
    category: 'Accommodation',
    city: 'Ipoh',
    lat: 4.5975,
    long: 101.0901,
    ecoCerts: ['Green Key', 'Solar Powered'],
    imageUrl: '/solar-forest.jpg',
    publicId: 'pub-123',
  }

  it('renders place details and eco certifications', () => {
    render(<PlaceCard place={place} />)

    expect(screen.getByText('Solar Forest Retreat')).toBeInTheDocument()
    expect(screen.getByText('Ipoh')).toBeInTheDocument()
    expect(screen.getByText('Accommodation')).toBeInTheDocument()
    expect(screen.getByText('Green Key')).toBeInTheDocument()
    expect(screen.getByText('Solar Powered')).toBeInTheDocument()
  })

  it('links to the encoded eco-directory detail route', () => {
    render(<PlaceCard place={place} />)

    expect(screen.getByRole('link', { name: /view details/i })).toHaveAttribute(
      'href',
      '/eco-directory/solar-forest-retreat~pub-123',
    )
  })
})
