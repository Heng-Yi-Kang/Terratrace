import { notFound } from "next/navigation"
import { Place } from "@/app/dashboard/overview/places/components/PlaceCard"
import PlaceHero from "@/app/dashboard/overview/places/[placeName]/components/PlaceHero"
import MorePlaces from "@/app/dashboard/overview/places/[placeName]/components/MorePlaces"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

type Props = {
    params: Promise<{ placeName: string }>
}

export default async function PlaceDetails({ params }: Props) {
    const routePlaceName = decodeURIComponent((await params).placeName).split("~")
    const placeId = routePlaceName.at(-1)

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
    let place: Place | null = null

    try {
        const res = await fetch(`${baseUrl}/api/locations/${placeId}`, { cache: 'no-store' })
        if (res.ok) {
            place = await res.json()
        }
    } catch (err) {
        console.error("Error fetching place from backend:", err)
    }

    if (!place) {
        notFound()
    }

    return (
        <main className="space-y-6">
            {/* Back Link */}
            <div className="flex items-center">
                <Link 
                    href="/dashboard/overview/places" 
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-sans font-semibold text-primary hover:text-primary/80 hover:bg-primary/5 transition-all duration-200 cursor-pointer"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Places
                </Link>
            </div>

            {/* Redesigned Hero / Main Card */}
            <PlaceHero place={place} />

            {/* Location Details Grid Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Coordinates & Location Card */}
                <div className="bg-white/80 backdrop-blur-md rounded-organic border border-cyan-700/5 p-6 shadow-organic flex flex-col justify-between">
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-sans font-semibold text-lg text-text">Location Details</h3>
                            <p className="text-text/60 text-sm mt-1">Geographic coordinates & city information</p>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-sans font-semibold text-text text-xs uppercase tracking-wide">Coordinates</p>
                                    <p className="text-text/80 font-medium text-sm mt-0.5">{place.lat.toFixed(4)}, {place.long.toFixed(4)}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-sans font-semibold text-text text-xs uppercase tracking-wide">City</p>
                                    <p className="text-text/80 font-medium text-sm mt-0.5">{place.city || "Eco Destination"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="pt-6">
                        <a 
                            href={`https://www.google.com/maps?q=${place.lat},${place.long}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                        >
                            <button className="w-full px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-sans font-semibold shadow-sm hover:shadow transition-all duration-200 cursor-pointer">
                                Open in Google Maps
                            </button>
                        </a>
                    </div>
                </div>

                {/* Sustainability Card */}
                <div className="bg-white/80 backdrop-blur-md rounded-organic border border-cyan-700/5 p-6 shadow-organic flex flex-col justify-center text-center">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-secondary/10 text-secondary mx-auto mb-4">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h3 className="font-sans text-lg font-bold text-text mb-2">Sustainable Destination</h3>
                    <p className="text-text/70 font-sans text-sm max-w-sm mx-auto leading-relaxed">
                        This verified location adheres to environmental preservation practices, carbon footprint reduction policies, and sustainability guidelines.
                    </p>
                </div>
            </div>

            {/* Booking Footer inside Dashboard style */}
            {place.bookingUrl && (
                <div className="bg-white/80 backdrop-blur-md rounded-organic border border-cyan-700/5 p-8 shadow-organic text-center space-y-4">
                    <h2 className="font-sans text-xl md:text-2xl font-bold text-text">
                        Ready to Start Sustainable Travel?
                    </h2>
                    <p className="text-text/70 font-sans text-sm max-w-md mx-auto">
                        Complete your booking at {place.name} to support sustainable tourism and reduce travel emissions.
                    </p>
                    <div>
                        <a href={place.bookingUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                            <button className="px-8 py-3 rounded-xl bg-cta hover:bg-cta/90 text-text font-sans font-bold shadow-sm hover:shadow transition-all duration-200 cursor-pointer">
                                Complete Your Booking
                            </button>
                        </a>
                    </div>
                </div>
            )}

            {/* More Recommended Places */}
            <MorePlaces category={place.category} city={place.city} currentId={place.publicId} />
        </main>
    )
}
