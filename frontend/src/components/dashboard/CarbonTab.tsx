'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import SelectOptions from '@/app/carbonFootprint/component/selectOptions'
import Chart from '@/app/carbonFootprint/component/doughnutChart'

// Emission multipliers
const FlightMultiplier = {
  economy: 1.0,
  business: 1.9,
  first: 2.8,
}

const CarMultiplier = {
  petrol: 0.1747,
  diesel: 0.1717,
  hybrid: 0.1172,
  electric: 0.053,
}

const HotelMultiplier = {
  budget: 15,
  standard: 30,
  luxury: 65,
}

const RailMultiplier = {
  national: 0.03546,
  international: 0.00446,
  lightRail: 0.02860,
  underground: 0.03200,
}

const BusMultiplier = {
  standard: 0.10385,
  coach: 0.027,
}

const TaxiMultiplier = {
  standard: 0.14861
}

type FlightClass = 'economy' | 'business' | 'first'
type CarType = 'petrol' | 'diesel' | 'hybrid' | 'electric'
type HotelType = 'budget' | 'standard' | 'luxury'
type RailType = 'national' | 'international' | 'lightRail' | 'underground'
type BusType = 'standard' | 'coach'
type TaxiType = 'standard'

const FlightdistanceCategory = {
  short: 0.158,
  long: 0.133
}

// Types
type Option<T extends string> = {
  label: string
  value: T
}

type CarbonResult = {
  total: number
  flightEmissions: number
  carEmissions: number
  hotelEmissions: number
  railEmissions: number
  busEmissions: number
  taxiEmissions: number
}

// Icons
const TaxiIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2h4" /><path d="m21 8-2 2-1.5-3.7A2 2 0 0 0 15.646 5H8.4a2 2 0 0 0-1.903 1.257L5 10 3 8" />
    <path d="M7 14h.01" /><path d="M17 14h.01" /><rect width="18" height="8" x="3" y="10" rx="2" />
    <path d="M5 18v2" /><path d="M19 18v2" />
  </svg>
)

const BusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 6 2 7" /><path d="M10 6h4" /><path d="m22 7-2-1" /><rect width="16" height="16" x="4" y="3" rx="2" />
    <path d="M4 11h16" /><path d="M8 15h.01" /><path d="M16 15h.01" /><path d="M6 19v2" /><path d="M18 21v-2" />
  </svg>
)

const BulbIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" /><path d="M10 22h4" />
  </svg>
)

const PlaneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 22h20" /><path d="M6.36 17.4 4 17l-2-4 1.1-.55a2 2 0 0 1 1.8 0l.17.1a2 2 0 0 0 1.8 0L8 12 5 6l.9-.45a2 2 0 0 1 2.09.2l4.02 3a2 2 0 0 0 2.1.2l4.19-2.06a2.41 2.41 0 0 1 1.73-.17L21 7a1.4 1.4 0 0 1 .87 1.99l-.38.76c-.23.46-.6.84-1.07 1.08L7.58 17.2a2 2 0 0 1-1.22.18Z" />
  </svg>
)

const CarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21 8-2 2-1.5-3.7A2 2 0 0 0 15.646 5H8.4a2 2 0 0 0-1.903 1.257L5 10 3 8" />
    <path d="M7 14h.01" /><path d="M17 14h.01" /><rect width="18" height="8" x="3" y="10" rx="2" />
    <path d="M5 18v2" /><path d="M19 18v2" />
  </svg>
)

const HotelIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 22v-6.57" /><path d="M12 11h.01" /><path d="M12 7h.01" /><path d="M14 15.43V22" />
    <path d="M15 16a5 5 0 0 0-6 0" /><path d="M16 11h.01" /><path d="M16 7h.01" /><path d="M8 11h.01" />
    <path d="M8 7h.01" /><rect x="4" y="2" width="16" height="20" rx="2" />
  </svg>
)

const TrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3.1V7a4 4 0 0 0 8 0V3.1" /><path d="m9 15-1-1" /><path d="m15 15 1-1" />
    <path d="M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5Z" /><path d="m8 19-2 3" /><path d="m16 19 2 3" />
  </svg>
)

const TreeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 19a4 4 0 0 1-2.24-7.32A3.5 3.5 0 0 1 9 6.03V6a3 3 0 1 1 6 0v.04a3.5 3.5 0 0 1 3.24 5.65A4 4 0 0 1 16 19Z" />
    <path d="M12 19v3" />
  </svg>
)

const LeafIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9A9 9 0 0012 3a9 9 0 00-4.5 9c0 4.97 2.015 9 4.5 9z" />
  </svg>
)

// Options
const FlightOptions: Option<FlightClass>[] = [
  { value: 'economy', label: 'Economy' },
  { value: 'business', label: 'Business' },
  { value: 'first', label: 'First Class' }
]

const CarOptions: Option<CarType>[] = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'electric', label: 'Electric' }
]

const HotelOptions: Option<HotelType>[] = [
  { value: 'budget', label: 'Budget' },
  { value: 'standard', label: 'Standard' },
  { value: 'luxury', label: 'Luxury' }
]

const RailOptions: Option<RailType>[] = [
  { value: 'national', label: 'National' },
  { value: 'international', label: 'International' },
  { value: 'lightRail', label: 'Light Rail' },
  { value: 'underground', label: 'Underground' }
]

const BusOptions: Option<BusType>[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'coach', label: 'Coach' }
]

const TaxiOptions: Option<TaxiType>[] = [
  { value: 'standard', label: 'Standard' },
]

// Dashboard stats data
const carbonData = {
  totalCarbon: 892,
  carbonSaved: 248,
  offset: 512,
  monthlyData: [
    { month: 'Jan', footprint: 120, saved: 45 },
    { month: 'Feb', footprint: 95, saved: 38 },
    { month: 'Mar', footprint: 110, saved: 52 },
    { month: 'Apr', footprint: 88, saved: 41 },
  ],
}

type StatsCardProps = {
  title: string
  value: number
  unit: string
  icon: React.ReactNode
  iconBgClass: string
}

