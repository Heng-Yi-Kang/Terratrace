//import navbar and footer
"use client";

import { useEffect, useState } from 'react';
import SelectOptions from './component/selectOptions';
import Chart from './component/doughnutChart';

type Option<T extends string> = {
  label: string;
  value: T;
};

const FlightMultiplier = {
  economy: 1.0,
  business: 1.9,
  first: 2.8,
};

const CarMultiplier = {
  petrol: 0.1747,
  diesel: 0.1717,
  hybrid: 0.1172,
  electric: 0.053,
};

const HotelMultiplier = {
  budget: 15,
  standard: 30,
  luxury: 65,
};

const RailMultiplier = {
  national: 0.03546,
  international: 0.00446,
  lightRail: 0.02860,
  underground: 0.03200,
};

const BusMultiplier = {
  standard: 0.10385,
  coach: 0.027,
};

const TaxiMultiplier = {
  standard: 0.14861
};

type FlightClass = "economy" | "business" | "first";
type CarType = "petrol" | "diesel" | "hybrid" | "electric";
type HotelType = "budget" | "standard" | "luxury";
type RailType = "national" | "international" | "lightRail" | "underground";
type BusType = "standard" | "coach";
type TaxiType = "standard";


const FlightdistanceCategory = {
  short: 0.158,
  long: 0.133
};

const TaxiIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-car-taxi-front-icon lucide-car-taxi-front"><path d="M10 2h4" />
    <path d="m21 8-2 2-1.5-3.7A2 2 0 0 0 15.646 5H8.4a2 2 0 0 0-1.903 1.257L5 10 3 8" /><path d="M7 14h.01" /><path d="M17 14h.01" /><rect width="18" height="8" x="3" y="10" rx="2" /><path d="M5 18v2" /><path d="M19 18v2" />
  </svg>
);

const BusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-bus-front-icon lucide-bus-front">
    <path d="M4 6 2 7" /><path d="M10 6h4" /><path d="m22 7-2-1" /><rect width="16" height="16" x="4" y="3" rx="2" /><path d="M4 11h16" /><path d="M8 15h.01" /><path d="M16 15h.01" /><path d="M6 19v2" /><path d="M18 21v-2" />
  </svg>
);


const SirenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={2} stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-siren-icon lucide-siren">
    <path d="M7 18v-6a5 5 0 1 1 10 0v6" /><path d="M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z" /><path d="M21 12h1" /><path d="M18.5 4.5 18 5" /><path d="M2 12h1" /><path d="M12 2v1" /><path d="m4.929 4.929.707.707" /><path d="M12 12v6" />
  </svg>
);

const BulbIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={2} stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-lightbulb-icon lucide-lightbulb">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" /><path d="M9 18h6" /><path d="M10 22h4" />
  </svg>
);

const PlaneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={2} stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-plane-takeoff-icon lucide-plane-takeoff">
    <path d="M2 22h20" /><path d="M6.36 17.4 4 17l-2-4 1.1-.55a2 2 0 0 1 1.8 0l.17.1a2 2 0 0 0 1.8 0L8 12 5 6l.9-.45a2 2 0 0 1 2.09.2l4.02 3a2 2 0 0 0 2.1.2l4.19-2.06a2.41 2.41 0 0 1 1.73-.17L21 7a1.4 1.4 0 0 1 .87 1.99l-.38.76c-.23.46-.6.84-1.07 1.08L7.58 17.2a2 2 0 0 1-1.22.18Z" />
  </svg>
);

const CarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={2} stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-car-front-icon lucide-car-front">
    <path d="m21 8-2 2-1.5-3.7A2 2 0 0 0 15.646 5H8.4a2 2 0 0 0-1.903 1.257L5 10 3 8" /><path d="M7 14h.01" /><path d="M17 14h.01" /><rect width="18" height="8" x="3" y="10" rx="2" /><path d="M5 18v2" /><path d="M19 18v2" />
  </svg>
);

const HotelIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={2} stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-hotel-icon lucide-hotel">
    <path d="M10 22v-6.57" /><path d="M12 11h.01" /><path d="M12 7h.01" /><path d="M14 15.43V22" /><path d="M15 16a5 5 0 0 0-6 0" /><path d="M16 11h.01" /><path d="M16 7h.01" /><path d="M8 11h.01" /><path d="M8 7h.01" /><rect x="4" y="2" width="16" height="20" rx="2" />
  </svg>
);

const TrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={2} stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-train-front-icon lucide-train-front">
    <path d="M8 3.1V7a4 4 0 0 0 8 0V3.1" /><path d="m9 15-1-1" /><path d="m15 15 1-1" /><path d="M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5Z" /><path d="m8 19-2 3" /><path d="m16 19 2 3" />
  </svg>
);

const TreeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={2} stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-tree-deciduous-icon lucide-tree-deciduous">
    <path d="M8 19a4 4 0 0 1-2.24-7.32A3.5 3.5 0 0 1 9 6.03V6a3 3 0 1 1 6 0v.04a3.5 3.5 0 0 1 3.24 5.65A4 4 0 0 1 16 19Z" /><path d="M12 19v3" />
  </svg>
);

const LeafIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9A9 9 0 0012 3a9 9 0 00-4.5 9c0 4.97 2.015 9 4.5 9z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

const Navbar = () => (
  <nav className="fixed top-4 left-4 right-4 z-50">
    <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-md rounded-organic shadow-organic">
      <div className="flex items-center justify-between px-6 py-4">
        <a href="#" className="flex items-center gap-2 cursor-pointer group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <LeafIcon />
          </div>
          <span className="font-heading font-semibold text-xl text-text">Terratrace</span>
        </a>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-text/70 hover:text-primary transition-colors duration-200 cursor-pointer font-medium">Features</a>
          <a href="#testimonials" className="text-text/70 hover:text-primary transition-colors duration-200 cursor-pointer font-medium">Stories</a>
          <a href="#cta" className="text-text/70 hover:text-primary transition-colors duration-200 cursor-pointer font-medium">About</a>
        </div>
        <button className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-secondary transition-colors duration-200 cursor-pointer flex items-center gap-2">
          Start Planning
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  </nav>
);


const Header = () => {
  return (
    <section className="h-50 flex-col items-center justify-center pt-24 pb-16 px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-secondary/20 rounded-full blur-3xl"></div>

      <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-text mt-8 mb-6 leading-tight text-center">
        Carbon Footprint
        <span className="text-primary block mt-2">Calculator</span>
      </h1>

      <p className="text-lg md:text-xl text-center max-w-2xl mx-auto leading-relaxed text-text/70">
        Understand the environmental impact of your journey and explore ways to reduce it.
      </p>

    </section>
  )
}


type CarbonResult = {
  total: number;
  flightEmissions: number;
  carEmissions: number;
  hotelEmissions: number;
  railEmissions: number;
  busEmissions: number;
  taxiEmissions: number;
};

type CarbonCalculatorProps = {
  flightKm: string;
  setFlightKm: (value: string) => void;
  carKm: string;
  setCarKm: (value: string) => void;
  hotelNights: string;
  setHotelNights: (value: string) => void;
  result: CarbonResult | null;
  setResult: (value: CarbonResult | null) => void;
  flightClass: FlightClass;
  setFlightClass: React.Dispatch<React.SetStateAction<FlightClass>>;
  carType: CarType;
  setCarType: React.Dispatch<React.SetStateAction<CarType>>;
  hotelType: HotelType;
  setHotelType: React.Dispatch<React.SetStateAction<HotelType>>;
  railKm: string;
  setRailKm: React.Dispatch<React.SetStateAction<string>>;
  busKm: string;
  setBusKm: React.Dispatch<React.SetStateAction<string>>;
  taxiKm: string;
  setTaxiKm: React.Dispatch<React.SetStateAction<string>>;
  railType: RailType;
  setRailType: React.Dispatch<React.SetStateAction<RailType>>;
  busType: BusType;
  setBusType: React.Dispatch<React.SetStateAction<BusType>>;
  taxiType: TaxiType;
  setTaxiType: React.Dispatch<React.SetStateAction<TaxiType>>;
};


