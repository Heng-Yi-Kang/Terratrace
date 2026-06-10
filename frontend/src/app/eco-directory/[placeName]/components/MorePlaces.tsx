import { Place } from "../../components/PlaceCard";
import PlaceCard from "../../components/PlaceCard";

type Props = {
    category: string,
    city?: string | undefined,
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

    return (
        <section className="py-20 px-4 bg-white/50 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="font-heading font-bold text-3xl md:text-4xl text-text mb-4">
                        More {category} in {city}
                    </h2>
                    <p className="text-text/70 max-w-2xl mx-auto">
                        Explore more sustainable {category} options in the city
                    </p>
                </div>
                <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-4">
                    {randomPlaces.map((place) => (
                        <PlaceCard key={place.id} place={place} className="hover:scale-110 hover:shadow-lg transition-all duration-300" />
                    ))}
                </div>
            </div>
        </section>
    )
}