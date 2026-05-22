import CardImage from "./CardImage"
import Link from "next/link"

export type Place = {
    id: string
    name: string
    category: "Transport" | "Dining" | "Accommodation"
    city?: string
    lat: number
    long: number
    ecoCerts: string[]
    bookingUrl?: string
    imageUrl?: string
    publicId: string
}

export type PlaceCardProps = {
    place: Place
    className?: string
}

function slugify(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
}

export default function PlaceCard({
    place,
    className = ""
}: PlaceCardProps) {
    return (
        <div className={`bg-white/80 backdrop-blur-md rounded-organic overflow-hidden shadow-organic hover:shadow-organic-lg transition-all duration-200 group flex flex-col h-full ${className}`}>
            <div className="relative h-40 w-full overflow-hidden bg-emerald-500/5">
                <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full text-xs font-sans font-semibold text-white bg-black/40 backdrop-blur-sm">
                    <span>{place.category}</span>
                </div>
                <CardImage place={place} />
            </div>
            
            <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="font-sans font-semibold text-lg text-text group-hover:text-primary transition-colors duration-200 line-clamp-1" title={place.name}>
                        {place.name}
                    </h3>
                    <p className="font-sans text-sm text-text/60 mt-1">{place.city || "Eco Destination"}</p>
                    
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {place.ecoCerts.slice(0, 3).map((cert, index) => (
                            <span 
                                key={`${place.id}-${cert}-${index}`} 
                                className="px-2 py-1 rounded-full text-[10px] font-sans font-medium bg-secondary/10 text-secondary border border-secondary/20"
                            >
                                {cert}
                            </span>
                        ))}
                        {place.ecoCerts.length > 3 && (
                            <span className="px-2 py-1 rounded-full text-[10px] font-sans font-medium bg-text/5 text-text/60 border border-text/10">
                                +{place.ecoCerts.length - 3} more
                            </span>
                        )}
                    </div>
                </div>

                <div className="mt-5">
                    <Link 
                        href={`/dashboard/overview/places/${encodeURIComponent(`${slugify(place.name)}-${place.publicId}`)}`}
                        className="w-full text-center block rounded-xl bg-cta text-text py-2 shadow-sm font-sans font-semibold hover:bg-cta/80 transition-all duration-200"
                    >
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    )
}
