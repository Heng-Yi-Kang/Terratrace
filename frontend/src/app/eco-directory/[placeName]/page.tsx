import { notFound } from "next/navigation"
import { Place } from "../components/PlaceCard"
import PlaceHero from "./components/PlaceHero"
import MorePlaces from "./components/MorePlaces"
import Link from "next/link"

type Props = {
    params: Promise<{ placeName: string }>
}

export default async function PlaceDetails({ params }: Props) {
    const routePlaceName = decodeURIComponent((await params).placeName).split("-")
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
        console.log("ERROR: Place not found!")
        notFound()
    }

    return (
        <main className="min-h-screen bg-background">
            <PlaceHero place={place}/>

            {/* Location Details Section */}
            <section className="py-16 px-4 bg-white/30 backdrop-blur-sm">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-12">
                        <h2 className="font-heading text-4xl font-bold text-text mb-3">
                            Location Details
                        </h2>
                        <p className="text-text/70 text-lg">
                            Find us on the map
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Location Info Card */}
                        <div className="rounded-2xl bg-white/50 backdrop-blur-sm border-2 border-secondary/20 p-8 shadow-md">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/20">
                                            <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-heading font-semibold text-text text-sm uppercase tracking-wide">Coordinates</p>
                                        <p className="text-text/80 text-lg mt-1">{place.lat.toFixed(4)}, {place.long.toFixed(4)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-secondary/20">
                                            <svg className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-heading font-semibold text-text text-sm uppercase tracking-wide">City</p>
                                        <p className="text-text/80 text-lg mt-1">{place.city}</p>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <a 
                                        href={`https://www.google.com/maps?q=${place.lat},${place.long}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block w-full"
                                    >
                                        <button className="w-full px-6 py-3 rounded-xl bg-primary text-white font-heading font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200 transform hover:-translate-y-1 cursor-pointer">
                                            Open in Google Maps
                                        </button>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Map Embed or Info */}
                        <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-secondary/20 p-8 shadow-md flex flex-col justify-center">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-secondary/20 mb-4">
                                    <svg className="h-8 w-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h3 className="font-heading text-xl font-bold text-text mb-2">Sustainable Location</h3>
                                <p className="text-text/70 text-base">
                                    This eco-friendly destination is verified and committed to environmental sustainability practices and conservation efforts.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action Footer */}
            {place.bookingUrl && (
                <section className="relative py-16 px-4 bg-cover bg-center" style={{backgroundImage: `url(${place.imageUrl})`}}>
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-sm"></div>

                    <div className="relative z-10 mx-auto max-w-4xl text-center">
                        <h2 className="font-heading text-3xl lg:text-4xl font-bold text-text mb-4">
                            Ready to Start Sustainable Travel?
                        </h2>
                        <p className="text-text/70 font-semibold text-lg mb-8">
                            Book your stay at {place.name} and be part of the sustainable tourism movement.
                        </p>
                        <Link href={place.bookingUrl} target="_blank" rel="noopener noreferrer">
                            <button className="px-10 py-4 rounded-2xl bg-cta text-text font-heading font-semibold text-lg shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200 transform hover:-translate-y-1 cursor-pointer">
                                Complete Your Booking
                            </button>
                        </Link>
                    </div>
                </section>
            )}

            <MorePlaces category={place.category} city={place.city} currentId={place.publicId}/>
        </main>
    )
}