'use client'

import { useState, useEffect } from 'react'
import SmartRecommendationModal from './SmartRecommendationModal'
import type { Trip, SavedTripFromRecommendation, TripStatus, EcoScoreFilter } from '@/types/trip'

const SAVED_TRIPS_KEY = 'terratrace_saved_trips'

const mockTrips: Trip[] = [
  {
    id: 1,
    destination: 'Copenhagen, Denmark',
    dates: 'May 15 - May 22, 2026',
    ecoScore: 92,
    status: 'upcoming',
    imageColor: 'bg-emerald-500',
  },
  {
    id: 2,
    destination: 'Amsterdam, Netherlands',
    dates: 'April 5 - April 10, 2026',
    ecoScore: 88,
    status: 'upcoming',
    imageColor: 'bg-cyan-500',
  },
  {
    id: 3,
    destination: 'Vienna, Austria',
    dates: 'Feb 20 - Feb 27, 2026',
    ecoScore: 95,
    status: 'completed',
    imageColor: 'bg-teal-500',
  },
  {
    id: 4,
    destination: 'Barcelona, Spain',
    dates: 'Jan 10 - Jan 15, 2026',
    ecoScore: 76,
    status: 'completed',
    imageColor: 'bg-green-600',
  },
]

export default function TripsTab() {
  const [statusFilter, setStatusFilter] = useState<TripStatus>('all')
  const [ecoFilter, setEcoFilter] = useState<EcoScoreFilter>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [dateLimits, setDateLimits] = useState({ min: '', max: '' })
  const [showRecommendationModal, setShowRecommendationModal] = useState(false)
  const [savedTrips, setSavedTrips] = useState<SavedTripFromRecommendation[]>([])

  useEffect(() => {
    const today = new Date()
    const maxDate = new Date()
    maxDate.setDate(today.getDate() + 33)

    const fmt = (d: Date) => {
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    setDateLimits({ min: fmt(today), max: fmt(maxDate) })
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(SAVED_TRIPS_KEY)
    if (stored) {
      try {
        setSavedTrips(JSON.parse(stored) as SavedTripFromRecommendation[])
      } catch {
        setSavedTrips([])
      }
    }
  }, [])

  const handleTripSaved = (trip: SavedTripFromRecommendation) => {
    const updated = [trip, ...savedTrips]
    setSavedTrips(updated)
    localStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(updated))
    setShowRecommendationModal(false)
  }

  const allTrips: Trip[] = [...mockTrips, ...savedTrips]

  const filteredTrips = allTrips.filter((trip) => {
    if (statusFilter !== 'all' && trip.status !== statusFilter) return false
    if (ecoFilter === 'high' && trip.ecoScore < 90) return false
    if (ecoFilter === 'medium' && (trip.ecoScore >= 90 || trip.ecoScore < 70)) return false
    if (startDate || endDate) {
      const tripDates = trip.dates.replace(/,\s*\d{4}$/, '').split(' - ')
      const months: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 }
      const parseTripDate = (d: string) => {
        const parts = d.trim().split(' ')
        return new Date(2026, months[parts[0]], parseInt(parts[1]))
      }
      const tripStart = parseTripDate(tripDates[0])
      const tripEnd = parseTripDate(tripDates[1] || tripDates[0])
      if (startDate && tripEnd < new Date(startDate)) return false
      if (endDate && tripStart > new Date(endDate)) return false
    }
    return true
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-sans font-bold text-3xl text-text">My Trips</h1>
          <p className="font-sans text-text/60 mt-2">Plan and manage your eco-friendly journeys</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowRecommendationModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-sans font-medium hover:bg-secondary transition-colors duration-200 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Get Smart Recommendations
          </button>
          <button className="flex items-center gap-2 px-6 py-3 border border-primary text-primary rounded-xl font-sans font-medium hover:bg-primary/5 transition-colors duration-200 cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Manual Plan
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label htmlFor="tripStartDate" className="block text-sm font-medium text-text mb-2">
            From
          </label>
          <input
            type="date"
            id="tripStartDate"
            value={startDate}
            min={dateLimits.min}
            max={dateLimits.max}
            onChange={(event) => setStartDate(event.target.value)}
            className="px-4 py-2 rounded-xl border border-text/20 text-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors duration-200"
          />
        </div>
        <div>
          <label htmlFor="tripEndDate" className="block text-sm font-medium text-text mb-2">
            To
          </label>
          <input
            type="date"
            id="tripEndDate"
            value={endDate}
            min={startDate || dateLimits.min}
            max={dateLimits.max}
            onChange={(event) => setEndDate(event.target.value)}
            className="px-4 py-2 rounded-xl border border-text/20 text-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors duration-200"
          />
        </div>
        {(startDate || endDate) && (
          <button
            onClick={() => { setStartDate(''); setEndDate('') }}
            className="px-4 py-2 text-sm text-text/60 hover:text-text transition-colors duration-200 cursor-pointer"
          >
            Clear dates
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex bg-white/80 rounded-xl p-1 shadow-sm">
          {(['all', 'upcoming', 'completed'] as TripStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-sans text-sm font-medium transition-all duration-200 cursor-pointer ${
                statusFilter === status
                  ? 'bg-primary text-white'
                  : 'text-text/60 hover:text-text'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex bg-white/80 rounded-xl p-1 shadow-sm">
          {[
            { id: 'all' as EcoScoreFilter, label: 'All Scores' },
            { id: 'high' as EcoScoreFilter, label: 'High (90+)' },
            { id: 'medium' as EcoScoreFilter, label: 'Medium (70-89)' },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setEcoFilter(filter.id)}
              className={`px-4 py-2 rounded-lg font-sans text-sm font-medium transition-all duration-200 cursor-pointer ${
                ecoFilter === filter.id
                  ? 'bg-secondary text-white'
                  : 'text-text/60 hover:text-text'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trips Grid */}
      {filteredTrips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTrips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white/80 backdrop-blur-md rounded-organic overflow-hidden shadow-organic hover:shadow-organic-lg transition-all duration-200 cursor-pointer"
            >
              <div className={`h-32 ${trip.imageColor} relative`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-16 h-16 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="absolute top-3 right-3 flex gap-1.5">
                  {trip.savedFromRecommendation && (
                    <span className="px-2 py-1 rounded-full bg-secondary/90 text-xs font-sans font-semibold text-white">
                      AI Recommended
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full bg-white/90 text-xs font-sans font-semibold text-text">
                    {trip.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-sans font-semibold text-xl text-text">{trip.destination}</h3>
                <p className="font-sans text-text/60 mt-1">{trip.dates}</p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-background rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${trip.ecoScore}%` }}
                      />
                    </div>
                    <span className="font-sans text-sm font-medium text-primary">{trip.ecoScore}</span>
                  </div>
                  <span className="font-sans text-xs text-text/50">Eco Score</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-md rounded-organic p-12 text-center shadow-organic">
          <svg className="w-16 h-16 mx-auto text-text/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="font-sans font-semibold text-xl text-text mt-4">No trips found</h3>
          <p className="font-sans text-text/60 mt-2">Start planning your first eco-friendly adventure!</p>
          <button className="mt-6 px-6 py-3 bg-primary text-white rounded-xl font-sans font-medium hover:bg-primary/90 transition-colors duration-200 cursor-pointer">
            Plan Your First Trip
          </button>
        </div>
      )}
    {showRecommendationModal && (
        <SmartRecommendationModal
          onClose={() => setShowRecommendationModal(false)}
          onSave={handleTripSaved}
        />
      )}
    </div>
  )
}