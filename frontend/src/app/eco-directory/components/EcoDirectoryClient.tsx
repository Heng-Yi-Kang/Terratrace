"use client"
import { useMemo, useRef, useState } from "react"
import SearchBar from "./SearchBar"
import PlaceCard, { type Place } from "./PlaceCard"
import CountCard from "./CountCard"
import { SVGProps } from "react"
import { start } from "repl"

type Props = { places: Place[] }

const HotelIcon = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" color={"currentColor"} fill={"none"}>
            <path d="M13 16.7033C13 15.7854 13 15.3265 13.2034 14.9292C13.4067 14.5319 13.7859 14.2501 14.5442 13.6866L15.0442 13.315C16.2239 12.4383 16.8138 12 17.5 12C18.1862 12 18.7761 12.4383 19.9558 13.315L20.4558 13.6866C21.2141 14.2501 21.5933 14.5319 21.7966 14.9292C22 15.3265 22 15.7854 22 16.7033V18.1782C22 19.9798 22 20.8806 21.4142 21.4403C20.8284 22 19.8856 22 18 22H13V16.7033Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M18 12.0002V5C18 2.518 17.482 2 15 2H11C8.518 2 8 2.518 8 5V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <ellipse cx="3.5" cy="14" rx="1.5" ry="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M3.5 16V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M2 22H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M12 6H14M12 9H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M17.5 22L17.5 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

const DiningIcon = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" color={"currentColor"} fill={"none"}>
            <path d="M4 21.001L7.00071 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M15 10.001L14 11.001" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M17.9999 3.00098L14.9999 6.00098C14.4547 6.54623 14.1821 6.81885 14.0363 7.11295C13.759 7.6725 13.759 8.32945 14.0363 8.88901C14.1821 9.1831 14.4547 9.45573 14.9999 10.001C15.5452 10.5462 15.8178 10.8189 16.1119 10.9646C16.6715 11.2419 17.3284 11.2419 17.888 10.9646C18.1821 10.8189 18.4547 10.5462 18.9999 10.001L21.9999 7.00098" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M20 5L17 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M20 21L12 13M12 13L2 3C2 6.84174 3.52612 10.5261 6.24264 13.2426L9 16L12 13Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
        </svg>
    )
}

const TransportIcon = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" color={"currentColor"} fill={"none"}>
            <path d="M6.00391 10V5M11.0039 10V5M16.0039 10V5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5.01609 17C3.59614 17 2.88616 17 2.44503 16.5607C2.00391 16.1213 2.00391 15.4142 2.00391 14V8C2.00391 6.58579 2.00391 5.87868 2.44503 5.43934C2.88616 5 3.59614 5 5.01609 5H12.1005C15.5742 5 17.311 5 18.6402 5.70624C19.619 6.22633 20.4346 7.0055 20.9971 7.95786C21.7609 9.25111 21.8332 10.9794 21.9779 14.436C22.0168 15.3678 22.0363 15.8337 21.8542 16.1862C21.7204 16.4454 21.5135 16.6601 21.2591 16.8041C20.913 17 20.4449 17 19.5085 17H19.0039M9.00391 17H15.0039" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7.00391 19C8.10848 19 9.00391 18.1046 9.00391 17C9.00391 15.8954 8.10848 15 7.00391 15C5.89934 15 5.00391 15.8954 5.00391 17C5.00391 18.1046 5.89934 19 7.00391 19Z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M17.0039 19C18.1085 19 19.0039 18.1046 19.0039 17C19.0039 15.8954 18.1085 15 17.0039 15C15.8993 15 15.0039 15.8954 15.0039 17C15.0039 18.1046 15.8993 19 17.0039 19Z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M1.99609 10.0009H15.3641C15.9911 10.0009 16.2041 10.3681 16.6841 10.9441C17.2361 11.4841 17.6093 11.8628 18.1241 11.9401C18.8441 12.0481 21.5081 11.9941 21.5081 11.9941" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    )
}

