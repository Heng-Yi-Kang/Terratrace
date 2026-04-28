import CardImage from "./CardImage"

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
}

export type PlaceCardProps = {
    place: Place
    className?: string
    onOpen?: (placeId: string) => void
}

export default function PlaceCard({
    place,
    className = "",
    onOpen
}: PlaceCardProps) {
    return (
        <div className={`max-w-xs rounded-2xl overflow-hidden shadow-lg ${className}`}>
            <div className="relative h-48 w-full overflow-hidden">
                <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full text-sm font-body font-semibold text-white bg-primary/70 text-center">
                    <span>{place.category}</span>
                </div>
                <CardImage place={place} />
            </div>
            <div className="px-6 py-4">
                <div className="font-heading font-bold text-xl">{place.name}</div>
                <div className="font-heading font-medium text-sm text-secondary">{place.city}</div>
            </div>
            <div className="px-6 pb-2">
                {place.ecoCerts.map((cert, index) => (
                    <span key={`${place.id}-${cert}-${index}`} className="inline-block bg-secondary rounded-full px-3 py-1 text-xs font-semibold text-white mr-2 mb-2">{cert}</span>
                ))}
            </div>
        </div>
    )
}