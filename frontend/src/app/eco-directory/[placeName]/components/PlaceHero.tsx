import { cookies } from "next/headers";
import { Place } from "../../components/PlaceCard";
import { createClient, supabaseConnectionState } from "@/utils/supabase/server"
import Image from "next/image";

type Props = {
    place: Place
}

const CertIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} color={"currentColor"} fill={"none"}>
        <path d="M11.5 22C7.49306 22 5.48959 22 4.2448 20.5355C3 19.0711 3 16.714 3 12C3 7.28596 3 4.92893 4.2448 3.46447C5.48959 2 7.49306 2 11.5 2C15.5069 2 17.5104 2 18.7552 3.46447C19.7572 4.64332 19.9527 6.40054 19.9908 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 8H15M8 13H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19.6092 18.1054C20.4521 17.4918 21 16.4974 21 15.375C21 13.511 19.489 12 17.625 12H17.375C15.511 12 14 13.511 14 15.375C14 16.4974 14.5479 17.4918 15.3908 18.1054M19.6092 18.1054C19.0523 18.5108 18.3666 18.75 17.625 18.75H17.375C16.6334 18.75 15.9477 18.5108 15.3908 18.1054M19.6092 18.1054L20.192 19.9404C20.4143 20.6403 20.5255 20.9903 20.4951 21.2082C20.4318 21.6617 20.0619 21.9984 19.6252 22C19.4154 22.0008 19.101 21.8358 18.4723 21.5059C18.2027 21.3644 18.0679 21.2936 17.93 21.252C17.649 21.1673 17.351 21.1673 17.07 21.252C16.9321 21.2936 16.7973 21.3644 16.5277 21.5059C15.899 21.8358 15.5846 22.0008 15.3748 22C14.9381 21.9984 14.5682 21.6617 14.5049 21.2082C14.4745 20.9903 14.5857 20.6403 14.808 19.9404L15.3908 18.1054" stroke="currentColor" strokeWidth="1.5" />
    </svg>
)

export default async function PlaceHero({ place }: Props) {
    return (
        <section className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden">
            <div className="pointer-events-none absolute top-20 left-10 z-0 h-64 w-64 rounded-full bg-secondary/20 blur-3xl"></div>
            <div className="pointer-events-none absolute bottom-20 right-10 z-0 h-96 w-96 rounded-full bg-secondary/10 blur-3xl"></div>

            <div className="relative z-10 mx-auto w-full max-w-6xl">
                <div className="grid sm:grid-cols-1 lg:grid-cols-2 w-full items-center gap-8">
                    <div className="relative mx-auto w-full max-w-[30rem] aspect-square overflow-hidden rounded-3xl shadow-lg">
                        <Image src={place.imageUrl} alt={place.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 30rem" />
                    </div>

                    <div className="text-left space-y-6">
                        <div>
                            <span className="inline-block py-2 px-4 rounded-full text-cta font-heading font-semibold border-2 border-cta bg-white/50 backdrop-blur-sm">
                                {place.category}
                            </span>
                        </div>
                        <div>
                            <h1 className="font-heading text-5xl lg:text-6xl font-bold text-text leading-tight">
                                {place.name}
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <p className="text-lg text-text/80 font-semibold">{place.city ?? "Unknown city"}</p>
                        </div>
                        <div>
                            {place.ecoCerts.map((cert, index) => (
                                <div key={`${place.id}-${cert}-${index}`} className="inline-flex items-center gap-2 bg-secondary rounded-full px-4 py-2 text-xs font-semibold text-white mr-2 mb-1">
                                    {CertIcon}
                                    {cert}
                                </div>
                            ))}
                        </div>

                        {/* CTA Booking Button
                        {place.bookingUrl ? (
                            <Link href={place.bookingUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-6">
                                <button className="px-8 py-4 rounded-2xl bg-cta text-text font-heading font-semibold text-lg shadow-md hover:shadow-lg hover:opacity-90 transition-all duration-200 transform hover:-translate-y-1 cursor-pointer">
                                    Book Now
                                </button>
                            </Link>
                        ) : (
                            <button disabled className="inline-block mt-6 px-8 py-4 rounded-2xl bg-gray-300 text-gray-500 font-heading font-semibold text-lg cursor-not-allowed opacity-60">
                                No Booking Available
                            </button>
                        )} */}
                    </div>
                </div>
            </div>
        </section>
    )
}