'use client'

import { useState } from 'react'
import Link from 'next/link'

type Category = 'all' | 'Accommodation' | 'Dining' | 'Transport'

const mockSavedPlaces = [
  {
    id: '1',
    name: 'Green Valley Eco Lodge',
    category: 'Accommodation' as const,
    city: 'Copenhagen, Denmark',
    ecoCerts: ['Green Key', 'EU Ecolabel'],
    imageColor: 'bg-emerald-500',
  },
  {
    id: '2',
    name: 'Solar-Powered Hostel',
    category: 'Accommodation' as const,
    city: 'Amsterdam, Netherlands',
    ecoCerts: ['EarthCheck'],
    imageColor: 'bg-teal-500',
  },
  {
    id: '3',
    name: 'Zero Waste Restaurant',
    category: 'Dining' as const,
    city: 'Vienna, Austria',
    ecoCerts: ['Green Restaurant'],
    imageColor: 'bg-green-600',
  },
  {
    id: '4',
    name: 'Organic Farm-to-Table Bistro',
    category: 'Dining' as const,
    city: 'Barcelona, Spain',
    ecoCerts: ['Organic Farm', 'Local Sourcing'],
    imageColor: 'bg-lime-500',
  },
  {
    id: '5',
    name: 'Electric Bike Tours',
    category: 'Transport' as const,
    city: 'Berlin, Germany',
    ecoCerts: ['Green Transport'],
    imageColor: 'bg-cyan-500',
  },
  {
    id: '6',
    name: 'Train Connection Hub',
    category: 'Transport' as const,
    city: 'Zurich, Switzerland',
    ecoCerts: ['Sustainable Travel'],
    imageColor: 'bg-sky-500',
  },
]

export default function SavedTab() {
  const [categoryFilter, setCategoryFilter] = useState<Category>('all')

  const filteredPlaces = mockSavedPlaces.filter(
    (place) => categoryFilter === 'all' || place.category === categoryFilter
  )

  const categories: { id: Category; label: string; count: number }[] = [
    { id: 'all', label: 'All Places', count: mockSavedPlaces.length },
    { id: 'Accommodation', label: 'Accommodation', count: mockSavedPlaces.filter((p) => p.category === 'Accommodation').length },
    { id: 'Dining', label: 'Dining', count: mockSavedPlaces.filter((p) => p.category === 'Dining').length },
    { id: 'Transport', label: 'Transport', count: mockSavedPlaces.filter((p) => p.category === 'Transport').length },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-sans font-bold text-3xl text-text">Saved Places</h1>
        <p className="font-sans text-text/60 mt-2">Your bookmarked eco-friendly destinations</p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`px-4 py-2 rounded-xl font-sans text-sm font-medium transition-all duration-200 cursor-pointer ${
              categoryFilter === cat.id
                ? 'bg-primary text-white'
                : 'bg-white/80 text-text/60 hover:text-text shadow-sm'
            }`}
          >
            {cat.label} ({cat.count})
          </button>
        ))}
      </div>

      {/* Places Grid */}
      {filteredPlaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaces.map((place) => (
            <div
              key={place.id}
              className="bg-white/80 backdrop-blur-md rounded-organic overflow-hidden shadow-organic hover:shadow-organic-lg transition-all duration-200 cursor-pointer group"
            >
              <div className={`h-40 ${place.imageColor} relative`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-12 h-12 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-sans font-semibold text-white bg-white/20 backdrop-blur-sm">
                  {place.category}
                </div>
                <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
              <div className="p-5">
                <h3 className="font-sans font-semibold text-lg text-text">{place.name}</h3>
                <p className="font-sans text-sm text-text/60 mt-1">{place.city}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {place.ecoCerts.map((cert) => (
                    <span
                      key={cert}
                      className="px-2 py-1 rounded-full text-xs font-sans font-medium bg-secondary/10 text-secondary"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-md rounded-organic p-12 text-center shadow-organic">
          <svg className="w-16 h-16 mx-auto text-text/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <h3 className="font-sans font-semibold text-xl text-text mt-4">No saved places yet</h3>
          <p className="font-sans text-text/60 mt-2">Browse our eco-directory and save your favorite places!</p>
          <Link href="/dashboard/overview/places">
            <button className="mt-6 px-6 py-3 bg-primary text-white rounded-xl font-sans font-medium hover:bg-primary/90 transition-colors duration-200 cursor-pointer">
              Explore Eco Directory
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}