const FlightOptions: Option<FlightClass>[] = [
  { value: 'economy', label: 'Economy' },
  { value: 'business', label: 'Business' },
  { value: 'first', label: 'First Class' }
];

const CarOptions: Option<CarType>[] = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'electric', label: 'Electric' }
];

const HotelOptions: Option<HotelType>[] = [
  { value: 'budget', label: 'Budget' },
  { value: 'standard', label: 'Standard' },
  { value: 'luxury', label: 'Luxury' }
];

const RailOptions: Option<RailType>[] = [
  { value: 'national', label: 'National' },
  { value: 'international', label: 'International' },
  { value: 'lightRail', label: 'Light Rail' },
  { value: 'underground', label: 'Underground' }
];

const BusOptions: Option<BusType>[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'coach', label: 'Coach' }
];

const TaxiOptions: Option<TaxiType>[] = [
  { value: 'standard', label: 'standard' },
];

const CarbonCalculator = ({
  flightKm,
  setFlightKm,
  carKm,
  setCarKm,
  hotelNights,
  setHotelNights,
  result,
  setResult,
  flightClass,
  setFlightClass,
  carType,
  setCarType,
  hotelType,
  setHotelType,
  railKm,
  setRailKm,
  busKm,
  setBusKm,
  taxiKm,
  setTaxiKm,
  railType,
  setRailType,
  busType,
  setBusType,
  taxiType,
  setTaxiType


}: CarbonCalculatorProps) => {

  const calculate = () => {

    const getFlightDistanceCategory = (km: number) => {
      return (km < 3700) ? "short" : "long";
    };

    const flightBand = getFlightDistanceCategory(Number(flightKm || 0));

    const flightEmissions = Number(flightKm || 0) * FlightdistanceCategory[flightBand] * (FlightMultiplier[flightClass as keyof typeof FlightMultiplier] ?? 0);
    const carEmissions = Number(carKm || 0) * (CarMultiplier[carType as keyof typeof CarMultiplier] ?? 0);
    const hotelEmissions = Number(hotelNights || 0) * (HotelMultiplier[hotelType as keyof typeof HotelMultiplier] ?? 0);
    const railEmissions = Number(railKm || 0) * (RailMultiplier[railType as keyof typeof RailMultiplier] ?? 0);
    const busEmissions = Number(busKm || 0) * (BusMultiplier[busType as keyof typeof BusMultiplier] ?? 0);
    const taxiEmissions = Number(taxiKm || 0) * (TaxiMultiplier[taxiType as keyof typeof TaxiMultiplier] ?? 0);

    const total = flightEmissions + carEmissions + hotelEmissions + railEmissions + busEmissions + taxiEmissions;

    setResult({
      total,
      flightEmissions,
      carEmissions,
      hotelEmissions,
      railEmissions,
      busEmissions,
      taxiEmissions
    });
  };

  const HandleClick = () => {
    calculate();
  }

  const handleReset = () => {
    setFlightKm("");
    setCarKm("");
    setHotelNights("");
    setRailKm("");
    setBusKm("");
    setTaxiKm("");
    setFlightClass("economy");
    setCarType("petrol");
    setHotelType("budget");
    setRailType("national");
    setBusType("standard");
    setTaxiType("standard");
    setResult(null);
  }

  return (
    <section className="bg-white/50 py-10 px-4 relative overflow-hidden min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-heading font-bold text-3xl md:text-4xl text-center mb-12 text-text">Enter Travel Details</h2>

        {/*plane input*/}
        <div className="space-y-2">
          <div className="flex items-start gap-4 bg-white/80 rounded-organic p-5 shadow-organic cursor-pointer hover:shadow-lg transition-shadow duration-200 h-auto">
            <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center shrink-0">
              <PlaneIcon />
            </div>
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 w-full">
              <div>
                <h3 className=" font-semibold text-lg text-text">Flight</h3>
                <SelectOptions
                  selected={flightClass}
                  setSelected={setFlightClass}
                  options={FlightOptions}
                />
              </div>



              <div className="flex items-center px-2 ml-auto">
                <input
                  type="number"
                  value={flightKm}
                  onChange={(e) => setFlightKm(e.target.value)}
                  placeholder="Distance"
                  className="w-46 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-text/70 text-sm ms-2">km</span>
              </div>
            </div>
          </div>

          {/*car input*/}
          <div className="flex items-start gap-4 bg-white/80 rounded-organic p-5 shadow-organic cursor-pointer hover:shadow-lg transition-shadow duration-200 h-auto">
            <div className="w-12 h-12 bg-red-200 rounded-xl flex items-center justify-center shrink-0">
              <CarIcon />
            </div>
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 w-full">
              <div>
                <h3 className=" font-semibold text-lg text-text">Car</h3>
                <SelectOptions
                  selected={carType}
                  setSelected={setCarType}
                  options={CarOptions}
                />
              </div>

              <div className="flex items-center px-2 ml-auto">
                <input
                  type="number"
                  value={carKm}
                  onChange={(e) => setCarKm(e.target.value)}
                  placeholder="Distance"
                  className="w-46 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-text/70 text-sm ms-2">km</span>
              </div>
            </div>
          </div>

          {/*Rail input*/}
          <div className="flex items-start gap-4 bg-white/80 rounded-organic p-5 shadow-organic cursor-pointer hover:shadow-lg transition-shadow duration-200 h-auto">
            <div className="w-12 h-12 bg-yellow-200 rounded-xl flex items-center justify-center shrink-0">
              <TrainIcon />
            </div>

            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 w-full">
              <div>
                <h3 className=" font-semibold text-lg text-text">Rail</h3>
                <SelectOptions
                  selected={railType}
                  setSelected={setRailType}
                  options={RailOptions}
                />
              </div>

              <div className="flex items-center px-2 ml-auto">
                <input
                  type="number"
                  value={railKm}
                  onChange={(e) => setRailKm(e.target.value)}
                  placeholder="Distance"
                  className="w-46 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-text/70 text-sm ms-2">km</span>
              </div>
            </div>
          </div>

          {/*Bus input*/}
          <div className="flex items-start gap-4 bg-white/80 rounded-organic p-5 shadow-organic cursor-pointer hover:shadow-lg transition-shadow duration-200 h-auto">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <BusIcon />
            </div>

            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 w-full">
              <div>
                <h3 className=" font-semibold text-lg text-text">Bus</h3>
                <SelectOptions
                  selected={busType}
                  setSelected={setBusType}
                  options={BusOptions}
                />
              </div>

              <div className="flex items-center px-2 ml-auto">
                <input
                  type="number"
                  value={busKm}
                  onChange={(e) => setBusKm(e.target.value)}
                  placeholder="Distance"
                  className="w-46 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-text/70 text-sm ms-2">km</span>
              </div>
            </div>
          </div>

          {/*taxi input*/}
          <div className="flex items-start gap-4 bg-white/80 rounded-organic p-5 shadow-organic cursor-pointer hover:shadow-lg transition-shadow duration-200 h-auto">
            <div className="w-12 h-12 bg-orange-200 rounded-xl flex items-center justify-center shrink-0">
              <TaxiIcon />
            </div>

            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 w-full">
              <div>
                <h3 className=" font-semibold text-lg text-text">Taxi</h3>
                <SelectOptions
                  selected={taxiType}
                  setSelected={setTaxiType}
                  options={TaxiOptions}
                />
              </div>

              <div className="flex items-center px-2 ml-auto">
                <input
                  type="number"
                  value={taxiKm}
                  onChange={(e) => setTaxiKm(e.target.value)}
                  placeholder="Distance"
                  className="w-46 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-text/70 text-sm ms-2">km</span>
              </div>

            </div>
          </div>

          {/*hotel input*/}
          <div className="flex items-start gap-4 bg-white/80 rounded-organic p-5 shadow-organic cursor-pointer hover:shadow-lg transition-shadow duration-200 h-auto">
            <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center shrink-0">
              <HotelIcon />
            </div>

            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 w-full">
              <div>
                <h3 className=" font-semibold text-lg text-text">Hotel</h3>
                <SelectOptions
                  selected={hotelType}
                  setSelected={setHotelType}
                  options={HotelOptions}
                />
              </div>

              <div className="flex items-center px-2 ml-auto">
                <input
                  type="number"
                  value={hotelNights}
                  onChange={(e) => setHotelNights(e.target.value)}
                  placeholder="Nights spent"
                  className="w-46 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-text/70 text-sm ms-2">nights</span>
              </div>

            </div>
          </div>

          <div>
            <button className="bg-primary text-xl text-white px-6 py-4 w-full rounded-organic font-semibold hover:bg-primary/90 transition-colors duration-200 cursor-pointer shadow-lg flex items-center justify-center"
              onClick={HandleClick}
            >
              Calculate
            </button>
            <button className="bg-gray/20 mt-2 text-lg text-text/80 px-6 py-4 w-full rounded-organic font-semibold hover:bg-gray/200 transition-colors duration-200 cursor-pointer shadow-lg flex items-center justify-center border border-gray-300"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>

        </div>
      </div>

    </section>
  );
};

