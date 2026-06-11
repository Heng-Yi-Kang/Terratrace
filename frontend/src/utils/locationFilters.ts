export type LocationCategory = 'Accommodation' | 'Dining' | 'Transport'

export type LocationFilters = {
  q?: string
  city?: string
  category?: LocationCategory | 'all'
}

export type NormalizedLocationFilters = {
  q: string
  city: string
  category: LocationCategory | ''
}

export function normalizeLocationFilters(filters: LocationFilters | NormalizedLocationFilters = {}): NormalizedLocationFilters {
  return {
    q: filters.q?.trim() || '',
    city: filters.city?.trim() || '',
    category: filters.category && filters.category !== 'all' ? filters.category : '',
  }
}

export function buildLocationsUrl(baseUrl: string, filters: LocationFilters | NormalizedLocationFilters = {}) {
  const normalized = normalizeLocationFilters(filters)
  const params = new URLSearchParams()

  if (normalized.q) params.set('q', normalized.q)
  if (normalized.city) params.set('city', normalized.city)
  if (normalized.category) params.set('category', normalized.category)

  const query = params.toString()
  return `${baseUrl}/api/locations${query ? `?${query}` : ''}`
}

export function filtersFromSearchParams(searchParams: Record<string, string | string[] | undefined>): LocationFilters {
  const read = (key: string) => {
    const value = searchParams[key]
    return Array.isArray(value) ? value[0] : value
  }

  const category = read('category')

  return {
    q: read('q') || '',
    city: read('city') || '',
    category: category === 'Accommodation' || category === 'Dining' || category === 'Transport' ? category : 'all',
  }
}
