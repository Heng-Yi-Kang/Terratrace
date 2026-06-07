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
  isReturn: false
};

type Props = {
  onCalculated?: () => void
}

export default function CarbonFootprint({onCalculated}: Props) {

  const [trips, setTrips] = useState<Trip[]>([defaultTrip])
  const [result, setResult] = useState<CarbonResult | null>(null)

  const handleResult = (r: CarbonResult | null) => {
    setResult(r)
    if (r && onCalculated){
      onCalculated()
    }
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