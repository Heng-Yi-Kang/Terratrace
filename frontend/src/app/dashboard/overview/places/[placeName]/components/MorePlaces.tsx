import { Place } from "../../components/PlaceCard"
import PlaceCard from "../../components/PlaceCard"

type Props = {
    category: string
    city?: string
    currentId: string
}

export default async function MorePlaces({ category, city, currentId }: Props) {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
    let randomPlaces: Place[] = []

    try {
        const params: Record<string, string> = {
            category,
            excludeId: currentId
        }
        if (city) {
            params.city = city
        }
        const queryParams = new URLSearchParams(params)
        const res = await fetch(`${baseUrl}/api/locations/recommendations?${queryParams}`, { cache: 'no-store' })
        if (res.ok) {
            randomPlaces = await res.json()
        }
    } catch (err) {
        console.error("Error fetching recommended places from backend:", err)
    }

    if (randomPlaces.length === 0) return null

    return (
        <div className="space-y-6 pt-6 border-t border-cyan-700/5">
            <div>
                <h2 className="font-sans font-bold text-2xl text-text">
                    More {category} in {city || "the area"}
                </h2>
                <p className="text-text/60 font-sans text-sm mt-1">
                    Explore more sustainable {category.toLowerCase()} options nearby
                </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {randomPlaces.map((place) => (
                    <PlaceCard key={place.id} place={place} />
                ))}
            </div>
        </div>
    )
}