const getHighestSource = (result: CarbonResult) => {
  const sources = [
    { name: "Flight", value: result.flightEmissions },
    { name: "Car", value: result.carEmissions },
    { name: "Hotel", value: result.hotelEmissions },
    { name: "Rail", value: result.railEmissions },
    { name: "Bus", value: result.busEmissions },
    { name: "Taxi", value: result.taxiEmissions },
  ];

  return sources.reduce((max, curr) =>
    curr.value > max.value ? curr : max
  );
};


const ImpactInsights = ({ result }: { result: CarbonResult | null }) => {

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


  let recommendation = "";

  const highestSource = getHighestSource(result);

  if (highestSource.name === "Flight") {
    recommendation = "To reduce impact, consider taking a train or bus for shorter distances, or choose airlines with better sustainability practices.";
  } else if (highestSource.name === "Car") {
    recommendation = "To reduce impact, try carpooling, using public transportation, or switching to a more fuel-efficient or electric vehicle.";
  } else if (highestSource.name === "Hotel") {
    recommendation = "To reduce impact, look for eco-friendly hotels that have sustainability certifications, or consider alternative accommodations like hostels or vacation rentals.";
  } else if (highestSource.name === "Rail") {
    recommendation = "To reduce impact, consider taking trains more often, as they generally have lower emissions per passenger than cars or planes.";
  } else if (highestSource.name === "Bus") {
    recommendation = "To reduce impact, try using buses for longer trips, as they can be more environmentally friendly than individual car travel.";
  } else if (highestSource.name === "Taxi") {
    recommendation = "To reduce impact, consider carpooling or using ride-sharing services to minimize the number of vehicles on the road.";
  }

  return (
    <section id="impact" className="min-h-screen py-20 px-4 relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <div>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-center mb-4 text-text">Your Travel's Carbon Footprint</h2>
          <p className="text-center text-text/70 mb-8">Based on your inputs, your travel plan has an estimated carbon footprint of</p>
          <div>

            <div className="bg-white rounded-organic p-8 shadow-organic text-start">

              <div className="flex items-center justify-between gap-4">

                <div className="flex-1 min-w-0">
                  <h3 className="font-normal text-text/80 ">Total Emissions</h3>
                  <div className="flex items-baseline w-auto">
                    <p className="text-7xl font-bold text-text">{result ? result.total.toFixed(2) : '0.00'}</p>
                    <p className="text-xl text-text/100 font-bold m-2">kg CO₂</p>
                  </div>
                </div>

                <div className="w-28 shrink-0 bg-primary/20 rounded-organic p-4 border border-white/30 w-32 items-center justify-center text-center">
                  <h3 className="font-semibold text-4xl text-center justify-center text-text">{result ? Math.round(result.total / 22) : "1"}</h3>
                  <p className="text-text/80">trees/year to absorb</p>
                </div>

              </div>

              {/* chart or breakdown of emissions*/}
              <div>

                {result && (
                  <Chart
                    flight={flightPercentage ? parseFloat(flightPercentage) : 0}
                    car={carPercentage ? parseFloat(carPercentage) : 0}
                    hotel={hotelPercentage ? parseFloat(hotelPercentage) : 0}
                    rail={railPercentage ? parseFloat(railPercentage) : 0}
                    bus={busPercentage ? parseFloat(busPercentage) : 0}
                    taxi={taxiPercentage ? parseFloat(taxiPercentage) : 0}
                  />
                )}

                <div className=" mt-6">
                  <h3 className="font-bold text-xl text-center items-centertext-text/80 mb-2">Highest Impact:</h3>
                  <p className="text-center text-text text-lg font-normal m-2">{highestSource.name} contribute the most to your travel's carbon footprint.</p>
                  <p className="text-center text-text/80 italic">{recommendation}</p>
                </div>

                <hr className="m-6" />
                <h3 className="font-bold text-xl text-text mb-2">Breakdown:</h3>

                <div className="flex">
                  <div>
                    <div className="flex items-center gap-2">
                      <PlaneIcon />
                      <p className="text-text text-lg font-normal m-2"> <span className="font-semibold">{result ? result.flightEmissions.toFixed(2) : '0.00'}</span> kg CO₂ <span className="font-semibold">({flightPercentage}%)</span></p>
                    </div>
                    <div className="flex items-center gap-2 ">
                      <CarIcon />
                      <p className="text-text text-lg font-normal m-2"> <span className="font-semibold">{result ? result.carEmissions.toFixed(2) : '0.00'}</span> kg CO₂ <span className="font-semibold">({carPercentage}%)</span></p>
                    </div>
                    <div className="flex items-center gap-2 ">
                      <HotelIcon />
                      <p className="text-text text-lg font-normal m-2"> <span className="font-semibold">{result ? result.hotelEmissions.toFixed(2) : '0.00'}</span> kg CO2 <span className="font-semibold">({hotelPercentage}%)</span></p>
                    </div>
                  </div>

                  <div className="ml-10">
                    <div className="flex items-center gap-2 ">
                      <TrainIcon />
                      <p className="text-text text-lg font-normal m-2"> <span className="font-semibold">{result ? result.railEmissions.toFixed(2) : '0.00'}</span> kg CO₂ <span className="font-semibold">({railPercentage}%)</span></p>
                    </div>
                    <div className="flex items-center gap-2 ">
                      <BusIcon />
                      <p className="text-text text-lg font-normal m-2"> <span className="font-semibold">{result ? result.busEmissions.toFixed(2) : '0.00'}</span> kg CO₂ <span className="font-semibold">({busPercentage}%)</span></p>
                    </div>
                    <div className="flex items-center gap-2 ">
                      <TaxiIcon />
                      <p className="text-text text-lg font-normal m-2"> <span className="font-semibold">{result ? result.taxiEmissions.toFixed(2) : '0.00'}</span> kg CO₂ <span className="font-semibold">({taxiPercentage}%)</span></p>
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>
      </div>
    </section >
  )
}

