import * as m from './Multipliers'
import {Trip, CarbonResult} from './types'

export function calculate(trip: Trip){

    switch(trip.type){

        case 'flight': {

            return trip.distanceKm * m.FlightMultiplier[trip.flightClass]
            *(trip.isReturn? 2 : 1)
        }

        case 'car': 
            return trip.distanceKm * m.CarMultiplier[trip.CarType] / trip.passengers
        case 'hotel': 
            return trip.nights * m.HotelMultiplier[trip.HotelType]
        case 'rail': 
            return trip.distanceKm * m.RailMultiplier[trip.RailType] * (trip.isReturn? 2 : 1)
        case 'bus': 
            return trip.distanceKm * m.BusMultiplier[trip.BusType] 
        case 'taxi': 
            return trip.distanceKm * m.TaxiMultiplier.standard
    
    }
}

export function CalcTotal(trips: Trip[]): CarbonResult {

    let flightEmissions = 0
    let carEmissions = 0
    let hotelEmissions = 0
    let railEmissions = 0
    let busEmissions = 0
    let taxiEmissions = 0

    for(const trip of trips){

        if(trip.type === 'flight'){
            flightEmissions += calculate(trip)
        } else if(trip.type === 'car'){
            carEmissions += calculate(trip)
        } else if(trip.type === 'hotel'){
            hotelEmissions += calculate(trip)
        } else if(trip.type === 'rail'){
            railEmissions += calculate(trip)
        } else if(trip.type === 'bus'){
            busEmissions += calculate(trip)
        } else if(trip.type === 'taxi'){
            taxiEmissions += calculate(trip)
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