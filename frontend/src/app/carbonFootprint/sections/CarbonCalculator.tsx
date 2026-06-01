"use client";

import { CarbonResult, Trip } from '../constant/types';
import { calculate, CalcTotal } from '../constant/calculate'
import { TripCard } from '../component/TripCard';

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
      duration: 'short',
      passengers: 1,
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
        return { id, type: 'flight', distanceKm: 0, flightClass: 'economy', duration: 'short', passengers: 1, isReturn: false } as Trip
      } else if (type === 'car') {
        return { id, type: 'car', distanceKm: 0, CarType: 'petrol', passengers: 1 } as Trip
      } else if (type === 'hotel') {
        return { id, type: 'hotel', nights: 1, HotelType: 'standard' } as Trip
      } else if (type === 'rail') {
        return { id, type: 'rail', distanceKm: 0, RailType: 'national', passengers: 1, isReturn: false } as Trip
      } else if (type === 'bus') {
        return { id, type: 'bus', distanceKm: 0, BusType: 'standard', passengers: 1 } as Trip
      } else {
        return { id, type: 'taxi', distanceKm: 0 } as Trip
      }
    })
    setTrips(updates);
  }

  const calculation = () => {
    const total = CalcTotal(trips)
    setResult(total)
  }

  const reset = () => {
    setTrips([{
      id: '1',
      type: 'flight',
      distanceKm: 0,
      flightClass: 'economy',
      duration: 'short',
      passengers: 1,
      isReturn: false
    }])

    nextId = 2
    setResult(null)
  }


  return (

    <section>

      <div className="max-w-4xl mx-auto">
        <h2 className="font-bold text-3xl md:text-4xl text-center mb-8 text-text">
          Enter Travel details
        </h2>

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

        <button onClick={calculation} className="bg-primary mt-4 text-xl text-white p-4 w-full rounded-organic font-semibold hover:bg-primary/80 transition-colors duration-200 shadow-lg flex items-center justify-center">
          Calculate
        </button>

        <button onClick={reset} className=" bg-white/40 mt-2 text-lg text-text/80 p-4 w-full rounded-organic font-semibold hover:bg-gray-200 hover:text-text transition-colors duration-200 shadow-lg flex items-center justify-center">
          Reset
        </button>

      </div>

    </section>
  )

}