const CarbonOffset = ({ result }: { result: CarbonResult | null }) => {

  if (!result) return null;

  const trees = Math.round(result.total / 22);
  const estimatedCost = (result.total * 0.013 * 4.70).toFixed(2); // simple estimate

  let tips: string[] = [];


  if (getHighestSource(result).name === "Flight") {
    tips = [
      "Consider taking a train or bus for shorter distances.",
      "Choose airlines with better sustainability practices.",
      "Choose economy class instead of business or first  class."
    ];
  } else if (getHighestSource(result).name === "Car") {
    tips = [
      "Try carpooling or using public transportation.",
      "Walk or bike for short trips instead of driving.",
      "Consider switching to an electric or hybrid vehicle."
    ];
  } else if (getHighestSource(result).name === "Hotel") {
    tips = [
      "Look for eco-friendly hotels with sustainability practices.",
      "Minimize energy use by switching off lights and AC when not in use.",
      "Consider staying at accommodations that support local communities."
    ];
  }
  else if (getHighestSource(result).name === "Rail") {
    tips = [
      "Choose trains over flights for shorter distances.",
      "Select coaches with better sustainability practices.",
      "Consider traveling during off-peak hours to reduce energy consumption."
    ];
  }
  else if (getHighestSource(result).name === "Bus") {
    tips = [
      "Opt for buses instead of cars for longer trips.",
      "Choose buses with better fuel efficiency or alternative fuel sources.",
      "Consider carpooling or ride-sharing to reduce the number of vehicles on the road."
    ];
  }
  else if (getHighestSource(result).name === "Taxi") {
    tips = [
      "Choose rideshare options over individual taxi rides.",
      "Opt for electric or hybrid taxis when available.",
      "Consider using public transportation or walking for short trips."
    ];
  }

  return (
    <section className="min-h-screen py-20 px-4 relative overflow-hidden bg-white/50">
      <div className="max-w-4xl mx-auto">

        <h2 className="font-heading font-bold text-3xl mb-2 md:text-4xl text-center mb-12 text-text">
          Offset Your Emissions
        </h2>

        <p className="text-center text-text/70 mb-8">
          Take action to reduce or offset your <span className="font-semibold">{result.total.toFixed(2)} kg CO₂</span>
        </p>

        <div>

          <div className="grid md:grid-cols-3 gap-6">

            {/* Card 1 */}
            <div className="bg-white p-6 rounded-organic shadow-organic text-center border border-grey/40 h-auto">
              <TreeIcon />
              <h3 className="font-semibold text-lg mt-3">Plant Your Own Trees</h3>
              <p className="text-sm text-text/100 ">
                Plant {trees} trees to offset your emissions
              </p>

              <ul className=" text-sm text-text/100 mt-4 space-y-1">
                <li className=" m-2 flex items-start">
                  <span className="text-primary mr-2">•</span> Contribute directly by joining local tree-planting initiatives or community gardens.
                </li>
                <li className=" m-2 flex items-start">
                  <span className="text-primary mr-2">•</span> Plant your own trees at home or in your community to create a lasting impact and connect with nature.
                </li>
                <li className=" m-2 flex items-start">
                  <span className="text-primary mr-2">•</span> Donate to organizations that plant trees on your behalf, such as One Tree Planted or Trees for the Future.
                </li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-6 rounded-organic shadow-organic text-center border border-grey/40 h-auto">
              <BulbIcon />
              <h3 className="font-semibold text-lg mt-3">Reduce Future Emissions</h3>
              <p className="text-sm text-text/100 ">
                Travel smarter by choosing greener options
              </p>

              <ul className=" text-sm text-text/100 mt-4 space-y-1">
                {tips.map((tip, index) => (
                  <li key={index} className=" m-2 flex items-start">
                    <span className="text-primary mr-2">•</span> {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-6 rounded-organic shadow-organic text-center border border-grey/40 h-auto">
              <LeafIcon />
              <h3 className="font-semibold text-lg mt-3">Buy Carbon Credits</h3>
              {/*<p className="text-sm text-text/100 mt-2 mb-4">
                Offset your emissions for ~RM {estimatedCost}
              </p>*/}
              <p className="text-sm text-text/100 mb-6">
                Below listed some of the reputable organizations where you can purchase carbon credits.
              </p>

              <div className="flex flex-col gap-2 mb-4">
                <a
                  href="https://climateimpactx.com/carbon-credits/?=undefined&utm_source=792707340217&utm_medium=g&utm_campaign=23458475432&utm_content=c&creative=792707340217&keyword=carbon%20trading%20exchange&matchtype=p&network=g&device=c&utm_term=carbon%20trading%20exchange&gad_source=1&gad_campaignid=23458475432&gbraid=0AAAAAqCQ4M14qnFhk8z2mlwUGoC7IaDQd&gclid=Cj0KCQjwh-HPBhCIARIsAC0p3cfJExIMsxbEG1oy5v15HwrttMSjCWsmc13uIISqE_YhnLsoA08kJGYaArCDEALw_wcB"
                  target="_blank"
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200"
                >
                  Climate Impact X
                </a>

                <a
                  href="https://www.goldstandard.org/donate-to-gold-standard"
                  target="_blank"
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200"
                >
                  Gold Standard
                </a>

                <a
                  href="https://www.cooleffect.org/travel-offset"
                  target="_blank"
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200"
                >
                  Cool Effect
                </a>

              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="py-12 px-4 bg-text/5">
    <div className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-4 gap-8 mb-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <LeafIcon />
            </div>
            <span className="font-heading font-semibold text-xl text-text">Terratrace</span>
          </div>
          <p className="text-text/70 max-w-md leading-relaxed">
            Making sustainable travel accessible to everyone. Every journey matters, every choice counts.
          </p>
        </div>

        <div>
          <h4 className="font-heading font-semibold text-text mb-4">Explore</h4>
          <ul className="space-y-3">
            <li><a href="#" className="text-text/70 hover:text-primary transition-colors duration-200 cursor-pointer">Destinations</a></li>
            <li><a href="#" className="text-text/70 hover:text-primary transition-colors duration-200 cursor-pointer">Eco Guides</a></li>
            <li><a href="#" className="text-text/70 hover:text-primary transition-colors duration-200 cursor-pointer">Carbon Calculator</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading font-semibold text-text mb-4">Company</h4>
          <ul className="space-y-3">
            <li><a href="#" className="text-text/70 hover:text-primary transition-colors duration-200 cursor-pointer">About Us</a></li>
            <li><a href="#" className="text-text/70 hover:text-primary transition-colors duration-200 cursor-pointer">Our Mission</a></li>
            <li><a href="#" className="text-text/70 hover:text-primary transition-colors duration-200 cursor-pointer">Contact</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-text/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-text/60">
          © 2024 Terratrace. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <a href="#" className="text-sm text-text/60 hover:text-primary transition-colors duration-200 cursor-pointer">Privacy</a>
          <a href="#" className="text-sm text-text/60 hover:text-primary transition-colors duration-200 cursor-pointer">Terms</a>
          <a href="#" className="text-sm text-text/60 hover:text-primary transition-colors duration-200 cursor-pointer">Sustainability Report</a>
        </div>
      </div>
    </div>
  </footer>
);




export default function CarbonFootprint() {

  const [flightKm, setFlightKm] = useState("");
  const [carKm, setCarKm] = useState("");
  const [hotelNights, setHotelNights] = useState("");
  const [railKm, setRailKm] = useState("");
  const [busKm, setBusKm] = useState("");
  const [taxiKm, setTaxiKm] = useState("");

  const [result, setResult] = useState<CarbonResult | null>(null);

  const [flightClass, setFlightClass] = useState<FlightClass>("economy");
  const [carType, setCarType] = useState<CarType>("petrol");
  const [hotelType, setHotelType] = useState<HotelType>("budget");
  const [railType, setRailType] = useState<RailType>("national");
  const [busType, setBusType] = useState<BusType>("standard");
  const [taxiType, setTaxiType] = useState<TaxiType>("standard");

  useEffect(() => {
    if (result) {
      document.getElementById("impact")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [result]);

  return (
    <>
      <Navbar />
      <Header />
      <CarbonCalculator
        flightKm={flightKm}
        setFlightKm={setFlightKm}
        carKm={carKm}
        setCarKm={setCarKm}
        hotelNights={hotelNights}
        setHotelNights={setHotelNights}
        result={result}
        setResult={setResult}
        flightClass={flightClass}
        setFlightClass={setFlightClass}
        carType={carType}
        setCarType={setCarType}
        hotelType={hotelType}
        setHotelType={setHotelType}
        railKm={railKm}
        setRailKm={setRailKm}
        busKm={busKm}
        setBusKm={setBusKm}
        taxiKm={taxiKm}
        setTaxiKm={setTaxiKm}
        railType={railType}
        setRailType={setRailType}
        busType={busType}
        setBusType={setBusType}
        taxiType={taxiType}
        setTaxiType={setTaxiType}
      />
      <ImpactInsights result={result} />
      <CarbonOffset result={result} />
      <Footer />
    </>
  )
}