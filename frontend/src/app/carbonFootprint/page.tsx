"use client";

import { useEffect, useState } from 'react';
import * as icons from './component/icons';
import { CarbonResult, Trip } from './constant/types'
import { ImpactInsights } from './sections/ImpactInsights';
import { CarbonOffset } from './sections/CarbonOffset';
import { CarbonCalculator } from './sections/CarbonCalculator'


const defaultTrip: Trip = {

  id: '1',
  type: 'flight',
  distanceKm: 0,
  flightClass: 'economy',
  duration: 'short',
  isReturn: false
};

export default function CarbonFootprint() {

  const [trips, setTrips] = useState<Trip[]>([defaultTrip])
  const [result, setResult] = useState<CarbonResult | null>(null)

  const handleResult = (r: CarbonResult | null) => {
    setResult(r)
  }

  useEffect(() => {
    if (result) {
      document.getElementById('impact')?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [result])


  return (
    <>
      <div>
        <CarbonCalculator
          trips={trips}
          setTrips={setTrips}
          setResult={handleResult}

        />
      </div>

      <div id="impact" >
        <ImpactInsights result={result} />
      </div>

      {result && (
        <div className="mt-12">
          <CarbonOffset result={result} />
        </div>
      )}
    </>
  )
}