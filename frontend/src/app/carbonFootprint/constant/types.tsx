
export type FlightClass = "economy" | "business" | "first";
export type CarType = "petrol" | "diesel" | "hybrid" ;
export type HotelType = "budget" | "standard" | "luxury";
export type RailType = "national" | "international" | "lightRail" | "underground";
export type BusType = "standard" | "coach";
export type TaxiType = "standard";

interface BaseTrip {id: string}

export interface FlightTrip extends BaseTrip{
    type: 'flight'
    distanceKm: number
    flightClass: FlightClass
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
    isReturn: boolean
}

export interface BusTrip extends BaseTrip{
    type: 'bus'
    distanceKm: number
    BusType: BusType
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