export default function EcoDirectoryClient({ places }: Props) {
    const [query, setQuery] = useState('')
    const [page, setPage] = useState(0)
    const catalogRef = useRef<HTMLDivElement>(null)
    const itemsPerPage = 8

    const accommodationCount = places.filter((place) =>
        place.category === "Accommodation"
    ).length

    const diningCount = places.filter((place) =>
        place.category === "Dining"
    ).length

    const transportCount = places.filter((place) =>
        place.category === "Transport"
    ).length

    const filteredPlaces = useMemo(() => {
        const search = query.trim().toLowerCase()
        if (!search) return places

        return places.filter((place) => {
            const searchable = [
                place.name,
                place.city ?? "",
                place.category,
                ...place.ecoCerts,
            ]
            return searchable.some((v) => v.toLowerCase().includes(search))
        })
    }, [places, query])

    const paginatedPlaces = useMemo(() => {
        const startingPlace = page * itemsPerPage
        return filteredPlaces.slice(startingPlace, startingPlace + itemsPerPage)
    }, [filteredPlaces, page])

    const totalPages = Math.ceil(filteredPlaces.length / itemsPerPage)

    const scrollToCatalog = () => {
        catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    const handlePageChange = (nextPage: number) => {
        setPage(nextPage)
        setTimeout(scrollToCatalog, 0)
    }

    const handleSearch = (searchQuery: string) => {
        setQuery(searchQuery)
        setPage(0)
        setTimeout(() => {
            scrollToCatalog()
        }, 0)
    }

    return (
        <main className="min-h-screen">
            <section className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
                <div className="pointer-events-none absolute top-20 left-10 z-0 h-64 w-64 rounded-full bg-secondary/20 blur-3xl"></div>
                <div className="pointer-events-none absolute bottom-20 right-10 z-0 h-96 w-96 rounded-full bg-cyan-secondary/20 blur-3xl"></div>

                <div className="relative z-10 mx-auto w-full max-w-4xl">
                    <h1 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-center text-text">Let&apos;s find our</h1>
                    <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-center text-primary mt-2 mb-10">Next Destination.</h1>
                    <SearchBar value={query} onChange={setQuery} onSubmit={handleSearch} />

                    <div className="grid gap-3 grid-cols-3 mt-10 w-11/12 mx-auto">
                        <CountCard Icon={HotelIcon} count={accommodationCount} name="Accommodations" />
                        <CountCard Icon={DiningIcon} count={diningCount} name="Dining" />
                        <CountCard Icon={TransportIcon} count={transportCount} name="Transport" />
                    </div>

                </div>
            </section>

            <section className="py-20 px-4 bg-white/50" ref={catalogRef}>
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="font-heading font-bold text-3xl md:text-4xl text-text mb-4">
                            All Eco Destinations
                        </h2>
                        <p className="text-text/70 max-w-2xl mx-auto">
                            Tourism contributes 8% of global carbon emissions. Every choice we make impacts our planet.
                        </p>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {paginatedPlaces.map((place) => (
                            <PlaceCard key={place.id} place={place} />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-8">
                            <button
                                onClick={() => handlePageChange(Math.max(0, page - 1))}
                                disabled={page === 0}
                                className="flex items-center gap-2 px-4 py-2 border-2 border-secondary rounded-full font-heading font-semibold transition-all duration-300 hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg disabled:opacity-50 disabled:border-gray-300 disabled:cursor-not-allowed disabled:pointer-events-none disabled:hover:bg-transparent disabled:hover:text-current disabled:hover:shadow-none disabled:hover:scale-100"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} color={"currentColor"} fill={"none"}>
                                    <path d="M10 12L20 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                    <path d="M5.41418 13.6026L6.38061 14.3639C7.94641 15.5974 8.72931 16.2141 9.36467 15.9328C10 15.6515 10 14.6881 10 12.7613V11.2387C10 9.31191 10 8.34853 9.36467 8.06721C8.72931 7.7859 7.94641 8.40264 6.38062 9.63612L5.41418 10.3974C4.47141 11.1401 4.00003 11.5115 4.00003 12C4.00003 12.4885 4.47141 12.8599 5.41418 13.6026Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                </svg>
                                Previous
                            </button>
                            <span className="px-4 py-2">Page {page + 1} of {totalPages}</span>
                            <button
                                onClick={() => handlePageChange(Math.min(totalPages - 1, page + 1))}
                                disabled={page === totalPages - 1}
                                className="flex items-center gap-2 px-4 py-2 border-2 border-secondary rounded-full font-heading font-semibold transition-all duration-300 hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg disabled:opacity-50 disabled:border-gray-300 disabled:cursor-not-allowed disabled:pointer-events-none disabled:hover:bg-transparent disabled:hover:text-current disabled:hover:shadow-none disabled:hover:scale-100"
                            >
                                Next
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} color={"currentColor"} fill={"none"}>
                                    <path d="M14 12L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                    <path d="M18.5859 13.6026L17.6194 14.3639C16.0536 15.5974 15.2707 16.2141 14.6354 15.9328C14 15.6515 14 14.6881 14 12.7613L14 11.2387C14 9.31191 14 8.34853 14.6354 8.06721C15.2707 7.7859 16.0536 8.40264 17.6194 9.63612L18.5858 10.3974C19.5286 11.1401 20 11.5115 20 12C20 12.4885 19.5286 12.8599 18.5859 13.6026Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </main>
    )
}