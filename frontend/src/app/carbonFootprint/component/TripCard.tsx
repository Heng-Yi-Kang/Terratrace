'use client'

import { Trip } from '../constant/types'
import { calculate } from '../constant/calculate'
import * as icons from '../component/icons'
import SelectOptions from './selectOptions'

type Props = {
    trip: Trip
    index: number
    onUpdate: (patch: Partial<Trip>) => void
    onRemove: () => void
    onSwitchType: (type: Trip['type']) => void
}

export function TripCard({ trip, index, onUpdate, onRemove, onSwitchType }: Props) {


    const calc = calculate(trip)


    return (

        <div className="bg-white shadow-lg p-6 rounded-organic">

            {/*heading*/}
            <div className="flex ">
                <div className="flex flex-col gap-2">
                    <span className="font-semibold text-text">Transport {index}</span>
                </div>
                <button onClick={onRemove} className="ml-auto hover:text-red-200 transition-colors"><icons.RemoveIcon /></button>
            </div>


            {/*tabs*/}
            <div className="flex gap-1">
                <button onClick={() => onSwitchType('flight')} className={`flex flex-col w-24 h-16 mt-2 ml-0 items-center justify-center rounded-full text-sm font-medium border transition-colors duration-150 
                ${trip.type === 'flight' ? 'bg-primary text-white border-primary' : 'bg-white text-text/60 border-gray-200 hover:border-primary/40'}`}>
                    <icons.PlaneIcon />
                    Flight
                </button>

                <button onClick={() => onSwitchType('car')} className={`flex flex-col w-24 h-16 mt-2 items-center justify-center rounded-full text-sm font-medium border transition-colors duration-150 
                ${trip.type === 'car' ? 'bg-primary text-white border-primary' : 'bg-white text-text/60 border-gray-200 hover:border-primary/40'}`}>
                    <icons.CarIcon />
                    Car
                </button>

                <button onClick={() => onSwitchType('hotel')} className={`flex flex-col w-24 h-16 mt-2 items-center justify-center rounded-full text-sm font-medium border transition-colors duration-150 
                    ${trip.type === 'hotel' ? 'bg-primary text-white border-primary' : 'bg-white text-text/60 border-gray-200 hover:border-primary/40'}`}>
                    <icons.HotelIcon />
                    Hotel
                </button>

                <button onClick={() => onSwitchType('rail')} className={`flex flex-col w-24 h-16 mt-2 items-center justify-center  rounded-full text-sm font-medium border transition-colors duration-150 
                    ${trip.type === 'rail' ? 'bg-primary text-white border-primary' : 'bg-white text-text/60 border-gray-200 hover:border-primary/40'}`}>
                    <icons.TrainIcon />
                    Rail
                </button>

                <button onClick={() => onSwitchType('bus')} className={`flex flex-col w-24 h-16 mt-2 items-center justify-center  rounded-full text-sm font-medium border transition-colors duration-150 
                    ${trip.type === 'bus' ? 'bg-primary text-white border-primary' : 'bg-white text-text/60 border-gray-200 hover:border-primary/40'}`}>
                    <icons.BusIcon />
                    Bus
                </button>

                <button onClick={() => onSwitchType('taxi')} className={`flex flex-col w-24 h-16 mt-2 items-center justify-center rounded-full text-sm font-medium border transition-colors duration-150 
                    ${trip.type === 'taxi' ? 'bg-primary text-white border-primary' : 'bg-white text-text/60 border-gray-200 hover:border-primary/40'}`}>
                    <icons.TaxiIcon />
                    Taxi
                </button>
            </div>

            {/* flight card */}
            {trip.type === 'flight' && (
                <div className="grid grid-cols-2 gap-8 mt-2">

                    <div>
                        <div className="flex flex-col gap-1">
                            <span className='text-sm text-text/60'>Flight Class</span>
                            <SelectOptions
                                selected={trip.flightClass}
                                setSelected={(v) => onUpdate({ flightClass: v })}
                                options={[
                                    { value: 'economy', label: 'Economy' },
                                    { value: 'business', label: 'Business' },
                                    { value: 'first', label: 'First' },
                                ]}
                            />
                        </div>


                        <div className="flex flex-col gap-1 ml-auto">
                            <span className="text-text/60 text-sm mt-2 mb-1">Distance</span>
                            <div className='flex gap-2 items-baseline justify-baseline'>
                                <input type="number" value={trip.distanceKm || ''} onChange={(e) => onUpdate({ distanceKm: Number(e.target.value) })}
                                    placeholder="1" className='w-full border border-gray-200 rounded-xl p-3 hover:border-primary cursor-pointer' />
                                <span className="text-sm text-text/60 ">km</span>
                            </div>
                        </div>
                    </div>

                    <div >
                        <div className="flex flex-col gap-1 ml-auto mb-1">
                            <span className="text-text/60 text-sm ">Trip type</span>
                            <SelectOptions
                                selected={trip.isReturn ? 'return' : 'oneway'}
                                setSelected={(v) => onUpdate({ isReturn: v === 'return' })}
                                options={[
                                    { value: 'oneway', label: 'One Way' },
                                    { value: 'return', label: 'Return' }
                                ]}
                            />
                        </div>

                    </div>



                </div>
            )}


            {/* car card */}
            {trip.type === 'car' && (
                <div className="grid grid-cols-2 gap-8 mt-2">

                    <div>
                        <div className="flex flex-col gap-1">
                            <span className='text-sm text-text/60'>Car Type</span>
                            <SelectOptions
                                selected={trip.CarType}
                                setSelected={(v) => onUpdate({ CarType: v })}
                                options={[
                                    { value: 'petrol', label: 'Petrol' },
                                    { value: 'diesel', label: 'Diesel' },
                                    { value: 'hybrid', label: 'Hybrid' },
                                ]}
                            />
                        </div>


                        <div className="flex flex-col gap-1">
                            <span className="text-text/60 text-sm mt-2 mb-1">Distance</span>
                            <div className='flex gap-2 items-baseline justify-baseline'>
                                <input type="number" value={trip.distanceKm || ''} onChange={(e) => onUpdate({ distanceKm: Number(e.target.value) })}
                                    placeholder="1" className='w-full border border-gray-200 rounded-md p-3 hover:border-primary cursor-pointer' />
                                <span className="text-sm text-text/60 ">km</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex flex-col gap-1">
                            <span className="text-text/60 text-sm mb-1">Passengers</span>
                            <div className='flex gap-2 items-baseline justify-baseline'>
                                <input type="number" value={trip.passengers || ''} onChange={(e) => onUpdate({ passengers: Number(e.target.value) })}
                                    placeholder="1" className='w-full border border-gray-200 rounded-md p-3 hover:border-primary cursor-pointer' />
                                <span className="text-sm text-text/60 ">pax</span>
                            </div>
                        </div>
                    </div>

                </div>
            )}


            {/* hotel card */}
            {trip.type === 'hotel' && (
                <div className="grid grid-cols-2 gap-8 mt-2">

                    <div className="flex flex-col gap-1">
                        <span className='text-sm text-text/60'>Hotel Type</span>
                        <SelectOptions
                            selected={trip.HotelType}
                            setSelected={(v) => onUpdate({ HotelType: v })}
                            options={[
                                { value: 'budget', label: 'Budget' },
                                { value: 'standard', label: 'Standard' },
                                { value: 'luxury', label: 'Luxury' },
                            ]}
                        />
                    </div>


                    <div className="flex flex-col gap-1">
                        <span className="text-text/60 text-sm mb-1">Nights</span>
                        <div className='flex gap-2 items-baseline justify-baseline'>
                            <input type="number" value={trip.nights || ''} onChange={(e) => onUpdate({ nights: Number(e.target.value) })}
                                placeholder="1" className='w-full cursor-pointer border border-gray-200 rounded-md p-3 hover:border-primary' />
                            <span className="text-sm text-text/60 ">nights</span>
                        </div>
                    </div>

                </div>
            )}


            {/* rail card */}
            {trip.type === 'rail' && (
                <div className="grid grid-cols-2 gap-8 mt-2">

                    <div>
                        <div className="flex flex-col gap-1">
                            <span className='text-sm text-text/60'>Rail Type</span>
                            <SelectOptions
                                selected={trip.RailType}
                                setSelected={(v) => onUpdate({ RailType: v })}
                                options={[
                                    { value: 'national', label: 'National' },
                                    { value: 'international', label: 'International' },
                                    { value: 'lightRail', label: 'Light rail' },
                                    { value: 'underground', label: 'Underground' },
                                ]}
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-text/60 text-sm mt-2 mb-1">Distance</span>
                            <div className='flex gap-2 items-baseline justify-baseline'>
                                <input type="number" value={trip.distanceKm || ''} onChange={(e) => onUpdate({ distanceKm: Number(e.target.value) })}
                                    placeholder="1" className='w-full border border-gray-200 cursor-pointer rounded-md p-3 hover:border-primary' />
                                <span className="text-sm text-text/60 ">km</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex flex-col gap-1 ml-auto">
                            <span className="text-text/60 text-sm ">Trip type</span>
                            <SelectOptions
                                selected={trip.isReturn ? 'return' : 'oneway'}
                                setSelected={(v) => onUpdate({ isReturn: v === 'return' })}
                                options={[
                                    { value: 'oneway', label: 'One Way' },
                                    { value: 'return', label: 'Return' }
                                ]}
                            />
                        </div>

                    </div>

                </div>
            )}



            {/* bus card */}
            {trip.type === 'bus' && (
                <div className="grid grid-cols-2 gap-8 mt-2">

                    <div>
                        <div className="flex flex-col gap-1">
                            <span className='text-sm text-text/60'>Bus Type</span>
                            <SelectOptions
                                selected={trip.BusType}
                                setSelected={(v) => onUpdate({ BusType: v })}
                                options={[
                                    { value: 'standard', label: 'Standard' },
                                    { value: 'coach', label: 'Coach' },
                                ]}
                            />
                        </div>

                    </div>

                    <div>
                        <div className="flex flex-col gap-1">
                            <span className="text-text/60 text-sm mb-1">Distance</span>
                            <div className='flex gap-2 items-baseline justify-baseline'>
                                <input type="number" value={trip.distanceKm || ' '} onChange={(e) => onUpdate({ distanceKm: Number(e.target.value) })}
                                    placeholder="1" className='w-full cursor-pointer border border-gray-200 rounded-md p-3 hover:border-primary' />
                                <span className="text-sm text-text/60 ">km</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}



            {/* taxi card */}
            {trip.type === 'taxi' && (
                <div className="grid grid-cols-2 gap-8 mt-2">

                    <div className="flex flex-col gap-1">
                        <span className="text-text/60 text-sm mb-1">Distance</span>
                        <div className='flex gap-2 items-baseline justify-baseline'>
                            <input type="number" value={trip.distanceKm || ''} onChange={(e) => onUpdate({ distanceKm: Number(e.target.value) })}
                                placeholder="1" className='w-full cursor-pointer border border-gray-200 rounded-md p-3 hover:border-primary' />
                            <span className="text-sm text-text/60 ">km</span>
                        </div>
                    </div>

                </div>
            )}


        </div>

    )
}