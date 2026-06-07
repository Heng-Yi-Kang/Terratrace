
const FlightMultiplier = {
  short: {
    economy: 0.12576,
    business: 0.18863,
    first: 0.12576, 
  },
  long: {
    economy: 0.11704,
    business: 0.33940,
    first: 0.46814,
  }
};

const CarMultiplier = {
  petrol: 0.16272,
  diesel: 0.17304,
  hybrid: 0.12825,
};

const HotelMultiplier = {
  budget: 10.4,
  standard: 25,
  luxury: 60,
};

const RailMultiplier = {
  national: 0.03546,
  international: 0.00446,
  lightRail: 0.02860,
  underground: 0.02780,
};

const BusMultiplier = {
  standard: 0.10385,
  coach: 0.02776,
};

const TaxiMultiplier = {
  standard: 0.14861
};


export type FlightClass = "economy" | "business" | "first";
export type CarType = "petrol" | "diesel" | "hybrid";
export type HotelType = "budget" | "standard" | "luxury";
export type RailType = "national" | "international" | "lightRail" | "underground";
export type BusType = "standard" | "coach";
export type TaxiType = "standard";

export type TripInput =
  | { type: 'flight'; distanceKm: number; flightClass: FlightClass; isReturn: boolean }
  | { type: 'car'; distanceKm: number; CarType: CarType; passengers: number }
  | { type: 'hotel'; nights: number; HotelType: HotelType }
  | { type: 'rail'; distanceKm: number; RailType: RailType;isReturn: boolean }
  | { type: 'bus'; distanceKm: number; BusType: BusType}
  | { type: 'taxi'; distanceKm: number }

interface BaseTrip {id: string}

export interface FlightTrip extends BaseTrip{
    type: 'flight'
    distanceKm: number
    flightClass: FlightClass
    passengers: number
    isReturn: boolean
}

export interface CarTrip extends BaseTrip{
    type: 'car'
    distanceKm: number
    CarType: CarType
    passengers: number
}

export interface HotelTrip extends BaseTrip{
    type: 'hotel'
    nights: number
    HotelType: HotelType
}

export interface RailTrip extends BaseTrip{
    type: 'rail'
    distanceKm: number
    RailType: RailType
    passengers: number
    isReturn: boolean
}

export interface BusTrip extends BaseTrip{
    type: 'bus'
    distanceKm: number
    BusType: BusType
    passengers: number
}

export interface TaxiTrip extends BaseTrip{
    type: 'taxi'
    distanceKm: number
}

export type Trip = FlightTrip | HotelTrip | CarTrip | RailTrip | TaxiTrip | BusTrip

export type CarbonResult = {
  total: number;
  flightEmissions: number;
  carEmissions: number;
  hotelEmissions: number;
  railEmissions: number;
  busEmissions: number;
  taxiEmissions: number;
};

function calculate(trip: TripInput): number {
  switch(trip.type){

        case 'flight': {
            const flightHaul = trip.distanceKm < 3700 ? 'short' : 'long'

            return trip.distanceKm * FlightMultiplier[flightHaul][trip.flightClass]
            *(trip.isReturn? 2 : 1)
        }

        case 'car': 
            return trip.distanceKm * CarMultiplier[trip.CarType] / trip.passengers
        case 'hotel': 
            return trip.nights * HotelMultiplier[trip.HotelType]
        case 'rail': 
            return trip.distanceKm * RailMultiplier[trip.RailType] * (trip.isReturn? 2 : 1)
        case 'bus': 
            return trip.distanceKm * BusMultiplier[trip.BusType] 
        case 'taxi': 
            return trip.distanceKm * TaxiMultiplier.standard
    
    }
}

export function CalcTotal(trips: TripInput[]): CarbonResult {

    let flightEmissions = 0
    let carEmissions = 0
    let hotelEmissions = 0
    let railEmissions = 0
    let busEmissions = 0
    let taxiEmissions = 0

    for(const trip of trips){

        const val = calculate(trip)
        if(trip.type === 'flight'){
            flightEmissions += val
        } else if(trip.type === 'car'){
            carEmissions += val
        } else if(trip.type === 'hotel'){
            hotelEmissions += val
        } else if(trip.type === 'rail'){
            railEmissions += val
        } else if(trip.type === 'bus'){
            busEmissions += val
        } else if(trip.type === 'taxi'){
            taxiEmissions += val
        }
    }

    const total = flightEmissions + carEmissions + hotelEmissions + railEmissions + busEmissions + taxiEmissions

    return{
        total, 
        flightEmissions, 
        carEmissions, 
        hotelEmissions, 
        railEmissions, 
        busEmissions, 
        taxiEmissions
    }
}