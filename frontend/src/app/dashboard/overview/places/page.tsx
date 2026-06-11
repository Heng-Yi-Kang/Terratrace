import PlacesClient from "./components/PlacesClient";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { buildLocationsUrl, filtersFromSearchParams, normalizeLocationFilters } from "@/utils/locationFilters";

type Props = {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function DashboardPlacesPage({ searchParams }: Props) {
    const queryClient = new QueryClient();
    const filters = filtersFromSearchParams(await searchParams)
    const normalizedFilters = normalizeLocationFilters(filters)

    try {
        await queryClient.prefetchQuery({
            queryKey: ['locations', normalizedFilters],
            queryFn: async () => {
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
                const response = await fetch(buildLocationsUrl(baseUrl, normalizedFilters), { cache: 'no-store' })
                if (!response.ok) {
                    throw new Error('Failed to prefetch destinations')
                }
                return response.json()
            }
        });
    } catch (e) {
        console.error("Failed to prefetch locations on server:", e);
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <PlacesClient initialFilters={filters} />
        </HydrationBoundary>
    );
}
