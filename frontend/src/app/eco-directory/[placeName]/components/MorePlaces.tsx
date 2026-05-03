import { cookies } from "next/headers";
import { Place } from "../../components/PlaceCard";
import PlaceCard from "../../components/PlaceCard";
import { createClient, supabaseConnectionState } from "@/utils/supabase/server"

type Props = {
    category: string,
    city?: string | undefined,
    currentId: string
}

export default async function MorePlaces({ category, city, currentId }: Props) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    if (!supabase) {
        return (
            <main className="min-h-screen px-4 py-10">
                <p className="rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
                    Supabase is not configured. Missing env vars: {supabaseConnectionState.missingEnvVars.join(", ")}
                </p>
            </main>
        )
    }

    const { data: rows, error } = await supabase
        .from('locations')
        .select('*')
        .eq('category', category)
        .eq('city', city)
        .neq('public_id', currentId)

    const places: Place[] = (rows ?? []).map((row) => ({
        id: String(row.id),
        name: row.name ?? "Unnamed",
        category: row.category,
        city: row.city ?? undefined,
        lat: row.lat,
        long: row.long,
        ecoCerts: Array.isArray(row.eco_certs) ? row.eco_certs : [],
        bookingUrl: row.ex_booking_url ?? undefined,
        imageUrl: row.image_url ?? undefined,
        publicId: row.public_id,
    }))

    const randomPlaces = [...places].sort(() => 0.5 - Math.random()).slice(0, 4);

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