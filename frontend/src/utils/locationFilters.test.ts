import { describe, expect, it } from 'vitest'
import {
  buildLocationsUrl,
  filtersFromSearchParams,
  normalizeLocationFilters,
} from './locationFilters'

describe('locationFilters', () => {
  it('normalizes empty, all, and whitespace-only filters', () => {
    expect(
      normalizeLocationFilters({
        q: '  ',
        city: '  ',
        category: 'all',
      }),
    ).toEqual({
      q: '',
      city: '',
      category: '',
    })
  })

  it('trims valid filter values before building the API URL', () => {
    expect(
      buildLocationsUrl('http://localhost:3001', {
        q: ' solar cafe ',
        city: ' Kuala Lumpur ',
        category: 'Dining',
      }),
    ).toBe('http://localhost:3001/api/locations?q=solar+cafe&city=Kuala+Lumpur&category=Dining')
  })

  it('omits blank query parameters from the API URL', () => {
    expect(buildLocationsUrl('http://localhost:3001', { category: 'all' })).toBe(
      'http://localhost:3001/api/locations',
    )
  })

  it('reads only supported categories from search params', () => {
    expect(
      filtersFromSearchParams({
        q: ['eco'],
        city: 'Penang',
        category: 'Invalid',
      }),
    ).toEqual({
      q: 'eco',
      city: 'Penang',
      category: 'all',
    })
  })
})
