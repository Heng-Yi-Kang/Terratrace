"use client";

import { CarbonResult, Trip } from '../constant/types';
import { TripCard } from '../component/TripCard';
import { useRef, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { calculateAndSave } from '@/utils/carbon';

type Props = {
  trips: Trip[]
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>
  setResult: (r: CarbonResult | null) => void

}

let nextId = 2;

export function CarbonCalculator({ trips, setTrips, setResult }: Props) {

  const AddTrip = () => {
    const newTrip: Trip = {
      id: String(nextId),
      type: 'flight',
      flightClass: 'economy',
      distanceKm: 0,
      isReturn: false
    }

    nextId++
    setTrips([...trips, newTrip])
  }

  const removeTrip = (id: String) => {
    const filter = trips.filter(trip => trip.id !== id)
    setTrips(filter)
  }

  const updateTrip = (id: String, patch: Partial<Trip>) => {
    const update = trips.map(trips => {
      if (trips.id === id) {
        return { ...trips, ...patch } as Trip
      }
      return trips
    })

    setTrips(update)
  }

  const switchTab = (id: String, type: Trip['type']) => {

    const updates = trips.map(trip => {
      if (trip.id !== id)
        return trip


      if (type === 'flight') {
        return { id, type: 'flight', distanceKm: 0, flightClass: 'economy',  isReturn: false } as Trip
      } else if (type === 'car') {
        return { id, type: 'car', distanceKm: 0, CarType: 'petrol', passengers: 1 } as Trip
      } else if (type === 'hotel') {
        return { id, type: 'hotel', nights: 1, HotelType: 'standard' } as Trip
      } else if (type === 'rail') {
        return { id, type: 'rail', distanceKm: 0, RailType: 'national',  isReturn: false } as Trip
      } else if (type === 'bus') {
        return { id, type: 'bus', distanceKm: 0, BusType: 'standard' } as Trip
      } else {
        return { id, type: 'taxi', distanceKm: 0 } as Trip
      }
    })
    setTrips(updates);
  }


  const [loading, setLoading] = useState(false)
  const [validationError, setValidationError] = useState<String | null>(null)

  const isCanceled = useRef(false)

  const calculation = async () => {
    setValidationError(null)

    for ( let i = 0; i<trips.length; i++){
      const trip = trips[i]
      const label = `Trip ${i + 1}`
      isCanceled.current = false

      if (trip.type == 'hotel'){
        if (!trip.nights || trip.nights < 1) {
          setValidationError(`${label}: must be at least 1 Night `)
          return
        }
      } else {
        if (!trip.distanceKm || trip.distanceKm < 0) {
          setValidationError(`${label}: Distance must be at least more than 0 km `)
          return
        }
      }

      if (trip.type == 'car' && (!trip.passengers || trip.passengers < 1)){
          setValidationError(`${label}: Passengers must be at least 1`)
          return
      }

    }

    setLoading(true)

    try {
      const supabase = createClient()
      const {data: {user}} = await supabase.auth.getUser()

      const result = await calculateAndSave(trips)
      setResult(result)
    } catch (error) {
      console.error('Calculation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    isCanceled.current = true
    setTrips([{
      id: '1',
      type: 'flight',
      distanceKm: 0,
      flightClass: 'economy',
      isReturn: false
    }])

    setValidationError(null)

    nextId = 2
    setResult(null)
  }


  return (

    <section className=" relative overflow-hidden ">

      <div className="max-w-4xl mx-auto">

        <div className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-text mb-2"> Carbon Footprint Calculator</h2>
            <p className="text-text/60">Calculate your carbon emissions from various travel activities</p>
          </div>

        <div className=" space-y-2">
          {trips.map((trips, index) => (

            <TripCard
              key={String(trips.id)}
              trip={trips}
              index={index + 1}
              onUpdate={(patch) => updateTrip(trips.id, patch)}
              onRemove={() => removeTrip(trips.id)}
              onSwitchType={(type) => switchTab(trips.id, type)}
            />
          ))}

        </div>

        <button onClick={AddTrip} className="w-full p-4 mt-4 bg-white border-2 border-dashed border-gray-400 text-text/60 rounded-organic font semibold hover:border-primary hover:text-primary transition-colors duration-200">
          + Add another trip
        </button>

        {validationError && (
          <div className = "mt-4 text-red-400  p-3 text-sm">
            {validationError}
          </div>
        )}


        <button onClick={calculation} disabled={loading} className="bg-primary mt-4 text-xl text-white p-4 w-full rounded-organic font-semibold hover:bg-primary/80 transition-colors duration-200 shadow-lg flex items-center justify-center disabled:opacity-60">
          {loading ? 'Calculating...' : 'Calculate'}
        </button>

        <button onClick={reset} className=" bg-white/40 mt-2 text-lg text-text/80 p-4 w-full rounded-organic font-semibold hover:bg-gray-200 hover:text-text transition-colors duration-200 shadow-lg flex items-center justify-center">
          Reset
        </button>

      </div>

    </section>
  )

}
