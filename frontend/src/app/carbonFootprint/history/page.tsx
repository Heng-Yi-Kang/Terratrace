'use client'

import { useState, useEffect } from 'react'
import { getCurrentUser } from '@/utils/supabase/auth'
import { fetchHistory, deleteEntry, type CarbonEntry } from '@/utils/carbon'
import Link from 'next/link'
import * as icons from '../component/icons'
import { StatsCard } from '@/components/dashboard/CarbonTab'
import { TrashIcon } from 'lucide-react'

const getBadge = (total: number) => {
    if (total > 500) return { text: 'High', color: 'bg-red-400' }
    if (total > 150) return { text: 'Medium', color: 'bg-yellow-400' }
    return { text: 'Low', color: 'bg-green-400' }
}

const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })


export default function HistoryPage() {
    const [records, setRecords] = useState<CarbonEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const load = async () => {
            try {
                const { data: { user } } = await getCurrentUser()
                if (!user) {
                    setError('Please log in to view your history.');
                    return
                }
                const data = await fetchHistory()
                setRecords(data)
            } catch {
                console.log('History error:', error)
                setError('Failed to load history. Please try again.')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const handleDelete = async (id: string) => {
        await deleteEntry(id)
        setRecords((prev) => prev.filter((r) => r.id !== id))
    }

    const totalLogged = records.reduce((sum, r) => sum + r.total_emissions, 0)
    const biggest = records.length ? Math.max(...records.map((r) => r.total_emissions)) : 0

    if (loading) return <div>Loading...</div>
    if (error) return <div className="text-red-500">{error}</div>

    return (

        <div className="max-w-4xl mx-auto px-4 py-10">
            <Link href="/dashboard/carbon" className="mb-4">
                <icons.BackIcon />
            </Link>

            <div className="mb-8">
                <h2 className="text-3xl font-bold text-text mt-2">Calculation History</h2>
                <p className="text-text/60 mt-2">Review and manage your past carbon footprint calculations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white/80 backdrop-blur-md rounded-organic p-6 shadow-organic">
                    <p className="font-sans text-sm font-medium text-text/60">Total Emissions Logged</p>
                    <p className="font-sans font-bold text-4xl text-text mt-2 ">{totalLogged.toFixed(1)}<span className="text-lg font-normal text-text/60"> kg CO2</span></p>
                </div>
                <div className="bg-white/80 backdrop-blur-md rounded-organic p-6 shadow-organic">
                    <p className="font-sans text-sm font-medium text-text/60">Total Calculation</p>
                    <p className="font-sans font-bold text-4xl text-text mt-2">{records.length}</p>
                </div>
                <div className="bg-white/80 backdrop-blur-md rounded-organic p-6 shadow-organic">
                    <p className="font-sans text-sm font-medium text-text/60">Biggest Trip</p>
                    <p className="font-sans font-bold text-4xl text-text mt-2">{biggest.toFixed(1)}<span className="text-lg font-normal text-text/60"> kg CO2</span></p>
                </div>
            </div>


            {records.length === 0 && (
                <div className="text-center py-20 text-text/50">
                    <p className="text-lg font-medium text-text mb-2">No calculation records found.</p>
                    <p className="text-sm mb-6">Start by calculating a trip to see your history here.</p>
                    <Link href="/dashboard/carbon" className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary/80 transition-colors">
                        Go to Carbon Footprint Calculator
                    </Link>
                </div>
            )}



            <div className="space-y-4">
                <div className="mt-2 mb-2">
                    <p className="text-text/60">History</p>
                </div>

                {records.map((record) => {
                    const badge = getBadge(record.total_emissions)
                    return (
                        <div key={record.id} className="bg-white rounded-organic p-5 border border-gray-100 shadow-lg relative group">

                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="text-sm text-text/60 ">{formatDate(record.created_at)}</p>
                                    <p className=" text-2xl font-bold text-text mt-1">{record.total_emissions.toFixed(2)}{''}
                                        <span className="text-base font-normal text-text/60"> kg CO2</span>
                                    </p>
                                </div >

                                <div className="flex items-center gap-2">
                                    <span className={`text-xs px-3 py-1 rounded-organic text-text font-medium ${badge.color}`}>
                                        {badge.text}
                                    </span>
                                    <button onClick={() => handleDelete(record.id)}
                                        className=" top-4 right-4  transition-opacity duration-200 text-gray-400 hover:text-red-500 cursor-pointer"
                                        title="Delete">
                                        <TrashIcon />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 text-sm text-text/60">

                                {record.flight_emissions > 0 && (
                                    <span className="bg-gray-50 px-3 py-1 rounded-organic flex items-center gap-1">
                                        <icons.PlaneIcon /> {record.flight_emissions.toFixed(1)} kg CO2
                                    </span>
                                )}

                                {record.car_emissions > 0 && (
                                    <span className="bg-gray-50 px-3 py-1 rounded-organic flex items-center gap-1 ">
                                        <icons.CarIcon /> {record.car_emissions.toFixed(1)} kg CO2
                                    </span>
                                )}

                                {record.hotel_emissions > 0 && (
                                    <span className="bg-gray-50 px-3 py-1 rounded-organic flex items-center gap-1">
                                        <icons.HotelIcon /> {record.hotel_emissions.toFixed(1)} kg CO2
                                    </span>
                                )}

                                {record.rail_emissions > 0 && (
                                    <span className="bg-gray-50 px-3 py-1 rounded-organic flex items-center gap-1">
                                        <icons.TrainIcon /> {record.rail_emissions.toFixed(1)} kg CO2
                                    </span>
                                )}

                                {record.bus_emissions > 0 && (
                                    <span className="bg-gray-50 px-3 py-1 rounded-organic flex items-center gap-1">
                                        <icons.BusIcon /> {record.bus_emissions.toFixed(1)} kg CO2
                                    </span>
                                )}

                                {record.taxi_emissions > 0 && (
                                    <span className="bg-gray-50 px-3 py-1 rounded-organic flex items-center gap-1">
                                        <icons.TaxiIcon /> {record.taxi_emissions.toFixed(1)} kg CO2
                                    </span>
                                )}
                            </div>



                        </div>
                    )
                })
                }
            </div>


        </div>
    )
}
