import EcoDirectoryClient from "./components/EcoDirectoryClient";
import type { Place } from "./components/PlaceCard"
import { createClient, supabaseConnectionState } from "@/utils/supabase/server"
import { cookies } from "next/headers";

// const mockPlaces: Place[] = [{
//     id: "1",
//     name: "Green Leaf Bistro",
//     category: "Dining",
//     city: "Singapore",
//     lat: 1.29027,
//     long: 103.851959,
//     ecoCerts: ["Green Key", "Plastic-Free"],
//     bookingUrl: "https://example.com/green-leaf",
//     imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80",
// }, {
//     id: "2",
//     name: "Eco Stay Harbor",
//     category: "Accomodation",
//     city: "Bali",
//     lat: -8.409518,
//     long: 115.188919,
//     ecoCerts: ["EarthCheck"],
//     bookingUrl: "https://example.com/eco-stay",
//     imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
// }, {
//     id: "3",
//     name: "Cycle City Tours",
//     category: "Transport",
//     city: "Amsterdam",
//     lat: 52.3676,
//     long: 4.9041,
//     ecoCerts: ["B Corp"],
//     bookingUrl: "https://example.com/cycle-city",
//     imageUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=80",
// },]

export default async function EcoDirectoryPage() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    if (!supabase) {
        return (
            <main className="min-h-screen px-4 py-10">
                <p className="rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
                    Supabase is not configured. Missing env vars:{" "}
                    {supabaseConnectionState.missingEnvVars.join(", ")}
                </p>
            </main>
        )
    }

    const { data, error } = await supabase.from("locations").select(
        "id,name,category,city,lat,long,eco_certs,image_url,ex_booking_url"
    )

    if (error) {
        return (
            <main className="min-h-screen px-4 py-10">
                <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
                    Failed to load eco destinations: {error.message}
                </p>
            </main>
        )
    }

    const places: Place[] = (data ?? []).map((row) => ({
                id: String(row.id),
                name: row.name ?? "Unnamed",
                category: row.category,
                city: row.city ?? undefined,
                lat: row.lat,
                long: row.long,
                ecoCerts: Array.isArray(row.eco_certs) ? row.eco_certs : [],
                bookingUrl: row.ex_booking_url ?? undefined,
                imageUrl: row.image_url ?? undefined,
            }))

        return (
            <EcoDirectoryClient places={places} />
        )
    }