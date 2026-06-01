"use client";

import * as icons from '../component/icons';
import { CarbonResult } from '../constant/types'
import Chart from '@/app/carbonFootprint/component/doughnutChart'


const getHighestSource = (result: CarbonResult) => {
  const sources = [
    { name: 'Flight', value: result.flightEmissions },
    { name: 'Car', value: result.carEmissions },
    { name: 'Hotel', value: result.hotelEmissions },
    { name: 'Rail', value: result.railEmissions },
    { name: 'Bus', value: result.busEmissions },
    { name: 'Taxi', value: result.taxiEmissions },
  ]

  return sources.reduce((max, curr) =>
    curr.value > max.value ? curr : max
  )
}

export const ImpactInsights = ({ result }: { result: CarbonResult | null }) => {

  if (!result) {
    return (
      <div className=" m-6 text-center text-text/70">
        No data. Please enter your travel details and calculate first to see insights.
      </div>
    )
  }

  const total = result.total;

  const flightPercentage = total ? ((result.flightEmissions / total) * 100).toFixed(1) : '0.0';
  const carPercentage = total ? ((result.carEmissions / total) * 100).toFixed(1) : '0.0';
  const hotelPercentage = total ? ((result.hotelEmissions / total) * 100).toFixed(1) : '0.0';
  const railPercentage = total ? ((result.railEmissions / total) * 100).toFixed(1) : '0.0';
  const busPercentage = total ? ((result.busEmissions / total) * 100).toFixed(1) : '0.0';
  const taxiPercentage = total ? ((result.taxiEmissions / total) * 100).toFixed(1) : '0.0';

  let recommendation = ''
  const highestSource = getHighestSource(result)

  if (highestSource.name === 'Flight') {
    recommendation = 'To reduce impact, consider taking a train or bus for shorter distances, or choose airlines with better sustainability practices.'
  } else if (highestSource.name === 'Car') {
    recommendation = 'To reduce impact, try carpooling, using public transportation, or switching to a more fuel-efficient or electric vehicle.'
  } else if (highestSource.name === 'Hotel') {
    recommendation = 'To reduce impact, look for eco-friendly hotels that have sustainability certifications, or consider alternative accommodations.'
  } else if (highestSource.name === 'Rail') {
    recommendation = 'To reduce impact, consider taking trains more often, as they generally have lower emissions per passenger than cars or planes.'
  } else if (highestSource.name === 'Bus') {
    recommendation = 'To reduce impact, try using buses for longer trips, as they can be more environmentally friendly than individual car travel.'
  } else if (highestSource.name === 'Taxi') {
    recommendation = 'To reduce impact, consider carpooling or using ride-sharing services to minimize the number of vehicles on the road.'
  }

  return (
    <div className="bg-white shadow-lg p-6 rounded-organic max-w-4xl mx-auto mt-4">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex-1 min-w-0">
              <h3 className="font-normal text-text/80">Total Emissions</h3>
              <div className="flex items-baseline">
                <p className="text-6xl font-bold text-text">{result.total.toFixed(2)}</p>
                <p className="text-xl text-text font-bold ms-2">kg CO<sub>2</sub></p>
              </div>
            </div>
    
            <div className="bg-primary/20 rounded-organic p-4 text-center">
              <h3 className="font-semibold text-4xl text-text">{Math.round(result.total / 22)}</h3>
              <p className="text-text/80 text-sm">trees/year to absorb</p>
            </div>
          </div>
    
          <Chart
            flight={flightPercentage ? parseFloat(flightPercentage) : 0}
            car={carPercentage ? parseFloat(carPercentage) : 0}
            hotel={hotelPercentage ? parseFloat(hotelPercentage) : 0}
            rail={railPercentage ? parseFloat(railPercentage) : 0}
            bus={busPercentage ? parseFloat(busPercentage) : 0}
            taxi={taxiPercentage ? parseFloat(taxiPercentage) : 0}
          />
    
          <div className="mt-6 text-center">
            <h3 className="font-bold text-xl text-text/80 mb-2">Highest Impact:</h3>
            <p className="text-text text-lg">{highestSource.name} contributes the most to your travel&apos;s carbon footprint.</p>
            <p className="text-text/80 italic mt-1">{recommendation}</p>
          </div>
    
          <hr className="my-6 border-text/10" />
    
          <h3 className="font-bold text-xl text-text mb-4">Breakdown:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <icons.PlaneIcon />
              <p className="text-text">
                <span className="font-semibold">{result.flightEmissions.toFixed(2)}</span> kg CO<sub>2</sub>{' '}
                <span className="text-primary">({flightPercentage}%)</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <icons.CarIcon />
              <p className="text-text">
                <span className="font-semibold">{result.carEmissions.toFixed(2)}</span> kg CO<sub>2</sub>{' '}
                <span className="text-primary">({carPercentage}%)</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <icons.HotelIcon />
              <p className="text-text">
                <span className="font-semibold">{result.hotelEmissions.toFixed(2)}</span> kg CO<sub>2</sub>{' '}
                <span className="text-primary">({hotelPercentage}%)</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <icons.TrainIcon />
              <p className="text-text">
                <span className="font-semibold">{result.railEmissions.toFixed(2)}</span> kg CO<sub>2</sub>{' '}
                <span className="text-primary">({railPercentage}%)</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <icons.BusIcon />
              <p className="text-text">
                <span className="font-semibold">{result.busEmissions.toFixed(2)}</span> kg CO<sub>2</sub>{' '}
                <span className="text-primary">({busPercentage}%)</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <icons.TaxiIcon />
              <p className="text-text">
                <span className="font-semibold">{result.taxiEmissions.toFixed(2)}</span> kg CO<sub>2</sub>{' '}
                <span className="text-primary">({taxiPercentage}%)</span>
              </p>
            </div>
          </div>
        </div>
      )
}