function StatsCard({ title, value, unit, icon, iconBgClass }: StatsCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const [displayValue, setDisplayValue] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!isInView || hasAnimated.current) return
    hasAnimated.current = true

    const duration = 1500
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.floor(value * easeOut))

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setDisplayValue(value)
      }
    }

    requestAnimationFrame(animate)
  }, [isInView, value])

  return (
    <div ref={ref} className="bg-white/80 backdrop-blur-md rounded-organic p-6 shadow-organic">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-sans text-sm font-medium text-text/60">{title}</p>
          <p className="font-sans font-bold text-4xl text-text mt-2">
            {displayValue.toLocaleString()} <span className="text-lg font-normal text-text/60">{unit}</span>
          </p>
        </div>
        <div className={`w-14 h-14 rounded-full ${iconBgClass} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

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

const ImpactInsights = ({ result }: { result: CarbonResult | null }) => {
  if (!result) {
    return (
      <div className="text-center text-text/70 py-8">
        Enter your travel details and click Calculate to see your carbon footprint breakdown.
      </div>
    )
  }

  const total = result.total

  const flightPercentage = total ? ((result.flightEmissions / total) * 100).toFixed(1) : '0.0'
  const carPercentage = total ? ((result.carEmissions / total) * 100).toFixed(1) : '0.0'
  const hotelPercentage = total ? ((result.hotelEmissions / total) * 100).toFixed(1) : '0.0'
  const railPercentage = total ? ((result.railEmissions / total) * 100).toFixed(1) : '0.0'
  const busPercentage = total ? ((result.busEmissions / total) * 100).toFixed(1) : '0.0'
  const taxiPercentage = total ? ((result.taxiEmissions / total) * 100).toFixed(1) : '0.0'

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
    <div className="bg-white rounded-organic p-8 shadow-organic">
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
          <PlaneIcon />
          <p className="text-text">
            <span className="font-semibold">{result.flightEmissions.toFixed(2)}</span> kg CO<sub>2</sub>{' '}
            <span className="text-primary">({flightPercentage}%)</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CarIcon />
          <p className="text-text">
            <span className="font-semibold">{result.carEmissions.toFixed(2)}</span> kg CO<sub>2</sub>{' '}
            <span className="text-primary">({carPercentage}%)</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <HotelIcon />
          <p className="text-text">
            <span className="font-semibold">{result.hotelEmissions.toFixed(2)}</span> kg CO<sub>2</sub>{' '}
            <span className="text-primary">({hotelPercentage}%)</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TrainIcon />
          <p className="text-text">
            <span className="font-semibold">{result.railEmissions.toFixed(2)}</span> kg CO<sub>2</sub>{' '}
            <span className="text-primary">({railPercentage}%)</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BusIcon />
          <p className="text-text">
            <span className="font-semibold">{result.busEmissions.toFixed(2)}</span> kg CO<sub>2</sub>{' '}
            <span className="text-primary">({busPercentage}%)</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TaxiIcon />
          <p className="text-text">
            <span className="font-semibold">{result.taxiEmissions.toFixed(2)}</span> kg CO<sub>2</sub>{' '}
            <span className="text-primary">({taxiPercentage}%)</span>
          </p>
        </div>
      </div>
    </div>
  )
}

const CarbonOffset = ({ result }: { result: CarbonResult | null }) => {
  if (!result) return null

  const trees = Math.round(result.total / 22)

  let tips: string[] = []

  if (getHighestSource(result).name === 'Flight') {
    tips = [
      'Consider taking a train or bus for shorter distances.',
      'Choose airlines with better sustainability practices.',
      'Choose economy class instead of business or first class.'
    ]
  } else if (getHighestSource(result).name === 'Car') {
    tips = [
      'Try carpooling or using public transportation.',
      'Walk or bike for short trips instead of driving.',
      'Consider switching to an electric or hybrid vehicle.'
    ]
  } else if (getHighestSource(result).name === 'Hotel') {
    tips = [
      'Look for eco-friendly hotels with sustainability practices.',
      'Minimize energy use by switching off lights and AC when not in use.',
      'Consider staying at accommodations that support local communities.'
    ]
  } else if (getHighestSource(result).name === 'Rail') {
    tips = [
      'Choose trains over flights for shorter distances.',
      'Select coaches with better sustainability practices.',
      'Consider traveling during off-peak hours to reduce energy consumption.'
    ]
  } else if (getHighestSource(result).name === 'Bus') {
    tips = [
      'Opt for buses instead of cars for longer trips.',
      'Choose buses with better fuel efficiency or alternative fuel sources.',
      'Consider carpooling or ride-sharing to reduce the number of vehicles on the road.'
    ]
  } else if (getHighestSource(result).name === 'Taxi') {
    tips = [
      'Choose rideshare options over individual taxi rides.',
      'Opt for electric or hybrid taxis when available.',
      'Consider using public transportation or walking for short trips.'
    ]
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-organic shadow-organic text-center border border-grey/40">
        <TreeIcon />
        <h3 className="font-semibold text-lg mt-3">Plant Your Own Trees</h3>
        <p className="text-sm text-text/70 mt-1">Plant {trees} trees to offset your emissions</p>

        <ul className="text-sm text-text mt-4 space-y-2 text-left">
          <li className="flex items-start">
            <span className="text-primary mr-2">•</span> Contribute directly by joining local tree-planting initiatives or community gardens.
          </li>
          <li className="flex items-start">
            <span className="text-primary mr-2">•</span> Plant your own trees at home or in your community to create a lasting impact and connect with nature.
          </li>
          <li className="flex items-start">
            <span className="text-primary mr-2">•</span> Donate to organizations that plant trees on your behalf, such as One Tree Planted or Trees for the Future.
          </li>
        </ul>
      </div>

      <div className="bg-white p-6 rounded-organic shadow-organic text-center border border-grey/40">
        <BulbIcon />
        <h3 className="font-semibold text-lg mt-3">Reduce Future Emissions</h3>
        <p className="text-sm text-text/70 mt-1">Travel smarter by choosing greener options</p>

        <ul className="text-sm text-text mt-4 space-y-2 text-left">
          {tips.map((tip, index) => (
            <li key={index} className="flex items-start">
              <span className="text-primary mr-2">•</span> {tip}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white p-6 rounded-organic shadow-organic text-center border border-grey/40">
        <LeafIcon />
        <h3 className="font-semibold text-lg mt-3">Buy Carbon Credits</h3>
        <p className="text-sm text-text/70 mb-4">Below listed some of the reputable organizations where you can purchase carbon credits.</p>

        <div className="flex flex-col gap-2">
          <a
            href="https://climateimpactx.com/carbon-credits/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200 cursor-pointer"
          >
            Climate Impact X
          </a>

          <a
            href="https://www.goldstandard.org/donate-to-gold-standard"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200 cursor-pointer"
          >
            Gold Standard
          </a>

          <a
            href="https://www.cooleffect.org/travel_offset"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200 cursor-pointer"
          >
            Cool Effect
          </a>
        </div>
      </div>
    </div>
  )
}

const CarbonCalculatorForm = ({
  flightKm, setFlightKm,
  carKm, setCarKm,
  hotelNights, setHotelNights,
  railKm, setRailKm,
  busKm, setBusKm,
  taxiKm, setTaxiKm,
  flightClass, setFlightClass,
  carType, setCarType,
  hotelType, setHotelType,
  railType, setRailType,
  busType, setBusType,
  taxiType, setTaxiType,
  onCalculate, onReset
}: {
  flightKm: string; setFlightKm: React.Dispatch<React.SetStateAction<string>>
  carKm: string; setCarKm: React.Dispatch<React.SetStateAction<string>>
  hotelNights: string; setHotelNights: React.Dispatch<React.SetStateAction<string>>
  railKm: string; setRailKm: React.Dispatch<React.SetStateAction<string>>
  busKm: string; setBusKm: React.Dispatch<React.SetStateAction<string>>
  taxiKm: string; setTaxiKm: React.Dispatch<React.SetStateAction<string>>
  flightClass: FlightClass; setFlightClass: React.Dispatch<React.SetStateAction<FlightClass>>
  carType: CarType; setCarType: React.Dispatch<React.SetStateAction<CarType>>
  hotelType: HotelType; setHotelType: React.Dispatch<React.SetStateAction<HotelType>>
  railType: RailType; setRailType: React.Dispatch<React.SetStateAction<RailType>>
  busType: BusType; setBusType: React.Dispatch<React.SetStateAction<BusType>>
  taxiType: TaxiType; setTaxiType: React.Dispatch<React.SetStateAction<TaxiType>>
  onCalculate: () => void
  onReset: () => void
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4 bg-white/80 rounded-organic p-5 shadow-organic">
        <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center shrink-0">
          <PlaneIcon />
        </div>
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 w-full">
          <div>
            <h3 className="font-semibold text-lg text-text">Flight</h3>
            <SelectOptions selected={flightClass} setSelected={setFlightClass} options={FlightOptions} />
          </div>
          <div className="flex items-center">
            <input
              type="number"
              value={flightKm}
              onChange={(e) => setFlightKm(e.target.value)}
              placeholder="Distance"
              className="w-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="text-text/70 text-sm ms-2">km</span>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-4 bg-white/80 rounded-organic p-5 shadow-organic">
        <div className="w-12 h-12 bg-red-200 rounded-xl flex items-center justify-center shrink-0">
          <CarIcon />
        </div>
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 w-full">
          <div>
            <h3 className="font-semibold text-lg text-text">Car</h3>
            <SelectOptions selected={carType} setSelected={setCarType} options={CarOptions} />
          </div>
          <div className="flex items-center">
            <input
              type="number"
              value={carKm}
              onChange={(e) => setCarKm(e.target.value)}
              placeholder="Distance"
              className="w-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="text-text/70 text-sm ms-2">km</span>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-4 bg-white/80 rounded-organic p-5 shadow-organic">
        <div className="w-12 h-12 bg-yellow-200 rounded-xl flex items-center justify-center shrink-0">
          <TrainIcon />
        </div>
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 w-full">
          <div>
            <h3 className="font-semibold text-lg text-text">Rail</h3>
            <SelectOptions selected={railType} setSelected={setRailType} options={RailOptions} />
          </div>
          <div className="flex items-center">
            <input
              type="number"
              value={railKm}
              onChange={(e) => setRailKm(e.target.value)}
              placeholder="Distance"
              className="w-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="text-text/70 text-sm ms-2">km</span>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-4 bg-white/80 rounded-organic p-5 shadow-organic">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
          <BusIcon />
        </div>
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 w-full">
          <div>
            <h3 className="font-semibold text-lg text-text">Bus</h3>
            <SelectOptions selected={busType} setSelected={setBusType} options={BusOptions} />
          </div>
          <div className="flex items-center">
            <input
              type="number"
              value={busKm}
              onChange={(e) => setBusKm(e.target.value)}
              placeholder="Distance"
              className="w-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="text-text/70 text-sm ms-2">km</span>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-4 bg-white/80 rounded-organic p-5 shadow-organic">
        <div className="w-12 h-12 bg-orange-200 rounded-xl flex items-center justify-center shrink-0">
          <TaxiIcon />
        </div>
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 w-full">
          <div>
            <h3 className="font-semibold text-lg text-text">Taxi</h3>
            <SelectOptions selected={taxiType} setSelected={setTaxiType} options={TaxiOptions} />
          </div>
          <div className="flex items-center">
            <input
              type="number"
              value={taxiKm}
              onChange={(e) => setTaxiKm(e.target.value)}
              placeholder="Distance"
              className="w-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="text-text/70 text-sm ms-2">km</span>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-4 bg-white/80 rounded-organic p-5 shadow-organic">
        <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center shrink-0">
          <HotelIcon />
        </div>
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 w-full">
          <div>
            <h3 className="font-semibold text-lg text-text">Hotel</h3>
            <SelectOptions selected={hotelType} setSelected={setHotelType} options={HotelOptions} />
          </div>
          <div className="flex items-center">
            <input
              type="number"
              value={hotelNights}
              onChange={(e) => setHotelNights(e.target.value)}
              placeholder="Nights spent"
              className="w-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="text-text/70 text-sm ms-2">nights</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onCalculate}
          className="flex-1 bg-primary text-white px-6 py-4 rounded-organic font-semibold hover:bg-primary/90 transition-colors duration-200 cursor-pointer shadow-lg"
        >
          Calculate
        </button>
        <button
          onClick={onReset}
          className="px-6 py-4 rounded-organic font-semibold bg-gray-100 text-text/80 hover:bg-gray-200 transition-colors duration-200 cursor-pointer border border-gray-300"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export default function CarbonTab() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month')

  const [flightKm, setFlightKm] = useState('')
  const [carKm, setCarKm] = useState('')
  const [hotelNights, setHotelNights] = useState('')
  const [railKm, setRailKm] = useState('')
  const [busKm, setBusKm] = useState('')
  const [taxiKm, setTaxiKm] = useState('')

  const [result, setResult] = useState<CarbonResult | null>(null)

  const [flightClass, setFlightClass] = useState<FlightClass>('economy')
  const [carType, setCarType] = useState<CarType>('petrol')
  const [hotelType, setHotelType] = useState<HotelType>('budget')
  const [railType, setRailType] = useState<RailType>('national')
  const [busType, setBusType] = useState<BusType>('standard')
  const [taxiType, setTaxiType] = useState<TaxiType>('standard')

  const maxFootprint = Math.max(...carbonData.monthlyData.map((d) => d.footprint))

  const calculate = () => {
    const getFlightDistanceCategory = (km: number) => {
      return (km < 3700) ? 'short' : 'long'
    }

    const flightBand = getFlightDistanceCategory(Number(flightKm || 0))

    const flightEmissions = Number(flightKm || 0) * FlightdistanceCategory[flightBand] * (FlightMultiplier[flightClass] ?? 0)
    const carEmissions = Number(carKm || 0) * (CarMultiplier[carType] ?? 0)
    const hotelEmissions = Number(hotelNights || 0) * (HotelMultiplier[hotelType] ?? 0)
    const railEmissions = Number(railKm || 0) * (RailMultiplier[railType] ?? 0)
    const busEmissions = Number(busKm || 0) * (BusMultiplier[busType] ?? 0)
    const taxiEmissions = Number(taxiKm || 0) * (TaxiMultiplier[taxiType] ?? 0)

    const total = flightEmissions + carEmissions + hotelEmissions + railEmissions + busEmissions + taxiEmissions

    setResult({
      total,
      flightEmissions,
      carEmissions,
      hotelEmissions,
      railEmissions,
      busEmissions,
      taxiEmissions
    })
  }

  const handleReset = () => {
    setFlightKm('')
    setCarKm('')
    setHotelNights('')
    setRailKm('')
    setBusKm('')
    setTaxiKm('')
    setFlightClass('economy')
    setCarType('petrol')
    setHotelType('budget')
    setRailType('national')
    setBusType('standard')
    setTaxiType('standard')
    setResult(null)
  }

  useEffect(() => {
    if (result) {
      document.getElementById('impact-insights')?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [result])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-sans font-bold text-3xl text-text">Carbon Footprint</h1>
        <p className="font-sans text-text/60 mt-2">Track and reduce your environmental impact</p>
      </div>

      <div className="flex gap-2">
        {(['week', 'month', 'year'] as const).map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-4 py-2 rounded-lg font-sans text-sm font-medium transition-all duration-200 cursor-pointer ${
              selectedPeriod === period
                ? 'bg-primary text-white'
                : 'bg-white/80 text-text/60 hover:text-text'
            }`}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Footprint"
          value={carbonData.totalCarbon}
          unit="kg CO₂"
          iconBgClass="bg-red-100"
          icon={
            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          }
        />

        <StatsCard
          title="Carbon Saved"
          value={carbonData.carbonSaved}
          unit="kg CO₂"
          iconBgClass="bg-primary/10"
          icon={
            <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          }
        />

        <StatsCard
          title="CO₂ Offset"
          value={carbonData.offset}
          unit="kg CO₂"
          iconBgClass="bg-secondary/10"
          icon={
            <svg className="w-7 h-7 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          }
        />
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-organic p-6 shadow-organic">
        <h2 className="font-sans font-semibold text-xl text-text mb-6">Monthly Comparison</h2>
        <div className="h-48 flex items-end justify-around gap-4">
          {carbonData.monthlyData.map((data, index) => (
            <motion.div
              key={data.month}
              className="flex flex-col items-center gap-2 flex-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
            >
              <div className="w-full flex flex-col-reverse gap-1">
                <motion.div
                  className="bg-red-400 rounded-t-md"
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
                  style={{ height: `${(data.footprint / maxFootprint) * 120}px`, originY: 1 }}
                />
                <motion.div
                  className="bg-primary rounded-t-md"
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.05, ease: 'easeOut' }}
                  style={{ height: `${(data.saved / maxFootprint) * 120}px`, originY: 1 }}
                />
              </div>
              <span className="font-sans text-xs text-text/60">{data.month}</span>
            </motion.div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-400" />
            <span className="font-sans text-sm text-text/60">Footprint</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary" />
            <span className="font-sans text-sm text-text/60">Saved</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-sans font-semibold text-xl text-text mb-4">Calculate Your Emissions</h2>
        <CarbonCalculatorForm
          flightKm={flightKm} setFlightKm={setFlightKm}
          carKm={carKm} setCarKm={setCarKm}
          hotelNights={hotelNights} setHotelNights={setHotelNights}
          railKm={railKm} setRailKm={setRailKm}
          busKm={busKm} setBusKm={setBusKm}
          taxiKm={taxiKm} setTaxiKm={setTaxiKm}
          flightClass={flightClass} setFlightClass={setFlightClass}
          carType={carType} setCarType={setCarType}
          hotelType={hotelType} setHotelType={setHotelType}
          railType={railType} setRailType={setRailType}
          busType={busType} setBusType={setBusType}
          taxiType={taxiType} setTaxiType={setTaxiType}
          onCalculate={calculate}
          onReset={handleReset}
        />
      </div>

      <div id="impact-insights">
        <h2 className="font-sans font-semibold text-xl text-text mb-4">Your Carbon Footprint</h2>
        <ImpactInsights result={result} />
      </div>

      {result && (
        <div>
          <h2 className="font-sans font-semibold text-xl text-text mb-4">Offset Your Emissions</h2>
          <CarbonOffset result={result} />
        </div>
      )}
    </div>
  )
}
