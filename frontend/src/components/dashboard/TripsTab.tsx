'use client'

import { useMemo, useState } from 'react'
import { CalendarDays, Edit3, Plus, Save, Trash2, X } from 'lucide-react'
import SmartRecommendationSection from '@/components/smart-recommendation-section'
import {
  useCreateTrip,
  useDeleteTrip,
  useImportLocalTrips,
  useTrips,
  useUpdateTrip,
} from '@/hooks/useTrips'
import type { DayPart, EcoScoreFilter, PersistedTripStatus, Trip, TripItem, TripPayload, TripStatus } from '@/types/trip'

type TripForm = {
  destination: string
  startDate: string
  endDate: string
  budget: string
  interests: string
  ecoScore: string
  status: PersistedTripStatus
  weatherCondition: string
  totalEstimatedCost: string
  items: TripItem[]
}

const dayParts: DayPart[] = ['morning', 'afternoon', 'evening', 'flexible']

const today = () => new Date().toISOString().slice(0, 10)

const emptyForm = (): TripForm => {
  const date = today()
  return {
    destination: '',
    startDate: date,
    endDate: date,
    budget: '',
    interests: '',
    ecoScore: '75',
    status: 'upcoming',
    weatherCondition: '',
    totalEstimatedCost: '',
    items: [],
  }
}

function formFromTrip(trip: Trip): TripForm {
  return {
    destination: trip.destination,
    startDate: trip.startDate,
    endDate: trip.endDate,
    budget: trip.budget?.toString() || '',
    interests: trip.interests.join(', '),
    ecoScore: trip.ecoScore.toString(),
    status: trip.status,
    weatherCondition: trip.weatherCondition || '',
    totalEstimatedCost: trip.totalEstimatedCost?.toString() || '',
    items: trip.items.length > 0 ? trip.items : [],
  }
}

