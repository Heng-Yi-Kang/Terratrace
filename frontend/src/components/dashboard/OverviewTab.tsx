'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import StatCard from './StatCard'
import { useUser } from '@/hooks/useUser'

const SAVED_TRIPS_KEY = 'terratrace_saved_trips'

type SavedTrip = { id: string; destination?: string; ecoScore: number; status: string; savedFromRecommendation?: boolean }

function calculateCarbonSaved(trips: { ecoScore: number }[]): number {
  const avgEcoScore = trips.length > 0
    ? trips.reduce((sum, t) => sum + t.ecoScore, 0) / trips.length
    : 75
  const baselineScore = 50
  const carbonPerTrip = 50
  return Math.round(trips.length * carbonPerTrip * ((avgEcoScore - baselineScore) / 50))
}

export default function OverviewTab() {
  const [totalTrips, setTotalTrips] = useState(0)
  const [carbonSaved, setCarbonSaved] = useState(0)
  const [placesVisited, setPlacesVisited] = useState(0)
  const { data: user } = useUser()
  const username = user?.user_metadata?.username || ''

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(SAVED_TRIPS_KEY)
    let savedTrips: SavedTrip[] = []
    if (stored) {
      try {
        savedTrips = JSON.parse(stored) as SavedTrip[]
      } catch {
        savedTrips = []
      }
    }
    setTotalTrips(savedTrips.length)
    setCarbonSaved(calculateCarbonSaved(savedTrips))
    setPlacesVisited(savedTrips.filter(t => t.status === 'completed').length)
  }, [])

  const stats = [
    {
      title: 'Total Trips',
      value: totalTrips,
      subtitle: 'Saved trips',
      color: 'primary' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Carbon Saved',
      value: `${carbonSaved} kg`,
      subtitle: 'CO₂ equivalent',
      color: 'secondary' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Places Visited',
      value: placesVisited,
      subtitle: 'Completed trips',
      color: 'cyan' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      title: 'CO₂ Offset',
      value: '0 kg',
      subtitle: 'No offset data yet',
      color: 'cta' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-sans font-bold text-3xl text-text">Welcome back, {username || 'Eco Traveler'}</h1>
        <p className="font-sans text-text/60 mt-2">Here&apos;s your sustainability journey at a glance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-sans font-medium hover:bg-primary/90 transition-colors duration-200 cursor-pointer">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Plan New Trip
        </button>
        <Link 
          href="/dashboard/overview/places"
          className="flex items-center gap-2 px-6 py-3 bg-white text-text border border-text/20 rounded-xl font-sans font-medium hover:bg-background transition-colors duration-200 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Browse Places
        </Link>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white/80 backdrop-blur-md rounded-organic p-6 shadow-organic">
          <h2 className="font-sans font-semibold text-xl text-text mb-4">Recent Activity</h2>
          <p className="font-sans text-text/60">No recent activity yet.</p>
        </div>

        {/* Eco Tips */}
        <div className="bg-white/80 backdrop-blur-md rounded-organic p-6 shadow-organic">
          <h2 className="font-sans font-semibold text-xl text-text mb-4">Eco Travel Tips</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="font-sans text-text/80">Choose trains over flights for distances under 500km to reduce 90% of CO₂ emissions</p>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="font-sans text-text/80">Look for hotels with Green Key or EarthCheck certifications</p>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="font-sans text-text/80">Eat at local, farm-to-table restaurants to support sustainable tourism</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
