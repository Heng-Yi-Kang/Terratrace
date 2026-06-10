"use client"

import { useMemo, useState } from "react"
import { useLocations } from "@/hooks/useLocations"
import StatCard from "@/components/dashboard/StatCard"
import PlaceCard from "./PlaceCard"
import { Home, Utensils, Bike, Search, X, ChevronLeft, ChevronRight } from "lucide-react"

type CategoryFilter = 'all' | 'Accommodation' | 'Dining' | 'Transport'

export default function PlacesClient() {
    const { data: places = [], isLoading, error } = useLocations()
    const [query, setQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
    const [page, setPage] = useState(0)
    const itemsPerPage = 8

    // Count statistics
    const accommodationCount = useMemo(() => 
        places.filter(p => p.category === "Accommodation").length, 
    [places])

    const diningCount = useMemo(() => 
        places.filter(p => p.category === "Dining").length, 
    [places])

    const transportCount = useMemo(() => 
        places.filter(p => p.category === "Transport").length, 
    [places])

    // Filter places based on search query and category tab
    const filteredPlaces = useMemo(() => {
        let results = places

        // 1. Category Filter
        if (categoryFilter !== 'all') {
            results = results.filter(p => p.category === categoryFilter)
        }

        // 2. Search Query
        const search = query.trim().toLowerCase()
        if (search) {
            results = results.filter(place => {
                const searchable = [
                    place.name,
                    place.city ?? "",
                    place.category,
                    ...(place.ecoCerts ?? [])
                ]
                return searchable.some(v => v.toLowerCase().includes(search))
            })
        }

        return results
    }, [places, categoryFilter, query])

    // Paginate filtered results
    const paginatedPlaces = useMemo(() => {
        const startingPlace = page * itemsPerPage
        return filteredPlaces.slice(startingPlace, startingPlace + itemsPerPage)
    }, [filteredPlaces, page])

    const totalPages = Math.ceil(filteredPlaces.length / itemsPerPage)

    const handleCategoryChange = (cat: CategoryFilter) => {
        setCategoryFilter(cat)
        setPage(0)
    }

    const handleSearchChange = (val: string) => {
        setQuery(val)
        setPage(0)
    }

    const handlePageChange = (nextPage: number) => {
        setPage(nextPage)
        // Scroll to container top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[30rem] space-y-4">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-text font-sans font-medium">Loading eco destinations...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-50/80 backdrop-blur-md rounded-organic p-6 border border-red-200 mt-4 text-center">
                <p className="text-red-950 font-sans font-semibold">
                    Failed to load eco destinations: {error.message}
                </p>
            </div>
        )
    }

    const categories: { id: CategoryFilter; label: string; count: number }[] = [
        { id: 'all', label: 'All Places', count: places.length },
        { id: 'Accommodation', label: 'Accommodation', count: accommodationCount },
        { id: 'Dining', label: 'Dining', count: diningCount },
        { id: 'Transport', label: 'Transport', count: transportCount },
    ]

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="font-sans font-bold text-3xl text-text">Browse Places</h1>
                <p className="font-sans text-text/60 mt-2">Explore and search for verified eco-friendly destinations.</p>
            </div>

            {/* KPI Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Accommodations" 
                    value={accommodationCount} 
                    color="primary"
                    icon={<Home className="w-6 h-6" />}
                />
                <StatCard 
                    title="Dining Options" 
                    value={diningCount} 
                    color="cyan"
                    icon={<Utensils className="w-6 h-6" />}
                />
                <StatCard 
                    title="Transport Services" 
                    value={transportCount} 
                    color="secondary"
                    icon={<Bike className="w-6 h-6" />}
                />
            </div>

            {/* Search and Filters Layout (Stacked for SaaS consistency) */}
            <div className="space-y-4 bg-white/40 backdrop-blur-md rounded-organic p-5 border border-cyan-700/5 shadow-sm">
                {/* Search Bar Input */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text/40" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search by name, city, certification..."
                        className="w-full pl-12 pr-12 py-3 rounded-xl border border-cyan-700/10 bg-white/90 text-text placeholder-text/40 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all font-sans"
                    />
                    {query && (
                        <button
                            onClick={() => handleSearchChange('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-black/5 rounded-full text-text/40 hover:text-text cursor-pointer transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Category Selection Tabs */}
                <div className="flex flex-wrap gap-2 pt-1">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryChange(cat.id)}
                            className={`px-4 py-2 rounded-xl font-sans text-xs font-semibold transition-all duration-200 cursor-pointer ${
                                categoryFilter === cat.id
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'bg-white/80 text-text/60 hover:text-text border border-cyan-700/5 hover:border-cyan-700/10 shadow-sm'
                            }`}
                        >
                            {cat.label} ({cat.count})
                        </button>
                    ))}
                </div>
            </div>

            {/* Places Grid */}
            {paginatedPlaces.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {paginatedPlaces.map((place) => (
                        <PlaceCard key={place.id} place={place} />
                    ))}
                </div>
            ) : (
                <div className="bg-white/60 backdrop-blur-md rounded-organic p-12 text-center border border-cyan-700/5 shadow-organic">
                    <Search className="w-12 h-12 mx-auto text-text/20 mb-3" />
                    <h3 className="font-sans font-semibold text-lg text-text">No places match your search</h3>
                    <p className="font-sans text-text/60 mt-1">Try tweaking your query or switching categories.</p>
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-4">
                    <button
                        onClick={() => handlePageChange(Math.max(0, page - 1))}
                        disabled={page === 0}
                        className="flex items-center gap-1 px-4 py-2 bg-white/80 hover:bg-white border border-cyan-700/5 rounded-xl font-sans text-sm font-semibold text-text shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                    </button>
                    <span className="font-sans text-sm font-semibold text-text/70">
                        Page {page + 1} of {totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(Math.min(totalPages - 1, page + 1))}
                        disabled={page === totalPages - 1}
                        className="flex items-center gap-1 px-4 py-2 bg-white/80 hover:bg-white border border-cyan-700/5 rounded-xl font-sans text-sm font-semibold text-text shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    )
}
