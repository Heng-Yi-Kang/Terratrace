import EcoDirectoryClient from "./components/EcoDirectoryClient";
import { createClient, supabaseConnectionState } from "@/utils/supabase/server"
import { cookies } from "next/headers";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";

export default async function EcoDirectoryPage() {
    const queryClient = new QueryClient();
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
        "id,name,category,city,lat,long,eco_certs,image_url,ex_booking_url,public_id"
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
                publicId: row.public_id,
            }))

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <EcoDirectoryClient />
        </HydrationBoundary>
    );
}