import { Place } from "../../components/PlaceCard"
import { MapPin } from "lucide-react"
import Image from "next/image"

type Props = {
    place: Place
}

const CertIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"currentColor"} fill={"none"}>
        <path d="M11.5 22C7.49306 22 5.48959 22 4.2448 20.5355C3 19.0711 3 16.714 3 12C3 7.28596 3 4.92893 4.2448 3.46447C5.48959 2 7.49306 2 11.5 2C15.5069 2 17.5104 2 18.7552 3.46447C19.7572 4.64332 19.9527 6.40054 19.9908 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 8H15M8 13H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19.6092 18.1054C20.4521 17.4918 21 16.4974 21 15.375C21 13.511 19.489 12 17.625 12H17.375C15.511 12 14 13.511 14 15.375C14 16.4974 14.5479 17.4918 15.3908 18.1054M19.6092 18.1054C19.0523 18.5108 18.3666 18.75 17.625 18.75H17.375C16.6334 18.75 15.9477 18.5108 15.3908 18.1054M19.6092 18.1054L20.192 19.9404C20.4143 20.6403 20.5255 20.9903 20.4951 21.2082C20.4318 21.6617 20.0619 21.9984 19.6252 22C19.4154 22.0008 19.101 21.8358 18.4723 21.5059C18.2027 21.3644 18.0679 21.2936 17.93 21.252C17.649 21.1673 17.351 21.1673 17.07 21.252C16.9321 21.2936 16.7973 21.3644 16.5277 21.5059C15.899 21.8358 15.5846 22.0008 15.3748 22C14.9381 21.9984 14.5682 21.6617 14.5049 21.2082C14.4745 20.9903 14.5857 20.6403 14.808 19.9404L15.3908 18.1054" stroke="currentColor" strokeWidth="1.5" />
    </svg>
)

export default function PlaceHero({ place }: Props) {
    return (
        <div className="bg-white/80 backdrop-blur-md rounded-organic shadow-organic border border-cyan-700/5 p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Left Column - Image Card */}
                <div className="relative w-full aspect-video md:aspect-[4/3] overflow-hidden rounded-2xl shadow-sm border border-cyan-700/5">
                    <Image
                        src={place.imageUrl || "/placeholder-destination.jpg"}
                        alt={place.name}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        unoptimized
                    />
                </div>

                {/* Right Column - Details */}
                <div className="space-y-6">
                    <div>
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-sans font-semibold bg-primary/10 text-primary border border-primary/20">
                            {place.category}
                        </span>
                    </div>

                    <div className="space-y-2">
                        <h1 className="font-sans text-3xl lg:text-4xl font-bold text-text leading-tight">
                            {place.name}
                        </h1>
                        <div className="flex items-center gap-2 text-text/70">
                            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="font-sans font-semibold text-sm">{place.city || "Eco Destination"}</span>
                        </div>
                    </div>

                    {/* Certifications Block */}
                    <div className="space-y-3">
                        <h3 className="font-sans font-semibold text-xs text-text/60 uppercase tracking-wider">
                            Verified Eco Certifications
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {place.ecoCerts && place.ecoCerts.length > 0 ? (
                                place.ecoCerts.map((cert, index) => (
                                    <div
                                        key={`${place.id}-${cert}-${index}`}
                                        className="inline-flex items-center gap-1.5 bg-secondary/10 text-secondary border border-secondary/20 px-3 py-1.5 rounded-full text-xs font-sans font-semibold"
                                    >
                                        {CertIcon}
                                        {cert}
                                    </div>
                                ))
                            ) : (
                                <span className="text-sm font-sans text-text/55">No certifications listed</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