function dateRange(startDate: string, endDate: string) {
  const dates: string[] = []
  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)
  const cursor = new Date(start)

  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10))
    cursor.setDate(cursor.getDate() + 1)
  }

  return dates.length > 0 ? dates : [startDate]
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${value}T00:00:00`))
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(`${value}T00:00:00`))
}

function normalizeForm(form: TripForm, source: TripPayload['source'] = 'manual'): TripPayload {
  return {
    destination: form.destination.trim(),
    startDate: form.startDate,
    endDate: form.endDate,
    budget: form.budget ? Number(form.budget) : null,
    interests: form.interests.split(',').map((item) => item.trim()).filter(Boolean),
    ecoScore: Math.max(0, Math.min(100, Number(form.ecoScore) || 75)),
    status: form.status,
    source,
    sourceRequestId: null,
    weatherCondition: form.weatherCondition.trim() || null,
    totalEstimatedCost: form.totalEstimatedCost ? Number(form.totalEstimatedCost) : null,
    items: form.items
      .filter((item) => item.title.trim())
      .map((item, index) => ({
        ...item,
        tripDate: item.tripDate || form.startDate,
        title: item.title.trim(),
        category: item.category.trim() || 'activity',
        estimatedCost: item.estimatedCost === undefined || item.estimatedCost === null ? null : Number(item.estimatedCost),
        sortOrder: index,
      })),
  }
}

function calculateCarbonSaved(trips: { ecoScore: number }[]): number {
  if (trips.length === 0) return 0
  const avgEcoScore = trips.reduce((sum, trip) => sum + trip.ecoScore, 0) / trips.length
  return Math.max(0, Math.round(trips.length * 50 * ((avgEcoScore - 50) / 50)))
}

export default function TripsTab() {
  useImportLocalTrips()

  const { data: trips = [], isLoading, isError, error } = useTrips()
  const createTrip = useCreateTrip()
  const updateTrip = useUpdateTrip()
  const deleteTrip = useDeleteTrip()
  const [statusFilter, setStatusFilter] = useState<TripStatus>('all')
  const [ecoFilter, setEcoFilter] = useState<EcoScoreFilter>('all')
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const [editingTripId, setEditingTripId] = useState<string | null>(null)
  const [form, setForm] = useState<TripForm>(emptyForm)
  const [formError, setFormError] = useState('')

  const filteredTrips = trips.filter((trip) => {
    if (statusFilter !== 'all' && trip.status !== statusFilter) return false
    if (ecoFilter === 'high' && trip.ecoScore < 90) return false
    if (ecoFilter === 'medium' && (trip.ecoScore >= 90 || trip.ecoScore < 70)) return false
    return true
  })

  const selectedTrip = useMemo(() => {
    return filteredTrips.find((trip) => trip.id === selectedTripId) || filteredTrips[0] || null
  }, [filteredTrips, selectedTripId])

  const tripStats = useMemo(() => {
    return {
      total: trips.length,
      upcoming: trips.filter((trip) => trip.status === 'upcoming').length,
      completed: trips.filter((trip) => trip.status === 'completed').length,
      carbonSaved: calculateCarbonSaved(trips),
    }
  }, [trips])

  const startCreate = () => {
    setEditingTripId('new')
    setSelectedTripId(null)
    setForm(emptyForm())
    setFormError('')
  }

  const startEdit = (trip: Trip) => {
    setEditingTripId(trip.id)
    setSelectedTripId(trip.id)
    setForm(formFromTrip(trip))
    setFormError('')
  }

  const cancelEdit = () => {
    setEditingTripId(null)
    setForm(emptyForm())
    setFormError('')
  }

  const addItem = () => {
    setForm((current) => ({
      ...current,
      items: [
        ...current.items,
        {
          tripDate: current.startDate,
          dayPart: 'flexible',
          title: '',
          category: 'activity',
          estimatedCost: null,
          rationale: '',
          weatherAlternative: '',
          communityImpact: '',
          sortOrder: current.items.length,
        },
      ],
    }))
  }

  const updateItem = (index: number, patch: Partial<TripItem>) => {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
    }))
  }

  const removeItem = (index: number) => {
    setForm((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const saveForm = async () => {
    const payload = normalizeForm(form)
    if (!payload.destination) {
      setFormError('Destination is required.')
      return
    }
    if (!payload.startDate || !payload.endDate || payload.startDate > payload.endDate) {
      setFormError('Choose a valid date range.')
      return
    }

    setFormError('')
    const saved = editingTripId === 'new'
      ? await createTrip.mutateAsync(payload)
      : await updateTrip.mutateAsync({ id: editingTripId!, trip: payload })

    setSelectedTripId(saved.id)
    setEditingTripId(null)
  }

  const handleDelete = async (trip: Trip) => {
    await deleteTrip.mutateAsync(trip.id)
    setSelectedTripId(null)
    if (editingTripId === trip.id) cancelEdit()
  }

  const handleSaveRecommendation = async (payload: TripPayload) => {
    const saved = await createTrip.mutateAsync(payload)
    setSelectedTripId(saved.id)
  }

  const groupedItems = useMemo(() => {
    if (!selectedTrip) return []
    return dateRange(selectedTrip.startDate, selectedTrip.endDate).map((date) => ({
      date,
      parts: dayParts.map((part) => ({
        part,
        items: selectedTrip.items.filter((item) => item.tripDate === date && item.dayPart === part),
      })),
    }))
  }, [selectedTrip])

  const saving = createTrip.isPending || updateTrip.isPending

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="font-sans font-bold text-3xl text-text">My Trips</h1>
          <p className="font-sans text-text/60 mt-2">Plan, save, and edit your eco-friendly itineraries</p>
        </div>
        <button
          onClick={startCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-sans font-semibold hover:bg-primary/90 transition-colors duration-200 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          New Trip
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Total Trips', tripStats.total],
          ['Upcoming', tripStats.upcoming],
          ['Completed', tripStats.completed],
          ['Carbon Saved', `${tripStats.carbonSaved} kg`],
        ].map(([label, value]) => (
          <div key={label} className="bg-white/80 rounded-organic p-4 shadow-organic">
            <p className="text-sm text-text/60">{label}</p>
            <p className="mt-1 font-sans font-bold text-2xl text-text">{value}</p>
          </div>
        ))}
      </div>

      <SmartRecommendationSection hideNavbar onSaveTrip={handleSaveRecommendation} />

      <div className="flex flex-wrap gap-4">
        <div className="flex bg-white/80 rounded-xl p-1 shadow-sm">
          {(['all', 'upcoming', 'completed'] as TripStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-sans text-sm font-medium transition-all duration-200 cursor-pointer ${
                statusFilter === status ? 'bg-primary text-white' : 'text-text/60 hover:text-text'
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
                ecoFilter === filter.id ? 'bg-secondary text-white' : 'text-text/60 hover:text-text'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error instanceof Error ? error.message : 'Unable to load trips.'}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(280px,360px)_1fr] gap-6">
        <div className="space-y-4">
          {isLoading && (
            <div className="bg-white/80 rounded-organic p-6 shadow-organic text-text/60">Loading trips...</div>
          )}

          {!isLoading && filteredTrips.length === 0 && (
            <div className="bg-white/80 rounded-organic p-8 text-center shadow-organic">
              <CalendarDays className="w-12 h-12 mx-auto text-text/25" />
              <h3 className="font-sans font-semibold text-xl text-text mt-4">No trips found</h3>
              <p className="font-sans text-text/60 mt-2">Create a trip or save a recommendation to start your itinerary.</p>
              <button
                onClick={startCreate}
                className="mt-5 inline-flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-sans font-medium hover:bg-primary/90 transition-colors duration-200 cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                Plan Your First Trip
              </button>
            </div>
          )}

          {filteredTrips.map((trip) => (
            <button
              key={trip.id}
              onClick={() => setSelectedTripId(trip.id)}
              className={`w-full text-left bg-white/80 rounded-organic p-5 shadow-organic hover:shadow-organic-lg transition-all duration-200 cursor-pointer border ${
                selectedTrip?.id === trip.id ? 'border-primary/50' : 'border-white/60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-sans font-semibold text-lg text-text">{trip.destination}</h3>
                  <p className="font-sans text-sm text-text/60 mt-1">
                    {formatShortDate(trip.startDate)} - {formatShortDate(trip.endDate)}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-background text-xs font-semibold text-text">
                  {trip.status}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${trip.ecoScore}%` }} />
                  </div>
                  <span className="font-sans text-sm font-semibold text-primary">{trip.ecoScore}</span>
                </div>
                <span className="text-xs text-text/50">{trip.items.length} items</span>
              </div>
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {editingTripId ? (
            <div className="bg-white/80 rounded-organic p-6 shadow-organic">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-sans font-semibold text-xl text-text">
                  {editingTripId === 'new' ? 'Create Trip' : 'Edit Trip'}
                </h2>
                <button
                  onClick={cancelEdit}
                  className="p-2 rounded-lg text-text/60 hover:text-text hover:bg-text/10 transition-colors cursor-pointer"
                  aria-label="Close editor"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-5 grid md:grid-cols-2 gap-4">
                <label className="space-y-2">
                  <span className="block text-sm font-medium text-text">Destination</span>
                  <input
                    value={form.destination}
                    onChange={(event) => setForm({ ...form, destination: event.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-text/20 bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </label>
                <label className="space-y-2">
                  <span className="block text-sm font-medium text-text">Budget</span>
                  <input
                    type="number"
                    min={0}
                    value={form.budget}
                    onChange={(event) => setForm({ ...form, budget: event.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-text/20 bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </label>
                <label className="space-y-2">
                  <span className="block text-sm font-medium text-text">Start date</span>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(event) => setForm({ ...form, startDate: event.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-text/20 bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </label>
                <label className="space-y-2">
                  <span className="block text-sm font-medium text-text">End date</span>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(event) => setForm({ ...form, endDate: event.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-text/20 bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </label>
                <label className="space-y-2">
                  <span className="block text-sm font-medium text-text">Interests</span>
                  <input
                    value={form.interests}
                    onChange={(event) => setForm({ ...form, interests: event.target.value })}
                    placeholder="nature, food, culture"
                    className="w-full px-4 py-3 rounded-xl border border-text/20 bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-2">
                    <span className="block text-sm font-medium text-text">Eco score</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={form.ecoScore}
                      onChange={(event) => setForm({ ...form, ecoScore: event.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-text/20 bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="block text-sm font-medium text-text">Status</span>
                    <select
                      value={form.status}
                      onChange={(event) => setForm({ ...form, status: event.target.value as PersistedTripStatus })}
                      className="w-full px-4 py-3 rounded-xl border border-text/20 bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="completed">Completed</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-sans font-semibold text-lg text-text">Itinerary</h3>
                  <button
                    onClick={addItem}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-background text-text font-medium hover:bg-primary/10 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {form.items.map((item, index) => (
                    <div key={`${index}-${item.id || item.title}`} className="rounded-xl border border-text/10 bg-white p-4">
                      <div className="grid md:grid-cols-[1fr_150px_150px_auto] gap-3">
                        <input
                          value={item.title}
                          onChange={(event) => updateItem(index, { title: event.target.value })}
                          placeholder="Activity or place"
                          className="px-3 py-2 rounded-lg border border-text/20 text-text focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <select
                          value={item.tripDate}
                          onChange={(event) => updateItem(index, { tripDate: event.target.value })}
                          className="px-3 py-2 rounded-lg border border-text/20 text-text focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                          {dateRange(form.startDate, form.endDate).map((date) => (
                            <option key={date} value={date}>{formatShortDate(date)}</option>
                          ))}
                        </select>
                        <select
                          value={item.dayPart}
                          onChange={(event) => updateItem(index, { dayPart: event.target.value as DayPart })}
                          className="px-3 py-2 rounded-lg border border-text/20 text-text focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                          {dayParts.map((part) => <option key={part} value={part}>{part}</option>)}
                        </select>
                        <button
                          onClick={() => removeItem(index)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          aria-label="Remove itinerary item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="mt-3 grid md:grid-cols-2 gap-3">
                        <input
                          value={item.category}
                          onChange={(event) => updateItem(index, { category: event.target.value })}
                          placeholder="Category"
                          className="px-3 py-2 rounded-lg border border-text/20 text-text focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <input
                          type="number"
                          min={0}
                          value={item.estimatedCost ?? ''}
                          onChange={(event) => updateItem(index, { estimatedCost: event.target.value ? Number(event.target.value) : null })}
                          placeholder="Estimated cost"
                          className="px-3 py-2 rounded-lg border border-text/20 text-text focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                    </div>
                  ))}

                  {form.items.length === 0 && (
                    <div className="rounded-xl border border-dashed border-text/20 bg-white/70 p-5 text-text/60">
                      No itinerary items yet.
                    </div>
                  )}
                </div>
              </div>

              {formError && <p className="mt-4 text-sm text-red-600">{formError}</p>}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={saveForm}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors cursor-pointer"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save Trip'}
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-5 py-3 rounded-xl bg-white border border-text/20 text-text font-semibold hover:bg-background transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : selectedTrip ? (
            <div className="bg-white/80 rounded-organic p-6 shadow-organic">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm text-text/60">{selectedTrip.source === 'recommendation' ? 'Smart recommendation' : 'Manual trip'}</p>
                  <h2 className="font-sans font-bold text-2xl text-text mt-1">{selectedTrip.destination}</h2>
                  <p className="text-text/60 mt-2">{formatDate(selectedTrip.startDate)} - {formatDate(selectedTrip.endDate)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(selectedTrip)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-background text-text font-semibold hover:bg-primary/10 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(selectedTrip)}
                    disabled={deleteTrip.isPending}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-700 font-semibold hover:bg-red-100 disabled:opacity-60 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">Eco score {selectedTrip.ecoScore}</span>
                <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-semibold">{selectedTrip.status}</span>
                {selectedTrip.budget !== null && selectedTrip.budget !== undefined && (
                  <span className="px-3 py-1 rounded-full bg-background text-text/70 text-sm font-semibold">Budget {selectedTrip.budget}</span>
                )}
                {selectedTrip.totalEstimatedCost !== null && selectedTrip.totalEstimatedCost !== undefined && (
                  <span className="px-3 py-1 rounded-full bg-background text-text/70 text-sm font-semibold">Estimated {selectedTrip.totalEstimatedCost}</span>
                )}
              </div>

              <div className="mt-6 space-y-6">
                {groupedItems.map(({ date, parts }) => (
                  <section key={date}>
                    <h3 className="font-sans font-semibold text-lg text-text">{formatDate(date)}</h3>
                    <div className="mt-3 grid md:grid-cols-2 gap-3">
                      {parts.map(({ part, items }) => (
                        <div key={part} className="rounded-xl bg-white border border-text/10 p-4">
                          <p className="text-xs uppercase font-semibold text-text/50">{part}</p>
                          <div className="mt-3 space-y-3">
                            {items.length === 0 ? (
                              <p className="text-sm text-text/45">No items</p>
                            ) : items.map((item) => (
                              <article key={item.id || `${item.title}-${item.sortOrder}`}>
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <h4 className="font-semibold text-text">{item.title}</h4>
                                    <p className="text-sm text-text/60">{item.category}</p>
                                  </div>
                                  {item.estimatedCost !== null && item.estimatedCost !== undefined && (
                                    <span className="text-sm font-semibold text-primary">{item.estimatedCost}</span>
                                  )}
                                </div>
                                {item.rationale && <p className="mt-2 text-sm text-text/70">{item.rationale}</p>}
                              </article>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white/80 rounded-organic p-8 text-center shadow-organic">
              <CalendarDays className="w-12 h-12 mx-auto text-text/25" />
              <h3 className="font-sans font-semibold text-xl text-text mt-4">Select a trip</h3>
              <p className="font-sans text-text/60 mt-2">Choose a saved trip or create a new itinerary.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
